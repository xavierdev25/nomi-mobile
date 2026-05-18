import { useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../constants';
import { paymentsApi } from '../api';

export type PaymentStatus = 'PENDIENTE' | 'APROBADO' | 'RECHAZADO' | 'CANCELADO';

const WS_URL = API_URL.replace('http://', 'ws://').replace('/api', '/api/ws');

export const usePaymentStatus = (orderId: number, userId: number) => {
    const [status, setStatus] = useState<PaymentStatus>('PENDIENTE');
    const [loading, setLoading] = useState(true);
    const clientRef = useRef<Client | null>(null);
    const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const fetchStatus = async () => {
        try {
            const payment = await paymentsApi.getByOrder(orderId);
            setStatus(payment.status as PaymentStatus);
            if (payment.status === 'APROBADO' || payment.status === 'RECHAZADO' || payment.status === 'CANCELADO') {
                clearPolling();
            }
        } catch {
            // silencioso
        } finally {
            setLoading(false);
        }
    };

    const clearPolling = () => {
        if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
        }
    };

    useEffect(() => {
        let mounted = true;

        const connect = async () => {
            const token = await SecureStore.getItemAsync('accessToken');
            if (!token || !mounted) {
                setLoading(false);
                return;
            }
            await fetchStatus();
            pollingRef.current = setInterval(fetchStatus, 5000);

            const client = new Client({
                brokerURL: WS_URL,
                connectHeaders: { Authorization: `Bearer ${token}` },
                reconnectDelay: 5000,
                onConnect: () => {
                    client.subscribe(`/topic/user/${userId}`, (message) => {
                        try {
                            const event = JSON.parse(message.body);
                            if (event.orderId === orderId && event.type === 'PAYMENT_APPROVED') {
                                if (mounted) setStatus('APROBADO');
                                clearPolling();
                            } else if (event.orderId === orderId && event.type === 'PAYMENT_REJECTED') {
                                if (mounted) setStatus('RECHAZADO');
                                clearPolling();
                            }
                        } catch { /* ignorar */ }
                    });
                },
                onDisconnect: () => {
                    // Polling sigue activo como fallback
                },
            });

            client.activate();
            clientRef.current = client;
        };

        connect();

        return () => {
            mounted = false;
            clearPolling();
            clientRef.current?.deactivate();
        };
    }, [orderId, userId]);

    return { status, loading };
};
