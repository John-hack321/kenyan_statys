import { View, Text } from "react-native";
import AppText from "@/components/AppText";
import { rs, rv, rm } from "@/styles/responsive";

// NOTES FOR AI 
// for this part if there is a we can find a way to make readig the explanations fun then it would be really good you know btw .


const VentureInfoOnePage = () => {
    return (
        <View className="flex-1 bg-white">
            <View style={{ paddingHorizontal: rs(20), paddingTop: rv(20), paddingBottom: rv(8) }}>
                <AppText variant="title">What is venture Profile ? </AppText>
                <AppText variant="small" className="text-gray-500" style={{ marginTop: rv(4) }}>
                    Pick one. You can add more listings later.
                </AppText>
            </View>

            <View>
                <AppText variant="body">A venture profile is like a business page on facebook but now for your airbnb business 
                    you can have and manage as many listings under the same venture profile . 
                    we are alomost there , all you need to do is add a few details for your venture and your first listing and venture 
                    will all be done in one shot . what a cool way to kill two birds with one stone at a go . 
                </AppText>
            </View>

        </View>
    )
}

export default VentureInfoOnePage;