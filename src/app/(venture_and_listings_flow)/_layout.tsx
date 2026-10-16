import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { Slot, usePathname } from "expo-router";
import { Image, TouchableOpacity, Text, View } from "react-native";
import { images } from "@/constants/images";
import WelcomePage from "./welcomePage";
import { ImageBackground } from "react-native";
import { Dimensions } from "react-native";
import { BackButton, DiscardButton, NextPageButton, SaveAndExitButton } from "@/components/ventureFlowButtons";
import { useState } from "react";
import { rs, rv , rm } from "@/styles/responsive";


export default function VentureCreationLayout() {

    const pathName = usePathname();
    const isWelcomePage = pathName.endsWith("/welcomePage")
    const [isNextClickable , setIsNextClickable] = useState(true)

    return (
        <SafeAreaView className="h-full ">
            <StatusBar style="dark" />

            {/** this image only applies to the welcome page */}
            {isWelcomePage && (
                <View className="relative w-full bg-red-500"
                style={{ height: Dimensions.get('screen').height / 1.8}}>
                    <ImageBackground
                        source={images.appartmentImage}
                        resizeMode="stretch"
                        className="size-full "
                    />
                    <Image
                        source={images.cardGradient}
                        className="w-full h-2/3 absolute bottom-0 "
                    />
                    <View className="absolute bottom-0 left-0 right-0 px-6 pb-8 bg-orange-500">
                        <Text className="text-3xl font-rubik-extrabold text-white mb-2">
                            Ready to Start listing your apartments?
                        </Text>
                    </View>
                </View>
            )}

            {!isWelcomePage && (
                <View className="bg-green-500  flex flex-row justify-between px-5 py-2"
                style={{height : rv(60) }}>
                    <SaveAndExitButton/>
                    <DiscardButton/>
                </View>
            )}

            <Slot/>

            {!isWelcomePage && (
                <View className="bg-yellow-500  flex flex-row justify-between item-center py-2 px-5 "
                style={{height: rv(72)}}>
                    <BackButton/>
                    <NextPageButton clickable={isNextClickable} />
                </View>
            )}

        </SafeAreaView>
    )
}