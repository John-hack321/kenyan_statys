import { TouchableOpacity, View, Text, useAnimatedColor } from "react-native"
import GoogleIcon from "@/components/google-icon";
import { AppleSignInButtonProps } from "@/constants/type";
import { rv } from "@/styles/responsive";
import * as sentry from "@sentry/react-native"
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { ActivityIndicator } from "react-native";


const AppleSignInButton = ({styles, text} : AppleSignInButtonProps) => {

    const [isLoading, setIsLoading] = useState(false)

    return (
        <TouchableOpacity
        className={` ${styles}`} >
            {isLoading ? (
                    <ActivityIndicator size="small" color="white"/>
            ) : (
                <View className="items-center justify-center flex-row" style={{gap: rv(8)}}>
                    <Ionicons name="logo-apple" size={rv(18)} color="white" />
                    <Text className="text-white font-bold">{text}</Text>
                </View>
            )}
            
        </TouchableOpacity>

    )
}

export default AppleSignInButton;