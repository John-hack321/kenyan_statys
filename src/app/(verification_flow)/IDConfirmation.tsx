// src/app/(verification_flow)/IDConfirmation.tsx   (NEW FILE)
//
// The ID check page. It shows ONE state at a time:
//   verified      -> done
//   needs_review  -> a person is looking at it
//   waiting       -> the host finished the Didit screens, we wait for the webhook to write the result
//   slow          -> still nothing after 90 seconds (we stop polling; the result will still arrive)
//   failed        -> not approved: try again
//   intro         -> the starting screen with the Start button
// The truth always comes from host_identity (written by the webhook). The SDK's own result only decides
// which message to show, never whether someone is verified.

import { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import { Href, useRouter } from "expo-router";
import { ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppText from "@/components/AppText";
import StatusPanel from "@/components/verification/StatusPanel";
import VerificationScreen from "@/components/verification/VerificationScreen";
import { PrimaryButton, SecondaryButton } from "@/components/verification/VerificationButtons";
import { startHostVerification } from "@/lib/kyc/startHostVerification";
import { useHostIdentity } from "@/lib/kyc/useHostIdentity";
import { COLORS } from "@/styles/colors";
import { rm, rs, rv } from "@/styles/responsive";

type Phase = "idle" | "busy" | "waiting" | "slow";

const POLL_EVERY_MS = 3000;
const POLL_MAX_TRIES = 30; // 30 x 3 s = 90 s

const NEEDS: { icon: keyof typeof Ionicons.glyphMap; text: string }[] = [
    { icon: "id-card-outline", text: "Your National ID, passport or resident ID" },
    { icon: "sunny-outline", text: "Good light, so the photos are clear" },
    { icon: "happy-outline", text: "A quick selfie, to match your face to your ID" },
    { icon: "time-outline", text: "About 2 minutes" },
];

export default function IDConfirmation() {
    const router = useRouter();
    const { status, loading, refresh } = useHostIdentity();
    const [phase, setPhase] = useState<Phase>("idle");
    const [message, setMessage] = useState<string | null>(null);
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const stopPolling = () => {
        if (pollRef.current) clearInterval(pollRef.current);
        pollRef.current = null;
    };
    useEffect(() => stopPolling, []); // stop when the page closes

    // After the host finishes the Didit screens, ask the database every 3 s until the webhook has written a result.
    const startPolling = () => {
        stopPolling();
        let tries = 0;
        pollRef.current = setInterval(async () => {
            tries += 1;
            const next = await refresh();
            if (next && next !== "pending") {
                stopPolling();
                setPhase("idle"); // verified / failed / needs_review: the matching panel takes over
            } else if (tries >= POLL_MAX_TRIES) {
                stopPolling();
                setPhase("slow");
            }
        }, POLL_EVERY_MS);
    };

    const onStart = async () => {
        if (phase === "busy") return;
        setMessage(null);
        setPhase("busy");
        const result = await startHostVerification();
        switch (result.kind) {
            case "submitted":
                await refresh();
                setPhase("waiting");
                startPolling();
                break;
            case "cancelled":
                setPhase("idle");
                setMessage("You closed the verification before it was finished. Start again whenever you're ready.");
                break;
            case "already":
                await refresh();
                setPhase("idle");
                break;
            case "too_soon":
                setPhase("idle");
                setMessage("Please wait a few seconds, then try again.");
                break;
            case "email_not_confirmed":
                setPhase("idle");
                setMessage("Confirm your email first, then come back to verify your ID.");
                break;
            default:
                setPhase("idle");
                setMessage(result.message);
        }
    };

    const backToSetup = () => router.replace("/host-setup" as Href);

    // ---------- which panel? ----------
    if (loading) {
        return (
            <VerificationScreen title="Confirm your ID">
                <View className="items-center" style={{ paddingTop: rv(60) }}>
                    <ActivityIndicator size="large" color={COLORS.green} />
                </View>
            </VerificationScreen>
        );
    }

    if (status === "verified") {
        return (
            <VerificationScreen title="Confirm your ID" footer={<PrimaryButton label="Back to setup" onPress={backToSetup} />}>
                <StatusPanel icon="checkmark-circle" tone="success" title="Your ID is confirmed" note="You only have to do this once. Your listings can go live as soon as your other steps are done." />
            </VerificationScreen>
        );
    }

    if (status === "needs_review") {
        return (
            <VerificationScreen title="Confirm your ID" footer={<PrimaryButton label="Back to setup" onPress={backToSetup} />}>
                <StatusPanel icon="hourglass-outline" tone="warning" title="We're reviewing your ID" note="A person on our team needs to look at it. You don't have to do anything. Your status updates here when we're done." />
            </VerificationScreen>
        );
    }

    if (phase === "waiting") {
        return (
            <VerificationScreen title="Confirm your ID">
                <StatusPanel busy icon="time-outline" tone="neutral" title="Checking your ID" note="This usually takes a few seconds. Please keep this screen open." />
            </VerificationScreen>
        );
    }

    if (phase === "slow") {
        return (
            <VerificationScreen
                title="Confirm your ID"
                footer={
                    <>
                        <PrimaryButton label="Check again" onPress={() => { setPhase("waiting"); startPolling(); }} />
                        <SecondaryButton label="Back to setup" onPress={backToSetup} />
                    </>
                }
            >
                <StatusPanel icon="time-outline" tone="neutral" title="This is taking longer than usual" note="Your ID was sent. You can leave this screen. Your status updates on the setup page when the check finishes." />
            </VerificationScreen>
        );
    }

    // intro (also used after a failed attempt)
    const failed = status === "failed";
    return (
        <VerificationScreen
            title="Confirm your ID"
            footer={
                <>
                    <PrimaryButton label={failed ? "Try again" : "Start verification"} onPress={onStart} loading={phase === "busy"} />
                    <SecondaryButton label="I'll do this later" onPress={backToSetup} disabled={phase === "busy"} />
                </>
            }
        >
            {failed ? (
                <View className="flex-row rounded-2xl" style={{ backgroundColor: COLORS.dangerSoft, padding: rs(14), gap: rs(10) }}>
                    <Ionicons name="alert-circle-outline" size={rm(20)} color={COLORS.danger} />
                    <AppText variant="small" style={{ flex: 1, color: COLORS.danger }}>
                        We couldn't verify your ID. Make sure the whole card is visible and the photo is clear, then try again.
                    </AppText>
                </View>
            ) : null}

            <View>
                <AppText variant="title">Let's confirm it's really you</AppText>
                <AppText variant="small" className="text-gray-500" style={{ marginTop: rv(4) }}>
                    Hosts look after guests' money and homes, so we check every host once. Your later listings don't need another check.
                </AppText>
            </View>

            <View className="rounded-2xl border border-gray-200 bg-white" style={{ padding: rs(14), gap: rv(12) }}>
                <AppText variant="small" weight="semibold">What you'll need</AppText>
                {NEEDS.map((n) => (
                    <View key={n.text} className="flex-row items-center" style={{ gap: rs(10) }}>
                        <Ionicons name={n.icon} size={rm(18)} color={COLORS.green} />
                        <AppText variant="small" style={{ flex: 1 }}>{n.text}</AppText>
                    </View>
                ))}
            </View>

            <View className="flex-row rounded-2xl" style={{ backgroundColor: COLORS.greenSoft, padding: rs(14), gap: rs(10) }}>
                <Ionicons name="lock-closed-outline" size={rm(18)} color={COLORS.green} />
                <AppText variant="small" className="text-gray-700" style={{ flex: 1 }}>
                    Guests never see your ID. The check is done by our verification partner, Didit.
                </AppText>
            </View>

            {message ? (
                <AppText variant="small" style={{ color: COLORS.warning }}>{message}</AppText>
            ) : null}
        </VerificationScreen>
    );
}