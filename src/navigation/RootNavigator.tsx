import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { useAuthStore } from '../store';
import { AuthNavigator } from './AuthNavigator';
import { StudentNavigator } from './StudentNavigator';
import { DeliveryNavigator } from './DeliveryNavigator';
import { StoreNavigator } from './StoreNavigator';
import { View, ActivityIndicator } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { authApi } from '../api';
import { Colors } from '@/theme/tokens';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  const { isAuthenticated, isLoading, user, setAuth, clearAuth } = useAuthStore();

  useEffect(() => {
    const init = async () => {
      try {
        const accessToken = await SecureStore.getItemAsync('accessToken');
        const refreshToken = await SecureStore.getItemAsync('refreshToken');

        if (accessToken && refreshToken) {
          try {
            const userData = await authApi.me();
            await setAuth(userData, accessToken, refreshToken);
          } catch {
            await clearAuth();
          }
        } else {
          useAuthStore.setState({ isLoading: false });
        }
      } catch {
        useAuthStore.setState({ isLoading: false });
      }
    };
    init();
  }, [clearAuth, setAuth]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.blue[500] }}>
        <ActivityIndicator size="large" color={Colors.white} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated || !user ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : user.role === 'COMERCIO' ? (
        <Stack.Screen name="Store" component={StoreNavigator} />
      ) : user.role === 'REPARTIDOR' ? (
        <Stack.Screen name="Delivery" component={DeliveryNavigator} />
      ) : (
        <Stack.Screen name="Student" component={StudentNavigator} />
      )}
    </Stack.Navigator>
  );
};
