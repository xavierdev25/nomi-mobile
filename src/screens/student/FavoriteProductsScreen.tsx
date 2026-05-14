import React, { useState } from "react";
import { Colors } from "@/theme/tokens";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useQuery } from "@tanstack/react-query";
import { favoritesApi } from "../../api";
import { StudentStackParamList } from "../../navigation/types";
import { Product } from "../../types";
import { formatCurrency } from "../../utils";

// ← Fuera del componente principal
const ProductCard = ({
  item,
  onPress,
}: {
  item: Product;
  onPress: () => void;
}) => {
  const [imageError, setImageError] = useState(false);
  const emoji =
    item.categoria === "COMIDA"
      ? "🍽️"
      : item.categoria === "BEBIDA"
        ? "🥤"
        : item.categoria === "SNACK"
          ? "🍿"
          : item.categoria === "POSTRE"
            ? "🍰"
            : "🛍️";

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      {item.imagenUrl && !imageError ? (
        <Image
          source={{ uri: item.imagenUrl }}
          style={styles.productImage}
          resizeMode="cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <View style={styles.productImageFallback}>
          <Text style={styles.productEmoji}>{emoji}</Text>
        </View>
      )}
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.nombre}
        </Text>
        <Text style={styles.productPrice}>{formatCurrency(item.precio)}</Text>
        <View
          style={[
            styles.availBadge,
            { backgroundColor: item.disponible ? Colors.successSoft : Colors.errorSoft },
          ]}
        >
          <Text
            style={[
              styles.availText,
              { color: item.disponible ? Colors.success : Colors.error },
            ]}
          >
            {item.disponible ? "Disponible" : "Agotado"}
          </Text>
        </View>
      </View>
      <Ionicons
        name="heart"
        size={18}
        color={Colors.error}
        style={styles.favoriteIcon}
      />
    </TouchableOpacity>
  );
};

export const FavoriteProductsScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<StudentStackParamList>>();

  const {
    data: products = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["favorites", "products"],
    queryFn: favoritesApi.getProducts,
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Productos favoritos</Text>
        <View style={styles.headerSpacer} />
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.orange[500]} />
        </View>
      ) : products.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="heart-outline" size={64} color={Colors.gray[300]} />
          <Text style={styles.emptyTitle}>Sin favoritos aún</Text>
          <Text style={styles.emptySubtitle}>
            Marca productos con ❤️ para verlos aquí
          </Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <ProductCard
              item={item}
              onPress={() =>
                navigation.navigate("ProductDetail", { productId: item.id })
              }
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshing={false}
          onRefresh={refetch}
        />
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
    padding: 32,
  },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: Colors.gray[600] },
  emptySubtitle: { fontSize: 14, color: Colors.gray[600], textAlign: "center" },
  listContent: { padding: 16, gap: 12 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 2,
    shadowColor: Colors.blue[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  productImage: { width: 90, height: 90 },
  productImageFallback: {
    width: 90,
    height: 90,
    backgroundColor: Colors.gray[100],
    justifyContent: "center",
    alignItems: "center",
  },
  productEmoji: { fontSize: 32 },
  productInfo: { flex: 1, padding: 12 },
  productName: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.blue[900],
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: "800",
    color: Colors.orange[500],
    marginBottom: 6,
  },
  availBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: "flex-start",
  },
  availText: { fontSize: 10, fontWeight: "700" },
  favoriteIcon: { marginRight: 12 },
});
