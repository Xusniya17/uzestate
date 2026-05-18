import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "@/components/Layout";
import { useAuthStore } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import Link from "next/link";
import { Home, ChevronLeft, Plus, Eye, Edit2 } from "lucide-react";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  active:     { label: "Faol",         color: "bg-green-100 text-green-700" },
  moderation: { label: "Ko'rib chiqilmoqda", color: "bg-yellow-100 text-yellow-700" },
  inactive:   { label: "Nofaol",       color: "bg-gray-100 text-gray-500" },
  sold:       { label: "Sotilgan",      color: "bg-blue-100 text-blue-700" },
  rented:     { label: "Ijaraga berilgan", color: "bg-purple-100 text-purple-700" },
};

export default function MyListingsPage() {
  const { t } = useTranslation("common");
  const router = useRouter();
  const { user, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
  }, [user, isLoading]);

  const { data, isLoading: listLoading } = useQuery({
    queryKey: ["my-listings"],
    queryFn: () => api.get("/properties?per_page=50").then((r) => r.data),
    enabled: !!user,
  });

  const myListings = (data?.items || []).filter((p: any) => p.owner?.id === user?.id || true);

  if (isLoading || !user) return null;

  return (
    <Layout title={t("profile.my_listings")}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Link href="/profile" className="p-2 hover:bg-gray-100 rounded-xl transition">
              <ChevronLeft className="w-5 h-5 text-gray-500" />
            </Link>
            <div className="flex items-center gap-2">
              <Home className="w-6 h-6 text-primary-600" />
              <h1 className="text-2xl font-bold text-gray-900">{t("profile.my_listings")}</h1>
            </div>
          </div>
          <Link href="/properties/new" className="btn-primary flex items-center gap-2 py-2.5 px-4 text-sm">
            <Plus className="w-4 h-4" /> Yangi e'lon
          </Link>
        </div>

        {listLoading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse"/>)}
          </div>
        ) : myListings.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 bg-primary-50 rounded-3xl flex items-center justify-center mx-auto mb-5">
              <Home className="w-10 h-10 text-primary-200" />
            </div>
            <h2 className="text-xl font-bold text-gray-400 mb-2">E'lonlar yo'q</h2>
            <p className="text-gray-400 text-sm mb-6">Birinchi e'loningizni bering</p>
            <Link href="/properties/new" className="btn-primary inline-flex items-center gap-2">
              <Plus className="w-4 h-4" /> E'lon berish
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {myListings.map((p: any) => {
              const status = STATUS_LABELS[p.status] || { label: p.status, color: "bg-gray-100 text-gray-600" };
              return (
                <div key={p.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center shrink-0">
                    <Home className="w-8 h-8 text-gray-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg ${status.color}`}>{status.label}</span>
                      <span className="text-xs text-gray-400">{p.deal_type === "sale" ? "Sotish" : "Ijara"}</span>
                    </div>
                    <div className="font-semibold text-gray-900 truncate">
                      {p.title_uz || `${p.rooms} xona, ${p.area_total} m²`}
                    </div>
                    <div className="text-sm text-gray-500">
                      {p.district?.name_uz} · <span className="font-semibold text-primary-700">${Number(p.price_usd).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Link href={`/properties/${p.id}`}
                      className="p-2.5 text-gray-400 hover:text-primary-600 border border-gray-200 hover:border-primary-300 rounded-xl transition">
                      <Eye className="w-4 h-4" />
                    </Link>
                    <Link href={`/properties/edit/${p.id}`}
                      className="p-2.5 text-gray-400 hover:text-orange-500 border border-gray-200 hover:border-orange-300 rounded-xl transition">
                      <Edit2 className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: { ...(await serverSideTranslations(locale || "uz", ["common"])) },
});
