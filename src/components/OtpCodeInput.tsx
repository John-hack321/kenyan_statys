import { useRef, useState } from "react";
import { Pressable, TextInput, View } from "react-native";
import AppText from "@/components/AppText";
import { COLORS } from "@/styles/colors";
import { rm, rs } from "@/styles/responsive";

type Props = {
    value: string;
    onChange: (value: string) => void;
    length?: number;
    hasError?: boolean;
    autoFocus?: boolean;
};

// One box per digit. A single invisible TextInput sits on top and does the real typing, so paste and the
// phone's "code from SMS" suggestion work. The boxes only draw what was typed.
export default function OtpCodeInput({ value, onChange, length = 6, hasError, autoFocus }: Props) {
    const inputRef = useRef<TextInput>(null);
    const [focused, setFocused] = useState(false);
    const activeIndex = Math.min(value.length, length - 1);

    return (
        <Pressable onPress={() => inputRef.current?.focus()} accessibilityRole="none">
            <View style={{ flexDirection: "row", gap: rs(8) }}>
                {Array.from({ length }).map((_, i) => {
                    const active = focused && i === activeIndex;
                    return (
                        <View
                            key={i}
                            style={{
                                flex: 1,
                                height: rm(56),
                                borderWidth: 1.5,
                                borderRadius: rm(12),
                                alignItems: "center",
                                justifyContent: "center",
                                borderColor: hasError ? COLORS.danger : active ? COLORS.green : COLORS.border,
                                backgroundColor: hasError ? COLORS.dangerSoft : COLORS.white,
                            }}
                        >
                            <AppText variant="title" weight="semibold">{value[i] ?? ""}</AppText>
                        </View>
                    );
                })}
            </View>

            <TextInput
                ref={inputRef}
                value={value}
                onChangeText={(t) => onChange(t.replace(/\D/g, "").slice(0, length))}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                autoFocus={autoFocus}
                keyboardType="number-pad"
                maxLength={length}
                textContentType="oneTimeCode"
                autoComplete="sms-otp"
                caretHidden
                accessibilityLabel="Verification code"
                style={{ position: "absolute", width: "100%", height: "100%", opacity: 0 }}
            />
        </Pressable>
    );
}