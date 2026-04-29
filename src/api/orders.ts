import { apiClient } from './client';
import { Order, CreateOrderRequest, PageResponse } from '../types';

export const ordersApi = {
    create: async (data: CreateOrderRequest): Promise<Order> => {
        const response = await apiClient.post('/orders', data);
        return response.data;
    },

    getById: async (id: number): Promise<Order> => {
        const response = await apiClient.get(`/orders/${id}`);
        return response.data;
    },

    getMyOrders: async (userId: number, page = 0, size = 20): Promise<PageResponse<Order>> => {
        const response = await apiClient.get(`/orders/user/${userId}?page=${page}&size=${size}`);
        return response.data;
    },

    getByStore: async (storeId: number, page = 0, size = 20): Promise<PageResponse<Order>> => {
        const response = await apiClient.get(`/orders/store/${storeId}?page=${page}&size=${size}`);
        return response.data;
    },

    getAvailableForDelivery: async (): Promise<Order[]> => {
        const response = await apiClient.get('/orders/status/LISTO_PARA_RECOGER');
        return response.data;
    },

    updateStatus: async (id: number, status: string): Promise<Order> => {
        const response = await apiClient.patch(`/orders/${id}/status`, { status });
        return response.data;
    },

    cancel: async (id: number, motivo?: string): Promise<Order> => {
        const response = await apiClient.patch(`/orders/${id}/cancel`, { motivo });
        return response.data;
    },

    getHistory: async (id: number): Promise<any[]> => {
        const response = await apiClient.get(`/orders/${id}/history`);
        return response.data;
    },
};