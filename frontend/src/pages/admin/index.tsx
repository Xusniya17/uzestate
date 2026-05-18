import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Layout from "@/components/Layout";
import { useAuthStore } from "@/lib/auth";
import { api } from "@/lib/api";
import { Users, Home, TrendingUp, CheckCircle, XCircle, Eye, Trash2, Shield } from "lucide-react";

export default function AdminPage() {
  const router = useRouter();
  const { user, isLoading } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [properties, setProperties] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [tab, setTab] = useState<"overview" | "properties" | "users">("overview");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      router.push("/");
    }
  }, [user, isLoading]);

  useEffect(() => {
    if (user?.role !== "admin") return;
    Promise.all([
      api.get("/analytics/market-overview"),
      api.get("/properties?per_page=50&sort_by=created_at&sort_order=desc"),
    ]).then(([statsRes, propsRes]) => {
      setStats(statsRes.data);
      setProperties(propsRes.data.items || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user]);

  const approveProperty = async (id: string) => {
    await api.put(`/properties/${id}`, { status: "active" });
    setProperties((prev) => prev.map((p) => p.id === id ? { ...p, status: "active" } : p));
  };

  const rejectProperty = async (id: string) => {
    await api.put(`/properties/${id}`, { status: "inactive" });
    setProperties((prev) => prev.map((p) => p.id === id ? { ...p, status: "inactive" } : p));
  };

  if (isLoading || !user || user.role !== "admin") return null;

  const pending = properties.filter((p) => p.status === "moderation");
  const active = properties.filter((p) => p.status === "active");

  return (
    <Layout title="Admin Panel">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-gray-500 text-sm">UzEstate boshqaruv paneli</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { key: "overview", label: "Ko'rinish" },
            { key: "properties", label: `E'lonlar (${pending.length} kutmoqda)` },
            { key: "users", label: "Foydalanuvchilar" },
          ].map((t) => (
            <button key={t.key} onClick={() => setTab(t.key as any)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${tab === t.key ? "bg-primary-800 text-white" : "bg-white text-gray-600 border border-gray-200 hover:border-primary-300"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === "overview" && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Home,       label: "Jami e'lonlar",  value: stats?.total_listings || 0,       color: "blue" },
              { icon: CheckCircle,label: "Faol e'lonlar",  value: active.length,                    color: "green" },
              { icon: Eye,        label: "Kutmoqda",       value: pending.length,                   color: "yellow" },
              { icon: TrendingUp, label: "O'rt. narx/m²",  value: `$${stats?.avg_price_per_sqm || 0}`, color: "purple" },
            ].map((s) => (
              <div key={s.label} className="card">
                <div className={`w-10 h-10 rounded-xl bg-${s.color}-50 flex items-center justify-center mb-3`}>
                  <s.icon className={`w-5 h-5 text-${s.color}-600`} />
                </div>
                <div className="text-2xl font-bold text-gray-900">{s.value}</div>
                <div className="text-sm text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}

            {/* District table */}
            {stats?.district_stats && (
              <div className="col-span-2 md:col-span-4 card">
                <h2 className="font-bold text-gray-900 mb-4">Tumanlar statistikasi</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-2 text-gray-500 font-medium">Tuman</th>
                        <th className="text-right py-2 text-gray-500 font-medium">1 m² narxi</th>
                        <th className="text-right py-2 text-gray-500 font-medium">E'lonlar</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.district_stats.map((d: any) => (
                        <tr key={d.code} className="border-b border-gray-50">
                          <td className="py-2.5 font-medium">{d.name_uz}</td>
                          <td className="text-right py-2.5 text-primary-700 font-semibold">${d.avg_price_per_sqm?.toLocaleString()}</td>
                          <td className="text-right py-2.5 text-gray-500">{d.listings_count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Properties moderation */}
        {tab === "properties" && (
          <div className="space-y-3">
            {properties.length === 0 ? (
              <div className="text-center py-16 text-gray-400">E'lonlar topilmadi</div>
            ) : (
              properties.map((p) => (
                <div key={p.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${
                        p.status === "active" ? "bg-green-100 text-green-700" :
                        p.status === "moderation" ? "bg-yellow-100 text-yellow-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {p.status === "active" ? "✓ Faol" : p.status === "moderation" ? "⏳ Kutmoqda" : "✗ Rad"}
                      </span>
                      <span className="text-xs text-gray-400">{p.deal_type === "sale" ? "Sotish" : "Ijara"}</span>
                    </div>
                    <div className="font-semibold text-gray-900 truncate">{p.title_uz || `${p.rooms} xona, ${p.area_total}m²`}</div>
                    <div className="text-sm text-gray-500">{p.district?.name_uz} · ${Number(p.price_usd).toLocaleString()}</div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <a href={`/properties/${p.id}`} target="_blank"
                      className="p-2 text-gray-400 hover:text-primary-600 border border-gray-200 rounded-xl hover:border-primary-300 transition">
                      <Eye className="w-4 h-4" />
                    </a>
                    {p.status !== "active" && (
                      <button onClick={() => approveProperty(p.id)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition">
                        <CheckCircle className="w-4 h-4" /> Tasdiqlash
                      </button>
                    )}
                    {p.status !== "inactive" && (
                      <button onClick={() => rejectProperty(p.id)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-red-100 text-red-600 text-sm font-semibold rounded-xl hover:bg-red-200 transition">
                        <XCircle className="w-4 h-4" /> Rad etish
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Users */}
        {tab === "users" && (
          <div className="card">
            <p className="text-gray-500 text-sm">Foydalanuvchilar ro'yxati API orqali yuklanadi.</p>
            <a href="http://localhost:8000/docs#/Users" target="_blank"
              className="inline-flex items-center gap-2 mt-4 text-primary-600 hover:text-primary-800 text-sm font-medium">
              <Users className="w-4 h-4" /> API docs orqali ko'rish →
            </a>
          </div>
        )}
      </div>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: { ...(await serverSideTranslations(locale || "uz", ["common"])) },
});
