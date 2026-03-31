"use client";

import { useEffect, useRef } from "react";
import type { Opportunity } from "@volunteerly/shared";
import "leaflet/dist/leaflet.css";

export default function OpportunitiesMap({ opportunities }: { opportunities: Opportunity[] }) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<import("leaflet").Map | null>(null);

    useEffect(() => {
        if (typeof window === "undefined" || mapInstance.current || !mapRef.current) return;

        import("leaflet").then((LeafletModule) => {
            if (!mapRef.current || mapInstance.current) return;

            const L = LeafletModule.default;

            delete (L.Icon.Default.prototype as any)._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
                iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
                shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
            });

            const map = L.map(mapRef.current).setView([51.0447, -114.0719], 10);

            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: "&copy; OpenStreetMap contributors",
            }).addTo(map);

            mapInstance.current = map;

            opportunities.forEach((opp) => {
                const lat = (opp as any).latitude  ?? (51.0447  + (Math.random() - 0.5) * 0.08);
                const lng = (opp as any).longitude ?? (-114.0719 + (Math.random() - 0.5) * 0.08);

                const el = document.createElement("div");
                el.className =
                    "flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-yellow-400 text-xs font-bold text-black shadow-md";
                el.textContent = opp.organization?.orgName?.slice(0, 1) ?? "O";
                el.title = opp.name;

                const icon = L.divIcon({
                    html: el.outerHTML,
                    className: "",
                    iconSize: [32, 32],
                });

                const marker = L.marker([lat, lng], { icon }).addTo(map);
                marker.bindPopup(`
                    <div style="padding:4px">
                        <p style="font-weight:600;font-size:13px;margin:0">${opp.name}</p>
                        <p style="color:#6b7280;font-size:12px;margin:2px 0 0">${opp.organization?.orgName ?? ""}</p>
                        <p style="color:#9ca3af;font-size:11px;margin:4px 0 0">${(opp.organization as any)?.hqAdr ?? ""}</p>
                    </div>
                `);
            });
        });

        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
        
    }, []);


    useEffect(() => {
        if (!mapInstance.current) return;

    }, [opportunities]);

    return <div ref={mapRef} className="h-full w-full" />;
}
