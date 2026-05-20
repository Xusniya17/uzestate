import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Layout from "@/components/Layout";
import { useAuthStore } from "@/lib/auth";
import { userApi } from "@/lib/api";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import {
  ChevronLeft, Globe, Lock, Bell, Trash2, Shield,
  Eye, EyeOff, CheckCircle, User, Phone, Mail, Save
} from "lucide-react";
import Link from "next/link";

const LANGUAGES = [
  { code: "uz", label: "O'zbek tili", flag: "🇺🇿" },
  { code: "ru", label: "Русский язык", flag: "🇷🇺" },
  { code: "en", label: "English",      flag: "🇬🇧" },
];

export default function SettingsPage() {
  const { t, i18n } = useTranslation("common");
  const router = useRouter();
  const { user, setUser, logout, isLoading } = useAuthStore();

  const [activeSection, setActiveSection] = useState<"profile" | "password" | "language" | "notifications" | "danger">("profile");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPass, setSavingPass] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedLang, setSelectedLang] = useState(user?.language || "uz");
  const [notifications, setNotifications] = useState({
    email_price_change: true,
    email_new_listings: false,
    email_promotions: false,
  });

  const profileForm = useForm({
    defaultValues: {
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      phone: user?.phone || "",
    },
  });

  const passForm = useForm<{ current_password: string; new_password: string; confirm: string }>();
  const newPass = passForm.watch("new_password");

  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
  }, [user, isLoading]);

  useEffect(() => {
    if (user) {
      profileForm.reset({ first_name: user.first_name, last_name: user.last_name, phone: user.phone || "" });
      setSelectedLang(user.language || "uz");
    }
  }, [user]);

  if (isLoading || !user) return null;

  const saveProfile = async (data: any) => {
    setSavingProfile(true);
    try {
      const res = await userApi.updateMe({ first_name: data.first_name, last_name: data.last_name, phone: data.phone || undefined });
      setUser(res.data);
      toast.success("Ma'lumotlar saqlandi!");
    } catch {
      toast.error("Xatolik yuz berdi");
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async (data: any) => {
    if (data.new_password !== data.confirm) { toast.error("Yangi parollar mos emas"); return; }
    setSavingPass(true);
    try {
      await userApi.updateMe({ current_password: data.current_password, new_password: data.new_password });
      toast.success("Parol o'zgartirildi!");
      passForm.reset();
    } catch (e: any) {
      toast.error(e.response?.data?.detail || "Joriy parol noto'g'ri");
    } finally {
      setSavingPass(false);
    }
  };

  const saveLanguage = async () => {
    try {
      await userApi.updateMe({ language: selectedLang });
      setUser({ ...user, language: selectedLang });
      i18n.changeLanguage(selectedLang);
      toast.success("Til saqlandi!");
    } catch {
      toast.error("Xatolik");
    }
  };

  const deleteAccount = async () => {
    if (!confirm("Hisobingiz o'chiriladi. Davom etasizmi?")) return;
    try {
      await userApi.updateMe({ is_active: false } as any);
      logout();
      router.push("/");
    } catch {
      toast.error("Xatolik yuz berdi");
    }
  };

  const sections = [
    { key: "profile",       icon: User,   label: "Shaxsiy ma'lumotlar" },
    { key: "password",      icon: Lock,   label: "Parol o'zgartirish" },
    { key: "language",      icon: Globe,  label: "Til sozlamalari" },
    { key: "notifications", icon: Bell,   label: "Bildirishnomalar" },
    { key: "danger",        icon: Trash2, label: "Xavfli zona", danger: true },
  ];

  return (
    <Layout title={t("profile.settings")}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/profile" className="p-2 hover:bg-gray-100 rounded-xl transition">
            <ChevronLeft className="w-5 h-5 text-gray-500" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{t("profile.settings")}</h1>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {sections.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setActiveSection(s.key as any)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition border-b border-gray-50 last:border-0 ${
                    activeSection === s.key
                      ? s.danger ? "bg-red-50 text-red-600" : "bg-primary-50 text-primary-800"
                      : s.danger ? "text-red-500 hover:bg-red-50" : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <s.icon className="w-5 h-5 shrink-0" />
                  <span className="text-sm font-medium">{s.label}</span>
                  {activeSection === s.key && !s.danger && (
                    <div className="ml-auto w-1.5 h-5 bg-primary-500 rounded-full" />
                  )}
                </button>
              ))}
            </div>

            {/* User card */}
            <div className="mt-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center text-primary-800 font-bold text-lg">
                  {user.first_name[0]}{user.last_name[0]}
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">{user.first_name} {user.last_name}</div>
                  <div className="text-xs text-gray-500">{user.email}</div>
                  <div className={`text-xs mt-0.5 font-medium ${user.role === "admin" ? "text-red-500" : "text-primary-600"}`}>
                    {user.role === "admin" ? "🛡 Admin" : user.role === "agent" ? "🏢 Agent" : "👤 Foydalanuvchi"}
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-50 flex items-center gap-2 text-xs text-gray-400">
                {user.is_email_verified
                  ? <><CheckCircle className="w-3.5 h-3.5 text-green-500" /> Email tasdiqlangan</>
                  : <><Shield className="w-3.5 h-3.5 text-yellow-500" /> Email tasdiqlanmagan</>
                }
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="md:col-span-2">
            {/* === PROFILE === */}
            {activeSection === "profile" && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Shaxsiy ma'lumotlar</h2>
                <form onSubmit={profileForm.handleSubmit(saveProfile)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">Ism *</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input className="input-field pl-9" placeholder="Ism"
                          {...profileForm.register("first_name", { required: true })} />
                      </div>
                    </div>
                    <div>
                      <label className="label">Familiya *</label>
                      <input className="input-field" placeholder="Familiya"
                        {...profileForm.register("last_name", { required: true })} />
                    </div>
                  </div>

                  <div>
                    <label className="label">Email manzil</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        className="input-field pl-9 bg-gray-50 cursor-not-allowed"
                        value={user.email}
                        disabled
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Email manzil o'zgartirib bo'lmaydi</p>
                  </div>

                  <div>
                    <label className="label">Telefon raqam</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input className="input-field pl-9" placeholder="+998 90 123 45 67"
                        {...profileForm.register("phone")} />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button type="submit" disabled={savingProfile}
                      className="btn-primary flex items-center gap-2">
                      <Save className="w-4 h-4" />
                      {savingProfile ? "Saqlanmoqda..." : "Saqlash"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* === PASSWORD === */}
            {activeSection === "password" && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-2">Parol o'zgartirish</h2>
                <p className="text-sm text-gray-500 mb-6">Xavfsizlik uchun kuchli parol ishlating</p>
                <form onSubmit={passForm.handleSubmit(savePassword)} className="space-y-4">
                  <div>
                    <label className="label">Joriy parol *</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type={showCurrent ? "text" : "password"}
                        className="input-field pl-9 pr-10"
                        placeholder="Joriy parolingiz"
                        {...passForm.register("current_password", { required: true })}
                      />
                      <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {showCurrent ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="label">Yangi parol *</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type={showNew ? "text" : "password"}
                        className="input-field pl-9 pr-10"
                        placeholder="Kamida 8 belgi (A, a, 1)"
                        {...passForm.register("new_password", {
                          required: true,
                          minLength: { value: 8, message: "Kamida 8 belgi" },
                          pattern: { value: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)/, message: "Katta harf, kichik harf va raqam kerak" },
                        })}
                      />
                      <button type="button" onClick={() => setShowNew(!showNew)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {showNew ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                      </button>
                    </div>
                    {passForm.formState.errors.new_password && (
                      <p className="text-red-500 text-xs mt-1">{passForm.formState.errors.new_password.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="label">Yangi parolni tasdiqlash *</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type={showConfirm ? "text" : "password"}
                        className="input-field pl-9 pr-10"
                        placeholder="Parolni qayta kiriting"
                        {...passForm.register("confirm", {
                          required: true,
                          validate: (v) => v === newPass || "Parollar mos emas",
                        })}
                      />
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {showConfirm ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                      </button>
                    </div>
                    {passForm.formState.errors.confirm && (
                      <p className="text-red-500 text-xs mt-1">{passForm.formState.errors.confirm.message}</p>
                    )}
                  </div>

                  {/* Parol kuchliligi */}
                  {newPass && (
                    <div className="space-y-1.5">
                      {[
                        { test: newPass.length >= 8,          label: "Kamida 8 belgi" },
                        { test: /[A-Z]/.test(newPass),        label: "Katta harf (A-Z)" },
                        { test: /[a-z]/.test(newPass),        label: "Kichik harf (a-z)" },
                        { test: /\d/.test(newPass),            label: "Raqam (0-9)" },
                        { test: /[^A-Za-z0-9]/.test(newPass), label: "Maxsus belgi (!@#)" },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center ${item.test ? "bg-green-500" : "bg-gray-200"}`}>
                            {item.test && <CheckCircle className="w-3 h-3 text-white" />}
                          </div>
                          <span className={`text-xs ${item.test ? "text-green-600" : "text-gray-400"}`}>{item.label}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="pt-2">
                    <button type="submit" disabled={savingPass}
                      className="btn-primary flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      {savingPass ? "Saqlanmoqda..." : "Parolni o'zgartirish"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* === LANGUAGE === */}
            {activeSection === "language" && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-2">Til sozlamalari</h2>
                <p className="text-sm text-gray-500 mb-6">Interfeys tili — sayt va bildirishnomalar shu tilda bo'ladi</p>
                <div className="space-y-3">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setSelectedLang(lang.code)}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                        selectedLang === lang.code
                          ? "border-primary-500 bg-primary-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <span className="text-3xl">{lang.flag}</span>
                      <span className="font-semibold text-gray-900">{lang.label}</span>
                      <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedLang === lang.code ? "border-primary-500 bg-primary-500" : "border-gray-300"
                      }`}>
                        {selectedLang === lang.code && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                    </button>
                  ))}
                </div>
                <button onClick={saveLanguage} className="btn-primary flex items-center gap-2 mt-6">
                  <Globe className="w-4 h-4" />
                  Tilni saqlash
                </button>
              </div>
            )}

            {/* === NOTIFICATIONS === */}
            {activeSection === "notifications" && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-2">Bildirishnomalar</h2>
                <p className="text-sm text-gray-500 mb-6">Qaysi xabarlarni olishni xohlaysiz?</p>
                <div className="space-y-4">
                  {[
                    {
                      key: "email_price_change",
                      label: "Narx o'zgarishi",
                      desc: "Sevimli e'lonlaringizda narx o'zgarganda",
                      icon: "💰",
                    },
                    {
                      key: "email_new_listings",
                      label: "Yangi e'lonlar",
                      desc: "Sizning filtrlaringizga mos yangi e'lonlar",
                      icon: "🏠",
                    },
                    {
                      key: "email_promotions",
                      label: "Yangiliklar va aktsiyalar",
                      desc: "UzEstate yangiliklari va maxsus takliflar",
                      icon: "📢",
                    },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 hover:border-gray-200 transition">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{item.icon}</span>
                        <div>
                          <div className="font-semibold text-gray-900 text-sm">{item.label}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{item.desc}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => setNotifications((prev) => ({ ...prev, [item.key]: !prev[item.key as keyof typeof prev] }))}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          notifications[item.key as keyof typeof notifications] ? "bg-primary-600" : "bg-gray-200"
                        }`}
                      >
                        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                          notifications[item.key as keyof typeof notifications] ? "translate-x-6" : "translate-x-0.5"
                        }`} />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => toast.success("Sozlamalar saqlandi!")}
                  className="btn-primary flex items-center gap-2 mt-6"
                >
                  <Bell className="w-4 h-4" />
                  Saqlash
                </button>
              </div>
            )}

            {/* === DANGER ZONE === */}
            {activeSection === "danger" && (
              <div className="bg-white rounded-2xl border-2 border-red-100 shadow-sm p-6">
                <h2 className="text-lg font-bold text-red-700 mb-2 flex items-center gap-2">
                  <Trash2 className="w-5 h-5" /> Xavfli zona
                </h2>
                <p className="text-sm text-gray-500 mb-6">Bu amallар qaytarib bo'lmaydi. Ehtiyot bo'ling!</p>

                <div className="space-y-4">
                  <div className="border border-red-100 rounded-2xl p-5 bg-red-50">
                    <h3 className="font-bold text-gray-900 mb-1">Hisobni o'chirish</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Hisobingiz, barcha e'lonlaringiz va ma'lumotlaringiz o'chiriladi. Bu amal qaytarib bo'lmaydi.
                    </p>
                    <button
                      onClick={deleteAccount}
                      className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                      Hisobni o'chirish
                    </button>
                  </div>

                  <div className="border border-orange-100 rounded-2xl p-5 bg-orange-50">
                    <h3 className="font-bold text-gray-900 mb-1">Barcha seanslardan chiqish</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Barcha qurilmalardagi aktiv seanslar tugatiladi.
                    </p>
                    <button
                      onClick={() => { logout(); router.push("/"); toast.success("Chiqildi"); }}
                      className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition text-sm"
                    >
                      Barcha qurilmalardan chiqish
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: { ...(await serverSideTranslations(locale || "uz", ["common"])) },
});
