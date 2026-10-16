"use client";

import React, { useState } from "react";
import { X, Navigation, Fuel, AlertTriangle, CheckCircle2, ArrowRight, ShieldCheck, Clock, MapPin } from "lucide-react";
import { TripPlanResponse } from "@/lib/api";

interface TripPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlanTrip: (params: {
    origin: string;
    dest: string;
    currentFuelPct: number;
    cargoLoadLbs: number;
  }) => Promise<TripPlanResponse>;
}

export const TripPlannerModal: React.FC<TripPlannerModalProps> = ({
  isOpen,
  onClose,
  onPlanTrip,
}) => {
  const [origin, setOrigin] = useState("Downtown Chicago, IL");
  const [dest, setDest] = useState("Bloomington, IL");
  const [fuelPct, setFuelPct] = useState(35); // Default to low fuel to showcase safety buffer refuel stop!
  const [cargoLbs, setCargoLbs] = useState(250);
  const [loading, setLoading] = useState(false);
  const [planResult, setPlanResult] = useState<TripPlanResponse | null>(null);

  if (!isOpen) return null;

  const presetRoutes = [
    { origin: "Downtown Chicago, IL", dest: "Bloomington, IL", label: "Chicago → Bloomington (135 mi)" },
    { origin: "Downtown Chicago, IL", dest: "Joliet, IL", label: "Chicago → Joliet (45 mi)" },
    { origin: "Dallas, TX", dest: "Fort Worth, TX", label: "Dallas → Fort Worth (35 mi)" },
    { origin: "San Diego, CA", dest: "Los Angeles, CA", label: "San Diego → Los Angeles (125 mi)" },
  ];

  const handleExecutePlan = async () => {
    setLoading(true);
    try {
      const res = await onPlanTrip({
        origin,
        dest,
        currentFuelPct: fuelPct,
        cargoLoadLbs: cargoLbs,
      });
      setPlanResult(res);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-3xl rounded-2xl border border-[#1E293B] bg-[#101827] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1E293B] p-6 bg-[#151F30]/60">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#B8F34A]/10 text-[#B8F34A] border border-[#B8F34A]/30">
              <Navigation className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Smart Flex-Fuel Trip & Navigation Planner</h3>
              <p className="text-xs text-[#A6B1C2]">
                Route optimization with automated E85 range safety buffer and corridor refueling stops.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-[#A6B1C2] hover:bg-[#1E293B] hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 max-h-[78vh] overflow-y-auto space-y-6">
          {/* Quick Presets */}
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#A6B1C2]">
              Popular Flex-Fuel Corridors
            </span>
            <div className="mt-2 flex flex-wrap gap-2">
              {presetRoutes.map((r, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setOrigin(r.origin);
                    setDest(r.dest);
                  }}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium border transition-all ${
                    origin === r.origin && dest === r.dest
                      ? "bg-[#B8F34A]/15 border-[#B8F34A] text-[#B8F34A]"
                      : "bg-[#080D16] border-[#1E293B] text-[#A6B1C2] hover:text-white"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Form Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-[#A6B1C2]">Starting Origin</label>
              <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[#1E293B] bg-[#080D16] px-3.5 py-2.5 text-sm text-white focus:border-[#B8F34A] focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[#A6B1C2]">Destination</label>
              <input
                type="text"
                value={dest}
                onChange={(e) => setDest(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[#1E293B] bg-[#080D16] px-3.5 py-2.5 text-sm text-white focus:border-[#B8F34A] focus:outline-none"
              />
            </div>
          </div>

          {/* Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 rounded-xl bg-[#080D16] p-4 border border-[#1E293B]">
            <div>
              <div className="flex justify-between text-xs font-medium text-[#A6B1C2]">
                <span>Starting Fuel Tank Level</span>
                <span className="font-bold text-[#B8F34A]">{fuelPct}% Tank</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={fuelPct}
                onChange={(e) => setFuelPct(parseInt(e.target.value))}
                className="mt-2 w-full accent-[#B8F34A] cursor-pointer"
              />
              <p className="text-[11px] text-[#A6B1C2] mt-1">
                Simulate low starting fuel to test the automatic range safety buffer stop!
              </p>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-[#A6B1C2]">
                <span>Passenger & Cargo Payload</span>
                <span className="font-bold text-white">{cargoLbs} lbs</span>
              </div>
              <input
                type="range"
                min="100"
                max="1200"
                step="50"
                value={cargoLbs}
                onChange={(e) => setCargoLbs(parseInt(e.target.value))}
                className="mt-2 w-full accent-white cursor-pointer"
              />
              <p className="text-[11px] text-[#A6B1C2] mt-1">Impacts rolling resistance and grade penalties.</p>
            </div>
          </div>

          {/* Calculate Plan CTA */}
          <button
            onClick={handleExecutePlan}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#B8F34A] py-3 text-sm font-bold text-[#080D16] hover:bg-[#c4f866] transition-all disabled:opacity-50"
          >
            {loading ? (
              <span>Calculating Route Feasibility...</span>
            ) : (
              <>
                <Navigation className="h-4 w-4" />
                <span>Calculate Range & Safety Buffer</span>
              </>
            )}
          </button>

          {/* Plan Results View */}
          {planResult && (
            <div className="rounded-xl bg-[#151F30] p-5 border border-[#B8F34A]/30 space-y-5 animate-in fade-in">
              {/* Verdict Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#1E293B] pb-4">
                <div>
                  <h4 className="text-base font-bold text-white">Route Analysis & Buffer Assessment</h4>
                  <p className="text-xs text-[#A6B1C2]">
                    Total Route: <strong className="text-white">{planResult.total_distance_miles} miles</strong> · Est. Driving Time:{" "}
                    <strong className="text-white">{planResult.estimated_driving_time_minutes} mins</strong>
                  </p>
                </div>

                {planResult.refuel_recommended ? (
                  <span className="flex items-center gap-1.5 rounded-full bg-[#F59E0B]/15 px-3 py-1 text-xs font-bold text-[#F59E0B] border border-[#F59E0B]/30">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Corridor Refuel Required
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 rounded-full bg-[#10B981]/15 px-3 py-1 text-xs font-bold text-[#10B981] border border-[#10B981]/30">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Direct Route Feasible
                  </span>
                )}
              </div>

              {/* Range & Safety Buffer Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="rounded-lg bg-[#080D16] p-2.5 border border-[#1E293B]">
                  <p className="text-[10px] text-[#A6B1C2]">Starting Range</p>
                  <p className="text-base font-bold text-white">{planResult.starting_range_miles} mi</p>
                </div>
                <div className="rounded-lg bg-[#080D16] p-2.5 border border-[#1E293B]">
                  <p className="text-[10px] text-[#A6B1C2]">Trip Distance</p>
                  <p className="text-base font-bold text-[#B8F34A]">{planResult.total_distance_miles} mi</p>
                </div>
                <div className="rounded-lg bg-[#080D16] p-2.5 border border-[#1E293B]">
                  <p className="text-[10px] text-[#A6B1C2]">Safety Buffer</p>
                  <p className="text-base font-bold text-[#35D6C5]">+{planResult.safety_buffer_miles} mi</p>
                </div>
                <div className="rounded-lg bg-[#080D16] p-2.5 border border-[#1E293B]">
                  <p className="text-[10px] text-[#A6B1C2]">Est. Fuel Cost</p>
                  <p className="text-base font-bold text-[#10B981]">${planResult.estimated_cost_e85}</p>
                </div>
              </div>

              {/* Waypoints Timeline */}
              <div>
                <h5 className="text-xs font-semibold uppercase tracking-wider text-[#A6B1C2] mb-3">
                  Waypoint Execution Sequence
                </h5>
                <div className="space-y-3">
                  {planResult.recommended_stops.map((stop, idx) => (
                    <div
                      key={idx}
                      className={`flex items-start gap-3 rounded-xl p-3.5 border ${
                        stop.action === "refuel"
                          ? "bg-[#F59E0B]/10 border-[#F59E0B]/40"
                          : "bg-[#080D16] border-[#1E293B]"
                      }`}
                    >
                      <div
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          stop.action === "refuel"
                            ? "bg-[#F59E0B] text-[#080D16]"
                            : stop.action === "start"
                            ? "bg-[#B8F34A] text-[#080D16]"
                            : "bg-[#35D6C5] text-[#080D16]"
                        }`}
                      >
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-white">{stop.stop_name}</span>
                          <span className="text-xs text-[#A6B1C2]">Mile {stop.mile_marker}</span>
                        </div>
                        <p className="text-xs text-[#A6B1C2] mt-1">{stop.notes}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
