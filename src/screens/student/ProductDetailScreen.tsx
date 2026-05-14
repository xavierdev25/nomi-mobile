import React, { useEffect, useState } from "react";
import { Colors } from "@/theme/tokens";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useQuery } from "@tanstack/react-query";
import { productsApi } from "../../api";
import { StudentStackParamList } from "../../navigation/types";
import { useProductFavorite } from "../../hooks/useFavorite";
import { useCartStore } from "../../store";

const TARIFA_SERVICIO = 0.5;
const COMISION_FOODV = 0.2;

type ProductDetailScreenProps = NativeStackScreenProps<
  StudentStackParamList,
  "ProductDetail"
>;

const formatPrice = (amount: number) => `S/ ${amount.toFixed(2)}`;

const formatCategory = (category: string) =>
  category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();

export const ProductDetailScreen = ({
  route,
  navigation,
}: ProductDetailScreenProps) => {
  const { productId } = route.params;
  const [imageError, setImageError] = useState(false);
  const items = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const cartItem = items.find((item) => item.product.id === productId);
  const [localCantidad, setLocalCantidad] = useState(cartItem?.cantidad ?? 1);

  const {
    isFavorite,
    toggle: toggleFavorite,
    isPending: togglingFavorite,
  } = useProductFavorite(productId);

  const {
    data: product,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => productsApi.getById(productId),
  });

  useEffect(() => {
    if (cartItem) {
      setLocalCantidad(cartItem.cantidad);
    }
  }, [cartItem]);

  const totalEstimado = product
    ? product.precio + TARIFA_SERVICIO + COMISION_FOODV
    : 0;

  const handleAddToCart = () => {
    if (!product || !product.disponible) return;

    const success = cartItem
      ? (updateQuantity(productId, localCantidad), true)
      : addItem(product);

    if (success === false) {
      Alert.alert(
        "Tienda diferente",
        "Tu carrito tiene productos de otra tienda. ¿Quieres vaciarlo y agregar este producto?",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Vaciar y agregar",
            style: "destructive",
            onPress: () => {
              addItem(product, true);
              Alert.alert("✓", "Agregado al carrito", [
                { text: "Seguir comprando", style: "cancel" },
                {
                  text: "Ver carrito",
                  onPress: () => navigation.navigate("Cart"),
                },
              ]);
            },
          },
        ],
      );
      return;
    }

    Alert.alert("✓", cartItem ? "Carrito actualizado" : "Agregado al carrito", [
      { text: "Seguir comprando", style: "cancel" },
      { text: "Ver carrito", onPress: () => navigation.navigate("Cart") },
    ]);
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator color={Colors.orange[500]} size="large" />
      </View>
    );
  }

  if (isError || !product) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="wifi-outline" size={48} color={Colors.gray[400]} />
        <Text style={styles.errorText}>No pudimos cargar el producto</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const showImage = product.imagenUrl && !imageError;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.hero}>
          {showImage ? (
            <Image
              source={{ uri: product.imagenUrl }}
              style={styles.heroImage}
              resizeMode="cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <View style={styles.heroFallback}>
              <Ionicons name="image-outline" size={64} color={Colors.gray[400]} />
            </View>
          )}

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={() => toggleFavorite()}
            disabled={togglingFavorite}
          >
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={24}
              color={isFavorite ? Colors.error : Colors.white}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.name}>{product.nombre}</Text>
          <TouchableOpacity
            style={styles.storeButton}
            onPress={() =>
              navigation.navigate("StoreDetail", { storeId: product.storeId })
            }
          >
            <Ionicons name="storefront-outline" size={14} color={Colors.orange[500]} />
            <Text style={styles.storeButtonText}>Ver tienda</Text>
            <Ionicons name="chevron-forward" size={14} color={Colors.orange[500]} />
          </TouchableOpacity>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>
              {formatCategory(product.categoria)}
            </Text>
          </View>

          <Text style={styles.price}>{formatPrice(product.precio)}</Text>

          {product.descripcion ? (
            <Text style={styles.description}>{product.descripcion}</Text>
          ) : null}

          <View style={styles.etaRow}>
            <View style={styles.etaBadge}>
              <Ionicons name="time-outline" size={14} color={Colors.orange[500]} />
              <Text style={styles.etaText}>Entrega estimada: 15-25 min</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Disponibilidad</Text>
            <View style={styles.availabilityRow}>
              <View
                style={[
                  styles.availabilityDot,
                  {
                    backgroundColor: product.disponible ? Colors.success : Colors.error,
                  },
                ]}
              />
              <Text style={styles.availabilityText}>
                {product.disponible ? "Disponible" : "No disponible"}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Desglose de tarifas</Text>
            <SummaryRow
              label="Precio producto"
              value={formatPrice(product.precio)}
            />
            <SummaryRow
              label="Tarifa de servicio"
              value={formatPrice(TARIFA_SERVICIO)}
            />
            <SummaryRow
              label="Comisión FoodV"
              value={formatPrice(COMISION_FOODV)}
            />
            <View style={styles.divider} />
            <SummaryRow
              label="Total estimado"
              value={formatPrice(totalEstimado)}
              strong
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cantidad</Text>
            <View style={styles.quantityRow}>
              <TouchableOpacity
                style={[
                  styles.quantityButton,
                  localCantidad === 1 && styles.quantityButtonDisabled,
                ]}
                disabled={localCantidad === 1}
                onPress={() =>
                  setLocalCantidad((prev) => Math.max(1, prev - 1))
                }
              >
                <Ionicons
                  name="remove"
                  size={20}
                  color={localCantidad === 1 ? Colors.gray[400] : Colors.orange[500]}
                />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{localCantidad}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setLocalCantidad((prev) => prev + 1)}
              >
                <Ionicons name="add" size={20} color={Colors.orange[500]} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.addButton,
            !product.disponible && styles.addButtonDisabled,
          ]}
          disabled={!product.disponible}
          onPress={handleAddToCart}
        >
          <Text style={styles.addButtonText}>
            {product.disponible
              ? `${cartItem ? "Actualizar carrito" : "Agregar al carrito"}  ${formatPrice(product.precio * localCantidad)}`
              : "Producto no disponible"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
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
  container: { flex: 1, backgroundColor: Colors.offWhite },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 96 },
  centerContainer: {
    flex: 1,
    backgroundColor: Colors.offWhite,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  hero: { height: 280, backgroundColor: Colors.gray[200] },
  heroImage: { width: "100%", height: 280 },
  heroFallback: {
    width: "100%",
    height: 280,
    backgroundColor: Colors.gray[200],
    justifyContent: "center",
    alignItems: "center",
  },
  backButton: {
    position: "absolute",
    top: 52,
    left: 16,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.blue[900],
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    padding: 20,
    minHeight: 520,
  },
  name: { fontSize: 22, fontWeight: "800", color: Colors.blue[900] },
  categoryBadge: {
    alignSelf: "flex-start",
    backgroundColor: Colors.gray[100],
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: 10,
  },
  categoryText: { color: Colors.orange[500], fontSize: 12, fontWeight: "700" },
  price: { color: Colors.orange[500], fontSize: 24, fontWeight: "800", marginTop: 18 },
  description: {
    color: Colors.gray[600],
    fontSize: 14,
    lineHeight: 20,
    marginTop: 12,
  },
  section: { marginTop: 24 },
  sectionTitle: {
    color: Colors.blue[900],
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 12,
  },
  availabilityRow: { flexDirection: "row", alignItems: "center" },
  availabilityDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  availabilityText: { color: Colors.blue[900], fontSize: 14, fontWeight: "600" },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  summaryLabel: { color: Colors.gray[600], fontSize: 14 },
  summaryValue: { color: Colors.blue[900], fontSize: 14, fontWeight: "600" },
  summaryStrong: { color: Colors.blue[900], fontSize: 16, fontWeight: "800" },
  divider: { height: 1, backgroundColor: Colors.gray[200], marginVertical: 8 },
  quantityRow: { flexDirection: "row", alignItems: "center" },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.orange[500],
    justifyContent: "center",
    alignItems: "center",
  },
  quantityButtonDisabled: { borderColor: Colors.gray[300] },
  quantityText: {
    minWidth: 48,
    textAlign: "center",
    color: Colors.blue[900],
    fontSize: 18,
    fontWeight: "800",
  },
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
  addButton: {
    backgroundColor: Colors.orange[500],
    borderRadius: 14,
    alignItems: "center",
    paddingVertical: 16,
  },
  addButtonDisabled: { backgroundColor: Colors.gray[300] },
  addButtonText: { color: Colors.white, fontSize: 16, fontWeight: "800" },
  errorText: {
    color: Colors.gray[600],
    fontSize: 14,
    marginTop: 12,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: Colors.orange[500],
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginTop: 16,
  },
  retryButtonText: { color: Colors.white, fontWeight: "700" },
  storeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
    marginBottom: 2,
    alignSelf: "flex-start",
  },
  storeButtonText: {
    color: Colors.orange[500],
    fontSize: 13,
    fontWeight: "700",
  },
  etaRow: {
    marginTop: 12,
  },
  etaBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.gray[100],
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignSelf: "flex-start",
  },
  etaText: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.orange[500],
  },
  favoriteButton: {
    position: "absolute",
    top: 52,
    right: 16,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.blue[900],
    justifyContent: "center",
    alignItems: "center",
  },
});
