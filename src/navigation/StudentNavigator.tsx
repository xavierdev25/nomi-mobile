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
import { OrdersScreen } from "../screens/student/OrdersScreen";
import { OrderDetailScreen } from "../screens/student/OrderDetailScreen";
import { ProfileScreen } from "../screens/student/ProfileScreen";
import { StoreDetailScreen } from "../screens/student/StoreDetailScreen";
import { FavoriteProductsScreen } from "../screens/student/FavoriteProductsScreen";
import { FavoriteStoresScreen } from "../screens/student/FavoriteStoresScreen";
import { RecommendationsScreen } from "../screens/student/RecommendationsScreen";
import { Colors } from "@/theme/tokens";

const Tab = createBottomTabNavigator<StudentTabParamList>();
const Stack = createNativeStackNavigator<StudentStackParamList>();

const StudentTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: Colors.orange[500],
      tabBarInactiveTintColor: Colors.gray[400],
      tabBarStyle: {
        backgroundColor: Colors.blue[500],
        borderTopWidth: 0,
      },
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
    <Stack.Screen name="StoreDetail" component={StoreDetailScreen} />
    <Stack.Screen name="FavoriteProducts" component={FavoriteProductsScreen} />
    <Stack.Screen name="FavoriteStores" component={FavoriteStoresScreen} />
    <Stack.Screen name="Recommendations" component={RecommendationsScreen} />
  </Stack.Navigator>
);
