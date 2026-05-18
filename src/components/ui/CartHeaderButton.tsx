import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/theme/tokens';
import { useCartStore } from '@/store';

type CartHeaderButtonProps = {
  onPress: () => void;
  variant?: 'dark' | 'light';
};

export const CartHeaderButton = React.memo(({ onPress, variant = 'light' }: CartHeaderButtonProps) => {
  const items = useCartStore((state) => state.items);
  const getItemCount = useCartStore((state) => state.getItemCount);
  const itemCount = getItemCount();
  const isDark = variant === 'dark';

  return (
    <TouchableOpacity
      style={[styles.button, isDark ? styles.buttonDark : styles.buttonLight]}
      onPress={onPress}
    >
      <Ionicons name="cart-outline" size={22} color={isDark ? Colors.white : Colors.orange[500]} />
      {items.length > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{itemCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
});
CartHeaderButton.displayName = 'CartHeaderButton';

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDark: { backgroundColor: Colors.blue[400] },
  buttonLight: {
    backgroundColor: Colors.white,
    elevation: 2,
    shadowColor: Colors.blue[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.orange[500],
    borderWidth: 2,
    borderColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: { color: Colors.white, fontSize: 10, fontWeight: '800' },
});
