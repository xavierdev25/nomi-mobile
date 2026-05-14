import React, { useState } from "react";
import { Colors } from "@/theme/tokens";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../store/authStore";
import { authApi } from "../../api";
import { favoritesApi } from "../../api";
import { useQuery } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { StudentStackParamList } from "../../navigation/types";

const ROLE_LABEL: Record<string, string> = {
  ESTUDIANTE: "Estudiante",
  REPARTIDOR: "Repartidor",
  COMERCIO: "Comercio",
  ADMIN: "Administrador",
};

const InfoRow = ({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) => (
  <View style={styles.infoRow}>
    <View style={styles.infoIcon}>
      <Ionicons name={icon} size={18} color={Colors.orange[500]} />
    </View>
    <View style={styles.infoText}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  </View>
);

export const ProfileScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<StudentStackParamList>>();
  const user = useAuthStore((state) => state.user);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const [loggingOut, setLoggingOut] = useState(false);

  const { data: favoriteProducts = [] } = useQuery({
    queryKey: ["favorites", "products"],
    queryFn: favoritesApi.getProducts,
  });

  const { data: favoriteStores = [] } = useQuery({
    queryKey: ["favorites", "stores"],
    queryFn: favoritesApi.getStores,
  });

  if (!user) return null;

  const handleLogout = () => {
    Alert.alert(
      "Cerrar sesión",
      "¿Estás seguro de que quieres cerrar sesión?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Cerrar sesión",
          style: "destructive",
          onPress: async () => {
            setLoggingOut(true);
            try {
              if (refreshToken) await authApi.logout(refreshToken);
            } catch {
              /* ignorar errores de red al hacer logout */
            } finally {
              await clearAuth();
            }
          },
        },
      ],
    );
  };

  if (!user) return null;

  const fullName = `${user.nombres} ${user.apellidos}`;
  const initials = `${user.nombres[0]}${user.apellidos[0]}`.toUpperCase();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mi perfil</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.fullName}>{fullName}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>
              {ROLE_LABEL[user.role] ?? user.role}
            </Text>
          </View>
        </View>

        {/* Info */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Información personal</Text>
          <InfoRow icon="mail-outline" label="Correo" value={user.email} />
          {user.telefono ? (
            <InfoRow
              icon="call-outline"
              label="Teléfono"
              value={user.telefono}
            />
          ) : null}
          <InfoRow
            icon="shield-checkmark-outline"
            label="Estado"
            value={user.activo ? "Cuenta activa" : "Cuenta inactiva"}
          />
          <InfoRow
            icon="calendar-outline"
            label="Miembro desde"
            value={new Date(user.creadoEn).toLocaleDateString("es-PE", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          />
        </View>

        {/* Preferencias */}
        {user.preferences?.length || user.restrictions?.length ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Preferencias</Text>
            {user.preferences?.length ? (
              <View style={styles.tagsRow}>
                {user.preferences.map((p) => (
                  <View key={p} style={styles.tag}>
                    <Text style={styles.tagText}>{p}</Text>
                  </View>
                ))}
              </View>
            ) : null}
            {user.restrictions?.length ? (
              <>
                <Text style={styles.restrictionsLabel}>Restricciones</Text>
                <View style={styles.tagsRow}>
                  {user.restrictions.map((r) => (
                    <View key={r} style={[styles.tag, styles.tagRed]}>
                      <Text style={[styles.tagText, styles.tagTextRed]}>
                        {r}
                      </Text>
                    </View>
                  ))}
                </View>
              </>
            ) : null}
          </View>
        ) : null}

        {/* Favoritos */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Mis favoritos</Text>

          <TouchableOpacity
            style={styles.favRow}
            onPress={() => navigation.navigate("FavoriteProducts")}
          >
            <View style={styles.favIconContainer}>
              <Ionicons name="heart" size={20} color={Colors.error} />
            </View>
            <View style={styles.favInfo}>
              <Text style={styles.favLabel}>Productos favoritos</Text>
              <Text style={styles.favCount}>
                {favoriteProducts.length} guardados
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.gray[300]} />
          </TouchableOpacity>

          <View style={styles.favDivider} />

          <TouchableOpacity
            style={styles.favRow}
            onPress={() => navigation.navigate("FavoriteStores")}
          >
            <View style={styles.favIconContainer}>
              <Ionicons name="storefront" size={20} color={Colors.orange[500]} />
            </View>
            <View style={styles.favInfo}>
              <Text style={styles.favLabel}>Tiendas favoritas</Text>
              <Text style={styles.favCount}>
                {favoriteStores.length} guardadas
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.gray[300]} />
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          disabled={loggingOut}
        >
          {loggingOut ? (
            <ActivityIndicator color={Colors.error} />
          ) : (
            <>
              <Ionicons name="log-out-outline" size={20} color={Colors.error} />
              <Text style={styles.logoutText}>Cerrar sesión</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.offWhite },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: Colors.blue[500],
  },
  headerTitle: { fontSize: 24, fontWeight: "800", color: Colors.white },
  scrollContent: { padding: 16, gap: 14 },
  avatarSection: { alignItems: "center", paddingVertical: 24 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.orange[500],
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    elevation: 4,
    shadowColor: Colors.orange[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  avatarText: { fontSize: 28, fontWeight: "800", color: Colors.white },
  fullName: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.blue[900],
    marginBottom: 8,
  },
  roleBadge: {
    backgroundColor: Colors.gray[100],
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: Colors.orange[400],
  },
  roleText: { fontSize: 13, fontWeight: "700", color: Colors.orange[500] },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: Colors.blue[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.blue[900],
    marginBottom: 14,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    gap: 12,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.gray[100],
    justifyContent: "center",
    alignItems: "center",
  },
  infoText: { flex: 1 },
  infoLabel: {
    fontSize: 11,
    color: Colors.gray[400],
    fontWeight: "600",
    marginBottom: 2,
  },
  infoValue: { fontSize: 14, color: Colors.blue[900], fontWeight: "600" },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag: {
    backgroundColor: Colors.gray[100],
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  tagText: { fontSize: 12, color: Colors.blue[400], fontWeight: "600" },
  tagRed: { backgroundColor: Colors.errorSoft },
  tagTextRed: { color: Colors.error },
  restrictionsLabel: {
    fontSize: 13,
    color: Colors.gray[600],
    fontWeight: "600",
    marginTop: 10,
    marginBottom: 8,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1.5,
    borderColor: Colors.error,
    borderRadius: 14,
    paddingVertical: 14,
    marginBottom: 8,
    backgroundColor: Colors.white,
  },
  logoutText: { fontSize: 15, fontWeight: "700", color: Colors.error },
  favRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 4,
  },
  favIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.offWhite,
    justifyContent: "center",
    alignItems: "center",
  },
  favInfo: { flex: 1 },
  favLabel: { fontSize: 14, fontWeight: "700", color: Colors.blue[900] },
  favCount: { fontSize: 12, color: Colors.gray[600], marginTop: 2 },
  favDivider: { height: 1, backgroundColor: Colors.gray[200], marginVertical: 12 },
});
