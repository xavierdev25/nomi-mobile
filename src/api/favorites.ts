import { apiClient } from './client';
import { Product, Store } from '../types';

export const favoritesApi = {
    // Productos
    addProduct: async (productId: number): Promise<void> => {
        await apiClient.post(`/favorites/products/${productId}`);
    },
    removeProduct: async (productId: number): Promise<void> => {
        await apiClient.delete(`/favorites/products/${productId}`);
    },
    getProducts: async (): Promise<Product[]> => {
        const response = await apiClient.get('/favorites/products');
        return response.data;
    },
    checkProduct: async (productId: number): Promise<boolean> => {
        const response = await apiClient.get(`/favorites/products/${productId}/check`);
        return response.data.favorite;
    },

    // Tiendas
    addStore: async (storeId: number): Promise<void> => {
        await apiClient.post(`/favorites/stores/${storeId}`);
    },
    removeStore: async (storeId: number): Promise<void> => {
        await apiClient.delete(`/favorites/stores/${storeId}`);
    },
    getStores: async (): Promise<Store[]> => {
        const response = await apiClient.get('/favorites/stores');
        return response.data;
    },
    checkStore: async (storeId: number): Promise<boolean> => {
        const response = await apiClient.get(`/favorites/stores/${storeId}/check`);
        return response.data.favorite;
    },
};