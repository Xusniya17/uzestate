import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "@/components/Layout";
import { useAuthStore } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { predictionApi } from "@/lib/api";
import Link from "next/link";
import { History, ChevronLeft, TrendingUp } from "lucide-react";

export default function HistoryPage() {
  const router = useRouter();
  const { user, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
  }, [user, isLoading]);

  const { data: history, isLoading: histLoading } = useQuery({
    queryKey: ["prediction-history"],
    queryFn: () => predictionApi.getHistory().then((r) => r.data),
    enabled: !!user,
  });

  if (isLoading || !user) return null;

  return (
    <Layout title="Baholash tarixi">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/profile" className="p-2 hover:bg-gray-100 rounded-xl transition">
            <ChevronLeft className="w-5 h-5 text-gray-500" />
          </Link>
          <div className="flex items-center gap-2">
            <History className="w-6 h-6 text-primary-600" />
            <h1 className="text-2xl font-bold text-gray-900">Baholash tarixi</h1>
          </div>
        </div>

        {histLoading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse"/>)}
          </div>
        ) : !history || history.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 bg-primary-50 rounded-3xl flex items-center justify-center mx-auto mb-5">
              <TrendingUp className="w-10 h-10 text-primary-200" />
            </div>
            <h2 className="text-xl font-bold text-gray-400 mb-2">Tarix bo'sh</h2>
            <p className="text-gray-400 text-sm mb-6">Narx baholaganingizda bu yerda ko'rinadi</p>
            <Link href="/estimate" className="btn-primary inline-flex">Narx baholash</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((h: any) => (
              <div key={h.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
                <div>
                  <div className="text-2xl font-black text-primary-800">${Number(h.predicted_price_usd).toLocaleString()}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    Aniqlik: <span className={`font-semibold ${h.confidence_score >= 85 ? "text-green-600" : "text-yellow-600"}`}>{h.confidence_score}%</span>
                  </div>
                </div>
                <div className="text-right text-xs text-gray-400">
                  {new Date(h.created_at).toLocaleDateString("uz-UZ")}
                  <br/>
                  {new Date(h.created_at).toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" })}
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
