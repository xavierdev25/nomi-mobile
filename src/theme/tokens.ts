import { ViewStyle } from "react-native";

export const Colors = {
  orange: {
    400: "#FFA726",
    500: "#FF6B00",
    600: "#E56000",
  },
  blue: {
    400: "#3B72BB",
    500: "#003087",
    600: "#002B78",
    900: "#001540",
  },
  gray: {
    100: "#F0F2F5",
    200: "#E2E6EC",
    300: "#D1D5DB",
    400: "#9AA3B2",
    600: "#4D5668",
  },
  white: "#FFFFFF",
  offWhite: "#F5F7FA",
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  errorSoft: "#FEF2F2",
  successSoft: "#F0FDF4",
  warningSoft: "#FFFBEB",
} as const;

export const Spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;

export const Radius = {
  xs: 6,
  sm: 8,
  md: 10,
  lg: 12,
  xl: 16,
  "2xl": 24,
  full: 999,
} as const;

export const Shadow = {
  none: {
    shadowOpacity: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: Colors.blue[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: Colors.blue[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  orange: {
    shadowColor: Colors.orange[500],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.24,
    shadowRadius: 14,
    elevation: 5,
  },
} satisfies Record<string, ViewStyle>;

export const Duration = {
  fast: 160,
  base: 200,
  slow: 300,
} as const;

export const Easing = {
  spring: {
    type: "spring",
    damping: 18,
    stiffness: 200,
  },
  press: {
    type: "spring",
    damping: 20,
    stiffness: 300,
  },
  sheet: {
    type: "spring",
    damping: 22,
    stiffness: 250,
  },
} as const;
