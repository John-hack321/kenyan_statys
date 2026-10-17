import { Text, View } from "react-native"
import { ScrollView } from "react-native";
import AppText from "@/components/AppText";
import { rs, rv, rm } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";


const ReservationOption = () => {
    return (
        <View>
            <Text>Resrevation option 1</Text>
        </View>
    )
}

const ReservationChoicePage = () => {
    return (
        <View className="flex-1 bg-white">
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: rv(16) }}>
            <View style={{ paddingHorizontal: rs(20), paddingTop: rv(20), paddingBottom: rv(8) }}>
                <AppText variant="title">
                    What type of reservation will guests have ? 
                </AppText>
            </View>

            <View className="flex flex-col mt-2 px-5 gap-4">
                <View className="flex items-center justify-between flex-row border px-4 py-8 rounded-lg">
                    <View>
                        <AppText variant="body" className="font-bold">An entier place</AppText>
                        <AppText variant="caption">Your guests will have the whole place to themselves</AppText>
                    </View>

                    <View>
                        <Ionicons name="room" /> {/*note for AI :  here we will add an icon to show entirety of a place okay . I dont if a house icont will work but you come up wit something good okay  */}
                    </View>
                </View>

                <View className="flex items-center justify-between flex-row border px-4 py-8 rounded-lg">
                    <View>
                        <AppText variant="body" className="font-bold">An room</AppText>
                        <AppText variant="caption">Guests will have a their own room plus access to shared spaces </AppText>
                    </View>

                    <View>
                        <Ionicons name="room" /> {/*note for AI :  here we will add an icon to show entirety of a place okay . I dont if a house icont will work but you come up wit something good okay  */}
                    </View>
                </View>


            </View>

        </ScrollView>
    </View>
    )
}

export default ReservationChoicePage;

// notes for AI 
/**
 * fot this page while working through it , don't also forget to use the scaling tools ( rv , rs , rm ) for conistency across multiple 
 * phone screen sizes okay . 
 * for this page you can also make componets resuable where you find necesary okay . 
 * remember the reservation options should be clickable and when cliecked they should update the zustand store too okay. 
 * remeber you can also make them reusable where you find appropriate okay . 
 */