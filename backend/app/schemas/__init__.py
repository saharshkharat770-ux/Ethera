from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, EmailStr, Field, ConfigDict

# ----------------- User Schemas -----------------
class UserBase(BaseModel):
    email: str
    full_name: str

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

class UserLogin(BaseModel):
    email: str
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None

class UserResponse(UserBase):
    id: int
    is_active: bool
    is_verified: bool
    role: str
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# ----------------- Vehicle Schemas -----------------
class VehicleBase(BaseModel):
    nickname: str
    make: str
    model: str
    year: int
    trim: Optional[str] = None
    engine_disp: Optional[float] = 5.0
    flex_fuel_verified: bool = True
    tank_capacity_gal: float = 24.0
    baseline_epa_mpg_gas: float = 20.0
    baseline_epa_mpg_e85: float = 15.0
    user_reported_mpg: Optional[float] = None
    preferred_units: str = "imperial"
    preferred_currency: str = "USD"
    is_default: bool = False

class VehicleCreate(VehicleBase):
    pass

class VehicleUpdate(BaseModel):
    nickname: Optional[str] = None
    baseline_epa_mpg_gas: Optional[float] = None
    baseline_epa_mpg_e85: Optional[float] = None
    user_reported_mpg: Optional[float] = None
    tank_capacity_gal: Optional[float] = None
    preferred_units: Optional[str] = None
    preferred_currency: Optional[str] = None
    is_default: Optional[bool] = None

class VehicleResponse(VehicleBase):
    id: int
    user_id: int
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


# ----------------- Fuel Log Schemas -----------------
class FuelLogCreate(BaseModel):
    vehicle_id: int
    fuel_type: str = "E85"
    gallons_filled: float = Field(..., gt=0)
    price_per_gal: float = Field(..., gt=0)
    odometer_miles: float = Field(..., gt=0)
    trip_miles_observed: Optional[float] = None
    ethanol_percent: Optional[float] = 85.0
    station_name: Optional[str] = None
    notes: Optional[str] = None

class FuelLogResponse(BaseModel):
    id: int
    vehicle_id: int
    fuel_type: str
    gallons_filled: float
    price_per_gal: float
    total_cost: float
    odometer_miles: float
    trip_miles_observed: Optional[float]
    calculated_mpg: Optional[float]
    ethanol_percent: Optional[float]
    station_name: Optional[str]
    notes: Optional[str]
    timestamp: datetime
    
    model_config = ConfigDict(from_attributes=True)


# ----------------- Prediction Schemas -----------------
class PredictionRequest(BaseModel):
    vehicle_id: int
    fuel_type: str = "E85"
    city_highway_split: float = Field(0.5, ge=0.0, le=1.0)  # 0.0 = 100% city, 1.0 = 100% highway
    avg_speed_mph: float = Field(48.0, ge=10.0, le=100.0)
    ambient_temp_f: float = Field(72.0, ge=-20.0, le=125.0)
    terrain_elevation_grade: float = Field(0.0, ge=-10.0, le=10.0)  # % grade
    vehicle_load_lbs: float = Field(200.0, ge=0.0, le=3000.0)
    ac_active: bool = False
    ethanol_percent: float = Field(85.0, ge=0.0, le=100.0)
    current_fuel_gallons: Optional[float] = None

class FactorContribution(BaseModel):
    factor: str
    impact_pct: float
    direction: str  # "positive", "negative", "neutral"
    description: str

class PredictionResponse(BaseModel):
    vehicle_id: int
    fuel_type: str
    predicted_mpg: float
    estimated_range_miles: float
    confidence_lower_mpg: float
    confidence_upper_mpg: float
    confidence_lower_range: float
    confidence_upper_range: float
    confidence_score: float
    model_version: str
    is_cold_start: bool
    factors: List[FactorContribution]
    notes: str
    timestamp: datetime


# ----------------- Economics Schemas -----------------
class EconomicsComparisonRequest(BaseModel):
    vehicle_id: int
    e85_price_per_gal: float = Field(..., gt=0.1)
    gas_price_per_gal: float = Field(..., gt=0.1)
    annual_miles: float = Field(15000.0, gt=100)
    trip_distance_miles: Optional[float] = None
    custom_e85_mpg: Optional[float] = None
    custom_gas_mpg: Optional[float] = None

class EconomicsComparisonResponse(BaseModel):
    vehicle_id: int
    e85_price_per_gal: float
    gas_price_per_gal: float
    price_discount_pct: float
    e85_mpg: float
    gas_mpg: float
    energy_density_penalty_pct: float
    break_even_e85_price: float
    is_e85_economical: bool
    cost_per_mile_e85: float
    cost_per_mile_gas: float
    cost_per_100_miles_e85: float
    cost_per_100_miles_gas: float
    annual_fuel_cost_e85: float
    annual_fuel_cost_gas: float
    annual_savings_amount: float
    annual_savings_pct: float
    trip_cost_e85: Optional[float] = None
    trip_cost_gas: Optional[float] = None
    co2_lifecycle_saving_lbs: float
    co2_methodology_disclosure: str


# ----------------- Station Schemas -----------------
class StationResponse(BaseModel):
    id: int
    name: str
    brand: str
    address: str
    city: str
    state: str
    postal_code: str
    latitude: float
    longitude: float
    has_e85: bool
    e85_price: float
    gas_price: float
    price_updated_at: datetime
    verified: bool
    rating: float
    amenities: List[str]
    distance_miles: Optional[float] = None
    
    model_config = ConfigDict(from_attributes=True)

class StationSearchQuery(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    radius_miles: float = Field(25.0, gt=0, le=250)
    has_e85: bool = True
    max_results: int = Field(20, ge=1, le=100)

class StationPriceUpdate(BaseModel):
    station_id: int
    e85_price: Optional[float] = None
    gas_price: Optional[float] = None


# ----------------- Trip Schemas -----------------
class TripPlanRequest(BaseModel):
    vehicle_id: int
    origin_name: str
    origin_lat: float
    origin_lng: float
    dest_name: str
    dest_lat: float
    dest_lng: float
    current_fuel_pct: float = Field(100.0, ge=0.0, le=100.0)
    ambient_temp_f: float = 72.0
    cargo_load_lbs: float = 200.0
    speed_factor: float = Field(1.0, ge=0.7, le=1.4)  # 1.0 = standard cruising

class WaypointStop(BaseModel):
    stop_name: str
    station_id: Optional[int]
    mile_marker: float
    action: str  # "refuel", "waypoint", "destination"
    estimated_fuel_remaining_pct: float
    notes: str

class TripPlanResponse(BaseModel):
    origin_name: str
    dest_name: str
    total_distance_miles: float
    estimated_driving_time_minutes: int
    predicted_e85_mpg: float
    total_fuel_gallons_needed: float
    starting_range_miles: float
    can_complete_without_refuel: bool
    safety_buffer_miles: float
    refuel_recommended: bool
    recommended_stops: List[WaypointStop]
    estimated_cost_e85: float
    estimated_cost_gas: float
    trip_savings_e85: float
    elevation_grade_impact_pct: float
    weather_impact_pct: float


# ----------------- Dashboard & Insights Schemas -----------------
class DrivingInsightItem(BaseModel):
    id: str
    category: str  # "efficiency", "savings", "maintenance", "weather"
    severity: str  # "info", "warning", "success", "tip"
    title: str
    description: str
    action_label: Optional[str] = None
    metric_delta: Optional[str] = None

class DashboardOverviewResponse(BaseModel):
    selected_vehicle: Optional[VehicleResponse]
    current_range_miles: float
    predicted_e85_mpg: float
    confidence_interval: List[float]
    cost_per_mile_e85: float
    cost_per_mile_gas: float
    cost_savings_pct: float
    historical_chart_data: List[Dict[str, Any]]
    nearby_stations: List[StationResponse]
    insights: List[DrivingInsightItem]
    recent_activity: List[Dict[str, Any]]
    data_freshness_seconds: int
