import { ReactNode, useEffect } from "react";
import Head from "next/head";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useAuthStore } from "@/lib/auth";
import { userApi } from "@/lib/api";
import { getAccessToken } from "@/lib/auth";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface LayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

export default function Layout({ children, title, description }: LayoutProps) {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    // Backend ni uyg'otish (Render free plan uxlaydi)
    const API = process.env.NEXT_PUBLIC_API_URL?.replace("/v1", "") || "http://localhost:8000";
    fetch(`${API}/ping`).catch(() => {});

    const token = getAccessToken();
    if (token) {
      userApi
        .getMe()
        .then((res) => setUser(res.data))
        .catch(() => setUser(null))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <>
      <Head>
        <title>{title ? `${title} — UzEstate` : "UzEstate — Ko'chmas mulk narxini baholash"}</title>
        <meta name="description" content={description || "Toshkent shahridagi ko'chmas mulk narxini AI yordamida baholang"} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
      <ToastContainer position="top-right" autoClose={4000} hideProgressBar={false} />
    </>
  );
}
