import React, { useMemo, useState } from "react";
import { Colors } from "@/theme/tokens";
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
import { getApiErrorMessage } from "../../utils/apiError";
import { StudentStackParamList } from "../../navigation/types";
import { useCartStore } from "../../store/cartStore";
import { Aula } from "../../types";
import { TARIFA_SERVICIO, COMISION_FOODV } from "../../constants";
import { SummaryRow } from "../../components/ui/SummaryRow";

type CheckoutScreenProps = NativeStackScreenProps<
  StudentStackParamList,
  "Checkout"
>;

const formatPrice = (amount: number) => `S/ ${amount.toFixed(2)}`;

export const CheckoutScreen = ({ navigation }: CheckoutScreenProps) => {
  const items = useCartStore((state) => state.items);
  const storeId = useCartStore((state) => state.storeId);
  const propina = useCartStore((state) => state.propina);
  const lastAulaId = useCartStore((state) => state.lastAulaId);
  const setLastAulaId = useCartStore((state) => state.setLastAulaId);
  const [selectedAulaId, setSelectedAulaId] = useState<number | null>(
    lastAulaId,
  );
  const [notas, setNotas] = useState("");
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [puntoEncuentro, setPuntoEncuentro] = useState<string>("puerta");

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
    const notasCompletas = [
      puntoEncuentro === "puerta"
        ? "Punto de encuentro: Puerta del aula"
        : puntoEncuentro === "pasillo"
          ? "Punto de encuentro: Pasillo del piso"
          : puntoEncuentro === "entrada"
            ? "Punto de encuentro: Entrada del pabellón"
            : puntoEncuentro === "escaleras"
              ? "Punto de encuentro: Escaleras del piso"
              : "Punto de encuentro: Recepción del pabellón",
      notas.trim(),
    ]
      .filter(Boolean)
      .join(" | ");

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
        notas: notasCompletas || undefined,
        propina: propina > 0 ? propina : undefined,
      });

      const payment = await paymentsApi.create(order.id);

      if (payment.paymentUrl) {
        await Linking.openURL(payment.paymentUrl);
      }

      navigation.navigate("OrderTracking", { orderId: order.id });
    } catch (err: unknown) {
      console.error('Checkout error:', getApiErrorMessage(err));
      setError(getApiErrorMessage(err, "Error al procesar el pago"));
    } finally {
      setIsCreatingOrder(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirmar pedido</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.etaBanner}>
          <Ionicons name="time-outline" size={16} color={Colors.orange[500]} />
          <Text style={styles.etaText}>
            Entrega estimada: <Text style={styles.etaHighlight}>15-25 min</Text>
          </Text>
          <View style={styles.etaDivider} />
          <Ionicons name="location-outline" size={16} color={Colors.gray[600]} />
          <Text style={styles.etaDelivery}>En tu aula</Text>
        </View>
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
          <SummaryRow label="TOTAL" value={formatPrice(total)} bold />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>¿Dónde te entregamos?</Text>
          {isLoadingAulas ? (
            <ActivityIndicator color={Colors.orange[500]} style={styles.inlineLoader} />
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
                isLast={aula.id === lastAulaId}
                onPress={() => {
                  setSelectedAulaId(aula.id);
                  setLastAulaId(aula.id);
                }}
              />
            ))
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Punto de encuentro</Text>
          <Text style={styles.meetingSubtitle}>
            ¿Dónde te encuentra el repartidor?
          </Text>
          <View style={styles.meetingOptions}>
            {[
              { id: "puerta", label: "🚪 Puerta del aula" },
              { id: "pasillo", label: "🚶 Pasillo del piso" },
              { id: "entrada", label: "🏢 Entrada del pabellón" },
              { id: "escaleras", label: "🪜 Escaleras del piso" },
              { id: "recepcion", label: "📋 Recepción del pabellón" },
            ].map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.meetingOption,
                  puntoEncuentro === option.id && styles.meetingOptionSelected,
                ]}
                onPress={() => setPuntoEncuentro(option.id)}
              >
                <Text
                  style={[
                    styles.meetingOptionText,
                    puntoEncuentro === option.id &&
                      styles.meetingOptionTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
                {puntoEncuentro === option.id && (
                  <Ionicons name="checkmark-circle" size={16} color={Colors.orange[500]} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Notas para el repartidor</Text>
          <TextInput
            style={styles.notesInput}
            value={notas}
            onChangeText={setNotas}
            placeholder="Ej: sin cebolla, toca la puerta del aula..."
            placeholderTextColor={Colors.gray[400]}
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
            <ActivityIndicator color={Colors.white} />
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
  isLast,
}: {
  aula: Aula;
  selected: boolean;
  onPress: () => void;
  isLast?: boolean;
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
        <View style={styles.aulaTitleRow}>
          <Text style={styles.aulaTitle}>
            {aula.codigo} - {aula.nombre}
          </Text>
          {isLast && (
            <View style={styles.lastAulaBadge}>
              <Text style={styles.lastAulaText}>Última usada</Text>
            </View>
          )}
        </View>
        {details ? <Text style={styles.aulaSubtitle}>{details}</Text> : null}
      </View>
      {selected && (
        <Ionicons name="checkmark-circle" size={22} color={Colors.orange[500]} />
      )}
    </TouchableOpacity>
  );
};

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
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 104 },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    elevation: 3,
    shadowColor: Colors.blue[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  sectionTitle: {
    color: Colors.blue[900],
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
  itemName: { flex: 1, color: Colors.blue[900], fontSize: 14, fontWeight: "600" },
  itemPrice: { color: Colors.blue[900], fontSize: 14, fontWeight: "800" },
  emptyText: { color: Colors.gray[600], fontSize: 14 },
  divider: { height: 1, backgroundColor: Colors.gray[200], marginVertical: 10 },
  inlineLoader: { marginVertical: 18 },
  aulasError: { alignItems: "center", paddingVertical: 12 },
  errorText: { color: Colors.gray[600], fontSize: 14, textAlign: "center" },
  retryButton: {
    backgroundColor: Colors.orange[500],
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 9,
    marginTop: 12,
  },
  retryButtonText: { color: Colors.white, fontSize: 13, fontWeight: "800" },
  aulaCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.gray[200],
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  aulaCardSelected: { borderColor: Colors.orange[500], backgroundColor: Colors.gray[100] },
  aulaTextBlock: { flex: 1, paddingRight: 10 },
  aulaTitle: { color: Colors.blue[900], fontSize: 14, fontWeight: "800" },
  aulaSubtitle: { color: Colors.gray[600], fontSize: 12, marginTop: 4 },
  notesInput: {
    minHeight: 92,
    backgroundColor: Colors.gray[100],
    borderRadius: 12,
    color: Colors.blue[900],
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  errorBox: {
    backgroundColor: Colors.errorSoft,
    borderColor: Colors.error,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  errorBoxText: { color: Colors.error, fontSize: 13, fontWeight: "600" },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.white,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
  },
  payButton: {
    backgroundColor: Colors.orange[500],
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 54,
    paddingVertical: 16,
  },
  payButtonDisabled: { backgroundColor: Colors.gray[300] },
  payButtonText: { color: Colors.white, fontSize: 16, fontWeight: "800" },
  etaBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.gray[100],
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 14,
    gap: 6,
  },
  etaText: { fontSize: 13, color: Colors.gray[600], fontWeight: "600" },
  etaHighlight: { color: Colors.orange[500], fontWeight: "800" },
  etaDivider: { width: 1, height: 14, backgroundColor: Colors.orange[400], marginHorizontal: 2 },
  etaDelivery: { fontSize: 13, color: Colors.gray[600], fontWeight: "600" },
  aulaTitleRow: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  lastAulaBadge: { backgroundColor: Colors.successSoft, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  lastAulaText: { fontSize: 10, fontWeight: "700", color: Colors.success },
  meetingSubtitle: { fontSize: 13, color: Colors.gray[600], marginBottom: 12 },
  meetingOptions: { gap: 8 },
  meetingOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: Colors.gray[200],
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  meetingOptionSelected: { borderColor: Colors.orange[500], backgroundColor: Colors.gray[100] },
  meetingOptionText: { fontSize: 14, color: Colors.gray[600], fontWeight: "600" },
  meetingOptionTextSelected: { color: Colors.orange[500] },
});
