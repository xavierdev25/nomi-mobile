import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { Subscription } from 'expo-notifications';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,  // ← nuevo
        shouldShowList: true,    // ← nuevo
    }),
});

export const useNotifications = () => {
    const notificationListener = useRef<Subscription | null>(null);  // ← tipado
    const responseListener = useRef<Subscription | null>(null);      // ← tipado

    const registerForPushNotifications = async () => {
        if (!Device.isDevice) return null;

        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') return null;

        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'FoodV',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#F97316',
            });
        }

        const token = await Notifications.getExpoPushTokenAsync();
        console.log('Expo Push Token:', token.data);
        return token.data;
    };

    useEffect(() => {
        registerForPushNotifications();

        notificationListener.current = Notifications.addNotificationReceivedListener(
            (notification) => {
                console.log('Notificación recibida:', notification);
            }
        );

        responseListener.current = Notifications.addNotificationResponseReceivedListener(
            (response) => {
                console.log('Notificación tocada:', response);
            }
        );

        return () => {
            if (notificationListener.current) {
                notificationListener.current.remove();  // ← reemplaza removeNotificationSubscription
            }
            if (responseListener.current) {
                responseListener.current.remove();
            }
        };
    }, []);
};