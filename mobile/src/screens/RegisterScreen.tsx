import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, KeyboardAvoidingView, Platform
} from "react-native";
import { useTranslation } from "react-i18next";
import { authApi } from "../services/api";
import { Ionicons } from "@expo/vector-icons";

const COLORS = { primary: "#1e40af", bg: "#f8fafc", text: "#111827", muted: "#6b7280", border: "#e5e7eb" };

const LANGUAGES = [
  { code: "uz", label: "O'zbek", flag: "🇺🇿" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
  { code: "en", label: "English", flag: "🇬🇧" },
];

export default function RegisterScreen({ navigation }: any) {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    first_name: "", last_name: "", email: "", phone: "", password: "", language: "uz",
  });
  const [loading, setLoading] = useState(false);

  const update = (key: string, val: string) => setForm((p) => ({ ...p, [key]: val }));

  const handleRegister = async () => {
    if (!form.first_name || !form.last_name || !form.email || !form.password) {
      Alert.alert(t("common.error"), "Barcha majburiy maydonlarni to'ldiring");
      return;
    }
    if (form.password.length < 8) {
      Alert.alert(t("common.error"), "Parol kamida 8 ta belgi bo'lishi kerak");
      return;
    }
    setLoading(true);
    try {
      await authApi.register({
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        phone: form.phone || undefined,
        password: form.password,
        language: form.language,
      });
      Alert.alert(t("common.success"), "Tasdiqlash kodi emailga yuborildi");
      navigation.navigate("VerifyEmail", { email: form.email });
    } catch (e: any) {
      Alert.alert(t("common.error"), e.response?.data?.detail || t("common.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.inner}>
        <View style={styles.logoArea}>
          <View style={styles.logo}>
            <Ionicons name="business" size={32} color="white" />
          </View>
          <Text style={styles.appName}>UzEstate</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>{t("auth.register")}</Text>

          <View style={styles.row}>
            {[
              { key: "first_name", placeholder: t("auth.first_name") },
              { key: "last_name", placeholder: t("auth.last_name") },
            ].map((f) => (
              <TextInput
                key={f.key}
                style={[styles.input, { flex: 1 }]}
                placeholder={f.placeholder}
                value={form[f.key as keyof typeof form]}
                onChangeText={(v) => update(f.key, v)}
                placeholderTextColor={COLORS.muted}
              />
            ))}
          </View>

          {[
            { key: "email", placeholder: "Email *", keyboardType: "email-address" as const, autoCapitalize: "none" as const },
            { key: "phone", placeholder: "+998 XX XXX XX XX", keyboardType: "phone-pad" as const },
            { key: "password", placeholder: "Parol (min 8 belgi) *" },
          ].map((f) => (
            <TextInput
              key={f.key}
              style={styles.input}
              placeholder={f.placeholder}
              value={form[f.key as keyof typeof form]}
              onChangeText={(v) => update(f.key, v)}
              keyboardType={f.keyboardType}
              autoCapitalize={f.autoCapitalize || "none"}
              secureTextEntry={f.key === "password"}
              placeholderTextColor={COLORS.muted}
            />
          ))}

          <Text style={styles.label}>Til</Text>
          <View style={styles.langRow}>
            {LANGUAGES.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[styles.langBtn, form.language === lang.code && styles.langBtnActive]}
                onPress={() => update("language", lang.code)}
              >
                <Text style={styles.langFlag}>{lang.flag}</Text>
                <Text style={[styles.langLabel, form.language === lang.code && { color: COLORS.primary }]}>
                  {lang.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.btn} onPress={handleRegister} disabled={loading}>
            <Text style={styles.btnText}>{loading ? t("common.loading") : t("auth.register")}</Text>
          </TouchableOpacity>

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>{t("auth.have_account")} </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={styles.loginLink}>{t("auth.login")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primary },
  inner: { flexGrow: 1, justifyContent: "center", padding: 20 },
  logoArea: { alignItems: "center", marginBottom: 24 },
  logo: { width: 64, height: 64, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center", marginBottom: 10 },
  appName: { fontSize: 28, fontWeight: "900", color: "white" },
  card: { backgroundColor: "white", borderRadius: 28, padding: 24 },
  title: { fontSize: 22, fontWeight: "800", color: COLORS.text, marginBottom: 18 },
  row: { flexDirection: "row", gap: 10, marginBottom: 0 },
  input: {
    borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 14,
    padding: 13, fontSize: 15, color: COLORS.text, marginBottom: 12,
    backgroundColor: "#f9fafb",
  },
  label: { fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 8 },
  langRow: { flexDirection: "row", gap: 8, marginBottom: 20 },
  langBtn: { flex: 1, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 12, padding: 10, alignItems: "center" },
  langBtnActive: { borderColor: COLORS.primary, backgroundColor: "#eff6ff" },
  langFlag: { fontSize: 20, marginBottom: 2 },
  langLabel: { fontSize: 11, fontWeight: "600", color: COLORS.muted },
  btn: { backgroundColor: COLORS.primary, borderRadius: 16, padding: 16, alignItems: "center", marginBottom: 14 },
  btnText: { color: "white", fontSize: 17, fontWeight: "700" },
  loginRow: { flexDirection: "row", justifyContent: "center" },
  loginText: { color: COLORS.muted, fontSize: 14 },
  loginLink: { color: COLORS.primary, fontWeight: "700", fontSize: 14 },
});
