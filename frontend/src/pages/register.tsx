import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { authApi } from "@/lib/api";
import { Building2, Lock, Mail, User, Phone, Eye, EyeOff, Search, Home } from "lucide-react";
import { toast } from "react-toastify";

interface RegisterForm {
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
  password: string;
  confirm_password: string;
  language: string;
}

type UserType = "buyer" | "seller";

const USER_TYPES = [
  {
    type: "buyer" as UserType,
    icon: Search,
    titleUz: "Uy qidiraman",
    titleRu: "Ищу жильё",
    titleEn: "Looking for property",
    descUz: "Kvartira yoki uy sotib olmoqchi yoki ijaraga olmoqchiman",
    descRu: "Хочу купить или арендовать квартиру или дом",
    descEn: "I want to buy or rent an apartment or house",
    color: "border-blue-300 bg-blue-50",
    activeColor: "border-primary-500 bg-primary-50",
    iconColor: "text-blue-600",
  },
  {
    type: "seller" as UserType,
    icon: Home,
    titleUz: "E'lon beraman",
    titleRu: "Размещаю объявление",
    titleEn: "Listing a property",
    descUz: "Kvartira yoki uyimni sotmoqchi yoki ijaraga bermoqchiman",
    descRu: "Хочу продать или сдать квартиру или дом",
    descEn: "I want to sell or rent out my property",
    color: "border-green-300 bg-green-50",
    activeColor: "border-green-500 bg-green-50",
    iconColor: "text-green-600",
  },
];

export default function RegisterPage() {
  const { t, i18n } = useTranslation("common");
  const lang = (i18n.language || "uz") as "uz" | "ru" | "en";
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [userType, setUserType] = useState<UserType | null>(null);
  const [step, setStep] = useState<1 | 2>(1);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterForm>({
    defaultValues: { language: i18n.language || "uz" },
  });

  const password = watch("password");

  const onSubmit = async (data: RegisterForm) => {
    if (!userType) { toast.error("Foydalanuvchi turini tanlang"); return; }
    if (data.password !== data.confirm_password) { toast.error("Parollar mos emas!"); return; }
    setLoading(true);
    try {
      const res = await authApi.register({
        email: data.email,
        phone: data.phone || undefined,
        first_name: data.first_name,
        last_name: data.last_name,
        password: data.password,
        language: data.language,
      });
      const devCode = res.data?.dev_otp_code;
      if (devCode) {
        toast.info(`Tasdiqlash kodi: ${devCode}`, { autoClose: 60000 });
      } else {
        toast.success("Emailga tasdiqlash kodi yuborildi!");
      }
      router.push(`/verify-email?email=${encodeURIComponent(data.email)}${devCode ? `&dev_code=${devCode}` : ""}`);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || t("common.error"));
    } finally {
      setLoading(false);
    }
  };

  const langSuffix = lang === "uz" ? "Uz" : lang === "ru" ? "Ru" : "En";

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 to-primary-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-800 to-primary-700 px-8 pt-8 pb-6 text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-white">UzEstate</span>
          </Link>
          <h1 className="text-xl font-bold text-white">{t("auth.register_title")}</h1>
          <div className="flex justify-center gap-2 mt-4">
            {[1, 2].map((s) => (
              <div key={s} className={`h-1.5 rounded-full transition-all ${step >= s ? "w-8 bg-yellow-400" : "w-4 bg-white/30"}`} />
            ))}
          </div>
        </div>

        <div className="px-8 py-6">
          {/* Step 1: User type */}
          {step === 1 && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-4">Siz kim sifatida ro'yxatdan o'tyapsiz?</p>
              <div className="space-y-3 mb-6">
                {USER_TYPES.map((ut) => {
                  const title = ut[`title${langSuffix}` as keyof typeof ut] as string;
                  const desc = ut[`desc${langSuffix}` as keyof typeof ut] as string;
                  const selected = userType === ut.type;
                  return (
                    <button
                      key={ut.type}
                      onClick={() => setUserType(ut.type)}
                      className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${selected ? ut.activeColor + " border-opacity-100 shadow-sm" : "border-gray-200 hover:border-gray-300 bg-white"}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${selected ? "bg-white shadow-sm" : "bg-gray-50"}`}>
                          <ut.icon className={`w-5 h-5 ${selected ? ut.iconColor : "text-gray-400"}`} />
                        </div>
                        <div>
                          <div className={`font-bold text-sm ${selected ? "text-gray-900" : "text-gray-700"}`}>{title}</div>
                          <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">{desc}</div>
                        </div>
                        <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${selected ? "border-primary-500 bg-primary-500" : "border-gray-300"}`}>
                          {selected && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => { if (!userType) { toast.error("Turni tanlang"); return; } setStep(2); }}
                className="btn-primary w-full text-base"
              >
                Davom etish →
              </button>
              <p className="text-center text-sm text-gray-500 mt-4">
                {t("auth.have_account")}{" "}
                <Link href="/login" className="text-primary-600 hover:text-primary-800 font-semibold">{t("auth.login_link")}</Link>
              </p>
            </div>
          )}

          {/* Step 2: Form */}
          {step === 2 && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Selected type badge */}
              <div className="flex items-center justify-between mb-2">
                <button type="button" onClick={() => setStep(1)} className="text-sm text-gray-400 hover:text-gray-600">← Orqaga</button>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${userType === "buyer" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>
                  {userType === "buyer" ? "🔍 Xaridor" : "🏠 Sotuvchi"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">{t("auth.first_name")} *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input className="input-field pl-9 text-sm" placeholder="Ism"
                      {...register("first_name", { required: "Majburiy" })} />
                  </div>
                  {errors.first_name && <p className="text-red-500 text-xs mt-0.5">{errors.first_name.message}</p>}
                </div>
                <div>
                  <label className="label">{t("auth.last_name")} *</label>
                  <input className="input-field text-sm" placeholder="Familiya"
                    {...register("last_name", { required: "Majburiy" })} />
                </div>
              </div>

              <div>
                <label className="label">{t("auth.email")} *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="email" className="input-field pl-9" placeholder="email@example.com"
                    {...register("email", { required: "Majburiy", pattern: { value: /\S+@\S+\.\S+/, message: "Email noto'g'ri" } })} />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-0.5">{errors.email.message}</p>}
              </div>

              <div>
                <label className="label">{t("auth.phone")} <span className="text-gray-400 text-xs">(ixtiyoriy)</span></label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="tel" className="input-field pl-9" placeholder="+998 90 123 45 67"
                    {...register("phone")} />
                </div>
              </div>

              <div>
                <label className="label">{t("auth.language")}</label>
                <select className="input-field" {...register("language")}>
                  <option value="uz">🇺🇿 O'zbek</option>
                  <option value="ru">🇷🇺 Русский</option>
                  <option value="en">🇬🇧 English</option>
                </select>
              </div>

              <div>
                <label className="label">{t("auth.password")} *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type={showPass ? "text" : "password"} className="input-field pl-9 pr-9"
                    placeholder="Kamida 8 belgi (A, a, 1)"
                    {...register("password", {
                      required: "Majburiy",
                      minLength: { value: 8, message: "Kamida 8 belgi" },
                      pattern: { value: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)/, message: "Katta harf, kichik harf va raqam kerak" }
                    })} />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-0.5">{errors.password.message}</p>}
              </div>

              <div>
                <label className="label">{t("auth.confirm_password")} *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="password" className="input-field pl-9" placeholder="Parolni takrorlang"
                    {...register("confirm_password", {
                      required: "Majburiy",
                      validate: (v) => v === password || "Parollar mos emas"
                    })} />
                </div>
                {errors.confirm_password && <p className="text-red-500 text-xs mt-0.5">{errors.confirm_password.message}</p>}
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full text-base mt-2">
                {loading ? "Yuklanmoqda..." : t("auth.register_btn")}
              </button>

              <p className="text-center text-xs text-gray-500">
                {t("auth.have_account")}{" "}
                <Link href="/login" className="text-primary-600 font-semibold">{t("auth.login_link")}</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: { ...(await serverSideTranslations(locale || "uz", ["common"])) },
});
