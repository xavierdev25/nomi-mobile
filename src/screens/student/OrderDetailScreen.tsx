import React, { useState } from "react";
import { Colors } from "@/theme/tokens";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ordersApi } from "../../api";
import { ratingsApi } from "../../api/ratings";
import { StudentStackParamList } from "../../navigation/types";
import { useCartStore } from "../../store/cartStore";
import { ORDER_STATUS_LABEL, ORDER_STATUS_COLOR } from "../../constants";
import { SummaryRow } from "../../components/ui/SummaryRow";

type Props = NativeStackScreenProps<StudentStackParamList, "OrderDetail">;

const formatPrice = (amount: number) => `S/ ${Number(amount).toFixed(2)}`;
const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export const OrderDetailScreen = ({ navigation, route }: Props) => {
  const { orderId } = route.params;
  const queryClient = useQueryClient();
  const [cancelling, setCancelling] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [comentario, setComentario] = useState("");

  const addItem = useCartStore((state) => state.addItem);
  const clearCart = useCartStore((state) => state.clearCart);

  const {
    data: order,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => ordersApi.getById(orderId),
  });

  const { data: existingRating } = useQuery({
    queryKey: ["rating", "order", orderId],
    queryFn: () => ratingsApi.getOrderRating(orderId),
    enabled: order?.status === "ENTREGADO",
    retry: false,
  });

  const cancelMutation = useMutation({
    mutationFn: (motivo: string) => ordersApi.cancel(orderId, motivo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
    },
  });

  const { mutate: submitRating, isPending: submittingRating } = useMutation({
    mutationFn: () =>
      ratingsApi.rateOrder(orderId, selectedRating, comentario || undefined),
    onSuccess: () => {
      setShowRatingModal(false);
      queryClient.invalidateQueries({ queryKey: ["rating", "order", orderId] });
    },
  });

  const handleCancel = () => {
    Alert.alert(
      "Cancelar pedido",
      "¿Estás seguro de que quieres cancelar este pedido?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Sí, cancelar",
          style: "destructive",
          onPress: () => {
            setCancelling(true);
            cancelMutation.mutate("Cancelado por el cliente", {
              onSettled: () => setCancelling(false),
            });
          },
        },
      ],
    );
  };

  const handleRepeatOrder = () => {
    Alert.alert(
      "Repetir pedido",
      "¿Quieres agregar los mismos productos al carrito?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sí, repetir",
          onPress: () => {
            clearCart();
            order?.items.forEach((item) => {
              const product = {
                id: item.productId,
                nombre: item.productNombre,
                precio: item.productPrecio,
                storeId: order.storeId,
                categoria: "COMIDA",
                stock: 99,
                activo: true,
                disponible: true,
                creadoEn: new Date().toISOString(),
              };
              for (let i = 0; i < item.cantidad; i++) addItem(product);
            });
            navigation.navigate("Cart");
          },
        },
      ],
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={22} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalle del pedido</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.orange[500]} />
        </View>
      </SafeAreaView>
    );
  }

  if (isError || !order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={22} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalle del pedido</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={48} color={Colors.error} />
          <Text style={styles.errorText}>No pudimos cargar el pedido</Text>
        </View>
      </SafeAreaView>
    );
  }

  const statusColor = ORDER_STATUS_COLOR[order.status] ?? Colors.gray[600];
  const statusLabel = ORDER_STATUS_LABEL[order.status] ?? order.status;
  const canCancel = order.status === "PENDIENTE" && !cancelling;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pedido #{order.id}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Status */}
        <View style={styles.card}>
          <View style={styles.statusRow}>
            <View
              style={[styles.statusDot, { backgroundColor: statusColor }]}
            />
            <Text style={[styles.statusLabel, { color: statusColor }]}>
              {statusLabel}
            </Text>
          </View>
          <Text style={styles.dateText}>{formatDate(order.creadoEn)}</Text>
          {order.notas ? (
            <Text style={styles.notasText}>📝 {order.notas}</Text>
          ) : null}
        </View>

        {/* Items */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Productos</Text>
          {order.items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.productNombre}</Text>
                <Text style={styles.itemQty}>x{item.cantidad}</Text>
              </View>
              <Text style={styles.itemPrice}>{formatPrice(item.subtotal)}</Text>
            </View>
          ))}
        </View>

        {/* Resumen */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Resumen</Text>
          <SummaryRow
            label="Subtotal"
            value={formatPrice(order.items.reduce((s, i) => s + i.subtotal, 0))}
          />
          {order.tarifaServicio ? (
            <SummaryRow
              label="Tarifa de servicio"
              value={formatPrice(order.tarifaServicio)}
            />
          ) : null}
          {order.comisionFoodv ? (
            <SummaryRow
              label="Comisión FoodV"
              value={formatPrice(order.comisionFoodv)}
            />
          ) : null}
          {order.propina ? (
            <SummaryRow label="Propina" value={formatPrice(order.propina)} />
          ) : null}
          <View style={styles.divider} />
          <SummaryRow label="TOTAL" value={formatPrice(order.total)} bold />
        </View>

        {/* Código de confirmación */}
        {order.codigoConfirmacion ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Código de confirmación</Text>
            <Text style={styles.confirmCode}>{order.codigoConfirmacion}</Text>
            <Text style={styles.confirmHint}>
              Muestra este código al repartidor al recibir tu pedido
            </Text>
          </View>
        ) : null}

        {/* Calificar */}
        {order.status === "ENTREGADO" && (
          <View style={styles.card}>
            {existingRating ? (
              <View style={styles.ratingDisplay}>
                <Text style={styles.sectionTitle}>Tu calificación</Text>
                <View style={styles.starsRow}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons
                      key={star}
                      name={
                        star <= existingRating.rating ? "star" : "star-outline"
                      }
                      size={24}
                      color={Colors.warning}
                    />
                  ))}
                </View>
                {existingRating.comentario ? (
                  <Text style={styles.ratingComment}>
                    {existingRating.comentario}
                  </Text>
                ) : null}
              </View>
            ) : (
              <TouchableOpacity
                style={styles.rateButton}
                onPress={() => setShowRatingModal(true)}
              >
                <Ionicons name="star-outline" size={18} color={Colors.warning} />
                <Text style={styles.rateButtonText}>Calificar pedido</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Repetir pedido */}
        <TouchableOpacity
          style={styles.repeatButton}
          onPress={handleRepeatOrder}
        >
          <Ionicons name="refresh-outline" size={18} color={Colors.orange[500]} />
          <Text style={styles.repeatButtonText}>Repetir pedido</Text>
        </TouchableOpacity>

        {/* Cancelar */}
        {canCancel ? (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancel}
            disabled={cancelling}
          >
            {cancelling ? (
              <ActivityIndicator color={Colors.error} />
            ) : (
              <Text style={styles.cancelButtonText}>Cancelar pedido</Text>
            )}
          </TouchableOpacity>
        ) : null}
      </ScrollView>

      {/* Modal de calificación */}
      {showRatingModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>¿Cómo estuvo tu pedido?</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setSelectedRating(star)}
                >
                  <Ionicons
                    name={star <= selectedRating ? "star" : "star-outline"}
                    size={36}
                    color={Colors.warning}
                  />
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={styles.commentInput}
              value={comentario}
              onChangeText={setComentario}
              placeholder="Comentario opcional..."
              placeholderTextColor={Colors.gray[400]}
              multiline
              numberOfLines={3}
              maxLength={500}
              textAlignVertical="top"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowRatingModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalSubmitButton,
                  (!selectedRating || submittingRating) &&
                    styles.modalSubmitDisabled,
                ]}
                onPress={() => submitRating()}
                disabled={!selectedRating || submittingRating}
              >
                {submittingRating ? (
                  <ActivityIndicator color={Colors.white} size="small" />
                ) : (
                  <Text style={styles.modalSubmitText}>Enviar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
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
  },
  headerTitle: { fontSize: 18, fontWeight: "800", color: Colors.white },
  headerSpacer: { width: 40 },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  errorText: { fontSize: 15, color: Colors.gray[600] },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 14 },
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
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  statusLabel: { fontSize: 16, fontWeight: "800" },
  dateText: { fontSize: 13, color: Colors.gray[600] },
  notasText: { fontSize: 13, color: Colors.gray[600], marginTop: 8 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.blue[900],
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  itemInfo: { flex: 1, flexDirection: "row", gap: 8, alignItems: "center" },
  itemName: { flex: 1, fontSize: 14, color: Colors.blue[900], fontWeight: "600" },
  itemQty: { fontSize: 13, color: Colors.gray[600] },
  itemPrice: { fontSize: 14, fontWeight: "700", color: Colors.blue[900] },
  divider: { height: 1, backgroundColor: Colors.gray[200], marginVertical: 10 },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: { fontSize: 14, color: Colors.gray[600] },
  summaryValue: { fontSize: 14, fontWeight: "700", color: Colors.blue[900] },
  summaryStrong: { fontSize: 16, fontWeight: "800", color: Colors.blue[900] },
  confirmCode: {
    fontSize: 36,
    fontWeight: "800",
    color: Colors.orange[500],
    textAlign: "center",
    letterSpacing: 8,
    marginVertical: 8,
  },
  confirmHint: { fontSize: 12, color: Colors.gray[600], textAlign: "center" },
  rateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.warningSoft,
    borderWidth: 1.5,
    borderColor: Colors.warning,
    borderRadius: 14,
    paddingVertical: 14,
  },
  rateButtonText: { color: Colors.warning, fontSize: 15, fontWeight: "700" },
  ratingDisplay: { alignItems: "center", gap: 8 },
  starsRow: {
    flexDirection: "row",
    gap: 4,
    justifyContent: "center",
    marginVertical: 8,
  },
  ratingComment: {
    fontSize: 13,
    color: Colors.gray[600],
    textAlign: "center",
    fontStyle: "italic",
  },
  repeatButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1.5,
    borderColor: Colors.orange[500],
    borderRadius: 14,
    paddingVertical: 14,
    marginBottom: 8,
    backgroundColor: Colors.gray[100],
  },
  repeatButtonText: { color: Colors.orange[500], fontSize: 15, fontWeight: "700" },
  cancelButton: {
    borderWidth: 1.5,
    borderColor: Colors.error,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 8,
  },
  cancelButtonText: { color: Colors.error, fontSize: 15, fontWeight: "700" },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.blue[900],
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  modalCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 24,
    width: "90%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.blue[900],
    textAlign: "center",
    marginBottom: 16,
  },
  commentInput: {
    backgroundColor: Colors.gray[100],
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: Colors.blue[900],
    minHeight: 80,
    marginTop: 16,
  },
  modalButtons: { flexDirection: "row", gap: 12, marginTop: 20 },
  modalCancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  modalCancelText: { color: Colors.gray[600], fontWeight: "700" },
  modalSubmitButton: {
    flex: 1,
    backgroundColor: Colors.warning,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  modalSubmitDisabled: { backgroundColor: Colors.gray[300] },
  modalSubmitText: { color: Colors.white, fontWeight: "700" },
});
