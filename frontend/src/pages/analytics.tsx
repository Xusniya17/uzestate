import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import Layout from "@/components/Layout";
import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "@/lib/api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from "recharts";
import { TrendingUp, Building2, DollarSign, MapPin } from "lucide-react";

export default function AnalyticsPage() {
  const { t } = useTranslation("common");

  const { data: overview } = useQuery({
    queryKey: ["market-overview"],
    queryFn: () => analyticsApi.getMarketOverview().then((r) => r.data),
  });

  const { data: trends } = useQuery({
    queryKey: ["price-trends"],
    queryFn: () => analyticsApi.getPriceTrends().then((r) => r.data),
  });

  const districtChartData = overview?.district_stats?.map((d: any) => ({
    name: d.name_uz?.replace(" tumani", ""),
    price: Math.round(d.avg_price_per_sqm),
    listings: d.listings_count,
  })) || [];

  return (
    <Layout title="Statistika">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Bozor statistikasi</h1>
          <p className="text-gray-500 mt-1">Toshkent shahri ko'chmas mulk bozori tahlili</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Building2, label: "Jami e'lonlar", value: overview?.total_listings?.toLocaleString() || "—", color: "blue" },
            { icon: DollarSign, label: "O'rtacha narx", value: overview ? `$${overview.avg_price_usd?.toLocaleString()}` : "—", color: "green" },
            { icon: TrendingUp, label: "1 m² narxi", value: overview ? `$${overview.avg_price_per_sqm?.toLocaleString()}` : "—", color: "purple" },
            { icon: MapPin, label: "Tumanlar", value: "12", color: "orange" },
          ].map((stat) => (
            <div key={stat.label} className="card">
              <div className={`w-10 h-10 rounded-xl bg-${stat.color}-50 flex items-center justify-center mb-3`}>
                <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
              </div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Tumanlar bo'yicha 1 m² narxi (USD)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={districtChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tickFormatter={(v) => `$${v}`} fontSize={12} />
                <YAxis type="category" dataKey="name" fontSize={11} width={100} />
                <Tooltip formatter={(v) => [`$${v}`, "1 m² narxi"]} />
                <Bar dataKey="price" fill="#1e40af" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h2 className="text-lg font-bold text-gray-900 mb-6">E'lonlar soni (tuman bo'yicha)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={districtChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={10} angle={-45} textAnchor="end" height={60} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="listings" fill="#059669" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card mt-6">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Tumanlar narx jadvali</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Tuman</th>
                  <th className="text-right py-3 px-4 text-gray-500 font-medium">1 m² narxi</th>
                  <th className="text-right py-3 px-4 text-gray-500 font-medium">E'lonlar</th>
                </tr>
              </thead>
              <tbody>
                {overview?.district_stats?.map((d: any, idx: number) => (
                  <tr key={d.code} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-800 text-xs flex items-center justify-center font-bold">
                          {idx + 1}
                        </span>
                        {d.name_uz}
                      </div>
                    </td>
                    <td className="text-right py-3 px-4 font-semibold text-primary-800">
                      ${d.avg_price_per_sqm?.toLocaleString()}/m²
                    </td>
                    <td className="text-right py-3 px-4 text-gray-500">{d.listings_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: { ...(await serverSideTranslations(locale || "uz", ["common"])) },
});
