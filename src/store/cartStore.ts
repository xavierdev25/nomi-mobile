import { create } from 'zustand';
import { CartItem, Product } from '../types';

interface CartState {
    items: CartItem[];
    storeId: number | null;
    propina: number;
    lastAulaId: number | null;
    setLastAulaId: (aulaId: number) => void;

    addItem: (product: Product, forceReplace?: boolean) => boolean;
    removeItem: (productId: number) => void;
    updateQuantity: (productId: number, cantidad: number) => void;
    clearCart: () => void;
    setPropina: (amount: number) => void;
    getTotal: () => number;
    getItemCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
    items: [],
    storeId: null,
    propina: 0,
    lastAulaId: null,
    setLastAulaId: (aulaId) => set({ lastAulaId: aulaId }),

    addItem: (product: Product, forceReplace = false) => {
        const { items, storeId } = get();
        if (storeId && storeId !== product.storeId) {
            if (!forceReplace) return false; // señal de conflicto
            set({ items: [{ product, cantidad: 1 }], storeId: product.storeId });
            return true;
        }
        const existing = items.find((i) => i.product.id === product.id);
        if (existing) {
            set({
                items: items.map((i) =>
                    i.product.id === product.id ? { ...i, cantidad: i.cantidad + 1 } : i
                ),
            });
        } else {
            set({ items: [...items, { product, cantidad: 1 }], storeId: product.storeId });
        }
        return true;
    },

    removeItem: (productId) => {
        const { items } = get();
        const filtered = items.filter((i) => i.product.id !== productId);
        set({ items: filtered, storeId: filtered.length === 0 ? null : get().storeId });
    },

    updateQuantity: (productId, cantidad) => {
        if (cantidad <= 0) {
            get().removeItem(productId);
            return;
        }
        set({
            items: get().items.map((i) =>
                i.product.id === productId ? { ...i, cantidad } : i
            ),
        });
    },

    clearCart: () => set({ items: [], storeId: null, propina: 0 }),

    setPropina: (amount) => set({ propina: amount }),

    getTotal: () => {
        const { items, propina } = get();
        const subtotal = items.reduce((sum, i) => sum + i.product.precio * i.cantidad, 0);
        return subtotal + propina + 0.5 + 0.2;
    },

    getItemCount: () => get().items.reduce((sum, i) => sum + i.cantidad, 0),
}));