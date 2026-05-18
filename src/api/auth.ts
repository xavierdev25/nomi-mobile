import { apiClient } from './client';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '../types';

export const authApi = {
    login: async (data: LoginRequest): Promise<AuthResponse> => {
        const response = await apiClient.post('/auth/login', data);
        return response.data;
    },

    register: async (data: RegisterRequest): Promise<User> => {
        const response = await apiClient.post('/auth/register', data);
        return response.data;
    },

    logout: async (refreshToken: string): Promise<void> => {
        await apiClient.post('/auth/logout', { refreshToken });
    },

    refresh: async (refreshToken: string): Promise<AuthResponse> => {
        const response = await apiClient.post('/auth/refresh', { refreshToken });
        return response.data;
    },

    me: async (): Promise<User> => {
        const response = await apiClient.get('/users/me');
        return response.data;
    },
};