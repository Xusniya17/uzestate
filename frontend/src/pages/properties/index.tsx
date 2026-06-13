import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import PropertyCard from "@/components/PropertyCard";
import { propertyApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Filter, Grid3X3, List, Search, SlidersHorizontal, Plus } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/lib/auth";

export default function PropertiesPage() {
  const { t } = useTranslation("common");
  const { user } = useAuthStore();
  const [filters, setFilters] = useState({
    search: "",
    district_id: "",
    deal_type: "sale",
    min_price: "",
    max_price: "",
    min_area: "",
    max_area: "",
    rooms: "",
    repair_status: "",
    building_type: "",
    page: 1,
    per_page: 12,
    sort_by: "created_at",
    sort_order: "desc",
  });
  const [searchText, setSearchText] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Debounce the search input so we don't refetch on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchText, page: 1 }));
    }, 400);
    return () => clearTimeout(timer);
  }, [searchText]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data: districts } = useQuery({
    queryKey: ["districts"],
    queryFn: () => propertyApi.getDistricts().then((r) => r.data),
  });

  const { data, isLoading } = useQuery({
    queryKey: ["properties", filters],
    queryFn: () => {
      const params: any = {};
      Object.entries(filters).forEach(([k, v]) => { if (v !== "" && v !== undefined) params[k] = v; });
      return propertyApi.getList(params).then((r) => r.data);
    },
  });

  const updateFilter = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const repairTypes = ["euro", "good", "average", "needs_repair", "without_repair"];
  const buildingTypes = ["new", "old", "panel", "brick", "monolith"];

  return (
    <Layout title={t("properties.title")}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t("properties.title")}</h1>
            {data && <p className="text-gray-500 text-sm mt-1">{data.total} ta e'lon topildi</p>}
          </div>
          <div className="flex items-center gap-3">
            {user && (
              <Link href="/properties/new" className="btn-primary flex items-center gap-2 text-sm py-2.5">
                <Plus className="w-4 h-4" />
                {t("properties.add_listing")}
              </Link>
            )}
          </div>
        </div>

        {/* Deal type tabs */}
        <div className="flex gap-2 mb-6">
          {["sale", "rent"].map((dt) => (
            <button
              key={dt}
              onClick={() => updateFilter("deal_type", dt)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                filters.deal_type === dt
                  ? "bg-primary-800 text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-primary-300"
              }`}
            >
              {dt === "sale" ? t("properties.deal_sale") : t("properties.deal_rent")}
            </button>
          ))}
        </div>

        <div className="flex gap-3 mb-6 flex-wrap">
          <div className="flex-1 relative min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={t("properties.search")}
              className="input-field pl-9 py-2.5"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
          <select
            className="input-field w-auto py-2.5"
            value={filters.district_id}
            onChange={(e) => updateFilter("district_id", e.target.value)}
          >
            <option value="">{t("common.all_districts")}</option>
            {districts?.map((d: any) => (
              <option key={d.id} value={d.id}>{d.name_uz}</option>
            ))}
          </select>
          <select
            className="input-field w-auto py-2.5"
            value={`${filters.sort_by}|${filters.sort_order}`}
            onChange={(e) => {
              const [by, order] = e.target.value.split("|");
              setFilters((p) => ({ ...p, sort_by: by, sort_order: order }));
            }}
          >
            <option value="created_at|desc">{t("properties.sort_newest")}</option>
            <option value="price_usd|asc">{t("properties.sort_price_asc")}</option>
            <option value="price_usd|desc">{t("properties.sort_price_desc")}</option>
          </select>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
              showFilters ? "bg-primary-50 border-primary-300 text-primary-800" : "bg-white border-gray-200 text-gray-600"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            {t("properties.filter")}
          </button>
          <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg ${viewMode === "grid" ? "bg-primary-100 text-primary-800" : "text-gray-400"}`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg ${viewMode === "list" ? "bg-primary-100 text-primary-800" : "text-gray-400"}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="card mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="label">Min narx (USD)</label>
              <input type="number" className="input-field" placeholder="0"
                value={filters.min_price}
                onChange={(e) => updateFilter("min_price", e.target.value)} />
            </div>
            <div>
              <label className="label">Max narx (USD)</label>
              <input type="number" className="input-field" placeholder="500000"
                value={filters.max_price}
                onChange={(e) => updateFilter("max_price", e.target.value)} />
            </div>
            <div>
              <label className="label">Xonalar soni</label>
              <select className="input-field" value={filters.rooms}
                onChange={(e) => updateFilter("rooms", e.target.value)}>
                <option value="">Hammasi</option>
                {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Ta'mirlash holati</label>
              <select className="input-field" value={filters.repair_status}
                onChange={(e) => updateFilter("repair_status", e.target.value)}>
                <option value="">Hammasi</option>
                {repairTypes.map((rt) => (
                  <option key={rt} value={rt}>{t(`estimate.repair_types.${rt}`)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Bino turi</label>
              <select className="input-field" value={filters.building_type}
                onChange={(e) => updateFilter("building_type", e.target.value)}>
                <option value="">Hammasi</option>
                {buildingTypes.map((bt) => (
                  <option key={bt} value={bt}>{t(`estimate.building_types.${bt}`)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Min maydon (m²)</label>
              <input type="number" className="input-field" placeholder="20"
                value={filters.min_area}
                onChange={(e) => updateFilter("min_area", e.target.value)} />
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-72 animate-pulse" />
            ))}
          </div>
        ) : data?.items?.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Filter className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">{t("properties.no_results")}</p>
          </div>
        ) : (
          <>
            <div className={`grid gap-6 ${viewMode === "grid" ? "sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
              {data?.items?.map((p: any) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>

            {data && data.pages > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                {Array.from({ length: data.pages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setFilters((prev) => ({ ...prev, page }))}
                    className={`w-10 h-10 rounded-xl text-sm font-medium ${
                      filters.page === page
                        ? "bg-primary-800 text-white"
                        : "bg-white text-gray-600 border border-gray-200 hover:border-primary-300"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: { ...(await serverSideTranslations(locale || "uz", ["common"])) },
});
