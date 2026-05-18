import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import Layout from "@/components/Layout";
import { propertyApi } from "@/lib/api";
import { useAuthStore } from "@/lib/auth";
import { useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import {
  MapPin, BedDouble, Maximize2, Layers, Phone, Heart,
  ChevronLeft, CheckCircle, XCircle, Car,
  Wind, Wifi, Home, Calendar, Eye
} from "lucide-react";
import dynamic from "next/dynamic";

const MiniMap = dynamic(() => import("@/components/MiniMap"), { ssr: false });

interface Props { property: any; }

const REPAIR_LABELS: Record<string, { uz: string; ru: string; en: string; color: string }> = {
  euro:          { uz: "Evroremоnt",       ru: "Евроремонт",       en: "Euro renovation", color: "bg-green-100 text-green-700" },
  good:          { uz: "Yaxshi holat",      ru: "Хорошее состояние", en: "Good condition",  color: "bg-blue-100 text-blue-700" },
  average:       { uz: "O'rtacha holat",    ru: "Среднее состояние", en: "Average",         color: "bg-yellow-100 text-yellow-700" },
  needs_repair:  { uz: "Ta'mirlash kerak",  ru: "Требует ремонта",   en: "Needs repair",    color: "bg-orange-100 text-orange-700" },
  without_repair:{ uz: "Ta'mirsiz",         ru: "Без ремонта",       en: "Without repair",  color: "bg-red-100 text-red-700" },
};

const BUILDING_LABELS: Record<string, Record<string,string>> = {
  new:     { uz: "Yangi bino",  ru: "Новостройка",  en: "New building" },
  old:     { uz: "Eski bino",   ru: "Старый фонд",  en: "Old building" },
  panel:   { uz: "Panel",       ru: "Панельный",    en: "Panel" },
  brick:   { uz: "G'isht",      ru: "Кирпичный",    en: "Brick" },
  monolith:{ uz: "Monolit",     ru: "Монолитный",   en: "Monolith" },
};

export default function PropertyDetailPage({ property }: Props) {
  const { t, i18n } = useTranslation("common");
  const lang = (i18n.language || "uz") as "uz" | "ru" | "en";
  const { user } = useAuthStore();
  const [liked, setLiked] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [showPhone, setShowPhone] = useState(false);

  if (!property) return (
    <Layout><div className="text-center py-32 text-gray-400">E'lon topilmadi</div></Layout>
  );

  const title = property[`title_${lang}`] || property.title_uz || `${property.rooms} xona, ${property.area_total} m²`;
  const description = property[`description_${lang}`] || property.description_uz;
  const districtName = property.district?.[`name_${lang}`] || property.district?.name_uz;
  const repair = REPAIR_LABELS[property.repair_status] || { uz: property.repair_status, color: "bg-gray-100 text-gray-600" };
  const building = BUILDING_LABELS[property.building_type] || {};
  const images = property.images || [];

  const handleFavorite = async () => {
    if (!user) { toast.info("Sevimliga qo'shish uchun kiring"); return; }
    try {
      if (liked) await propertyApi.removeFavorite(property.id);
      else await propertyApi.addFavorite(property.id);
      setLiked(!liked);
      toast.success(liked ? "Sevimlilardan o'chirildi" : "Sevimlilarga qo'shildi");
    } catch { toast.error("Xatolik yuz berdi"); }
  };

  const features = [
    { icon: Layers,    label: `${property.floor}/${property.total_floors} ${t("properties.floor")}`, show: true },
    { icon: Maximize2, label: `${property.area_total} m²`, show: true },
    { icon: BedDouble, label: `${property.rooms} ${t("properties.rooms")}`, show: true },
    { icon: CheckCircle, label: "Lift bor",        show: property.has_elevator, color: "text-green-600" },
    { icon: Car,        label: "Avtoturargoh",     show: property.has_parking,  color: "text-green-600" },
    { icon: Wind,       label: "Balkon",           show: property.has_balcony,  color: "text-green-600" },
    { icon: Wifi,       label: "Internet",         show: property.has_internet, color: "text-green-600" },
  ];

  return (
    <Layout title={String(title)}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back */}
        <Link href="/properties" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary-700 mb-6 text-sm font-medium">
          <ChevronLeft className="w-4 h-4" /> {t("properties.title")}
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: images + info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image gallery */}
            <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
              <div className="relative h-72 sm:h-96 bg-gradient-to-br from-primary-50 to-blue-50 flex items-center justify-center">
                {images.length > 0 ? (
                  <img src={images[activeImg]?.url} alt={String(title)} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center text-gray-300">
                    <Home className="w-20 h-20 mx-auto mb-3" />
                    <p className="text-sm">Rasm yuklanmagan</p>
                  </div>
                )}
                {/* badges */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-xl ${property.deal_type === "sale" ? "bg-primary-800 text-white" : "bg-emerald-600 text-white"}`}>
                    {property.deal_type === "sale" ? "Sotiladi" : "Ijaraga beriladi"}
                  </span>
                  {property.is_negotiable && (
                    <span className="bg-yellow-400 text-gray-900 text-xs font-bold px-3 py-1.5 rounded-xl">Kelishiladi</span>
                  )}
                </div>
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto">
                  {images.map((img: any, i: number) => (
                    <button key={i} onClick={() => setActiveImg(i)}
                      className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${activeImg === i ? "border-primary-500" : "border-gray-200"}`}>
                      <img src={img.url} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Title & Price */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{String(title)}</h1>
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <MapPin className="w-4 h-4 text-primary-500" />
                    {districtName}
                    {property.address && <span>· {property.address}</span>}
                  </div>
                </div>
                <button onClick={handleFavorite}
                  className={`p-2.5 rounded-xl border transition-all ${liked ? "bg-red-50 border-red-200 text-red-500" : "bg-gray-50 border-gray-200 text-gray-400 hover:text-red-400"}`}>
                  <Heart className="w-5 h-5" fill={liked ? "currentColor" : "none"} />
                </button>
              </div>

              <div className="mt-5 pt-5 border-t border-gray-50">
                <div className="text-4xl font-black text-primary-800">
                  ${Number(property.price_usd).toLocaleString()}
                  {property.deal_type === "rent" && <span className="text-xl font-medium text-gray-400">/oy</span>}
                </div>
                <div className="text-gray-400 text-sm mt-1">
                  ≈ {(Number(property.price_uzs) / 1_000_000).toFixed(0)} mln so'm
                  · ${Math.round(Number(property.price_usd) / Number(property.area_total)).toLocaleString()}/m²
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Mulk xususiyatlari</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {features.filter(f => f.show).map((f, i) => (
                  <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                    <f.icon className={`w-5 h-5 shrink-0 ${(f as any).color || "text-primary-600"}`} />
                    <span className="text-sm font-medium text-gray-700">{f.label}</span>
                  </div>
                ))}
                <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg ${repair.color}`}>{repair[lang] || repair.uz}</span>
                </div>
                <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                  <Home className="w-5 h-5 text-primary-600 shrink-0" />
                  <span className="text-sm font-medium text-gray-700">{building[lang] || building.uz}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            {description && (
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-3">Tavsif</h2>
                <p className="text-gray-600 leading-relaxed">{description}</p>
              </div>
            )}

            {/* Map */}
            {property.latitude && property.longitude && (
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Joylashuv</h2>
                <div style={{ height: 280 }}>
                  <MiniMap lat={property.latitude} lng={property.longitude} title={String(title)} />
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Eye className="w-3.5 h-3.5" />
              {property.views_count} ko'rish
              <span>·</span>
              <Calendar className="w-3.5 h-3.5" />
              {new Date(property.created_at).toLocaleDateString("uz-UZ")}
            </div>
          </div>

          {/* Right: contact card */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm sticky top-20">
              <h3 className="font-bold text-gray-900 mb-5">Murojaat qilish</h3>

              {showPhone ? (
                <a href={`tel:${property.contact_phone}`}
                  className="flex items-center justify-center gap-3 w-full bg-primary-800 text-white font-bold py-3.5 rounded-xl hover:bg-primary-700 transition mb-3">
                  <Phone className="w-5 h-5" />
                  {property.contact_phone || "+998 71 200 00 00"}
                </a>
              ) : (
                <button onClick={() => setShowPhone(true)}
                  className="flex items-center justify-center gap-3 w-full bg-primary-800 text-white font-bold py-3.5 rounded-xl hover:bg-primary-700 transition mb-3">
                  <Phone className="w-5 h-5" />
                  Telefon raqamni ko'rish
                </button>
              )}

              <button onClick={handleFavorite}
                className={`flex items-center justify-center gap-2 w-full border-2 font-semibold py-3 rounded-xl transition ${liked ? "border-red-300 text-red-500 bg-red-50" : "border-gray-200 text-gray-600 hover:border-primary-300"}`}>
                <Heart className="w-4 h-4" fill={liked ? "currentColor" : "none"} />
                {liked ? "Sevimlilardan o'chirish" : "Sevimlilarga qo'shish"}
              </button>

              <div className="mt-5 pt-5 border-t border-gray-50 space-y-3 text-sm">
                {[
                  ["Mulk turi", property.property_type === "apartment" ? "Kvartira" : "Uy"],
                  ["Bitim turi", property.deal_type === "sale" ? "Sotish" : "Ijara"],
                  ["Maydon", `${property.area_total} m²`],
                  ["Xonalar", `${property.rooms} ta`],
                  ["Qavat", `${property.floor}/${property.total_floors}`],
                  ["Bino turi", building[lang] || building.uz || property.building_type],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-gray-400">{label}</span>
                    <span className="font-medium text-gray-800">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Safety note */}
            <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-4 text-xs text-yellow-700">
              <p className="font-semibold mb-1">⚠ Ehtiyot bo'ling</p>
              <p>Pul o'tkazishdan oldin mulkni shaxsan tekshiring. Oldindan pul o'tkazmang.</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params, locale }) => {
  try {
    const { default: axios } = await import("axios");
    const res = await axios.get(`http://localhost:8000/v1/properties/${params?.id}`, { timeout: 5000 });
    return {
      props: {
        property: res.data,
        ...(await serverSideTranslations(locale || "uz", ["common"])),
      },
    };
  } catch {
    return {
      props: {
        property: null,
        ...(await serverSideTranslations(locale || "uz", ["common"])),
      },
    };
  }
};
