import React from "react";
import { Colors } from "@/theme/tokens";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useQuery } from "@tanstack/react-query";
import { aiApi } from "../../api";
import { StudentStackParamList } from "../../navigation/types";
import { Recommendation } from "../../types";
import { formatCurrency } from "../../utils";

type Props = NativeStackScreenProps<StudentStackParamList, "Recommendations">;

export const RecommendationsScreen = ({ navigation }: Props) => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["recommendations", 20],
    queryFn: () => aiApi.getRecommendations(20),
    retry: 1,
  });

  const recommendations = data?.recommendations ?? [];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🤖 Recomendaciones IA</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {isLoading ? (
          <ActivityIndicator
            size="large"
            color={Colors.orange[500]}
            style={styles.loader}
          />
        ) : isError ? (
          <View style={styles.centered}>
            <Ionicons
              name="alert-circle-outline"
              size={48}
              color={Colors.error}
            />
            <Text style={styles.errorText}>
              No pudimos cargar las recomendaciones
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
              <Text style={styles.retryButtonText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : recommendations.length === 0 ? (
          <View style={styles.centered}>
            <Ionicons
              name="sparkles-outline"
              size={48}
              color={Colors.gray[300]}
            />
            <Text style={styles.emptyTitle}>Sin recomendaciones aún</Text>
            <Text style={styles.emptySubtitle}>
              Realiza pedidos para que la IA aprenda tus gustos
            </Text>
          </View>
        ) : (
          recommendations.map((rec) => (
            <RecommendationCard
              key={rec.productId}
              rec={rec}
              onPress={() =>
                navigation.navigate("ProductDetail", {
                  productId: rec.productId,
                })
              }
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const RecommendationCard = ({
  rec,
  onPress,
}: {
  rec: Recommendation;
  onPress: () => void;
}) => (
  <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
    <View style={styles.cardImagePlaceholder}>
      <Text style={styles.cardEmoji}>🍽️</Text>
    </View>
    <View style={styles.cardInfo}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardName} numberOfLines={1}>
          {rec.nombre}
        </Text>
        <View style={styles.scoreBadge}>
          <Text style={styles.scoreText}>
            ⭐ {(rec.score * 10).toFixed(0)}
          </Text>
        </View>
      </View>
      <Text style={styles.cardReason} numberOfLines={2}>
        {rec.reason}
      </Text>
      <Text style={styles.cardPrice}>{formatCurrency(rec.precio)}</Text>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.offWhite },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.blue[500],
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.blue[400],
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "800", color: Colors.white },
  headerSpacer: { width: 40 },
  content: { padding: 16, gap: 12, flexGrow: 1 },
  loader: { marginTop: 40 },
  centered: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingTop: 60,
  },
  errorText: { fontSize: 15, color: Colors.gray[600], textAlign: "center" },
  retryButton: {
    backgroundColor: Colors.orange[500],
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  retryButtonText: { color: Colors.white, fontWeight: "700" },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: Colors.gray[600] },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.gray[400],
    textAlign: "center",
    paddingHorizontal: 32,
  },
  card: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 3,
    shadowColor: Colors.blue[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  cardImagePlaceholder: {
    width: 90,
    backgroundColor: Colors.gray[100],
    justifyContent: "center",
    alignItems: "center",
  },
  cardEmoji: { fontSize: 32 },
  cardInfo: { flex: 1, padding: 14, gap: 4 },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  cardName: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: Colors.blue[900],
  },
  scoreBadge: {
    backgroundColor: Colors.blue[900],
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  scoreText: { fontSize: 11, color: Colors.white, fontWeight: "600" },
  cardReason: { fontSize: 12, color: Colors.gray[600], lineHeight: 18 },
  cardPrice: { fontSize: 16, fontWeight: "700", color: Colors.orange[500] },
});
