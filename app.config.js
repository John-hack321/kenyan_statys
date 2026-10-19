import 'dotenv/config';

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || '';

export default {
  name: "budget_lens",
  slug: "budget_lens",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "budgetlens",
  userInterfaceStyle: "automatic",
  ios: {
    icon: "./assets/expo.icon",
    config: {
      googleMapsApiKey: GOOGLE_MAPS_API_KEY
    },
    bundleIdentifier: "com.johnhack321.africanspaces"
  },
  android: {
    package: "com.johnhack321.africanspaces",
    adaptiveIcon: {
      backgroundColor: "#E6F4FE",
      foregroundImage: "./assets/images/android-icon-foreground.png",
      backgroundImage: "./assets/images/android-icon-background.png",
      monochromeImage: "./assets/images/android-icon-monochrome.png"
    },
    predictiveBackGestureEnabled: false,
    config: {
      googleMaps: {
        apiKey: GOOGLE_MAPS_API_KEY
      }
    }
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png"
  },
  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        backgroundColor: "#208AEF",
        image: "./assets/images/splash-icon.png",
        imageWidth: 76
      }
    ],
    "expo-secure-store",
    [
      "@sentry/react-native/expo",
      {
        url: "https://sentry.io/",
        project: "react-native",
        organization: "ultraviolet-ul"
      }
    ],
    [
      "react-native-maps",
      {
        apiKey: GOOGLE_MAPS_API_KEY
      }
    ],
    [
      "expo-image-picker",
      {
        photosPermission: "The app accesses your photos to let you share them with your friends.",
        colors: {
          cropToolbarColor: "#000000"
        },
        dark: {
          colors: {
            cropToolbarColor: "#000000"
          }
        }
      }
    ]
  ],
  experiments: {
    typedRoutes: true
  },
  extra: {
    backendBaseUrl: "http://10.0.2.2:8000"
  }
};
