"use client";

import React, { useState } from "react";
import { X, TrendingUp, TrendingDown, Minus, Sliders, RefreshCw, Zap } from "lucide-react";
import { FactorContribution } from "@/lib/api";

interface FactorAttributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  factors: FactorContribution[];
  currentSpeed?: number;
  currentTemp?: number;
  currentPayload?: number;
  onSimulate?: (params: { speed: number; temp: number; payload: number; ac: boolean }) => void;
}

export const FactorAttributionModal: React.FC<FactorAttributionModalProps> = ({
  isOpen,
  onClose,
  factors,
  currentSpeed = 55,
  currentTemp = 70,
  currentPayload = 200,
  onSimulate,
}) => {
  const [speed, setSpeed] = useState(currentSpeed);
  const [temp, setTemp] = useState(currentTemp);
  const [payload, setPayload] = useState(currentPayload);
  const [acActive, setAcActive] = useState(false);

  if (!isOpen) return null;

  const handleApplySimulation = () => {
    if (onSimulate) {
      onSimulate({ speed, temp, payload, ac: acActive });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl border border-[#1E293B] bg-[#101827] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1E293B] p-6 bg-[#151F30]/50">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#B8F34A]/10 text-[#B8F34A]">
              <Zap className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">AI Factor Attribution & Physics Telemetry</h3>
              <p className="text-xs text-[#A6B1C2]">
                Transparent breakdown of variables influencing current E85 fuel economy.
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

        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          {/* Active Attribution Cards */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#A6B1C2] mb-3">
              Active Driving Dynamics & Environmental Factors
            </h4>
            <div className="space-y-2.5">
              {factors.map((f, idx) => (
                <div
                  key={idx}
                  className="flex items-start justify-between rounded-xl bg-[#080D16] p-3.5 border border-[#1E293B]"
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        f.direction === "positive"
                          ? "bg-[#10B981]/15 text-[#10B981]"
                          : f.direction === "negative"
                          ? "bg-[#EF4444]/15 text-[#EF4444]"
                          : "bg-[#1E293B] text-[#A6B1C2]"
                      }`}
                    >
                      {f.direction === "positive" ? (
                        <TrendingUp className="h-3.5 w-3.5" />
                      ) : f.direction === "negative" ? (
                        <TrendingDown className="h-3.5 w-3.5" />
                      ) : (
                        <Minus className="h-3.5 w-3.5" />
                      )}
                    </span>
                    <div>
                      <span className="font-semibold text-white text-sm">{f.factor}</span>
                      <p className="text-xs text-[#A6B1C2] mt-0.5 leading-relaxed">{f.description}</p>
                    </div>
                  </div>

                  <span
                    className={`ml-4 shrink-0 font-bold text-sm ${
                      f.direction === "positive"
                        ? "text-[#10B981]"
                        : f.direction === "negative"
                        ? "text-[#EF4444]"
                        : "text-[#A6B1C2]"
                    }`}
                  >
                    {f.impact_pct > 0 ? `+${f.impact_pct}%` : `${f.impact_pct}%`}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Scenario Simulator */}
          <div className="rounded-xl bg-[#151F30] p-5 border border-[#B8F34A]/20 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="h-4 w-4 text-[#B8F34A]" />
                <h4 className="text-sm font-bold text-white">Interactive Condition Simulator</h4>
              </div>
              <span className="text-[11px] text-[#A6B1C2]">Test hypothetical trips</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Speed Slider */}
              <div>
                <div className="flex justify-between text-xs text-[#A6B1C2]">
                  <span>Cruising Speed</span>
                  <span className="font-bold text-white">{speed} mph</span>
                </div>
                <input
                  type="range"
                  min="25"
                  max="85"
                  value={speed}
                  onChange={(e) => setSpeed(parseInt(e.target.value))}
                  className="mt-1.5 w-full accent-[#B8F34A] cursor-pointer"
                />
              </div>

              {/* Ambient Temp Slider */}
              <div>
                <div className="flex justify-between text-xs text-[#A6B1C2]">
                  <span>Ambient Temperature</span>
                  <span className="font-bold text-white">{temp}°F</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="110"
                  value={temp}
                  onChange={(e) => setTemp(parseInt(e.target.value))}
                  className="mt-1.5 w-full accent-[#35D6C5] cursor-pointer"
                />
              </div>

              {/* Payload Weight */}
              <div>
                <div className="flex justify-between text-xs text-[#A6B1C2]">
                  <span>Cargo & Passenger Load</span>
                  <span className="font-bold text-white">{payload} lbs</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1500"
                  step="50"
                  value={payload}
                  onChange={(e) => setPayload(parseInt(e.target.value))}
                  className="mt-1.5 w-full accent-white cursor-pointer"
                />
              </div>

              {/* AC Toggle */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#080D16] border border-[#1E293B]">
                <span className="text-xs text-[#A6B1C2]">Air Conditioning</span>
                <button
                  type="button"
                  onClick={() => setAcActive(!acActive)}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                    acActive ? "bg-[#35D6C5] text-[#080D16]" : "bg-[#151F30] text-[#A6B1C2]"
                  }`}
                >
                  {acActive ? "ACTIVE (ON)" : "OFF"}
                </button>
              </div>
            </div>

            <button
              onClick={handleApplySimulation}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#B8F34A] py-2.5 text-xs font-bold text-[#080D16] hover:bg-[#c4f866] transition-all"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Re-Calculate Range with Selected Parameters</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
