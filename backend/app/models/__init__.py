from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

def utcnow():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=True)
    role = Column(String(50), default="driver")  # driver, fleet_manager, admin
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)
    
    vehicles = relationship("Vehicle", back_populates="user", cascade="all, delete-orphan")
    fuel_logs = relationship("FuelLog", back_populates="user", cascade="all, delete-orphan")
    prediction_logs = relationship("PredictionLog", back_populates="user", cascade="all, delete-orphan")
    trips = relationship("PlannedTrip", back_populates="user", cascade="all, delete-orphan")


class Vehicle(Base):
    __tablename__ = "vehicles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    nickname = Column(String(100), nullable=False)
    make = Column(String(100), nullable=False)
    model = Column(String(100), nullable=False)
    year = Column(Integer, nullable=False)
    trim = Column(String(100), nullable=True)
    engine_disp = Column(Float, nullable=True)  # e.g. 5.0 Liters
    flex_fuel_verified = Column(Boolean, default=True)
    tank_capacity_gal = Column(Float, nullable=False, default=24.0)
    baseline_epa_mpg_gas = Column(Float, nullable=False, default=20.0)
    baseline_epa_mpg_e85 = Column(Float, nullable=False, default=15.0)
    user_reported_mpg = Column(Float, nullable=True)
    preferred_units = Column(String(20), default="imperial")  # imperial / metric
    preferred_currency = Column(String(10), default="USD")
    is_default = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utcnow)
    
    user = relationship("User", back_populates="vehicles")
    fuel_logs = relationship("FuelLog", back_populates="vehicle", cascade="all, delete-orphan")
    prediction_logs = relationship("PredictionLog", back_populates="vehicle", cascade="all, delete-orphan")


class FuelLog(Base):
    __tablename__ = "fuel_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False)
    fuel_type = Column(String(50), nullable=False, default="E85")  # E85, E10_GAS, E15, E70_WINTER
    gallons_filled = Column(Float, nullable=False)
    price_per_gal = Column(Float, nullable=False)
    total_cost = Column(Float, nullable=False)
    odometer_miles = Column(Float, nullable=False)
    trip_miles_observed = Column(Float, nullable=True)
    calculated_mpg = Column(Float, nullable=True)
    ethanol_percent = Column(Float, nullable=True, default=85.0)
    station_name = Column(String(150), nullable=True)
    notes = Column(String(255), nullable=True)
    timestamp = Column(DateTime, default=utcnow)
    
    user = relationship("User", back_populates="fuel_logs")
    vehicle = relationship("Vehicle", back_populates="fuel_logs")


class PredictionLog(Base):
    __tablename__ = "prediction_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False)
    predicted_mpg = Column(Float, nullable=False)
    estimated_range_miles = Column(Float, nullable=False)
    confidence_lower = Column(Float, nullable=False)
    confidence_upper = Column(Float, nullable=False)
    confidence_score = Column(Float, nullable=False, default=0.92)
    input_features_json = Column(Text, nullable=True)
    factors_json = Column(Text, nullable=True)
    model_version = Column(String(50), nullable=False, default="ethera-v1.0-gbm")
    created_at = Column(DateTime, default=utcnow)
    
    user = relationship("User", back_populates="prediction_logs")
    vehicle = relationship("Vehicle", back_populates="prediction_logs")


class FuelStation(Base):
    __tablename__ = "fuel_stations"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    brand = Column(String(100), nullable=False)
    address = Column(String(255), nullable=False)
    city = Column(String(100), nullable=False)
    state = Column(String(50), nullable=False)
    postal_code = Column(String(20), nullable=False)
    latitude = Column(Float, nullable=False, index=True)
    longitude = Column(Float, nullable=False, index=True)
    has_e85 = Column(Boolean, default=True)
    e85_price = Column(Float, nullable=False, default=2.69)
    gas_price = Column(Float, nullable=False, default=3.49)
    price_updated_at = Column(DateTime, default=utcnow)
    verified = Column(Boolean, default=True)
    rating = Column(Float, default=4.8)
    amenities = Column(String(255), default="EV_air,convenience_store,restrooms,car_wash")


class PlannedTrip(Base):
    __tablename__ = "planned_trips"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False)
    origin_name = Column(String(200), nullable=False)
    origin_lat = Column(Float, nullable=False)
    origin_lng = Column(Float, nullable=False)
    dest_name = Column(String(200), nullable=False)
    dest_lat = Column(Float, nullable=False)
    dest_lng = Column(Float, nullable=False)
    distance_miles = Column(Float, nullable=False)
    predicted_fuel_consumed_gal = Column(Float, nullable=False)
    estimated_cost_e85 = Column(Float, nullable=False)
    estimated_cost_gas = Column(Float, nullable=False)
    refuel_recommended = Column(Boolean, default=False)
    recommended_station_id = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=utcnow)
    
    user = relationship("User", back_populates="trips")
