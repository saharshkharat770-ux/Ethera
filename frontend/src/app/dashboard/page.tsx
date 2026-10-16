"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Zap,
  Car,
  Fuel,
  Compass,
  Navigation,
  Activity,
  DollarSign,
  Leaf,
  Plus,
  Clock,
  ArrowUpRight,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Sliders,
  RefreshCw,
  SlidersHorizontal,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid,
} from "recharts";
import { Navbar } from "@/components/Navbar";
import { CockpitGauge } from "@/components/CockpitGauge";
import { StationMap } from "@/components/StationMap";
import { FactorAttributionModal } from "@/components/FactorAttributionDrawer";
import { TripPlannerModal } from "@/components/TripPlannerModal";
import { GarageModal } from "@/components/GarageModal";
import {
  api,
  Vehicle,
  DashboardOverview,
  FALLBACK_VEHICLE,
  FALLBACK_STATIONS,
  FactorContribution,
  TripPlanResponse,
} from "@/lib/api";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([FALLBACK_VEHICLE]);
  const [activeVehicleId, setActiveVehicleId] = useState<number>(FALLBACK_VEHICLE.id);
  const [showFactorModal, setShowFactorModal] = useState(false);
  const [showTripModal, setShowTripModal] = useState(false);
  const [showGarageModal, setShowGarageModal] = useState(false);

  // Active prediction state (allows live interactive simulation updates)
  const [rangeMiles, setRangeMiles] = useState(378);
  const [predictedMpg, setPredictedMpg] = useState(14.8);
  const [ciLower, setCiLower] = useState(13.7);
  const [ciUpper, setCiUpper] = useState(15.9);
  const [factors, setFactors] = useState<FactorContribution[]>([
    {
      factor: "Highway Cruising Thermal Efficiency",
      impact_pct: 4.8,
      direction: "positive",
      description: "Consistent vehicle speed operates the engine inside optimum brake thermal efficiency.",
    },
    {
      factor: "Mild Ambient Temperature (72°F)",
      impact_pct: 2.1,
      direction: "positive",
      description: "Ambient air supports clean ethanol droplet vaporization without cold-start fuel enrichment.",
    },
    {
      factor: "Aerodynamic Drag Load",
      impact_pct: -6.4,
      direction: "negative",
      description: "Cruising speeds above 55 mph induce quadratic air resistance against truck frontal area.",
    },
    {
      factor: "Passenger & Tool Payload",
      impact_pct: -1.8,
      direction: "negative",
      description: "200 lbs of auxiliary load increases tire rolling resistance.",
    },
  ]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const overview = await api.getDashboard(activeVehicleId);
        setData(overview);
        setRangeMiles(Math.round(overview.current_range_miles));
        setPredictedMpg(overview.predicted_e85_mpg);
        if (overview.confidence_interval?.length >= 2) {
          setCiLower(overview.confidence_interval[0]);
          setCiUpper(overview.confidence_interval[1]);
        }
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [activeVehicleId]);

  // Handle simulation trigger from Factor Attribution Drawer
  const handleSimulateConditions = async (params: {
    speed: number;
    temp: number;
    payload: number;
    ac: boolean;
  }) => {
    try {
      const pred = await api.predict({
        vehicle_id: activeVehicleId,
        avg_speed_mph: params.speed,
        ambient_temp_f: params.temp,
        vehicle_load_lbs: params.payload,
        ac_active: params.ac,
      });

      setPredictedMpg(pred.predicted_mpg);
      setRangeMiles(Math.round(pred.estimated_range_miles));
      setCiLower(pred.confidence_lower_mpg);
      setCiUpper(pred.confidence_upper_mpg);
      if (pred.factors?.length) {
        setFactors(pred.factors);
      }
      setShowFactorModal(false);
    } catch (err) {
      console.error("Simulation failed:", err);
    }
  };

  const activeVehicle = vehicles.find((v) => v.id === activeVehicleId) || FALLBACK_VEHICLE;

  return (
    <div className="min-h-screen bg-[#080D16] text-[#F5F7FA]">
      <Navbar
        isDashboard={true}
        currentVehicleName={activeVehicle.nickname}
        onVehicleClick={() => setShowGarageModal(true)}
      />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Section A: Welcome & Context Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 rounded-2xl border border-[#1E293B] bg-gradient-to-r from-[#101827] via-[#151F30] to-[#101827] p-6 shadow-xl">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-[#10B981] animate-ping" />
              <span className="text-xs font-semibold uppercase tracking-wider text-[#B8F34A]">
                Real-Time Telemetry Stream Connected
              </span>
            </div>
            <h1 className="mt-1 text-2xl font-black text-white sm:text-3xl">
              Welcome Back, Alex.
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[#A6B1C2]">
              Active Profile: <strong className="text-white">{activeVehicle.nickname}</strong> ({activeVehicle.year} {activeVehicle.make} {activeVehicle.model} · {activeVehicle.engine_disp}L V8 FFV)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowTripModal(true)}
              className="flex items-center gap-2 rounded-xl bg-[#B8F34A] px-4 py-2.5 text-xs font-bold text-[#080D16] hover:bg-[#c4f866] transition-all shadow-md shadow-[#B8F34A]/10"
            >
              <Navigation className="h-4 w-4" />
              <span>Plan Trip with Range Buffer</span>
            </button>
            <button
              onClick={() => setShowFactorModal(true)}
              className="flex items-center gap-2 rounded-xl border border-[#1E293B] bg-[#080D16] px-4 py-2.5 text-xs font-semibold text-[#F5F7FA] hover:border-[#B8F34A]/40 transition-colors"
            >
              <SlidersHorizontal className="h-4 w-4 text-[#35D6C5]" />
              <span>Simulate Conditions</span>
            </button>
            <button
              onClick={() => setShowGarageModal(true)}
              className="flex items-center gap-2 rounded-xl border border-[#1E293B] bg-[#080D16] px-3.5 py-2.5 text-xs font-semibold text-[#A6B1C2] hover:text-white transition-colors"
            >
              <Car className="h-4 w-4" />
              <span>Garage</span>
            </button>
          </div>
        </div>

        {/* Section B & C: Primary Intelligence Cockpit + Economics Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Primary Intelligence Gauge (5 cols) */}
          <div className="lg:col-span-5">
            <CockpitGauge
              rangeMiles={rangeMiles}
              predictedMpg={predictedMpg}
              confidenceLower={ciLower}
              confidenceUpper={ciUpper}
              fuelPct={85}
              confidenceScore={0.94}
              modelVersion="ethera-v1.0-gbm"
              onFactorClick={() => setShowFactorModal(true)}
            />
          </div>

          {/* Economics Arbitrage & Key Indicators (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
            {/* Top Stat Trio */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Cost Per Mile Card */}
              <div className="rounded-2xl border border-[#1E293B] bg-[#101827] p-5">
                <div className="flex items-center justify-between text-xs text-[#A6B1C2]">
                  <span>Cost per Mile</span>
                  <span className="rounded bg-[#10B981]/10 px-1.5 py-0.5 text-[10px] font-bold text-[#10B981]">
                    -4.6% vs Gas
                  </span>
                </div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-2xl font-black text-[#B8F34A]">$0.165</span>
                  <span className="text-xs text-[#A6B1C2]">/ mi</span>
                </div>
                <p className="mt-1 text-[11px] text-[#A6B1C2]">Gasoline: $0.173 / mi</p>
              </div>

              {/* Break-Even Threshold Card */}
              <div className="rounded-2xl border border-[#1E293B] bg-[#101827] p-5">
                <div className="flex items-center justify-between text-xs text-[#A6B1C2]">
                  <span>Break-Even Price</span>
                  <span className="rounded bg-[#35D6C5]/10 px-1.5 py-0.5 text-[10px] font-bold text-[#35D6C5]">
                    Threshold
                  </span>
                </div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-2xl font-black text-white">$2.59</span>
                  <span className="text-xs text-[#A6B1C2]">/ gal</span>
                </div>
                <p className="mt-1 text-[11px] text-[#A6B1C2]">Current E85: $2.45 / gal</p>
              </div>

              {/* Net Annual Savings Card */}
              <div className="rounded-2xl border border-[#1E293B] bg-[#101827] p-5">
                <div className="flex items-center justify-between text-xs text-[#A6B1C2]">
                  <span>Annual Net Savings</span>
                  <span className="rounded bg-[#10B981]/10 px-1.5 py-0.5 text-[10px] font-bold text-[#10B981]">
                    Positive
                  </span>
                </div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-2xl font-black text-[#10B981]">+$120.00</span>
                  <span className="text-xs text-[#A6B1C2]">/ yr</span>
                </div>
                <p className="mt-1 text-[11px] text-[#A6B1C2]">Based on 15k miles</p>
              </div>
            </div>

            {/* Driving Insights Banner */}
            <div className="rounded-2xl border border-[#B8F34A]/20 bg-[#151F30]/60 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-[#B8F34A]" />
                  <h4 className="text-sm font-bold text-white">Live Intelligence Advisory</h4>
                </div>
                <span className="text-[11px] text-[#A6B1C2]">Updated 18s ago</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl bg-[#080D16] p-3 border border-[#1E293B]">
                  <p className="font-semibold text-white">Aerodynamic Cruising Sweet-Spot</p>
                  <p className="text-[#A6B1C2] mt-1 leading-relaxed text-[11px]">
                    Vehicle achieves peak thermal efficiency between 50-58 mph. Cruising at 72 mph introduces a -9.4% drag penalty.
                  </p>
                </div>
                <div className="rounded-xl bg-[#080D16] p-3 border border-[#1E293B]">
                  <p className="font-semibold text-white">Winter E70 Transition Stability</p>
                  <p className="text-[#A6B1C2] mt-1 leading-relaxed text-[11px]">
                    Regional distributors currently deliver ASTM Class 3 E70 winter blend. Energy density is +3.8% higher than pure E85.
                  </p>
                </div>
              </div>
            </div>

            {/* Environmental Metric Pill */}
            <div className="flex items-center justify-between rounded-xl bg-[#101827] px-4 py-3 border border-[#1E293B] text-xs">
              <div className="flex items-center gap-2 text-white">
                <Leaf className="h-4 w-4 text-[#35D6C5]" />
                <span>Life-Cycle Carbon Avoidance (Argonne GREET Model)</span>
              </div>
              <span className="font-bold text-[#35D6C5]">842 lbs CO2e / yr</span>
            </div>
          </div>
        </div>

        {/* Section D: Historical Fuel Economy Analytics Chart */}
        <div className="rounded-2xl border border-[#1E293B] bg-[#101827] p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#1E293B] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-[#B8F34A]" />
                <h3 className="text-base font-bold text-white">Observed Fuel Economy vs. AI Predictions</h3>
              </div>
              <p className="text-xs text-[#A6B1C2] mt-0.5">
                Comparison of actual tank-fill MPG, AI calibrated predictions, and theoretical gasoline baseline.
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-white">
                <span className="h-2.5 w-2.5 rounded-full bg-[#B8F34A]" />
                Observed E85 MPG
              </span>
              <span className="flex items-center gap-1.5 text-[#A6B1C2]">
                <span className="h-2.5 w-2.5 rounded-full bg-[#35D6C5]" />
                Predicted E85 MPG
              </span>
              <span className="flex items-center gap-1.5 text-[#A6B1C2]">
                <span className="h-2.5 w-2.5 rounded-full bg-slate-500" />
                Gas Baseline (20 MPG)
              </span>
            </div>
          </div>

          <div className="mt-6 h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data?.historical_chart_data || [
                  { period: "Week 1", actual_mpg: 14.8, predicted_mpg: 14.7, gas_baseline: 20, fuel_cost: 54.88, ethanol_pct: 85 },
                  { period: "Week 2", actual_mpg: 14.5, predicted_mpg: 14.6, gas_baseline: 20, fuel_cost: 57.52, ethanol_pct: 85 },
                  { period: "Week 3", actual_mpg: 15.2, predicted_mpg: 14.9, gas_baseline: 20, fuel_cost: 52.10, ethanol_pct: 80 },
                  { period: "Week 4", actual_mpg: 14.9, predicted_mpg: 14.8, gas_baseline: 20, fuel_cost: 55.40, ethanol_pct: 85 },
                  { period: "Week 5", actual_mpg: 14.2, predicted_mpg: 14.3, gas_baseline: 20, fuel_cost: 58.12, ethanol_pct: 70 },
                  { period: "Current", actual_mpg: 14.8, predicted_mpg: predictedMpg, gas_baseline: 20, fuel_cost: 53.90, ethanol_pct: 85 },
                ]}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#B8F34A" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#B8F34A" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorPred" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#35D6C5" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#35D6C5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="period" stroke="#A6B1C2" fontSize={11} tickLine={false} />
                <YAxis stroke="#A6B1C2" fontSize={11} domain={[10, 24]} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#080D16",
                    borderColor: "#1E293B",
                    borderRadius: "8px",
                    fontSize: "12px",
                    color: "#F5F7FA",
                  }}
                />
                <ReferenceLine y={20} stroke="#64748B" strokeDasharray="4 4" label={{ value: "EPA Gas (20)", fill: "#64748B", fontSize: 10, position: "insideTopRight" }} />
                <Area
                  type="monotone"
                  dataKey="actual_mpg"
                  stroke="#B8F34A"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorActual)"
                  name="Observed MPG"
                />
                <Area
                  type="monotone"
                  dataKey="predicted_mpg"
                  stroke="#35D6C5"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  fillOpacity={1}
                  fill="url(#colorPred)"
                  name="AI Predicted MPG"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Section E: Nearby Stations & Interactive Map */}
        <div id="stations">
          <StationMap stations={data?.nearby_stations || FALLBACK_STATIONS} />
        </div>

        {/* Section G: Recent Activity Feed */}
        <div className="rounded-2xl border border-[#1E293B] bg-[#101827] p-6">
          <h3 className="text-base font-bold text-white mb-4">Telemetry Activity Log</h3>
          <div className="divide-y divide-[#1E293B]">
            {(data?.recent_activity || []).map((item, i) => (
              <div key={i} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#151F30] text-[#B8F34A]">
                    {item.type === "prediction" ? <Compass className="h-4 w-4" /> : <Fuel className="h-4 w-4" />}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white">{item.title}</p>
                    <p className="text-xs text-[#A6B1C2]">{item.detail}</p>
                  </div>
                </div>
                <span className="text-xs text-[#A6B1C2]">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Modals & Dialogs */}
      <FactorAttributionModal
        isOpen={showFactorModal}
        onClose={() => setShowFactorModal(false)}
        factors={factors}
        onSimulate={handleSimulateConditions}
      />

      <TripPlannerModal
        isOpen={showTripModal}
        onClose={() => setShowTripModal(false)}
        onPlanTrip={async (params) => {
          return await api.planTrip({
            vehicle_id: activeVehicleId,
            origin_name: params.origin,
            origin_lat: 41.8781,
            origin_lng: -87.6298,
            dest_name: params.dest,
            dest_lat: 40.4842,
            dest_lng: -88.9937,
            current_fuel_pct: params.currentFuelPct,
            cargo_load_lbs: params.cargoLoadLbs,
          });
        }}
      />

      <GarageModal
        isOpen={showGarageModal}
        onClose={() => setShowGarageModal(false)}
        vehicles={vehicles}
        activeVehicleId={activeVehicleId}
        onSelectVehicle={(id) => {
          setActiveVehicleId(id);
          setShowGarageModal(false);
        }}
        onAddVehicle={(newV) => {
          const created: Vehicle = {
            ...newV,
            id: vehicles.length + 1,
            preferred_units: "imperial",
            preferred_currency: "USD",
          };
          setVehicles([...vehicles, created]);
          setActiveVehicleId(created.id);
        }}
      />
    </div>
  );
}
