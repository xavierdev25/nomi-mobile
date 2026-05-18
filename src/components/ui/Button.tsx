import React, { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { Colors, Radius, Shadow, Spacing } from "@/theme/tokens";
import { TextStyles } from "@/theme/typography";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "outline" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends Omit<PressableProps, "style"> {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  style?: ViewStyle;
}

const getVariantStyle = (variant: ButtonVariant): ViewStyle => {
  switch (variant) {
    case "secondary":
      return styles.secondary;
    case "ghost":
      return styles.ghost;
    case "outline":
      return styles.outline;
    case "danger":
      return styles.danger;
    case "primary":
    default:
      return styles.primary;
  }
};

const getLabelColor = (variant: ButtonVariant) => {
  if (variant === "primary" || variant === "danger") return Colors.white;
  if (variant === "secondary" || variant === "outline" || variant === "ghost") return Colors.orange[500];
  return Colors.white;
};

export const Button = ({
  label,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  style,
  onPressIn,
  onPressOut,
  ...props
}: ButtonProps) => {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      {...props}
      accessibilityRole="button"
      disabled={isDisabled}
      onPressIn={(event) => {
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        onPressOut?.(event);
      }}
    >
      <View
        style={[
          styles.base,
          styles[size],
          getVariantStyle(variant),
          fullWidth && styles.fullWidth,
          variant === "primary" && Shadow.orange,
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={getLabelColor(variant)} />
        ) : (
          <View style={styles.content}>
            {leftIcon}
            <Text style={[TextStyles.button, { color: getLabelColor(variant) }]} numberOfLines={1}>
              {label}
            </Text>
            {rightIcon}
          </View>
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.orange[500],
  },
  sm: {
    minHeight: 40,
    paddingHorizontal: Spacing[4],
  },
  md: {
    minHeight: 50,
    paddingHorizontal: Spacing[5],
  },
  lg: {
    minHeight: 56,
    paddingHorizontal: Spacing[6],
  },
  primary: {
    backgroundColor: Colors.orange[500],
  },
  secondary: {
    backgroundColor: Colors.white,
  },
  ghost: {
    backgroundColor: "transparent",
    borderColor: "transparent",
  },
  outline: {
    backgroundColor: Colors.white,
  },
  danger: {
    backgroundColor: Colors.error,
    borderColor: Colors.error,
  },
  fullWidth: {
    width: "100%",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing[2],
  },
});
