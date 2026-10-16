import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CustomButton from "@/components/becomeAHostButton";
import { useRouter } from "expo-router";

const hostBenefits = [
    { icon: "home-outline" as const, label: "Showcase your space" },
    { icon: "calendar-outline" as const, label: "Manage your availability" },
    { icon: "people-outline" as const, label: "Welcome guests on your terms" },
];

const WelcomePage = () => {
    const router = useRouter()

    const handleGetStartedButtonClick = () => {
        router.push("/listingTypeChoice")  // is it okay router.push here or should I use another function of router
    }

    return (
        <View className="flex-1 justify-between bg-white px-6 pb-8 pt-6 bg-yellow-500">
            <View>
                <Text className="font-rubik-medium text-xs uppercase tracking-[2px] text-dark-green-ascents">
                    Hosting made simple
                </Text>
                <Text className="mt-2 font-rubik-bold text-2xl leading-8 text-[#17211B]">
                    Your space deserves to be discovered.
                </Text>
                <Text className="mt-2 font-rubik text-sm leading-5 text-[#68736C]">
                    Create a listing, share what makes it special, and connect with people looking for a place to stay.
                </Text>

                <View className="mt-5 gap-3">
                    {hostBenefits.map((benefit) => (
                        <View key={benefit.label} className="flex-row items-center gap-3">
                            <View className="h-9 w-9 items-center justify-center rounded-full bg-[#EEF5F0]">
                                <Ionicons name={benefit.icon} size={18} color="#064D30" />
                            </View>
                            <Text className="font-rubik-medium text-sm text-[#26332B]">
                                {benefit.label}
                            </Text>
                        </View>
                    ))}
                </View>
            </View>

            <View className="mt-6">

                <TouchableOpacity
                    onPress={handleGetStartedButtonClick}
                    activeOpacity={0.82}
                    accessibilityRole="button"
                    accessibilityLabel="Get started with hosting"
                    className="min-h-14 flex-row items-center justify-center gap-2 rounded-2xl bg-dark-green-ascents px-5 py-4"
                >
                    <Text className="font-rubik-bold text-base text-white">Get started</Text>
                    <Ionicons name="arrow-forward" size={18} color="white" />
                </TouchableOpacity>
                <Text className="mt-3 text-center font-rubik text-xs text-[#8A948D]">
                    It only takes a few minutes to get started
                </Text>
            </View>
        </View>
    )
}

export default WelcomePage;
