import { cn } from "@/lib/utils";
import { rv } from "@/styles/responsive";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

const CustomButton = ({
    onPress,
    title="click me",
    customStyle,
    textStyle,
    leftIcon,
    isLoading=false
}) => {
    return (
        <TouchableOpacity 
            style={{padding: rv(12)}}
            className={cn('bg-dark-green-ascents rounded-full  w-full flex flex-row justify-center', customStyle) } onPress={onPress}>
            {leftIcon}

            <View className = "flex-center flex-row">
                {isLoading ? (
                    <ActivityIndicator size="small" color="white"/>
                ) : (
                    <Text className={cn('text-white paragraph-semibold ' ,textStyle)}>
                        {title}
                    </Text>
                )}
            </View>
        </TouchableOpacity>
    )
}

export default CustomButton;