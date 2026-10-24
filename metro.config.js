const { withNativeWind } = require("nativewind/metro");
const {
  getSentryExpoConfig
} = require("@sentry/react-native/metro");

const config = getSentryExpoConfig(__dirname);

// Ensure proper asset resolution for fonts
config.resolver.assetExts = [
  ...config.resolver.assetExts,
  'ttf',
  'otf',
];

// Add watchFolders to ensure assets are properly watched
config.watchFolders = [
  ...config.watchFolders,
  __dirname,
];

module.exports = withNativeWind(config, { input: "./global.css" });