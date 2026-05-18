import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { authApi } from "@/lib/api";
import { Building2, Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { toast } from "react-toastify";

export default function ForgotPasswordPage() {
  const { t } = useTranslation("common");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, getValues } = useForm<{ email: string }>();

  const onSubmit = async (data: { email: string }) => {
    setLoading(true);
    try {
      await authApi.forgotPassword(data.email);
      setSent(true);
    } catch {
      toast.error(t("common.error"));
    } finally {
      setLoading(false);
    }
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

        {sent ? (
          <>
            <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold mb-3">Xat yuborildi!</h2>
            <p className="text-gray-500 text-sm mb-6">
              <strong>{getValues("email")}</strong> manzilingizga parolni tiklash havolasi yuborildi.
            </p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-primary-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{t("auth.forgot_title")}</h1>
            <p className="text-gray-500 text-sm mb-8">{t("auth.forgot_subtitle")}</p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
              <div>
                <label className="label">{t("auth.email")}</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="email" className="input-field pl-10" placeholder="email@example.com"
                    {...register("email", { required: true })} />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? t("common.loading") : t("auth.send_link")}
              </button>
            </form>
          </>
        )}

        <Link href="/login" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 mt-6">
          <ArrowLeft className="w-4 h-4" />
          {t("auth.back_to_login")}
        </Link>
      </div>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: { ...(await serverSideTranslations(locale || "uz", ["common"])) },
});
