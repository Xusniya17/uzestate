import { useTranslation } from "next-i18next";
import Link from "next/link";
import { Building2, Mail, Phone } from "lucide-react";

export default function Footer() {
  const { t } = useTranslation("common");

  return (
    <footer className="bg-gray-900 text-gray-300 py-12 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-white">UzEstate</span>
            </div>
            <p className="text-sm text-gray-400 max-w-sm leading-relaxed">{t("footer.desc")}</p>
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-primary-400" />
                <span>info@uzestate.uz</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-primary-400" />
                <span>+998 71 200 00 00</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Toshkent</h3>
            <ul className="space-y-2 text-sm">
              {["Yunusobod", "Chilonzor", "Mirzo Ulug'bek", "Yakkasaroy", "Mirobod", "Sergeli"].map((d) => (
                <li key={d}>
                  <Link href={`/properties?district=${d}`} className="hover:text-white transition-colors">
                    {d}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">UzEstate</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/estimate" className="hover:text-white">{t("nav.estimate")}</Link></li>
              <li><Link href="/properties" className="hover:text-white">{t("nav.properties")}</Link></li>
              <li><Link href="/analytics" className="hover:text-white">{t("nav.analytics")}</Link></li>
              <li><Link href="/map" className="hover:text-white">{t("nav.map")}</Link></li>
              <li><Link href="#" className="hover:text-white">{t("footer.privacy")}</Link></li>
              <li><Link href="#" className="hover:text-white">{t("footer.terms")}</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} UzEstate. {t("footer.rights")}.
        </div>
      </div>
    </footer>
  );
}
