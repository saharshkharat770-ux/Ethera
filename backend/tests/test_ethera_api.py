import pytest
import os
import sys
from fastapi.testclient import TestClient

# Ensure backend root is on path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app
from app.core.database import Base, engine, SessionLocal
from app.ml.prediction_engine import prediction_engine
from app.services.economics_service import economics_service
from app.services.station_service import station_service, haversine_distance_miles
from app.services.trip_service import trip_service
from app.models import User, Vehicle

client = TestClient(app)

@pytest.fixture(scope="module", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    station_service.seed_initial_stations(db)
    db.close()
    yield

def test_health_check():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "operational"
    assert data["service"] == "ETHERA"

def test_demo_login():
    response = client.post("/api/v1/auth/demo-login")
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "demo@ethera.ai"

def test_user_registration_and_login():
    test_email = "testdriver2026@ethera.ai"
    reg_payload = {
        "email": test_email,
        "password": "SecurePassword123!",
        "full_name": "Test Pilot"
    }
    # Clean up if existed
    reg_res = client.post("/api/v1/auth/register", json=reg_payload)
    if reg_res.status_code == 400:
        # Already registered, proceed to login
        pass
    else:
        assert reg_res.status_code == 201
        assert "access_token" in reg_res.json()
        
    login_res = client.post("/api/v1/auth/login", json={
        "email": test_email,
        "password": "SecurePassword123!"
    })
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    assert token is not None

def test_prediction_engine_accuracy_and_bounds():
    res = prediction_engine.predict(
        engine_disp=5.0,
        baseline_epa_mpg_gas=20.0,
        baseline_epa_mpg_e85=15.0,
        ethanol_percent=85.0,
        city_highway_split=0.6,
        avg_speed_mph=55.0,
        ambient_temp_f=70.0,
        terrain_elevation_grade=0.0,
        vehicle_load_lbs=200.0,
        tank_capacity_gal=26.0
    )
    assert 10.0 <= res["predicted_mpg"] <= 25.0
    assert res["estimated_range_miles"] > 150.0
    assert res["confidence_lower_mpg"] < res["predicted_mpg"] < res["confidence_upper_mpg"]
    assert len(res["factors"]) > 0

def test_economics_calculation():
    calc = economics_service.calculate_comparison(
        e85_price_per_gal=2.45,
        gas_price_per_gal=3.45,
        baseline_e85_mpg=15.0,
        baseline_gas_mpg=20.0,
        annual_miles=15000.0
    )
    # E85 cost per mile: 2.45 / 15 = 0.1633
    # Gas cost per mile: 3.45 / 20 = 0.1725
    assert calc["is_e85_economical"] is True
    assert calc["annual_savings_amount"] > 0
    assert calc["break_even_e85_price"] == round(3.45 * (15.0 / 20.0), 2)
    assert calc["co2_lifecycle_saving_lbs"] > 0

def test_station_discovery_haversine():
    # Distance between Chicago (41.8781, -87.6298) and Joliet (41.5250, -88.0817) ~ 35 miles
    dist = haversine_distance_miles(41.8781, -87.6298, 41.5250, -88.0817)
    assert 30.0 <= dist <= 42.0
    
    db = SessionLocal()
    nearby = station_service.search_nearby(db, 41.8781, -87.6298, radius_miles=40.0)
    db.close()
    assert len(nearby) > 0
    assert nearby[0]["distance_miles"] <= nearby[-1]["distance_miles"]

def test_smart_trip_range_safety_buffer():
    db = SessionLocal()
    demo_vehicle = db.query(Vehicle).first()
    assert demo_vehicle is not None
    
    # Trip from Chicago to Bloomington IL (~135 miles)
    plan = trip_service.plan_trip(
        db=db,
        vehicle=demo_vehicle,
        origin_name="Downtown Chicago, IL",
        origin_lat=41.8781,
        origin_lng=-87.6298,
        dest_name="Bloomington, IL",
        dest_lat=40.4842,
        dest_lng=-88.9937,
        current_fuel_pct=30.0  # Low fuel to trigger safety buffer refueling stop
    )
    db.close()
    
    assert plan["total_distance_miles"] > 100.0
    assert plan["refuel_recommended"] is True
    assert any(stop["action"] == "refuel" for stop in plan["recommended_stops"])

def test_dashboard_insights_endpoint():
    res = client.get("/api/v1/insights/dashboard")
    assert res.status_code == 200
    data = res.json()
    assert data["predicted_e85_mpg"] > 0
    assert data["current_range_miles"] > 0
    assert len(data["nearby_stations"]) > 0
    assert len(data["insights"]) > 0
