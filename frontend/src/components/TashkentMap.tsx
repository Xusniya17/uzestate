"use client";
import { useEffect, useRef, useState } from "react";

interface District {
  id: number;
  name_uz: string;
  name_ru: string;
  name_en: string;
  code: string;
  center_lat: number;
  center_lng: number;
  avg_price_per_sqm: number;
}

interface Props {
  districts: District[];
  districtStats: any[];
  onSelect: (d: any) => void;
}

function getColor(ratio: number): string {
  if (ratio > 0.85) return "#1e40af";
  if (ratio > 0.7) return "#2563eb";
  if (ratio > 0.55) return "#3b82f6";
  if (ratio > 0.4) return "#60a5fa";
  return "#93c5fd";
}

export default function TashkentMap({ districts, districtStats, onSelect }: Props) {
  const mapRef = useRef<any>(null);
  const mapInstanceRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const [locating, setLocating] = useState(false);
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);

  const maxPrice = Math.max(...districtStats.map((d) => d.avg_price_per_sqm || 0), 1);

  const enriched = districts.map((d) => {
    const stats = districtStats.find((s) => s.code === d.code) || {};
    return { ...d, ...stats };
  });

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;
    if (mapInstanceRef.current) return;

    const L = require("leaflet");
    require("leaflet/dist/leaflet.css");

    // Leaflet default icon fix
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });

    const map = L.map(mapRef.current, {
      center: [41.2995, 69.2401],
      zoom: 11,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || enriched.length === 0) return;
    const L = require("leaflet");
    const map = mapInstanceRef.current;

    enriched.forEach((d) => {
      if (!d.center_lat || !d.center_lng) return;
      const price = d.avg_price_per_sqm || 0;
      const ratio = price / maxPrice;
      const radius = 18 + ratio * 24;
      const color = getColor(ratio);

      const circle = L.circleMarker([d.center_lat, d.center_lng], {
        radius,
        fillColor: color,
        color: "white",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.78,
      }).addTo(map);

      const tooltip = L.divIcon({
        className: "",
        html: `<div style="background:${color};color:white;font-weight:700;font-size:11px;padding:3px 6px;border-radius:6px;white-space:nowrap;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)">$${price ? Math.round(price).toLocaleString() : "—"}</div>`,
        iconAnchor: [20, 10],
      });

      L.marker([d.center_lat, d.center_lng], { icon: tooltip, interactive: false }).addTo(map);

      circle.bindPopup(`
        <div style="font-family:sans-serif;min-width:160px">
          <b style="font-size:14px">${d.name_uz}</b><br/>
          <span style="color:#6b7280;font-size:12px">1 m² narxi</span><br/>
          <b style="font-size:18px;color:#1e40af">$${price ? Math.round(price).toLocaleString() : "—"}</b><br/>
          <span style="color:#6b7280;font-size:12px">E'lonlar: ${d.listings_count || 0}</span>
        </div>
      `);

      circle.on("click", () => onSelect(d));
    });
  }, [enriched.length]);

  const locateUser = () => {
    if (!mapInstanceRef.current) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const L = require("leaflet");
        const map = mapInstanceRef.current;

        if (userMarkerRef.current) userMarkerRef.current.remove();

        const pulsingIcon = L.divIcon({
          className: "",
          html: `<div style="position:relative;width:20px;height:20px">
            <div style="position:absolute;width:20px;height:20px;background:#3b82f6;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(59,130,246,0.5)"></div>
            <div style="position:absolute;width:40px;height:40px;background:rgba(59,130,246,0.25);border-radius:50%;top:-10px;left:-10px;animation:pulse 2s infinite"></div>
          </div>
          <style>@keyframes pulse{0%{transform:scale(1);opacity:1}100%{transform:scale(2);opacity:0}}</style>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });

        const marker = L.marker([latitude, longitude], { icon: pulsingIcon })
          .addTo(map)
          .bindPopup("<b>📍 Siz shu yerdasiz</b>")
          .openPopup();

        L.circle([latitude, longitude], { radius: 300, color: "#3b82f6", fillColor: "#3b82f6", fillOpacity: 0.1, weight: 1 }).addTo(map);

        userMarkerRef.current = marker;
        map.flyTo([latitude, longitude], 14, { duration: 1.5 });
        setUserPos({ lat: latitude, lng: longitude });
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        const msgs: Record<number, string> = {
          1: "❌ Ruxsat berilmadi!\n\nChrome da: manzil satri yonidagi 🔒 → Joylashuv → Ruxsat berish",
          2: "❌ Joylashuvni aniqlab bo'lmadi. Internetni tekshiring.",
          3: "❌ Vaqt tugadi. Qayta urinib ko'ring.",
        };
        alert(msgs[err.code] || "Joylashuvni aniqlab bo'lmadi");
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <div style={{ position: "relative", height: "100%", width: "100%" }}>
      <div ref={mapRef} style={{ height: "100%", width: "100%", borderRadius: "16px", zIndex: 1 }} />

      {/* Joylashuv tugmasi */}
      <button
        onClick={locateUser}
        disabled={locating}
        title="Mening joylashuvim"
        style={{
          position: "absolute", bottom: 24, right: 12, zIndex: 999,
          background: "white", border: "2px solid #e5e7eb",
          borderRadius: 12, width: 44, height: 44,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 2px 8px rgba(0,0,0,0.12)", cursor: "pointer",
          fontSize: 20,
        }}
      >
        {locating ? "⏳" : userPos ? "🔵" : "📍"}
      </button>

      {userPos && (
        <div style={{
          position: "absolute", bottom: 74, right: 12, zIndex: 999,
          background: "white", border: "1px solid #e5e7eb",
          borderRadius: 10, padding: "6px 10px", fontSize: 11, color: "#374151",
          boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
        }}>
          📍 {userPos.lat.toFixed(4)}, {userPos.lng.toFixed(4)}
        </div>
      )}
    </div>
  );
}
