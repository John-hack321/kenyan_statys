// src/app/contactConfirmation.tsx   (MOVED from src/app/(verification_flow)/ and REWRITTEN. Claude, 2026-11-10, NOT RUN on a device)
//
// Opened from the host-setup checklist as  /contactConfirmation?kind=phone  or  ?kind=email  (the URL did not change
// when the file moved: folder names in brackets are not part of the URL).
//
// It is a SHORT BOTTOM SHEET over the checklist, like Airbnb's "Add phone number": the page behind stays visible but
// dimmed (status bar too), the sheet is only as tall as its content, and it sits right above the keyboard.
//   Step 1  "enter"  check the number / email (prefilled from what the host typed in the wizard) and send a code.
//   Step 2  "code"   type the 6 digit code. A right code closes the sheet; host-setup re-reads the account when it comes back.
//
// Why this file lives at the top of src/app and not in (verification_flow): a sheet has to be a route of the ROOT stack
// to float over host-setup (see the Stack.Screen in src/app/_layout.tsx). The ID check page stays full screen in its group.
//
// What it calls: sendContactCode / verifyContactCode in src/lib/kyc/contactConfirm.ts -> Edge Functions send-otp / verify-otp.

import { useEffect, useRef, useState } from "react";
import { BackHandler, Keyboard, ScrollView, TextInput, TouchableOpacity, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AppText from "@/components/AppText";
import ModalSheet, { useModalSheet } from "@/components/ModalSheet";
import OtpCodeInput from "@/components/OtpCodeInput";
import PhoneField from "@/components/PhoneField";
import TextField from "@/components/TextField";
import { PrimaryButton } from "@/components/verification/VerificationButtons";
import { DEFAULT_COUNTRY_CODE } from "@/constants/africaCountries";
import { COUNTRIES } from "@/constants/countryCodes";
import { cleanPhoneDigits, dialCodeOf, toE164 } from "@/constants/schemas/venture";
import { useAuthContext } from "@/lib/hooks/auth-context";
import { haptics } from "@/lib/haptics";
import { ContactChannel, ContactConfirmError, friendlyContactError, sendContactCode, verifyContactCode } from "@/lib/kyc/contactConfirm";
import { CODE_LENGTH } from "@/lib/otpAuth";
import { supabase } from "@/lib/supabase";
import { COLORS } from "@/styles/colors";
import { rm, rs } from "@/styles/responsive";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const FOCUS_DELAY_MS = 350; // wait for the sheet to finish sliding up before the keyboard opens

// "+254712345678" -> { country: "KE", digits: "712345678" } (longest matching dial code wins)
const splitE164 = (full: string) => {
    const clean = full.replace(/\s/g, "");
    const match = [...COUNTRIES].sort((a, b) => b.dialCode.length - a.dialCode.length).find((c) => clean.startsWith(c.dialCode));
    return match
        ? { country: match.code, digits: clean.slice(match.dialCode.length) }
        : { country: DEFAULT_COUNTRY_CODE, digits: clean.replace(/\D/g, "") };
};

export default function ContactConfirmationRoute() {
    return (
        <ModalSheet variant="compact">
            <ContactSheet />
        </ModalSheet>
    );
}

function ContactSheet() {
    const { close } = useModalSheet();
    const { kind } = useLocalSearchParams<{ kind?: string }>();
    const channel: ContactChannel = kind === "email" ? "email" : "phone";
    const isPhone = channel === "phone";
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

    const phoneRef = useRef<TextInput>(null);
    const emailRef = useRef<TextInput>(null);
    const edited = useRef(false); // once the host types, a late prefill must not overwrite it

    const target = isPhone ? toE164(phoneCountry, phone) : email.trim().toLowerCase();
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
                if (cancelled || !data || edited.current) return;
                if (data.contact_phone) {
                    const p = splitE164(data.contact_phone);
                    setPhoneCountry(p.country);
                    setPhone(p.digits);
                }
                if (data.contact_email) setEmail(data.contact_email);
            });
        return () => { cancelled = true; };
    }, [userId]);

    // open the keyboard on the field, like Airbnb (after the slide-up, so the sheet does not jump)
    useEffect(() => {
        if (step !== "enter") return;
        const t = setTimeout(() => (isPhone ? phoneRef : emailRef).current?.focus(), FOCUS_DELAY_MS);
        return () => clearTimeout(t);
    }, [step, isPhone]);

    useEffect(() => {
        if (cooldown <= 0) return;
        const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
        return () => clearTimeout(t);
    }, [cooldown]);

    // Android back button / gesture on step 2 goes back to step 1 (on step 1 the sheet itself slides down).
    // BackHandler calls the LAST registered listener first, so this runs before the navigator's own.
    useEffect(() => {
        if (step !== "code") return;
        const sub = BackHandler.addEventListener("hardwareBackPress", () => {
            setStep("enter");
            setError(null);
            return true;
        });
        return () => sub.remove();
    }, [step]);

    const send = async () => {
        if (!inputValid || busy) return;
        setError(null);
        setBusy(true);
        try {
            const result = await sendContactCode(channel, target);
            if (result.alreadyConfirmed) {
                haptics.success();
                close(); // nothing to confirm: the account already has it
                return;
            }
            setCode("");
            setStep("code");
            setCooldown(result.resendAfter);
        } catch (e) {
            if (e instanceof ContactConfirmError && e.code === "too_soon") setCooldown(e.retryAfter ?? 30);
            setError(friendlyContactError(e, channel));
        } finally {
            setBusy(false);
        }
    };

    const verify = async (token: string) => {
        if (busy) return;
        setError(null);
        setBusy(true);
        try {
            await verifyContactCode(channel, target, token);
            haptics.success();
            close(); // host-setup re-reads the account when it comes back into view
        } catch (e) {
            haptics.error();
            setError(friendlyContactError(e, channel));
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

    const onHeaderIcon = () => {
        if (step === "code") {
            setStep("enter");
            setError(null);
        } else {
            Keyboard.dismiss();
            close();
        }
    };

    // ---------- header (icon + title, a hairline under it, like Airbnb's sheet) ----------
    const title = step === "code" ? "Enter your code" : isPhone ? "Confirm phone number" : "Confirm your email";
    const header = (
        <View className="flex-row items-center border-b border-gray-200" style={{ minHeight: rm(56), paddingHorizontal: rs(8), gap: rs(4) }}>
            <TouchableOpacity
                onPress={onHeaderIcon}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={step === "code" ? "Back" : "Close"}
                style={{ minWidth: rm(48), minHeight: rm(48), alignItems: "center", justifyContent: "center" }}
            >
                <Ionicons name={step === "code" ? "arrow-back" : "close"} size={rm(24)} color={COLORS.ink} />
            </TouchableOpacity>
            <AppText variant="large" weight="semibold" numberOfLines={1} style={{ flex: 1 }} accessibilityRole="header">
                {title}
            </AppText>
        </View>
    );

    // ---------- step 1: check the contact ----------
    const enterStep = (
        <>
            <AppText variant="body">
                {isPhone
                    ? "We use your number for booking updates and to keep your account safe."
                    : "We use your email for booking updates and to keep your account safe."}
            </AppText>

            {isPhone ? (
                <PhoneField
                    label="Phone number"
                    inputRef={phoneRef}
                    countryCode={phoneCountry}
                    onCountryChange={(c) => { edited.current = true; setPhoneCountry(c); }}
                    value={phone}
                    onChangeText={(t) => { edited.current = true; setPhone(cleanPhoneDigits(t)); setError(null); }}
                    error={error ?? undefined}
                    helper="We'll text you a code to confirm it. Standard message and data rates apply."
                    onSubmitEditing={send}
                />
            ) : (
                <TextField
                    label="Email"
                    inputRef={emailRef}
                    value={email}
                    onChangeText={(t) => { edited.current = true; setEmail(t); setError(null); }}
                    placeholder="you@example.com"
                    maxLength={120}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="email"
                    error={error ?? undefined}
                    helper="We'll email you a code to confirm it."
                    returnKeyType="done"
                    onSubmitEditing={send}
                />
            )}
        </>
    );

    // ---------- step 2: type the code ----------
    const where = isPhone ? `${dialCodeOf(phoneCountry)} ${phone}` : email.trim();
    const codeStep = (
        <>
            <AppText variant="body">
                Enter the {CODE_LENGTH}-digit code we just sent to {where}:
            </AppText>

            <OtpCodeInput variant="joined" value={code} onChange={onCodeChange} length={CODE_LENGTH} hasError={!!error} autoFocus />

            {error ? (
                <View className="flex-row items-center" style={{ gap: rs(5) }}>
                    <Ionicons name="alert-circle" size={rm(14)} color={COLORS.danger} />
                    <AppText variant="caption" style={{ color: COLORS.danger, flex: 1 }}>{error}</AppText>
                </View>
            ) : null}

            <View className="flex-row items-center flex-wrap" style={{ gap: rs(6) }}>
                <AppText variant="small" className="text-gray-500">{isPhone ? "Didn't get a text?" : "Didn't get an email?"}</AppText>
                {cooldown > 0 ? (
                    <AppText variant="small" className="text-gray-500">Try again in {cooldown}s</AppText>
                ) : (
                    <TouchableOpacity onPress={send} disabled={busy} hitSlop={12} accessibilityRole="button" accessibilityState={{ disabled: busy }}>
                        <AppText variant="small" weight="semibold" className="underline text-black">Try again</AppText>
                    </TouchableOpacity>
                )}
            </View>
        </>
    );

    return (
        <View style={{ flexShrink: 1 }}>
            {header}

            <ScrollView
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                style={{ flexGrow: 0 }}
                contentContainerStyle={{ paddingHorizontal: rs(20), paddingTop: rs(20), paddingBottom: rs(16), gap: rs(16) }}
            >
                {step === "enter" ? enterStep : codeStep}
            </ScrollView>

            <View className="border-t border-gray-200 bg-white" style={{ paddingHorizontal: rs(20), paddingVertical: rs(12) }}>
                {step === "enter" ? (
                    <PrimaryButton label="Send code" onPress={send} disabled={!inputValid} loading={busy} />
                ) : (
                    <PrimaryButton label="Continue" onPress={() => verify(code)} disabled={code.length < CODE_LENGTH} loading={busy} />
                )}
            </View>
        </View>
    );
}
