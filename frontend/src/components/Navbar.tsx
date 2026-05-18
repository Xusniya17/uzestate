import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { useAuthStore } from "@/lib/auth";
import { authApi } from "@/lib/api";
import Cookies from "js-cookie";
import { Menu, X, Home, Calculator, Building2, Map, BarChart3, User, Heart, LogOut, Globe, Shield, Plus } from "lucide-react";

const LANGUAGES = [
  { code: "uz", label: "O'zbek", flag: "🇺🇿" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
  { code: "en", label: "English", flag: "🇬🇧" },
];

export default function Navbar() {
  const { t, i18n } = useTranslation("common");
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const handleLogout = async () => {
    const refreshToken = Cookies.get("refresh_token");
    if (refreshToken) {
      try { await authApi.logout(refreshToken); } catch {}
    }
    logout();
    router.push("/");
  };

  const handleLangChange = (lang: string) => {
    router.push(router.pathname, router.asPath, { locale: lang });
    setLangOpen(false);
  };

  const currentLang = LANGUAGES.find((l) => l.code === i18n.language) || LANGUAGES[0];

  const navLinks = [
    { href: "/", label: t("nav.home"), icon: Home },
    { href: "/estimate", label: t("nav.estimate"), icon: Calculator },
    { href: "/properties", label: t("nav.properties"), icon: Building2 },
    { href: "/map", label: t("nav.map"), icon: Map },
    { href: "/analytics", label: t("nav.analytics"), icon: BarChart3 },
  ];

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-800 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-primary-800">UzEstate</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  router.pathname === link.href
                    ? "bg-primary-50 text-primary-800"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 border border-gray-200"
              >
                <Globe className="w-4 h-4" />
                {currentLang.flag} {currentLang.code.toUpperCase()}
              </button>
              {langOpen && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg py-1 min-w-[140px]">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLangChange(lang.code)}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 ${
                        i18n.language === lang.code ? "text-primary-800 font-medium" : "text-gray-700"
                      }`}
                    >
                      {lang.flag} {lang.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {user ? (
              <div className="flex items-center gap-2">
                {/* E'lon berish */}
                <Link href="/properties/new"
                  className="flex items-center gap-1.5 px-3 py-2 bg-primary-800 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition">
                  <Plus className="w-4 h-4" /> E'lon berish
                </Link>
                <Link href="/profile/favorites" className="p-2 text-gray-500 hover:text-red-500 rounded-lg hover:bg-gray-50">
                  <Heart className="w-5 h-5" />
                </Link>
                {/* Admin panel */}
                {user.role === "admin" && (
                  <Link href="/admin" className="p-2 text-red-500 hover:bg-red-50 rounded-lg" title="Admin panel">
                    <Shield className="w-5 h-5" />
                  </Link>
                )}
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <div className="w-7 h-7 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-800 text-xs font-bold">
                      {user.first_name[0]}{user.last_name[0]}
                    </span>
                  </div>
                  {user.first_name}
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-500 hover:text-red-500 rounded-lg hover:bg-gray-50"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary-800">
                  {t("nav.login")}
                </Link>
                <Link href="/register" className="px-4 py-2 text-sm font-semibold bg-primary-800 text-white rounded-xl hover:bg-primary-700 transition-colors">
                  {t("nav.register")}
                </Link>
              </div>
            )}
          </div>

          <button className="md:hidden p-2 text-gray-600" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <link.icon className="w-5 h-5 text-gray-500" />
              {link.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-gray-100 flex gap-2">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLangChange(lang.code)}
                className={`flex-1 py-2 text-sm rounded-lg border ${
                  i18n.language === lang.code
                    ? "border-primary-800 text-primary-800 font-semibold"
                    : "border-gray-200 text-gray-600"
                }`}
              >
                {lang.flag} {lang.code.toUpperCase()}
              </button>
            ))}
          </div>
          {user ? (
            <button onClick={handleLogout} className="w-full text-left px-3 py-3 text-sm font-medium text-red-600 flex items-center gap-3">
              <LogOut className="w-5 h-5" /> {t("nav.logout")}
            </button>
          ) : (
            <div className="flex gap-2 pt-2">
              <Link href="/login" className="flex-1 text-center py-2.5 text-sm font-medium border border-gray-200 rounded-xl">
                {t("nav.login")}
              </Link>
              <Link href="/register" className="flex-1 text-center py-2.5 text-sm font-semibold bg-primary-800 text-white rounded-xl">
                {t("nav.register")}
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
