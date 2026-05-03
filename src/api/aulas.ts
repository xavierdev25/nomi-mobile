import { apiClient } from './client';
import { Aula } from '../types';

export const aulasApi = {
  getActivas: async (): Promise<Aula[]> => {
    const response = await apiClient.get('/aulas/activas');
    return response.data;
  },
};
