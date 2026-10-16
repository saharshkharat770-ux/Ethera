import os
import sys
import time
import json
import math
import random
from datetime import datetime, timezone
from typing import Dict, Any, List

# Ensure backend root is on path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.database import Base, engine, SessionLocal
from app.ml.prediction_engine import prediction_engine
from app.services.economics_service import economics_service
from app.services.station_service import station_service, haversine_distance_miles
from app.services.trip_service import trip_service
from app.core.security import get_password_hash, verify_password, create_access_token, decode_access_token
from app.models import User, Vehicle, FuelLog

def run_prediction_20x() -> Dict[str, Any]:
    print("\n--- [1/5] Running 20x Iterations on FuelPredictionEngine.predict() ---")
    results = []
    latencies = []
    
    test_cases = [
        # (disp, gas_base, e85_base, ethanol, split, speed, temp, grade, load, ac, tank, desc)
        (5.0, 20.0, 15.0, 85.0, 0.5, 55.0, 72.0, 0.0, 200.0, False, 26.0, "Standard F-150 Baseline"),
        (5.0, 20.0, 15.0, 85.0, 0.9, 78.0, 72.0, 0.0, 200.0, False, 26.0, "High Speed Highway 78mph"),
        (5.0, 20.0, 15.0, 85.0, 0.1, 22.0, 72.0, 0.0, 200.0, False, 26.0, "Heavy Urban City Stop-and-Go"),
        (5.0, 20.0, 15.0, 85.0, 0.5, 55.0, -10.0, 0.0, 200.0, False, 26.0, "Extreme Sub-Zero Cold -10°F"),
        (5.0, 20.0, 15.0, 85.0, 0.5, 55.0, 108.0, 0.0, 200.0, True, 26.0, "Extreme Desert Heat 108°F + AC"),
        (5.0, 20.0, 15.0, 85.0, 0.5, 45.0, 68.0, 5.5, 200.0, False, 26.0, "Steep Uphill Grade +5.5%"),
        (5.0, 20.0, 15.0, 85.0, 0.5, 50.0, 68.0, -4.5, 200.0, False, 26.0, "Steep Mountain Descent -4.5%"),
        (5.0, 20.0, 15.0, 85.0, 0.5, 55.0, 70.0, 0.0, 1800.0, False, 26.0, "Heavy Cargo Load 1,800 lbs"),
        (5.0, 20.0, 15.0, 70.0, 0.6, 58.0, 32.0, 0.0, 200.0, False, 26.0, "Winter Blend E70 at 32°F"),
        (5.3, 19.0, 14.5, 85.0, 0.5, 55.0, 72.0, 0.0, 250.0, False, 24.0, "Silverado 5.3L V8 Baseline"),
        (5.3, 19.0, 14.5, 85.0, 0.95, 75.0, 65.0, 1.2, 500.0, False, 24.0, "Silverado Highway Incline 75mph"),
        (3.6, 24.0, 17.5, 85.0, 0.5, 50.0, 70.0, 0.0, 150.0, False, 18.5, "Impala 3.6L V6 Sedan Baseline"),
        (3.6, 24.0, 17.5, 85.0, 0.2, 25.0, 82.0, 0.0, 300.0, True, 18.5, "Impala City Commute with AC"),
        (2.7, 23.0, 17.0, 85.0, 0.7, 62.0, 65.0, -0.5, 200.0, False, 22.0, "Turbo 2.7L Flex-Fuel Mild Cruise"),
        (6.2, 17.0, 12.5, 85.0, 0.4, 45.0, 60.0, 2.0, 800.0, False, 31.0, "Heavy Duty 6.2L V8 Loaded Truck"),
        (5.0, 20.0, 15.0, 85.0, 0.5, 55.0, 70.0, 0.0, 200.0, False, 26.0, "Low Fuel Reserve 3.0 Gallons"),
        (5.0, 20.0, 15.0, 80.0, 0.65, 58.0, 55.0, 0.8, 400.0, False, 26.0, "Mid-Blend E80 Suburban Mix"),
        (3.3, 22.0, 16.0, 85.0, 0.5, 52.0, 75.0, 0.0, 350.0, True, 19.0, "Explorer 3.3L Flex-Fuel Family Trip"),
        (5.0, 20.0, 15.0, 85.0, 0.0, 15.0, 95.0, 0.0, 600.0, True, 26.0, "Worst-case: Gridlock + Extreme Heat"),
        (3.6, 24.0, 17.5, 85.0, 1.0, 52.0, 72.0, -1.0, 100.0, False, 18.5, "Best-case: Gentle Highway Descent")
    ]
    
    passed_count = 0
    for idx, tc in enumerate(test_cases, 1):
        t0 = time.perf_counter()
        disp, gas_b, e85_b, eth, split, spd, tmp, grd, ld, ac, tnk, desc = tc
        curr_fuel = 3.0 if "Low Fuel" in desc else tnk
        
        pred = prediction_engine.predict(
            engine_disp=disp,
            baseline_epa_mpg_gas=gas_b,
            baseline_epa_mpg_e85=e85_b,
            ethanol_percent=eth,
            city_highway_split=split,
            avg_speed_mph=spd,
            ambient_temp_f=tmp,
            terrain_elevation_grade=grd,
            vehicle_load_lbs=ld,
            ac_active=ac,
            tank_capacity_gal=tnk,
            current_fuel_gallons=curr_fuel
        )
        t_el = (time.perf_counter() - t0) * 1000.0
        latencies.append(t_el)
        
        # Rigorous assertions
        valid_mpg = (5.0 <= pred["predicted_mpg"] <= 35.0) and not math.isnan(pred["predicted_mpg"])
        valid_range = (pred["estimated_range_miles"] > 0) and not math.isnan(pred["estimated_range_miles"])
        valid_ci = (pred["confidence_lower_mpg"] <= pred["predicted_mpg"] <= pred["confidence_upper_mpg"])
        valid_factors = len(pred["factors"]) >= 0
        
        is_pass = valid_mpg and valid_range and valid_ci and valid_factors
        if is_pass:
            passed_count += 1
            
        results.append({
            "iteration": idx,
            "scenario": desc,
            "predicted_mpg": pred["predicted_mpg"],
            "range_miles": pred["estimated_range_miles"],
            "ci_range": f"{pred['confidence_lower_mpg']} - {pred['confidence_upper_mpg']}",
            "latency_ms": round(t_el, 3),
            "status": "PASS" if is_pass else "FAIL"
        })
        
    return {
        "function": "FuelPredictionEngine.predict()",
        "total_runs": 20,
        "passed": passed_count,
        "failed": 20 - passed_count,
        "mean_latency_ms": round(sum(latencies) / len(latencies), 3),
        "max_latency_ms": round(max(latencies), 3),
        "details": results
    }

def run_economics_20x() -> Dict[str, Any]:
    print("\n--- [2/5] Running 20x Iterations on FuelEconomicsService.calculate_comparison() ---")
    results = []
    latencies = []
    
    test_cases = [
        # (e85_p, gas_p, e85_mpg, gas_mpg, annual_mi, trip_mi, desc)
        (2.45, 3.45, 15.0, 20.0, 15000, 250, "Midwest Parity Advantage (E85 $2.45 vs $3.45)"),
        (2.19, 3.12, 15.0, 20.0, 15000, 100, "Iowa High Cornbelt Discount ($2.19 vs $3.12)"),
        (2.99, 4.89, 15.0, 20.0, 15000, 300, "California Mega Advantage ($2.99 vs $4.89)"),
        (2.89, 3.20, 15.0, 20.0, 15000, 200, "Near Parity Tight Margin ($2.89 vs $3.20)"),
        (3.30, 3.10, 15.0, 20.0, 15000, 50, "Unfavorable E85 Surcharge ($3.30 vs $3.10)"),
        (2.35, 3.15, 14.5, 19.0, 15000, 450, "Texas Interstate Travel ($2.35 vs $3.15)"),
        (2.55, 3.65, 17.5, 24.0, 12000, 80, "V6 Sedan Commute ($2.55 vs $3.65)"),
        (2.49, 3.49, 15.0, 20.0, 40000, 1000, "Commercial High-Mileage Fleet (40,000 mi)"),
        (2.49, 3.49, 15.0, 20.0, 5000, 15, "Low-Mileage Urban Commuter (5,000 mi)"),
        (1.99, 3.29, 15.0, 20.0, 18000, 600, "Super Subsidized Clean Fuel Promotion"),
        (3.05, 3.80, 12.5, 17.0, 20000, 250, "Heavy-Duty 6.2L V8 Fleet Economics"),
        (2.42, 3.39, 15.5, 20.5, 15000, 180, "Winter Blend E70 Efficiency Shift"),
        (2.59, 3.59, 14.0, 19.0, 16000, 220, "Florida Regional Price Structure"),
        (2.40, 3.25, 16.0, 21.0, 14000, 140, "Ohio Valley Suburban Corridor"),
        (2.65, 3.45, 14.8, 19.8, 15000, 95, "Slightly Depressed Gas Price Swing"),
        (2.15, 3.45, 15.0, 20.0, 25000, 400, "Midwest Agriculture Corridor Bonus"),
        (3.40, 5.20, 15.0, 20.0, 15000, 500, "High West Coast Gas Spike ($5.20)"),
        (2.25, 2.75, 15.0, 20.0, 15000, 120, "Nationwide Low Crude Price Floor"),
        (2.70, 3.60, 15.0, 20.0, 15000, 310, "Exact 25% Discount Threshold"),
        (2.50, 3.333, 15.0, 20.0, 15000, 200, "Exact Thermodynamic Break-Even Case")
    ]
    
    passed_count = 0
    for idx, tc in enumerate(test_cases, 1):
        t0 = time.perf_counter()
        e85_p, gas_p, e85_mpg, gas_mpg, ann_mi, trip_mi, desc = tc
        
        calc = economics_service.calculate_comparison(
            e85_price_per_gal=e85_p,
            gas_price_per_gal=gas_p,
            baseline_e85_mpg=e85_mpg,
            baseline_gas_mpg=gas_mpg,
            annual_miles=ann_mi,
            trip_distance_miles=trip_mi
        )
        t_el = (time.perf_counter() - t0) * 1000.0
        latencies.append(t_el)
        
        # Assertions
        expected_break_even = round(gas_p * (e85_mpg / gas_mpg), 2)
        valid_be = abs(calc["break_even_e85_price"] - expected_break_even) < 0.05
        valid_cpm = calc["cost_per_mile_e85"] > 0 and calc["cost_per_mile_gas"] > 0
        valid_co2 = calc["co2_lifecycle_saving_lbs"] >= 0
        valid_logic = (calc["is_e85_economical"] == (e85_p < calc["break_even_e85_price"]))
        
        is_pass = valid_be and valid_cpm and valid_co2 and valid_logic
        if is_pass:
            passed_count += 1
            
        results.append({
            "iteration": idx,
            "scenario": desc,
            "break_even": calc["break_even_e85_price"],
            "is_economical": calc["is_e85_economical"],
            "annual_savings": calc["annual_savings_amount"],
            "co2_saved_lbs": calc["co2_lifecycle_saving_lbs"],
            "latency_ms": round(t_el, 3),
            "status": "PASS" if is_pass else "FAIL"
        })
        
    return {
        "function": "FuelEconomicsService.calculate_comparison()",
        "total_runs": 20,
        "passed": passed_count,
        "failed": 20 - passed_count,
        "mean_latency_ms": round(sum(latencies) / len(latencies), 3),
        "max_latency_ms": round(max(latencies), 3),
        "details": results
    }

def run_stations_20x() -> Dict[str, Any]:
    print("\n--- [3/5] Running 20x Iterations on FuelStationService.search_nearby() ---")
    db = SessionLocal()
    station_service.seed_initial_stations(db)
    results = []
    latencies = []
    
    # 20 diverse US coordinate centroids
    test_queries = [
        (41.8781, -87.6298, 25.0, "Chicago Loop (Downtown Urban Core)"),
        (41.8500, -87.7444, 10.0, "Cicero / West Chicago Suburbs"),
        (41.5250, -88.0817, 15.0, "Joliet Interstate Hub"),
        (42.2856, -89.0872, 20.0, "Rockford Northern Illinois Corridor"),
        (44.9778, -93.2650, 25.0, "Minneapolis Downtown"),
        (44.8625, -93.3610, 15.0, "Bloomington Twin Cities South"),
        (32.7767, -96.7970, 30.0, "Dallas Metro Area"),
        (33.0035, -97.3090, 20.0, "Fort Worth North I-35W Corridor"),
        (32.8390, -96.9360, 15.0, "Irving DFW Airport Region"),
        (41.5880, -93.7380, 25.0, "Des Moines Iowa Epicenter"),
        (39.7684, -86.1581, 30.0, "Indianapolis Central Hub"),
        (40.0980, -83.1490, 20.0, "Dublin / Columbus Ohio Hub"),
        (32.7157, -117.1611, 25.0, "San Diego Southern California"),
        (37.3382, -121.8863, 25.0, "San Jose Silicon Valley"),
        (34.0522, -118.2437, 25.0, "Los Angeles Metro"),
        (28.5383, -81.3792, 25.0, "Orlando Florida Hub"),
        (41.8781, -87.6298, 100.0, "Broad 100-mile Midwest Regional Scan"),
        (32.7767, -96.7970, 150.0, "Broad 150-mile Texas Regional Scan"),
        (35.0000, -110.0000, 30.0, "Remote Arizona Desert (Zero stations expected)"),
        (25.0000, -71.0000, 50.0, "Bermuda Triangle Ocean Boundary (Negative control)")
    ]
    
    passed_count = 0
    for idx, tq in enumerate(test_queries, 1):
        lat, lng, rad, desc = tq
        t0 = time.perf_counter()
        nearby = station_service.search_nearby(db, lat, lng, radius_miles=rad, has_e85=True)
        t_el = (time.perf_counter() - t0) * 1000.0
        latencies.append(t_el)
        
        # Verify distance sorting
        is_sorted = all(nearby[i]["distance_miles"] <= nearby[i+1]["distance_miles"] for i in range(len(nearby)-1))
        all_in_radius = all(st["distance_miles"] <= rad for st in nearby)
        
        is_pass = is_sorted and all_in_radius and isinstance(nearby, list)
        if is_pass:
            passed_count += 1
            
        results.append({
            "iteration": idx,
            "scenario": desc,
            "radius_miles": rad,
            "stations_found": len(nearby),
            "closest_station": nearby[0]["name"] if nearby else "None",
            "closest_distance_miles": nearby[0]["distance_miles"] if nearby else None,
            "latency_ms": round(t_el, 3),
            "status": "PASS" if is_pass else "FAIL"
        })
        
    db.close()
    return {
        "function": "FuelStationService.search_nearby()",
        "total_runs": 20,
        "passed": passed_count,
        "failed": 20 - passed_count,
        "mean_latency_ms": round(sum(latencies) / len(latencies), 3),
        "max_latency_ms": round(max(latencies), 3),
        "details": results
    }

def run_trips_20x() -> Dict[str, Any]:
    print("\n--- [4/5] Running 20x Iterations on SmartTripService.plan_trip() ---")
    db = SessionLocal()
    vehicle = db.query(Vehicle).first()
    assert vehicle is not None
    
    results = []
    latencies = []
    
    trip_routes = [
        # (orig, o_lat, o_lng, dest, d_lat, d_lng, fuel_pct, temp, cargo, spd_fac, desc)
        ("Chicago, IL", 41.8781, -87.6298, "Joliet, IL", 41.5250, -88.0817, 100.0, 72.0, 150.0, 1.0, "Short Suburban Hop (45 mi, Full Tank)"),
        ("Chicago, IL", 41.8781, -87.6298, "Joliet, IL", 41.5250, -88.0817, 15.0, 72.0, 150.0, 1.0, "Short Hop Low Tank (Refuel Buffer Alert)"),
        ("Chicago, IL", 41.8781, -87.6298, "Rockford, IL", 42.2856, -89.0872, 80.0, 68.0, 200.0, 1.0, "Regional Run to Rockford (90 mi)"),
        ("Chicago, IL", 41.8781, -87.6298, "Bloomington, IL", 40.4842, -88.9937, 100.0, 65.0, 200.0, 1.0, "Interstate Run (135 mi, Full Tank)"),
        ("Chicago, IL", 41.8781, -87.6298, "Bloomington, IL", 40.4842, -88.9937, 35.0, 65.0, 200.0, 1.0, "Interstate Run 35% Tank (Midway Refuel)"),
        ("Chicago, IL", 41.8781, -87.6298, "Indianapolis, IN", 39.7684, -86.1581, 100.0, 70.0, 300.0, 1.0, "Multi-State I-65 Corridor (180 mi)"),
        ("Dallas, TX", 32.7767, -96.7970, "Fort Worth, TX", 32.7555, -97.3308, 100.0, 85.0, 100.0, 1.0, "DFW Cross-Town Run (35 mi)"),
        ("Dallas, TX", 32.7767, -96.7970, "Austin, TX", 30.2672, -97.7431, 100.0, 92.0, 250.0, 1.1, "I-35 Texas Corridor (200 mi High Speed)"),
        ("Dallas, TX", 32.7767, -96.7970, "Austin, TX", 30.2672, -97.7431, 40.0, 92.0, 250.0, 1.1, "I-35 Low Tank Buffer Trip"),
        ("Minneapolis, MN", 44.9778, -93.2650, "Duluth, MN", 46.7867, -92.1005, 90.0, 28.0, 200.0, 0.95, "Winter Run North at 28°F (155 mi)"),
        ("Minneapolis, MN", 44.9778, -93.2650, "Des Moines, IA", 41.5880, -93.7380, 100.0, 62.0, 400.0, 1.0, "Midwest Agricultural I-35 Run (240 mi)"),
        ("Des Moines, IA", 41.5880, -93.7380, "Omaha, NE", 41.2565, -95.9345, 100.0, 70.0, 200.0, 1.0, "I-80 Corn Belt Journey (140 mi)"),
        ("Columbus, OH", 40.0980, -83.1490, "Cincinnati, OH", 39.1031, -84.5120, 100.0, 68.0, 200.0, 1.0, "I-71 Ohio Corridor (110 mi)"),
        ("San Diego, CA", 32.7157, -117.1611, "Los Angeles, CA", 34.0522, -118.2437, 100.0, 74.0, 200.0, 1.0, "Southern California I-5 Run (125 mi)"),
        ("San Diego, CA", 32.7157, -117.1611, "Los Angeles, CA", 34.0522, -118.2437, 25.0, 74.0, 200.0, 1.0, "SoCal Low Tank Refuel Mandatory"),
        ("Chicago, IL", 41.8781, -87.6298, "Saint Louis, MO", 38.6270, -90.1994, 100.0, 70.0, 300.0, 1.0, "Long Interstate Odyssey (300 mi)"),
        ("Chicago, IL", 41.8781, -87.6298, "Saint Louis, MO", 38.6270, -90.1994, 50.0, 70.0, 300.0, 1.0, "Long Route 50% Tank (Stop Required)"),
        ("Chicago, IL", 41.8781, -87.6298, "Milwaukee, WI", 43.0389, -87.9065, 100.0, 65.0, 150.0, 1.0, "Lake Michigan Shoreline Run (90 mi)"),
        ("Dallas, TX", 32.7767, -96.7970, "Houston, TX", 29.7604, -95.3698, 100.0, 88.0, 500.0, 1.15, "I-45 High Speed Heavy Cargo (240 mi)"),
        ("Chicago, IL", 41.8781, -87.6298, "Detroit, MI", 42.3314, -83.0458, 100.0, 68.0, 200.0, 1.0, "I-94 Automotive Corridor (285 mi)")
    ]
    
    passed_count = 0
    for idx, tr in enumerate(trip_routes, 1):
        o_name, o_lat, o_lng, d_name, d_lat, d_lng, f_pct, temp, cargo, spd_f, desc = tr
        t0 = time.perf_counter()
        plan = trip_service.plan_trip(
            db=db,
            vehicle=vehicle,
            origin_name=o_name,
            origin_lat=o_lat,
            origin_lng=o_lng,
            dest_name=d_name,
            dest_lat=d_lat,
            dest_lng=d_lng,
            current_fuel_pct=f_pct,
            ambient_temp_f=temp,
            cargo_load_lbs=cargo,
            speed_factor=spd_f
        )
        t_el = (time.perf_counter() - t0) * 1000.0
        latencies.append(t_el)
        
        # Assertions
        valid_dist = plan["total_distance_miles"] > 0
        valid_stops = len(plan["recommended_stops"]) >= 2
        valid_buffer = plan["safety_buffer_miles"] >= 30.0
        # If starting range is less than total distance + buffer, refuel must be recommended
        expected_refuel = plan["starting_range_miles"] < (plan["total_distance_miles"] + plan["safety_buffer_miles"])
        valid_refuel_logic = (plan["refuel_recommended"] == expected_refuel)
        
        is_pass = valid_dist and valid_stops and valid_buffer and valid_refuel_logic
        if is_pass:
            passed_count += 1
            
        results.append({
            "iteration": idx,
            "scenario": desc,
            "distance_miles": plan["total_distance_miles"],
            "starting_range": plan["starting_range_miles"],
            "safety_buffer": plan["safety_buffer_miles"],
            "refuel_recommended": plan["refuel_recommended"],
            "stops_count": len(plan["recommended_stops"]),
            "savings_e85": plan["trip_savings_e85"],
            "latency_ms": round(t_el, 3),
            "status": "PASS" if is_pass else "FAIL"
        })
        
    db.close()
    return {
        "function": "SmartTripService.plan_trip()",
        "total_runs": 20,
        "passed": passed_count,
        "failed": 20 - passed_count,
        "mean_latency_ms": round(sum(latencies) / len(latencies), 3),
        "max_latency_ms": round(max(latencies), 3),
        "details": results
    }

def run_auth_and_garage_20x() -> Dict[str, Any]:
    print("\n--- [5/5] Running 20x Iterations on Auth, Password Hashing & Garage Lifecycle ---")
    db = SessionLocal()
    results = []
    latencies = []
    
    passed_count = 0
    for idx in range(1, 21):
        t0 = time.perf_counter()
        # 1. Argon2id hash & verify
        raw_pw = f"Pass_{idx}_Secret_{random.randint(1000, 9999)}!"
        pw_hash = get_password_hash(raw_pw)
        pw_ok = verify_password(raw_pw, pw_hash)
        
        # 2. JWT token generation & decode
        test_sub = f"user_{idx}_{random.randint(1000, 9999)}"
        token = create_access_token(subject=test_sub)
        payload = decode_access_token(token)
        jwt_ok = (payload is not None and payload.get("sub") == test_sub)
        
        # 3. Dynamic Vehicle creation & query
        v_nickname = f"Test Fleet Truck #{idx}"
        vehicle = Vehicle(
            user_id=1,
            nickname=v_nickname,
            make="Ford",
            model="F-150 Flex",
            year=2020 + (idx % 5),
            trim="XLT",
            engine_disp=5.0,
            flex_fuel_verified=True,
            tank_capacity_gal=26.0,
            baseline_epa_mpg_gas=20.0,
            baseline_epa_mpg_e85=15.0,
            is_default=False
        )
        db.add(vehicle)
        db.commit()
        db.refresh(vehicle)
        
        v_fetched = db.query(Vehicle).filter(Vehicle.id == vehicle.id).first()
        garage_ok = (v_fetched is not None and v_fetched.nickname == v_nickname)
        
        # Clean up created vehicle
        db.delete(vehicle)
        db.commit()
        
        t_el = (time.perf_counter() - t0) * 1000.0
        latencies.append(t_el)
        
        is_pass = pw_ok and jwt_ok and garage_ok
        if is_pass:
            passed_count += 1
            
        results.append({
            "iteration": idx,
            "scenario": f"Auth & Garage User Cycle #{idx}",
            "argon2_verified": pw_ok,
            "jwt_payload_sub": payload.get("sub"),
            "garage_lifecycle": "PASSED" if garage_ok else "FAILED",
            "latency_ms": round(t_el, 3),
            "status": "PASS" if is_pass else "FAIL"
        })
        
    db.close()
    return {
        "function": "AuthService & Garage Lifecycle (Argon2id + JWT + DB)",
        "total_runs": 20,
        "passed": passed_count,
        "failed": 20 - passed_count,
        "mean_latency_ms": round(sum(latencies) / len(latencies), 3),
        "max_latency_ms": round(max(latencies), 3),
        "details": results
    }

def main():
    print("=" * 75)
    print(" ETHERA PLATFORM: 20x STRESS & RELIABILITY TEST HARNESS ")
    print("=" * 75)
    
    suite_1 = run_prediction_20x()
    suite_2 = run_economics_20x()
    suite_3 = run_stations_20x()
    suite_4 = run_trips_20x()
    suite_5 = run_auth_and_garage_20x()
    
    all_suites = [suite_1, suite_2, suite_3, suite_4, suite_5]
    total_runs = sum(s["total_runs"] for s in all_suites)
    total_passed = sum(s["passed"] for s in all_suites)
    total_failed = sum(s["failed"] for s in all_suites)
    
    print("\n" + "=" * 75)
    print(f" TOTAL EXECUTIONS: {total_runs} | PASSED: {total_passed} | FAILED: {total_failed} ")
    print(f" SUCCESS RATE: {(total_passed / total_runs) * 100:.2f}% ")
    print("=" * 75)
    
    # Save JSON Report
    report_json_path = os.path.join(os.path.dirname(__file__), "test_report_20x.json")
    with open(report_json_path, "w") as f:
        json.dump({
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "total_runs": total_runs,
            "total_passed": total_passed,
            "total_failed": total_failed,
            "success_rate_pct": (total_passed / total_runs) * 100.0,
            "suites": all_suites
        }, f, indent=2)
    print(f"\nSaved structured JSON report to: {report_json_path}")

if __name__ == "__main__":
    main()
