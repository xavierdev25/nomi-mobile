import React, { ReactNode, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";
import { Colors, Radius, Spacing } from "@/theme/tokens";
import { TextStyles, foodvFonts } from "@/theme/typography";

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
  helper?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  onRightPress?: () => void;
}

export const Input = ({
  label,
  error,
  helper,
  leftIcon,
  rightIcon,
  onRightPress,
  onFocus,
  onBlur,
  value,
  style,
  ...props
}: InputProps) => {
  const [focused, setFocused] = useState(false);
  const active = focused || Boolean(value);

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.container,
          {
            borderColor: error ? Colors.error : focused ? Colors.orange[500] : Colors.gray[200],
            backgroundColor: Colors.white,
          },
        ]}
      >
        {leftIcon ? <View style={styles.icon}>{leftIcon}</View> : null}
        <View style={styles.inputBlock}>
          <View style={{ transform: [{ translateY: active ? 0 : 10 }] }}>
            <Text style={[TextStyles.label, focused && styles.labelFocused]}>{label}</Text>
          </View>
          <TextInput
            {...props}
            value={value}
            style={[styles.input, style]}
            placeholderTextColor={Colors.gray[400]}
            onFocus={(event) => {
              setFocused(true);
              onFocus?.(event);
            }}
            onBlur={(event) => {
              setFocused(false);
              onBlur?.(event);
            }}
          />
        </View>
        {rightIcon ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${label} action`}
            hitSlop={8}
            onPress={onRightPress}
            style={styles.icon}
          >
            {rightIcon}
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {!error && helper ? <Text style={styles.helperText}>{helper}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    gap: Spacing[1],
  },
  container: {
    minHeight: 60,
    borderWidth: 1.5,
    borderRadius: Radius.lg,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing[3],
  },
  icon: {
    minWidth: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  inputBlock: {
    flex: 1,
    justifyContent: "center",
  },
  labelFocused: {
    color: Colors.orange[500],
  },
  input: {
    minHeight: 28,
    padding: 0,
    color: Colors.blue[900],
    fontFamily: foodvFonts.dmSansMedium,
    fontSize: 15,
  },
  errorText: {
    ...TextStyles.label,
    color: Colors.error,
  },
  helperText: {
    ...TextStyles.label,
    color: Colors.gray[400],
  },
});
