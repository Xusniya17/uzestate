import React, { useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, ActivityIndicator, Alert
} from "react-native";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { predictionApi, propertyApi } from "../services/api";
import { Ionicons } from "@expo/vector-icons";

const COLORS = { primary: "#1e40af", bg: "#f8fafc", card: "#ffffff", text: "#111827", muted: "#6b7280", border: "#e5e7eb" };

const BUILDING_TYPES = [
  { value: "new", labelKey: "estimate.building_new" },
  { value: "old", labelKey: "estimate.building_old" },
  { value: "panel", labelKey: "estimate.building_panel" },
  { value: "brick", labelKey: "estimate.building_brick" },
  { value: "monolith", labelKey: "estimate.building_monolith" },
];

const REPAIR_TYPES = [
  { value: "euro", labelKey: "estimate.repair_euro" },
  { value: "good", labelKey: "estimate.repair_good" },
  { value: "average", labelKey: "estimate.repair_average" },
  { value: "needs_repair", labelKey: "estimate.repair_needs" },
  { value: "without_repair", labelKey: "estimate.repair_without" },
];

export default function EstimateScreen() {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    district_id: "",
    area_total: "",
    rooms: "2",
    floor: "",
    total_floors: "",
    building_type: "new",
    repair_status: "average",
    has_elevator: false,
    has_parking: false,
    has_balcony: false,
  });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const { data: districts } = useQuery({
    queryKey: ["districts"],
    queryFn: () => propertyApi.getDistricts().then((r) => r.data),
  });

  const update = (key: string, value: any) => setForm((prev) => ({ ...prev, [key]: value }));

  const calculate = async () => {
    if (!form.district_id || !form.area_total || !form.floor || !form.total_floors) {
      Alert.alert(t("common.error"), "Barcha majburiy maydonlarni to'ldiring");
      return;
    }
    if (Number(form.floor) > Number(form.total_floors)) {
      Alert.alert(t("common.error"), "Qavat umumiy qavatlardan oshmasligi kerak");
      return;
    }
    setLoading(true);
    try {
      const res = await predictionApi.estimate({
        district_id: Number(form.district_id),
        area_total: Number(form.area_total),
        rooms: Number(form.rooms),
        floor: Number(form.floor),
        total_floors: Number(form.total_floors),
        building_type: form.building_type,
        repair_status: form.repair_status,
        has_elevator: form.has_elevator,
        has_parking: form.has_parking,
        has_balcony: form.has_balcony,
      });
      setResult(res.data);
    } catch (e: any) {
      Alert.alert(t("common.error"), e.response?.data?.detail || t("common.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>{t("estimate.title")}</Text>
      </View>

      <View style={styles.form}>
        {/* District */}
        <Text style={styles.label}>{t("estimate.district")} *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
          {districts?.map((d: any) => (
            <TouchableOpacity
              key={d.id}
              style={[styles.chip, form.district_id === String(d.id) && styles.chipActive]}
              onPress={() => update("district_id", String(d.id))}
            >
              <Text style={[styles.chipText, form.district_id === String(d.id) && styles.chipTextActive]}>
                {d.name_uz?.replace(" tumani", "")}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Area and rooms */}
        <View style={styles.row}>
          <View style={styles.half}>
            <Text style={styles.label}>{t("estimate.area")} *</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="60"
              value={form.area_total}
              onChangeText={(v) => update("area_total", v)}
            />
          </View>
          <View style={styles.half}>
            <Text style={styles.label}>{t("estimate.rooms")}</Text>
            <View style={styles.stepper}>
              <TouchableOpacity onPress={() => update("rooms", Math.max(1, Number(form.rooms) - 1))}>
                <Ionicons name="remove-circle" size={28} color={COLORS.primary} />
              </TouchableOpacity>
              <Text style={styles.stepperValue}>{form.rooms}</Text>
              <TouchableOpacity onPress={() => update("rooms", Math.min(10, Number(form.rooms) + 1))}>
                <Ionicons name="add-circle" size={28} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Floors */}
        <View style={styles.row}>
          <View style={styles.half}>
            <Text style={styles.label}>{t("estimate.floor")} *</Text>
            <TextInput style={styles.input} keyboardType="numeric" placeholder="5"
              value={form.floor} onChangeText={(v) => update("floor", v)} />
          </View>
          <View style={styles.half}>
            <Text style={styles.label}>{t("estimate.total_floors")} *</Text>
            <TextInput style={styles.input} keyboardType="numeric" placeholder="9"
              value={form.total_floors} onChangeText={(v) => update("total_floors", v)} />
          </View>
        </View>

        {/* Building type */}
        <Text style={styles.label}>{t("estimate.building_type")}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
          {BUILDING_TYPES.map((bt) => (
            <TouchableOpacity
              key={bt.value}
              style={[styles.chip, form.building_type === bt.value && styles.chipActive]}
              onPress={() => update("building_type", bt.value)}
            >
              <Text style={[styles.chipText, form.building_type === bt.value && styles.chipTextActive]}>
                {t(bt.labelKey)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Repair */}
        <Text style={styles.label}>{t("estimate.repair")}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
          {REPAIR_TYPES.map((rt) => (
            <TouchableOpacity
              key={rt.value}
              style={[styles.chip, form.repair_status === rt.value && styles.chipActive]}
              onPress={() => update("repair_status", rt.value)}
            >
              <Text style={[styles.chipText, form.repair_status === rt.value && styles.chipTextActive]}>
                {t(rt.labelKey)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Checkboxes */}
        <View style={styles.checkboxRow}>
          {[
            { key: "has_elevator", label: t("estimate.elevator") },
            { key: "has_parking", label: t("estimate.parking") },
            { key: "has_balcony", label: t("estimate.balcony") },
          ].map((item) => (
            <TouchableOpacity
              key={item.key}
              style={styles.checkbox}
              onPress={() => update(item.key, !form[item.key as keyof typeof form])}
            >
              <View style={[styles.checkBox, (form as any)[item.key] && styles.checkBoxActive]}>
                {(form as any)[item.key] && <Ionicons name="checkmark" size={14} color="white" />}
              </View>
              <Text style={styles.checkLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.calcBtn} onPress={calculate} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Ionicons name="calculator" size={20} color="white" />
              <Text style={styles.calcBtnText}>{t("estimate.calculate")}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Result */}
      {result && (
        <View style={styles.result}>
          <Text style={styles.resultTitle}>{t("estimate.result")}</Text>
          <View style={styles.priceCard}>
            <Text style={styles.predictedLabel}>{t("estimate.predicted")}</Text>
            <Text style={styles.predictedPrice}>${result.predicted_price_usd?.toLocaleString()}</Text>
            <Text style={styles.predictedUzs}>
              ≈ {(result.predicted_price_uzs / 1_000_000)?.toFixed(1)} mln so'm
            </Text>
          </View>
          <View style={styles.resultGrid}>
            <View style={styles.resultItem}>
              <Text style={styles.resultItemLabel}>{t("estimate.range")}</Text>
              <Text style={styles.resultItemValue}>
                ${result.price_min_usd?.toLocaleString()} — ${result.price_max_usd?.toLocaleString()}
              </Text>
            </View>
            <View style={styles.resultItem}>
              <Text style={styles.resultItemLabel}>{t("estimate.sqm_price")}</Text>
              <Text style={styles.resultItemValue}>${result.price_per_sqm_usd?.toLocaleString()}/m²</Text>
            </View>
            <View style={styles.resultItem}>
              <Text style={styles.resultItemLabel}>{t("estimate.confidence")}</Text>
              <Text style={[styles.resultItemValue, { color: result.confidence_score >= 85 ? "#059669" : "#d97706" }]}>
                {result.confidence_score}%
              </Text>
            </View>
          </View>
        </View>
      )}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: { backgroundColor: COLORS.primary, padding: 20, paddingTop: 20 },
  title: { fontSize: 22, fontWeight: "800", color: "white" },
  form: { padding: 16, gap: 6 },
  label: { fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 6, marginTop: 10 },
  input: {
    borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 12,
    padding: 12, fontSize: 15, backgroundColor: "white", color: COLORS.text,
  },
  row: { flexDirection: "row", gap: 12 },
  half: { flex: 1 },
  chipRow: { marginBottom: 4 },
  chip: {
    borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 8, marginRight: 8, backgroundColor: "white",
  },
  chipActive: { borderColor: COLORS.primary, backgroundColor: "#eff6ff" },
  chipText: { fontSize: 13, color: COLORS.muted, fontWeight: "500" },
  chipTextActive: { color: COLORS.primary, fontWeight: "700" },
  stepper: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 6 },
  stepperValue: { fontSize: 20, fontWeight: "800", color: COLORS.text, minWidth: 30, textAlign: "center" },
  checkboxRow: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 6 },
  checkbox: { flexDirection: "row", alignItems: "center", gap: 8 },
  checkBox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: COLORS.border, alignItems: "center", justifyContent: "center" },
  checkBoxActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  checkLabel: { fontSize: 13, color: COLORS.text },
  calcBtn: {
    backgroundColor: COLORS.primary, borderRadius: 16, padding: 16,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 16,
  },
  calcBtnText: { color: "white", fontSize: 17, fontWeight: "700" },
  result: { margin: 16, marginTop: 4 },
  resultTitle: { fontSize: 18, fontWeight: "700", color: COLORS.text, marginBottom: 12 },
  priceCard: {
    backgroundColor: COLORS.primary, borderRadius: 20, padding: 24, alignItems: "center", marginBottom: 12,
  },
  predictedLabel: { color: "rgba(255,255,255,0.7)", fontSize: 13, marginBottom: 6 },
  predictedPrice: { color: "white", fontSize: 42, fontWeight: "900" },
  predictedUzs: { color: "rgba(255,255,255,0.8)", fontSize: 15, marginTop: 4 },
  resultGrid: { flexDirection: "row", gap: 10 },
  resultItem: { flex: 1, backgroundColor: "white", borderRadius: 14, padding: 14, alignItems: "center" },
  resultItemLabel: { fontSize: 11, color: COLORS.muted, textAlign: "center", marginBottom: 6 },
  resultItemValue: { fontSize: 14, fontWeight: "700", color: COLORS.text, textAlign: "center" },
});
