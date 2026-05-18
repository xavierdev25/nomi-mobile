import React from 'react';
import { StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/theme/tokens';
import { Product } from '@/types';
import { formatCurrency, formatCategory } from '@/utils';

type ProductCardProps = {
  product: Product;
  onPress: () => void;
  variant?: 'grid' | 'list';
  showDescription?: boolean;
  showAvailabilityBadge?: boolean;
  showFavoriteIcon?: boolean;
  style?: StyleProp<ViewStyle>;
};

export const ProductCard = React.memo(({
  product,
  onPress,
  variant = 'grid',
  showDescription = false,
  showAvailabilityBadge = false,
  showFavoriteIcon = false,
  style,
}: ProductCardProps) => {
  const [imageError, setImageError] = React.useState(false);
  const isList = variant === 'list';
  const showImage = product.imagenUrl && !imageError;

  return (
    <TouchableOpacity
      style={[isList ? styles.listCard : styles.gridCard, style]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {showImage ? (
        <Image
          source={{ uri: product.imagenUrl }}
          style={isList ? styles.listImage : styles.gridImage}
          contentFit="cover"
          transition={200}
          onError={() => setImageError(true)}
        />
      ) : (
        <View style={isList ? styles.listImageFallback : styles.gridImageFallback}>
          <Ionicons name="image-outline" size={isList ? 34 : 40} color={Colors.gray[400]} />
        </View>
      )}
      <View style={isList ? styles.listInfo : styles.gridInfo}>
        <Text style={isList ? styles.listName : styles.gridName} numberOfLines={2}>
          {product.nombre}
        </Text>
        {isList && showDescription && product.descripcion ? (
          <Text style={styles.description} numberOfLines={2}>
            {product.descripcion}
          </Text>
        ) : null}
        {!isList ? (
          <Text style={styles.gridPrice}>{formatCurrency(product.precio)}</Text>
        ) : null}
        <View style={isList ? styles.listFooter : styles.gridFooter}>
          {isList ? (
            <Text style={styles.listPrice}>{formatCurrency(product.precio)}</Text>
          ) : null}
          {showAvailabilityBadge ? (
            <View
              style={[
                styles.availabilityBadge,
                { backgroundColor: product.disponible ? Colors.successSoft : Colors.errorSoft },
              ]}
            >
              <Text
                style={[
                  styles.availabilityText,
                  { color: product.disponible ? Colors.success : Colors.error },
                ]}
              >
                {product.disponible ? 'Disponible' : 'Agotado'}
              </Text>
            </View>
          ) : (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText} numberOfLines={1}>
                {formatCategory(product.categoria)}
              </Text>
            </View>
          )}
          {!showAvailabilityBadge ? (
            <View style={[styles.dot, { backgroundColor: product.disponible ? Colors.success : Colors.error }]} />
          ) : null}
        </View>
      </View>
      {showFavoriteIcon ? (
        <Ionicons name="heart" size={18} color={Colors.error} style={styles.favoriteIcon} />
      ) : null}
    </TouchableOpacity>
  );
});
ProductCard.displayName = 'ProductCard';

const styles = StyleSheet.create({
  gridCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 16,
    margin: 6,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: Colors.blue[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: Colors.blue[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  gridImage: { width: '100%', height: 140 },
  listImage: { width: 100, height: 100 },
  gridImageFallback: {
    width: '100%',
    height: 140,
    backgroundColor: Colors.gray[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  listImageFallback: {
    width: 100,
    height: 100,
    backgroundColor: Colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridInfo: { padding: 10 },
  listInfo: { flex: 1, padding: 12, justifyContent: 'space-between' },
  gridName: { fontSize: 13, fontWeight: '600', color: Colors.blue[900], minHeight: 36 },
  listName: { fontSize: 14, fontWeight: '700', color: Colors.blue[900] },
  description: { fontSize: 12, color: Colors.gray[600], marginTop: 4, lineHeight: 16 },
  gridPrice: { fontSize: 15, fontWeight: '700', color: Colors.orange[500], marginTop: 4 },
  listPrice: { fontSize: 16, fontWeight: '800', color: Colors.orange[500] },
  gridFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  listFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  categoryBadge: {
    maxWidth: '85%',
    backgroundColor: Colors.gray[100],
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  categoryText: { color: Colors.orange[500], fontSize: 10, fontWeight: '700' },
  availabilityBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  availabilityText: { fontSize: 10, fontWeight: '700' },
  dot: { width: 8, height: 8, borderRadius: 4 },
  favoriteIcon: { marginRight: 12 },
});
