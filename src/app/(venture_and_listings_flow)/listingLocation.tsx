import { ScrollView, Text, View } from "react-native"
import AppText from "@/components/AppText";
import { rs, rv , rm } from "@/styles/responsive";
import MapView , {Marker} from "react-native-maps"


const ListingLocationPage = () => {
    return (
        <View className="flex-1 bg-white">
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: rv(16) }}>
                <View style={{ paddingHorizontal: rs(20), paddingTop: rv(20), paddingBottom: rv(8) }}>
                    <AppText variant="title">Pin the location of your listing</AppText>
                    <AppText variant="small" className="text-gray-500" style={{ marginTop: rv(4) }}>
                        guests will only see this location when you allow them in settings 
                        location will only be shared with guests after they have booked
                    </AppText> {/* notes for ai : find a way to make this text speak this info well but in a shorter way okay . you can also change the location of the text if needed okay .  */}
                </View>

                {/* map view goes here */}
                <View className="border mx-5 rounded-lg mt-4 flex items-center justify-center"
                style={{height: rv(350)}}>
                    <MapView
                        provider="google"
                        initialRegion={{
                            latitude: -1.2921,
                            longitude: 36.8219,
                            latitudeDelta: 0.0922,
                            longitudeDelta: 0.0421,
                        }}
                        style={{ width: '100%', height: '100%' }}
                    />
                </View>

                {/* other text and information stuff will go here. maybe we can also add a button for setting wheather users can see the exact location of the place right away .  */}
                <View>

                </View>

                
            </ScrollView>
        </View>
    )
}

export default ListingLocationPage;
