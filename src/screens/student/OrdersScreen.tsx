import React, { useCallback } from "react";
import { Colors } from "@/theme/tokens";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { ordersApi } from "../../api";
import { useAuthStore } from "../../store/authStore";
import { Order } from "../../types";
import { ORDER_STATUS_LABEL, ORDER_STATUS_COLOR } from "../../constants";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { StudentStackParamList } from "../../navigation/types";

const formatPrice = (amount: number) => `S/ ${amount.toFixed(2)}`;
const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const OrderCard = ({
  order,
  onPress,
}: {
  order: Order;
  onPress: () => void;
}) => {
  const statusColor = ORDER_STATUS_COLOR[order.status] ?? Colors.gray[600];
  const statusLabel = ORDER_STATUS_LABEL[order.status] ?? order.status;
  const itemCount = order.items.reduce((sum, i) => sum + i.cantidad, 0);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.cardHeader}>
        <Text style={styles.orderId}>Pedido #{order.id}</Text>
        <View
          style={[styles.statusBadge, { backgroundColor: statusColor + "20" }]}
        >
          <Text style={[styles.statusText, { color: statusColor }]}>
            {statusLabel}
          </Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.itemsSummary}>
          {order.items
            .slice(0, 2)
            .map((i) => `${i.productNombre} x${i.cantidad}`)
            .join(", ")}
          {order.items.length > 2 ? ` +${order.items.length - 2} más` : ""}
        </Text>
        <Text style={styles.itemCount}>
          {itemCount} {itemCount === 1 ? "producto" : "productos"}
        </Text>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.date}>{formatDate(order.creadoEn)}</Text>
        <Text style={styles.total}>{formatPrice(order.total)}</Text>
      </View>
    </TouchableOpacity>
  );
};

export const OrdersScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<StudentStackParamList>>();
  const user = useAuthStore((state) => state.user);

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["orders", "mine", user?.id],
    queryFn: () => ordersApi.getMyOrders(user!.id),
    enabled: !!user?.id,
  });

  const orders = data?.content ?? [];

  const handlePress = useCallback(
    (orderId: number) => {
      navigation.navigate("OrderDetail", { orderId });
    },
    [navigation],
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mis pedidos</Text>
        </View>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.orange[500]} />
        </View>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mis pedidos</Text>
        </View>
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={48} color={Colors.error} />
          <Text style={styles.errorText}>No pudimos cargar tus pedidos</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => refetch()}
          >
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mis pedidos</Text>
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={
          orders.length === 0 ? styles.emptyContainer : styles.listContent
        }
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={refetch}
            tintColor={Colors.orange[500]}
          />
        }
        renderItem={({ item }) => (
          <OrderCard order={item} onPress={() => handlePress(item.id)} />
        )}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Ionicons name="receipt-outline" size={64} color={Colors.gray[300]} />
            <Text style={styles.emptyTitle}>Sin pedidos aún</Text>
            <Text style={styles.emptySubtitle}>
              Tus pedidos aparecerán aquí
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.offWhite },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: Colors.blue[500],
  },
  headerTitle: { fontSize: 24, fontWeight: "800", color: Colors.white },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  listContent: { padding: 16, gap: 12 },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: Colors.gray[600] },
  emptySubtitle: { fontSize: 14, color: Colors.gray[600], textAlign: "center" },
  errorText: { fontSize: 15, color: Colors.gray[600], textAlign: "center" },
  retryButton: {
    backgroundColor: Colors.orange[500],
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  retryButtonText: { color: Colors.white, fontWeight: "700" },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: Colors.blue[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  orderId: { fontSize: 15, fontWeight: "800", color: Colors.blue[900] },
  statusBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 12, fontWeight: "700" },
  cardBody: { marginBottom: 12 },
  itemsSummary: { fontSize: 13, color: Colors.gray[600], marginBottom: 4 },
  itemCount: { fontSize: 12, color: Colors.gray[400] },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  date: { fontSize: 12, color: Colors.gray[400] },
  total: { fontSize: 16, fontWeight: "800", color: Colors.orange[500] },
});
