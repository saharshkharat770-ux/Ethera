import math
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.models import Vehicle, FuelStation
from app.services.station_service import haversine_distance_miles
from app.ml.prediction_engine import prediction_engine

ROAD_CURVATURE_FACTOR = 1.25  # Highway interstate routing factor over Haversine chord

class SmartTripService:
    @staticmethod
    def plan_trip(
        db: Session,
        vehicle: Vehicle,
        origin_name: str,
        origin_lat: float,
        origin_lng: float,
        dest_name: str,
        dest_lat: float,
        dest_lng: float,
        current_fuel_pct: float = 100.0,
        ambient_temp_f: float = 72.0,
        cargo_load_lbs: float = 200.0,
        speed_factor: float = 1.0  # 1.0 = normal cruising, 1.2 = aggressive/high-speed
    ) -> Dict[str, Any]:
        """
        Plans driving route, estimates E85 consumption, identifies range bottlenecks,
        and recommends strategic refueling stops when the range safety buffer is breached.
        """
        # Straight line distance * highway curvature
        direct_dist = haversine_distance_miles(origin_lat, origin_lng, dest_lat, dest_lng)
        total_distance = round(max(5.0, direct_dist * ROAD_CURVATURE_FACTOR), 1)
        
        # Approximate speed: cruising at ~65 mph adjusted by speed_factor
        effective_speed = min(85.0, max(45.0, 65.0 * speed_factor))
        driving_time_hours = total_distance / effective_speed
        driving_time_minutes = int(round(driving_time_hours * 60))
        
        # Predict E85 MPG for trip conditions
        pred = prediction_engine.predict(
            engine_disp=vehicle.engine_disp or 5.0,
            baseline_epa_mpg_gas=vehicle.baseline_epa_mpg_gas,
            baseline_epa_mpg_e85=vehicle.baseline_epa_mpg_e85,
            ethanol_percent=85.0,
            city_highway_split=0.85,  # mostly highway for trips
            avg_speed_mph=effective_speed,
            ambient_temp_f=ambient_temp_f,
            terrain_elevation_grade=0.5,
            vehicle_load_lbs=cargo_load_lbs,
            tank_capacity_gal=vehicle.tank_capacity_gal,
            current_fuel_gallons=(vehicle.tank_capacity_gal * (current_fuel_pct / 100.0))
        )
        
        predicted_e85_mpg = pred["predicted_mpg"]
        starting_range = pred["estimated_range_miles"]
        
        # Gallons needed
        total_gallons_needed = round(total_distance / predicted_e85_mpg, 2)
        
        # Safety buffer: 35 miles or 15% of tank capacity
        safety_buffer = round(max(30.0, vehicle.tank_capacity_gal * 0.15 * predicted_e85_mpg), 1)
        
        # Can vehicle complete trip without refueling?
        can_complete = starting_range >= (total_distance + safety_buffer)
        refuel_recommended = not can_complete
        
        # Estimated costs
        # Sample average prices if not dynamically fetched
        avg_e85_price = 2.49
        avg_gas_price = 3.39
        gas_mpg = vehicle.baseline_epa_mpg_gas * 0.95
        
        cost_e85 = round(total_gallons_needed * avg_e85_price, 2)
        cost_gas = round((total_distance / gas_mpg) * avg_gas_price, 2)
        trip_savings = round(cost_gas - cost_e85, 2)
        
        # Waypoints and refueling stops
        stops: List[Dict[str, Any]] = [
            {
                "stop_name": f"Origin: {origin_name}",
                "station_id": None,
                "mile_marker": 0.0,
                "action": "start",
                "estimated_fuel_remaining_pct": current_fuel_pct,
                "notes": f"Departing with {current_fuel_pct:.0f}% tank ({starting_range:.0f} miles estimated range)."
            }
        ]
        
        if refuel_recommended:
            # Find an E85 station midway along the route
            mid_lat = (origin_lat + dest_lat) / 2.0
            mid_lng = (origin_lng + dest_lng) / 2.0
            
            # Query all E85 stations and pick closest to route mid-point
            all_e85_stations = db.query(FuelStation).filter(FuelStation.has_e85 == True).all()
            best_station = None
            min_dist = float("inf")
            for st in all_e85_stations:
                d = haversine_distance_miles(mid_lat, mid_lng, st.latitude, st.longitude)
                if d < min_dist:
                    min_dist = d
                    best_station = st
            
            refuel_mile = round(total_distance * 0.55, 1)
            remaining_fuel_at_stop = round(max(10.0, (starting_range - refuel_mile) / starting_range * 100.0), 0)
            
            if best_station:
                stops.append({
                    "stop_name": f"{best_station.name} ({best_station.brand})",
                    "station_id": best_station.id,
                    "mile_marker": refuel_mile,
                    "action": "refuel",
                    "estimated_fuel_remaining_pct": remaining_fuel_at_stop,
                    "notes": f"Recommended E85 refuel point at Mile {refuel_mile:.0f}. Current E85: ${best_station.e85_price:.2f}/gal. Replenish to 100% to ensure safety buffer."
                })
            else:
                stops.append({
                    "stop_name": "Mid-Route Corridor Refuel Stop",
                    "station_id": None,
                    "mile_marker": refuel_mile,
                    "action": "refuel",
                    "estimated_fuel_remaining_pct": remaining_fuel_at_stop,
                    "notes": f"Safety buffer alert: refuel E85 at or before Mile {refuel_mile:.0f}."
                })
                
        stops.append({
            "stop_name": f"Destination: {dest_name}",
            "station_id": None,
            "mile_marker": total_distance,
            "action": "destination",
            "estimated_fuel_remaining_pct": 25.0 if refuel_recommended else round(max(5.0, (starting_range - total_distance) / starting_range * 100.0), 0),
            "notes": "Arrival at destination with sufficient reserve."
        })
        
        return {
            "origin_name": origin_name,
            "dest_name": dest_name,
            "total_distance_miles": total_distance,
            "estimated_driving_time_minutes": driving_time_minutes,
            "predicted_e85_mpg": predicted_e85_mpg,
            "total_fuel_gallons_needed": total_gallons_needed,
            "starting_range_miles": starting_range,
            "can_complete_without_refuel": can_complete,
            "safety_buffer_miles": safety_buffer,
            "refuel_recommended": refuel_recommended,
            "recommended_stops": stops,
            "estimated_cost_e85": cost_e85,
            "estimated_cost_gas": cost_gas,
            "trip_savings_e85": trip_savings,
            "elevation_grade_impact_pct": -2.4,
            "weather_impact_pct": 1.2 if ambient_temp_f >= 60 else -4.5
        }

trip_service = SmartTripService()
