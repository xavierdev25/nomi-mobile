export type AuthStackParamList = {
    Welcome: undefined;
    Login: undefined;
    Register: undefined;
    SelectCampus: undefined;
};

export type StudentTabParamList = {
    Home: undefined;
    Search: undefined;
    Orders: undefined;
    Profile: undefined;
};

export type StudentStackParamList = {
    StudentTabs: undefined;
    ProductDetail: { productId: number };
    StoreDetail: { storeId: number };
    Cart: undefined;
    Checkout: undefined;
    OrderDetail: { orderId: number };
    OrderTracking: { orderId: number };
    Recommendations: undefined;
};

export type DeliveryTabParamList = {
    AvailableOrders: undefined;
    MyDeliveries: undefined;
    Earnings: undefined;
    Profile: undefined;
};

export type DeliveryStackParamList = {
    DeliveryTabs: undefined;
    OrderPickup: { orderId: number };
    DeliveryMap: { orderId: number };
    KycForm: undefined;
    KycPending: undefined;
};

export type StoreTabParamList = {
    Dashboard: undefined;
    Orders: undefined;
    Products: undefined;
    Profile: undefined;
};

export type StoreStackParamList = {
    StoreTabs: undefined;
    OrderDetail: { orderId: number };
    ProductForm: { productId?: number };
};

export type AdminTabParamList = {
    Dashboard: undefined;
    Users: undefined;
    Stores: undefined;
    Campus: undefined;
};

export type RootStackParamList = {
    Auth: undefined;
    Student: undefined;
    Delivery: undefined;
    Store: undefined;
    Admin: undefined;
};