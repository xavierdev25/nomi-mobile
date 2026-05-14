import React, { useCallback, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  Pressable,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { authApi } from "@/api";
import { Button, Input } from "@/components/ui";
import { AuthStackParamList } from "@/navigation/types";
import { useAuthStore } from "@/store";
import { Colors, Radius, Spacing } from "@/theme/tokens";
import { TextStyles } from "@/theme/typography";

type LoginScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, "Login">;
};

export const LoginScreen = ({ navigation }: LoginScreenProps) => {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [shakeKey, setShakeKey] = useState(0);
  const { setAuth } = useAuthStore();

  const validate = useCallback((): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (!email.trim()) errs.email = "Ingresa tu correo institucional.";
    if (email.trim() && !email.includes("@")) errs.email = "El correo no es válido.";
    if (!password.trim()) errs.password = "Ingresa tu contraseña.";
    if (password.trim() && password.length < 8) errs.password = "Mínimo 8 caracteres.";
    return errs;
  }, [email, password]);

  const handleLogin = useCallback(async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      setShakeKey((prev) => prev + 1);
      return;
    }

    setLoading(true);
    setErrors({});
    try {
      const authResponse = await authApi.login({ email: email.trim(), password });
      await SecureStore.setItemAsync("accessToken", authResponse.accessToken);
      await SecureStore.setItemAsync("refreshToken", authResponse.refreshToken);
      const user = await authApi.me();
      await setAuth(user, authResponse.accessToken, authResponse.refreshToken);
    } catch (error: unknown) {
      const message =
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof error.response === "object" &&
        error.response !== null &&
        "data" in error.response &&
        typeof error.response.data === "object" &&
        error.response.data !== null &&
        "message" in error.response.data &&
        typeof error.response.data.message === "string"
          ? error.response.data.message
          : "Credenciales inválidas. Intenta de nuevo.";
      setErrors({ global: message });
      setShakeKey((prev) => prev + 1);
    } finally {
      setLoading(false);
    }
  }, [email, password, setAuth, validate]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor={Colors.blue[500]} />
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={[styles.header, { paddingTop: insets.top + Spacing[4] }]}>
          <View style={styles.orangeBlock} />
          <Pressable accessibilityRole="button" accessibilityLabel="Volver" onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={22} color={Colors.white} />
          </Pressable>
          <View>
            <Text style={styles.title}>Bienvenido</Text>
            <Text style={styles.subtitle}>Ingresa a tu cuenta FoodV</Text>
          </View>
        </View>

        <View style={styles.form}>
          {errors.global ? (
            <View
              key={`error-${shakeKey}`}
              style={styles.errorBox}
            >
              <Ionicons name="alert-circle" size={16} color={Colors.error} />
              <Text style={styles.errorText}>{errors.global}</Text>
            </View>
          ) : null}

          <View>
            <Input
              label="Correo electrónico"
              value={email}
              onChangeText={setEmail}
              error={errors.email}
              leftIcon={<Ionicons name="mail-outline" size={18} color={Colors.gray[400]} />}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              returnKeyType="next"
            />
          </View>

          <View>
            <Input
              label="Contraseña"
              value={password}
              onChangeText={setPassword}
              error={errors.password}
              leftIcon={<Ionicons name="lock-closed-outline" size={18} color={Colors.gray[400]} />}
              rightIcon={<Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={18} color={Colors.gray[400]} />}
              onRightPress={() => setShowPassword((prev) => !prev)}
              secureTextEntry={!showPassword}
              autoComplete="password"
              returnKeyType="done"
            />
          </View>

          <View>
            <Button label="Iniciar sesión" fullWidth loading={loading} onPress={handleLogin} />
          </View>

          <Pressable accessibilityRole="button" onPress={() => navigation.navigate("Register")} style={styles.registerLink}>
            <Text style={styles.registerText}>¿No tienes cuenta? <Text style={styles.registerTextStrong}>Regístrate</Text></Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: Colors.blue[500],
    paddingBottom: Spacing[10],
    paddingHorizontal: Spacing[6],
    overflow: "hidden",
  },
  orangeBlock: {
    position: "absolute",
    width: 140,
    height: 160,
    borderRadius: Radius["2xl"],
    backgroundColor: Colors.orange[500],
    right: -44,
    top: 40,
    transform: [{ rotate: "18deg" }],
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: Radius.full,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing[5],
  },
  title: {
    ...TextStyles.h1,
    color: Colors.white,
  },
  subtitle: {
    ...TextStyles.body,
    color: Colors.white,
    marginTop: Spacing[1],
  },
  form: {
    flex: 1,
    backgroundColor: Colors.white,
    borderTopLeftRadius: Radius["2xl"],
    borderTopRightRadius: Radius["2xl"],
    padding: Spacing[6],
    marginTop: -Spacing[6],
    gap: Spacing[4],
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing[2],
    backgroundColor: Colors.errorSoft,
    borderWidth: 1,
    borderColor: Colors.error,
    borderRadius: Radius.lg,
    padding: Spacing[3],
  },
  errorText: {
    ...TextStyles.label,
    color: Colors.error,
    flex: 1,
  },
  registerLink: {
    alignSelf: "center",
    padding: Spacing[2],
  },
  registerText: {
    ...TextStyles.body,
    color: Colors.gray[600],
  },
  registerTextStrong: {
    color: Colors.orange[500],
    fontWeight: "700",
  },
});
