import { FlatList, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppText from "@/components/AppText";
import { ListingType, useVentureDraftStore } from "@/app_state/ventureFlowStore";
import { rm, rs, rv } from "@/styles/responsive";

type IconName = keyof typeof Ionicons.glyphMap;

const listingTypes: { type: ListingType; label: string; icon: IconName }[] = [
    { type: "Room", label: "Room", icon: "bed-outline" },
    { type: "Hotel", label: "Hotel", icon: "business-outline" },
    { type: "House", label: "House", icon: "home-outline" },
    { type: "Apartment", label: "Apartment", icon: "grid-outline" },
    { type: "GuestHouse", label: "Guest house", icon: "key-outline" },
];

type OptionProps = { label: string; icon: IconName; selected: boolean; onPress: () => void };

// selected: green background, white icon and text. not selected: white background, black icon and text.
const ListingTypeOption = ({ label, icon, selected, onPress }: OptionProps) => (
    <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityState={{ selected }}
        className={`items-center justify-center rounded-2xl border ${
            selected ? "bg-dark-green-ascents border-dark-green-ascents" : "bg-white border-gray-300"
        }`}
        style={{ width: "48%", minHeight: rv(110), marginBottom: rv(12), gap: rv(8) }}
    >
        <Ionicons name={icon} size={rm(34)} color={selected ? "white" : "black"} />
        <AppText variant="body" weight="medium" className={selected ? "text-white" : "text-black"}>
            {label}
        </AppText>
    </TouchableOpacity>
);

const ListingTypeChoicePage = () => {
    const type = useVentureDraftStore((s) => s.draft.type);
    const setDraft = useVentureDraftStore((s) => s.setDraft);

    return (
        <View className="flex-1 bg-white">
            <View style={{ paddingHorizontal: rs(20), paddingTop: rv(20), paddingBottom: rv(8) }}>
                <AppText variant="title">Which of these matches your place best?</AppText>
                <AppText variant="small" className="text-gray-500" style={{ marginTop: rv(4) }}>
                    Pick one. You can add more listings later.
                </AppText>
            </View>

            <FlatList
                data={listingTypes}
                keyExtractor={(item) => item.type}
                numColumns={2}
                contentContainerStyle={{ paddingHorizontal: rs(20), paddingTop: rv(12) }}
                columnWrapperStyle={{ justifyContent: "space-between" }}
                renderItem={({ item }) => (
                    <ListingTypeOption
                        label={item.label}
                        icon={item.icon}
                        selected={item.type === type}
                        onPress={() => setDraft({ type: item.type })}
                    />
                )}
            />
        </View>
    );
};

export default ListingTypeChoicePage;