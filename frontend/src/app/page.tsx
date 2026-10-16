"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Zap,
  ShieldCheck,
  Fuel,
  Compass,
  Navigation,
  ArrowRight,
  CheckCircle2,
  Sliders,
  Leaf,
  Activity,
  Layers,
  HelpCircle,
  Car,
  ChevronDown,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { InteractiveCalculator } from "@/components/InteractiveCalculator";
import { StationMap } from "@/components/StationMap";
import { FALLBACK_STATIONS } from "@/lib/api";

export default function LandingPage() {
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setFaqOpen(faqOpen === index ? null : index);
  };

  const faqs = [
    {
      q: "Why do standard fuel gauges and range estimators fail with E85?",
      a: "Factory vehicle range computers are calibrated predominantly for standard E10 gasoline. Because E85 has ~72-76% the volumetric energy density of gasoline (approx. 81,800 BTU/gal vs 114,000 BTU/gal), mileage drops between 20% to 28%. Factory algorithms often fail to adapt quickly to changing ethanol percentages (such as winter blends with 70% ethanol vs summer blends with 85%), creating sudden range drops and range anxiety.",
    },
    {
      q: "How does ETHERA's AI prediction engine work?",
      a: "ETHERA couples calibrated thermodynamic vehicle physics (engine displacement, baseline EPA cycles, drag coefficients, rolling resistance) with a trained Gradient Boosting Regressor (GBM). It integrates real-time ambient temperature, terrain elevation grade, driving speed, city vs highway proportion, and vehicle payload to provide statistically bounded 90% confidence range intervals rather than false guarantees.",
    },
    {
      q: "How do I know if E85 is cheaper than gasoline for my drive?",
      a: "E85 is only economical when its pump price discount exceeds its fuel economy penalty. The exact break-even equation is: E85_Price ≤ Gasoline_Price × (E85_MPG / Gas_MPG). For example, if gas is $3.45/gal and your vehicle gets 15 MPG on E85 vs 20 MPG on gas, your break-even threshold is $2.59/gal. If E85 sells for $2.45/gal, you save money per mile.",
    },
    {
      q: "Are the environmental and emissions claims verified?",
      a: "Yes. ETHERA uses evidence-based modeling derived from the Argonne National Laboratory GREET (Greenhouse gases, Regulated Emissions, and Energy use in Technologies) life-cycle framework. While tailpipe CO2 is emitted during combustion, corn and biomass ethanol absorbs atmospheric carbon during growth, yielding approximately 43% to 46% net life-cycle GHG reduction compared to 100% petroleum.",
    },
    {
      q: "Can I use ETHERA for non-E85 vehicles?",
      a: "ETHERA strictly verifies flex-fuel capability to prevent incompatible fueling. However, the system architecture supports comparative modeling for E10, E15, and premium fuels, and will expand to multi-fuel optimization in future versions.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#080D16] text-[#F5F7FA]">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-[#1E293B] pt-12 pb-20 sm:pt-20 sm:pb-28">
        {/* Futuristic Background Atmospheric Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[450px] w-[650px] rounded-full bg-gradient-to-tr from-[#35D6C5]/10 via-[#B8F34A]/15 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[#B8F34A]/30 bg-[#151F30]/80 px-4 py-1.5 text-xs font-semibold text-[#B8F34A] backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-[#B8F34A] animate-pulse" />
            <span>AI-Powered Flex-Fuel Telemetry & Navigation Platform</span>
          </div>

          {/* Headline */}
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
            Your Fuel. Your Range. <br />
            <span className="bg-gradient-to-r from-[#B8F34A] via-[#35D6C5] to-white bg-clip-text text-transparent">
              Your Intelligence.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mt-6 max-w-3xl text-base sm:text-lg text-[#A6B1C2] leading-relaxed">
            Stop guessing your remaining driving range on flex-fuel. ETHERA combines calibrated machine learning,
            real-world thermodynamics, fuel arbitrage analytics, and geospatial station intelligence to eliminate
            range anxiety and maximize fuel savings.
          </p>

          {/* Hero CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#B8F34A] px-8 py-3.5 text-sm font-bold text-[#080D16] shadow-lg shadow-[#B8F34A]/25 hover:bg-[#c6f866] transition-all"
            >
              <Zap className="h-4 w-4" />
              <span>Explore Live Dashboard</span>
            </Link>
            <a
              href="#calculator"
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-[#1E293B] bg-[#101827] px-8 py-3.5 text-sm font-semibold text-[#F5F7FA] hover:border-[#B8F34A]/40 hover:bg-[#151F30] transition-all"
            >
              <Fuel className="h-4 w-4 text-[#35D6C5]" />
              <span>Test Fuel Calculator</span>
            </a>
          </div>

          {/* Vehicle Range Cockpit Preview Card */}
          <div className="mt-14 mx-auto max-w-4xl rounded-2xl border border-[#1E293B] bg-gradient-to-b from-[#151F30]/90 to-[#080D16] p-6 shadow-2xl backdrop-blur-xl">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-[#1E293B] pb-4 text-left">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#080D16] border border-[#B8F34A]/40 text-[#B8F34A]">
                  <Car className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Apex F-150 Flex (5.0L V8 FFV)</h3>
                  <p className="text-xs text-[#A6B1C2]">Calibrated Telemetry · Real-Time Ambient 72°F</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-[#10B981]/15 px-3 py-1 text-xs font-semibold text-[#10B981] border border-[#10B981]/30">
                  E85 Advantage Active
                </span>
                <span className="rounded-full bg-[#151F30] px-3 py-1 text-xs font-medium text-[#A6B1C2] border border-[#1E293B]">
                  Model: v1.0-gbm
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="rounded-xl bg-[#080D16] p-4 border border-[#1E293B]">
                <p className="text-xs text-[#A6B1C2]">Calibrated Range</p>
                <p className="mt-1 text-2xl sm:text-3xl font-extrabold text-[#B8F34A]">378 MI</p>
                <p className="text-[10px] text-[#A6B1C2] mt-0.5">90% CI: [350 - 406 mi]</p>
              </div>
              <div className="rounded-xl bg-[#080D16] p-4 border border-[#1E293B]">
                <p className="text-xs text-[#A6B1C2]">Predicted MPG</p>
                <p className="mt-1 text-2xl sm:text-3xl font-extrabold text-white">14.8</p>
                <p className="text-[10px] text-[#A6B1C2] mt-0.5">EPA Reference: 15.0</p>
              </div>
              <div className="rounded-xl bg-[#080D16] p-4 border border-[#1E293B]">
                <p className="text-xs text-[#A6B1C2]">Cost per Mile</p>
                <p className="mt-1 text-2xl sm:text-3xl font-extrabold text-[#35D6C5]">$0.165</p>
                <p className="text-[10px] text-[#A6B1C2] mt-0.5">Gasoline: $0.173</p>
              </div>
              <div className="rounded-xl bg-[#080D16] p-4 border border-[#1E293B]">
                <p className="text-xs text-[#A6B1C2]">Net Annual Savings</p>
                <p className="mt-1 text-2xl sm:text-3xl font-extrabold text-[#10B981]">+$120</p>
                <p className="text-[10px] text-[#A6B1C2] mt-0.5">842 lbs CO2e saved</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Problem Statement Section */}
      <section className="border-b border-[#1E293B] bg-[#101827]/60 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#B8F34A]">The Flex-Fuel Dilemma</h2>
            <p className="mt-2 text-2xl sm:text-3xl font-bold text-white">
              Why Fuel Prices Alone Never Tell the Full Story
            </p>
            <p className="mt-3 text-sm text-[#A6B1C2] leading-relaxed">
              When E85 is listed at $2.49 and regular unleaded is $3.45, is E85 actually saving you money? Not always.
              Ethanol has 24-28% less energy content per gallon. If your vehicle experiences a 27% mileage drop, your
              cost per mile might actually be higher.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-[#1E293B] bg-[#080D16] p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EF4444]/10 text-[#EF4444]">
                <Fuel className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-bold text-white">Variable Ethanol Energy Density</h3>
              <p className="mt-2 text-xs sm:text-sm text-[#A6B1C2] leading-relaxed">
                E85 ethanol blend ratios shift from 70% in winter to 85% in summer. Standard dashboard trip computers
                are incapable of distinguishing seasonal energy swings.
              </p>
            </div>

            <div className="rounded-2xl border border-[#1E293B] bg-[#080D16] p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F59E0B]/10 text-[#F59E0B]">
                <Activity className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-bold text-white">Range Anxiety & Inaccurate Gauges</h3>
              <p className="mt-2 text-xs sm:text-sm text-[#A6B1C2] leading-relaxed">
                Drivers experience unexpected rapid needle drops because cold starts, aerodynamic drag at 75 mph, and
                cargo payloads degrade ethanol fuel economy more sharply than gasoline.
              </p>
            </div>

            <div className="rounded-2xl border border-[#1E293B] bg-[#080D16] p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#35D6C5]/10 text-[#35D6C5]">
                <Navigation className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-bold text-white">Station Scarcity on Long Corridors</h3>
              <p className="mt-2 text-xs sm:text-sm text-[#A6B1C2] leading-relaxed">
                With fewer than 5,000 public E85 dispensers across the United States, running out of fuel in unfamiliar
                territory is a genuine risk without smart corridor planning.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Fuel Economics Calculator Section */}
      <section className="py-16 sm:py-24 border-b border-[#1E293B]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#35D6C5]">Live Arbitrage Calculator</h2>
            <p className="mt-2 text-3xl font-extrabold text-white">
              Compute Your Exact Break-Even Threshold
            </p>
            <p className="mt-3 text-sm text-[#A6B1C2]">
              Adjust the sliders below to test current regional gas and E85 prices against your vehicle profile.
            </p>
          </div>

          <InteractiveCalculator />
        </div>
      </section>

      {/* 4-Step Prediction Workflow Section */}
      <section id="how-it-works" className="py-16 sm:py-24 border-b border-[#1E293B] bg-[#101827]/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#B8F34A]">Engineering Architecture</h2>
            <p className="mt-2 text-3xl font-extrabold text-white">
              How the ETHERA Prediction Engine Works
            </p>
            <p className="mt-3 text-sm text-[#A6B1C2]">
              From powertrain kinematics to machine learning inference in under 5 milliseconds.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="rounded-2xl border border-[#1E293B] bg-[#080D16] p-6 relative">
              <span className="text-3xl font-black text-[#1E293B]">01</span>
              <h4 className="mt-3 text-base font-bold text-white">Powertrain Specification</h4>
              <p className="mt-2 text-xs text-[#A6B1C2] leading-relaxed">
                Collects verified engine displacement, verified flex-fuel compatibility, compression ratio, and EPA baseline ratings.
              </p>
            </div>

            <div className="rounded-2xl border border-[#1E293B] bg-[#080D16] p-6 relative">
              <span className="text-3xl font-black text-[#1E293B]">02</span>
              <h4 className="mt-3 text-base font-bold text-white">Operational Physics</h4>
              <p className="mt-2 text-xs text-[#A6B1C2] leading-relaxed">
                Applies SAE road-load equations for aerodynamic drag ($v^2$ above 55 mph), rolling resistance, cargo weight, and cabin AC.
              </p>
            </div>

            <div className="rounded-2xl border border-[#1E293B] bg-[#080D16] p-6 relative">
              <span className="text-3xl font-black text-[#1E293B]">03</span>
              <h4 className="mt-3 text-base font-bold text-white">GBM Machine Learning</h4>
              <p className="mt-2 text-xs text-[#A6B1C2] leading-relaxed">
                Gradient Boosting Regressor (140 estimators, max depth 4) calibrated on EPA driving schedules predicts real-world fuel economy.
              </p>
            </div>

            <div className="rounded-2xl border border-[#1E293B] bg-[#080D16] p-6 relative">
              <span className="text-3xl font-black text-[#1E293B]">04</span>
              <h4 className="mt-3 text-base font-bold text-white">Uncertainty Bounds</h4>
              <p className="mt-2 text-xs text-[#A6B1C2] leading-relaxed">
                Computes a rigorous 90% confidence interval based on test residual error distributions, refusing to give false guarantees.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Station Discovery Preview Section */}
      <section id="stations" className="py-16 sm:py-24 border-b border-[#1E293B]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#35D6C5]">Geospatial Intelligence</h2>
            <p className="mt-2 text-3xl font-extrabold text-white">Verified E85 Refueling Network</p>
            <p className="mt-3 text-sm text-[#A6B1C2]">
              Explore verified fuel stations with real-time pricing, community ratings, and one-click navigation.
            </p>
          </div>

          <StationMap stations={FALLBACK_STATIONS} />
        </div>
      </section>

      {/* Sustainability & Methodology Disclosure Section */}
      <section className="py-16 sm:py-20 border-b border-[#1E293B] bg-[#101827]/50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#10B981]/15 px-3 py-1 text-xs font-semibold text-[#10B981] border border-[#10B981]/30">
            <Leaf className="h-3.5 w-3.5" />
            <span>Evidence-Based Environmental Accounting</span>
          </div>
          <h3 className="mt-4 text-2xl sm:text-3xl font-bold text-white">
            Honest, Science-Backed Sustainability Claims
          </h3>
          <p className="mt-4 text-sm text-[#A6B1C2] leading-relaxed text-justify sm:text-center">
            ETHERA does not make unsubstantiated greenwashing claims. While E85 is an alternative to pure petroleum, its
            environmental impact depends on agricultural feedstock, refining fuel sources, and electrical grid intensity.
            Our emission estimations are grounded strictly in the <strong>Argonne National Laboratory GREET</strong> model,
            which accounts for biogenic carbon absorption during crop photosynthesis offset by industrial processing inputs.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-6 text-xs text-[#A6B1C2]">
            <span className="flex items-center gap-1.5 text-white">
              <CheckCircle2 className="h-4 w-4 text-[#10B981]" />
              Argonne GREET Standard
            </span>
            <span className="flex items-center gap-1.5 text-white">
              <CheckCircle2 className="h-4 w-4 text-[#10B981]" />
              USDA Life-Cycle Biofuel Data
            </span>
            <span className="flex items-center gap-1.5 text-white">
              <CheckCircle2 className="h-4 w-4 text-[#10B981]" />
              Zero Tailpipe Deception
            </span>
          </div>
        </div>
      </section>

      {/* Plan Tiers Comparison (Academic & Business Concept) */}
      <section className="py-16 sm:py-24 border-b border-[#1E293B]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#B8F34A]">Product Roadmap & Tiers</h2>
            <p className="mt-2 text-3xl font-extrabold text-white">Tailored for Drivers and Fleets</p>
            <p className="mt-3 text-sm text-[#A6B1C2]">
              Designed for individual flex-fuel owners with an architectural pathway to enterprise fleet logistics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Driver Tier */}
            <div className="rounded-2xl border border-[#B8F34A]/40 bg-[#151F30] p-8 shadow-xl relative">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#B8F34A]">Active Platform</span>
                <span className="rounded-full bg-[#B8F34A]/20 px-3 py-1 text-xs font-bold text-[#B8F34A]">
                  Free / Open Access
                </span>
              </div>
              <h4 className="mt-4 text-2xl font-bold text-white">Individual Driver Tier</h4>
              <p className="mt-2 text-xs text-[#A6B1C2]">
                Complete suite for daily drivers and road-trippers with flex-fuel vehicles.
              </p>

              <ul className="mt-6 space-y-3 text-xs text-[#F5F7FA]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#B8F34A]" />
                  <span>AI-calibrated E85 mileage & range prediction</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#B8F34A]" />
                  <span>Real-time fuel arbitrage & break-even price calculator</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#B8F34A]" />
                  <span>Verified E85 station finder with distance sorting</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#B8F34A]" />
                  <span>Smart trip planner with 35-mile safety reserve alerts</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#B8F34A]" />
                  <span>Multi-vehicle garage with custom EPA baselines</span>
                </li>
              </ul>

              <Link
                href="/dashboard"
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-[#B8F34A] py-3 text-xs font-bold text-[#080D16] hover:bg-[#c4f866] transition-all"
              >
                <span>Launch Dashboard</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Enterprise Fleet Plan (Roadmap) */}
            <div className="rounded-2xl border border-[#1E293B] bg-[#101827] p-8 relative">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#A6B1C2]">Future Roadmap</span>
                <span className="rounded-full bg-[#151F30] px-3 py-1 text-xs font-bold text-[#A6B1C2] border border-[#1E293B]">
                  Fleet SaaS
                </span>
              </div>
              <h4 className="mt-4 text-2xl font-bold text-white">Commercial Fleet Intelligence</h4>
              <p className="mt-2 text-xs text-[#A6B1C2]">
                Designed for municipal utility fleets, law enforcement, and delivery networks using flex-fuel trucks.
              </p>

              <ul className="mt-6 space-y-3 text-xs text-[#A6B1C2]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#35D6C5]" />
                  <span>Bulk multi-vehicle telematics ingestion (OBD-II / CAN-bus)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#35D6C5]" />
                  <span>Fleet-wide fuel spend arbitrage & tax-credit reporting</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#35D6C5]" />
                  <span>Automated dispatch routing with bulk dispenser pricing</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#35D6C5]" />
                  <span>Corporate ESG & Scope 1 life-cycle carbon audit exports</span>
                </li>
              </ul>

              <button
                disabled
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-[#151F30] py-3 text-xs font-bold text-[#A6B1C2] cursor-not-allowed border border-[#1E293B]"
              >
                <span>Planned for Commercial v2.0 Release</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="py-16 sm:py-24 border-b border-[#1E293B] bg-[#101827]/40">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#35D6C5]">Frequently Asked Questions</h2>
            <p className="mt-2 text-3xl font-extrabold text-white">Answers About Flex-Fuel & ETHERA</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = faqOpen === index;
              return (
                <div
                  key={index}
                  className="rounded-xl border border-[#1E293B] bg-[#080D16] overflow-hidden transition-all"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="flex w-full items-center justify-between p-5 text-left text-sm font-bold text-white hover:text-[#B8F34A] transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-[#B8F34A]" : "text-[#A6B1C2]"
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#A6B1C2] leading-relaxed border-t border-[#1E293B]/60">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#080D16] py-12 text-[#A6B1C2] text-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#151F30] border border-[#B8F34A]/30 text-[#B8F34A]">
              <Zap className="h-4 w-4" />
            </div>
            <div>
              <span className="font-bold text-white text-sm">ETHERA Platform</span>
              <p className="text-[11px] text-[#A6B1C2]">AI Fuel Intelligence & Sustainable Mobility</p>
            </div>
          </div>

          <p className="text-center sm:text-left text-[11px]">
            Academic Entrepreneurship Development Project · Production Architecture · Built with Next.js & FastAPI
          </p>

          <div className="flex items-center gap-4 text-[11px]">
            <Link href="/dashboard" className="hover:text-white transition-colors">
              Live Dashboard
            </Link>
            <a href="#calculator" className="hover:text-white transition-colors">
              Arbitrage Engine
            </a>
            <a href="#stations" className="hover:text-white transition-colors">
              Stations Network
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
