import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useProductSearch } from '../../hooks/useProductSearch';
import { StudentStackParamList } from '../../navigation/types';
import { useCartStore } from '../../store';
import { Product } from '../../types';
import { formatCurrency } from '../../utils';

const CATEGORIAS: { label: string; value: string | null }[] = [
  { label: 'Todas', value: null },
  { label: 'Hamburguesas', value: 'HAMBURGUESAS' },
  { label: 'Pizzas', value: 'PIZZAS' },
  { label: 'Pollos', value: 'POLLOS' },
  { label: 'Bebidas', value: 'BEBIDAS' },
  { label: 'Postres', value: 'POSTRES' },
  { label: 'Snacks', value: 'SNACKS' },
  { label: 'Saludable', value: 'SALUDABLE' },
  { label: 'Otros', value: 'OTROS' },
];

const formatCategory = (category: string) =>
  category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();

const parsePrice = (value: string) => {
  const normalized = value.replace(',', '.').trim();
  if (normalized === '') {
    return null;
  }

  const parsed = Number(normalized);
  return Number.isNaN(parsed) ? null : parsed;
};

export const SearchScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<StudentStackParamList>>();
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [precioMinText, setPrecioMinText] = useState('');
  const [precioMaxText, setPrecioMaxText] = useState('');
  const [soloDisponibles, setSoloDisponibles] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const filtersAnimation = useRef(new Animated.Value(0)).current;

  const precioMin = useMemo(() => parsePrice(precioMinText), [precioMinText]);
  const precioMax = useMemo(() => parsePrice(precioMaxText), [precioMaxText]);

  const {
    products,
    isLoading,
    isFetchingMore,
    isError,
    totalElements,
    hasNextPage,
    loadNextPage,
    resetSearch,
    refetch,
  } = useProductSearch({
    nombre: debouncedSearch,
    categoria: selectedCategory,
    precioMin,
    precioMax,
    soloDisponibles,
  });

  const activeFiltersCount =
    (selectedCategory !== null ? 1 : 0) +
    (precioMinText !== '' ? 1 : 0) +
    (precioMaxText !== '' ? 1 : 0) +
    (soloDisponibles ? 1 : 0);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchText), 400);
    return () => clearTimeout(timer);
  }, [searchText]);

  useEffect(() => {
    resetSearch();
  }, [debouncedSearch, selectedCategory, precioMinText, precioMaxText, soloDisponibles, resetSearch]);

  useEffect(() => {
    Animated.timing(filtersAnimation, {
      toValue: showFilters ? 1 : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [filtersAnimation, showFilters]);

  const filtersHeight = filtersAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 220],
  });

  const clearFilters = () => {
    setSearchText('');
    setDebouncedSearch('');
    setSelectedCategory(null);
    setPrecioMinText('');
    setPrecioMaxText('');
    setSoloDisponibles(false);
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <ProductCard
      product={item}
      onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
    />
  );

  const renderContent = () => {
    if (isLoading) {
      return <SkeletonGrid />;
    }

    if (isError) {
      return <ErrorState onRetry={refetch} />;
    }

    if (products.length === 0) {
      return <EmptyState />;
    }

    return (
      <FlatList
        data={products}
        numColumns={2}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderProduct}
        onEndReached={() => {
          if (hasNextPage) {
            loadNextPage();
          }
        }}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          isFetchingMore ? <ActivityIndicator color="#F97316" style={styles.footerLoader} /> : null
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Buscar productos</Text>
        <CartHeaderButton onPress={() => navigation.navigate('Cart')} />
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search-outline" size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Buscar productos..."
            placeholderTextColor="#9CA3AF"
            returnKeyType="search"
          />
          {searchText !== '' && (
            <TouchableOpacity
              onPress={() => {
                setSearchText('');
                setDebouncedSearch('');
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilters((prev) => !prev)}>
          <Text style={styles.filterButtonText}>Filtros</Text>
          <Ionicons name={showFilters ? 'chevron-up' : 'chevron-down'} size={16} color="#F97316" />
          {activeFiltersCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <Animated.View style={[styles.filtersPanel, { height: filtersHeight, opacity: filtersAnimation }]}>
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
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
          />
          <TextInput
            style={styles.priceInput}
            value={precioMaxText}
            onChangeText={setPrecioMaxText}
            placeholder="Hasta S/"
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Solo disponibles</Text>
          <Switch
            value={soloDisponibles}
            onValueChange={setSoloDisponibles}
            thumbColor={soloDisponibles ? '#F97316' : '#f4f3f4'}
            trackColor={{ false: '#D1D5DB', true: '#FED7AA' }}
          />
        </View>

        {activeFiltersCount > 0 && (
          <TouchableOpacity style={styles.clearFiltersButton} onPress={clearFilters}>
            <Text style={styles.clearFiltersText}>Limpiar filtros</Text>
          </TouchableOpacity>
        )}
      </Animated.View>

      <Text style={styles.resultsCount}>{totalElements} productos encontrados</Text>

      <View style={styles.content}>{renderContent()}</View>
    </SafeAreaView>
  );
};

const CartHeaderButton = ({ onPress }: { onPress: () => void }) => {
  const items = useCartStore((state) => state.items);
  const getItemCount = useCartStore((state) => state.getItemCount);
  const itemCount = getItemCount();

  return (
    <TouchableOpacity style={styles.cartHeaderButton} onPress={onPress}>
      <Ionicons name="cart-outline" size={22} color="#F97316" />
      {items.length > 0 && (
        <View style={styles.cartBadge}>
          <Text style={styles.cartBadgeText}>{itemCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const ProductCard = ({ product, onPress }: { product: Product; onPress: () => void }) => {
  const [imageError, setImageError] = useState(false);
  const showImage = product.imagenUrl && !imageError;

  return (
    <TouchableOpacity style={styles.productCard} onPress={onPress} activeOpacity={0.85}>
      {showImage ? (
        <Image
          source={{ uri: product.imagenUrl }}
          style={styles.productImage}
          resizeMode="cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <View style={styles.productImageFallback}>
          <Ionicons name="image-outline" size={40} color="#9CA3AF" />
        </View>
      )}

      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {product.nombre}
        </Text>
        <Text style={styles.productPrice}>{formatCurrency(product.precio)}</Text>
        <View style={styles.productFooter}>
          <View style={styles.productCategoryBadge}>
            <Text style={styles.productCategoryText} numberOfLines={1}>
              {formatCategory(product.categoria)}
            </Text>
          </View>
          <View
            style={[
              styles.availabilityDot,
              { backgroundColor: product.disponible ? '#10B981' : '#EF4444' },
            ]}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const SkeletonGrid = () => {
  const opacity = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.8,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <View style={styles.skeletonGrid}>
      {[0, 1, 2, 3].map((item) => (
        <Animated.View key={item} style={[styles.skeletonCard, { opacity }]} />
      ))}
    </View>
  );
};

const EmptyState = () => (
  <View style={styles.stateContainer}>
    <Ionicons name="search-outline" size={48} color="#9CA3AF" />
    <Text style={styles.emptyTitle}>No encontramos productos</Text>
    <Text style={styles.stateText}>Intenta con otros términos o filtros</Text>
  </View>
);

const ErrorState = ({ onRetry }: { onRetry: () => void }) => (
  <View style={styles.stateContainer}>
    <Ionicons name="wifi-outline" size={48} color="#9CA3AF" />
    <Text style={styles.stateText}>Error al cargar productos</Text>
    <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
      <Text style={styles.retryButtonText}>Reintentar</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  title: { fontSize: 24, fontWeight: '800', color: '#1F2937' },
  cartHeaderButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  cartBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F97316',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800' },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    gap: 8,
  },
  searchInputContainer: {
    flex: 1,
    minHeight: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  searchInput: {
    flex: 1,
    color: '#1F2937',
    fontSize: 14,
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  filterButton: {
    minHeight: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  filterButtonText: { color: '#F97316', fontWeight: '700', fontSize: 13, marginRight: 4 },
  filterBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F97316',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  filterBadgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  filtersPanel: {
    marginHorizontal: 16,
    marginTop: 12,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  categoriesScroll: { marginTop: 14, marginBottom: 16 },
  categoryChip: {
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
  },
  categoryChipSelected: { backgroundColor: '#F97316' },
  categoryChipText: { color: '#6B7280', fontSize: 12, fontWeight: '700' },
  categoryChipTextSelected: { color: '#FFFFFF' },
  priceRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  priceInput: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    color: '#1F2937',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  switchLabel: { color: '#1F2937', fontSize: 14, fontWeight: '600' },
  clearFiltersButton: {
    borderWidth: 1,
    borderColor: '#F97316',
    borderRadius: 8,
    alignItems: 'center',
    paddingVertical: 10,
  },
  clearFiltersText: { color: '#F97316', fontWeight: '700', fontSize: 14 },
  resultsCount: {
    color: '#6B7280',
    fontSize: 12,
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 4,
  },
  content: { flex: 1 },
  listContent: { padding: 10, paddingBottom: 20 },
  footerLoader: { marginVertical: 18 },
  productCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    margin: 6,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  productImage: { width: '100%', height: 140 },
  productImageFallback: {
    width: '100%',
    height: 140,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: { padding: 10 },
  productName: { fontSize: 13, fontWeight: '600', color: '#1F2937', minHeight: 36 },
  productPrice: { fontSize: 15, fontWeight: '700', color: '#F97316', marginTop: 4 },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  productCategoryBadge: {
    maxWidth: '85%',
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  productCategoryText: { color: '#F97316', fontSize: 10, fontWeight: '700' },
  availabilityDot: { width: 8, height: 8, borderRadius: 4 },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
  },
  skeletonCard: {
    flexBasis: '47%',
    flexGrow: 1,
    height: 200,
    backgroundColor: '#E5E7EB',
    borderRadius: 16,
    margin: 6,
  },
  stateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    color: '#1F2937',
    fontSize: 17,
    fontWeight: '700',
    marginTop: 12,
    textAlign: 'center',
  },
  stateText: {
    color: '#6B7280',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#F97316',
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginTop: 16,
  },
  retryButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
});
