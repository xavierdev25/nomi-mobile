export const formatCurrency = (amount: number): string => {
    return `S/. ${amount.toFixed(2)}`;
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

export const generateOrderCode = (orderId: number): string => {
    return `#FV-${String(orderId).padStart(4, '0')}`;
};

export const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
};

export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const isValidPassword = (password: string): boolean => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
};