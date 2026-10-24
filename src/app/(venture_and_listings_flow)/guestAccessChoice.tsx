import { ScrollView, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppText from "@/components/AppText";
import ChoiceCard from "@/components/ChoiceCard";
import { GuestAccessType, useVentureDraftStore } from "@/app_state/ventureFlowStore";
import { rs, rv } from "@/styles/responsive";

type IconName = keyof typeof Ionicons.glyphMap;

// One entry per card. To add an option: add it to GuestAccessType in the store, then one entry here.
const OPTIONS: { value: GuestAccessType; title: string; description: string; icon: IconName }[] = [
    {
        value: "entirePlace",
        title: "An entire place",
        description: "Guests have the whole place to themselves.",
        icon: "home-outline",
    },
    {
        value: "privateRoom",
        title: "A private room",
        description: "Guests get their own room, plus shared spaces like the kitchen or living room.",
        icon: "bed-outline",
    },
];

const GuestAccessChoicePage = () => {
    const guestAccess = useVentureDraftStore((s) => s.draft.guestAccess);
    const setDraft = useVentureDraftStore((s) => s.setDraft);

    return (
        <View className="flex-1 bg-white">
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: rv(16) }}>
                <View style={{ paddingHorizontal: rs(20), paddingTop: rv(20), paddingBottom: rv(8) }}>
                    <AppText variant="title">What will guests have access to?</AppText>
                    <AppText variant="small" className="text-gray-500" style={{ marginTop: rv(4) }}>
                        Pick one. You can change this later.
                    </AppText>
                </View>

                <View accessibilityRole="radiogroup" style={{ paddingHorizontal: rs(20), paddingTop: rv(12), gap: rv(12) }}>
                    {OPTIONS.map((option) => (
                        <ChoiceCard
                            key={option.value}
                            title={option.title}
                            description={option.description}    
                            icon={option.icon}
                            selected={guestAccess === option.value}
                            onPress={() => setDraft({ guestAccess: option.value })}
                        />
                    ))}
                </View>
            </ScrollView>
        </View>
    );
};

export default GuestAccessChoicePage;