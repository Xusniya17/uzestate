import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, ActivityIndicator } from "react-native";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { propertyApi } from "../services/api";
import { Ionicons } from "@expo/vector-icons";

const COLORS = { primary: "#1e40af", bg: "#f8fafc", text: "#111827", muted: "#6b7280", border: "#e5e7eb" };

export default function PropertiesScreen({ navigation }: any) {
  const { t } = useTranslation();
  const [dealType, setDealType] = useState("sale");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["properties", dealType, page],
    queryFn: () => propertyApi.getList({ deal_type: dealType, page, per_page: 10 }).then((r) => r.data),
  });

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate("PropertyDetail", { id: item.id })}
    >
      <View style={styles.cardImage}>
        <Ionicons name="home" size={28} color={COLORS.muted} />
      </View>
      <View style={styles.cardContent}>
        <View style={styles.cardTop}>
          <Text style={styles.cardDistrict}>{item.district?.name_uz}</Text>
          <Text style={styles.cardPrice}>${item.price_usd?.toLocaleString()}</Text>
        </View>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {item.rooms} xona · {item.area_total} m² · {item.floor}/{item.total_floors} qavat
        </Text>
        <View style={styles.cardTags}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{t(`estimate.building_${item.building_type}`) || item.building_type}</Text>
          </View>
          <View style={[styles.tag, { backgroundColor: item.is_negotiable ? "#dcfce7" : "#f3f4f6" }]}>
            <Text style={[styles.tagText, { color: item.is_negotiable ? "#166534" : COLORS.muted }]}>
              {item.is_negotiable ? "Kelishiladi" : "Narx aniq"}
            </Text>
          </View>
        </View>
        <Text style={styles.sqmPrice}>${Math.round(item.price_usd / item.area_total).toLocaleString()}/m²</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t("nav.properties")}</Text>
        <View style={styles.tabs}>
          {[["sale", "Sotish"], ["rent", "Ijara"]].map(([val, label]) => (
            <TouchableOpacity
              key={val}
              style={[styles.tab, dealType === val && styles.tabActive]}
              onPress={() => { setDealType(val); setPage(1); }}
            >
              <Text style={[styles.tabText, dealType === val && styles.tabTextActive]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : data?.items?.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="home-outline" size={48} color={COLORS.muted} />
          <Text style={styles.emptyText}>{t("properties.no_results")}</Text>
        </View>
      ) : (
        <FlatList
          data={data?.items || []}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { backgroundColor: COLORS.primary, padding: 20, paddingTop: 20, paddingBottom: 16 },
  headerTitle: { fontSize: 22, fontWeight: "800", color: "white", marginBottom: 12 },
  tabs: { flexDirection: "row", backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 12, padding: 4 },
  tab: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: "center" },
  tabActive: { backgroundColor: "white" },
  tabText: { fontSize: 14, fontWeight: "600", color: "rgba(255,255,255,0.8)" },
  tabTextActive: { color: COLORS.primary },
  loader: { flex: 1, alignItems: "center", justifyContent: "center" },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  emptyText: { fontSize: 16, color: COLORS.muted },
  list: { padding: 16, gap: 12 },
  card: {
    backgroundColor: "white", borderRadius: 18, flexDirection: "row",
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8, elevation: 3, overflow: "hidden",
  },
  cardImage: {
    width: 90, backgroundColor: "#f3f4f6",
    alignItems: "center", justifyContent: "center",
  },
  cardContent: { flex: 1, padding: 14 },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 },
  cardDistrict: { fontSize: 12, color: COLORS.muted },
  cardPrice: { fontSize: 16, fontWeight: "800", color: COLORS.primary },
  cardTitle: { fontSize: 13, color: COLORS.text, marginBottom: 8 },
  cardTags: { flexDirection: "row", gap: 6, marginBottom: 6 },
  tag: { backgroundColor: "#f3f4f6", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  tagText: { fontSize: 11, color: COLORS.muted, fontWeight: "600" },
  sqmPrice: { fontSize: 11, color: COLORS.muted },
});
