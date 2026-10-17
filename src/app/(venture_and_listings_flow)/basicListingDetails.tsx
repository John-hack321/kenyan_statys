import { View } from "react-native";
import AppText from "@/components/AppText";
import { rs, rv ,rm } from "@/styles/responsive";
import { Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";

import { useVentureDraftStore } from "@/app_state/ventureFlowStore";
import { useState } from "react";

type CounterType = "plus" | "minus"
type BasicDetailType = "guest" | "bed" | "bathroom" | "room"

const CountPicker = ({basicDetail, count} : {basicDetail : BasicDetailType, count : number}) => {

    const [counter , setCounter] = useState(1) // inital value of zero
    const setDraft = useVentureDraftStore((s) => s.setDraft);
    const draft = useVentureDraftStore((s) => s.draft)
    const details = draft.basicDetails


    //notes for AI
    // you can update the logic of this function for it to handle instances where the we dont want it to go below a base value.
    // cause for example the min for beds is 1 , for rooms is 1 , for bathromms is 1 and for guests is 1 , max for guests is 10 
    // for bathroom and beds and rooms I am not sure whether to put a max cause I dont hink anyone will come and put in that they hve
    // 10000 rooms right . or maybe I can put the max at around 100 right ? 
    const handleCounterClick = (counterType: CounterType) => {
        if (basicDetail == "guest")  {
            switch (counterType) {
                case "plus":
                    console.log("the plus case is here ")
                case "minus" :
                    console.log("the minux case")
            }
        }

        if (basicDetail == "bed")  {
            switch (counterType) {
                case "plus":
                    console.log("the plus case is here ")
                case "minus" :
                    console.log("the minux case")
            }
        }

        if (basicDetail == "bathroom")  {
            switch (counterType) {
                case "plus":
                    console.log("the plus case is here ")
                case "minus" :
                    console.log("the minux case")
            }
        }

        if (basicDetail == "room")  {
            switch (counterType) {
                case "plus":
                    console.log("the plus case is here ")
                case "minus" :
                    console.log("the minux case")
            }
        }
    
    }

    return (
        <View className="flex flex-row gap-2 items-center justify-center">
            <TouchableOpacity
            onPress={() => handleCounterClick("minus")}
            className="flex px-3 py-1 rounded-full bg-gray-200 justify-center items-center">
                <AppText variant="small">-</AppText>
            </TouchableOpacity>

            <Text>{count}</Text>

            <TouchableOpacity
            onPress={() => handleCounterClick("plus")}
            className="flex px-3 py-1 rounded-full bg-gray-200 justify-center items-center">
                <AppText variant="small">+</AppText>
            </TouchableOpacity>
        </View>
    )
}

const BasicListingDetailsPage = () => {

    const draft = useVentureDraftStore((s) => s.draft)
    const details = draft.basicDetails

    return (

    <View className="flex-1 bg-white  ">
        <View style={{ paddingHorizontal: rs(20), paddingTop: rv(20), paddingBottom: rv(8) }}>
                <AppText variant="title">Tell us more about your {draft?.type || "place"} </AppText>
        </View>

        {/* the list of the appartment details goes here now .  */}
        {/* note for AI : any part like this that you feel can be made into reusabel component that save on time and space pelase do so okay as you work through the files */}
        {/* for parts like this one that I am leaveing for you to work on please dont forget to use the responsive guide like using rv , rs and stuff like that so that screen looks good on multiple screens okay  */}
        <View className=""
        style={{paddingHorizontal: rs(20)}}>
            <View className="flex flex-row items-center pb-6 pt-6 border-b border-gray-200 justify-between">
                <AppText variant="small">Prefered max guests</AppText>
                <CountPicker basicDetail="guest" count={details?.maxGuests}/> {/* note for AI :  here with this setup of yours where things are not preselcted , how do we pass count here if the details are undefined ?  */}
            </View>
            <View className="flex flex-row items-center pb-6 pt-6 border-b border-gray-200 justify-between">
                <AppText variant="small">Rooms</AppText>
                <CountPicker basicDetail="room" count={details?.rooms}/>
            </View>
            <View className="flex flex-row items-center pb-6 pt-6 border-b border-gray-200 justify-between">
                <AppText variant="small">Beds</AppText>
                <CountPicker basicDetail="bed" count={details?.beds}/>
            </View>
            <View className="flex flex-row items-center pb-6 pt-6 border-b border-gray-200 justify-between">
                <AppText variant="small">Bathrooms</AppText>
                <CountPicker basicDetail="bathroom" count={details?.bathrooms} />
            </View>
        </View>
    </View>
)}

export default BasicListingDetailsPage;

// nots for ai 
/**
 * 
 */