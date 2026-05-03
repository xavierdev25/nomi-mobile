export const API_URL = 'http://192.168.18.89:8080/api';

export const ROLES = {
    ESTUDIANTE: 'ESTUDIANTE',
    REPARTIDOR: 'REPARTIDOR',
    COMERCIO: 'COMERCIO',
    ADMIN: 'ADMIN',
} as const;

export const ORDER_STATUS = {
    PENDIENTE: 'PENDIENTE',
    PREPARANDO: 'PREPARANDO',
    LISTO_PARA_RECOGER: 'LISTO_PARA_RECOGER',
    EN_CAMINO: 'EN_CAMINO',
    ENTREGADO: 'ENTREGADO',
    CANCELADO: 'CANCELADO',
} as const;

export const ORDER_STATUS_LABEL: Record<string, string> = {
    PENDIENTE: 'Pendiente',
    PREPARANDO: 'En preparación',
    LISTO_PARA_RECOGER: 'Listo para recoger',
    EN_CAMINO: 'En camino',
    ENTREGADO: 'Entregado',
    CANCELADO: 'Cancelado',
};

export const ORDER_STATUS_COLOR: Record<string, string> = {
    PENDIENTE: '#F59E0B',
    PREPARANDO: '#3B82F6',
    LISTO_PARA_RECOGER: '#8B5CF6',
    EN_CAMINO: '#F97316',
    ENTREGADO: '#10B981',
    CANCELADO: '#EF4444',
};

export const PRODUCT_CATEGORIES = {
    COMIDA: 'Comida',
    BEBIDA: 'Bebida',
    SNACK: 'Snack',
    POSTRE: 'Postre',
    OTRO: 'Otro',
} as const;

export const VERIFICATION_STATUS = {
    PENDIENTE: 'PENDIENTE',
    VERIFICADO: 'VERIFICADO',
    RECHAZADO: 'RECHAZADO',
    SUSPENDIDO: 'SUSPENDIDO',
} as const;

export const BUDGET_RANGE = {
    BAJO: 'Menos de S/. 5',
    MEDIO: 'S/. 5 - S/. 15',
    ALTO: 'Más de S/. 15',
} as const;