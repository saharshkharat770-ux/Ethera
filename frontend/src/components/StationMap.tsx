"use client";

import React, { useEffect, useRef, useState } from "react";
import { Station } from "@/lib/api";
import { MapPin, Navigation, Star, Fuel, CheckCircle, ExternalLink, List, Map } from "lucide-react";

interface StationMapProps {
  stations: Station[];
  center?: [number, number];
  zoom?: number;
  onSelectStation?: (station: Station) => void;
}

export const StationMap: React.FC<StationMapProps> = ({
  stations,
  center = [41.85, -87.7444],
  zoom = 9,
  onSelectStation,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [selectedStation, setSelectedStation] = useState<Station | null>(stations[0] || null);
  const [viewMode, setViewMode] = useState<"map" | "list">("map");

  useEffect(() => {
    // Only execute on browser client
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    let isMounted = true;

    async function initMap() {
      const L = (await import("leaflet")).default;

      if (!isMounted) return;

      // Clean up existing map instance if any
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      if (!mapContainerRef.current) return;

      // Create Leaflet Map
      const map = L.map(mapContainerRef.current, {
        center: center,
        zoom: zoom,
        zoomControl: true,
      });

      // Dark Mode Tile Layer (CartoDB Dark Matter)
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 19,
      }).addTo(map);

      // Custom Neon Electric Lime Icon
      const customIcon = L.divIcon({
        className: "custom-leaflet-marker",
        html: `
          <div style="
            background: #B8F34A;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2px solid #080D16;
            box-shadow: 0 0 14px rgba(184, 243, 74, 0.8);
            cursor: pointer;
          ">
            <span style="font-weight: 900; font-size: 11px; color: #080D16;">E85</span>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      // Add markers
      stations.forEach((st) => {
        const marker = L.marker([st.latitude, st.longitude], { icon: customIcon }).addTo(map);
        marker.on("click", () => {
          setSelectedStation(st);
          if (onSelectStation) onSelectStation(st);
        });
      });

      mapInstanceRef.current = map;
    }

    if (viewMode === "map") {
      initMap();
    }

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [stations, center, zoom, viewMode, onSelectStation]);

  return (
    <div className="rounded-2xl border border-[#1E293B] bg-[#101827] overflow-hidden shadow-2xl">
      {/* Map Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#1E293B] p-4 sm:px-6">
        <div className="flex items-center gap-2">
          <Navigation className="h-5 w-5 text-[#B8F34A]" />
          <h4 className="text-base font-bold text-white">Verified E85 Refueling Network</h4>
          <span className="rounded-full bg-[#151F30] px-2 py-0.5 text-xs text-[#A6B1C2] border border-[#1E293B]">
            {stations.length} Active Stations
          </span>
        </div>

        {/* View Toggle */}
        <div className="flex items-center rounded-lg bg-[#080D16] p-1 border border-[#1E293B]">
          <button
            onClick={() => setViewMode("map")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-all ${
              viewMode === "map"
                ? "bg-[#151F30] text-[#B8F34A] border border-[#B8F34A]/30"
                : "text-[#A6B1C2] hover:text-white"
            }`}
          >
            <Map className="h-3.5 w-3.5" />
            <span>Map View</span>
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-all ${
              viewMode === "list"
                ? "bg-[#151F30] text-[#B8F34A] border border-[#B8F34A]/30"
                : "text-[#A6B1C2] hover:text-white"
            }`}
          >
            <List className="h-3.5 w-3.5" />
            <span>List View</span>
          </button>
        </div>
      </div>

      {viewMode === "map" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[460px]">
          {/* Map canvas (8 cols) */}
          <div className="lg:col-span-8 relative h-[360px] lg:h-[480px] w-full bg-[#080D16]">
            <div ref={mapContainerRef} className="h-full w-full" />
            <div className="absolute bottom-3 left-3 z-[400] rounded-lg bg-[#080D16]/90 px-3 py-1.5 text-[11px] text-[#A6B1C2] border border-[#1E293B] backdrop-blur-sm">
              <span className="inline-block h-2 w-2 rounded-full bg-[#B8F34A] mr-1.5 shadow-[0_0_8px_#B8F34A]" />
              Verified E85 Dispensers
            </div>
          </div>

          {/* Station Details Card Panel (4 cols) */}
          <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-[#1E293B] bg-[#151F30]/50 p-5 flex flex-col justify-between">
            {selectedStation ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="rounded-full bg-[#B8F34A]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#B8F34A] border border-[#B8F34A]/20">
                      {selectedStation.brand}
                    </span>
                    <h5 className="mt-2 text-base font-bold text-white">{selectedStation.name}</h5>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-[#A6B1C2]">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-[#A6B1C2]" />
                      {selectedStation.address}, {selectedStation.city}, {selectedStation.state}
                    </p>
                  </div>
                  {selectedStation.distance_miles !== undefined && (
                    <div className="text-right">
                      <span className="text-sm font-bold text-white">{selectedStation.distance_miles} mi</span>
                      <p className="text-[10px] text-[#A6B1C2]">distance</p>
                    </div>
                  )}
                </div>

                {/* Price Display */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="rounded-xl bg-[#080D16] p-3 border border-[#B8F34A]/30">
                    <p className="text-[11px] text-[#A6B1C2]">E85 Price</p>
                    <p className="text-xl font-black text-[#B8F34A]">${selectedStation.e85_price.toFixed(2)}</p>
                    <p className="text-[10px] text-[#10B981] flex items-center gap-1 mt-0.5">
                      <CheckCircle className="h-3 w-3" />
                      Verified
                    </p>
                  </div>
                  <div className="rounded-xl bg-[#080D16] p-3 border border-[#1E293B]">
                    <p className="text-[11px] text-[#A6B1C2]">Regular Gas</p>
                    <p className="text-xl font-bold text-[#F5F7FA]">${selectedStation.gas_price.toFixed(2)}</p>
                    <p className="text-[10px] text-[#A6B1C2] mt-0.5">
                      Discount: {Math.round(((selectedStation.gas_price - selectedStation.e85_price) / selectedStation.gas_price) * 100)}%
                    </p>
                  </div>
                </div>

                {/* Amenities */}
                <div>
                  <p className="text-xs font-medium text-[#A6B1C2] mb-1.5">Amenities & Features</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedStation.amenities.map((amenity, i) => (
                      <span
                        key={i}
                        className="rounded-md bg-[#101827] px-2 py-1 text-[10px] text-[#A6B1C2] border border-[#1E293B]"
                      >
                        {amenity.replace(/_/g, " ")}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1.5 text-xs text-[#A6B1C2]">
                  <Star className="h-4 w-4 fill-[#F59E0B] text-[#F59E0B]" />
                  <span className="font-semibold text-white">{selectedStation.rating}</span>
                  <span>(Community verified)</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-[#A6B1C2]">Select a station pin on the map to view live pricing.</p>
            )}

            {/* Navigation Button */}
            {selectedStation && (
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${selectedStation.latitude},${selectedStation.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#B8F34A] py-2.5 text-xs font-bold text-[#080D16] hover:bg-[#c4f866] transition-all"
              >
                <Navigation className="h-3.5 w-3.5" />
                <span>Navigate to Station</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
      ) : (
        /* Tabular List View */
        <div className="divide-y divide-[#1E293B] max-h-[480px] overflow-y-auto">
          {stations.map((st) => (
            <div
              key={st.id}
              onClick={() => {
                setSelectedStation(st);
                if (onSelectStation) onSelectStation(st);
              }}
              className="flex items-center justify-between p-4 hover:bg-[#151F30]/60 transition-colors cursor-pointer"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">{st.name}</span>
                  <span className="rounded bg-[#B8F34A]/10 px-1.5 py-0.5 text-[10px] text-[#B8F34A] border border-[#B8F34A]/20">
                    {st.brand}
                  </span>
                </div>
                <p className="text-xs text-[#A6B1C2] mt-0.5">
                  {st.address}, {st.city}, {st.state}
                </p>
                <div className="mt-1 flex items-center gap-2 text-[11px] text-[#A6B1C2]">
                  <span className="flex items-center gap-1 text-[#F59E0B]">
                    <Star className="h-3 w-3 fill-[#F59E0B]" />
                    {st.rating}
                  </span>
                  <span>·</span>
                  <span>{st.amenities.slice(0, 2).map((a) => a.replace(/_/g, " ")).join(", ")}</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-base font-extrabold text-[#B8F34A]">${st.e85_price.toFixed(2)}</span>
                <p className="text-[10px] text-[#A6B1C2]">E85 / gal</p>
                {st.distance_miles !== undefined && (
                  <p className="text-xs text-white font-medium mt-1">{st.distance_miles} mi away</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
