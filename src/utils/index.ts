import { Store } from '../types';

export const formatCurrency = (amount: number): string => {
    return `S/ ${amount.toFixed(2)}`;
};

export const formatCategory = (category: string): string => {
    return category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
};

export const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

export const getInitials = (nombres: string, apellidos: string): string => {
    return `${nombres.charAt(0)}${apellidos.charAt(0)}`.toUpperCase();
};

export const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
};

export const isStoreOpen = (store: Store): boolean => {
    if (!store.activo) return false;
    if (!store.horarioApertura || !store.horarioCierre) return store.activo;

    const now = new Date();
    const limaOffset = -5 * 60; // UTC-5
    const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
    const limaMinutes = (utcMinutes + limaOffset + 1440) % 1440;

    const [openH, openM] = store.horarioApertura.split(':').map(Number);
    const [closeH, closeM] = store.horarioCierre.split(':').map(Number);
    const openMinutes = openH * 60 + openM;
    const closeMinutes = closeH * 60 + closeM;

    return limaMinutes >= openMinutes && limaMinutes < closeMinutes;
};
