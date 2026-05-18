import { Colors } from '@/theme/tokens';

export const API_URL = `${process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080'}/api`;

export const TARIFA_SERVICIO = 1.50;
export const COMISION_FOODV = 0.50;
export const MAX_TIP_RATIO = 0.5; // Max tip is 50% of subtotal

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
    PENDIENTE: Colors.warning,
    PREPARANDO: Colors.blue[400],
    LISTO_PARA_RECOGER: Colors.blue[500],
    EN_CAMINO: Colors.orange[500],
    ENTREGADO: Colors.success,
    CANCELADO: Colors.error,
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
    BAJO: 'Menos de S/ 5',
    MEDIO: 'S/ 5 - S/ 15',
    ALTO: 'Más de S/ 15',
} as const;
