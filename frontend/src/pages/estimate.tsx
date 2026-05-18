import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import { useForm } from "react-hook-form";
import Layout from "@/components/Layout";
import { predictionApi, propertyApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Calculator, TrendingUp, DollarSign, BarChart3, RefreshCw, Save } from "lucide-react";
import { toast } from "react-toastify";

interface FormData {
  district_id: number;
  area_total: number;
  rooms: number;
  floor: number;
  total_floors: number;
  building_type: string;
  repair_status: string;
  has_elevator: boolean;
  has_parking: boolean;
  has_balcony: boolean;
}

interface EstimationResult {
  predicted_price_usd: number;
  predicted_price_uzs: number;
  price_min_usd: number;
  price_max_usd: number;
  price_per_sqm_usd: number;
  confidence_score: number;
}

export default function EstimatePage() {
  const { t } = useTranslation("common");
  const [result, setResult] = useState<EstimationResult | null>(null);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    defaultValues: { has_elevator: false, has_parking: false, has_balcony: false },
  });

  const { data: districts } = useQuery({
    queryKey: ["districts"],
    queryFn: () => propertyApi.getDistricts().then((r) => r.data),
  });

  const onSubmit = async (data: FormData) => {
    if (Number(data.floor) > Number(data.total_floors)) {
      toast.error("Qavat umumiy qavatlar sonidan oshmasligi kerak!");
      return;
    }
    setLoading(true);
    try {
      const res = await predictionApi.estimate({
        ...data,
        district_id: Number(data.district_id),
        area_total: Number(data.area_total),
        rooms: Number(data.rooms),
        floor: Number(data.floor),
        total_floors: Number(data.total_floors),
      });
      setResult(res.data);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || t("common.error"));
    } finally {
      setLoading(false);
    }
  };

  const buildingTypes = ["new", "old", "panel", "brick", "monolith"];
  const repairTypes = ["euro", "good", "average", "needs_repair", "without_repair"];

  return (
    <Layout title={t("estimate.title")}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t("estimate.title")}</h1>
          <p className="text-gray-500 mt-2">{t("estimate.subtitle")}</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="card">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="label">{t("estimate.district")} *</label>
                <select className="input-field" {...register("district_id", { required: true })}>
                  <option value="">{t("estimate.select_district")}</option>
                  {districts?.map((d: any) => (
                    <option key={d.id} value={d.id}>{d.name_uz}</option>
                  ))}
                </select>
                {errors.district_id && <p className="text-red-500 text-xs mt-1">Majburiy maydon</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">{t("estimate.area")} *</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="60"
                    className="input-field"
                    {...register("area_total", { required: true, min: 15, max: 1000 })}
                  />
                </div>
                <div>
                  <label className="label">{t("estimate.rooms")} *</label>
                  <select className="input-field" {...register("rooms", { required: true })}>
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">{t("estimate.floor")} *</label>
                  <input
                    type="number"
                    placeholder="5"
                    className="input-field"
                    {...register("floor", { required: true, min: 1 })}
                  />
                </div>
                <div>
                  <label className="label">{t("estimate.total_floors")} *</label>
                  <input
                    type="number"
                    placeholder="9"
                    className="input-field"
                    {...register("total_floors", { required: true, min: 1 })}
                  />
                </div>
              </div>

              <div>
                <label className="label">{t("estimate.building_type")} *</label>
                <select className="input-field" {...register("building_type", { required: true })}>
                  {buildingTypes.map((bt) => (
                    <option key={bt} value={bt}>{t(`estimate.building_types.${bt}`)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">{t("estimate.repair_status")} *</label>
                <select className="input-field" {...register("repair_status", { required: true })}>
                  {repairTypes.map((rt) => (
                    <option key={rt} value={rt}>{t(`estimate.repair_types.${rt}`)}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 accent-primary-800" {...register("has_elevator")} />
                  <span className="text-sm text-gray-700">{t("estimate.has_elevator")}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 accent-primary-800" {...register("has_parking")} />
                  <span className="text-sm text-gray-700">{t("estimate.has_parking")}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 accent-primary-800" {...register("has_balcony")} />
                  <span className="text-sm text-gray-700">{t("estimate.has_balcony")}</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 text-base"
              >
                {loading ? (
                  <><RefreshCw className="w-5 h-5 animate-spin" />{t("common.loading")}</>
                ) : (
                  <><Calculator className="w-5 h-5" />{t("estimate.calculate_btn")}</>
                )}
              </button>
            </form>
          </div>

          {/* Result */}
          <div>
            {result ? (
              <div className="space-y-4">
                <div className="card border-2 border-primary-100 bg-gradient-to-br from-primary-50 to-white">
                  <div className="flex items-center gap-2 text-primary-700 font-semibold mb-4">
                    <TrendingUp className="w-5 h-5" />
                    {t("estimate.result_title")}
                  </div>

                  <div className="text-center py-6">
                    <div className="text-sm text-gray-500 mb-2">{t("estimate.predicted_price")}</div>
                    <div className="text-5xl font-black text-primary-800">
                      ${result.predicted_price_usd.toLocaleString()}
                    </div>
                    <div className="text-lg text-gray-500 mt-2">
                      ≈ {(result.predicted_price_uzs / 1_000_000).toFixed(1)} mln so'm
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="text-center bg-white rounded-xl p-3 border border-gray-100">
                      <div className="text-xs text-gray-400 mb-1">{t("estimate.price_range")}</div>
                      <div className="font-bold text-sm text-gray-800">
                        ${result.price_min_usd.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-400">— ${result.price_max_usd.toLocaleString()}</div>
                    </div>
                    <div className="text-center bg-white rounded-xl p-3 border border-gray-100">
                      <div className="text-xs text-gray-400 mb-1">{t("estimate.per_sqm")}</div>
                      <div className="font-bold text-sm text-gray-800">
                        ${result.price_per_sqm_usd.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-center bg-white rounded-xl p-3 border border-gray-100">
                      <div className="text-xs text-gray-400 mb-1">{t("estimate.confidence")}</div>
                      <div className={`font-bold text-sm ${result.confidence_score >= 85 ? "text-green-600" : "text-yellow-600"}`}>
                        {result.confidence_score}%
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => { setResult(null); reset(); }}
                    className="btn-secondary flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    {t("estimate.new_estimate")}
                  </button>
                  <button className="btn-primary flex items-center justify-center gap-2">
                    <Save className="w-4 h-4" />
                    {t("estimate.save_result")}
                  </button>
                </div>

                <div className="card bg-yellow-50 border-yellow-100">
                  <div className="flex items-start gap-3">
                    <BarChart3 className="w-5 h-5 text-yellow-600 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-semibold text-yellow-800 text-sm mb-1">Ma'lumot</div>
                      <p className="text-xs text-yellow-700 leading-relaxed">
                        Bu narx AI modeli tomonidan Toshkent shahridagi real bozor ma'lumotlari asosida hisoblanadi.
                        Haqiqiy narx bozor vaziyati, muzokaralar va boshqa omillarga ko'ra farq qilishi mumkin.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card h-full flex flex-col items-center justify-center text-center py-20 border-dashed">
                <div className="w-20 h-20 bg-primary-50 rounded-3xl flex items-center justify-center mb-6">
                  <DollarSign className="w-10 h-10 text-primary-300" />
                </div>
                <h3 className="text-xl font-semibold text-gray-400 mb-2">Narx hali hisoblanmagan</h3>
                <p className="text-gray-400 text-sm max-w-xs">
                  Chap tarafdagi formani to'ldiring va "Narxni hisoblash" tugmasini bosing
                </p>
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
