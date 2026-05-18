import React from "react";
import { Colors } from "@/theme/tokens";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useQuery } from "@tanstack/react-query";
import { storesApi, productsApi } from "../../api";
import { StudentStackParamList } from "../../navigation/types";
import { isStoreOpen } from "../../utils";
import { useStoreFavorite } from "../../hooks/useFavorite";
import { ratingsApi } from "../../api/ratings";
import { ProductCard } from "../../components/ui/ProductCard";

type Props = NativeStackScreenProps<StudentStackParamList, "StoreDetail">;

export const StoreDetailScreen = ({ navigation, route }: Props) => {
  const { storeId } = route.params;
  const {
    isFavorite,
    toggle: toggleFavorite,
    isPending: togglingFavorite,
  } = useStoreFavorite(storeId);

  const { data: store, isLoading: loadingStore } = useQuery({
    queryKey: ["store", storeId],
    queryFn: () => storesApi.getById(storeId),
  });

  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ["products", "store", storeId],
    queryFn: () => productsApi.getByStore(storeId),
    enabled: !!storeId,
  });

  const { data: storeRating } = useQuery({
    queryKey: ["rating", "store", storeId],
    queryFn: () => ratingsApi.getStoreRating(storeId),
  });

  const availableProducts = products.filter((p) => p.disponible);
  const unavailableProducts = products.filter((p) => !p.disponible);

  const isLoading = loadingStore || loadingProducts;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {store?.nombre ?? "Tienda"}
        </Text>
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => toggleFavorite()}
          disabled={togglingFavorite}
        >
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={22}
            color={isFavorite ? Colors.error : Colors.blue[900]}
          />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.orange[500]} />
        </View>
      ) : (
        <FlatList
          data={[...availableProducts, ...unavailableProducts]}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            store ? (
              <View style={styles.storeHeader}>
                <View style={styles.storeAvatar}>
                  {store.imagenUrl ? (
                    <Image
                      source={{ uri: store.imagenUrl }}
                      style={styles.storeImage}
                      contentFit="cover"
                      transition={200}
                    />
                  ) : (
                    <Ionicons
                      name="storefront-outline"
                      size={40}
                      color={Colors.orange[500]}
                    />
                  )}
                </View>
                <Text style={styles.storeName}>{store.nombre}</Text>
                {store.descripcion ? (
                  <Text style={styles.storeDesc}>{store.descripcion}</Text>
                ) : null}

                <View style={styles.storeMeta}>
                  <View style={styles.storeMetaBadge}>
                    <Ionicons name="time-outline" size={14} color={Colors.orange[500]} />
                    <Text style={styles.storeMetaText}>15-25 min</Text>
                  </View>
                  <View style={styles.storeMetaDivider} />
                  {(() => {
                    const open = isStoreOpen(store);
                    return (
                      <View style={styles.storeMetaBadge}>
                        <View
                          style={[
                            styles.statusDot,
                            { backgroundColor: open ? Colors.success : Colors.error },
                          ]}
                        />
                        <Text
                          style={[
                            styles.storeMetaText,
                            { color: open ? Colors.success : Colors.error },
                          ]}
                        >
                          {open ? "Abierto" : "Cerrado"}
                        </Text>
                      </View>
                    );
                  })()}
                  {store.horarioApertura && store.horarioCierre ? (
                    <>
                      <View style={styles.storeMetaDivider} />
                      <View style={styles.storeMetaBadge}>
                        <Ionicons
                          name="time-outline"
                          size={12}
                          color={Colors.gray[600]}
                        />
                        <Text style={styles.storeMetaText}>
                          {store.horarioApertura} - {store.horarioCierre}
                        </Text>
                      </View>
                    </>
                  ) : null}
                  {store.telefono ? (
                    <>
                      <View style={styles.storeMetaDivider} />
                      <View style={styles.storeMetaBadge}>
                        <Ionicons
                          name="call-outline"
                          size={14}
                          color={Colors.gray[600]}
                        />
                        <Text style={styles.storeMetaText}>
                          {store.telefono}
                        </Text>
                      </View>
                    </>
                  ) : null}
                  {storeRating && storeRating.total > 0 ? (
                    <>
                      <View style={styles.storeMetaDivider} />
                      <View style={styles.storeMetaBadge}>
                        <Ionicons name="star" size={14} color={Colors.warning} />
                        <Text style={styles.storeMetaText}>
                          {storeRating.promedio.toFixed(1)} ({storeRating.total})
                        </Text>
                      </View>
                    </>
                  ) : null}
                </View>

                <View style={styles.divider} />
                <Text style={styles.productsTitle}>
                  {products.length}{" "}
                  {products.length === 1 ? "producto" : "productos"}
                </Text>
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              variant="list"
              showDescription
              showAvailabilityBadge
              style={styles.productCard}
              onPress={() =>
                navigation.navigate("ProductDetail", { productId: item.id })
              }
            />
          )}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Ionicons name="cube-outline" size={48} color={Colors.gray[300]} />
              <Text style={styles.emptyText}>
                Esta tienda no tiene productos aún
              </Text>
            </View>
          }
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
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "800",
    color: Colors.white,
    textAlign: "center",
    marginHorizontal: 8,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 32,
  },
  listContent: { paddingBottom: 32 },
  storeHeader: {
    padding: 20,
    alignItems: "center",
    backgroundColor: Colors.white,
    marginBottom: 12,
  },
  storeAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.gray[100],
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    overflow: "hidden",
    elevation: 3,
    shadowColor: Colors.blue[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  storeImage: { width: 80, height: 80 },
  storeName: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.blue[900],
    textAlign: "center",
    marginBottom: 6,
  },
  storeDesc: {
    fontSize: 14,
    color: Colors.gray[600],
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.gray[200],
    width: "100%",
    marginVertical: 16,
  },
  productsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.blue[900],
    alignSelf: "flex-start",
  },
  productCard: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  emptyText: { fontSize: 14, color: Colors.gray[600], textAlign: "center" },
  storeMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    backgroundColor: Colors.offWhite,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  storeMetaBadge: { flexDirection: "row", alignItems: "center", gap: 4 },
  storeMetaText: { fontSize: 12, fontWeight: "700", color: Colors.gray[600] },
  storeMetaDivider: { width: 1, height: 14, backgroundColor: Colors.gray[200] },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.gray[100],
    justifyContent: "center",
    alignItems: "center",
  },
});
