import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Layout from "@/components/Layout";
import { useAuthStore } from "@/lib/auth";
import { userApi } from "@/lib/api";
import { useForm } from "react-hook-form";
import { User, Heart, History, Settings, Lock, Mail, Phone, Globe, Edit2, Save } from "lucide-react";
import { toast } from "react-toastify";

export default function ProfilePage() {
  const { t } = useTranslation("common");
  const router = useRouter();
  const { user, setUser, isLoading } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
  }, [user, isLoading]);

  useEffect(() => {
    if (user) reset({ first_name: user.first_name, last_name: user.last_name, phone: user.phone });
  }, [user]);

  const onSave = async (data: any) => {
    setSaving(true);
    try {
      const res = await userApi.updateMe(data);
      setUser(res.data);
      setEditing(false);
      toast.success(t("common.success"));
    } catch {
      toast.error(t("common.error"));
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || !user) return null;

  const tabs = [
    { label: t("profile.my_listings"), icon: User, href: "/profile/listings" },
    { label: t("profile.favorites"), icon: Heart, href: "/profile/favorites" },
    { label: t("profile.history"), icon: History, href: "/profile/history" },
    { label: t("profile.settings"), icon: Settings, href: "/profile/settings" },
  ];

  return (
    <Layout title={t("profile.title")}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="card mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-800 text-3xl font-bold">
                {user.first_name[0]}{user.last_name[0]}
              </div>
              <div>
                {editing ? (
                  <form onSubmit={handleSubmit(onSave)} className="space-y-3">
                    <div className="flex gap-3">
                      <input className="input-field text-sm py-2" placeholder={t("auth.first_name")}
                        {...register("first_name")} />
                      <input className="input-field text-sm py-2" placeholder={t("auth.last_name")}
                        {...register("last_name")} />
                    </div>
                    <input className="input-field text-sm py-2" placeholder={t("auth.phone")}
                      {...register("phone")} />
                    <div className="flex gap-2">
                      <button type="submit" disabled={saving}
                        className="btn-primary py-2 px-4 text-sm flex items-center gap-2">
                        <Save className="w-4 h-4" />
                        {saving ? t("common.loading") : t("profile.save")}
                      </button>
                      <button type="button" onClick={() => setEditing(false)}
                        className="btn-secondary py-2 px-4 text-sm">
                        {t("profile.cancel")}
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {user.first_name} {user.last_name}
                    </h1>
                    <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
                      <Mail className="w-4 h-4" />
                      {user.email}
                      {user.is_email_verified && (
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">✓</span>
                      )}
                    </div>
                    {user.phone && (
                      <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
                        <Phone className="w-4 h-4" />
                        {user.phone}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
                      <Globe className="w-4 h-4" />
                      {user.language === "uz" ? "O'zbek" : user.language === "ru" ? "Русский" : "English"}
                    </div>
                  </>
                )}
              </div>
            </div>
            {!editing && (
              <button onClick={() => setEditing(true)}
                className="btn-secondary py-2 px-4 text-sm flex items-center gap-2">
                <Edit2 className="w-4 h-4" />
                {t("profile.edit")}
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.href}
              onClick={() => router.push(tab.href)}
              className="card hover:border-primary-200 hover:bg-primary-50 transition-all cursor-pointer text-left"
            >
              <tab.icon className="w-8 h-8 text-primary-600 mb-3" />
              <div className="font-semibold text-gray-900 text-sm">{tab.label}</div>
            </button>
          ))}
        </div>
      </div>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: { ...(await serverSideTranslations(locale || "uz", ["common"])) },
});
