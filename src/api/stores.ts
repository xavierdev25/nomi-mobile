import { apiClient } from './client';
import { Store, PageResponse } from '../types';

export const storesApi = {
    getAll: async (page = 0, size = 20): Promise<PageResponse<Store>> => {
        const response = await apiClient.get(`/stores?page=${page}&size=${size}`);
        return response.data;
    },
    getById: async (id: number): Promise<Store> => {
        const response = await apiClient.get(`/stores/${id}`);
        return response.data;
    },
    search: async (nombre: string, page = 0, size = 20): Promise<PageResponse<Store>> => {
        const response = await apiClient.get('/stores/search', { params: { nombre, page, size } });
        return response.data;
    },
};