// src/app/host-setup.tsx   (REPLACES the existing file: compare with yours before overwriting, mine is based on an older copy)
//
// The host's verification checklist. Reached right after publishing and from the "Finish setting up" card.
// Every row shows what the ACCOUNT has verified (read from Supabase, never from a flag the app can set).
// A row that is not done is tappable and opens its confirmation page in (verification_flow):
//   email not confirmed -> /contactConfirmation?kind=email      (phone sign-up accounts, later)
//   phone not confirmed -> /contactConfirmation?kind=phone      (Google / email accounts)
//   ID not confirmed    -> /IDConfirmation                      (unlocked once the contacts are confirmed)
// That is how "show the phone if they signed up with email, the email if they signed up with phone" works:
// whichever contact the account is missing is the one that is not ticked and can be tapped.

import { useCallback, useState } from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { Href, useFocusEffect, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import type { User } from "@supabase/supabase-js";
import { Ionicons } from "@expo/vector-icons";
import AppText from "@/components/AppText";
import { AUTH_METHODS } from "@/constants/featureFlags";
import { useAuthContext } from "@/lib/hooks/auth-context";
import { Requirement, getHostRequirements } from "@/lib/hostRequirements";
import { useHostIdentity } from "@/lib/kyc/useHostIdentity";
import { supabase } from "@/lib/supabase";
import { COLORS } from "@/styles/colors";
import { rm, rs, rv } from "@/styles/responsive";

type Row = Requirement & { route?: string; locked?: boolean };

export default function HostSetupPage() {
    const router = useRouter();
    const { session, isLoading } = useAuthContext();
    const { status: identityStatus, refresh: refreshIdentity } = useHostIdentity();
    const [freshUser, setFreshUser] = useState<User | null>(null);
    const [contact, setContact] = useState<{ phone: string | null; email: string | null } | null>(null);

    const userId = session?.user.id;

    // Every time this page comes into view (for example back from a confirmation page) read the account again.
    // session.user can be out of date right after a confirmation, getUser() asks the server.
    useFocusEffect(
        useCallback(() => {
            if (!userId) return;
            let cancelled = false;
            supabase.auth.getUser().then(({ data }) => { if (!cancelled && data.user) setFreshUser(data.user); });
            refreshIdentity();
            // the draft is emptied after publishing, so the phone and email to verify come from the host's private row
            supabase
                .from("host_private")
                .select("contact_phone, contact_email")
                .eq("user_id", userId)
                .maybeSingle()
                .then(({ data }) => { if (!cancelled) setContact({ phone: data?.contact_phone ?? null, email: data?.contact_email ?? null }); });
            return () => { cancelled = true; };
        }, [userId, refreshIdentity])
    );

    if (isLoading) return null;

    const user = freshUser ?? session?.user ?? null;
    const base = getHostRequirements(user, { contactEmail: contact?.email ?? undefined }, identityStatus === "verified")
        .filter((r) => r.key !== "publish");

    const emailDone = base.find((r) => r.key === "email")?.done ?? false;
    const phoneDone = base.find((r) => r.key === "phone")?.done ?? false;
    // The ID check costs money, so it opens only after the contacts are confirmed.
    // While phone confirmation does not exist yet (AUTH_METHODS.phone is false) a confirmed email is enough to test it.
    const contactsReady = emailDone && (phoneDone || !AUTH_METHODS.phone);

    const rows: Row[] = base.map((r) => {
        if (r.key === "email" && !r.done) return { ...r, route: "/contactConfirmation?kind=email" };
        if (r.key === "phone" && !r.done) {
            return { ...r, detail: contact?.phone ? `We'll text a code to ${contact.phone}.` : r.detail, route: "/contactConfirmation?kind=phone" };
        }
        if (r.key === "identity" && !r.done) {
            if (!contactsReady) return { ...r, detail: "Confirm your contact details first.", locked: true };
            const detail =
                identityStatus === "needs_review" ? "We're reviewing your ID. Tap to see the status."
                : identityStatus === "failed" ? "We couldn't verify your ID. Tap to try again."
                : "A quick check, done once.";
            return { ...r, detail, route: "/IDConfirmation" };
        }
        return r;
    });

    const doneCount = rows.filter((r) => r.done).length;

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: rs(20), paddingBottom: rv(32), gap: rv(14) }}>
                <View>
                    <AppText variant="heading">Finish setting up</AppText>
                    <AppText variant="small" className="text-gray-500" style={{ marginTop: rv(4) }}>
                        {doneCount} of {rows.length} steps done. Your listing goes live as soon as the rest are finished.
                    </AppText>
                </View>

                {rows.map((r) => {
                    const tappable = !!r.route && !r.locked;
                    return (
                        <TouchableOpacity
                            key={r.key}
                            disabled={!tappable}
                            onPress={() => router.push(r.route as Href)}
                            activeOpacity={0.8}
                            accessibilityRole={tappable ? "button" : undefined}
                            className="flex-row items-center rounded-2xl border border-gray-200 bg-white"
                            style={{ padding: rs(14), gap: rs(12), opacity: r.locked ? 0.55 : 1 }}
                        >
                            <Ionicons
                                name={r.done ? "checkmark-circle" : r.locked ? "lock-closed-outline" : "ellipse-outline"}
                                size={rm(26)}
                                color={r.done ? COLORS.green : COLORS.faint}
                            />
                            <View style={{ flex: 1 }}>
                                <AppText variant="body" weight="semibold">{r.title}</AppText>
                                <AppText variant="small" className="text-gray-500">{r.detail}</AppText>
                            </View>
                            {tappable ? <Ionicons name="chevron-forward" size={rm(20)} color={COLORS.green} /> : null}
                        </TouchableOpacity>
                    );
                })}

                <View
                    className="flex-row items-center rounded-2xl border border-gray-200 bg-white"
                    style={{ padding: rs(14), gap: rs(12), opacity: 0.55 }}
                >
                    <Ionicons name="lock-closed-outline" size={rm(26)} color={COLORS.faint} />
                    <View style={{ flex: 1 }}>
                        <AppText variant="body" weight="semibold">Go live</AppText>
                        <AppText variant="small" className="text-gray-500">Happens automatically once the steps above are done.</AppText>
                    </View>
                </View>

                <TouchableOpacity
                    onPress={() => router.replace("/profile" as Href)}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    className="items-center justify-center rounded-xl border border-gray-300"
                    style={{ height: rm(48), marginTop: rv(6) }}
                >
                    <AppText variant="large" weight="semibold">I'll do this later</AppText>
                </TouchableOpacity>
                <AppText variant="caption" className="text-gray-500 text-center">
                    You can come back any time from the "Finish setting up" card on your Profile.
                </AppText>
            </ScrollView>
        </SafeAreaView>
    );
}