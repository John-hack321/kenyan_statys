import { useAuthContext } from '../../lib/hooks/auth-context'
import { SplashScreen } from 'expo-router'

SplashScreen.preventAutoHideAsync()

export function SplashScreenController() {
    const { isLoading } = useAuthContext()

    if (!isLoading) {
        SplashScreen.hideAsync()
    }

    return null
}