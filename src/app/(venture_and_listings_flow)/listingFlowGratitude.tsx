import { View, Text } from "react-native";
import AppText from "@/components/AppText";
import { rv, rs, rm } from "@/styles/responsive";

// NOTES FOR AI
// on this page we have to find a way to thank the host for completing the listing part flow 
// and if possible tell them that we are almost there and we only need to add a few more details to complete everything 
// and if possible teach them the structure too . that listings belong to venture profiles okay . 
// we need to have like an animatino for this part , like maybe a lottie file where confeti fly into the air or something 
// or just something that is congratulatory that you find to be good for this part okay . 
// you can also maybe find ways to make this last part as interesting as possible okay . 

const ListingFlowGratitudePage = () => {
    return (
        <View className="flex-1 bg-white justify-center">
            <View style={{ paddingHorizontal: rs(20), paddingTop: rv(20), paddingBottom: rv(8) }}>
                <AppText variant="title">Thank you for completing the listing part . </AppText>
                <AppText variant="body">YOu are almost there , now lets create your venture profile to finish this in very few steps.</AppText>
            </View>

        </View>
    )
}

export default ListingFlowGratitudePage;