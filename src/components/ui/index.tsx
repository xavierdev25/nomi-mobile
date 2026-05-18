import React, { ReactNode } from "react";
import {
  Image,
  Pressable,
  PressableProps,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { Colors, Radius, Shadow, Spacing } from "@/theme/tokens";
import { TextStyles } from "@/theme/typography";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type CardVariant = "default" | "elevated" | "outlined" | "flat";
type BadgeVariant = "orange" | "blue" | "success" | "warning" | "error" | "gray";

interface CardProps extends Omit<PressableProps, "style"> {
  variant?: CardVariant;
  padding?: keyof typeof Spacing;
  children: ReactNode;
  style?: ViewStyle;
}

const badgeColors: Record<BadgeVariant, { bg: string; fg: string }> = {
  orange: { bg: Colors.orange[500], fg: Colors.white },
  blue: { bg: Colors.blue[500], fg: Colors.white },
  success: { bg: Colors.successSoft, fg: Colors.success },
  warning: { bg: Colors.warningSoft, fg: Colors.warning },
  error: { bg: Colors.errorSoft, fg: Colors.error },
  gray: { bg: Colors.gray[100], fg: Colors.gray[600] },
};

export const Card = ({
  variant = "default",
  padding = 4,
  children,
  onPress,
  style,
  ...props
}: CardProps) => {
  const content = (
    <View
      style={[
        styles.card,
        styles[variant],
        { padding: Spacing[padding] },
        style,
      ]}
    >
      {children}
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable
      {...props}
      accessibilityRole="button"
      onPress={onPress}
    >
      {content}
    </Pressable>
  );
};

export const Badge = ({ label, variant = "orange" }: { label: string; variant?: BadgeVariant }) => {
  const colors = badgeColors[variant];
  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }]}>
      <Text style={[styles.badgeText, { color: colors.fg }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
};

export const Tag = ({
  label,
  selected = false,
  onPress,
  icon,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: ReactNode;
}) => (
  <Pressable accessibilityRole="button" onPress={onPress}>
    <View
      style={[styles.tag, selected && styles.tagSelected]}
    >
      {icon}
      <Text style={[styles.tagText, selected && styles.tagTextSelected]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  </Pressable>
);

export const Avatar = ({ name, size = 44, uri }: { name: string; size?: number; uri?: string }) => {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
      {uri ? (
        <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2 }} />
      ) : (
        <Text style={[styles.avatarText, { fontSize: Math.max(12, size * 0.36) }]}>{initials}</Text>
      )}
    </View>
  );
};

export const Divider = () => <View style={styles.divider} />;

export { Button, Input };
export { SummaryRow } from './SummaryRow';
export { CartHeaderButton } from './CartHeaderButton';
export { ProductCard } from './ProductCard';
export { StoreCard } from './StoreCard';

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.xl,
    backgroundColor: Colors.white,
  },
  default: {
    ...Shadow.sm,
  },
  elevated: {
    ...Shadow.md,
  },
  outlined: {
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  flat: {
    ...Shadow.none,
  },
  badge: {
    alignSelf: "flex-start",
    borderRadius: Radius.full,
    paddingHorizontal: Spacing[2],
    paddingVertical: Spacing[1],
  },
  badgeText: {
    ...TextStyles.label,
  },
  tag: {
    minHeight: 36,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing[1],
    borderRadius: Radius.full,
    paddingHorizontal: Spacing[3],
    borderWidth: 1,
    borderColor: Colors.gray[200],
    backgroundColor: Colors.white,
  },
  tagSelected: {
    borderColor: Colors.orange[500],
    backgroundColor: Colors.orange[500],
  },
  tagText: {
    ...TextStyles.label,
    color: Colors.gray[600],
  },
  tagTextSelected: {
    color: Colors.white,
  },
  avatar: {
    overflow: "hidden",
    backgroundColor: Colors.orange[500],
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    ...TextStyles.bodyStrong,
    color: Colors.white,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.gray[200],
  },
});
