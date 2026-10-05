import "../../global.css";

import { Stack } from "expo-router";
import AuthProvider from "../../providers/auth-provider";
import { SplashScreenController } from "@/components/splash-screen-controller";
import * as Sentry from '@sentry/react-native';

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
  return (
    <AuthProvider>
      <SplashScreenController />
      <Stack screenOptions={{ headerShown: false }} >
        {/* to accomoadate the new guest first design we will have to show the auth screens as modals that scroll up from the bottom . */}
        <Stack.Screen name="(auth)" options={{presentation: "modal"}} /> 
      </Stack>
    </AuthProvider>
  );
}

export default Sentry.wrap(RootLayout);