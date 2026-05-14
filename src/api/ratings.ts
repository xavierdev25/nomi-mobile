import { apiClient } from './client';

export interface RatingResponse {
    id: number;
    orderId: number;
    userId: number;
    storeId: number;
    rating: number;
    comentario?: string;
    creadoEn: string;
}

export interface StoreRatingResponse {
    storeId: number;
    promedio: number;
    total: number;
    ratings: RatingResponse[];
}

export const ratingsApi = {
    rateOrder: async (orderId: number, rating: number, comentario?: string): Promise<RatingResponse> => {
        const response = await apiClient.post(`/ratings/orders/${orderId}`, { rating, comentario });
        return response.data;
    },
    getOrderRating: async (orderId: number): Promise<RatingResponse> => {
        const response = await apiClient.get(`/ratings/orders/${orderId}`);
        return response.data;
    },
    getStoreRating: async (storeId: number): Promise<StoreRatingResponse> => {
        const response = await apiClient.get(`/ratings/stores/${storeId}`);
        return response.data;
    },
    getStoreReviews: async (storeId: number): Promise<RatingResponse[]> => {
        const response = await apiClient.get(`/ratings/stores/${storeId}/all`);
        return response.data;
    },
};