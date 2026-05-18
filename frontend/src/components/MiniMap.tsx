"use client";
import { useEffect, useRef } from "react";

interface Props { lat: number; lng: number; title: string; }

export default function MiniMap({ lat, lng, title }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !ref.current || mapRef.current) return;
    const L = require("leaflet");

    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });

    const map = L.map(ref.current, { center: [lat, lng], zoom: 15, zoomControl: true });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
    L.marker([lat, lng]).addTo(map).bindPopup(title).openPopup();
    mapRef.current = map;

    return () => { map.remove(); mapRef.current = null; };
  }, [lat, lng]);

  return <div ref={ref} style={{ height: "100%", width: "100%", borderRadius: 12 }} />;
}
