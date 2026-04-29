import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { authApi } from '../../api';
import { useAuthStore } from '../../store';
import * as SecureStore from 'expo-secure-store';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Register'>;
};

export const RegisterScreen = ({ navigation }: Props) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();

  const [form, setForm] = useState({
    nombres: '',
    apellidos: '',
    email: '',
    password: '',
    telefono: '',
    role: 'ESTUDIANTE',
    preferences: [] as string[],
    restrictions: [] as string[],
    budgetRange: 'MEDIO',
    cuisineTypes: [] as string[],
  });

  const updateForm = (key: string, value: any) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleRegister = async () => {
  if (!form.nombres || !form.apellidos || !form.email || !form.password) {
    Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
    return;
  }

  setLoading(true);
  try {
    await authApi.register(form);
    const authResponse = await authApi.login({ email: form.email, password: form.password });

    // Guardar tokens ANTES de llamar a /users/me
    await SecureStore.setItemAsync('accessToken', authResponse.accessToken);
    await SecureStore.setItemAsync('refreshToken', authResponse.refreshToken);

    const user = await authApi.me();
    await setAuth(user, authResponse.accessToken, authResponse.refreshToken);
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.response?.data?.fields
      ? Object.values(error?.response?.data?.fields || {}).join(', ')
      : 'Error al registrarse';
    Alert.alert('Error', typeof message === 'string' ? message : 'Error al registrarse');
  } finally {
    setLoading(false);
  }
};

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Crear cuenta</Text>
          <Text style={styles.subtitle}>Únete a FoodV hoy</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>

          {/* Role selector */}
          <View style={styles.roleContainer}>
            {(['ESTUDIANTE', 'COMERCIO'] as const).map((role) => (
              <TouchableOpacity
                key={role}
                style={[styles.roleButton, form.role === role && styles.roleButtonActive]}
                onPress={() => updateForm('role', role)}
              >
                <Text style={[styles.roleText, form.role === role && styles.roleTextActive]}>
                  {role === 'ESTUDIANTE' ? '🎓 Estudiante' : '🏪 Comercio'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Nombres *</Text>
              <TextInput
                style={styles.input}
                placeholder="Xavier"
                value={form.nombres}
                onChangeText={(v) => updateForm('nombres', v)}
                placeholderTextColor="#9CA3AF"
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Apellidos *</Text>
              <TextInput
                style={styles.input}
                placeholder="Montaño"
                value={form.apellidos}
                onChangeText={(v) => updateForm('apellidos', v)}
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Correo electrónico *</Text>
            <TextInput
              style={styles.input}
              placeholder="tu@email.com"
              value={form.email}
              onChangeText={(v) => updateForm('email', v)}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contraseña *</Text>
            <TextInput
              style={styles.input}
              placeholder="Mínimo 8 caracteres, mayúscula y número"
              value={form.password}
              onChangeText={(v) => updateForm('password', v)}
              secureTextEntry
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Teléfono</Text>
            <TextInput
              style={styles.input}
              placeholder="999 999 999"
              value={form.telefono}
              onChangeText={(v) => updateForm('telefono', v)}
              keyboardType="phone-pad"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Budget range */}
          {form.role === 'ESTUDIANTE' && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Presupuesto por comida</Text>
              <View style={styles.budgetContainer}>
                {([
                  { value: 'BAJO', label: '< S/. 5' },
                  { value: 'MEDIO', label: 'S/. 5-15' },
                  { value: 'ALTO', label: '> S/. 15' },
                ] as const).map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[styles.budgetButton, form.budgetRange === option.value && styles.budgetButtonActive]}
                    onPress={() => updateForm('budgetRange', option.value)}
                  >
                    <Text style={[styles.budgetText, form.budgetRange === option.value && styles.budgetTextActive]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <TouchableOpacity
            style={[styles.registerButton, loading && styles.registerButtonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.registerButtonText}>Crear cuenta</Text>
            )}
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>¿Ya tienes cuenta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Inicia sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { flexGrow: 1 },
  header: {
    backgroundColor: '#F97316',
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  backButton: { marginBottom: 16 },
  backText: { fontSize: 24, color: '#FFFFFF' },
  title: { fontSize: 32, fontWeight: '800', color: '#FFFFFF' },
  subtitle: { fontSize: 15, color: 'rgba(255,255,255,0.85)', marginTop: 4 },
  form: { flex: 1, padding: 24, gap: 16 },
  roleContainer: { flexDirection: 'row', gap: 12 },
  roleButton: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  roleButtonActive: { borderColor: '#F97316', backgroundColor: '#FFF7ED' },
  roleText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  roleTextActive: { color: '#F97316' },
  row: { flexDirection: 'row', gap: 12 },
  inputGroup: { gap: 6 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151' },
  input: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#1F2937',
    backgroundColor: '#F9FAFB',
  },
  budgetContainer: { flexDirection: 'row', gap: 8 },
  budgetButton: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  budgetButtonActive: { borderColor: '#F97316', backgroundColor: '#FFF7ED' },
  budgetText: { fontSize: 12, fontWeight: '600', color: '#6B7280' },
  budgetTextActive: { color: '#F97316' },
  registerButton: {
    backgroundColor: '#F97316',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  registerButtonDisabled: { opacity: 0.7 },
  registerButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  loginContainer: { flexDirection: 'row', justifyContent: 'center' },
  loginText: { color: '#6B7280', fontSize: 14 },
  loginLink: { color: '#F97316', fontSize: 14, fontWeight: '700' },
});