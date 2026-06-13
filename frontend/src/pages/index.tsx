import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import Layout from "@/components/Layout";
import { useQuery } from "@tanstack/react-query";
import { analyticsApi, propertyApi } from "@/lib/api";
import PropertyCard from "@/components/PropertyCard";
import { Calculator, TrendingUp, Shield, ChevronRight, Building2, MapPin, BarChart3 } from "lucide-react";

export default function Home() {
  const { t } = useTranslation("common");

  const { data: overview } = useQuery({
    queryKey: ["market-overview"],
    queryFn: () => analyticsApi.getMarketOverview().then((r) => r.data),
  });

  const { data: latestProperties } = useQuery({
    queryKey: ["latest-properties"],
    queryFn: () => propertyApi.getList({ per_page: 6, sort_by: "created_at", sort_order: "desc" }).then((r) => r.data),
  });

  const stats = [
    { label: t("home.stats_listings"), value: overview?.total_listings?.toLocaleString() || "150+", icon: Building2, color: "text-blue-600 bg-blue-50" },
    { label: t("home.stats_districts"), value: (overview?.district_stats?.length || 10).toString(), icon: MapPin, color: "text-green-600 bg-green-50" },
    { label: t("home.stats_accuracy"), value: "80%", icon: TrendingUp, color: "text-purple-600 bg-purple-50" },
    { label: t("home.stats_dataset"), value: "1,542", icon: BarChart3, color: "text-orange-600 bg-orange-50" },
  ];

  const steps = [
    { num: "01", title: t("home.how_step1_title"), desc: t("home.how_step1_desc"), icon: Building2 },
    { num: "02", title: t("home.how_step2_title"), desc: t("home.how_step2_desc"), icon: Calculator },
    { num: "03", title: t("home.how_step3_title"), desc: t("home.how_step3_desc"), icon: TrendingUp },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full text-sm mb-6 backdrop-blur-sm">
              <Shield className="w-4 h-4 text-green-400" />
              <span>AI-powered • Toshkent shahri • 2026</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-4">
              {t("home.hero_title")}{" "}
              <span className="text-yellow-400">{t("home.hero_title_accent")}</span>
            </h1>
            <p className="text-lg md:text-xl text-blue-100 mb-10 leading-relaxed max-w-2xl">
              {t("home.hero_subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/estimate"
                className="inline-flex items-center justify-center gap-2 bg-yellow-400 text-gray-900 font-bold py-4 px-8 rounded-2xl hover:bg-yellow-300 transition-all text-lg shadow-lg"
              >
                <Calculator className="w-5 h-5" />
                {t("home.hero_btn_estimate")}
              </Link>
              <Link
                href="/properties"
                className="inline-flex items-center justify-center gap-2 bg-white/15 border border-white/30 text-white font-semibold py-4 px-8 rounded-2xl hover:bg-white/25 transition-all text-lg backdrop-blur-sm"
              >
                <Building2 className="w-5 h-5" />
                {t("home.hero_btn_properties")}
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center">
              <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mx-auto mb-3`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">{t("home.how_title")}</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div key={step.num} className="text-center">
              <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <step.icon className="w-8 h-8 text-primary-800" />
              </div>
              <div className="text-4xl font-black text-primary-100 mb-2">{step.num}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
              <p className="text-gray-500 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-12">
          <Link href="/estimate" className="btn-primary inline-flex items-center gap-2 text-lg">
            <Calculator className="w-5 h-5" />
            {t("home.hero_btn_estimate")}
          </Link>
        </div>
      </section>

      {/* District prices */}
      {overview?.district_stats && (
        <section className="bg-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">{t("home.districts_title")}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {overview.district_stats.slice(0, 8).map((d: any) => (
                <Link
                  key={d.code}
                  href={`/properties?district_code=${d.code}`}
                  className="group bg-gray-50 hover:bg-primary-50 border border-gray-100 hover:border-primary-200 rounded-2xl p-4 transition-all"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-primary-600" />
                    <span className="font-semibold text-sm text-gray-900 group-hover:text-primary-800">
                      {d.name_uz?.replace(" tumani", "")}
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-primary-800">
                    ${d.avg_price_per_sqm?.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">{t("home.per_sqm")}</div>
                  <div className="text-xs text-gray-500 mt-2">{d.listings_count} e'lon</div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest listings */}
      {latestProperties?.items?.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">{t("home.latest_title")}</h2>
            <Link href="/properties" className="text-primary-600 hover:text-primary-800 font-medium flex items-center gap-1">
              {t("home.view_all")} <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestProperties.items.map((p: any) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        </section>
      )}
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: { ...(await serverSideTranslations(locale || "uz", ["common"])) },
});
