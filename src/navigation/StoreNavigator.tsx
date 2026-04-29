import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StoreStackParamList, StoreTabParamList } from './types';
import { View, Text } from 'react-native';

const DashboardScreen = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Dashboard</Text></View>;
const OrdersScreen = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Orders</Text></View>;
const ProductsScreen = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Products</Text></View>;
const ProfileScreen = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Profile</Text></View>;
const OrderDetailScreen = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Order Detail</Text></View>;
const ProductFormScreen = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Product Form</Text></View>;

const Tab = createBottomTabNavigator<StoreTabParamList>();
const Stack = createNativeStackNavigator<StoreStackParamList>();

const StoreTabs = () => (
  <Tab.Navigator screenOptions={{ headerShown: false }}>
    <Tab.Screen name="Dashboard" component={DashboardScreen} />
    <Tab.Screen name="Orders" component={OrdersScreen} />
    <Tab.Screen name="Products" component={ProductsScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

export const StoreNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="StoreTabs" component={StoreTabs} />
    <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
    <Stack.Screen name="ProductForm" component={ProductFormScreen} />
  </Stack.Navigator>
);