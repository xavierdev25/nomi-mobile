import { useCartStore } from '../../src/store/cartStore';
import { Product } from '../../src/types';
import { TARIFA_SERVICIO, COMISION_FOODV } from '../../src/constants';

const mockProduct: Product = {
  id: 1,
  nombre: 'Arroz con Leche',
  precio: 10,
  storeId: 42,
  categoria: 'POSTRE',
  stock: 99,
  activo: true,
  disponible: true,
  creadoEn: '2024-01-01T00:00:00Z',
};

const otherStoreProduct: Product = {
  ...mockProduct,
  id: 2,
  storeId: 99,
};

beforeEach(() => {
  useCartStore.setState({ items: [], storeId: null, propina: 0, lastAulaId: null });
});

describe('addItem', () => {
  it('adds a product correctly', () => {
    const result = useCartStore.getState().addItem(mockProduct);
    const { items, storeId } = useCartStore.getState();

    expect(result).toBe(true);
    expect(items).toHaveLength(1);
    expect(items[0].product.id).toBe(mockProduct.id);
    expect(items[0].cantidad).toBe(1);
    expect(storeId).toBe(mockProduct.storeId);
  });

  it('increments quantity when the same product is added again', () => {
    useCartStore.getState().addItem(mockProduct);
    useCartStore.getState().addItem(mockProduct);
    const { items } = useCartStore.getState();

    expect(items).toHaveLength(1);
    expect(items[0].cantidad).toBe(2);
  });

  it('returns false when a product from a different store is in cart', () => {
    useCartStore.getState().addItem(mockProduct);
    const result = useCartStore.getState().addItem(otherStoreProduct);
    expect(result).toBe(false);
  });
});

describe('removeItem', () => {
  it('removes an item from the cart', () => {
    useCartStore.getState().addItem(mockProduct);
    useCartStore.getState().removeItem(mockProduct.id);
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it('clears storeId when the last item is removed', () => {
    useCartStore.getState().addItem(mockProduct);
    useCartStore.getState().removeItem(mockProduct.id);
    expect(useCartStore.getState().storeId).toBeNull();
  });
});

describe('clearCart', () => {
  it('empties all items and resets storeId and propina', () => {
    useCartStore.getState().addItem(mockProduct);
    useCartStore.getState().setPropina(5);
    useCartStore.getState().clearCart();

    const { items, storeId, propina } = useCartStore.getState();
    expect(items).toHaveLength(0);
    expect(storeId).toBeNull();
    expect(propina).toBe(0);
  });
});

describe('getTotal', () => {
  it('returns subtotal + propina + TARIFA_SERVICIO + COMISION_FOODV', () => {
    useCartStore.getState().addItem(mockProduct); // precio: 10, cantidad: 1
    useCartStore.getState().setPropina(2);

    const total = useCartStore.getState().getTotal();
    const expected = mockProduct.precio + 2 + TARIFA_SERVICIO + COMISION_FOODV;

    expect(total).toBeCloseTo(expected, 5);
  });
});

describe('getItemCount', () => {
  it('returns the total quantity across all items', () => {
    useCartStore.getState().addItem(mockProduct);
    useCartStore.getState().addItem(mockProduct);

    expect(useCartStore.getState().getItemCount()).toBe(2);
  });
});
