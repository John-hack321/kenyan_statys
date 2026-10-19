import { View, ScrollView, TouchableOpacity } from "react-native";
import AppText from "@/components/AppText";
import { rs, rv ,rm } from "@/styles/responsive";
import { useVentureDraftStore } from "@/app_state/ventureFlowStore";
import { TextInput } from "react-native-gesture-handler";

const ListingNameAndDescriptionPage = () => {

    const draft = useVentureDraftStore((e) => e.draft)
    const listingName = draft.ListingName
    const listingDescription = draft.ListingDescription

    const handleListingNameEntry = () => {
        // notes for ai : here we will have the funtionality for updating the zustand store as the user types ther name 
    }

    return (
        <View className="flex-1 bg-white">
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: rv(16) }}>
                <View style={{ paddingHorizontal: rs(20), paddingTop: rv(20), paddingBottom: rv(8) }}>
                    <AppText variant="title">Listing name and descritpion</AppText>
                    <AppText variant="small" className="text-gray-500" style={{ marginTop: rv(4) }}>
                        You can change this later. {/* notes for AI :  i still dont konw whether for this part we can allow the host to change these details later on but we will see  */}
                    </AppText>
                </View>

                {/* the inputs now go here */}
                {/* notes for ai   : 
                make the inputs good even ther titles too okay .use a suitable font size please okay .  */}
                <View className="flex mx-5 gap-4">

                    <AppText variant="title">Appartment title</AppText>
                    <View className="flex flex-row items-center justify-between w-full px-4 bg-[#FBFBFD]  rounded-lg border border-gray-300"
                    style = {{paddingVertical: rv(2) }}>
                        <View className="felx flex-1 flex-row items-center justify-start z-50">
                            <TextInput
                                value={listingName}
                                onChangeText={() => handleListingNameEntry()}
                                placeholder="eg. Two bedroom appartment"
                                className="text-sm text-black-300 ml-2 flex-1"
                                style={{fontSize: rv(12), lineHeight: rv(20)}}
                            />
                        </View>
                    </View>

                    <AppText variant="title">Create a Description</AppText>
                    <View className="flex flex-row items-center justify-between w-full px-4 bg-[#FBFBFD]  rounded-lg border border-gray-300"
                    style = {{paddingVertical: rv(2) }}>
                        <View className="felx flex-1 flex-row items-center justify-start z-50">
                            <TextInput
                                value={listingName}
                                onChangeText={() => handleListingNameEntry()}
                                placeholder="eg. note for AI :  put an example description here "
                                className="text-sm text-black-300 ml-2 flex-1"
                                style={{fontSize: rv(12), lineHeight: rv(20)}}
                            />
                        </View>
                    </View> 

                </View>

            </ScrollView>
        </View>
    )
}

export default ListingNameAndDescriptionPage;