import { GetServerSideProps } from "next";
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
import { Edit, RefreshCw, Save, Trash2 } from "lucide-react";

interface FormData {
  title_uz: string;
  description_uz: string;
  district_id: number;
  property_type: string;
  deal_type: string;
  building_type: string;
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

export default function EditPropertyPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
  }, [user, isLoading]);

  const { data: property, isLoading: propLoading } = useQuery({
    queryKey: ["property", id],
    queryFn: () => propertyApi.getOne(id as string).then((r) => r.data),
    enabled: !!id,
  });

  const { data: districts } = useQuery({
    queryKey: ["districts"],
    queryFn: () => propertyApi.getDistricts().then((r) => r.data),
  });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>();

  useEffect(() => {
    if (property) {
      reset({
        title_uz: property.title_uz || "",
        description_uz: property.description_uz || "",
        district_id: property.district?.id,
        property_type: property.property_type,
        deal_type: property.deal_type,
        building_type: property.building_type,
        area_total: property.area_total,
        rooms: property.rooms,
        floor: property.floor,
        total_floors: property.total_floors,
        repair_status: property.repair_status,
        price_usd: property.price_usd,
        has_elevator: property.has_elevator,
        has_parking: property.has_parking,
        has_balcony: property.has_balcony,
        has_internet: property.has_internet,
        is_negotiable: property.is_negotiable,
        address: property.address || "",
        contact_phone: property.contact_phone || "",
      });
    }
  }, [property, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      await propertyApi.update(id as string, {
        ...data,
        district_id: Number(data.district_id),
        area_total: Number(data.area_total),
        rooms: Number(data.rooms),
        floor: Number(data.floor),
        total_floors: Number(data.total_floors),
        price_usd: Number(data.price_usd),
      });
      toast.success("E'lon muvaffaqiyatli yangilandi!");
      router.push(`/properties/${id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Xatolik yuz berdi");
    }
  };

  const handleDelete = async () => {
    if (!confirm("E'lonni o'chirmoqchimisiz?")) return;
    try {
      await propertyApi.delete(id as string);
      toast.success("E'lon o'chirildi");
      router.push("/properties");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Xatolik yuz berdi");
    }
  };

  if (isLoading || !user || propLoading) return (
    <Layout title="Tahrirlash">
      <div className="max-w-3xl mx-auto px-4 py-20 flex justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    </Layout>
  );

  const buildingLabels: Record<string, string> = {
    new: "Yangi bino", old: "Eski bino", panel: "Panel", brick: "G'isht", monolith: "Monolit",
  };
  const repairLabels: Record<string, string> = {
    euro: "Evro remont", good: "Yaxshi", average: "O'rtacha",
    needs_repair: "Ta'mirlash kerak", without_repair: "Ta'mirsiz",
  };

  return (
    <Layout title="E'lonni tahrirlash">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
              <Edit className="w-5 h-5 text-primary-700" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">E'lonni tahrirlash</h1>
              <p className="text-gray-500 text-sm">Ma'lumotlarni o'zgartiring va saqlang</p>
            </div>
          </div>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition text-sm font-medium"
          >
            <Trash2 className="w-4 h-4" />
            O'chirish
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Asosiy */}
          <div className="card space-y-4">
            <h2 className="font-semibold text-gray-900 border-b pb-2">Asosiy ma'lumotlar</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Mulk turi</label>
                <select className="input-field" {...register("property_type")}>
                  <option value="apartment">Kvartira</option>
                  <option value="house">Uy</option>
                  <option value="room">Xona</option>
                  <option value="commercial">Tijorat</option>
                </select>
              </div>
              <div>
                <label className="label">Bitim turi</label>
                <select className="input-field" {...register("deal_type")}>
                  <option value="sale">Sotish</option>
                  <option value="rent">Ijaraga berish</option>
                </select>
              </div>
            </div>

            <div>
              <label className="label">Tuman</label>
              <select className="input-field" {...register("district_id")}>
                {districts?.map((d: any) => (
                  <option key={d.id} value={d.id}>{d.name_uz}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Manzil</label>
              <input type="text" className="input-field" {...register("address")} />
            </div>

            <div>
              <label className="label">Sarlavha</label>
              <input type="text" className="input-field" {...register("title_uz")} />
            </div>

            <div>
              <label className="label">Tavsif</label>
              <textarea rows={4} className="input-field resize-none" {...register("description_uz")} />
            </div>
          </div>

          {/* Parametrlar */}
          <div className="card space-y-4">
            <h2 className="font-semibold text-gray-900 border-b pb-2">Parametrlar</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Maydon (m²)</label>
                <input type="number" step="0.1" className="input-field" {...register("area_total")} />
              </div>
              <div>
                <label className="label">Xonalar soni</label>
                <select className="input-field" {...register("rooms")}>
                  {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} xona</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Qavat</label>
                <input type="number" className="input-field" {...register("floor")} />
              </div>
              <div>
                <label className="label">Umumiy qavatlar</label>
                <input type="number" className="input-field" {...register("total_floors")} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Bino turi</label>
                <select className="input-field" {...register("building_type")}>
                  {Object.entries(buildingLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Ta'mirlash holati</label>
                <select className="input-field" {...register("repair_status")}>
                  {Object.entries(repairLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            </div>

            <div className="flex flex-wrap gap-5">
              {[
                { name: "has_elevator", label: "Lift" },
                { name: "has_parking", label: "Avtoturargoh" },
                { name: "has_balcony", label: "Balkon" },
                { name: "has_internet", label: "Internet" },
              ].map(({ name, label }) => (
                <label key={name} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 accent-primary-800" {...register(name as any)} />
                  <span className="text-sm text-gray-700">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Narx */}
          <div className="card space-y-4">
            <h2 className="font-semibold text-gray-900 border-b pb-2">Narx va aloqa</h2>

            <div>
              <label className="label">Narx (USD)</label>
              <input type="number" className="input-field" {...register("price_usd")} />
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 accent-primary-800" {...register("is_negotiable")} />
              <span className="text-sm text-gray-700">Narx kelishiladi</span>
            </label>

            <div>
              <label className="label">Telefon</label>
              <input type="tel" className="input-field" {...register("contact_phone")} />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full flex items-center justify-center gap-2 text-base py-3"
          >
            {isSubmitting ? (
              <><RefreshCw className="w-5 h-5 animate-spin" />Saqlanmoqda...</>
            ) : (
              <><Save className="w-5 h-5" />Saqlash</>
            )}
          </button>
        </form>
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: { ...(await serverSideTranslations(locale || "uz", ["common"])) },
});
