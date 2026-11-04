// src/app/(verification_flow)/contactConfirmation.tsx   (NEW FILE)
//
// Opened from the host-setup checklist as  /contactConfirmation?kind=phone  or  ?kind=email.
// It confirms the contact the account does NOT have yet:
//   Google / email account -> kind=phone     phone account (later) -> kind=email
// Step 1: check the number/email (prefilled from what the host typed in the wizard) and send a code.
// Step 2: type the 6 digit code. On success we go back, and host-setup re-reads the account.
// While the SMS provider / email template is not set up (AUTH_METHODS flags) the page says "coming soon".

import { useEffect, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AppText from "@/components/AppText";
import OtpCodeInput from "@/components/OtpCodeInput";
import PhoneField from "@/components/PhoneField";
import TextField from "@/components/TextField";
import VerificationScreen from "@/components/verification/VerificationScreen";
import { PrimaryButton } from "@/components/verification/VerificationButtons";
import { DEFAULT_COUNTRY_CODE } from "@/constants/africaCountries";
import { COUNTRIES } from "@/constants/countryCodes";
import { AUTH_METHODS } from "@/constants/featureFlags";
import { cleanPhoneDigits, dialCodeOf, toE164 } from "@/constants/schemas/venture";
import { useAuthContext } from "@/lib/hooks/auth-context";
import {
    sendEmailConfirmation,
    sendPhoneConfirmation,
    verifyEmailConfirmation,
    verifyPhoneConfirmation,
} from "@/lib/kyc/contactConfirm";
import { CODE_LENGTH, friendlyAuthError } from "@/lib/otpAuth";
import { supabase } from "@/lib/supabase";
import { COLORS } from "@/styles/colors";
import { rm, rs, rv } from "@/styles/responsive";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const RESEND_SECONDS = 30;

// "+254712345678" -> { country: "KE", digits: "712345678" } (longest matching dial code wins)
const splitE164 = (full: string) => {
    const clean = full.replace(/\s/g, "");
    const match = [...COUNTRIES].sort((a, b) => b.dialCode.length - a.dialCode.length).find((c) => clean.startsWith(c.dialCode));
    return match
        ? { country: match.code, digits: clean.slice(match.dialCode.length) }
        : { country: DEFAULT_COUNTRY_CODE, digits: clean.replace(/\D/g, "") };
};

export default function ContactConfirmation() {
    const router = useRouter();
    const { kind } = useLocalSearchParams<{ kind?: string }>();
    const isPhone = kind !== "email";
    const { session } = useAuthContext();
    const userId = session?.user.id; // the id, not the session object: the session object changes on every token refresh

    const [step, setStep] = useState<"enter" | "code">("enter");
    const [phoneCountry, setPhoneCountry] = useState(DEFAULT_COUNTRY_CODE);
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState(session?.user.email ?? "");
    const [code, setCode] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [cooldown, setCooldown] = useState(0);

    const ready = isPhone ? AUTH_METHODS.phone : AUTH_METHODS.email;
    const phoneE164 = toE164(phoneCountry, phone);
    const inputValid = isPhone ? /^\d{7,12}$/.test(phone) : EMAIL_RE.test(email.trim());

    // Prefill with what the host typed in the wizard (saved privately in host_private after publishing).
    useEffect(() => {
        if (!userId) return;
        let cancelled = false;
        supabase
            .from("host_private")
            .select("contact_phone, contact_email")
            .eq("user_id", userId)
            .maybeSingle()
            .then(({ data }) => {
                if (cancelled || !data) return;
                if (data.contact_phone) {
                    const p = splitE164(data.contact_phone);
                    setPhoneCountry(p.country);
                    setPhone(p.digits);
                }
                if (data.contact_email) setEmail(data.contact_email);
            });
        return () => { cancelled = true; };
    }, [userId]);

    useEffect(() => {
        if (cooldown <= 0) return;
        const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
        return () => clearTimeout(t);
    }, [cooldown]);

    const send = async () => {
        if (!ready || !inputValid || busy) return;
        setError(null);
        setBusy(true);
        try {
            if (isPhone) await sendPhoneConfirmation(phoneE164);
            else await sendEmailConfirmation(email);
            setCode("");
            setStep("code");
            setCooldown(RESEND_SECONDS);
        } catch (e) {
            setError(friendlyAuthError(e));
        } finally {
            setBusy(false);
        }
    };

    const verify = async (token: string) => {
        if (busy) return;
        setError(null);
        setBusy(true);
        try {
            if (isPhone) await verifyPhoneConfirmation(phoneE164, token);
            else await verifyEmailConfirmation(email, token);
            router.back(); // host-setup re-reads the account when it comes back into view
        } catch (e) {
            setError(friendlyAuthError(e));
            setCode("");
        } finally {
            setBusy(false);
        }
    };

    const onCodeChange = (value: string) => {
        setCode(value);
        setError(null);
        if (value.length === CODE_LENGTH) verify(value);
    };

    const title = isPhone ? "Confirm your phone" : "Confirm your email";
    const where = isPhone ? `by SMS to ${dialCodeOf(phoneCountry)} ${phone}` : `to ${email.trim()}`;

    return (
        <VerificationScreen
            title={title}
            onBack={step === "code" ? () => { setStep("enter"); setError(null); } : undefined}
        >
            {step === "enter" ? (
                <>
                    <View>
                        <AppText variant="title">{isPhone ? "Confirm your phone number" : "Confirm your email"}</AppText>
                        <AppText variant="small" className="text-gray-500" style={{ marginTop: rv(4) }}>
                            {isPhone
                                ? "We'll text you a code. We use your number for booking updates and to keep your account safe."
                                : "We'll email you a code. We use it for booking updates and to keep your account safe."}
                        </AppText>
                    </View>

                    {isPhone ? (
                        <PhoneField
                            label="Phone number"
                            countryCode={phoneCountry}
                            onCountryChange={setPhoneCountry}
                            value={phone}
                            onChangeText={(t) => { setPhone(cleanPhoneDigits(t)); setError(null); }}
                            error={error ?? undefined}
                            onSubmitEditing={send}
                        />
                    ) : (
                        <TextField
                            label="Email"
                            value={email}
                            onChangeText={(t) => { setEmail(t); setError(null); }}
                            placeholder="you@example.com"
                            maxLength={120}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            autoComplete="email"
                            error={error ?? undefined}
                            returnKeyType="done"
                            onSubmitEditing={send}
                        />
                    )}

                    {!ready ? (
                        <View className="flex-row items-center rounded-xl" style={{ backgroundColor: COLORS.warningSoft, padding: rs(12), gap: rs(8) }}>
                            <Ionicons name="information-circle-outline" size={rm(18)} color={COLORS.warning} />
                            <AppText variant="small" style={{ flex: 1, color: COLORS.warning }}>
                                {isPhone
                                    ? "Phone confirmation is coming soon. We're setting up text messages."
                                    : "Email confirmation is coming soon."}
                            </AppText>
                        </View>
                    ) : null}

                    <PrimaryButton label="Send code" onPress={send} disabled={!ready || !inputValid} loading={busy} />
                </>
            ) : (
                <>
                    <AppText variant="body">Enter the code we sent {where}:</AppText>

                    <OtpCodeInput value={code} onChange={onCodeChange} length={CODE_LENGTH} hasError={!!error} autoFocus />

                    {error ? (
                        <View className="flex-row items-center" style={{ gap: rs(5) }}>
                            <Ionicons name="alert-circle" size={rm(14)} color={COLORS.danger} />
                            <AppText variant="caption" style={{ color: COLORS.danger, flex: 1 }}>{error}</AppText>
                        </View>
                    ) : null}

                    <View className="flex-row items-center flex-wrap" style={{ gap: rs(6) }}>
                        <AppText variant="small" className="text-gray-500">Haven't received it?</AppText>
                        {cooldown > 0 ? (
                            <AppText variant="small" className="text-gray-500">Send again in {cooldown}s</AppText>
                        ) : (
                            <TouchableOpacity onPress={send} disabled={busy} accessibilityRole="button">
                                <AppText variant="small" weight="semibold" className="underline">Send again</AppText>
                            </TouchableOpacity>
                        )}
                    </View>

                    <PrimaryButton label="Confirm" onPress={() => verify(code)} disabled={code.length < CODE_LENGTH} loading={busy} />
                </>
            )}
        </VerificationScreen>
    );
}