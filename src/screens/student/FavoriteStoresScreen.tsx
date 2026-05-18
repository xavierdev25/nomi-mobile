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
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useQuery } from "@tanstack/react-query";
import { favoritesApi } from "../../api";
import { StudentStackParamList } from "../../navigation/types";
import { StoreCard } from "../../components/ui/StoreCard";

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
              store={item}
              showFavoriteIcon
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
});
