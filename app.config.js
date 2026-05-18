export default ({ config }) => ({
  ...config,
  name: "foodv-mobile",
  slug: "foodv-mobile",
  version: "1.0.0",
  scheme: "foodv",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  newArchEnabled: true,
  splash: {
    image: "./assets/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },
  updates: {
    url: `https://u.expo.dev/${process.env.EAS_PROJECT_ID ?? "064926fc-5882-4b6e-9b63-aed6d92b42d8"}`,
    enabled: true,
    fallbackToCacheTimeout: 0,
  },
  runtimeVersion: { policy: "appVersion" },
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.foodv.app",
    googleServicesFile: "./GoogleService-Info.plist",
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    package: "com.foodv.app",
    googleServicesFile: "./google-services.json",
    intentFilters: [
      {
        action: "VIEW",
        autoVerify: true,
        data: [{ scheme: "foodv" }],
        category: ["BROWSABLE", "DEFAULT"],
      },
    ],
  },
  web: {
    favicon: "./assets/favicon.png",
  },
  plugins: [
    ["expo-notifications", { color: "#F97316" }],
    "expo-updates",
  ],
  extra: {
    API_URL: process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8080",
    APP_ENV: process.env.APP_ENV ?? "development",
    EAS_PROJECT_ID: process.env.EAS_PROJECT_ID,
    eas: {
      projectId: "064926fc-5882-4b6e-9b63-aed6d92b42d8",
    },
  },
  hooks: {
    postPublish: [],
  },
});
