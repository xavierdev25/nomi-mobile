import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StudentStackParamList, StudentTabParamList } from './types';
import { View, Text } from 'react-native';
import { HomeScreen } from '../screens/student/HomeScreen';

// Placeholder screens
const SearchScreen = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Search</Text></View>;
const OrdersScreen = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Orders</Text></View>;
const ProfileScreen = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Profile</Text></View>;
const ProductDetailScreen = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Product Detail</Text></View>;
const CartScreen = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Cart</Text></View>;
const CheckoutScreen = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Checkout</Text></View>;
const OrderDetailScreen = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Order Detail</Text></View>;

const Tab = createBottomTabNavigator<StudentTabParamList>();
const Stack = createNativeStackNavigator<StudentStackParamList>();

const StudentTabs = () => (
  <Tab.Navigator screenOptions={{ headerShown: false }}>
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Search" component={SearchScreen} />
    <Tab.Screen name="Orders" component={OrdersScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

export const StudentNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="StudentTabs" component={StudentTabs} />
    <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
    <Stack.Screen name="Cart" component={CartScreen} />
    <Stack.Screen name="Checkout" component={CheckoutScreen} />
    <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
  </Stack.Navigator>
);