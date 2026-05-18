import React, { useState, useRef } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert
} from "react-native";
import { authApi, saveTokens } from "../services/api";
import { Ionicons } from "@expo/vector-icons";

const COLORS = { primary: "#1e40af", bg: "#f8fafc", text: "#111827", muted: "#6b7280" };

export default function VerifyEmailScreen({ navigation, route }: any) {
  const email = route?.params?.email || "";
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const inputs = useRef<any[]>([]);

  const handleChange = (text: string, idx: number) => {
    if (!/^\d*$/.test(text)) return;
    const newCode = [...code];
    newCode[idx] = text.slice(-1);
    setCode(newCode);
    if (text && idx < 5) inputs.current[idx + 1]?.focus();
  };

  const handleVerify = async () => {
    const fullCode = code.join("");
    if (fullCode.length < 6) {
      Alert.alert("Xatolik", "6 ta raqamni to'liq kiriting");
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.verifyEmail({ email, code: fullCode });
      await saveTokens(res.data.access_token, res.data.refresh_token);
      Alert.alert("Muvaffaqiyat!", "Email tasdiqlandi", [
        { text: "OK", onPress: () => navigation.reset({ index: 0, routes: [{ name: "Main" }] }) },
      ]);
    } catch (e: any) {
      Alert.alert("Xatolik", e.response?.data?.detail || "Noto'g'ri kod");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconBox}>
          <Ionicons name="mail" size={40} color={COLORS.primary} />
        </View>
        <Text style={styles.title}>Email tasdiqlash</Text>
        <Text style={styles.subtitle}>
          <Text style={{ fontWeight: "700" }}>{email}</Text> manzilingizga yuborilgan 6 ta raqamni kiriting
        </Text>

        <View style={styles.codeRow}>
          {code.map((digit, idx) => (
            <TextInput
              key={idx}
              ref={(el) => { inputs.current[idx] = el; }}
              style={[styles.codeInput, digit ? styles.codeInputFilled : {}]}
              value={digit}
              onChangeText={(t) => handleChange(t, idx)}
              keyboardType="numeric"
              maxLength={1}
              textAlign="center"
            />
          ))}
        </View>

        <TouchableOpacity style={styles.btn} onPress={handleVerify} disabled={loading}>
          <Text style={styles.btnText}>{loading ? "Tekshirilmoqda..." : "Tasdiqlash"}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={16} color={COLORS.muted} />
          <Text style={styles.backText}>Orqaga</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primary, justifyContent: "center", padding: 20 },
  card: { backgroundColor: "white", borderRadius: 28, padding: 32, alignItems: "center" },
  iconBox: { width: 72, height: 72, borderRadius: 22, backgroundColor: "#eff6ff", alignItems: "center", justifyContent: "center", marginBottom: 20 },
  title: { fontSize: 22, fontWeight: "800", color: COLORS.text, marginBottom: 8 },
  subtitle: { fontSize: 14, color: COLORS.muted, textAlign: "center", marginBottom: 28, lineHeight: 22 },
  codeRow: { flexDirection: "row", gap: 10, marginBottom: 28 },
  codeInput: {
    width: 46, height: 56, borderWidth: 2, borderColor: "#e5e7eb",
    borderRadius: 14, fontSize: 24, fontWeight: "800", color: COLORS.text, backgroundColor: "#f9fafb",
  },
  codeInputFilled: { borderColor: COLORS.primary, backgroundColor: "#eff6ff" },
  btn: { backgroundColor: COLORS.primary, borderRadius: 16, padding: 16, width: "100%", alignItems: "center", marginBottom: 16 },
  btnText: { color: "white", fontSize: 17, fontWeight: "700" },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 6 },
  backText: { color: COLORS.muted, fontSize: 14 },
});
