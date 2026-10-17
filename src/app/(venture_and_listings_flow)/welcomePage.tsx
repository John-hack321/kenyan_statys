import { ScrollView, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AppText from "@/components/AppText";
import { rm, rs, rv } from "@/styles/responsive";

const hostBenefits = [
    { icon: "home-outline" as const, label: "Showcase your space" },
    { icon: "calendar-outline" as const, label: "Manage your availability" },
    { icon: "people-outline" as const, label: "Welcome guests on your terms" },
];

const WelcomePage = () => {
    const router = useRouter();

    return (
        <View className="flex-1 bg-white">
            {/* text + benefits scroll if the screen is too short, so nothing gets cut off */}
            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: rs(24), paddingTop: rv(16), paddingBottom: rv(12) }}
            >
                <AppText variant="caption" weight="medium" className="uppercase text-dark-green-ascents" style={{ letterSpacing: 2 }}>
                    Hosting made simple
                </AppText>
                <AppText variant="title" weight="bold" style={{ marginTop: rv(8) }}>
                    Your space deserves to be discovered.
                </AppText>
                <AppText variant="small" className="text-gray-500" style={{ marginTop: rv(8) }}>
                    Create a listing, share what makes it special, and connect with people looking for a place to stay.
                </AppText>

                <View style={{ marginTop: rv(16), gap: rv(12) }}>
                    {hostBenefits.map((benefit) => (
                        <View key={benefit.label} className="flex-row items-center" style={{ gap: rs(12) }}>
                            <View
                                className="items-center justify-center rounded-full bg-[#EEF5F0]"
                                style={{ height: rm(36), width: rm(36) }}
                            >
                                <Ionicons name={benefit.icon} size={rm(18)} color="#064D30" />
                            </View>
                            <AppText variant="body" weight="medium">{benefit.label}</AppText>
                        </View>
                    ))}
                </View>
            </ScrollView>

            {/* always visible, outside the scroll area */}
            <View className="border-t border-gray-100" style={{ paddingHorizontal: rs(24), paddingTop: rv(10), paddingBottom: rv(10) }}>
                <TouchableOpacity
                    onPress={() => router.push("/listingTypeChoice")}
                    activeOpacity={0.82}
                    accessibilityRole="button"
                    accessibilityLabel="Get started with hosting"
                    className="flex-row items-center justify-center rounded-2xl bg-dark-green-ascents"
                    style={{ height: rm(52), gap: rs(8) }}
                >
                    <AppText variant="large" weight="bold" className="text-white">Get started</AppText>
                    <Ionicons name="arrow-forward" size={rm(18)} color="white" />
                </TouchableOpacity>
                <AppText variant="caption" className="text-center text-gray-400" style={{ marginTop: rv(6) }}>
                    It only takes a few minutes to get started
                </AppText>
            </View>
        </View>
    );
};

export default WelcomePage;