import React from 'react';
import { StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/theme/tokens';
import { Store } from '@/types';

type StoreCardProps = {
  store: Store;
  onPress: () => void;
  showFavoriteIcon?: boolean;
  style?: StyleProp<ViewStyle>;
};

export const StoreCard = React.memo(({
  store,
  onPress,
  showFavoriteIcon = false,
  style,
}: StoreCardProps) => {
  const [imageError, setImageError] = React.useState(false);

  return (
    <TouchableOpacity style={[styles.card, style]} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.avatar}>
        {store.imagenUrl && !imageError ? (
          <Image
            source={{ uri: store.imagenUrl }}
            style={styles.avatarImage}
            contentFit="cover"
            transition={200}
            onError={() => setImageError(true)}
          />
        ) : (
          <Ionicons name="storefront-outline" size={28} color={Colors.orange[500]} />
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{store.nombre}</Text>
        {store.descripcion ? (
          <Text style={styles.desc} numberOfLines={2}>{store.descripcion}</Text>
        ) : null}
        <View style={styles.footer}>
          <View style={styles.etaBadge}>
            <Ionicons name="time-outline" size={12} color={Colors.orange[500]} />
            <Text style={styles.etaText}>15-25 min</Text>
          </View>
          <View style={[styles.dot, { backgroundColor: store.activo ? Colors.success : Colors.error }]} />
          <Text style={[styles.status, { color: store.activo ? Colors.success : Colors.error }]}>
            {store.activo ? 'Abierto' : 'Cerrado'}
          </Text>
        </View>
      </View>
      <Ionicons
        name={showFavoriteIcon ? 'heart' : 'chevron-forward'}
        size={showFavoriteIcon ? 18 : 20}
        color={showFavoriteIcon ? Colors.error : Colors.gray[300]}
      />
    </TouchableOpacity>
  );
});
StoreCard.displayName = 'StoreCard';

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
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
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: { width: 56, height: 56 },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '800', color: Colors.blue[900], marginBottom: 4 },
  desc: { fontSize: 12, color: Colors.gray[600], lineHeight: 16, marginBottom: 6 },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  etaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.gray[100],
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  etaText: { fontSize: 11, fontWeight: '700', color: Colors.orange[500] },
  dot: { width: 6, height: 6, borderRadius: 3 },
  status: { fontSize: 11, fontWeight: '700' },
});
