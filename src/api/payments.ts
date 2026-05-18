import { apiClient } from './client';
import { PaymentResponse } from '../types';

export const paymentsApi = {
  create: async (orderId: number): Promise<PaymentResponse> => {
    try {
      const response = await apiClient.post('/payments', { orderId, backUrl: 'foodv://payment-result' });
      return response.data;
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error
      ) {
        const axiosError = error as {
          response: { status: number; data: unknown };
        };
        console.error(
          '[paymentsApi.create] HTTP error |',
          'status:', axiosError.response.status,
          '| body:', JSON.stringify(axiosError.response.data, null, 2),
        );
      } else {
        console.error('[paymentsApi.create] Unexpected error:', error);
      }
      throw error; // re-lanza para que handlePagar lo capture
    }
  },

  getByOrder: async (orderId: number): Promise<PaymentResponse> => {
    const response = await apiClient.get(`/payments/order/${orderId}`);
    return response.data;
  },
};