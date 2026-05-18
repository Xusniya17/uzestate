import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { authApi } from "@/lib/api";
import { useAuthStore, saveTokens } from "@/lib/auth";
import { Building2, Lock, Mail, Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginPage() {
  const { t } = useTranslation("common");
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      const res = await authApi.login(data);
      saveTokens(res.data.access_token, res.data.refresh_token);
      setUser(res.data.user);
      toast.success(t("common.success"));
      router.push("/");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || t("common.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 to-primary-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-primary-800 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-2xl text-primary-800">UzEstate</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{t("auth.login_title")}</h1>
          <p className="text-gray-500 text-sm mt-1">{t("auth.login_subtitle")}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="label">{t("auth.email")}</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                className="input-field pl-10"
                placeholder="email@example.com"
                {...register("email", { required: true })}
              />
            </div>
            {errors.email && <p className="text-red-500 text-xs mt-1">Majburiy</p>}
          </div>

          <div>
            <label className="label">{t("auth.password")}</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                className="input-field pl-10 pr-10"
                placeholder="••••••••"
                {...register("password", { required: true })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded" />
              <span className="text-gray-600">{t("auth.remember_me")}</span>
            </label>
            <Link href="/forgot-password" className="text-primary-600 hover:text-primary-800 font-medium">
              {t("auth.forgot_password")}
            </Link>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full text-base">
            {loading ? t("common.loading") : t("auth.login_btn")}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          {t("auth.no_account")}{" "}
          <Link href="/register" className="text-primary-600 hover:text-primary-800 font-semibold">
            {t("auth.register_link")}
          </Link>
        </p>
      </div>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: { ...(await serverSideTranslations(locale || "uz", ["common"])) },
});
