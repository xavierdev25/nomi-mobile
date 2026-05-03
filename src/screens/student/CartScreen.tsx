import React, { useMemo, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CommonActions } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StudentStackParamList } from '../../navigation/types';
import { useCartStore } from '../../store';
import { CartItem } from '../../types';

const PROPINAS_PRESET = [0, 1, 2, 5];
const TARIFA_SERVICIO = 1.5;
const COMISION_FOODV = 0.5;

type CartScreenProps = NativeStackScreenProps<StudentStackParamList, 'Cart'>;

const formatPrice = (amount: number) => `S/ ${amount.toFixed(2)}`;

const formatCategory = (category: string) =>
  category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();

export const CartScreen = ({ navigation }: CartScreenProps) => {
  const items = useCartStore((state) => state.items);
  const propina = useCartStore((state) => state.propina);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const clearCart = useCartStore((state) => state.clearCart);
  const setPropina = useCartStore((state) => state.setPropina);
  const getItemCount = useCartStore((state) => state.getItemCount);
  const [customPropina, setCustomPropina] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.product.precio * item.cantidad, 0),
    [items],
  );
  const totalFinal = subtotal + TARIFA_SERVICIO + COMISION_FOODV + propina;
  const itemCount = getItemCount();

  const confirmClearCart = () => {
    Alert.alert('Vaciar carrito', '¿Quieres eliminar todos los productos del carrito?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Vaciar', style: 'destructive', onPress: clearCart },
    ]);
  };

  const applyCustomPropina = () => {
    const amount = Number(customPropina.replace(',', '.'));
    setPropina(Number.isNaN(amount) ? 0 : amount);
  };

  const handlePresetPropina = (amount: number) => {
    setShowCustom(false);
    setCustomPropina('');
    setPropina(amount);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIconButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#1F2937" />
        </TouchableOpacity>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Mi carrito</Text>
          {itemCount > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{itemCount}</Text>
            </View>
          )}
        </View>
        {items.length > 0 ? (
          <TouchableOpacity onPress={confirmClearCart}>
            <Text style={styles.clearText}>Vaciar</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.headerSpacer} />
        )}
      </View>

      {items.length === 0 ? (
        <EmptyCart
          onExplore={() =>
            navigation.dispatch(
              CommonActions.navigate({
                name: 'StudentTabs',
                params: { screen: 'Search' },
              }),
            )
          }
        />
      ) : (
        <>
          <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
            {items.map((item) => (
              <CartItemCard
                key={item.product.id}
                item={item}
                onRemove={() => removeItem(item.product.id)}
                onDecrease={() => updateQuantity(item.product.id, item.cantidad - 1)}
                onIncrease={() => updateQuantity(item.product.id, item.cantidad + 1)}
              />
            ))}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>¿Dejar propina al repartidor?</Text>
              <View style={styles.tipChips}>
                {PROPINAS_PRESET.map((amount) => {
                  const selected = propina === amount && !showCustom;
                  return (
                    <TouchableOpacity
                      key={amount}
                      style={[styles.tipChip, selected && styles.tipChipSelected]}
                      onPress={() => handlePresetPropina(amount)}
                    >
                      <Text style={[styles.tipChipText, selected && styles.tipChipTextSelected]}>
                        {amount === 0 ? 'Sin propina' : formatPrice(amount)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
                <TouchableOpacity
                  style={[styles.tipChip, showCustom && styles.tipChipSelected]}
                  onPress={() => setShowCustom(true)}
                >
                  <Text style={[styles.tipChipText, showCustom && styles.tipChipTextSelected]}>Otro monto</Text>
                </TouchableOpacity>
              </View>
              {showCustom && (
                <View style={styles.customTipRow}>
                  <TextInput
                    style={styles.customTipInput}
                    value={customPropina}
                    onChangeText={setCustomPropina}
                    placeholder="S/ 0.00"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                  />
                  <TouchableOpacity style={styles.applyTipButton} onPress={applyCustomPropina}>
                    <Text style={styles.applyTipText}>Aplicar</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <View style={styles.summaryCard}>
              <SummaryRow label="Subtotal" value={formatPrice(subtotal)} />
              <SummaryRow label="Tarifa de servicio" value={formatPrice(TARIFA_SERVICIO)} />
              <SummaryRow label="Comisión FoodV" value={formatPrice(COMISION_FOODV)} />
              <SummaryRow label="Propina" value={formatPrice(propina)} />
              <View style={styles.divider} />
              <SummaryRow label="Total" value={formatPrice(totalFinal)} strong />
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.payButton} onPress={() => navigation.navigate('Checkout')}>
              <Text style={styles.payButtonText}>Ir a pagar - {formatPrice(totalFinal)}</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

const EmptyCart = ({ onExplore }: { onExplore: () => void }) => (
  <View style={styles.emptyContainer}>
    <Ionicons name="cart-outline" size={72} color="#9CA3AF" />
    <Text style={styles.emptyTitle}>Tu carrito está vacío</Text>
    <Text style={styles.emptyText}>Explora productos y agrega algo rico</Text>
    <TouchableOpacity style={styles.exploreButton} onPress={onExplore}>
      <Text style={styles.exploreButtonText}>Explorar</Text>
    </TouchableOpacity>
  </View>
);

const CartItemCard = ({
  item,
  onRemove,
  onDecrease,
  onIncrease,
}: {
  item: CartItem;
  onRemove: () => void;
  onDecrease: () => void;
  onIncrease: () => void;
}) => {
  const [imageError, setImageError] = useState(false);
  const showImage = item.product.imagenUrl && !imageError;
  const subtotal = item.product.precio * item.cantidad;

  return (
    <View style={styles.itemCard}>
      {showImage ? (
        <Image
          source={{ uri: item.product.imagenUrl }}
          style={styles.itemImage}
          resizeMode="cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <View style={styles.itemImageFallback}>
          <Ionicons name="image-outline" size={28} color="#9CA3AF" />
        </View>
      )}

      <View style={styles.itemInfo}>
        <View style={styles.itemTopRow}>
          <View style={styles.itemTextBlock}>
            <Text style={styles.itemName} numberOfLines={2}>
              {item.product.nombre}
            </Text>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{formatCategory(item.product.categoria)}</Text>
            </View>
            <Text style={styles.itemPrice}>{formatPrice(item.product.precio)}</Text>
          </View>
          <TouchableOpacity style={styles.removeButton} onPress={onRemove}>
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>

        <View style={styles.itemBottomRow}>
          <View style={styles.quantityRow}>
            <TouchableOpacity style={styles.quantityButton} onPress={onDecrease}>
              <Ionicons name="remove" size={18} color="#F97316" />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{item.cantidad}</Text>
            <TouchableOpacity style={styles.quantityButton} onPress={onIncrease}>
              <Ionicons name="add" size={18} color="#F97316" />
            </TouchableOpacity>
          </View>
          <Text style={styles.itemSubtotal}>{formatPrice(subtotal)}</Text>
        </View>
      </View>
    </View>
  );
};

const SummaryRow = ({ label, value, strong }: { label: string; value: string; strong?: boolean }) => (
  <View style={styles.summaryRow}>
    <Text style={[styles.summaryLabel, strong && styles.summaryStrong]}>{label}</Text>
    <Text style={[styles.summaryValue, strong && styles.summaryStrong]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  title: { color: '#1F2937', fontSize: 24, fontWeight: '800' },
  countBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#F97316',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  countBadgeText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  clearText: { color: '#EF4444', fontSize: 14, fontWeight: '700' },
  headerSpacer: { width: 40 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 104 },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 10,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  itemImage: { width: 70, height: 70, borderRadius: 12 },
  itemImageFallback: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: { flex: 1, marginLeft: 10 },
  itemTopRow: { flexDirection: 'row', justifyContent: 'space-between' },
  itemTextBlock: { flex: 1, paddingRight: 8 },
  itemName: { color: '#1F2937', fontSize: 14, fontWeight: '800' },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF7ED',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 5,
  },
  categoryText: { color: '#F97316', fontSize: 10, fontWeight: '700' },
  itemPrice: { color: '#F97316', fontSize: 13, fontWeight: '800', marginTop: 5 },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  quantityRow: { flexDirection: 'row', alignItems: 'center' },
  quantityButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#F97316',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    minWidth: 34,
    textAlign: 'center',
    color: '#1F2937',
    fontSize: 15,
    fontWeight: '800',
  },
  itemSubtotal: { color: '#1F2937', fontSize: 14, fontWeight: '800' },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginTop: 8,
    elevation: 3,
  },
  sectionTitle: { color: '#1F2937', fontSize: 16, fontWeight: '800', marginBottom: 12 },
  tipChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tipChip: {
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  tipChipSelected: { backgroundColor: '#F97316' },
  tipChipText: { color: '#6B7280', fontSize: 12, fontWeight: '700' },
  tipChipTextSelected: { color: '#FFFFFF' },
  customTipRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  customTipInput: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    color: '#1F2937',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  applyTipButton: {
    backgroundColor: '#F97316',
    borderRadius: 10,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  applyTipText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginTop: 12,
    elevation: 3,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: { color: '#6B7280', fontSize: 14 },
  summaryValue: { color: '#1F2937', fontSize: 14, fontWeight: '700' },
  summaryStrong: { color: '#1F2937', fontSize: 17, fontWeight: '800' },
  divider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 8 },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: { color: '#1F2937', fontSize: 20, fontWeight: '800', marginTop: 16 },
  emptyText: { color: '#6B7280', fontSize: 14, marginTop: 8, textAlign: 'center' },
  exploreButton: {
    backgroundColor: '#F97316',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 20,
  },
  exploreButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  payButton: {
    backgroundColor: '#F97316',
    borderRadius: 14,
    alignItems: 'center',
    paddingVertical: 16,
  },
  payButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
});
