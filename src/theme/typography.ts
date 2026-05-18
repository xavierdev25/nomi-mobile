import { StyleSheet, TextStyle } from "react-native";
import {
  useFonts as useSyneFonts,
  Syne_600SemiBold,
  Syne_700Bold,
  Syne_800ExtraBold,
} from "@expo-google-fonts/syne";
import {
  useFonts as useDMSansFonts,
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
} from "@expo-google-fonts/dm-sans";
import {
  useFonts as useJetBrainsFonts,
  JetBrainsMono_400Regular,
  JetBrainsMono_700Bold,
} from "@expo-google-fonts/jetbrains-mono";
import { Colors } from "@/theme/tokens";

export const foodvFonts = {
  syneSemiBold: "Syne_600SemiBold",
  syneBold: "Syne_700Bold",
  syneExtraBold: "Syne_800ExtraBold",
  dmSansRegular: "DMSans_400Regular",
  dmSansMedium: "DMSans_500Medium",
  dmSansBold: "DMSans_700Bold",
  jetBrainsRegular: "JetBrainsMono_400Regular",
  jetBrainsBold: "JetBrainsMono_700Bold",
} as const;

export const useFoodVFonts = () => {
  const [syneLoaded] = useSyneFonts({
    Syne_600SemiBold,
    Syne_700Bold,
    Syne_800ExtraBold,
  });
  const [dmSansLoaded] = useDMSansFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
  });
  const [jetBrainsLoaded] = useJetBrainsFonts({
    JetBrainsMono_400Regular,
    JetBrainsMono_700Bold,
  });

  return syneLoaded && dmSansLoaded && jetBrainsLoaded;
};

export const TextStyles = StyleSheet.create({
  display: {
    fontFamily: foodvFonts.syneExtraBold,
    fontSize: 40,
    lineHeight: 46,
    color: Colors.blue[900],
  },
  h1: {
    fontFamily: foodvFonts.syneExtraBold,
    fontSize: 32,
    lineHeight: 38,
    color: Colors.blue[900],
  },
  h2: {
    fontFamily: foodvFonts.syneBold,
    fontSize: 24,
    lineHeight: 30,
    color: Colors.blue[900],
  },
  h3: {
    fontFamily: foodvFonts.syneBold,
    fontSize: 18,
    lineHeight: 24,
    color: Colors.blue[900],
  },
  body: {
    fontFamily: foodvFonts.dmSansRegular,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.gray[600],
  },
  bodyStrong: {
    fontFamily: foodvFonts.dmSansBold,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.blue[900],
  },
  label: {
    fontFamily: foodvFonts.dmSansBold,
    fontSize: 12,
    lineHeight: 16,
    color: Colors.gray[600],
  },
  button: {
    fontFamily: foodvFonts.dmSansBold,
    fontSize: 15,
    lineHeight: 20,
    color: Colors.white,
  },
  price: {
    fontFamily: foodvFonts.jetBrainsBold,
    fontSize: 16,
    lineHeight: 22,
    color: Colors.orange[500],
  },
}) satisfies Record<string, TextStyle>;
