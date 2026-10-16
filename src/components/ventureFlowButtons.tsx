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
        <TouchableOpacity className={`px-10 rounded-lg py-2 flex justify-center items-center ${clickable ? "border-white border bg-black  " : "border border-gray-500 bg-gray-300 "} `}>
            <Text className={`${clickable ? "text-white " : ""  } font-bold`}>Next</Text>
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
