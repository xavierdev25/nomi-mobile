import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useQuery } from "@tanstack/react-query";
import { aulasApi, ordersApi, paymentsApi } from "../../api";
import { StudentStackParamList } from "../../navigation/types";
import { useCartStore } from "../../store/cartStore";
import { Aula } from "../../types";

const TARIFA_SERVICIO = 1.5;
const COMISION_FOODV = 0.5;

type CheckoutScreenProps = NativeStackScreenProps<
  StudentStackParamList,
  "Checkout"
>;

const formatPrice = (amount: number) => `S/ ${amount.toFixed(2)}`;

const getErrorMessage = (error: unknown) => {
  if (
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
  ) {
    return error.response.data.message;
  }

  return "Error al procesar el pago";
};

export const CheckoutScreen = ({ navigation }: CheckoutScreenProps) => {
  const items = useCartStore((state) => state.items);
  const storeId = useCartStore((state) => state.storeId);
  const propina = useCartStore((state) => state.propina);
  const clearCart = useCartStore((state) => state.clearCart);
  const [selectedAulaId, setSelectedAulaId] = useState<number | null>(null);
  const [notas, setNotas] = useState("");
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    data: aulas = [],
    isLoading: isLoadingAulas,
    isError: isAulasError,
    refetch,
  } = useQuery({
    queryKey: ["aulas", "activas"],
    queryFn: aulasApi.getActivas,
  });

  const subtotal = useMemo(
    () =>
      items.reduce((sum, item) => sum + item.product.precio * item.cantidad, 0),
    [items],
  );
  const total = subtotal + TARIFA_SERVICIO + COMISION_FOODV + propina;
  const isPayDisabled =
    !selectedAulaId || isCreatingOrder || items.length === 0;

  const handlePagar = async () => {
    if (!selectedAulaId || !storeId) {
      return;
    }

    setIsCreatingOrder(true);
    setError(null);

    try {
      const order = await ordersApi.create({
        storeId,
        aulaId: selectedAulaId,
        items: items.map((item) => ({
          productId: item.product.id,
          cantidad: item.cantidad,
        })),
        notas: notas.trim() || undefined,
        propina: propina > 0 ? propina : undefined,
      });

      const payment = await paymentsApi.create(order.id);

      if (payment.paymentUrl) {
        await Linking.openURL(payment.paymentUrl);
      }

      clearCart();
      navigation.navigate("OrderTracking", { orderId: order.id });
    } catch (err: unknown) {
      console.error(
        "[CheckoutScreen.handlePagar] Error completo:",
        JSON.stringify(err, null, 2),
      );

      if (typeof err === "object" && err !== null && "response" in err) {
        const axiosErr = err as { response: { status: number; data: unknown } };
        console.error(
          "[CheckoutScreen.handlePagar] Backend respondió |",
          "status:",
          axiosErr.response.status,
          "| data:",
          JSON.stringify(axiosErr.response.data, null, 2),
        );
      }

      setError(getErrorMessage(err));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirmar pedido</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Resumen del pedido</Text>
          {items.length === 0 ? (
            <Text style={styles.emptyText}>No hay productos en el carrito</Text>
          ) : (
            items.map((item) => (
              <View key={item.product.id} style={styles.itemRow}>
                <Text style={styles.itemName} numberOfLines={2}>
                  {item.product.nombre} x {item.cantidad}
                </Text>
                <Text style={styles.itemPrice}>
                  {formatPrice(item.product.precio * item.cantidad)}
                </Text>
              </View>
            ))
          )}

          <View style={styles.divider} />
          <SummaryRow label="Subtotal" value={formatPrice(subtotal)} />
          <SummaryRow
            label="Tarifa de servicio"
            value={formatPrice(TARIFA_SERVICIO)}
          />
          <SummaryRow
            label="Comisión FoodV"
            value={formatPrice(COMISION_FOODV)}
          />
          <SummaryRow label="Propina" value={formatPrice(propina)} />
          <View style={styles.divider} />
          <SummaryRow label="TOTAL" value={formatPrice(total)} strong />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>¿Dónde te entregamos?</Text>
          {isLoadingAulas ? (
            <ActivityIndicator color="#F97316" style={styles.inlineLoader} />
          ) : isAulasError ? (
            <View style={styles.aulasError}>
              <Text style={styles.errorText}>No pudimos cargar las aulas</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => refetch()}
              >
                <Text style={styles.retryButtonText}>Reintentar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            aulas.map((aula) => (
              <AulaCard
                key={aula.id}
                aula={aula}
                selected={selectedAulaId === aula.id}
                onPress={() => setSelectedAulaId(aula.id)}
              />
            ))
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Notas para el repartidor</Text>
          <TextInput
            style={styles.notesInput}
            value={notas}
            onChangeText={setNotas}
            placeholder="Ej: sin cebolla, toca la puerta del aula..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorBoxText}>{error}</Text>
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.payButton, isPayDisabled && styles.payButtonDisabled]}
          disabled={isPayDisabled}
          onPress={handlePagar}
        >
          {isCreatingOrder ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.payButtonText}>
              Pagar con MercadoPago {formatPrice(total)}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const AulaCard = ({
  aula,
  selected,
  onPress,
}: {
  aula: Aula;
  selected: boolean;
  onPress: () => void;
}) => {
  const details = [
    aula.piso ? `Piso ${aula.piso}` : null,
    aula.pabellon ? `Pabellón ${aula.pabellon}` : null,
  ]
    .filter((item): item is string => item !== null)
    .join(" · ");

  return (
    <TouchableOpacity
      style={[styles.aulaCard, selected && styles.aulaCardSelected]}
      onPress={onPress}
    >
      <View style={styles.aulaTextBlock}>
        <Text style={styles.aulaTitle}>
          {aula.codigo} - {aula.nombre}
        </Text>
        {details ? <Text style={styles.aulaSubtitle}>{details}</Text> : null}
      </View>
      {selected && (
        <Ionicons name="checkmark-circle" size={22} color="#F97316" />
      )}
    </TouchableOpacity>
  );
};

const SummaryRow = ({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) => (
  <View style={styles.summaryRow}>
    <Text style={[styles.summaryLabel, strong && styles.summaryStrong]}>
      {label}
    </Text>
    <Text style={[styles.summaryValue, strong && styles.summaryStrong]}>
      {value}
    </Text>
  </View>
);

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
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 104 },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  sectionTitle: {
    color: "#1F2937",
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 14,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
    gap: 12,
  },
  itemName: { flex: 1, color: "#1F2937", fontSize: 14, fontWeight: "600" },
  itemPrice: { color: "#1F2937", fontSize: 14, fontWeight: "800" },
  emptyText: { color: "#6B7280", fontSize: 14 },
  divider: { height: 1, backgroundColor: "#E5E7EB", marginVertical: 10 },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  summaryLabel: { color: "#6B7280", fontSize: 14 },
  summaryValue: { color: "#1F2937", fontSize: 14, fontWeight: "700" },
  summaryStrong: { color: "#1F2937", fontSize: 17, fontWeight: "800" },
  inlineLoader: { marginVertical: 18 },
  aulasError: { alignItems: "center", paddingVertical: 12 },
  errorText: { color: "#6B7280", fontSize: 14, textAlign: "center" },
  retryButton: {
    backgroundColor: "#F97316",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 9,
    marginTop: 12,
  },
  retryButtonText: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" },
  aulaCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  aulaCardSelected: { borderColor: "#F97316", backgroundColor: "#FFF7ED" },
  aulaTextBlock: { flex: 1, paddingRight: 10 },
  aulaTitle: { color: "#1F2937", fontSize: 14, fontWeight: "800" },
  aulaSubtitle: { color: "#6B7280", fontSize: 12, marginTop: 4 },
  notesInput: {
    minHeight: 92,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    color: "#1F2937",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  errorBox: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FCA5A5",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  errorBoxText: { color: "#B91C1C", fontSize: 13, fontWeight: "600" },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  payButton: {
    backgroundColor: "#F97316",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 54,
    paddingVertical: 16,
  },
  payButtonDisabled: { backgroundColor: "#D1D5DB" },
  payButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
});
