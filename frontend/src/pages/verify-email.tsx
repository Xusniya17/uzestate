import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { authApi } from "@/lib/api";
import { useAuthStore, saveTokens } from "@/lib/auth";
import { Building2, Mail, CheckCircle } from "lucide-react";
import { toast } from "react-toastify";

export default function VerifyEmailPage() {
  const { t } = useTranslation("common");
  const router = useRouter();
  const { setUser } = useAuthStore();
  const email = router.query.email as string;
  const devCode = router.query.dev_code as string;
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  // Dev rejimda kodni avtomatik to'ldirish
  useEffect(() => {
    if (devCode && devCode.length === 6) {
      setCode(devCode.split(""));
    }
  }, [devCode]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleInput = (idx: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[idx] = value.slice(-1);
    setCode(newCode);
    if (value && idx < 5) inputs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const fullCode = code.join("");
    if (fullCode.length < 6) {
      toast.error("Barcha 6 ta raqamni kiriting");
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.verifyEmail({ email, code: fullCode });
      saveTokens(res.data.access_token, res.data.refresh_token);
      setUser(res.data.user);
      toast.success("Email muvaffaqiyatli tasdiqlandi!");
      router.push("/");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Noto'g'ri kod");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    try {
      await authApi.register({ email });
      setResendTimer(60);
      toast.success("Kod qayta yuborildi");
    } catch {}
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 to-primary-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-8">
          <div className="w-10 h-10 bg-primary-800 rounded-xl flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-2xl text-primary-800">UzEstate</span>
        </Link>

        <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Mail className="w-8 h-8 text-primary-600" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">{t("auth.verify_title")}</h1>
        <p className="text-gray-500 text-sm mb-4">
          {t("auth.verify_subtitle", { email: email || "email@example.com" })}
        </p>

        {devCode && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-6 text-left">
            <p className="text-yellow-800 text-xs font-bold mb-1">🔧 Development rejim</p>
            <p className="text-yellow-700 text-sm">SMTP sozlanmagan. Kod avtomatik to'ldirildi:</p>
            <p className="text-yellow-900 font-bold text-xl tracking-widest mt-1">{devCode}</p>
          </div>
        )}

        <div className="flex justify-center gap-3 mb-8">
          {code.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => { inputs.current[idx] = el; }}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleInput(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none transition-colors"
            />
          ))}
        </div>

        <button
          onClick={handleVerify}
          disabled={loading || code.join("").length < 6}
          className="btn-primary w-full flex items-center justify-center gap-2 mb-4"
        >
          {loading ? t("common.loading") : (
            <><CheckCircle className="w-5 h-5" />{t("auth.verify_btn")}</>
          )}
        </button>

        <button
          onClick={handleResend}
          disabled={resendTimer > 0}
          className="text-sm text-gray-500 hover:text-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {resendTimer > 0 ? `${t("auth.resend_code")} (${resendTimer}s)` : t("auth.resend_code")}
        </button>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: { ...(await serverSideTranslations(locale || "uz", ["common"])) },
});
