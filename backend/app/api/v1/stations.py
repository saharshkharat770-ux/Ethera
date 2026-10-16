from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models import FuelStation
from app.schemas import StationResponse, StationPriceUpdate
from app.services.station_service import station_service

router = APIRouter(prefix="/stations", tags=["Station Discovery"])

@router.get("/nearby", response_model=List[StationResponse])
def get_nearby_stations(
    latitude: float = Query(..., ge=-90.0, le=90.0),
    longitude: float = Query(..., ge=-180.0, le=180.0),
    radius_miles: float = Query(35.0, gt=0, le=300),
    has_e85: bool = Query(True),
    max_results: int = Query(25, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Find nearby verified E85 fuel stations using spherical geospatial proximity.
    Returns real-time or verified prices and amenity tags.
    """
    station_service.seed_initial_stations(db)
    results = station_service.search_nearby(
        db=db,
        lat=latitude,
        lon=longitude,
        radius_miles=radius_miles,
        has_e85=has_e85,
        max_results=max_results
    )
    return results

@router.get("/all", response_model=List[StationResponse])
def get_all_stations(
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    """Retrieve full station network directory."""
    station_service.seed_initial_stations(db)
    return station_service.get_all_stations(db=db, limit=limit)

@router.post("/update-price", response_model=StationResponse)
def update_station_price(
    update_in: StationPriceUpdate,
    db: Session = Depends(get_db)
):
    """Update crowdsourced or verified fuel price at a station."""
    st = db.query(FuelStation).filter(FuelStation.id == update_in.station_id).first()
    if not st:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Station with ID {update_in.station_id} not found."
        )
        
    if update_in.e85_price is not None:
        st.e85_price = round(update_in.e85_price, 2)
    if update_in.gas_price is not None:
        st.gas_price = round(update_in.gas_price, 2)
        
    st.price_updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(st)
    
    amenities = [a.strip() for a in (st.amenities or "").split(",") if a.strip()]
    return {
        "id": st.id,
        "name": st.name,
        "brand": st.brand,
        "address": st.address,
        "city": st.city,
        "state": st.state,
        "postal_code": st.postal_code,
        "latitude": st.latitude,
        "longitude": st.longitude,
        "has_e85": st.has_e85,
        "e85_price": st.e85_price,
        "gas_price": st.gas_price,
        "price_updated_at": st.price_updated_at,
        "verified": st.verified,
        "rating": st.rating,
        "amenities": amenities,
        "distance_miles": None
    }
