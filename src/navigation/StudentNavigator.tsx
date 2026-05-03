import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { StudentStackParamList, StudentTabParamList } from "./types";
import { View, Text } from "react-native";
import { HomeScreen } from "../screens/student/HomeScreen";
import { SearchScreen } from "../screens/student/SearchScreen";
import { ProductDetailScreen } from "../screens/student/ProductDetailScreen";
import { CartScreen } from "../screens/student/CartScreen";
import { CheckoutScreen } from "../screens/student/CheckoutScreen";
import { OrderTrackingScreen } from "../screens/student/OrderTrackingScreen";

// Placeholder screens
const OrdersScreen = () => (
  <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    <Text>Orders</Text>
  </View>
);
const ProfileScreen = () => (
  <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    <Text>Profile</Text>
  </View>
);
const OrderDetailScreen = () => (
  <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    <Text>Order Detail</Text>
  </View>
);

const Tab = createBottomTabNavigator<StudentTabParamList>();
const Stack = createNativeStackNavigator<StudentStackParamList>();

const StudentTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: "#F97316",
      tabBarInactiveTintColor: "#9CA3AF",
      tabBarIcon: ({ focused, color, size }) => {
        const icons: Record<
          keyof StudentTabParamList,
          keyof typeof Ionicons.glyphMap
        > = {
          Home: focused ? "home" : "home-outline",
          Search: focused ? "search" : "search-outline",
          Orders: focused ? "receipt" : "receipt-outline",
          Profile: focused ? "person" : "person-outline",
        };

        return <Ionicons name={icons[route.name]} size={size} color={color} />;
      },
    })}
  >
    <Tab.Screen
      name="Home"
      component={HomeScreen}
      options={{ title: "Inicio" }}
    />
    <Tab.Screen
      name="Search"
      component={SearchScreen}
      options={{ title: "Buscar" }}
    />
    <Tab.Screen
      name="Orders"
      component={OrdersScreen}
      options={{ title: "Pedidos" }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{ title: "Perfil" }}
    />
  </Tab.Navigator>
);

export const StudentNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="StudentTabs" component={StudentTabs} />
    <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
    <Stack.Screen name="Cart" component={CartScreen} />
    <Stack.Screen name="Checkout" component={CheckoutScreen} />
    <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
    <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} />
  </Stack.Navigator>
);
