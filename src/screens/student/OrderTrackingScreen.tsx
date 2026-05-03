import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { StudentStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<StudentStackParamList, "OrderTracking">;

export const OrderTrackingScreen = ({ navigation, route }: Props) => {
  const { orderId } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate("StudentTabs")}
        >
          <Ionicons name="home-outline" size={22} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Estado del pedido</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="checkmark-circle" size={80} color="#22C55E" />
        </View>
        <Text style={styles.title}>¡Pedido confirmado!</Text>
        <Text style={styles.subtitle}>Tu pedido #{orderId} fue recibido.</Text>
        <Text style={styles.description}>
          El pago está siendo procesado. Te notificaremos cuando el comercio
          confirme tu pedido.
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("StudentTabs")}
        >
          <Text style={styles.buttonText}>Volver al inicio</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
  },
  headerTitle: { color: "#1F2937", fontSize: 20, fontWeight: "800" },
  headerSpacer: { width: 40 },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  iconContainer: { marginBottom: 24 },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
  },
  button: {
    backgroundColor: "#F97316",
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: "center",
  },
  buttonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
});
