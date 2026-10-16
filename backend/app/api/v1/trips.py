from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models import Vehicle
from app.schemas import TripPlanRequest, TripPlanResponse, WaypointStop
from app.services.trip_service import trip_service
from app.services.station_service import station_service

router = APIRouter(prefix="/trips", tags=["Trip Navigation & Range Planning"])

@router.post("/plan", response_model=TripPlanResponse)
def plan_trip(
    req: TripPlanRequest,
    db: Session = Depends(get_db)
):
    """
    Plan a long-distance trip with flex-fuel range intelligence,
    range safety buffer validation, and optimal refueling stop recommendations.
    """
    station_service.seed_initial_stations(db)
    
    vehicle = db.query(Vehicle).filter(Vehicle.id == req.vehicle_id).first()
    if not vehicle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Vehicle with ID {req.vehicle_id} not found."
        )
        
    plan = trip_service.plan_trip(
        db=db,
        vehicle=vehicle,
        origin_name=req.origin_name,
        origin_lat=req.origin_lat,
        origin_lng=req.origin_lng,
        dest_name=req.dest_name,
        dest_lat=req.dest_lat,
        dest_lng=req.dest_lng,
        current_fuel_pct=req.current_fuel_pct,
        ambient_temp_f=req.ambient_temp_f,
        cargo_load_lbs=req.cargo_load_lbs,
        speed_factor=req.speed_factor
    )
    
    stops_list = [
        WaypointStop(
            stop_name=s["stop_name"],
            station_id=s["station_id"],
            mile_marker=s["mile_marker"],
            action=s["action"],
            estimated_fuel_remaining_pct=s["estimated_fuel_remaining_pct"],
            notes=s["notes"]
        )
        for s in plan["recommended_stops"]
    ]
    
    return TripPlanResponse(
        origin_name=plan["origin_name"],
        dest_name=plan["dest_name"],
        total_distance_miles=plan["total_distance_miles"],
        estimated_driving_time_minutes=plan["estimated_driving_time_minutes"],
        predicted_e85_mpg=plan["predicted_e85_mpg"],
        total_fuel_gallons_needed=plan["total_fuel_gallons_needed"],
        starting_range_miles=plan["starting_range_miles"],
        can_complete_without_refuel=plan["can_complete_without_refuel"],
        safety_buffer_miles=plan["safety_buffer_miles"],
        refuel_recommended=plan["refuel_recommended"],
        recommended_stops=stops_list,
        estimated_cost_e85=plan["estimated_cost_e85"],
        estimated_cost_gas=plan["estimated_cost_gas"],
        trip_savings_e85=plan["trip_savings_e85"],
        elevation_grade_impact_pct=plan["elevation_grade_impact_pct"],
        weather_impact_pct=plan["weather_impact_pct"]
    )
