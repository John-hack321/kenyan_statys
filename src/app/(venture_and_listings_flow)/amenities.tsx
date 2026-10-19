import { View , ScrollView} from "react-native"
import AppText from "@/components/AppText"
import { rv, rm , rs } from "@/styles/responsive"
import { Ionicons } from "@expo/vector-icons"

// NOTES FOR AI 
//  here do you think we should also add amenities around the palce such as malls , parks etc or should we stick to the things
// that are within the place ? 
// I am not sure on how to represent this data s of now , but if this is not suitalbe you can change it okay 

export type AmenityType = "Kitchen" | "Hot water" | "Washer" | "Dryer" | "Tv" | "Refrigerator" | "Wifi" | "Coffee maker" | "Youtube , Netflix etx" // note for ai : and any other esential that you think is important when people are booking a space in kenya okay . 

type IconName = keyof typeof Ionicons.glyphMap;

//note for AI  : put the correct icon names here and make the list as good as possible okay . 
const Amenities: { type: AmenityType; label: string; icon: IconName }[] = [
    { type: "Kitchen", label: "Kitchen", icon: "bed-outline" },
    { type: "Hot water", label: "Hot water", icon: "business-outline" },
    { type: "Washer", label: "Washer", icon: "home-outline" },
    { type: "Dryer", label: "Dryer", icon: "grid-outline" },
    { type: "Tv", label: "Tv", icon: "key-outline" },
];

export const AmenitiesPage = () => {
    return (
        <View className="flex-1 bg-white">
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: rv(16) }}>
                <View style={{ paddingHorizontal: rs(20), paddingTop: rv(20), paddingBottom: rv(8) }}>
                    <AppText variant="title">Lest make your place stand out</AppText>
                    <AppText variant="small" className="text-gray-500" style={{ marginTop: rv(4) }}>
                        Pick amenities and perks you offer at your place you can alwasy change this later
                    </AppText>
                </View>

                {/* notes for AI :  find a way to list he amenities here and remember in this on the user cna chose as many as possible okay. so I dont know if we should send this part of the data s a list or ? but you decide on how you will structure the ddata okay . dont froget to also define it in the venture flow store too okay . here I dont konw hwere you will use the flat list or the map function but you decide okay .  */}
                <View>
                    
                </View>

            </ScrollView>
        </View>
    )
}

export default AmenitiesPage;