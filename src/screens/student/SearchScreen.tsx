import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useQuery } from "@tanstack/react-query";
import { useProductSearch } from "../../hooks/useProductSearch";
import { StudentStackParamList } from "../../navigation/types";
import { storesApi } from "../../api";
import { Colors } from "@/theme/tokens";
import { CartHeaderButton } from "../../components/ui/CartHeaderButton";
import { ProductCard, StoreCard } from "../../components/ui";

type SearchMode = "productos" | "tiendas";

const CATEGORIAS: { label: string; value: string | null }[] = [
  { label: "Todas", value: null },
  { label: "Comida", value: "COMIDA" },
  { label: "Bebida", value: "BEBIDA" },
  { label: "Snack", value: "SNACK" },
  { label: "Postre", value: "POSTRE" },
  { label: "Otro", value: "OTRO" },
];

const parsePrice = (value: string) => {
  const normalized = value.replace(",", ".").trim();
  if (normalized === "") return null;
  const parsed = Number(normalized);
  return Number.isNaN(parsed) ? null : parsed;
};

export const SearchScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<StudentStackParamList>>();
  const [mode, setMode] = useState<SearchMode>("productos");
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [precioMinText, setPrecioMinText] = useState("");
  const [precioMaxText, setPrecioMaxText] = useState("");
  const [soloDisponibles, setSoloDisponibles] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const precioMin = useMemo(() => parsePrice(precioMinText), [precioMinText]);
  const precioMax = useMemo(() => parsePrice(precioMaxText), [precioMaxText]);

  const {
    products,
    isLoading: loadingProducts,
    isFetchingMore,
    isError: productsError,
    totalElements,
    hasNextPage,
    loadNextPage,
    resetSearch,
    refetch: refetchProducts,
  } = useProductSearch({
    nombre: debouncedSearch,
    categoria: selectedCategory,
    precioMin,
    precioMax,
    soloDisponibles,
  });

  const {
    data: storesData,
    isLoading: loadingStores,
    isError: storesError,
    refetch: refetchStores,
  } = useQuery({
    queryKey: ["stores", "search", debouncedSearch],
    queryFn: () => storesApi.search(debouncedSearch),
    enabled: mode === "tiendas",
  });

  const stores = storesData?.content ?? [];

  const activeFiltersCount =
    (selectedCategory !== null ? 1 : 0) +
    (precioMinText !== "" ? 1 : 0) +
    (precioMaxText !== "" ? 1 : 0) +
    (soloDisponibles ? 1 : 0);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchText), 400);
    return () => clearTimeout(timer);
  }, [searchText]);

  useEffect(() => {
    resetSearch();
  }, [
    debouncedSearch,
    selectedCategory,
    precioMinText,
    precioMaxText,
    soloDisponibles,
    resetSearch,
  ]);

  const clearFilters = () => {
    setSearchText("");
    setDebouncedSearch("");
    setSelectedCategory(null);
    setPrecioMinText("");
    setPrecioMaxText("");
    setSoloDisponibles(false);
  };

  const handleModeChange = (newMode: SearchMode) => {
    setMode(newMode);
    setSearchText("");
    setDebouncedSearch("");
    setShowFilters(false);
    setSelectedCategory(null);
    setPrecioMinText("");
    setPrecioMaxText("");
    setSoloDisponibles(false);
  };

  const renderProductContent = () => {
    if (loadingProducts) return <SkeletonGrid />;
    if (productsError) return <ErrorState onRetry={refetchProducts} />;
    if (products.length === 0)
      return (
        <EmptyState
          message="No encontramos productos"
          subtitle="Intenta con otros términos o filtros"
        />
      );
    return (
      <FlatList
        data={products}
        numColumns={2}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={() =>
              navigation.navigate("ProductDetail", { productId: item.id })
            }
          />
        )}
        onEndReached={() => {
          if (hasNextPage) loadNextPage();
        }}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          isFetchingMore ? (
            <ActivityIndicator color={Colors.orange[500]} style={styles.footerLoader} />
          ) : null
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  const renderStoreContent = () => {
    if (loadingStores)
      return <ActivityIndicator color={Colors.orange[500]} style={styles.storeLoader} />;
    if (storesError) return <ErrorState onRetry={refetchStores} />;
    if (stores.length === 0)
      return (
        <EmptyState
          message="No encontramos tiendas"
          subtitle="Intenta con otro nombre"
        />
      );
    return (
      <FlatList
        data={stores}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <StoreCard
            store={item}
            onPress={() =>
              navigation.navigate("StoreDetail", { storeId: item.id })
            }
          />
        )}
        contentContainerStyle={styles.storeListContent}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Buscar</Text>
        <CartHeaderButton onPress={() => navigation.navigate("Cart")} />
      </View>

      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            mode === "productos" && styles.toggleButtonActive,
          ]}
          onPress={() => handleModeChange("productos")}
        >
          <Ionicons
            name="fast-food-outline"
            size={16}
            color={mode === "productos" ? Colors.white : Colors.gray[600]}
          />
          <Text
            style={[
              styles.toggleText,
              mode === "productos" && styles.toggleTextActive,
            ]}
          >
            Productos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            mode === "tiendas" && styles.toggleButtonActive,
          ]}
          onPress={() => handleModeChange("tiendas")}
        >
          <Ionicons
            name="storefront-outline"
            size={16}
            color={mode === "tiendas" ? Colors.white : Colors.gray[600]}
          />
          <Text
            style={[
              styles.toggleText,
              mode === "tiendas" && styles.toggleTextActive,
            ]}
          >
            Tiendas
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search-outline" size={20} color={Colors.gray[600]} />
          <TextInput
            style={styles.searchInput}
            value={searchText}
            onChangeText={setSearchText}
            placeholder={
              mode === "productos" ? "Buscar productos..." : "Buscar tiendas..."
            }
            placeholderTextColor={Colors.gray[400]}
            returnKeyType="search"
          />
          {searchText !== "" && (
            <TouchableOpacity
              onPress={() => {
                setSearchText("");
                setDebouncedSearch("");
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close-circle" size={20} color={Colors.gray[400]} />
            </TouchableOpacity>
          )}
        </View>

        {mode === "productos" && (
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilters((prev) => !prev)}
          >
            <Text style={styles.filterButtonText}>Filtros</Text>
            <Ionicons
              name={showFilters ? "chevron-up" : "chevron-down"}
              size={16}
              color={Colors.orange[500]}
            />
            {activeFiltersCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>

      {mode === "productos" && showFilters ? (
        <View key="filters" style={styles.filtersPanel}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
            {CATEGORIAS.map((category) => {
              const selected = selectedCategory === category.value;
              return (
                <TouchableOpacity
                  key={category.label}
                  style={[styles.categoryChip, selected && styles.categoryChipSelected]}
                  onPress={() => {
                    if (category.value === null || selected) {
                      setSelectedCategory(null);
                      return;
                    }
                    setSelectedCategory(category.value);
                  }}
                >
                  <Text style={[styles.categoryChipText, selected && styles.categoryChipTextSelected]}>
                    {category.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <View style={styles.priceRow}>
            <TextInput
              style={styles.priceInput}
              value={precioMinText}
              onChangeText={setPrecioMinText}
              placeholder="Desde S/"
              placeholderTextColor={Colors.gray[400]}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.priceInput}
              value={precioMaxText}
              onChangeText={setPrecioMaxText}
              placeholder="Hasta S/"
              placeholderTextColor={Colors.gray[400]}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Solo disponibles</Text>
            <Switch
              value={soloDisponibles}
              onValueChange={setSoloDisponibles}
              thumbColor={soloDisponibles ? Colors.orange[500] : Colors.gray[100]}
              trackColor={{ false: Colors.gray[300], true: Colors.orange[400] }}
            />
          </View>
          {activeFiltersCount > 0 && (
            <TouchableOpacity style={styles.clearFiltersButton} onPress={clearFilters}>
              <Text style={styles.clearFiltersText}>Limpiar filtros</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : null}

      {mode === "productos" && (
        <Text style={styles.resultsCount}>
          {totalElements} productos encontrados
        </Text>
      )}
      {mode === "tiendas" && stores.length > 0 && (
        <Text style={styles.resultsCount}>
          {stores.length} tiendas encontradas
        </Text>
      )}

      <View style={styles.content}>
        {mode === "productos" ? renderProductContent() : renderStoreContent()}
      </View>
    </SafeAreaView>
  );
};

const SkeletonGrid = () => (
  <View style={styles.skeletonGrid}>
    {[0, 1, 2, 3].map((item) => (
      <View key={item} style={styles.skeletonCard} />
    ))}
  </View>
);

const EmptyState = ({
  message,
  subtitle,
}: {
  message: string;
  subtitle: string;
}) => (
  <View style={styles.stateContainer}>
    <Ionicons name="search-outline" size={48} color={Colors.gray[400]} />
    <Text style={styles.emptyTitle}>{message}</Text>
    <Text style={styles.stateText}>{subtitle}</Text>
  </View>
);

const ErrorState = ({ onRetry }: { onRetry: () => void }) => (
  <View style={styles.stateContainer}>
    <Ionicons name="wifi-outline" size={48} color={Colors.gray[400]} />
    <Text style={styles.stateText}>Error al cargar</Text>
    <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
      <Text style={styles.retryButtonText}>Reintentar</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.offWhite },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.blue[500],
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  title: { fontSize: 24, fontWeight: "800", color: Colors.white },
  toggleContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: Colors.gray[100],
    borderRadius: 12,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  toggleButtonActive: { backgroundColor: Colors.orange[500] },
  toggleText: { fontSize: 14, fontWeight: "700", color: Colors.gray[600] },
  toggleTextActive: { color: Colors.white },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    gap: 8,
  },
  searchInputContainer: {
    flex: 1,
    minHeight: 48,
    backgroundColor: Colors.white,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    elevation: 2,
    shadowColor: Colors.blue[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  searchInput: {
    flex: 1,
    color: Colors.blue[900],
    fontSize: 14,
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  filterButton: {
    minHeight: 48,
    backgroundColor: Colors.white,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    elevation: 2,
    shadowColor: Colors.blue[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  filterButtonText: {
    color: Colors.orange[500],
    fontWeight: "700",
    fontSize: 13,
    marginRight: 4,
  },
  filterBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.orange[500],
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 6,
  },
  filterBadgeText: { color: Colors.white, fontSize: 11, fontWeight: "700" },
  filtersPanel: {
    marginHorizontal: 16,
    marginTop: 12,
    overflow: "hidden",
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingHorizontal: 12,
    elevation: 2,
    shadowColor: Colors.blue[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  categoriesScroll: { marginTop: 14, marginBottom: 16 },
  categoryChip: {
    backgroundColor: Colors.gray[100],
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
  },
  categoryChipSelected: { backgroundColor: Colors.orange[500] },
  categoryChipText: { color: Colors.gray[600], fontSize: 12, fontWeight: "700" },
  categoryChipTextSelected: { color: Colors.white },
  priceRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  priceInput: {
    flex: 1,
    backgroundColor: Colors.gray[100],
    borderRadius: 8,
    color: Colors.blue[900],
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  switchLabel: { color: Colors.blue[900], fontSize: 14, fontWeight: "600" },
  clearFiltersButton: {
    borderWidth: 1,
    borderColor: Colors.orange[500],
    borderRadius: 8,
    alignItems: "center",
    paddingVertical: 10,
  },
  clearFiltersText: { color: Colors.orange[500], fontWeight: "700", fontSize: 14 },
  resultsCount: {
    color: Colors.gray[600],
    fontSize: 12,
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 4,
  },
  content: { flex: 1 },
  listContent: { padding: 10, paddingBottom: 20 },
  storeListContent: { padding: 16, paddingBottom: 20, gap: 12 },
  footerLoader: { marginVertical: 18 },
  skeletonGrid: { flexDirection: "row", flexWrap: "wrap", padding: 10 },
  skeletonCard: {
    flexBasis: "47%",
    flexGrow: 1,
    height: 200,
    backgroundColor: Colors.gray[200],
    borderRadius: 16,
    margin: 6,
  },
  stateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    color: Colors.blue[900],
    fontSize: 17,
    fontWeight: "700",
    marginTop: 12,
    textAlign: "center",
  },
  stateText: {
    color: Colors.gray[600],
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: Colors.orange[500],
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginTop: 16,
  },
  retryButtonText: { color: Colors.white, fontSize: 14, fontWeight: "700" },
  storeLoader: { marginTop: 40 },
});
