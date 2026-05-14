export interface User {
    id: number;
    nombres: string;
    apellidos: string;
    email: string;
    telefono?: string;
    role: 'ESTUDIANTE' | 'REPARTIDOR' | 'COMERCIO' | 'ADMIN';
    esRepartidor?: boolean;
    campusId?: number;
    activo: boolean;
    creadoEn: string;
    preferences?: string[];
    restrictions?: string[];
    budgetRange?: string;
    cuisineTypes?: string[];
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresIn: number;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    nombres: string;
    apellidos: string;
    email: string;
    password: string;
    telefono?: string;
    role: string;
    preferences?: string[];
    restrictions?: string[];
    budgetRange?: string;
    cuisineTypes?: string[];
}

export interface Product {
    id: number;
    nombre: string;
    descripcion?: string;
    precio: number;
    stock: number;
    imagenUrl?: string;
    categoria: string;
    storeId: number;
    activo: boolean;
    disponible: boolean;
    creadoEn: string;
}

export interface Store {
    id: number;
    nombre: string;
    descripcion?: string;
    imagenUrl?: string;
    telefono?: string;
    ownerId: number;
    activo: boolean;
    creadoEn: string;
    horarioApertura?: string;
    horarioCierre?: string;
}

export interface OrderItem {
    id: number;
    productId: number;
    productNombre: string;
    productPrecio: number;
    cantidad: number;
    subtotal: number;
}

export interface Order {
    id: number;
    userId: number;
    storeId: number;
    aulaId: number;
    repartidorId?: number;
    items: OrderItem[];
    total: number;
    propina?: number;
    tarifaServicio?: number;
    comisionFoodv?: number;
    status: string;
    statusDescripcion?: string;
    notas?: string;
    motivoCancelacion?: string;
    canceladoPor?: number;
    codigoConfirmacion?: string;
    fotoEntregaUrl?: string;
    creadoEn: string;
    actualizadoEn: string;
}

export interface CreateOrderRequest {
    storeId: number;
    aulaId: number;
    items: { productId: number; cantidad: number }[];
    notas?: string;
    propina?: number;
}

export interface PaymentResponse {
    id: number;
    orderId: number;
    userId: number;
    amount: number;
    status: string;
    externalId: string;
    paymentUrl: string;
    failureReason?: string;
    creadoEn: string;
    actualizadoEn: string;
}

export interface Aula {
    id: number;
    codigo: string;
    nombre: string;
    piso?: string;
    pabellon?: string;
    activo: boolean;
}

export interface Recommendation {
    productId: number;
    nombre: string;
    precio: number;
    categoria: string;
    score: number;
    reason: string;
}

export interface RecommendationResponse {
    userId: number;
    recommendations: Recommendation[];
    generatedBy: string;
}

export interface CartItem {
    product: Product;
    cantidad: number;
}

export interface RepartidorPerfil {
    id: number;
    userId: number;
    dni: string;
    fotoRostroUrl?: string;
    fotoDniFrontalUrl?: string;
    fotoDniPosteriorUrl?: string;
    contactoEmergenciaNombre?: string;
    contactoEmergenciaTelefono?: string;
    estadoVerificacion: string;
    motivoRechazo?: string;
    activo: boolean;
    rating: number;
    totalEntregas: number;
    totalCancelaciones: number;
    creadoEn: string;
}

export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
}

export interface ApiError {
    error: string;
    message: string;
    status: number;
    timestamp: string;
}

export interface FavoriteProduct {
    id: number;
    userId: number;
    productId: number;
    creadoEn: string;
}

export interface FavoriteStore {
    id: number;
    userId: number;
    storeId: number;
    creadoEn: string;
}