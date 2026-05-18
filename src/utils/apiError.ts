import { AxiosError } from 'axios';

export function getApiErrorMessage(error: unknown, fallback = 'Ocurrió un error inesperado'): string {
    if (error instanceof AxiosError) {
        return error.response?.data?.message ?? error.message ?? fallback;
    }
    if (error instanceof Error) return error.message;
    return fallback;
}
