import { ScrollView, View } from "react-native";
import AppText from "@/components/AppText";
import AmenityChip from "@/components/AmenityChip";
import { AMENITIES, AMENITY_GROUPS , AmenityId } from "@/constants/amenities";
import { useVentureDraftStore } from "@/app_state/ventureFlowStore";
import { rs, rv } from "@/styles/responsive";

// Only things INSIDE the place or its building: that is what the host controls and what guests filter by.
// "Near a mall / park" should come from the map location later, not from what the host claims.
const AmenitiesPage = () => {
    const amenities = useVentureDraftStore((s) => s.draft.amenities);
    const setDraft = useVentureDraftStore((s) => s.setDraft);
    const selected = amenities ?? [];

    const toggle = (id: AmenityId) =>
        setDraft({ amenities: selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id] });

    return (
        <View className="flex-1 bg-white">
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: rv(24) }}>
                <View style={{ paddingHorizontal: rs(20), paddingTop: rv(20), paddingBottom: rv(8) }}>
                    <AppText variant="title">What does your place offer?</AppText>
                    <AppText variant="small" className="text-gray-500" style={{ marginTop: rv(4) }}>
                        Pick everything that applies. You can change this any time later.
                        {selected.length > 0 ? `  ${selected.length} selected.` : ""}
                    </AppText>
                </View>

                {AMENITY_GROUPS.map((group) => (
                    <View key={group.key} style={{ paddingHorizontal: rs(20), marginTop: rv(16) }}>
                        <AppText variant="large" weight="semibold" style={{ marginBottom: rv(10) }}>
                            {group.title}
                        </AppText>
                        <View className="flex-row flex-wrap" style={{ gap: rs(10) }}>
                            {AMENITIES.filter((a) => a.group === group.key).map((a) => (
                                <AmenityChip
                                    key={a.id}
                                    label={a.label}
                                    icon={a.icon}
                                    selected={selected.includes(a.id)}
                                    onPress={() => toggle(a.id)}
                                />
                            ))}
                        </View>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
};

export default AmenitiesPage;