import { images } from "@/constants/images";
import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Dimensions, Image, ImageBackground, KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";

export default function SignInLayout () {
    return (
        <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? "padding" : "height"} >
            <ScrollView className="bg-white h-full" contentContainerClassName="flex-grow" keyboardShouldPersistTaps="handled"> 
                <StatusBar style="dark"/>

                {/**
                <View className="w-full relative mb-2" style={{height: Dimensions.get('screen').height / 2.25}} >
                    <ImageBackground source={images.authImage} className="size-full  rounded-b-lg" resizeMode="stretch"/ >
                    <Image source={images.app_icon} className="self-center size-32 rounded-[30px] absolute -bottom-16 z-10 " />
                </View>
                 */}

                <Slot/>


            </ScrollView>
        </KeyboardAvoidingView>
    )
}

{/* to ensure that when we click out of the keyboard the keyboard is dismissed automaticaly we use the keybourdshouldpersisttaps and set it to handles as shown */}