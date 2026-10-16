"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Zap, Compass, Fuel, Car, Navigation, Menu, X, ShieldCheck } from "lucide-react";

interface NavbarProps {
  currentVehicleName?: string;
  onVehicleClick?: () => void;
  onDemoClick?: () => void;
  isDashboard?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentVehicleName = "Apex F-150 Flex",
  onVehicleClick,
  onDemoClick,
  isDashboard = false,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-[#1E293B] bg-[#080D16]/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#101827] to-[#151F30] border border-[#B8F34A]/40 group-hover:border-[#B8F34A] transition-all">
            <Zap className="h-5 w-5 text-[#B8F34A]" />
            <div className="absolute inset-0 rounded-xl bg-[#B8F34A]/10 blur-sm group-hover:bg-[#B8F34A]/20 transition-all" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-bold tracking-wider text-white">ETHERA</span>
              <span className="rounded-full bg-[#B8F34A]/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-[#B8F34A]">
                AI
              </span>
            </div>
            <p className="text-[10px] tracking-tight text-[#A6B1C2] hidden sm:block">
              Know Your Range. Master Your Fuel.
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-[#A6B1C2]">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 hover:text-[#B8F34A] transition-colors"
          >
            <Compass className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>
          <Link
            href={isDashboard ? "#economics" : "/#calculator"}
            className="flex items-center gap-2 hover:text-[#B8F34A] transition-colors"
          >
            <Fuel className="h-4 w-4" />
            <span>Fuel Economics</span>
          </Link>
          <Link
            href={isDashboard ? "#stations" : "/#stations"}
            className="flex items-center gap-2 hover:text-[#B8F34A] transition-colors"
          >
            <Navigation className="h-4 w-4" />
            <span>Stations</span>
          </Link>
          <Link
            href={isDashboard ? "#trip-planner" : "/#how-it-works"}
            className="flex items-center gap-2 hover:text-[#B8F34A] transition-colors"
          >
            <Car className="h-4 w-4" />
            <span>{isDashboard ? "Trip Planner" : "How It Works"}</span>
          </Link>
        </div>

        {/* Right Action Cluster */}
        <div className="flex items-center gap-3">
          {/* Active Vehicle Badge */}
          {isDashboard ? (
            <button
              onClick={onVehicleClick}
              className="hidden sm:flex items-center gap-2 rounded-lg border border-[#1E293B] bg-[#101827] px-3 py-1.5 text-xs text-[#F5F7FA] hover:border-[#B8F34A]/50 transition-colors"
            >
              <Car className="h-3.5 w-3.5 text-[#B8F34A]" />
              <span className="font-medium">{currentVehicleName}</span>
              <span className="text-[10px] text-[#A6B1C2] bg-[#151F30] px-1.5 py-0.5 rounded">Switch</span>
            </button>
          ) : (
            <button
              onClick={onDemoClick}
              className="hidden sm:inline-flex items-center gap-2 rounded-lg border border-[#1E293B] bg-[#101827] px-3 py-1.5 text-xs text-[#A6B1C2] hover:text-[#F5F7FA] hover:border-[#B8F34A]/30 transition-all"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-[#35D6C5]" />
              <span>Simulated Demo</span>
            </button>
          )}

          {/* Primary CTA */}
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-lg bg-[#B8F34A] px-4 py-2 text-xs sm:text-sm font-semibold text-[#080D16] shadow-sm hover:bg-[#c6f866] transition-all hover:shadow-[#B8F34A]/20 hover:shadow-lg"
          >
            <Zap className="h-4 w-4" />
            <span>{isDashboard ? "Live Cockpit" : "Launch App"}</span>
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden rounded-lg p-2 text-[#A6B1C2] hover:text-white"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#1E293B] bg-[#080D16] px-4 py-4 space-y-3">
          <Link
            href="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2 text-sm text-[#F5F7FA] hover:bg-[#151F30] rounded-lg"
          >
            <Compass className="h-4 w-4 text-[#B8F34A]" />
            <span>Dashboard Command</span>
          </Link>
          <Link
            href="/#calculator"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2 text-sm text-[#F5F7FA] hover:bg-[#151F30] rounded-lg"
          >
            <Fuel className="h-4 w-4 text-[#35D6C5]" />
            <span>Fuel Economics Calculator</span>
          </Link>
          <Link
            href="/#stations"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2 text-sm text-[#F5F7FA] hover:bg-[#151F30] rounded-lg"
          >
            <Navigation className="h-4 w-4 text-[#B8F34A]" />
            <span>Find E85 Stations</span>
          </Link>
          <Link
            href="/#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2 text-sm text-[#F5F7FA] hover:bg-[#151F30] rounded-lg"
          >
            <Car className="h-4 w-4 text-[#A6B1C2]" />
            <span>How It Works & Science</span>
          </Link>
        </div>
      )}
    </nav>
  );
};
