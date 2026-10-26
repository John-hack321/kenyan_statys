import { ScrollView, View } from "react-native";
import Animated, { FadeInDown, ZoomIn } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import AppText from "@/components/AppText";
import Confetti from "@/components/Confetti";
import { rm, rs, rv } from "@/styles/responsive";

const GREEN = "#064D30";

// What is left, in plain words. Three short steps, so the host knows the end is close.
const NEXT_UP: { icon: keyof typeof Ionicons.glyphMap; title: string; note: string }[] = [
    { icon: "business-outline", title: "Name your venture", note: "The brand guests will see" },
    { icon: "id-card-outline", title: "Confirm it's you", note: "A quick ID check, only once" },
    { icon: "call-outline", title: "Add your contacts", note: "So we can reach you" },
];

const ListingFlowGratitudePage = () => (
    <View className="flex-1 bg-white">
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: rv(24) }}>
            <View className="items-center" style={{ paddingHorizontal: rs(24), paddingTop: rv(36) }}>
                <Animated.View
                    entering={ZoomIn.springify().damping(12)}
                    className="items-center justify-center rounded-full bg-[#EEF5F0]"
                    style={{ height: rm(96), width: rm(96) }}
                >
                    <Ionicons name="checkmark-circle" size={rm(64)} color={GREEN} />
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(250).duration(500)} className="items-center">
                    <AppText variant="heading" className="text-center" style={{ marginTop: rv(20) }}>
                        Your listing is done!
                    </AppText>
                    <AppText variant="body" className="text-center text-gray-500" style={{ marginTop: rv(8) }}>
                        That was the biggest part. Now let's set up your venture profile: the home for this listing and every one you add later.
                    </AppText>
                </Animated.View>
            </View>

            <View style={{ paddingHorizontal: rs(24), paddingTop: rv(28), gap: rv(12) }}>
                <Animated.View entering={FadeInDown.delay(450).duration(500)}>
                    <AppText variant="caption" weight="medium" className="uppercase text-dark-green-ascents" style={{ letterSpacing: 2 }}>
                        Almost there
                    </AppText>
                </Animated.View>

                {NEXT_UP.map((item, i) => (
                    <Animated.View
                        key={item.title}
                        entering={FadeInDown.delay(600 + i * 150).duration(500)}
                        className="flex-row items-center rounded-2xl border border-gray-200 bg-white"
                        style={{ padding: rs(14), gap: rs(14) }}
                    >
                        <View className="items-center justify-center rounded-full bg-[#EEF5F0]" style={{ height: rm(44), width: rm(44) }}>
                            <Ionicons name={item.icon} size={rm(22)} color={GREEN} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <AppText variant="body" weight="semibold">{item.title}</AppText>
                            <AppText variant="small" className="text-gray-500">{item.note}</AppText>
                        </View>
                        <AppText variant="caption" weight="semibold" className="text-gray-400">{i + 1}/3</AppText>
                    </Animated.View>
                ))}
            </View>
        </ScrollView>

        <Confetti />
    </View>
);

export default ListingFlowGratitudePage;
