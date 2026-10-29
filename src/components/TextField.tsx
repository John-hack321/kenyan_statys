import { MutableRefObject, Ref, useRef, useState } from "react";
import { Pressable, TextInput, TextInputProps, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppText from "@/components/AppText";
import FloatingLabel from "@/components/FloatingLabel";
import { rm, rs, rv } from "@/styles/responsive";
import { FONT_BY_WEIGHT } from "@/styles/typography";

const GREEN = "#064D30";
const RED = "#B3261E";
const BORDER = "#D1D5DB";

type Props = Omit<TextInputProps, "style" | "value" | "onChangeText"> & {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    optional?: boolean;        // adds "(optional)" to the label
    error?: string;            // shown in red under the field
    helper?: string;           // grey hint under the field (hidden while there is an error)
    showCounter?: boolean;     // "12/60" in the corner (needs maxLength)
    minHeight?: number;        // for multiline fields: how tall the box starts
    inputRef?: Ref<TextInput>;
};

// Outlined field with a floating label: big inside the box while empty, then it shrinks onto the border line
// when you focus the field or type. The `placeholder` only shows once the label has floated up (so they never overlap).
// The border is always 1.5px wide (only the colour changes) so the layout never jumps.
// It owns no state about the value: that comes in as a prop (react-hook-form keeps it).
export default function TextField({
    label, value, onChangeText, optional, error, helper, showCounter, maxLength, multiline,
    minHeight, inputRef, onFocus, onBlur, placeholder, ...rest
}: Props) {
    const [focused, setFocused] = useState(false);
    const innerRef = useRef<TextInput>(null);

    // keep our own ref (to focus when the box is tapped) AND hand the node to the caller's ref
    const setRefs = (node: TextInput | null) => {
        innerRef.current = node;
        if (typeof inputRef === "function") inputRef(node);
        else if (inputRef) (inputRef as MutableRefObject<TextInput | null>).current = node;
    };

    const floated = focused || value.length > 0;
    const borderColor = error ? RED : focused ? GREEN : BORDER;
    const labelColor = error ? RED : focused ? GREEN : "#6B7280";
    const background = error ? "#FEF2F2" : "white";
    const nearLimit = !!maxLength && value.length >= maxLength * 0.9;
    const padTop = rv(multiline ? 16 : 14);

    return (
        // paddingTop leaves room for the label that sticks out above the box
        <View style={{ width: "100%", paddingTop: rm(8) }}>
            <Pressable
                accessible={false}
                onPress={() => innerRef.current?.focus()}
                style={{
                    borderWidth: 1.5,
                    borderColor,
                    borderRadius: rm(12),
                    backgroundColor: background,
                    paddingHorizontal: rs(14),
                    paddingTop: padTop,
                    paddingBottom: rv(multiline ? 10 : 14),
                }}
            >
                <FloatingLabel
                    text={`${label}${optional ? " (optional)" : ""}`}
                    floated={floated}
                    color={labelColor}
                    background={background}
                    restingTop={padTop}
                />

                <TextInput
                    ref={setRefs}
                    value={value}
                    onChangeText={onChangeText}
                    maxLength={maxLength}
                    multiline={multiline}
                    placeholder={floated ? placeholder : undefined}
                    placeholderTextColor="#9CA3AF"
                    selectionColor={GREEN}
                    textAlignVertical={multiline ? "top" : "center"}
                    onFocus={(e) => { setFocused(true); onFocus?.(e); }}
                    onBlur={(e) => { setFocused(false); onBlur?.(e); }}
                    accessibilityLabel={label}
                    style={{
                        fontFamily: FONT_BY_WEIGHT.regular,
                        fontSize: rm(15),
                        color: "#111",
                        padding: 0,
                        minHeight: multiline ? minHeight : undefined,
                    }}
                    {...rest}
                />

                {showCounter && !!maxLength && (
                    <AppText
                        variant="caption"
                        style={{ alignSelf: "flex-end", marginTop: rv(4), color: nearLimit ? "#B45309" : "#9CA3AF" }}
                    >
                        {value.length}/{maxLength}
                    </AppText>
                )}
            </Pressable>

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