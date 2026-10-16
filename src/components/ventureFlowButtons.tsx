import { TouchableOpacity } from "react-native"
import { Text } from "react-native"


export const SaveAndExitButton = () => {
    return (
        <TouchableOpacity className="flex items-center justify-center  px-3  rounded-full border ">
            <Text className="text-sm">Save & exit</Text>
        </TouchableOpacity>
    )
}

// for quiting just in case the user does ont want to continue with the process.
export const DiscardButton = () => {
    return (
        <TouchableOpacity className="flex items-center justify-center px-3 rounded-full border">
            <Text className="text-sm">Discard</Text>
        </TouchableOpacity>
    )
}

interface NextPageButtonProps {
    clickable: boolean;
}

export const NextPageButton = ({clickable} : NextPageButtonProps) => {
    return (
        <TouchableOpacity className={`px-10 rounded-lg py-2 flex justify-center items-center ${clickable} ? "border-white border bg-black  " : "border border-gray-500 bg-gray-300 " `}>
            <Text className={`${clickable} ? "text-black " : ""  font-bold `}>Next</Text>
        </TouchableOpacity>
    )
}

export const BackButton = () => {
    return (
        <TouchableOpacity className="rounded-lg flex justify-center items-center px-10 py-2 border-back border ">
            <Text className="text-lg font-bold">Back</Text>
        </TouchableOpacity>
    )
}


// notes for ai : 
/**
 * you can also change the discard button with an icon that matches the action maybe from ionicons 
 * pleaes relative scaling based on device so that the app can look good on different divices okay . 
 * on the listingtype choices please use icons from ionicons or any other packages that has good 2d icons that can march the app greena , white and black
 * aesthetics okay 
 * make the venture flow buttons also look better and use the scaling thing on the too so that they look good on screens of multiple sizes okay . 
 * as for the text , can you create like a reusable style based on text size so that when I want small text I just call it , for large text I just call it , based on the
 * different text sizes and scales we are using on the app here okay . 
 * if clicked the options should have green background and the white icon and white text and while not I guess the background is just white and black text and blakc icon based on the icons set you will chose 
 * 
 * and wherever you feel like you can better my logic please do so okay . 
 */