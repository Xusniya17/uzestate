import Link from "next/link";
import { useTranslation } from "next-i18next";
import { MapPin, Maximize2, BedDouble, Layers, Eye, Heart } from "lucide-react";
import { useState } from "react";
import { propertyApi } from "@/lib/api";
import { useAuthStore } from "@/lib/auth";
import { toast } from "react-toastify";

interface Property {
  id: string;
  district: { name_uz: string; name_ru: string; name_en: string };
  property_type: string;
  deal_type: string;
  title_uz?: string;
  title_ru?: string;
  title_en?: string;
  area_total: number;
  rooms: number;
  floor: number;
  total_floors: number;
  repair_status: string;
  price_usd: number;
  price_uzs?: number;
  is_negotiable: boolean;
  views_count: number;
  images: { url: string; is_main: boolean }[];
  created_at: string;
}

interface Props {
  property: Property;
  isFavorite?: boolean;
}

const REPAIR_COLORS: Record<string, string> = {
  euro: "bg-green-100 text-green-700",
  good: "bg-blue-100 text-blue-700",
  average: "bg-yellow-100 text-yellow-700",
  needs_repair: "bg-orange-100 text-orange-700",
  without_repair: "bg-red-100 text-red-700",
};

export default function PropertyCard({ property, isFavorite = false }: Props) {
  const { t, i18n } = useTranslation("common");
  const { user } = useAuthStore();
  const [liked, setLiked] = useState(isFavorite);

  const lang = i18n.language as "uz" | "ru" | "en";
  const title =
    property[`title_${lang}` as keyof typeof property] ||
    property.title_uz ||
    `${property.rooms} ${t("properties.rooms")}, ${property.area_total} ${t("properties.area")}`;

  const districtName = property.district[`name_${lang}` as keyof typeof property.district];
  const mainImage = property.images?.find((i) => i.is_main)?.url || property.images?.[0]?.url;

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      toast.info(t("auth.login_title"));
      return;
    }
    try {
      if (liked) {
        await propertyApi.removeFavorite(property.id);
      } else {
        await propertyApi.addFavorite(property.id);
      }
      setLiked(!liked);
    } catch {}
  };

  return (
    <Link href={`/properties/${property.id}`} className="block group">
      <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1">
        <div className="relative h-52 bg-gray-100">
          {mainImage ? (
            <img src={mainImage} alt={String(title)} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <Layers className="w-12 h-12" />
            </div>
          )}
          <div className="absolute top-3 left-3">
            <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${
              property.deal_type === "sale" ? "bg-primary-800 text-white" : "bg-accent-500 text-white"
            }`}>
              {property.deal_type === "sale" ? t("properties.deal_sale") : t("properties.deal_rent")}
            </span>
          </div>
          <button
            onClick={handleFavorite}
            className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-colors ${
              liked ? "bg-red-500 text-white" : "bg-white/80 text-gray-500 hover:text-red-500"
            }`}
          >
            <Heart className="w-4 h-4" fill={liked ? "currentColor" : "none"} />
          </button>
        </div>

        <div className="p-4">
          <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
            <MapPin className="w-3 h-3" />
            {districtName}
          </div>

          <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-3">{String(title)}</h3>

          <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
            <span className="flex items-center gap-1">
              <BedDouble className="w-3.5 h-3.5" />
              {property.rooms} {t("properties.rooms")}
            </span>
            <span className="flex items-center gap-1">
              <Maximize2 className="w-3.5 h-3.5" />
              {property.area_total} m²
            </span>
            <span className="flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" />
              {property.floor}/{property.total_floors}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-bold text-primary-800 text-lg">
                ${property.price_usd.toLocaleString()}
              </div>
              <div className="text-xs text-gray-400">
                ${Math.round(property.price_usd / property.area_total).toLocaleString()}/m²
              </div>
            </div>
            <div className="flex items-center gap-2">
              {property.is_negotiable && (
                <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-lg font-medium">
                  {t("properties.negotiable")}
                </span>
              )}
              <span className={`text-xs px-2 py-1 rounded-lg font-medium ${REPAIR_COLORS[property.repair_status] || "bg-gray-100 text-gray-600"}`}>
                {t(`estimate.repair_types.${property.repair_status}`)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs text-gray-400 mt-3 pt-3 border-t border-gray-50">
            <Eye className="w-3 h-3" />
            {property.views_count} {t("properties.views")}
          </div>
        </div>
      </div>
    </Link>
  );
}
