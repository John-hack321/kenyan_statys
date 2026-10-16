import { Text, TouchableOpacity } from "react-native";

// make this work like a universal button .
// it will just use for simple stuff that do not need alot of customizations btw .

type Props = {
    textClassName: string;
    buttonName: string;
    className?: string;
    onPress?: () => void; // we have to make this programmable because it will have different effects based on the location of placement .
};

const CustomButton = ({textClassName, buttonName , className = "", onPress }: Props) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            className={`${className}`}
        >
            <Text className={`${textClassName}`}>{buttonName}</Text>
        </TouchableOpacity>
    );
};

export default CustomButton;