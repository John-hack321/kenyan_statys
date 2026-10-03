import { images } from "@/constants/images";
import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Dimensions, Image, ImageBackground, KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";

export default function SignInLayout () {
    return (
        <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? "padding" : "height"} >
            <ScrollView className="bg-white h-full" contentContainerClassName="flex-grow" keyboardShouldPersistTaps="handled"> 

                <Slot/>


            </ScrollView>
        </KeyboardAvoidingView>
    )
}

{/* to ensure that when we click out of the keyboard the keyboard is dismissed automaticaly we use the keybourdshouldpersisttaps and set it to handles as shown */}