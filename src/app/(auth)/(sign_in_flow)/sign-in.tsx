import { ReactNode, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Keyboard, ScrollView, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppText from "@/components/AppText";
import PhoneField from "@/components/PhoneField";
import TextField from "@/components/TextField";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import AuthOptionRow from "@/components/AuthOptionRow";
import OtpCodeInput from "@/components/OtpCodeInput";
import { useModalSheet } from "@/components/ModalSheet";
import { useVentureDraftStore } from "@/app_state/ventureFlowStore";
import { DEFAULT_COUNTRY_CODE } from "@/constants/africaCountries";
import { AUTH_METHODS } from "@/constants/featureFlags";
import { cleanPhoneDigits, dialCodeOf, toE164 } from "@/constants/schemas/venture";
import {
    CODE_LENGTH,
    friendlyAuthError,
    sendEmailCode,
    sendPhoneCode,
    verifyEmailCode,
    verifyPhoneCode,
} from "@/lib/otpAuth";
import { COLORS } from "@/styles/colors";
import { rm, rs, rv } from "@/styles/responsive";

type Mode = "phone" | "email";
type Step = "start" | "code";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const GOOGLE_MAIL_RE = /@(gmail|googlemail)\.com$/i;
const RESEND_SECONDS = 30;

const NOT_READY: Record<"phone" | "email" | "apple", string> = {
    phone: "Phone sign-in is coming soon. Please continue with Google for now.",
    email: "Email sign-in is coming soon. Please continue with Google for now.",
    apple: "Sign in with Apple is coming soon. Please continue with Google for now.",
};

const Divider = () => (
    <View className="flex-row items-center" style={{ gap: rs(10) }}>
        <View className="flex-1 bg-gray-200" style={{ height: 1 }} />
        <AppText variant="small" className="text-gray-500">or</AppText>
        <View className="flex-1 bg-gray-200" style={{ height: 1 }} />
    </View>
);

const Banner = ({ text }: { text: string }) => (
    <View className="flex-row items-center rounded-xl" style={{ backgroundColor: COLORS.warningSoft, padding: rs(12), gap: rs(8) }}>
        <Ionicons name="information-circle-outline" size={rm(18)} color={COLORS.warning} />
        <AppText variant="small" style={{ flex: 1, color: COLORS.warning }}>{text}</AppText>
    </View>
);

const PrimaryButton = ({ label, disabled, loading, onPress }: { label: string; disabled?: boolean; loading?: boolean; onPress: () => void }) => (
    <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityState={{ disabled: !!disabled, busy: !!loading }}
        style={{
            height: rm(52),
            borderRadius: rm(12),
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: disabled ? "#E5E7EB" : COLORS.green,
        }}
    >
        {loading ? (
            <ActivityIndicator size="small" color={COLORS.white} />
        ) : (
            <AppText variant="large" weight="bold" style={{ color: disabled ? COLORS.faint : COLORS.white }}>{label}</AppText>
        )}
    </TouchableOpacity>
);

// "Log in or sign up" sheet. Google works today. Email and phone use a one-time code and switch on with
// AUTH_METHODS in constants/featureFlags.ts. Apple is shown as "Soon".
//
// Coming from the host flow? The email and phone the host typed there are used as suggestions:
//   - the fields are pre-filled
//   - a Gmail address puts "Continue with Google" at the top and tells Google to pre-select that account
export default function SignIn() {
    const { close } = useModalSheet();

    // read once: what the host typed in the venture flow (empty for a normal guest)
    const initial = useRef(useVentureDraftStore.getState().draft).current;
    const draftEmail = (initial.contactEmail ?? "").trim();
    const suggestGoogle = EMAIL_RE.test(draftEmail) && GOOGLE_MAIL_RE.test(draftEmail);

    const [step, setStep] = useState<Step>("start");
    // email first when we know one (an email code costs nothing, an SMS does), otherwise phone like Airbnb
    const [mode, setMode] = useState<Mode>(draftEmail ? "email" : "phone");
    const [phoneCountry, setPhoneCountry] = useState(initial.contactPhone?.country ?? initial.address?.country ?? DEFAULT_COUNTRY_CODE);
    const [phone, setPhone] = useState(initial.contactPhone?.number ?? "");
    const [email, setEmail] = useState(draftEmail);
    const [code, setCode] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);
    const [cooldown, setCooldown] = useState(0);

    const phoneE164 = toE164(phoneCountry, phone);
    const methodReady = AUTH_METHODS[mode];
    const inputValid = mode === "email" ? EMAIL_RE.test(email.trim()) : /^\d{7,12}$/.test(phone);
    const canContinue = methodReady && inputValid;

    useEffect(() => {
        if (cooldown <= 0) return;
        const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
        return () => clearTimeout(t);
    }, [cooldown]);

    const switchMode = (next: Mode) => {
        setMode(next);
        setError(null);
        setNotice(null);
    };

    const sendCode = () => (mode === "email" ? sendEmailCode(email) : sendPhoneCode(phoneE164));

    const onContinue = async () => {
        if (!canContinue || busy) return;
        Keyboard.dismiss();
        setError(null);
        setNotice(null);
        setBusy(true);
        try {
            await sendCode();
            setCode("");
            setStep("code");
            setCooldown(RESEND_SECONDS);
        } catch (e) {
            setError(friendlyAuthError(e));
        } finally {
            setBusy(false);
        }
    };

    const onResend = async () => {
        if (cooldown > 0 || busy) return;
        setError(null);
        setBusy(true);
        try {
            await sendCode();
            setCode("");
            setCooldown(RESEND_SECONDS);
        } catch (e) {
            setError(friendlyAuthError(e));
        } finally {
            setBusy(false);
        }
    };

    // On success Supabase fires SIGNED_IN, and the sheet's AuthGate closes it and runs the saved action.
    const verify = async (token: string) => {
        if (busy) return;
        setError(null);
        setBusy(true);
        try {
            if (mode === "email") await verifyEmailCode(email, token);
            else await verifyPhoneCode(phoneE164, token);
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

    const banner = notice ?? (!methodReady && step === "start" ? NOT_READY[mode] : null);

    // ---------- header ----------
    const title = step === "code" ? (mode === "phone" ? "Confirm your number" : "Confirm your email") : "Log in or sign up";
    const header = (
        <View className="flex-row items-center justify-center border-b border-gray-200" style={{ height: rm(52) }}>
            <TouchableOpacity
                onPress={() => (step === "code" ? (setStep("start"), setError(null)) : close())}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel={step === "code" ? "Back" : "Close"}
                style={{ position: "absolute", left: rs(16) }}
            >
                <Ionicons name={step === "code" ? "chevron-back" : "close"} size={rm(24)} color={COLORS.ink} />
            </TouchableOpacity>
            <AppText variant="large" weight="semibold">{title}</AppText>
        </View>
    );

    // ---------- step 1: choose a method ----------
    const iconOf = (name: keyof typeof Ionicons.glyphMap): ReactNode => <Ionicons name={name} size={rm(20)} color={COLORS.ink} />;

    const startStep = (
        <>
            <AppText variant="title" weight="bold">Welcome to African Spaces</AppText>

            {suggestGoogle && (
                <>
                    <GoogleSignInButton text="Continue with Google" sublabel={`as ${draftEmail}`} badge="Suggested" loginHint={draftEmail} />
                    <Divider />
                </>
            )}

            {mode === "phone" ? (
                <PhoneField
                    label="Phone number"
                    countryCode={phoneCountry}
                    onCountryChange={setPhoneCountry}
                    value={phone}
                    onChangeText={(t) => { setPhone(cleanPhoneDigits(t)); setError(null); }}
                    error={error ?? undefined}
                    helper="We'll text you a code to confirm your number. Standard message and data rates apply."
                    onSubmitEditing={onContinue}
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
                    helper="We'll email you a code to confirm it. No password needed."
                    returnKeyType="done"
                    onSubmitEditing={onContinue}
                />
            )}

            {!!banner && <Banner text={banner} />}

            <PrimaryButton label="Continue" disabled={!canContinue} loading={busy} onPress={onContinue} />

            <Divider />

            <View style={{ gap: rv(12) }}>
                {mode === "phone" ? (
                    <AuthOptionRow
                        label="Continue with email"
                        icon={iconOf("mail-outline")}
                        badge={AUTH_METHODS.email ? undefined : "Soon"}
                        onPress={() => switchMode("email")}
                    />
                ) : (
                    <AuthOptionRow
                        label="Continue with phone"
                        icon={iconOf("call-outline")}
                        badge={AUTH_METHODS.phone ? undefined : "Soon"}
                        onPress={() => switchMode("phone")}
                    />
                )}

                <AuthOptionRow
                    label="Continue with Apple"
                    icon={iconOf("logo-apple")}
                    badge={AUTH_METHODS.apple ? undefined : "Soon"}
                    onPress={() => {
                        if (!AUTH_METHODS.apple) setNotice(NOT_READY.apple);
                        // when Apple is set up: call your Apple sign-in here
                    }}
                />

                {!suggestGoogle && <GoogleSignInButton text="Continue with Google" />}
            </View>

            <AppText variant="caption" className="text-gray-500 text-center">
                By continuing, you agree to our Terms of Service and Privacy Policy.
            </AppText>
        </>
    );

    // ---------- step 2: type the code ----------
    const where = mode === "phone" ? `by SMS to ${dialCodeOf(phoneCountry)} ${phone}` : `to ${email.trim()}`;

    const codeStep = (
        <>
            <AppText variant="body">Enter the code we've sent {where}:</AppText>

            <OtpCodeInput value={code} onChange={onCodeChange} length={CODE_LENGTH} hasError={!!error} autoFocus />

            {!!error && (
                <View className="flex-row items-center" style={{ gap: rs(5) }}>
                    <Ionicons name="alert-circle" size={rm(14)} color={COLORS.danger} />
                    <AppText variant="caption" style={{ color: COLORS.danger, flex: 1 }}>{error}</AppText>
                </View>
            )}

            <View className="flex-row items-center flex-wrap" style={{ gap: rs(6) }}>
                <AppText variant="small" className="text-gray-500">Haven't received it?</AppText>
                {cooldown > 0 ? (
                    <AppText variant="small" className="text-gray-500">Send again in {cooldown}s</AppText>
                ) : (
                    <TouchableOpacity onPress={onResend} disabled={busy} accessibilityRole="button">
                        <AppText variant="small" weight="semibold" className="underline">Send again</AppText>
                    </TouchableOpacity>
                )}
            </View>

            <TouchableOpacity onPress={() => { setStep("start"); setError(null); }} accessibilityRole="button" className="self-start">
                <AppText variant="small" weight="semibold" className="underline">More options</AppText>
            </TouchableOpacity>

            <PrimaryButton label="Continue" disabled={code.length < CODE_LENGTH} loading={busy} onPress={() => verify(code)} />
        </>
    );

    return (
        <View className="flex-1 bg-white">
            {header}
            <ScrollView
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: rs(20), paddingTop: rv(20), paddingBottom: rv(28), gap: rv(16) }}
            >
                {step === "start" ? startStep : codeStep}
            </ScrollView>
        </View>
    );
}