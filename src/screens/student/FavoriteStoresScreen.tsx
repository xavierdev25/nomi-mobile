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
import { Store } from "../../types";

// ← Fuera del componente principal
const StoreCard = ({ item, onPress }: { item: Store; onPress: () => void }) => {
  const [imageError, setImageError] = useState(false);
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.storeAvatar}>
        {item.imagenUrl && !imageError ? (
          <Image
            source={{ uri: item.imagenUrl }}
            style={styles.storeImage}
            onError={() => setImageError(true)}
          />
        ) : (
          <Ionicons name="storefront-outline" size={28} color={Colors.orange[500]} />
        )}
      </View>
      <View style={styles.storeInfo}>
        <Text style={styles.storeName} numberOfLines={1}>
          {item.nombre}
        </Text>
        {item.descripcion ? (
          <Text style={styles.storeDesc} numberOfLines={2}>
            {item.descripcion}
          </Text>
        ) : null}
        <View style={styles.storeFooter}>
          <Ionicons name="time-outline" size={12} color={Colors.orange[500]} />
          <Text style={styles.etaText}>15-25 min</Text>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: item.activo ? Colors.success : Colors.error },
            ]}
          />
          <Text
            style={[
              styles.statusText,
              { color: item.activo ? Colors.success : Colors.error },
            ]}
          >
            {item.activo ? "Abierto" : "Cerrado"}
          </Text>
        </View>
      </View>
      <Ionicons name="heart" size={18} color={Colors.error} />
    </TouchableOpacity>
  );
};

export const FavoriteStoresScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<StudentStackParamList>>();

  const {
    data: stores = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["favorites", "stores"],
    queryFn: favoritesApi.getStores,
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
        <Text style={styles.headerTitle}>Tiendas favoritas</Text>
        <View style={styles.headerSpacer} />
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.orange[500]} />
        </View>
      ) : stores.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="storefront-outline" size={64} color={Colors.gray[300]} />
          <Text style={styles.emptyTitle}>Sin tiendas favoritas</Text>
          <Text style={styles.emptySubtitle}>
            Marca tiendas con ❤️ para verlas aquí
          </Text>
        </View>
      ) : (
        <FlatList
          data={stores}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <StoreCard
              item={item}
              onPress={() =>
                navigation.navigate("StoreDetail", { storeId: item.id })
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
    padding: 14,
    elevation: 2,
    shadowColor: Colors.blue[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    gap: 12,
  },
  storeAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.gray[100],
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  storeImage: { width: 56, height: 56 },
  storeInfo: { flex: 1 },
  storeName: {
    fontSize: 15,
    fontWeight: "800",
    color: Colors.blue[900],
    marginBottom: 4,
  },
  storeDesc: {
    fontSize: 12,
    color: Colors.gray[600],
    lineHeight: 16,
    marginBottom: 6,
  },
  storeFooter: { flexDirection: "row", alignItems: "center", gap: 4 },
  etaText: { fontSize: 11, fontWeight: "700", color: Colors.orange[500] },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginLeft: 4 },
  statusText: { fontSize: 11, fontWeight: "700" },
});
