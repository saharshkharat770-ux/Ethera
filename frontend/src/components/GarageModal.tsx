"use client";

import React, { useState } from "react";
import { X, Car, Plus, Check, Fuel, ShieldCheck, Calendar, Gauge } from "lucide-react";
import { Vehicle } from "@/lib/api";

interface GarageModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicles: Vehicle[];
  activeVehicleId: number;
  onSelectVehicle: (id: number) => void;
  onAddVehicle?: (vehicle: any) => void;
}

export const GarageModal: React.FC<GarageModalProps> = ({
  isOpen,
  onClose,
  vehicles,
  activeVehicleId,
  onSelectVehicle,
  onAddVehicle,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [nickname, setNickname] = useState("");
  const [make, setMake] = useState("Ford");
  const [model, setModel] = useState("F-150 Flex-Fuel");
  const [year, setYear] = useState(2022);
  const [disp, setDisp] = useState(5.0);
  const [tankCap, setTankCap] = useState(26.0);
  const [epaE85, setEpaE85] = useState(15.0);
  const [epaGas, setEpaGas] = useState(20.0);

  if (!isOpen) return null;

  const handleCreateVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) return;

    if (onAddVehicle) {
      onAddVehicle({
        nickname,
        make,
        model,
        year,
        engine_disp: disp,
        tank_capacity_gal: tankCap,
        baseline_epa_mpg_e85: epaE85,
        baseline_epa_mpg_gas: epaGas,
        flex_fuel_verified: true,
        is_default: false,
      });
    }
    setShowAddForm(false);
    setNickname("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl border border-[#1E293B] bg-[#101827] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1E293B] p-6 bg-[#151F30]/60">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#B8F34A]/10 text-[#B8F34A] border border-[#B8F34A]/30">
              <Car className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Vehicle Garage & Flex-Fuel Telemetry</h3>
              <p className="text-xs text-[#A6B1C2]">Manage vehicles and confirmed flex-fuel powertrain profiles.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-[#A6B1C2] hover:bg-[#1E293B] hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-5">
          {/* Active Vehicles List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#A6B1C2]">
                Your Flex-Fuel Vehicles ({vehicles.length})
              </span>
              <button
                type="button"
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center gap-1.5 rounded-lg bg-[#151F30] px-3 py-1.5 text-xs font-medium text-[#B8F34A] border border-[#B8F34A]/30 hover:bg-[#1E293B] transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>{showAddForm ? "Cancel" : "Add Vehicle"}</span>
              </button>
            </div>

            {vehicles.map((v) => {
              const isActive = v.id === activeVehicleId;
              return (
                <div
                  key={v.id}
                  onClick={() => onSelectVehicle(v.id)}
                  className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl p-4 border transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#151F30] border-[#B8F34A]/50 shadow-md shadow-[#B8F34A]/5"
                      : "bg-[#080D16] border-[#1E293B] hover:border-[#A6B1C2]/30"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                        isActive ? "bg-[#B8F34A] text-[#080D16]" : "bg-[#1E293B] text-[#A6B1C2]"
                      }`}
                    >
                      <Car className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{v.nickname}</span>
                        {v.flex_fuel_verified && (
                          <span className="flex items-center gap-1 rounded bg-[#B8F34A]/10 px-1.5 py-0.5 text-[10px] font-semibold text-[#B8F34A] border border-[#B8F34A]/20">
                            <ShieldCheck className="h-3 w-3" />
                            Verified Flex-Fuel
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#A6B1C2] mt-0.5">
                        {v.year} {v.make} {v.model} · {v.engine_disp}L · {v.tank_capacity_gal} gal tank
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <div className="text-right">
                      <p className="text-[#A6B1C2]">EPA Rating</p>
                      <p className="font-bold text-white">
                        <strong className="text-[#B8F34A]">{v.baseline_epa_mpg_e85} E85</strong> / {v.baseline_epa_mpg_gas} Gas
                      </p>
                    </div>

                    {isActive ? (
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#B8F34A] text-[#080D16]">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                    ) : (
                      <button
                        type="button"
                        className="rounded-lg bg-[#101827] px-3 py-1 text-xs text-[#A6B1C2] hover:text-white border border-[#1E293B]"
                      >
                        Select
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Vehicle Form */}
          {showAddForm && (
            <form onSubmit={handleCreateVehicle} className="rounded-xl bg-[#080D16] p-5 border border-[#B8F34A]/30 space-y-4 animate-in fade-in">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="h-4 w-4 text-[#B8F34A]" />
                Register New Flex-Fuel Vehicle
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#A6B1C2]">Vehicle Nickname</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Workhorse Silverado"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[#1E293B] bg-[#101827] px-3 py-2 text-xs text-white focus:border-[#B8F34A] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#A6B1C2]">Manufacturer</label>
                  <input
                    type="text"
                    required
                    value={make}
                    onChange={(e) => setMake(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[#1E293B] bg-[#101827] px-3 py-2 text-xs text-white focus:border-[#B8F34A] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#A6B1C2]">Model</label>
                  <input
                    type="text"
                    required
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[#1E293B] bg-[#101827] px-3 py-2 text-xs text-white focus:border-[#B8F34A] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#A6B1C2]">Model Year</label>
                  <input
                    type="number"
                    min="2000"
                    max="2027"
                    value={year}
                    onChange={(e) => setYear(parseInt(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-[#1E293B] bg-[#101827] px-3 py-2 text-xs text-white focus:border-[#B8F34A] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#A6B1C2]">Engine Displacement (Liters)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={disp}
                    onChange={(e) => setDisp(parseFloat(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-[#1E293B] bg-[#101827] px-3 py-2 text-xs text-white focus:border-[#B8F34A] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#A6B1C2]">Fuel Tank Capacity (Gallons)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={tankCap}
                    onChange={(e) => setTankCap(parseFloat(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-[#1E293B] bg-[#101827] px-3 py-2 text-xs text-white focus:border-[#B8F34A] focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#B8F34A] py-2.5 text-xs font-bold text-[#080D16] hover:bg-[#c4f866] transition-all"
              >
                <span>Save Vehicle to Garage</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
