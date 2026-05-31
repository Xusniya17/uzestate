import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import Layout from "@/components/Layout";
import { useAuthStore } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { propertyApi } from "@/lib/api";
import { toast } from "react-toastify";
import { Home, RefreshCw, Send } from "lucide-react";

interface FormData {
  district_id: number;
  property_type: string;
  deal_type: string;
  building_type: string;
  title_uz: string;
  description_uz: string;
  area_total: number;
  rooms: number;
  floor: number;
  total_floors: number;
  repair_status: string;
  price_usd: number;
  has_elevator: boolean;
  has_parking: boolean;
  has_balcony: boolean;
  has_internet: boolean;
  is_negotiable: boolean;
  address: string;
  contact_phone: string;
}

export default function NewPropertyPage() {
  const { t } = useTranslation("common");
  const router = useRouter();
  const { user, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
  }, [user, isLoading]);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    defaultValues: {
      deal_type: "sale",
      property_type: "apartment",
      has_elevator: false,
      has_parking: false,
      has_balcony: false,
      has_internet: true,
      is_negotiable: true,
    },
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
    try {
      const res = await propertyApi.create({
        ...data,
        district_id: Number(data.district_id),
        area_total: Number(data.area_total),
        rooms: Number(data.rooms),
        floor: Number(data.floor),
        total_floors: Number(data.total_floors),
        price_usd: Number(data.price_usd),
      });
      toast.success("E'lon muvaffaqiyatli joylashtirildi!");
      router.push(`/properties/${res.data.id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Xatolik yuz berdi");
    }
  };

  if (isLoading || !user) return null;

  const buildingTypes = ["new", "old", "panel", "brick", "monolith"];
  const repairTypes = ["euro", "good", "average", "needs_repair", "without_repair"];
  const repairLabels: Record<string, string> = {
    euro: "Evro remont",
    good: "Yaxshi",
    average: "O'rtacha",
    needs_repair: "Ta'mirlash kerak",
    without_repair: "Ta'mirsiz",
  };
  const buildingLabels: Record<string, string> = {
    new: "Yangi bino",
    old: "Eski bino",
    panel: "Panel",
    brick: "G'isht",
    monolith: "Monolit",
  };

  return (
    <Layout title="E'lon berish">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
            <Home className="w-5 h-5 text-primary-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Yangi e'lon berish</h1>
            <p className="text-gray-500 text-sm">Ko'chmas mulk ma'lumotlarini kiriting</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Asosiy ma'lumotlar */}
          <div className="card space-y-4">
            <h2 className="font-semibold text-gray-900 border-b pb-2">Asosiy ma'lumotlar</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Mulk turi *</label>
                <select className="input-field" {...register("property_type", { required: true })}>
                  <option value="apartment">Kvartira</option>
                  <option value="house">Uy</option>
                  <option value="room">Xona</option>
                  <option value="commercial">Tijorat</option>
                </select>
              </div>
              <div>
                <label className="label">Bitim turi *</label>
                <select className="input-field" {...register("deal_type")}>
                  <option value="sale">Sotish</option>
                  <option value="rent">Ijaraga berish</option>
                </select>
              </div>
            </div>

            <div>
              <label className="label">Tuman *</label>
              <select className="input-field" {...register("district_id", { required: true })}>
                <option value="">Tumanni tanlang</option>
                {districts?.map((d: any) => (
                  <option key={d.id} value={d.id}>{d.name_uz}</option>
                ))}
              </select>
              {errors.district_id && <p className="text-red-500 text-xs mt-1">Majburiy maydon</p>}
            </div>

            <div>
              <label className="label">Manzil</label>
              <input
                type="text"
                placeholder="Ko'cha, uy raqami"
                className="input-field"
                {...register("address")}
              />
            </div>

            <div>
              <label className="label">E'lon sarlavhasi *</label>
              <input
                type="text"
                placeholder="Masalan: Yunusobodda 3 xonali kvartira sotiladi"
                className="input-field"
                {...register("title_uz", { required: true })}
              />
              {errors.title_uz && <p className="text-red-500 text-xs mt-1">Majburiy maydon</p>}
            </div>

            <div>
              <label className="label">Tavsif</label>
              <textarea
                rows={4}
                placeholder="Uy haqida batafsil ma'lumot..."
                className="input-field resize-none"
                {...register("description_uz")}
              />
            </div>
          </div>

          {/* Parametrlar */}
          <div className="card space-y-4">
            <h2 className="font-semibold text-gray-900 border-b pb-2">Parametrlar</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Umumiy maydon (m²) *</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="65"
                  className="input-field"
                  {...register("area_total", { required: true, min: 10 })}
                />
              </div>
              <div>
                <label className="label">Xonalar soni *</label>
                <select className="input-field" {...register("rooms", { required: true })}>
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>{n} xona</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Qavat *</label>
                <input
                  type="number"
                  placeholder="5"
                  className="input-field"
                  {...register("floor", { required: true, min: 1 })}
                />
              </div>
              <div>
                <label className="label">Umumiy qavatlar *</label>
                <input
                  type="number"
                  placeholder="9"
                  className="input-field"
                  {...register("total_floors", { required: true, min: 1 })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Bino turi *</label>
                <select className="input-field" {...register("building_type", { required: true })}>
                  {buildingTypes.map((bt) => (
                    <option key={bt} value={bt}>{buildingLabels[bt]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Ta'mirlash holati *</label>
                <select className="input-field" {...register("repair_status", { required: true })}>
                  {repairTypes.map((rt) => (
                    <option key={rt} value={rt}>{repairLabels[rt]}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-wrap gap-5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 accent-primary-800" {...register("has_elevator")} />
                <span className="text-sm text-gray-700">Lift</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 accent-primary-800" {...register("has_parking")} />
                <span className="text-sm text-gray-700">Avtoturargoh</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 accent-primary-800" {...register("has_balcony")} />
                <span className="text-sm text-gray-700">Balkon</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 accent-primary-800" {...register("has_internet")} />
                <span className="text-sm text-gray-700">Internet</span>
              </label>
            </div>
          </div>

          {/* Narx va aloqa */}
          <div className="card space-y-4">
            <h2 className="font-semibold text-gray-900 border-b pb-2">Narx va aloqa</h2>

            <div>
              <label className="label">Narx (USD) *</label>
              <input
                type="number"
                placeholder="85000"
                className="input-field"
                {...register("price_usd", { required: true, min: 1000 })}
              />
              {errors.price_usd && <p className="text-red-500 text-xs mt-1">Narxni kiriting</p>}
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 accent-primary-800" {...register("is_negotiable")} />
              <span className="text-sm text-gray-700">Narx kelishiladi</span>
            </label>

            <div>
              <label className="label">Telefon raqam</label>
              <input
                type="tel"
                placeholder="+998 90 123 45 67"
                className="input-field"
                {...register("contact_phone")}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full flex items-center justify-center gap-2 text-base py-3"
          >
            {isSubmitting ? (
              <><RefreshCw className="w-5 h-5 animate-spin" />Yuklanmoqda...</>
            ) : (
              <><Send className="w-5 h-5" />E'lonni joylash</>
            )}
          </button>
        </form>
      </div>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: { ...(await serverSideTranslations(locale || "uz", ["common"])) },
});
