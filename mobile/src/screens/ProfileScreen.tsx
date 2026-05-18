import React, { useState, useEffect } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert, Switch
} from "react-native";
import { useTranslation } from "react-i18next";
import { userApi, authApi, clearTokens } from "../services/api";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import i18n from "../i18n";

const COLORS = { primary: "#1e40af", bg: "#f8fafc", card: "#ffffff", text: "#111827", muted: "#6b7280" };

const LANGUAGES = [
  { code: "uz", label: "O'zbek", flag: "🇺🇿" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
  { code: "en", label: "English", flag: "🇬🇧" },
];

export default function ProfileScreen({ navigation }: any) {
  const { t } = useTranslation();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentLang, setCurrentLang] = useState(i18n.language || "uz");

  useEffect(() => {
    userApi.getMe()
      .then((r) => setUser(r.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    Alert.alert(t("auth.logout"), "Chiqishni tasdiqlaysizmi?", [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("auth.logout"),
        style: "destructive",
        onPress: async () => {
          const refreshToken = await SecureStore.getItemAsync("refresh_token");
          if (refreshToken) {
            try { await authApi.logout(refreshToken); } catch {}
          }
          await clearTokens();
          setUser(null);
          navigation.navigate("Login");
        },
      },
    ]);
  };

  const changeLang = async (lang: string) => {
    i18n.changeLanguage(lang);
    setCurrentLang(lang);
    try {
      await userApi.updateMe({ language: lang });
    } catch {}
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={{ color: COLORS.muted }}>{t("common.loading")}</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.center}>
        <Ionicons name="person-circle-outline" size={64} color={COLORS.muted} />
        <Text style={styles.loginTitle}>Kirish kerak</Text>
        <TouchableOpacity style={styles.loginBtn} onPress={() => navigation.navigate("Login")}>
          <Text style={styles.loginBtnText}>{t("auth.login")}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.registerBtn} onPress={() => navigation.navigate("Register")}>
          <Text style={styles.registerBtnText}>{t("auth.register")}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user.first_name?.[0]}{user.last_name?.[0]}</Text>
        </View>
        <Text style={styles.name}>{user.first_name} {user.last_name}</Text>
        <View style={styles.emailRow}>
          <Ionicons name="mail" size={14} color="rgba(255,255,255,0.7)" />
          <Text style={styles.email}>{user.email}</Text>
          {user.is_email_verified && (
            <View style={styles.verified}>
              <Ionicons name="checkmark-circle" size={14} color="#34d399" />
            </View>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("profile.title")}</Text>

        {[
          { icon: "home-outline", label: t("profile.my_listings"), screen: "MyListings" },
          { icon: "heart-outline", label: t("profile.favorites"), screen: "Favorites" },
          { icon: "time-outline", label: t("profile.history"), screen: "History" },
        ].map((item) => (
          <TouchableOpacity
            key={item.screen}
            style={styles.menuItem}
            onPress={() => navigation.navigate(item.screen)}
          >
            <View style={styles.menuIcon}>
              <Ionicons name={item.icon as any} size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.muted} />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("profile.language")}</Text>
        <View style={styles.langRow}>
          {LANGUAGES.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              style={[styles.langBtn, currentLang === lang.code && styles.langBtnActive]}
              onPress={() => changeLang(lang.code)}
            >
              <Text style={styles.langFlag}>{lang.flag}</Text>
              <Text style={[styles.langLabel, currentLang === lang.code && styles.langLabelActive]}>
                {lang.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#ef4444" />
        <Text style={styles.logoutText}>{t("auth.logout")}</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16, padding: 24 },
  loginTitle: { fontSize: 20, fontWeight: "700", color: COLORS.text },
  loginBtn: { backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 40 },
  loginBtnText: { color: "white", fontWeight: "700", fontSize: 16 },
  registerBtn: { borderWidth: 2, borderColor: COLORS.primary, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 40 },
  registerBtnText: { color: COLORS.primary, fontWeight: "700", fontSize: 16 },
  profileCard: {
    backgroundColor: COLORS.primary, padding: 28, alignItems: "center",
  },
  avatar: {
    width: 80, height: 80, borderRadius: 24, backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center", justifyContent: "center", marginBottom: 14,
  },
  avatarText: { color: "white", fontSize: 28, fontWeight: "800" },
  name: { color: "white", fontSize: 22, fontWeight: "800", marginBottom: 6 },
  emailRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  email: { color: "rgba(255,255,255,0.8)", fontSize: 14 },
  verified: {},
  section: { margin: 16, backgroundColor: "white", borderRadius: 20, padding: 16, marginBottom: 0 },
  sectionTitle: { fontSize: 14, fontWeight: "700", color: COLORS.muted, marginBottom: 14, textTransform: "uppercase", letterSpacing: 0.5 },
  menuItem: { flexDirection: "row", alignItems: "center", paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },
  menuIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: "#eff6ff", alignItems: "center", justifyContent: "center", marginRight: 12 },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: "500", color: COLORS.text },
  langRow: { flexDirection: "row", gap: 8 },
  langBtn: { flex: 1, borderWidth: 1.5, borderColor: "#e5e7eb", borderRadius: 12, padding: 12, alignItems: "center" },
  langBtnActive: { borderColor: COLORS.primary, backgroundColor: "#eff6ff" },
  langFlag: { fontSize: 22, marginBottom: 4 },
  langLabel: { fontSize: 12, fontWeight: "600", color: COLORS.muted },
  langLabelActive: { color: COLORS.primary },
  logoutBtn: {
    flexDirection: "row", alignItems: "center", gap: 10, margin: 16, marginTop: 12,
    backgroundColor: "#fef2f2", borderWidth: 1.5, borderColor: "#fecaca",
    borderRadius: 16, padding: 16, justifyContent: "center",
  },
  logoutText: { color: "#ef4444", fontSize: 16, fontWeight: "700" },
});
