import { apiClient } from './client';
import { Product, PageResponse } from '../types';

export const productsApi = {
    getAll: async (page = 0, size = 20): Promise<PageResponse<Product>> => {
        const response = await apiClient.get(`/products?page=${page}&size=${size}`);
        return response.data;
    },

    search: async (params: {
        nombre?: string;
        categoria?: string;
        storeId?: number;
        precioMin?: number;
        precioMax?: number;
        disponible?: boolean;
        page?: number;
        size?: number;
    }): Promise<PageResponse<Product>> => {
        const response = await apiClient.get('/products/search', { params });
        return response.data;
    },

    getById: async (id: number): Promise<Product> => {
        const response = await apiClient.get(`/products/${id}`);
        return response.data;
    },

    getByStore: async (storeId: number): Promise<Product[]> => {
        const response = await apiClient.get(`/products/store/${storeId}/activos`);
        return response.data;
    },
};