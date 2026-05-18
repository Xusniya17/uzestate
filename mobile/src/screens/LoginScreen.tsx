import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform
} from "react-native";
import { useTranslation } from "react-i18next";
import { authApi, saveTokens } from "../services/api";
import { Ionicons } from "@expo/vector-icons";

const COLORS = { primary: "#1e40af", bg: "#f8fafc", text: "#111827", muted: "#6b7280", border: "#e5e7eb" };

export default function LoginScreen({ navigation }: any) {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(t("common.error"), "Email va parol kiriting");
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.login({ email, password });
      await saveTokens(res.data.access_token, res.data.refresh_token);
      navigation.reset({ index: 0, routes: [{ name: "Main" }] });
    } catch (e: any) {
      Alert.alert(t("common.error"), e.response?.data?.detail || t("common.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.inner} showsVerticalScrollIndicator={false}>
        <View style={styles.logoArea}>
          <View style={styles.logo}>
            <Ionicons name="business" size={36} color="white" />
          </View>
          <Text style={styles.appName}>UzEstate</Text>
          <Text style={styles.tagline}>Ko'chmas mulk narxini baholash tizimi</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>{t("auth.login")}</Text>

          <Text style={styles.label}>{t("auth.email")}</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={18} color={COLORS.muted} style={styles.icon} />
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="email@example.com"
              placeholderTextColor={COLORS.muted}
            />
          </View>

          <Text style={styles.label}>{t("auth.password")}</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={18} color={COLORS.muted} style={styles.icon} />
            <TextInput
              style={[styles.input, { paddingRight: 40 }]}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPass}
              placeholder="••••••••"
              placeholderTextColor={COLORS.muted}
            />
            <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPass(!showPass)}>
              <Ionicons name={showPass ? "eye-off-outline" : "eye-outline"} size={18} color={COLORS.muted} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={{ alignSelf: "flex-end", marginBottom: 20 }}>
            <Text style={styles.forgotLink}>{t("auth.forgot_password")}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} disabled={loading}>
            <Text style={styles.loginBtnText}>
              {loading ? t("common.loading") : t("auth.login")}
            </Text>
          </TouchableOpacity>

          <View style={styles.signupRow}>
            <Text style={styles.signupText}>{t("auth.no_account")} </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Register")}>
              <Text style={styles.signupLink}>{t("auth.register")}</Text>
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
  logoArea: { alignItems: "center", marginBottom: 30 },
  logo: {
    width: 76, height: 76, borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center", marginBottom: 12,
  },
  appName: { fontSize: 30, fontWeight: "900", color: "white", marginBottom: 4 },
  tagline: { color: "rgba(255,255,255,0.7)", fontSize: 13 },
  card: { backgroundColor: "white", borderRadius: 28, padding: 28 },
  title: { fontSize: 22, fontWeight: "800", color: COLORS.text, marginBottom: 20 },
  label: { fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 6 },
  inputWrapper: {
    flexDirection: "row", alignItems: "center",
    borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 14,
    backgroundColor: "#f9fafb", marginBottom: 16,
  },
  icon: { marginLeft: 12 },
  input: { flex: 1, padding: 13, fontSize: 15, color: COLORS.text },
  eyeBtn: { position: "absolute", right: 12 },
  forgotLink: { color: COLORS.primary, fontSize: 13, fontWeight: "600" },
  loginBtn: { backgroundColor: COLORS.primary, borderRadius: 16, padding: 16, alignItems: "center", marginBottom: 16 },
  loginBtnText: { color: "white", fontSize: 17, fontWeight: "700" },
  signupRow: { flexDirection: "row", justifyContent: "center" },
  signupText: { color: COLORS.muted, fontSize: 14 },
  signupLink: { color: COLORS.primary, fontWeight: "700", fontSize: 14 },
});
