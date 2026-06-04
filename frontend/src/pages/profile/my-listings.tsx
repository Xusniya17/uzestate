import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "@/components/Layout";
import { useAuthStore } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { propertyApi } from "@/lib/api";
import Link from "next/link";
import { ChevronLeft, Plus, Edit, Home, Eye } from "lucide-react";

export default function MyListingsPage() {
  const router = useRouter();
  const { user, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
  }, [user, isLoading]);

  const { data: listings, isLoading: listLoading } = useQuery({
    queryKey: ["my-listings"],
    queryFn: () => propertyApi.getMyProperties().then((r) => r.data),
    enabled: !!user,
  });

  if (isLoading || !user) return null;

  return (
    <Layout title="Mening e'lonlarim">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Link href="/profile" className="p-2 hover:bg-gray-100 rounded-xl transition">
              <ChevronLeft className="w-5 h-5 text-gray-500" />
            </Link>
            <div className="flex items-center gap-2">
              <Home className="w-6 h-6 text-primary-600" />
              <h1 className="text-2xl font-bold text-gray-900">Mening e'lonlarim</h1>
            </div>
          </div>
          <Link href="/properties/new" className="btn-primary flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" /> Yangi e'lon
          </Link>
        </div>

        {listLoading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse"/>)}
          </div>
        ) : !listings || listings.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 bg-primary-50 rounded-3xl flex items-center justify-center mx-auto mb-5">
              <Home className="w-10 h-10 text-primary-200" />
            </div>
            <h2 className="text-xl font-bold text-gray-400 mb-2">E'lonlar yo'q</h2>
            <p className="text-gray-400 text-sm mb-6">Hali e'lon joylashtirilmagan</p>
            <Link href="/properties/new" className="btn-primary inline-flex items-center gap-2">
              <Plus className="w-4 h-4" /> E'lon berish
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {listings.map((p: any) => (
              <div key={p.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-16 h-16 rounded-xl bg-primary-50 flex items-center justify-center shrink-0 overflow-hidden">
                    {p.images?.length > 0 ? (
                      <img src={p.images[0].url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Home className="w-7 h-7 text-primary-300" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-gray-900 truncate">
                      {p.title_uz || `${p.rooms} xona, ${p.area_total} m²`}
                    </div>
                    <div className="text-2xl font-black text-primary-800 mt-0.5">
                      ${Number(p.price_usd).toLocaleString()}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                      <span className={`px-2 py-0.5 rounded-full font-medium ${
                        p.status === "active" ? "bg-green-100 text-green-700" :
                        p.status === "moderation" ? "bg-yellow-100 text-yellow-700" :
                        "bg-gray-100 text-gray-500"
                      }`}>
                        {p.status === "active" ? "Aktiv" : p.status === "moderation" ? "Moderatsiyada" : "Nofaol"}
                      </span>
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3"/>{p.views_count || 0} ko'rish</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link href={`/properties/${p.id}`}
                    className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition">
                    <Eye className="w-5 h-5" />
                  </Link>
                  <Link href={`/properties/edit/${p.id}`}
                    className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition">
                    <Edit className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: { ...(await serverSideTranslations(locale || "uz", ["common"])) },
});
