import { apiClient } from './client';
import { RecommendationResponse } from '../types';

export const aiApi = {
    getRecommendations: async (maxRecommendations = 5): Promise<RecommendationResponse> => {
        const response = await apiClient.get(`/ai/recommendations?maxRecommendations=${maxRecommendations}`);
        return response.data;
    },

    submitFeedback: async (productId: number, liked: boolean): Promise<void> => {
        await apiClient.post('/ai/recommendations/feedback', { productId, liked });
    },
};