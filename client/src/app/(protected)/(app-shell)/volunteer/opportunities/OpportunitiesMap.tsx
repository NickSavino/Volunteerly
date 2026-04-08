"use client";

import { useEffect, useRef } from "react";
import type { Opportunity } from "@volunteerly/shared";

async function geocodeAddress(address: string): Promise<[number, number] | null> {
    try {
        const parts = address.split(",").map((s) => s.trim());
        const street = parts[0] ?? "";
        const city = parts[1] ?? "Calgary";
        const postalCode = parts[parts.length - 1] ?? "";

        const params = new URLSearchParams({
            street,
            city,
            postalcode: postalCode,
            country: "Canada",
            format: "json",
            limit: "1",
        });

        const url = `https://nominatim.openstreetmap.org/search?${params}`;
        const res = await fetch(url, {
            headers: { "User-Agent": "Volunteerly/1.0 (volunteer matching app)" },
        });
        const data = await res.json();
        if (!data.length) return null;
        return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    } catch {
        return null;
    }
}

export default function OpportunitiesMap({ opportunities }: { opportunities: Opportunity[] }) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<import("leaflet").Map | null>(null);

    useEffect(() => {
        if (typeof window === "undefined" || mapInstance.current || !mapRef.current) return;

        import("leaflet").then(async (LeafletModule) => {
            if (!mapRef.current || mapInstance.current) return;

            const L = LeafletModule.default;

            delete (L.Icon.Default.prototype as any)._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
                iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
                shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
            });

            const map = L.map(mapRef.current).setView([51.0447, -114.0719], 11);

            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: "&copy; OpenStreetMap contributors",
            }).addTo(map);

            mapInstance.current = map;

            const geocodeCache = new Map<string, [number, number] | null>();

            for (const opp of opportunities) {
                const address = opp.organization?.hqAdr;
                if (!address) continue;

                let coords: [number, number] | null;

                if (geocodeCache.has(address)) {
                    coords = geocodeCache.get(address)!;
                } else {
                    coords = await geocodeAddress(address);
                    geocodeCache.set(address, coords);
                    await new Promise((r) => setTimeout(r, 1100));
                }

                if (!coords || !mapInstance.current) continue;

                const [lat, lng] = coords;
                const label = opp.organization?.orgName?.slice(0, 1).toUpperCase() ?? "O";

                const el = document.createElement("div");
                el.style.cssText = [
                    "display:flex",
                    "align-items:center",
                    "justify-content:center",
                    "width:32px",
                    "height:32px",
                    "border-radius:50%",
                    "border:2px solid white",
                    "background:#F4D125",
                    "font-size:12px",
                    "font-weight:700",
                    "color:#111827",
                    "box-shadow:0 2px 6px rgba(0,0,0,0.3)",
                    "cursor:pointer",
                ].join(";");
                el.textContent = label;
                el.title = opp.name;

                const icon = L.divIcon({
                    html: el.outerHTML,
                    className: "",
                    iconSize: [32, 32],
                    iconAnchor: [16, 16],
                    popupAnchor: [0, -18],
                });

                const marker = L.marker([lat, lng], { icon }).addTo(mapInstance.current);
                marker.bindPopup(`
                    <div style="padding:4px;min-width:140px">
                        <p style="font-weight:600;font-size:13px;margin:0;color:#111827">${opp.name}</p>
                        <p style="color:#6b7280;font-size:12px;margin:4px 0 0">${opp.organization?.orgName ?? ""}</p>
                        <p style="color:#9ca3af;font-size:11px;margin:4px 0 0">${address}</p>
                    </div>
                `);
            }
        });

        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
    }, []);

    return <div ref={mapRef} className="h-full w-full" />;
}
