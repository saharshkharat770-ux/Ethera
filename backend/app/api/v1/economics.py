from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models import Vehicle
from app.schemas import EconomicsComparisonRequest, EconomicsComparisonResponse
from app.services.economics_service import economics_service

router = APIRouter(prefix="/economics", tags=["Fuel Economics"])

@router.post("/compare", response_model=EconomicsComparisonResponse)
def compare_fuel_economics(
    req: EconomicsComparisonRequest,
    db: Session = Depends(get_db)
):
    """
    Compare economic metrics between E85 and Regular Gasoline.
    Determines break-even price per gallon, cost-per-mile, annual savings,
    and lifecycle CO2 benefits based on Argonne GREET modeling.
    """
    vehicle = db.query(Vehicle).filter(Vehicle.id == req.vehicle_id).first()
    if not vehicle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Vehicle with ID {req.vehicle_id} not found."
        )
        
    calc = economics_service.calculate_comparison(
        e85_price_per_gal=req.e85_price_per_gal,
        gas_price_per_gal=req.gas_price_per_gal,
        baseline_e85_mpg=vehicle.baseline_epa_mpg_e85,
        baseline_gas_mpg=vehicle.baseline_epa_mpg_gas,
        annual_miles=req.annual_miles,
        trip_distance_miles=req.trip_distance_miles,
        custom_e85_mpg=req.custom_e85_mpg,
        custom_gas_mpg=req.custom_gas_mpg
    )
    
    return EconomicsComparisonResponse(
        vehicle_id=vehicle.id,
        e85_price_per_gal=calc["e85_price_per_gal"],
        gas_price_per_gal=calc["gas_price_per_gal"],
        price_discount_pct=calc["price_discount_pct"],
        e85_mpg=calc["e85_mpg"],
        gas_mpg=calc["gas_mpg"],
        energy_density_penalty_pct=calc["energy_density_penalty_pct"],
        break_even_e85_price=calc["break_even_e85_price"],
        is_e85_economical=calc["is_e85_economical"],
        cost_per_mile_e85=calc["cost_per_mile_e85"],
        cost_per_mile_gas=calc["cost_per_mile_gas"],
        cost_per_100_miles_e85=calc["cost_per_100_miles_e85"],
        cost_per_100_miles_gas=calc["cost_per_100_miles_gas"],
        annual_fuel_cost_e85=calc["annual_fuel_cost_e85"],
        annual_fuel_cost_gas=calc["annual_fuel_cost_gas"],
        annual_savings_amount=calc["annual_savings_amount"],
        annual_savings_pct=calc["annual_savings_pct"],
        trip_cost_e85=calc["trip_cost_e85"],
        trip_cost_gas=calc["trip_cost_gas"],
        co2_lifecycle_saving_lbs=calc["co2_lifecycle_saving_lbs"],
        co2_methodology_disclosure=calc["co2_methodology_disclosure"]
    )
