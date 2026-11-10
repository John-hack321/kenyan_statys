import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/styles/colors";
import { rm, rs } from "@/styles/responsive";
import { FONT_BY_WEIGHT, TEXT_SCALE_PROPS } from "@/styles/typography";

// Home search field. For now it is a plain input; the plan (DESIGN.md / buildLog roadmap) is to turn it into a
// button that opens the search page. The filters icon was removed until the filters exist: a button that does
// nothing is worse than no button.
const Search = () => {
    const params = useLocalSearchParams<{ query?: string }>();
    const [search, setSearch] = useState(params.query ?? "");

    return (
        <View
            className="flex-row items-center w-full rounded-xl border border-gray-300 bg-white"
            style={{ minHeight: rm(48), paddingHorizontal: rs(14), gap: rs(10) }}
        >
            <Ionicons name="search" size={rm(20)} color={COLORS.muted} />
            <TextInput
                {...TEXT_SCALE_PROPS}
                value={search}
                onChangeText={setSearch}
                placeholder="Search rooms and places"
                placeholderTextColor={COLORS.faint}
                selectionColor={COLORS.green}
                returnKeyType="search"
                accessibilityLabel="Search rooms and places"
                style={{ flex: 1, paddingVertical: rm(10), fontFamily: FONT_BY_WEIGHT.regular, fontSize: rm(15), color: COLORS.ink }}
            />
        </View>
    );
};

export default Search;