import React from "react";
import { StatusBar, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, Card } from "@/components/ui";
import { Colors, Radius, Spacing } from "@/theme/tokens";
import { TextStyles } from "@/theme/typography";
import { AuthStackParamList } from "@/navigation/types";

type WelcomeScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, "Welcome">;
};

const FEATURES = [
  { icon: "flash-outline" as const, title: "Entrega rápida", desc: "Recibe tu pedido en el aula." },
  { icon: "sparkles-outline" as const, title: "IA FoodV", desc: "Recomendaciones según tus gustos." },
  { icon: "wallet-outline" as const, title: "Gana dinero", desc: "Reparte dentro del campus." },
];

export const WelcomeScreen = ({ navigation }: WelcomeScreenProps) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.blue[500]} />

      <View style={[styles.header, { paddingTop: insets.top + Spacing[8] }]}>
        <View style={styles.orangeBlock} />
        <View style={styles.whiteCircle} />

        <View style={styles.logoBox}>
          <Text style={styles.logoMark}>F</Text>
        </View>
        <View>
          <Text style={styles.appName}>FoodV</Text>
          <Text style={styles.tagline}>Delivery universitario directo a tu aula</Text>
        </View>
      </View>

      <View style={[styles.body, { paddingBottom: insets.bottom + Spacing[5] }]}>
        {FEATURES.map((feature) => (
          <Card key={feature.title} variant="flat" style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <Ionicons name={feature.icon} size={22} color={Colors.orange[500]} />
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDesc}>{feature.desc}</Text>
            </View>
          </Card>
        ))}

        <View style={styles.actions}>
          <Button label="Comenzar ahora" fullWidth onPress={() => navigation.navigate("Register")} />
          <Button label="Ya tengo cuenta" fullWidth variant="outline" onPress={() => navigation.navigate("Login")} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.blue[500],
  },
  header: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing[6],
    overflow: "hidden",
  },
  orangeBlock: {
    position: "absolute",
    width: 180,
    height: 220,
    borderRadius: Radius["2xl"],
    backgroundColor: Colors.orange[500],
    right: -56,
    top: 80,
    transform: [{ rotate: "18deg" }],
  },
  whiteCircle: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: Colors.white,
    opacity: 0.06,
    left: -80,
    bottom: 20,
  },
  logoBox: {
    width: 104,
    height: 104,
    borderRadius: Radius["2xl"],
    backgroundColor: Colors.white,
    borderWidth: 3,
    borderColor: Colors.orange[500],
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing[5],
  },
  logoMark: {
    ...TextStyles.display,
    color: Colors.orange[500],
  },
  appName: {
    ...TextStyles.display,
    color: Colors.white,
    textAlign: "center",
  },
  tagline: {
    ...TextStyles.body,
    color: Colors.white,
    textAlign: "center",
    marginTop: Spacing[2],
  },
  body: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: Radius["2xl"],
    borderTopRightRadius: Radius["2xl"],
    paddingHorizontal: Spacing[6],
    paddingTop: Spacing[6],
    gap: Spacing[3],
  },
  featureCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing[3],
    backgroundColor: Colors.offWhite,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.lg,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    ...TextStyles.bodyStrong,
  },
  featureDesc: {
    ...TextStyles.body,
    color: Colors.gray[600],
  },
  actions: {
    gap: Spacing[3],
    marginTop: Spacing[2],
  },
});
