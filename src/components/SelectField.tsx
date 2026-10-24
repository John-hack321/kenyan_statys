import { useMemo, useState } from "react";
import { FlatList, Modal, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import AppText from "@/components/AppText";
import { rm, rs, rv } from "@/styles/responsive";
import { FONT_BY_WEIGHT } from "@/styles/typography";

const GREEN = "#064D30";
const RED = "#B3261E";

export type SelectOption = { value: string; label: string };

type Props = {
    label: string;
    title?: string;                 // heading of the pop-up, defaults to the label
    value?: string;
    options: SelectOption[];
    onChange: (value: string) => void;
    placeholder?: string;
    error?: string;
    helper?: string;
    disabled?: boolean;
};

// Looks like TextField, but tapping it opens a searchable list. Use it whenever the answer must be
// one of a fixed set (country, county), so the same place is always spelled the same way.
export default function SelectField({ label, title, value, options, onChange, placeholder = "Select", error, helper, disabled }: Props) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");

    const selected = options.find((o) => o.value === value);
    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return q ? options.filter((o) => o.label.toLowerCase().includes(q)) : options;
    }, [options, query]);

    const close = () => { setOpen(false); setQuery(""); };

    return (
        <View style={{ width: "100%" }}>
            <TouchableOpacity
                onPress={() => !disabled && setOpen(true)}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={`${label}: ${selected?.label ?? "not selected"}`}
                accessibilityState={{ disabled: !!disabled }}
                className="flex-row items-center justify-between"
                style={{
                    borderWidth: 1.5,
                    borderColor: error ? RED : "#D1D5DB",
                    borderRadius: rm(12),
                    backgroundColor: disabled ? "#F9FAFB" : error ? "#FEF2F2" : "white",
                    opacity: disabled ? 0.6 : 1,
                    paddingHorizontal: rs(14),
                    paddingVertical: rv(8),
                }}
            >
                <View style={{ flex: 1 }}>
                    <AppText variant="caption" weight="medium" style={{ color: error ? RED : "#6B7280" }}>{label}</AppText>
                    <AppText variant="body" style={{ marginTop: rv(2), color: selected ? "#111" : "#9CA3AF" }} numberOfLines={1}>
                        {selected?.label ?? placeholder}
                    </AppText>
                </View>
                <Ionicons name="chevron-down" size={rm(18)} color="#111" />
            </TouchableOpacity>

            {error ? (
                <View className="flex-row items-center" style={{ marginTop: rv(6), gap: rs(5) }}>
                    <Ionicons name="alert-circle" size={rm(14)} color={RED} />
                    <AppText variant="caption" style={{ color: RED, flex: 1 }}>{error}</AppText>
                </View>
            ) : helper ? (
                <AppText variant="caption" className="text-gray-500" style={{ marginTop: rv(6) }}>{helper}</AppText>
            ) : null}

            <Modal visible={open} animationType="slide" onRequestClose={close}>
                <SafeAreaView className="flex-1 bg-white">
                    <View className="flex-row items-center justify-between" style={{ paddingHorizontal: rs(16), paddingVertical: rv(10) }}>
                        <TouchableOpacity
                            onPress={close}
                            hitSlop={8}
                            accessibilityRole="button"
                            accessibilityLabel="Close"
                            className="items-center justify-center rounded-full border border-gray-300"
                            style={{ height: rm(36), width: rm(36) }}
                        >
                            <Ionicons name="close" size={rm(20)} color="#111" />
                        </TouchableOpacity>
                        <AppText variant="large" weight="semibold">{title ?? label}</AppText>
                        <View style={{ width: rm(36) }} />
                    </View>

                    <View
                        className="flex-row items-center rounded-xl bg-gray-100"
                        style={{ marginHorizontal: rs(16), marginBottom: rv(8), paddingHorizontal: rs(12), gap: rs(8) }}
                    >
                        <Ionicons name="search" size={rm(18)} color="#6B7280" />
                        <TextInput
                            value={query}
                            onChangeText={setQuery}
                            placeholder="Search"
                            placeholderTextColor="#9CA3AF"
                            autoCorrect={false}
                            autoCapitalize="none"
                            selectionColor={GREEN}
                            style={{ flex: 1, paddingVertical: rv(10), fontFamily: FONT_BY_WEIGHT.regular, fontSize: rm(15), color: "#111" }}
                        />
                    </View>

                    <FlatList
                        data={filtered}
                        keyExtractor={(o) => o.value}
                        keyboardShouldPersistTaps="handled"
                        initialNumToRender={20}
                        ListEmptyComponent={
                            <AppText variant="small" className="text-gray-500 text-center" style={{ padding: rs(20) }}>
                                No matches for "{query}"
                            </AppText>
                        }
                        renderItem={({ item }) => {
                            const isSelected = item.value === value;
                            return (
                                <TouchableOpacity
                                    onPress={() => { onChange(item.value); close(); }}
                                    activeOpacity={0.7}
                                    accessibilityRole="button"
                                    accessibilityState={{ selected: isSelected }}
                                    className="flex-row items-center justify-between border-b border-gray-100"
                                    style={{ paddingHorizontal: rs(20), paddingVertical: rv(14) }}
                                >
                                    <AppText variant="body" weight={isSelected ? "semibold" : "regular"}>{item.label}</AppText>
                                    {isSelected && <Ionicons name="checkmark" size={rm(20)} color={GREEN} />}
                                </TouchableOpacity>
                            );
                        }}
                    />
                </SafeAreaView>
            </Modal>
        </View>
    );
}