import "../../global.css";

import { cssInterop } from "nativewind";
import { SafeAreaView } from "react-native-safe-area-context";

cssInterop(SafeAreaView, { className: "style" });

import { Stack } from "expo-router";
import AuthProvider from "../../providers/auth-provider";
import { SplashScreenController } from "@/components/splash-screen-controller";
import * as Sentry from '@sentry/react-native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

SplashScreen.preventAutoHideAsync();

Sentry.init({
  dsn: 'https://9554e94255537078e5923891c6198458@o4512062619189248.ingest.de.sentry.io/4512062625349712',

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Enable Logs
  enableLogs: true,

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration()],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

function RootLayout() {
  const [fontsLoaded, error] = useFonts({
    'Rubik-Regular': require('../../assets/fonts/Rubik-Regular.ttf'),
    'Rubik-Bold': require('../../assets/fonts/Rubik-Bold.ttf'),
    'Rubik-ExtraBold': require('../../assets/fonts/Rubik-ExtraBold.ttf'),
    'Rubik-Light': require('../../assets/fonts/Rubik-Light.ttf'),
    'Rubik-Medium': require('../../assets/fonts/Rubik-Medium.ttf'),
    'Rubik-SemiBold': require('../../assets/fonts/Rubik-SemiBold.ttf'),
  });

  useEffect(() => {
    if (error) throw error;
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded, error]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <SplashScreenController />
        <Stack screenOptions={{ headerShown: false }} >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          {/* Sign in / sign up opens as an Airbnb-style sheet OVER the current page (nothing is redirected).
              ModalSheet draws the black top, status bar and slide animation itself. */}
          <Stack.Screen
            name="(auth)"
            options={{
              presentation: "transparentModal", // the page underneath stays mounted
              animation: "none",                // ModalSheet animates itself
              gestureEnabled: false,
              statusBarTranslucent: true,
              contentStyle: { backgroundColor: "transparent" },
            }}
          />
          <Stack.Screen name="(venture_and_listings_flow)" options={{headerShown: false}} />
        </Stack>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

export default Sentry.wrap(RootLayout);