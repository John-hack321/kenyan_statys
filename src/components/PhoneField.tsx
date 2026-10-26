import { Ref, useState } from "react";
import { TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppText from "@/components/AppText";
import { CountryCodePicker } from "@/components/CountryCodePicker";
import { COUNTRIES, DEFAULT_COUNTRY } from "@/constants/countryCodes";
import { rm, rs, rv } from "@/styles/responsive";
import { FONT_BY_WEIGHT } from "@/styles/typography";

const GREEN = "#064D30";
const RED = "#B3261E";

type Props = {
    label: string;
    countryCode: string;                       // ISO code of the chosen country, e.g. "KE" (so +1 can be the US or Canada)
    onCountryChange: (iso: string) => void;
    value: string;                             // the digits after the country code
    onChangeText: (digits: string) => void;
    onBlur?: () => void;
    error?: string;
    helper?: string;
    placeholder?: string;
    inputRef?: Ref<TextInput>;
    onSubmitEditing?: () => void;
};

// Same look as TextField (label inside, border turns green / red), with a country code picker on the left.
export default function PhoneField({
    label, countryCode, onCountryChange, value, onChangeText, onBlur, error, helper, placeholder = "712 345 678", inputRef, onSubmitEditing,
}: Props) {
    const [focused, setFocused] = useState(false);
    const country = COUNTRIES.find((c) => c.code === countryCode) ?? DEFAULT_COUNTRY;
    const borderColor = error ? RED : focused ? GREEN : "#D1D5DB";
    const labelColor = error ? RED : focused ? GREEN : "#6B7280";

    return (
        <View style={{ width: "100%" }}>
            <View
                style={{
                    borderWidth: 1.5,
                    borderColor,
                    borderRadius: rm(12),
                    backgroundColor: error ? "#FEF2F2" : "white",
                    paddingHorizontal: rs(14),
                    paddingTop: rv(8),
                    paddingBottom: rv(8),
                }}
            >
                <AppText variant="caption" weight="medium" style={{ color: labelColor }}>{label}</AppText>

                <View className="flex-row items-center" style={{ marginTop: rv(2), gap: rs(10) }}>
                    <CountryCodePicker value={country} onChange={(c) => onCountryChange(c.code)} />
                    <View style={{ width: 1, alignSelf: "stretch", backgroundColor: "#E5E7EB" }} />
                    <TextInput
                        ref={inputRef}
                        value={value}
                        onChangeText={onChangeText}
                        onFocus={() => setFocused(true)}
                        onBlur={() => { setFocused(false); onBlur?.(); }}
                        keyboardType="phone-pad"
                        maxLength={15}
                        placeholder={placeholder}
                        placeholderTextColor="#9CA3AF"
                        selectionColor={GREEN}
                        accessibilityLabel={label}
                        returnKeyType="next"
                        onSubmitEditing={onSubmitEditing}
                        style={{ flex: 1, fontFamily: FONT_BY_WEIGHT.regular, fontSize: rm(15), color: "#111", padding: 0 }}
                    />
                </View>
            </View>

            {error ? (
                <View className="flex-row items-center" style={{ marginTop: rv(6), gap: rs(5) }}>
                    <Ionicons name="alert-circle" size={rm(14)} color={RED} />
                    <AppText variant="caption" style={{ color: RED, flex: 1 }}>{error}</AppText>
                </View>
            ) : helper ? (
                <AppText variant="caption" className="text-gray-500" style={{ marginTop: rv(6) }}>{helper}</AppText>
            ) : null}
        </View>
    );
}
