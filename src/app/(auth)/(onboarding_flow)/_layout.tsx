import { SafeAreaView } from "react-native-safe-area-context";
import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";


export default function OnboardingLayout () {
    return (
        <SafeAreaView>
            <StatusBar style="dark"/>
            <Slot/>
        </SafeAreaView>
    )
}