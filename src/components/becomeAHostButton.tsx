import { Text, TouchableOpacity } from "react-native";

type Props = {
    className?: string;
    onPress?: () => void;
};

const BecomeAHostButton = ({ className = "", onPress }: Props) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            className={`border border-black rounded-xl py-4 items-center ${className}`}
        >
            <Text className="font-bold text-base">Become a host</Text>
        </TouchableOpacity>
    );
};

export default BecomeAHostButton;