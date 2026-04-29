import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../store';
import { productsApi, aiApi } from '../../api';
import { Product, Recommendation } from '../../types';
import { formatCurrency, truncateText } from '../../utils';
import { ORDER_STATUS_COLOR, PRODUCT_CATEGORIES } from '../../constants';

export const HomeScreen = () => {
  const { user } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);

  const { data: productsData, isLoading: loadingProducts, refetch: refetchProducts } = useQuery({
    queryKey: ['products'],
    queryFn: () => productsApi.search({ disponible: true, size: 20 }),
  });

  const { data: recommendationsData, isLoading: loadingRecs, refetch: refetchRecs } = useQuery({
    queryKey: ['recommendations'],
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
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#F97316" />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>¡Hola, {user?.nombres}! 👋</Text>
          <Text style={styles.subtitle}>¿Qué se te antoja hoy?</Text>
        </View>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {user?.nombres?.charAt(0)}{user?.apellidos?.charAt(0)}
          </Text>
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
            <ActivityIndicator color="#F97316" style={{ marginVertical: 20 }} />
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
              {recommendations.map((rec) => (
                <RecommendationCard key={rec.productId} rec={rec} />
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
          <ActivityIndicator color="#F97316" style={{ marginVertical: 20 }} />
        ) : (
          <View style={styles.productsGrid}>
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </View>
        )}
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

const RecommendationCard = ({ rec }: { rec: Recommendation }) => (
  <TouchableOpacity style={styles.recCard}>
    <View style={styles.recImagePlaceholder}>
      <Text style={styles.recEmoji}>🍽️</Text>
    </View>
    <View style={styles.recInfo}>
      <Text style={styles.recName} numberOfLines={1}>{rec.nombre}</Text>
      <Text style={styles.recReason} numberOfLines={2}>{rec.reason}</Text>
      <Text style={styles.recPrice}>{formatCurrency(rec.precio)}</Text>
    </View>
    <View style={styles.recScore}>
      <Text style={styles.recScoreText}>⭐ {(rec.score * 10).toFixed(0)}</Text>
    </View>
  </TouchableOpacity>
);

const ProductCard = ({ product }: { product: Product }) => (
  <TouchableOpacity style={styles.productCard}>
    <View style={styles.productImagePlaceholder}>
      <Text style={styles.productEmoji}>
        {product.categoria === 'COMIDA' ? '🍽️' :
         product.categoria === 'BEBIDA' ? '🥤' :
         product.categoria === 'SNACK' ? '🍿' :
         product.categoria === 'POSTRE' ? '🍰' : '🛍️'}
      </Text>
    </View>
    <View style={styles.productInfo}>
      <Text style={styles.productName} numberOfLines={1}>{product.nombre}</Text>
      <Text style={styles.productDesc} numberOfLines={1}>
        {truncateText(product.descripcion ?? '', 40)}
      </Text>
      <View style={styles.productFooter}>
        <Text style={styles.productPrice}>{formatCurrency(product.precio)}</Text>
        <View style={[styles.categoryBadge, { backgroundColor: '#FFF7ED' }]}>
          <Text style={styles.categoryText}>
            {PRODUCT_CATEGORIES[product.categoria as keyof typeof PRODUCT_CATEGORIES] ?? product.categoria}
          </Text>
        </View>
      </View>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F97316',
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  greeting: { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  section: { paddingTop: 24, paddingHorizontal: 16 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937' },
  sectionSubtitle: { fontSize: 12, color: '#F97316', fontWeight: '600' },
  horizontalScroll: { marginHorizontal: -16, paddingHorizontal: 16 },
  recCard: {
    width: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginRight: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  recImagePlaceholder: {
    height: 100,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recEmoji: { fontSize: 40 },
  recInfo: { padding: 12 },
  recName: { fontSize: 14, fontWeight: '700', color: '#1F2937' },
  recReason: { fontSize: 11, color: '#6B7280', marginTop: 4, lineHeight: 16 },
  recPrice: { fontSize: 15, fontWeight: '700', color: '#F97316', marginTop: 6 },
  recScore: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  recScoreText: { fontSize: 11, color: '#FFFFFF', fontWeight: '600' },
  productsGrid: { gap: 12 },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  productImagePlaceholder: {
    width: 90,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productEmoji: { fontSize: 32 },
  productInfo: { flex: 1, padding: 14 },
  productName: { fontSize: 15, fontWeight: '700', color: '#1F2937' },
  productDesc: { fontSize: 12, color: '#6B7280', marginTop: 3 },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  productPrice: { fontSize: 16, fontWeight: '700', color: '#F97316' },
  categoryBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  categoryText: { fontSize: 10, fontWeight: '600', color: '#F97316' },
});