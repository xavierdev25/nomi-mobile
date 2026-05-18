import { Colors, Duration, Easing, Radius, Shadow, Spacing } from "@/theme/tokens";
import { TextStyles } from "@/theme/typography";

export const Theme = {
  Colors,
  Spacing,
  Radius,
  Shadow,
  Duration,
  Easing,
  TextStyles,
} as const;

export { Colors, Duration, Easing, Radius, Shadow, Spacing, TextStyles };
