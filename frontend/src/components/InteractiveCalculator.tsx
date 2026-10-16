"use client";

import React, { useState, useMemo } from "react";
import { DollarSign, Fuel, Leaf, ArrowRight, CheckCircle2, AlertTriangle, Info } from "lucide-react";

export const InteractiveCalculator: React.FC = () => {
  const [e85Price, setE85Price] = useState<number>(2.45);
  const [gasPrice, setGasPrice] = useState<number>(3.45);
  const [annualMiles, setAnnualMiles] = useState<number>(15000);
  const [vehicleProfile, setVehicleProfile] = useState<"truck" | "sedan" | "suv">("truck");

  // Baseline ratings
  const vehicleProfiles = {
    truck: { name: "Full-Size V8 Truck (e.g. F-150 / Silverado)", e85Mpg: 14.8, gasMpg: 20.0 },
    sedan: { name: "Mid-Size V6 Sedan (e.g. Impala / Charger)", e85Mpg: 17.5, gasMpg: 24.0 },
    suv: { name: "Flex-Fuel SUV (e.g. Explorer / Tahoe)", e85Mpg: 16.0, gasMpg: 22.0 },
  };

  const currentProfile = vehicleProfiles[vehicleProfile];

  // Mathematical Calculations
  const stats = useMemo(() => {
    const e85Mpg = currentProfile.e85Mpg;
    const gasMpg = currentProfile.gasMpg;

    // Break even price: E85 must cost less than Gas_Price * (E85_MPG / Gas_MPG)
    const breakEven = Math.round(gasPrice * (e85Mpg / gasMpg) * 100) / 100;
    const isEconomical = e85Price < breakEven;

    const cpmE85 = e85Price / e85Mpg;
    const cpmGas = gasPrice / gasMpg;

    const annualGalE85 = annualMiles / e85Mpg;
    const annualGalGas = annualMiles / gasMpg;

    const annualCostE85 = Math.round(annualGalE85 * e85Price);
    const annualCostGas = Math.round(annualGalGas * gasPrice);
    const annualSavings = annualCostGas - annualCostE85;
    const savingsPct = Math.round(((cpmGas - cpmE85) / cpmGas) * 1000) / 10;

    // GREET Lifecycle CO2 reduction
    // Approx. 43% lower net lifecycle CO2e per energy equivalent unit
    const co2ReductionLbs = Math.max(0, Math.round((annualGalGas * 11.4 - annualGalE85 * 6.5) * 2.20462));

    return {
      breakEven,
      isEconomical,
      cpmE85: cpmE85.toFixed(3),
      cpmGas: cpmGas.toFixed(3),
      annualCostE85,
      annualCostGas,
      annualSavings,
      savingsPct,
      co2ReductionLbs,
    };
  }, [e85Price, gasPrice, annualMiles, currentProfile]);

  return (
    <div id="calculator" className="relative rounded-2xl border border-[#1E293B] bg-[#101827] p-6 sm:p-8 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#1E293B] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#B8F34A]/10 text-[#B8F34A]">
              <DollarSign className="h-4 w-4" />
            </span>
            <h3 className="text-xl font-bold text-white">Interactive Fuel Economics Engine</h3>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-[#A6B1C2]">
            Calculate real-world cost-per-mile arbitrage and net savings adjusted for ethanol energy density.
          </p>
        </div>

        {/* Vehicle Preset Selector */}
        <div className="flex items-center rounded-lg bg-[#080D16] p-1 border border-[#1E293B]">
          {(["truck", "sedan", "suv"] as const).map((key) => (
            <button
              key={key}
              onClick={() => setVehicleProfile(key)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-all ${
                vehicleProfile === key
                  ? "bg-[#151F30] text-[#B8F34A] border border-[#B8F34A]/30 shadow-sm"
                  : "text-[#A6B1C2] hover:text-white"
              }`}
            >
              {key}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6">
        {/* Sliders Control Panel (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* E85 Price Slider */}
          <div>
            <div className="flex justify-between items-center text-sm font-medium">
              <span className="text-[#A6B1C2] flex items-center gap-1.5">
                <Fuel className="h-4 w-4 text-[#B8F34A]" />
                E85 Pump Price ($/gal)
              </span>
              <span className="text-lg font-bold text-[#B8F34A]">${e85Price.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="1.80"
              max="4.50"
              step="0.05"
              value={e85Price}
              onChange={(e) => setE85Price(parseFloat(e.target.value))}
              className="mt-2 w-full accent-[#B8F34A] cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-[#A6B1C2] mt-1">
              <span>$1.80</span>
              <span>Regional Avg: $2.45</span>
              <span>$4.50</span>
            </div>
          </div>

          {/* Regular Gas Price Slider */}
          <div>
            <div className="flex justify-between items-center text-sm font-medium">
              <span className="text-[#A6B1C2] flex items-center gap-1.5">
                <Fuel className="h-4 w-4 text-[#35D6C5]" />
                Regular Unleaded Gas Price ($/gal)
              </span>
              <span className="text-lg font-bold text-[#35D6C5]">${gasPrice.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="2.50"
              max="5.50"
              step="0.05"
              value={gasPrice}
              onChange={(e) => setGasPrice(parseFloat(e.target.value))}
              className="mt-2 w-full accent-[#35D6C5] cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-[#A6B1C2] mt-1">
              <span>$2.50</span>
              <span>National Avg: $3.45</span>
              <span>$5.50</span>
            </div>
          </div>

          {/* Annual Mileage Slider */}
          <div>
            <div className="flex justify-between items-center text-sm font-medium">
              <span className="text-[#A6B1C2]">Annual Driving Distance</span>
              <span className="text-base font-bold text-white">{annualMiles.toLocaleString()} miles/yr</span>
            </div>
            <input
              type="range"
              min="5000"
              max="35000"
              step="1000"
              value={annualMiles}
              onChange={(e) => setAnnualMiles(parseInt(e.target.value))}
              className="mt-2 w-full accent-white cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-[#A6B1C2] mt-1">
              <span>5,000 mi</span>
              <span>US Driver Average: 15,000 mi</span>
              <span>35,000 mi</span>
            </div>
          </div>

          {/* Vehicle Baseline Specs Summary */}
          <div className="rounded-xl bg-[#080D16] p-4 border border-[#1E293B] text-xs text-[#A6B1C2]">
            <span className="font-semibold text-white">Active Vehicle Profile: </span>
            {currentProfile.name}
            <div className="mt-2 grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-[#151F30] p-2.5 border border-[#1E293B]">
                <p className="text-[11px] text-[#A6B1C2]">E85 Energy Rating</p>
                <p className="text-sm font-bold text-[#B8F34A]">{currentProfile.e85Mpg} MPG</p>
                <p className="text-[10px] text-[#A6B1C2]">(~74% volumetric density)</p>
              </div>
              <div className="rounded-lg bg-[#151F30] p-2.5 border border-[#1E293B]">
                <p className="text-[11px] text-[#A6B1C2]">Gasoline Baseline</p>
                <p className="text-sm font-bold text-[#35D6C5]">{currentProfile.gasMpg} MPG</p>
                <p className="text-[10px] text-[#A6B1C2]">(Standard 100% baseline)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Live Arbitrage & Results Card (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between rounded-xl bg-gradient-to-b from-[#151F30] to-[#080D16] p-6 border border-[#1E293B] relative overflow-hidden">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#A6B1C2]">
              Arbitrage Verdict
            </span>
            {stats.isEconomical ? (
              <span className="flex items-center gap-1.5 rounded-full bg-[#10B981]/15 px-3 py-1 text-xs font-bold text-[#10B981] border border-[#10B981]/30">
                <CheckCircle2 className="h-3.5 w-3.5" />
                E85 Economical
              </span>
            ) : (
              <span className="flex items-center gap-1.5 rounded-full bg-[#F59E0B]/15 px-3 py-1 text-xs font-bold text-[#F59E0B] border border-[#F59E0B]/30">
                <AlertTriangle className="h-3.5 w-3.5" />
                Gasoline Recommended
              </span>
            )}
          </div>

          {/* Break-even Display */}
          <div className="mt-4 rounded-lg bg-[#080D16]/80 p-3.5 border border-[#1E293B]">
            <p className="text-xs text-[#A6B1C2]">Break-Even E85 Price Threshold</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-extrabold text-white">${stats.breakEven.toFixed(2)}</span>
              <span className="text-xs text-[#A6B1C2]">/ gallon</span>
            </div>
            <p className="text-[11px] text-[#A6B1C2] mt-1">
              At ${gasPrice.toFixed(2)} gas, E85 must be below{" "}
              <strong className="text-[#B8F34A]">${stats.breakEven.toFixed(2)}</strong> to beat gasoline cost per mile.
            </p>
          </div>

          {/* Cost Per Mile Side-by-Side */}
          <div className="mt-4 grid grid-cols-2 gap-3 text-center">
            <div className="rounded-lg bg-[#151F30] p-3 border border-[#B8F34A]/20">
              <p className="text-[11px] text-[#A6B1C2]">E85 Cost / Mile</p>
              <p className="text-xl font-bold text-[#B8F34A] mt-0.5">${stats.cpmE85}</p>
              <p className="text-[10px] text-[#A6B1C2]">${(parseFloat(stats.cpmE85) * 100).toFixed(2)} / 100 mi</p>
            </div>
            <div className="rounded-lg bg-[#151F30] p-3 border border-[#1E293B]">
              <p className="text-[11px] text-[#A6B1C2]">Gas Cost / Mile</p>
              <p className="text-xl font-bold text-[#35D6C5] mt-0.5">${stats.cpmGas}</p>
              <p className="text-[10px] text-[#A6B1C2]">${(parseFloat(stats.cpmGas) * 100).toFixed(2)} / 100 mi</p>
            </div>
          </div>

          {/* Net Annual Savings Metric */}
          <div className="mt-4 pt-4 border-t border-[#1E293B]">
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-[#A6B1C2]">Annualized Net Impact:</span>
              <span
                className={`text-2xl font-black ${
                  stats.annualSavings >= 0 ? "text-[#B8F34A]" : "text-[#EF4444]"
                }`}
              >
                {stats.annualSavings >= 0 ? `+$${stats.annualSavings.toLocaleString()}` : `-$${Math.abs(stats.annualSavings).toLocaleString()}`}
                <span className="text-xs font-normal text-[#A6B1C2]"> / yr</span>
              </span>
            </div>

            {/* Lifecycle Emissions */}
            <div className="mt-3 flex items-center justify-between text-xs text-[#A6B1C2] bg-[#101827] px-3 py-2 rounded-lg border border-[#1E293B]">
              <span className="flex items-center gap-1.5 text-white">
                <Leaf className="h-3.5 w-3.5 text-[#35D6C5]" />
                Lifecycle CO2e Avoided:
              </span>
              <span className="font-semibold text-[#35D6C5]">
                {stats.co2ReductionLbs.toLocaleString()} lbs/yr
              </span>
            </div>
          </div>

          {/* Disclaimer link */}
          <div className="mt-4 flex items-center gap-1 text-[10px] text-[#A6B1C2]">
            <Info className="h-3.5 w-3.5 shrink-0" />
            <span>Estimates grounded in EPA flex-fuel test cycles and GREET lifecycle model.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
