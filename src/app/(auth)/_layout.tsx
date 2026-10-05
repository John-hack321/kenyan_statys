import { Slot, useRouter } from "expo-router";
import { useEffect } from "react";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useAuthContext } from "../../../lib/hooks/auth-context";
import { clearPendingAction, takePendingAction } from "@/lib/pending-actions";

export default function SignInLayout () {
    const { isLoggedIn, isLoading } = useAuthContext()
    const router = useRouter()

    // 1) Login succeeded: close this screen, then continue what the user was doing.
    useEffect(() => {
        if (isLoading || !isLoggedIn) return

        const action = takePendingAction()
        if (router.canDismiss()) {
            router.dismiss()          // opened as a modal on top of the app -> just close it
        } else {
            router.replace("/")       // opened directly (nothing under it) -> go home
        }
        // small delay so the screen has closed before the action navigates or shows something
        if (action) setTimeout(action, 300)
    }, [isLoading, isLoggedIn, router])

    // 2) Screen closed without logging in: forget the action, so it can't fire at a random later login.
    useEffect(() => {
        return () => clearPendingAction()
    }, [])

    if (isLoggedIn) return null   // avoids a flash of the form while closing

    return (
        <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? "padding" : "height"} >
            <ScrollView className="bg-white h-full" contentContainerClassName="flex-grow" keyboardShouldPersistTaps="handled"> 

                <Slot/>

            </ScrollView>
        </KeyboardAvoidingView>
    )
}