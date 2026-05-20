import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import dynamic from "next/dynamic";
import Layout from "@/components/Layout";
import { useQuery } from "@tanstack/react-query";
import { analyticsApi, propertyApi } from "@/lib/api";
import { useState } from "react";
import { MapPin, Layers } from "lucide-react";

const TashkentMap = dynamic(() => import("@/components/TashkentMap"), { ssr: false });

export default function MapPage() {
  const { t, i18n } = useTranslation("common");
  const lang = i18n.language || "uz";
  const [selectedDistrict, setSelectedDistrict] = useState<any>(null);

  const { data: districts } = useQuery({
    queryKey: ["districts"],
    queryFn: () => propertyApi.getDistricts().then((r) => r.data),
  });

  const { data: overview } = useQuery({
    queryKey: ["market-overview"],
    queryFn: () => analyticsApi.getMarketOverview().then((r) => r.data),
  });

  const districtStats = overview?.district_stats || [];

  const mapTitles: Record<string, string> = { uz: "Toshkent xaritasi", ru: "Карта Ташкента", en: "Tashkent Map" };
  const mapSubs: Record<string, string> = { uz: "Tumanlar bo'yicha ko'chmas mulk narxlari", ru: "Цены на недвижимость по районам", en: "Real estate prices by district" };
  const locateTips: Record<string, string> = {
    uz: "Joylashuvingizni ko'rsatish uchun pastdagi 📍 tugmasini bosing. Brauzer so'rasa — Ruxsat berish ni tanlang.",
    ru: "Нажмите кнопку 📍 внизу карты, чтобы показать ваше местоположение. При запросе браузера — нажмите Разрешить.",
    en: "Click the 📍 button at the bottom of the map to show your location. Allow when browser asks.",
  };

  return (
    <Layout title={mapTitles[lang] || mapTitles.uz}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{mapTitles[lang] || mapTitles.uz}</h1>
          <p className="text-gray-500 mt-1">{mapSubs[lang] || mapSubs.uz}</p>
          <div className="mt-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex items-start gap-2 text-sm text-blue-700">
            <span className="text-lg">📍</span>
            <p>{locateTips[lang] || locateTips.uz}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden" style={{ height: "550px" }}>
              <TashkentMap districts={districts || []} districtStats={districtStats} onSelect={setSelectedDistrict} />
            </div>
          </div>

          <div className="space-y-4">
            {selectedDistrict ? (
              <div className="card border-2 border-primary-100">
                <div className="flex items-center gap-2 text-primary-800 font-bold mb-4">
                  <MapPin className="w-5 h-5" />
                  {selectedDistrict[`name_${lang}`] || selectedDistrict.name_uz}
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">{lang === "ru" ? "Цена за 1 м²" : lang === "en" ? "Price per 1 m²" : "1 m² narxi"}</span>
                    <span className="font-semibold">${selectedDistrict.avg_price_per_sqm?.toLocaleString()}/m²</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">{lang === "ru" ? "Объявлений" : lang === "en" ? "Listings" : "E'lonlar soni"}</span>
                    <span className="font-semibold">{selectedDistrict.listings_count}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card text-center text-gray-400 py-8">
                <Layers className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p className="text-sm">
                  {lang === "ru" ? "Нажмите на район на карте" : lang === "en" ? "Click on a district on the map" : "Xaritada tumanni bosing"}
                </p>
              </div>
            )}

            <div className="card">
              <h3 className="font-bold text-gray-900 mb-4">
                {lang === "ru" ? "Рейтинг цен" : lang === "en" ? "Price ranking" : "Narxlar reytingi"}
              </h3>
              <div className="space-y-3">
                {districtStats.slice(0, 8).map((d: any, idx: number) => {
                  const maxPrice = districtStats[0]?.avg_price_per_sqm || 1;
                  const pct = (d.avg_price_per_sqm / maxPrice) * 100;
                  return (
                    <div key={d.code}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700 truncate">{d.name_uz?.replace(" tumani", "")}</span>
                        <span className="font-semibold text-primary-700 ml-2">${d.avg_price_per_sqm?.toLocaleString()}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full">
                        <div
                          className="h-2 bg-primary-500 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: { ...(await serverSideTranslations(locale || "uz", ["common"])) },
});
