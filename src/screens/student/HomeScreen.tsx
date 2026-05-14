import React, { useState } from "react";
import { Colors } from "@/theme/tokens";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useQuery } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore, useCartStore } from "../../store";
import { productsApi, aiApi } from "../../api";
import { StudentStackParamList } from "../../navigation/types";
import { Product, Recommendation } from "../../types";
import { formatCurrency, truncateText } from "../../utils";
import { PRODUCT_CATEGORIES } from "../../constants";

export const HomeScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<StudentStackParamList>>();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: productsData,
    isLoading: loadingProducts,
    refetch: refetchProducts,
  } = useQuery({
    queryKey: ["products"],
    queryFn: () => productsApi.search({ disponible: true, size: 20 }),
  });

  const {
    data: recommendationsData,
    isLoading: loadingRecs,
    refetch: refetchRecs,
  } = useQuery({
    queryKey: ["recommendations"],
    queryFn: () => aiApi.getRecommendations(5),
    retry: 1,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchProducts(), refetchRecs()]);
    setRefreshing(false);
  };

  const products = productsData?.content ?? [];
  const recommendations = recommendationsData?.recommendations ?? [];

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={Colors.orange[500]}
        />
      }
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.headerOrangeBlock} />
        <View>
          <Text style={styles.greeting}>¡Hola, {user?.nombres}! 👋</Text>
          <Text style={styles.subtitle}>¿Qué se te antoja hoy?</Text>
        </View>
        <View style={styles.headerActions}>
          <CartHeaderButton onPress={() => navigation.navigate("Cart")} />
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {user?.nombres?.charAt(0)}
              {user?.apellidos?.charAt(0)}
            </Text>
          </View>
        </View>
      </View>

      {/* Recomendaciones IA */}
      {(loadingRecs || recommendations.length > 0) && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🤖 Para ti</Text>
            <Text style={styles.sectionSubtitle}>Recomendado por IA</Text>
          </View>
          {loadingRecs ? (
            <ActivityIndicator color={Colors.orange[500]} style={styles.inlineLoader} />
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.horizontalScroll}
            >
              {recommendations.map((rec) => (
                <RecommendationCard
                  key={rec.productId}
                  rec={rec}
                  onPress={() =>
                    navigation.navigate("ProductDetail", {
                      productId: rec.productId,
                    })
                  }
                />
              ))}
            </ScrollView>
          )}
        </View>
      )}

      {/* Todos los productos */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🍽️ Disponible ahora</Text>
        </View>
        {loadingProducts ? (
          <ActivityIndicator color={Colors.orange[500]} style={styles.inlineLoader} />
        ) : (
          <View style={styles.productsGrid}>
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onPress={() =>
                  navigation.navigate("ProductDetail", {
                    productId: product.id,
                  })
                }
              />
            ))}
          </View>
        )}
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
};

const CartHeaderButton = ({ onPress }: { onPress: () => void }) => {
  const items = useCartStore((state) => state.items);
  const getItemCount = useCartStore((state) => state.getItemCount);
  const itemCount = getItemCount();

  return (
    <TouchableOpacity style={styles.cartHeaderButton} onPress={onPress}>
      <Ionicons name="cart-outline" size={22} color={Colors.white} />
      {items.length > 0 && (
        <View style={styles.cartBadge}>
          <Text style={styles.cartBadgeText}>{itemCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const RecommendationCard = ({
  rec,
  onPress,
}: {
  rec: Recommendation;
  onPress: () => void;
}) => (
  <TouchableOpacity style={styles.recCard} onPress={onPress}>
    <View style={styles.recImagePlaceholder}>
      <Text style={styles.recEmoji}>🍽️</Text>
    </View>
    <View style={styles.recInfo}>
      <Text style={styles.recName} numberOfLines={1}>
        {rec.nombre}
      </Text>
      <Text style={styles.recReason} numberOfLines={2}>
        {rec.reason}
      </Text>
      <Text style={styles.recPrice}>{formatCurrency(rec.precio)}</Text>
    </View>
    <View style={styles.recScore}>
      <Text style={styles.recScoreText}>⭐ {(rec.score * 10).toFixed(0)}</Text>
    </View>
  </TouchableOpacity>
);

const ProductCard = ({
  product,
  onPress,
}: {
  product: Product;
  onPress: () => void;
}) => (
  <TouchableOpacity style={styles.productCard} onPress={onPress}>
    <View style={styles.productImagePlaceholder}>
      <Text style={styles.productEmoji}>
        {product.categoria === "COMIDA"
          ? "🍽️"
          : product.categoria === "BEBIDA"
            ? "🥤"
            : product.categoria === "SNACK"
              ? "🍿"
              : product.categoria === "POSTRE"
                ? "🍰"
                : "🛍️"}
      </Text>
    </View>
    <View style={styles.productInfo}>
      <Text style={styles.productName} numberOfLines={1}>
        {product.nombre}
      </Text>
      <Text style={styles.productDesc} numberOfLines={1}>
        {truncateText(product.descripcion ?? "", 40)}
      </Text>
      <View style={styles.productFooter}>
        <Text style={styles.productPrice}>
          {formatCurrency(product.precio)}
        </Text>
        <View style={[styles.categoryBadge, { backgroundColor: Colors.gray[100] }]}>
          <Text style={styles.categoryText}>
            {PRODUCT_CATEGORIES[
              product.categoria as keyof typeof PRODUCT_CATEGORIES
            ] ?? product.categoria}
          </Text>
        </View>
      </View>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.offWhite },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.blue[500],
    paddingBottom: 24,
    paddingHorizontal: 24,
    overflow: "hidden",
  },
  headerOrangeBlock: {
    position: "absolute",
    width: 120,
    height: 140,
    borderRadius: 24,
    backgroundColor: Colors.orange[500],
    right: -42,
    top: 30,
    transform: [{ rotate: "16deg" }],
  },
  greeting: { fontSize: 22, fontWeight: "800", color: Colors.white },
  subtitle: { fontSize: 14, color: Colors.white, marginTop: 2 },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.blue[400],
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { fontSize: 16, fontWeight: "700", color: Colors.white },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 10 },
  cartHeaderButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.blue[400],
    justifyContent: "center",
    alignItems: "center",
  },
  cartBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.orange[500],
    borderWidth: 2,
    borderColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  cartBadgeText: { color: Colors.white, fontSize: 10, fontWeight: "800" },
  section: { paddingTop: 24, paddingHorizontal: 16 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: Colors.blue[900] },
  sectionSubtitle: { fontSize: 12, color: Colors.orange[500], fontWeight: "600" },
  horizontalScroll: { marginHorizontal: -16, paddingHorizontal: 16 },
  recCard: {
    width: 200,
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginRight: 12,
    overflow: "hidden",
    shadowColor: Colors.blue[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  recImagePlaceholder: {
    height: 100,
    backgroundColor: Colors.gray[100],
    justifyContent: "center",
    alignItems: "center",
  },
  recEmoji: { fontSize: 40 },
  recInfo: { padding: 12 },
  recName: { fontSize: 14, fontWeight: "700", color: Colors.blue[900] },
  recReason: { fontSize: 11, color: Colors.gray[600], marginTop: 4, lineHeight: 16 },
  recPrice: { fontSize: 15, fontWeight: "700", color: Colors.orange[500], marginTop: 6 },
  recScore: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: Colors.blue[900],
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  recScoreText: { fontSize: 11, color: Colors.white, fontWeight: "600" },
  productsGrid: { gap: 12 },
  productCard: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: Colors.blue[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  productImagePlaceholder: {
    width: 90,
    backgroundColor: Colors.gray[100],
    justifyContent: "center",
    alignItems: "center",
  },
  productEmoji: { fontSize: 32 },
  productInfo: { flex: 1, padding: 14 },
  productName: { fontSize: 15, fontWeight: "700", color: Colors.blue[900] },
  productDesc: { fontSize: 12, color: Colors.gray[600], marginTop: 3 },
  productFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  productPrice: { fontSize: 16, fontWeight: "700", color: Colors.orange[500] },
  categoryBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  categoryText: { fontSize: 10, fontWeight: "600", color: Colors.orange[500] },
  bottomSpacer: { height: 100 },
  inlineLoader: { marginVertical: 20 },
});
