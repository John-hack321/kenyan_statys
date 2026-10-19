import { View, ScrollView } from "react-native"
import AppText from "@/components/AppText"
import { rs, rv , rm } from "@/styles/responsive"

const FinalListingDetailsPage = () => {
    return (
        <View className="flex-1 bg-white">
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: rv(16) }}>
                <View style={{ paddingHorizontal: rs(20), paddingTop: rv(20), paddingBottom: rv(8) }}>
                    <AppText variant="title">Allmost there</AppText>
                    <AppText variant="small" className="text-gray-500" style={{ marginTop: rv(4) }}>
                        make your place searchable , add location
                    </AppText>
                </View>

                <View>
                    {/* the recountry / region part goes here 
                    I want you to add the parts in this order : 
                    coutry 
                    city / town = > or just one that is easier to recognize , region etc okay 
                    street address I am not sure about his in kenay or should we use google maps to assist in this part ? 
                    bulding name ( if applicable flag ) 
                    unit floor, buidling , , if applicatble 
                    and any other details that you feel will be applicable for the kenya context here now okay . 
                    I think in this part is where we will use the google places api right ? 
                    so I kond of think we have two choices here : 
                    we use the google maps api for making sure that the usrs always search the corerct name and that the host always
                    enters the correct name right ? 
                    lest say if we were to not use it , the host enters mombasa and the user  by mistake seraches mombasa will the db 
                    bring back mombasa searches from the db ? so is google maps places important here ? right ? 
                    I have added an image of how I would like the ui to look like okay but now in this order okay . 
                    remember for the country  / region you will only give option for the 54 states of africa okay . I think I have them somewhere here too . okay . 
                    */}
                    <View></View>
                </View>


            </ScrollView>
        </View>
    )
}

export default FinalListingDetailsPage;