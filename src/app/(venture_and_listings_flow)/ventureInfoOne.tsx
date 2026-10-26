import { ScrollView, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import AppText from "@/components/AppText";
import { useVentureDraftStore } from "@/app_state/ventureFlowStore";
import { rm, rs, rv } from "@/styles/responsive";

const GREEN = "#064D30";

const WHY: { icon: keyof typeof Ionicons.glyphMap; title: string; note: string }[] = [
    { icon: "layers-outline", title: "One home, many listings", note: "Add as many places as you like. They all live under the same profile." },
    { icon: "ribbon-outline", title: "Trust builds in one place", note: "Reviews and your verified badge belong to your venture, so every new listing starts with them." },
    { icon: "shield-checkmark-outline", title: "Verify once", note: "We confirm who you are one time. You don't repeat it for every listing." },
];

const ListingChip = ({ label, dashed }: { label: string; dashed?: boolean }) => (
    <View
        className={`flex-row items-center rounded-xl ${dashed ? "border border-dashed border-gray-400" : "bg-[#EEF5F0]"}`}
        style={{ paddingHorizontal: rs(12), paddingVertical: rv(10), gap: rs(8) }}
    >
        <Ionicons name={dashed ? "add" : "home-outline"} size={rm(16)} color={dashed ? "#6B7280" : GREEN} />
        <AppText variant="small" weight="medium" className={dashed ? "text-gray-500" : ""} numberOfLines={1} style={{ flex: 1 }}>{label}</AppText>
    </View>
);

const VentureInfoOnePage = () => {
    const listingName = useVentureDraftStore((s) => s.draft.listingName);

    return (
        <View className="flex-1 bg-white">
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: rv(24) }}>
                <View style={{ paddingHorizontal: rs(20), paddingTop: rv(20) }}>
                    <AppText variant="title">What's a venture profile?</AppText>
                    <AppText variant="small" className="text-gray-500" style={{ marginTop: rv(4) }}>
                        Think of it as a business page for your hosting, like a page on Facebook. Here's how it fits together.
                    </AppText>
                </View>

                {/* the picture: a venture with the listing the host just made inside it */}
                <Animated.View
                    entering={FadeInDown.delay(150).duration(500)}
                    className="rounded-2xl border border-gray-200 bg-white"
                    style={{ marginHorizontal: rs(20), marginTop: rv(18), padding: rs(14), gap: rv(10) }}
                >
                    <View className="flex-row items-center" style={{ gap: rs(10) }}>
                        <View className="items-center justify-center rounded-full bg-dark-green-ascents" style={{ height: rm(40), width: rm(40) }}>
                            <Ionicons name="business-outline" size={rm(20)} color="white" />
                        </View>
                        <View>
                            <AppText variant="body" weight="semibold">Your venture</AppText>
                            <AppText variant="caption" className="text-gray-500">Name, photo and verified badge</AppText>
                        </View>
                    </View>

                    <View style={{ marginLeft: rs(19), paddingLeft: rs(19), borderLeftWidth: 2, borderLeftColor: "#B8E8CD", gap: rv(8) }}>
                        <ListingChip label={listingName?.trim() || "Your first listing"} />
                        <ListingChip label="Your next listing, whenever you're ready" dashed />
                    </View>
                </Animated.View>

                <View style={{ paddingHorizontal: rs(20), paddingTop: rv(22), gap: rv(16) }}>
                    {WHY.map((item, i) => (
                        <Animated.View
                            key={item.title}
                            entering={FadeInDown.delay(450 + i * 170).duration(500)}
                            className="flex-row"
                            style={{ gap: rs(14) }}
                        >
                            <View className="items-center justify-center rounded-full bg-[#EEF5F0]" style={{ height: rm(40), width: rm(40) }}>
                                <Ionicons name={item.icon} size={rm(20)} color={GREEN} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <AppText variant="body" weight="semibold">{item.title}</AppText>
                                <AppText variant="small" className="text-gray-500" style={{ marginTop: rv(2) }}>{item.note}</AppText>
                            </View>
                        </Animated.View>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
};

export default VentureInfoOnePage;
