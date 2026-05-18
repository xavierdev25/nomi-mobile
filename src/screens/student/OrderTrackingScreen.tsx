import React, { useEffect } from "react";
import { Colors } from "@/theme/tokens";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useQuery } from "@tanstack/react-query";
import { StudentStackParamList } from "../../navigation/types";
import { useAuthStore } from "../../store/authStore";
import { useCartStore } from "../../store/cartStore";
import { usePaymentStatus } from "../../hooks/usePaymentStatus";
import { ordersApi } from "../../api";

type Props = NativeStackScreenProps<StudentStackParamList, "OrderTracking">;

const ORDER_STEPS = [
  {
    key: "PENDIENTE",
    label: "Pedido recibido",
    icon: "receipt-outline" as const,
  },
  {
    key: "PREPARANDO",
    label: "En preparación",
    icon: "restaurant-outline" as const,
  },
  {
    key: "LISTO_PARA_RECOGER",
    label: "Listo para recoger",
    icon: "bag-check-outline" as const,
  },
  { key: "EN_CAMINO", label: "En camino", icon: "bicycle-outline" as const },
  {
    key: "ENTREGADO",
    label: "Entregado",
    icon: "checkmark-circle-outline" as const,
  },
];

const getStepIndex = (status: string) =>
  ORDER_STEPS.findIndex((s) => s.key === status);

const ProgressStep = ({
  step,
  index,
  currentIndex,
}: {
  step: (typeof ORDER_STEPS)[0];
  index: number;
  currentIndex: number;
}) => {
  const isCompleted = index < currentIndex;
  const isActive = index === currentIndex;
  const isPending = index > currentIndex;

  const color = isCompleted || isActive ? Colors.orange[500] : Colors.gray[300];
  const textColor = isCompleted || isActive ? Colors.blue[900] : Colors.gray[400];

  return (
    <View style={progressStyles.stepContainer}>
      <View style={progressStyles.stepLeft}>
        <View
          style={[
            progressStyles.stepCircle,
            {
              backgroundColor: isCompleted
                ? Colors.orange[500]
                : isActive
                  ? Colors.gray[100]
                  : Colors.gray[100],
              borderColor: color,
              borderWidth: isActive ? 2 : 0,
            },
          ]}
        >
          {isCompleted ? (
            <Ionicons name="checkmark" size={16} color={Colors.white} />
          ) : (
            <Ionicons
              name={step.icon}
              size={16}
              color={isActive ? Colors.orange[500] : Colors.gray[400]}
            />
          )}
        </View>
        {index < ORDER_STEPS.length - 1 && (
          <View
            style={[
              progressStyles.stepLine,
              { backgroundColor: isCompleted ? Colors.orange[500] : Colors.gray[200] },
            ]}
          />
        )}
      </View>
      <View style={progressStyles.stepContent}>
        <Text
          style={[
            progressStyles.stepLabel,
            { color: textColor, fontWeight: isActive ? "800" : "600" },
          ]}
        >
          {step.label}
        </Text>
        {isActive && (
          <Text style={progressStyles.stepActive}>En progreso...</Text>
        )}
      </View>
    </View>
  );
};

export const OrderTrackingScreen = ({ navigation, route }: Props) => {
  const { orderId } = route.params;
  const user = useAuthStore((state) => state.user);
  const clearCart = useCartStore((state) => state.clearCart);
  const { status: paymentStatus, loading: paymentLoading } = usePaymentStatus(
    orderId,
    user?.id ?? 0,
  );

  useEffect(() => {
    if (paymentStatus === 'APROBADO') {
      clearCart();
    }
  }, [paymentStatus, clearCart]);

  const { data: order } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => ordersApi.getById(orderId),
    refetchInterval: 10000, // refresca cada 10s
    enabled: paymentStatus === "APROBADO",
  });

  const currentStepIndex = getStepIndex(order?.status ?? "PENDIENTE");

  const paymentConfig = {
    PENDIENTE: {
      icon: "time-outline" as const,
      color: Colors.warning,
      title: "Procesando pago...",
      description: "Estamos esperando la confirmación de tu pago.",
    },
    APROBADO: {
      icon: "checkmark-circle" as const,
      color: Colors.success,
      title: "¡Pago confirmado!",
      description: "Tu pedido está siendo procesado.",
    },
    RECHAZADO: {
      icon: "close-circle" as const,
      color: Colors.error,
      title: "Pago rechazado",
      description:
        "Tu pago no pudo ser procesado. Puedes intentarlo nuevamente.",
    },
    CANCELADO: {
      icon: "ban-outline" as const,
      color: Colors.gray[600],
      title: "Pedido cancelado",
      description: "Este pedido fue cancelado.",
    },
  };

  const current = paymentConfig[paymentStatus] ?? paymentConfig.PENDIENTE;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate("StudentTabs")}
        >
          <Ionicons name="home-outline" size={22} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Estado del pedido</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {paymentLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={Colors.orange[500]} />
          </View>
        ) : (
          <>
            {/* Estado del pago */}
            <View style={styles.paymentCard}>
              <View style={styles.iconContainer}>
                {paymentStatus === "PENDIENTE" ? (
                  <ActivityIndicator size={56} color={current.color} />
                ) : (
                  <Ionicons
                    name={current.icon}
                    size={56}
                    color={current.color}
                  />
                )}
              </View>
              <Text style={styles.title}>{current.title}</Text>
              <Text style={styles.subtitle}>Pedido #{orderId}</Text>
              <Text style={styles.description}>{current.description}</Text>

              {/* ETA */}
              {paymentStatus === "APROBADO" &&
                order?.status !== "ENTREGADO" && (
                  <View style={styles.etaBadge}>
                    <Ionicons name="time-outline" size={14} color={Colors.orange[500]} />
                    <Text style={styles.etaText}>
                      Entrega estimada: 15-25 min
                    </Text>
                  </View>
                )}
            </View>

            {/* Progreso del pedido */}
            {paymentStatus === "APROBADO" && (
              <View style={styles.progressCard}>
                <Text style={styles.progressTitle}>Seguimiento del pedido</Text>
                {ORDER_STEPS.filter((s) => s.key !== "CANCELADO").map(
                  (step, index) => (
                    <ProgressStep
                      key={step.key}
                      step={step}
                      index={index}
                      currentIndex={currentStepIndex}
                    />
                  ),
                )}
              </View>
            )}

            {/* Código de confirmación */}
            {order?.codigoConfirmacion && (
              <View style={styles.codeCard}>
                <Text style={styles.codeTitle}>Código de confirmación</Text>
                <Text style={styles.code}>{order.codigoConfirmacion}</Text>
                <Text style={styles.codeHint}>
                  Muestra este código al repartidor
                </Text>
              </View>
            )}
          </>
        )}

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("StudentTabs")}
        >
          <Text style={styles.buttonText}>Volver al inicio</Text>
        </TouchableOpacity>

        {paymentStatus === "APROBADO" && (
          <TouchableOpacity
            style={styles.detailButton}
            onPress={() => navigation.navigate("OrderDetail", { orderId })}
          >
            <Text style={styles.detailButtonText}>Ver detalle del pedido</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const progressStyles = StyleSheet.create({
  stepContainer: { flexDirection: "row", marginBottom: 4 },
  stepLeft: { alignItems: "center", marginRight: 16 },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  stepLine: { width: 2, flex: 1, marginVertical: 4, minHeight: 24 },
  stepContent: { flex: 1, paddingTop: 6, paddingBottom: 20 },
  stepLabel: { fontSize: 14 },
  stepActive: { fontSize: 12, color: Colors.orange[500], marginTop: 2 },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.offWhite },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.blue[500],
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.blue[400],
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
  },
  headerTitle: { color: Colors.white, fontSize: 20, fontWeight: "800" },
  headerSpacer: { width: 40 },
  scrollContent: { padding: 16, gap: 14 },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  paymentCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    elevation: 3,
    shadowColor: Colors.blue[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  iconContainer: { marginBottom: 16, height: 56, justifyContent: "center" },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.blue[900],
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.gray[600],
    marginBottom: 8,
  },
  description: {
    fontSize: 13,
    color: Colors.gray[600],
    textAlign: "center",
    lineHeight: 20,
  },
  etaBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.gray[100],
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 12,
  },
  etaText: { fontSize: 13, fontWeight: "700", color: Colors.orange[500] },
  progressCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    elevation: 2,
    shadowColor: Colors.blue[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.blue[900],
    marginBottom: 20,
  },
  codeCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    elevation: 2,
    shadowColor: Colors.blue[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  codeTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.gray[600],
    marginBottom: 8,
  },
  code: {
    fontSize: 40,
    fontWeight: "800",
    color: Colors.orange[500],
    letterSpacing: 10,
    marginBottom: 8,
  },
  codeHint: { fontSize: 12, color: Colors.gray[400], textAlign: "center" },
  button: {
    backgroundColor: Colors.orange[500],
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  buttonText: { color: Colors.white, fontSize: 16, fontWeight: "800" },
  detailButton: {
    borderWidth: 1.5,
    borderColor: Colors.orange[500],
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  detailButtonText: { color: Colors.orange[500], fontSize: 15, fontWeight: "700" },
});
