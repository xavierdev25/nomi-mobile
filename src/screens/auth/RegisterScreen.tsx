import React, { useCallback, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { authApi } from "@/api";
import { Button, Input, Tag } from "@/components/ui";
import { AuthStackParamList } from "@/navigation/types";
import { useAuthStore } from "@/store";
import { Colors, Radius, Spacing } from "@/theme/tokens";
import { TextStyles } from "@/theme/typography";

type RegisterScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, "Register">;
};

type RegisterRole = "ESTUDIANTE" | "COMERCIO";
type BudgetRange = "BAJO" | "MEDIO" | "ALTO";

interface RegisterForm {
  nombres: string;
  apellidos: string;
  email: string;
  password: string;
  telefono: string;
  role: RegisterRole;
  preferences: string[];
  restrictions: string[];
  budgetRange: BudgetRange;
  cuisineTypes: string[];
}

const ROLE_OPTIONS: { value: RegisterRole; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: "ESTUDIANTE", label: "Estudiante", icon: "school-outline" },
  { value: "COMERCIO", label: "Comercio", icon: "storefront-outline" },
];

const BUDGET_OPTIONS: { value: BudgetRange; label: string }[] = [
  { value: "BAJO", label: "< S/ 5" },
  { value: "MEDIO", label: "S/ 5-15" },
  { value: "ALTO", label: "> S/ 15" },
];

const initialForm: RegisterForm = {
  nombres: "",
  apellidos: "",
  email: "",
  password: "",
  telefono: "",
  role: "ESTUDIANTE",
  preferences: [],
  restrictions: [],
  budgetRange: "MEDIO",
  cuisineTypes: [],
};

export const RegisterScreen = ({ navigation }: RegisterScreenProps) => {
  const insets = useSafeAreaInsets();
  const [form, setForm] = useState<RegisterForm>(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [shakeKey, setShakeKey] = useState(0);
  const { setAuth } = useAuthStore();

  const updateForm = useCallback(<K extends keyof RegisterForm>(key: K, value: RegisterForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const validate = useCallback((): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (!form.nombres.trim()) errs.nombres = "Ingresa tus nombres.";
    if (!form.apellidos.trim()) errs.apellidos = "Ingresa tus apellidos.";
    if (!form.email.trim()) errs.email = "Ingresa tu correo institucional.";
    if (form.email.trim() && !form.email.includes("@")) errs.email = "El correo no es válido.";
    if (form.password.length < 8) errs.password = "Mínimo 8 caracteres.";
    return errs;
  }, [form]);

  const handleRegister = useCallback(async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      setShakeKey((prev) => prev + 1);
      return;
    }

    setLoading(true);
    setErrors({});
    try {
      await authApi.register(form);
      const authResponse = await authApi.login({ email: form.email.trim(), password: form.password });
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
        "data" in error.response
          ? "No pudimos crear tu cuenta. Revisa los datos."
          : "Error inesperado. Intenta de nuevo.";
      setErrors({ global: message });
      setShakeKey((prev) => prev + 1);
    } finally {
      setLoading(false);
    }
  }, [form, setAuth, validate]);

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.blue[500]} />
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={[styles.header, { paddingTop: insets.top + Spacing[4] }]}>
          <View style={styles.orangeBlock} />
          <Pressable accessibilityRole="button" accessibilityLabel="Volver" onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={22} color={Colors.white} />
          </Pressable>
          <View>
            <Text style={styles.title}>Crear cuenta</Text>
            <Text style={styles.subtitle}>Únete a FoodV hoy</Text>
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

          <View style={styles.roleContainer}>
            {ROLE_OPTIONS.map((option) => (
              <Tag
                key={option.value}
                label={option.label}
                selected={form.role === option.value}
                icon={<Ionicons name={option.icon} size={16} color={form.role === option.value ? Colors.white : Colors.gray[600]} />}
                onPress={() => updateForm("role", option.value)}
              />
            ))}
          </View>

          <View style={styles.row}>
            <View style={styles.flex}>
              <Input label="Nombres" value={form.nombres} onChangeText={(value) => updateForm("nombres", value)} error={errors.nombres} returnKeyType="next" />
            </View>
            <View style={styles.flex}>
              <Input label="Apellidos" value={form.apellidos} onChangeText={(value) => updateForm("apellidos", value)} error={errors.apellidos} returnKeyType="next" />
            </View>
          </View>

          <View>
            <Input label="Correo electrónico" value={form.email} onChangeText={(value) => updateForm("email", value)} error={errors.email} leftIcon={<Ionicons name="mail-outline" size={18} color={Colors.gray[400]} />} keyboardType="email-address" autoCapitalize="none" returnKeyType="next" />
          </View>

          <View>
            <Input label="Contraseña" value={form.password} onChangeText={(value) => updateForm("password", value)} error={errors.password} helper="Mínimo 8 caracteres." leftIcon={<Ionicons name="lock-closed-outline" size={18} color={Colors.gray[400]} />} rightIcon={<Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={18} color={Colors.gray[400]} />} onRightPress={() => setShowPassword((prev) => !prev)} secureTextEntry={!showPassword} returnKeyType="next" />
          </View>

          <View>
            <Input label="Teléfono" value={form.telefono} onChangeText={(value) => updateForm("telefono", value)} leftIcon={<Ionicons name="call-outline" size={18} color={Colors.gray[400]} />} keyboardType="phone-pad" />
          </View>

          {form.role === "ESTUDIANTE" ? (
            <View style={styles.budgetBlock}>
              <Text style={styles.sectionLabel}>Presupuesto por comida</Text>
              <View style={styles.roleContainer}>
                {BUDGET_OPTIONS.map((option) => (
                  <Tag key={option.value} label={option.label} selected={form.budgetRange === option.value} onPress={() => updateForm("budgetRange", option.value)} />
                ))}
              </View>
            </View>
          ) : null}

          <View>
            <Button label="Crear cuenta" fullWidth loading={loading} onPress={handleRegister} />
          </View>

          <Pressable accessibilityRole="button" onPress={() => navigation.navigate("Login")} style={styles.loginLink}>
            <Text style={styles.loginText}>¿Ya tienes cuenta? <Text style={styles.loginTextStrong}>Inicia sesión</Text></Text>
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
    width: 150,
    height: 170,
    borderRadius: Radius["2xl"],
    backgroundColor: Colors.orange[500],
    right: -48,
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
  roleContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing[2],
  },
  row: {
    flexDirection: "row",
    gap: Spacing[3],
  },
  flex: {
    flex: 1,
  },
  budgetBlock: {
    gap: Spacing[2],
  },
  sectionLabel: {
    ...TextStyles.label,
    color: Colors.blue[900],
  },
  loginLink: {
    alignSelf: "center",
    padding: Spacing[2],
  },
  loginText: {
    ...TextStyles.body,
    color: Colors.gray[600],
  },
  loginTextStrong: {
    color: Colors.orange[500],
    fontWeight: "700",
  },
});
