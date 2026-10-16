"use client";

import React from "react";
import { Zap, Fuel, Activity, ShieldCheck } from "lucide-react";

interface CockpitGaugeProps {
  rangeMiles: number;
  predictedMpg: number;
  confidenceLower: number;
  confidenceUpper: number;
  fuelPct?: number;
  confidenceScore?: number;
  modelVersion?: string;
  onFactorClick?: () => void;
}

export const CockpitGauge: React.FC<CockpitGaugeProps> = ({
  rangeMiles,
  predictedMpg,
  confidenceLower,
  confidenceUpper,
  fuelPct = 85,
  confidenceScore = 0.94,
  modelVersion = "ethera-v1.0-gbm",
  onFactorClick,
}) => {
  // SVG circular arc progress math
  const radius = 95;
  const circumference = 2 * Math.PI * radius;
  // Use 75% arc (270 deg)
  const arcLength = circumference * 0.75;
  const strokeDashoffset = arcLength - (arcLength * Math.min(100, Math.max(0, fuelPct))) / 100;

  return (
    <div className="relative flex flex-col items-center justify-between rounded-2xl border border-[#1E293B] bg-gradient-to-b from-[#151F30] to-[#080D16] p-6 shadow-2xl">
      {/* Top Header */}
      <div className="flex w-full items-center justify-between text-xs text-[#A6B1C2]">
        <div className="flex items-center gap-1.5">
          <Activity className="h-4 w-4 text-[#B8F34A]" />
          <span className="font-semibold uppercase tracking-wider text-white">Dynamic Range HUD</span>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-[#101827] px-2.5 py-1 text-[11px] border border-[#1E293B]">
          <ShieldCheck className="h-3 w-3 text-[#35D6C5]" />
          <span className="text-[#35D6C5]">90% Calibrated CI</span>
        </div>
      </div>

      {/* Futuristic Gauge Dial */}
      <div className="relative my-4 flex items-center justify-center">
        <svg className="h-56 w-56 -rotate-135 transform" viewBox="0 0 220 220">
          {/* Background Track */}
          <circle
            cx="110"
            cy="110"
            r={radius}
            stroke="#101827"
            strokeWidth="14"
            fill="transparent"
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
          />
          {/* Active Glowing Arc */}
          <circle
            cx="110"
            cy="110"
            r={radius}
            stroke="url(#limeGradient)"
            strokeWidth="14"
            fill="transparent"
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
          <defs>
            <linearGradient id="limeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#35D6C5" />
              <stop offset="100%" stopColor="#B8F34A" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center Digital Display */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-xs uppercase tracking-widest text-[#A6B1C2]">Estimated Range</span>
          <div className="flex items-baseline gap-1 my-0.5">
            <span className="text-4xl sm:text-5xl font-black tracking-tight text-white">{rangeMiles}</span>
            <span className="text-sm font-semibold text-[#B8F34A]">MI</span>
          </div>
          <div className="rounded-full bg-[#080D16]/90 px-3 py-0.5 text-xs font-semibold text-[#A6B1C2] border border-[#1E293B]">
            Fuel: <strong className="text-white">{fuelPct}%</strong>
          </div>
        </div>
      </div>

      {/* Sub-Metrics Row */}
      <div className="grid w-full grid-cols-2 gap-3 pt-2 border-t border-[#1E293B]">
        {/* Predicted MPG Card */}
        <div className="rounded-xl bg-[#080D16] p-3 border border-[#1E293B] text-center">
          <span className="text-[11px] text-[#A6B1C2]">Predicted E85 Economy</span>
          <div className="flex items-baseline justify-center gap-1 mt-0.5">
            <span className="text-xl font-extrabold text-[#B8F34A]">{predictedMpg}</span>
            <span className="text-xs text-[#A6B1C2]">MPG</span>
          </div>
          <p className="text-[10px] text-[#A6B1C2] mt-0.5">
            CI: [{confidenceLower} - {confidenceUpper}]
          </p>
        </div>

        {/* AI Confidence Card */}
        <div className="rounded-xl bg-[#080D16] p-3 border border-[#1E293B] text-center">
          <span className="text-[11px] text-[#A6B1C2]">Model Confidence</span>
          <div className="flex items-baseline justify-center gap-1 mt-0.5">
            <span className="text-xl font-extrabold text-[#35D6C5]">
              {Math.round(confidenceScore * 100)}%
            </span>
            <span className="text-xs text-[#A6B1C2]">score</span>
          </div>
          <p className="text-[10px] text-[#A6B1C2] mt-0.5">{modelVersion}</p>
        </div>
      </div>

      {/* Attribution Drawer Trigger */}
      {onFactorClick && (
        <button
          onClick={onFactorClick}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-[#151F30] py-2 text-xs font-medium text-[#A6B1C2] hover:text-[#B8F34A] hover:bg-[#1E293B] transition-colors"
        >
          <Zap className="h-3.5 w-3.5 text-[#B8F34A]" />
          <span>Inspect AI Factor Attributions</span>
        </button>
      )}
    </div>
  );
};
