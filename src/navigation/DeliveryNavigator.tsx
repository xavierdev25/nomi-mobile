import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DeliveryStackParamList, DeliveryTabParamList } from './types';
import { View, Text } from 'react-native';

const AvailableOrdersScreen = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Available Orders</Text></View>;
const MyDeliveriesScreen = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>My Deliveries</Text></View>;
const EarningsScreen = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Earnings</Text></View>;
const ProfileScreen = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Profile</Text></View>;
const OrderPickupScreen = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Order Pickup</Text></View>;
const KycFormScreen = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>KYC Form</Text></View>;
const KycPendingScreen = () => <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>KYC Pending</Text></View>;

const Tab = createBottomTabNavigator<DeliveryTabParamList>();
const Stack = createNativeStackNavigator<DeliveryStackParamList>();

const DeliveryTabs = () => (
  <Tab.Navigator screenOptions={{ headerShown: false }}>
    <Tab.Screen name="AvailableOrders" component={AvailableOrdersScreen} />
    <Tab.Screen name="MyDeliveries" component={MyDeliveriesScreen} />
    <Tab.Screen name="Earnings" component={EarningsScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

export const DeliveryNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="DeliveryTabs" component={DeliveryTabs} />
    <Stack.Screen name="OrderPickup" component={OrderPickupScreen} />
    <Stack.Screen name="KycForm" component={KycFormScreen} />
    <Stack.Screen name="KycPending" component={KycPendingScreen} />
  </Stack.Navigator>
);