import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "@/components/Layout";
import { useAuthStore } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { propertyApi } from "@/lib/api";
import PropertyCard from "@/components/PropertyCard";
import { Heart, ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function FavoritesPage() {
  const { t } = useTranslation("common");
  const router = useRouter();
  const { user, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
  }, [user, isLoading]);

  const { data: favorites, isLoading: favLoading } = useQuery({
    queryKey: ["favorites"],
    queryFn: () => propertyApi.getFavorites().then((r) => r.data),
    enabled: !!user,
  });

  if (isLoading || !user) return null;

  return (
    <Layout title={t("profile.favorites")}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/profile" className="p-2 hover:bg-gray-100 rounded-xl transition">
            <ChevronLeft className="w-5 h-5 text-gray-500" />
          </Link>
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-red-500" fill="currentColor" />
            <h1 className="text-2xl font-bold text-gray-900">{t("profile.favorites")}</h1>
          </div>
          {favorites && (
            <span className="bg-gray-100 text-gray-600 text-sm font-semibold px-3 py-1 rounded-full">
              {favorites.length} ta
            </span>
          )}
        </div>

        {favLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => <div key={i} className="h-72 bg-gray-100 rounded-2xl animate-pulse" />)}
          </div>
        ) : !favorites || favorites.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-5">
              <Heart className="w-10 h-10 text-red-200" />
            </div>
            <h2 className="text-xl font-bold text-gray-400 mb-2">Sevimlilar bo'sh</h2>
            <p className="text-gray-400 text-sm mb-6">E'lonlarda ❤️ belgisini bosib sevimlilarga qo'shing</p>
            <Link href="/properties" className="btn-primary inline-flex">
              E'lonlarga o'tish
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((p: any) => (
              <PropertyCard key={p.id} property={p} isFavorite={true} />
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
