import React from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Image, ActivityIndicator, Dimensions
} from "react-native";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { analyticsApi, propertyApi } from "../services/api";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const COLORS = { primary: "#1e40af", accent: "#059669", bg: "#f8fafc", card: "#ffffff", text: "#111827", muted: "#6b7280" };

export default function HomeScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();

  const { data: overview, isLoading } = useQuery({
    queryKey: ["market-overview"],
    queryFn: () => analyticsApi.getMarketOverview().then((r) => r.data),
  });

  const { data: properties } = useQuery({
    queryKey: ["properties-latest"],
    queryFn: () => propertyApi.getList({ per_page: 4 }).then((r) => r.data),
  });

  const districtStats = overview?.district_stats?.slice(0, 6) || [];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero */}
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>{t("home.hero_title")}</Text>
        <Text style={styles.heroSubtitle}>{t("home.hero_subtitle")}</Text>
        <View style={styles.heroButtons}>
          <TouchableOpacity
            style={styles.heroBtnPrimary}
            onPress={() => navigation.navigate("Estimate")}
          >
            <Ionicons name="calculator-outline" size={18} color="white" />
            <Text style={styles.heroBtnPrimaryText}>{t("home.btn_estimate")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.heroBtnSecondary}
            onPress={() => navigation.navigate("Properties")}
          >
            <Ionicons name="home-outline" size={18} color={COLORS.primary} />
            <Text style={styles.heroBtnSecondaryText}>{t("home.btn_properties")}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        {[
          { label: "E'lonlar", value: overview?.total_listings?.toLocaleString() || "—", icon: "home" },
          { label: "O'rtacha narx", value: overview ? `$${overview.avg_price_usd?.toLocaleString()}` : "—", icon: "cash" },
          { label: "1 m²", value: overview ? `$${overview.avg_price_per_sqm?.toLocaleString()}` : "—", icon: "trending-up" },
        ].map((stat) => (
          <View key={stat.label} style={styles.statCard}>
            <Ionicons name={stat.icon as any} size={22} color={COLORS.primary} />
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Districts */}
      {districtStats.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Toshkent tumanlari</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {districtStats.map((d: any) => (
              <TouchableOpacity
                key={d.code}
                style={styles.districtCard}
                onPress={() => navigation.navigate("Properties", { district_code: d.code })}
              >
                <Ionicons name="location" size={16} color={COLORS.primary} />
                <Text style={styles.districtName}>{d.name_uz?.replace(" tumani", "")}</Text>
                <Text style={styles.districtPrice}>${d.avg_price_per_sqm?.toLocaleString()}</Text>
                <Text style={styles.districtLabel}>1 m²</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Latest properties */}
      {properties?.items?.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>So'nggi e'lonlar</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Properties")}>
              <Text style={styles.seeAll}>Hammasi →</Text>
            </TouchableOpacity>
          </View>
          {properties.items.map((p: any) => (
            <TouchableOpacity
              key={p.id}
              style={styles.propertyCard}
              onPress={() => navigation.navigate("PropertyDetail", { id: p.id })}
            >
              <View style={styles.propImage}>
                <Ionicons name="home" size={32} color={COLORS.muted} />
              </View>
              <View style={styles.propInfo}>
                <Text style={styles.propTitle} numberOfLines={1}>
                  {p.rooms} xona, {p.area_total} m²
                </Text>
                <Text style={styles.propDistrict}>{p.district?.name_uz}</Text>
                <Text style={styles.propPrice}>${p.price_usd?.toLocaleString()}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.muted} />
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  hero: {
    backgroundColor: COLORS.primary,
    padding: 24,
    paddingTop: 40,
    paddingBottom: 32,
  },
  heroTitle: { fontSize: 26, fontWeight: "800", color: "white", marginBottom: 10, lineHeight: 34 },
  heroSubtitle: { fontSize: 14, color: "rgba(255,255,255,0.8)", marginBottom: 24, lineHeight: 22 },
  heroButtons: { flexDirection: "row", gap: 12 },
  heroBtnPrimary: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, backgroundColor: "#facc15", borderRadius: 14, paddingVertical: 14,
  },
  heroBtnPrimaryText: { color: "#1f2937", fontWeight: "700", fontSize: 15 },
  heroBtnSecondary: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, backgroundColor: "white", borderRadius: 14, paddingVertical: 14,
  },
  heroBtnSecondaryText: { color: COLORS.primary, fontWeight: "700", fontSize: 15 },
  statsRow: { flexDirection: "row", gap: 12, margin: 16, marginTop: -20 },
  statCard: {
    flex: 1, backgroundColor: "white", borderRadius: 16, padding: 14,
    alignItems: "center", shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  statValue: { fontSize: 15, fontWeight: "800", color: COLORS.text, marginTop: 6 },
  statLabel: { fontSize: 10, color: COLORS.muted, marginTop: 2, textAlign: "center" },
  section: { marginHorizontal: 16, marginTop: 20 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: COLORS.text, marginBottom: 14 },
  seeAll: { fontSize: 13, color: COLORS.primary, fontWeight: "600" },
  districtCard: {
    backgroundColor: "white", borderRadius: 16, padding: 14, marginRight: 10,
    width: 130, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  districtName: { fontSize: 12, fontWeight: "600", color: COLORS.text, marginTop: 6, marginBottom: 4 },
  districtPrice: { fontSize: 20, fontWeight: "800", color: COLORS.primary },
  districtLabel: { fontSize: 10, color: COLORS.muted },
  propertyCard: {
    backgroundColor: "white", borderRadius: 16, padding: 14, marginBottom: 10,
    flexDirection: "row", alignItems: "center", gap: 12,
    shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
  },
  propImage: {
    width: 60, height: 60, backgroundColor: "#f3f4f6",
    borderRadius: 12, alignItems: "center", justifyContent: "center",
  },
  propInfo: { flex: 1 },
  propTitle: { fontSize: 14, fontWeight: "600", color: COLORS.text },
  propDistrict: { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  propPrice: { fontSize: 16, fontWeight: "700", color: COLORS.primary, marginTop: 4 },
});
