import json
from datetime import datetime, timezone
from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models import Vehicle, PredictionLog
from app.schemas import PredictionRequest, PredictionResponse, FactorContribution
from app.ml.prediction_engine import prediction_engine
from app.api.deps import get_current_user

router = APIRouter(prefix="/prediction", tags=["AI Prediction Engine"])

@router.post("/predict", response_model=PredictionResponse)
def generate_prediction(
    req: PredictionRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Generate AI-driven E85 mileage prediction and remaining driving range.
    Includes 90% confidence intervals and transparent physics-based factor contributions.
    """
    vehicle = db.query(Vehicle).filter(Vehicle.id == req.vehicle_id).first()
    if not vehicle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Vehicle with ID {req.vehicle_id} not found."
        )
        
    # Run prediction
    result = prediction_engine.predict(
        engine_disp=vehicle.engine_disp or 5.0,
        baseline_epa_mpg_gas=vehicle.baseline_epa_mpg_gas,
        baseline_epa_mpg_e85=vehicle.baseline_epa_mpg_e85,
        ethanol_percent=req.ethanol_percent,
        city_highway_split=req.city_highway_split,
        avg_speed_mph=req.avg_speed_mph,
        ambient_temp_f=req.ambient_temp_f,
        terrain_elevation_grade=req.terrain_elevation_grade,
        vehicle_load_lbs=req.vehicle_load_lbs,
        ac_active=req.ac_active,
        tank_capacity_gal=vehicle.tank_capacity_gal,
        current_fuel_gallons=req.current_fuel_gallons
    )
    
    # Log prediction if user is logged in
    if current_user:
        pred_log = PredictionLog(
            user_id=current_user.id,
            vehicle_id=vehicle.id,
            predicted_mpg=result["predicted_mpg"],
            estimated_range_miles=result["estimated_range_miles"],
            confidence_lower=result["confidence_lower_range"],
            confidence_upper=result["confidence_upper_range"],
            confidence_score=result["confidence_score"],
            input_features_json=json.dumps(req.model_dump()),
            factors_json=json.dumps(result["factors"]),
            model_version=result["model_version"],
            created_at=datetime.now(timezone.utc)
        )
        db.add(pred_log)
        db.commit()
        
    factors_list = [
        FactorContribution(
            factor=f["factor"],
            impact_pct=f["impact_pct"],
            direction=f["direction"],
            description=f["description"]
        )
        for f in result["factors"]
    ]
    
    return PredictionResponse(
        vehicle_id=vehicle.id,
        fuel_type=req.fuel_type,
        predicted_mpg=result["predicted_mpg"],
        estimated_range_miles=result["estimated_range_miles"],
        confidence_lower_mpg=result["confidence_lower_mpg"],
        confidence_upper_mpg=result["confidence_upper_mpg"],
        confidence_lower_range=result["confidence_lower_range"],
        confidence_upper_range=result["confidence_upper_range"],
        confidence_score=result["confidence_score"],
        model_version=result["model_version"],
        is_cold_start=result["is_cold_start"],
        factors=factors_list,
        notes=result["notes"],
        timestamp=datetime.now(timezone.utc)
    )

@router.get("/metrics")
def get_model_metrics():
    """Retrieve verified evaluation metrics on held-out test splits."""
    return {
        "model_version": prediction_engine.metrics.get("version", "ethera-v1.0-gbm"),
        "algorithm": "Gradient Boosting Regressor (140 estimators, max_depth=4)",
        "features": prediction_engine.feature_names,
        "metrics": prediction_engine.metrics,
        "uncertainty_method": "Empirical Residual Distribution (90% Gaussian Interval)",
        "residual_std_mpg": prediction_engine.residual_std,
        "last_trained": "Active In-Memory / Calibrated"
    }
