from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models import User, Vehicle, FuelLog
from app.schemas import VehicleCreate, VehicleUpdate, VehicleResponse, FuelLogCreate, FuelLogResponse
from app.api.deps import get_current_user_required

router = APIRouter(prefix="/vehicles", tags=["Vehicle Garage"])

@router.get("", response_model=List[VehicleResponse])
def get_user_vehicles(
    user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db)
):
    """Retrieve all vehicles in user's garage."""
    return db.query(Vehicle).filter(Vehicle.user_id == user.id).all()

@router.post("", response_model=VehicleResponse, status_code=status.HTTP_201_CREATED)
def create_vehicle(
    vehicle_in: VehicleCreate,
    user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db)
):
    """Add a new vehicle to user garage."""
    # If set as default, reset others
    if vehicle_in.is_default:
        db.query(Vehicle).filter(Vehicle.user_id == user.id).update({"is_default": False})
        db.commit()
    
    vehicle = Vehicle(
        user_id=user.id,
        nickname=vehicle_in.nickname,
        make=vehicle_in.make,
        model=vehicle_in.model,
        year=vehicle_in.year,
        trim=vehicle_in.trim,
        engine_disp=vehicle_in.engine_disp,
        flex_fuel_verified=vehicle_in.flex_fuel_verified,
        tank_capacity_gal=vehicle_in.tank_capacity_gal,
        baseline_epa_mpg_gas=vehicle_in.baseline_epa_mpg_gas,
        baseline_epa_mpg_e85=vehicle_in.baseline_epa_mpg_e85,
        user_reported_mpg=vehicle_in.user_reported_mpg,
        preferred_units=vehicle_in.preferred_units,
        preferred_currency=vehicle_in.preferred_currency,
        is_default=vehicle_in.is_default
    )
    db.add(vehicle)
    db.commit()
    db.refresh(vehicle)
    return vehicle

@router.get("/{vehicle_id}", response_model=VehicleResponse)
def get_vehicle(
    vehicle_id: int,
    user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db)
):
    """Retrieve vehicle details by ID."""
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id, Vehicle.user_id == user.id).first()
    if not vehicle:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found.")
    return vehicle

@router.put("/{vehicle_id}", response_model=VehicleResponse)
def update_vehicle(
    vehicle_id: int,
    vehicle_in: VehicleUpdate,
    user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db)
):
    """Update vehicle specifications or preferences."""
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id, Vehicle.user_id == user.id).first()
    if not vehicle:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found.")
        
    update_data = vehicle_in.model_dump(exclude_unset=True)
    
    if update_data.get("is_default"):
        db.query(Vehicle).filter(Vehicle.user_id == user.id).update({"is_default": False})
        
    for field, val in update_data.items():
        setattr(vehicle, field, val)
        
    db.commit()
    db.refresh(vehicle)
    return vehicle

@router.delete("/{vehicle_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_vehicle(
    vehicle_id: int,
    user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db)
):
    """Remove vehicle from garage."""
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id, Vehicle.user_id == user.id).first()
    if not vehicle:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found.")
    db.delete(vehicle)
    db.commit()
    return None

# Fuel Logs
@router.get("/{vehicle_id}/fuel-logs", response_model=List[FuelLogResponse])
def get_fuel_logs(
    vehicle_id: int,
    user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db)
):
    """Get all fuel logs for a vehicle."""
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id, Vehicle.user_id == user.id).first()
    if not vehicle:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found.")
    return db.query(FuelLog).filter(FuelLog.vehicle_id == vehicle_id).order_by(FuelLog.timestamp.desc()).all()

@router.post("/{vehicle_id}/fuel-logs", response_model=FuelLogResponse, status_code=status.HTTP_201_CREATED)
def add_fuel_log(
    vehicle_id: int,
    log_in: FuelLogCreate,
    user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db)
):
    """Record a new refueling log."""
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id, Vehicle.user_id == user.id).first()
    if not vehicle:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found.")
        
    total_cost = round(log_in.gallons_filled * log_in.price_per_gal, 2)
    calculated_mpg = None
    if log_in.trip_miles_observed and log_in.trip_miles_observed > 0 and log_in.gallons_filled > 0:
        calculated_mpg = round(log_in.trip_miles_observed / log_in.gallons_filled, 2)
        
    fuel_log = FuelLog(
        user_id=user.id,
        vehicle_id=vehicle.id,
        fuel_type=log_in.fuel_type,
        gallons_filled=log_in.gallons_filled,
        price_per_gal=log_in.price_per_gal,
        total_cost=total_cost,
        odometer_miles=log_in.odometer_miles,
        trip_miles_observed=log_in.trip_miles_observed,
        calculated_mpg=calculated_mpg,
        ethanol_percent=log_in.ethanol_percent,
        station_name=log_in.station_name,
        notes=log_in.notes,
        timestamp=datetime.now(timezone.utc)
    )
    db.add(fuel_log)
    db.commit()
    db.refresh(fuel_log)
    return fuel_log
