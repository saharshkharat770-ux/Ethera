import math
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models import FuelStation

EARTH_RADIUS_MILES = 3958.8

def haversine_distance_miles(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great circle distance between two points on Earth in miles.
    """
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    
    a = math.sin(delta_phi / 2.0) ** 2 + \
        math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    
    return round(EARTH_RADIUS_MILES * c, 2)

INITIAL_STATIONS = [
    # Midwest - Chicago / Illinois Hub
    {
        "name": "Thorntons Fuel & Travel Center #412",
        "brand": "Thorntons",
        "address": "2225 S Cicero Ave",
        "city": "Chicago",
        "state": "IL",
        "postal_code": "60804",
        "latitude": 41.8500,
        "longitude": -87.7444,
        "has_e85": True,
        "e85_price": 2.49,
        "gas_price": 3.45,
        "verified": True,
        "rating": 4.8,
        "amenities": "High-Flow_Nozzles,Restrooms,Convenience_Store,Coffee_Bar,DEF_At_Pump"
    },
    {
        "name": "Kwik Star Express #882",
        "brand": "Kwik Star",
        "address": "1401 N Main St",
        "city": "Rockford",
        "state": "IL",
        "postal_code": "61103",
        "latitude": 42.2856,
        "longitude": -89.0872,
        "has_e85": True,
        "e85_price": 2.42,
        "gas_price": 3.39,
        "verified": True,
        "rating": 4.9,
        "amenities": "High-Flow_Nozzles,Fresh_Bakery,Restrooms,Car_Wash,Free_Air"
    },
    {
        "name": "Casey's General Store #341",
        "brand": "Casey's",
        "address": "1200 W Jefferson St",
        "city": "Joliet",
        "state": "IL",
        "postal_code": "60435",
        "latitude": 41.5250,
        "longitude": -88.1180,
        "has_e85": True,
        "e85_price": 2.55,
        "gas_price": 3.49,
        "verified": True,
        "rating": 4.7,
        "amenities": "Pizza_Kitchen,Restrooms,Truck_Parking,Air_Pump"
    },
    # Midwest - Minneapolis / St. Paul Hub
    {
        "name": "Holiday Stationstores #119",
        "brand": "Holiday",
        "address": "1801 Washington Ave S",
        "city": "Minneapolis",
        "state": "MN",
        "postal_code": "55454",
        "latitude": 44.9730,
        "longitude": -93.2450,
        "has_e85": True,
        "e85_price": 2.39,
        "gas_price": 3.35,
        "verified": True,
        "rating": 4.7,
        "amenities": "Car_Wash,Touchless_Pay,Coffee,Restrooms"
    },
    {
        "name": "Kwik Trip #704",
        "brand": "Kwik Trip",
        "address": "6200 78th St W",
        "city": "Bloomington",
        "state": "MN",
        "postal_code": "55438",
        "latitude": 44.8625,
        "longitude": -93.3610,
        "has_e85": True,
        "e85_price": 2.35,
        "gas_price": 3.29,
        "verified": True,
        "rating": 4.9,
        "amenities": "Free_Air,High_Flow,Clean_Restrooms,Bakery,ATM"
    },
    # Texas - Dallas-Fort Worth / Interstate Corridors
    {
        "name": "Buc-ee's Travel Center #44",
        "brand": "Buc-ee's",
        "address": "15901 I-35W",
        "city": "Fort Worth",
        "state": "TX",
        "postal_code": "76177",
        "latitude": 33.0035,
        "longitude": -97.3090,
        "has_e85": True,
        "e85_price": 2.29,
        "gas_price": 3.09,
        "verified": True,
        "rating": 5.0,
        "amenities": "Super_Clean_Restrooms,100_Pumps,BBQ,EV_Charging,DEF"
    },
    {
        "name": "QuikTrip #920",
        "brand": "QuikTrip",
        "address": "2601 Stemmons Fwy",
        "city": "Dallas",
        "state": "TX",
        "postal_code": "75207",
        "latitude": 32.7980,
        "longitude": -96.8285,
        "has_e85": True,
        "e85_price": 2.39,
        "gas_price": 3.19,
        "verified": True,
        "rating": 4.8,
        "amenities": "Kitchens,Drive_Thru_Air,Restrooms,Diesel"
    },
    {
        "name": "RaceTrac #2450",
        "brand": "RaceTrac",
        "address": "4001 E Airport Fwy",
        "city": "Irving",
        "state": "TX",
        "postal_code": "75062",
        "latitude": 32.8390,
        "longitude": -96.9360,
        "has_e85": True,
        "e85_price": 2.35,
        "gas_price": 3.15,
        "verified": True,
        "rating": 4.6,
        "amenities": "Swirl_World,Restrooms,Hot_Food,ATM"
    },
    # California - Central Valley & Bay Area
    {
        "name": "Pearson Fuels E85 Flex Fuel Hub",
        "brand": "Pearson Fuels",
        "address": "3901 University Ave",
        "city": "San Diego",
        "state": "CA",
        "postal_code": "92105",
        "latitude": 32.7485,
        "longitude": -117.1080,
        "has_e85": True,
        "e85_price": 2.99,
        "gas_price": 4.89,
        "verified": True,
        "rating": 4.9,
        "amenities": "Dedicated_E85_Dispensers,Air,Restrooms,Water"
    },
    {
        "name": "Propel Fuels Clean Fuel Point",
        "brand": "Propel",
        "address": "1298 N 1st St",
        "city": "San Jose",
        "state": "CA",
        "postal_code": "95112",
        "latitude": 37.3560,
        "longitude": -121.9015,
        "has_e85": True,
        "e85_price": 3.19,
        "gas_price": 4.99,
        "verified": True,
        "rating": 4.7,
        "amenities": "Clean_Diesel,E85,Contactless_Pay"
    },
    {
        "name": "Chevron & Pearson Fuels E85",
        "brand": "Chevron",
        "address": "1000 E 7th St",
        "city": "Los Angeles",
        "state": "CA",
        "postal_code": "90021",
        "latitude": 34.0375,
        "longitude": -118.2410,
        "has_e85": True,
        "e85_price": 3.09,
        "gas_price": 4.85,
        "verified": True,
        "rating": 4.6,
        "amenities": "Techron,Convenience,Air_Water,Card_Lock"
    },
    # Iowa / Des Moines (Corn Belt Epicenter)
    {
        "name": "Kum & Go Fresh Market #501",
        "brand": "Kum & Go",
        "address": "1200 Westown Pkwy",
        "city": "West Des Moines",
        "state": "IA",
        "postal_code": "50266",
        "latitude": 41.5880,
        "longitude": -93.7380,
        "has_e85": True,
        "e85_price": 2.19,
        "gas_price": 3.12,
        "verified": True,
        "rating": 4.9,
        "amenities": "Ethanol_Blends_E15_E30_E85,Bakery,Restrooms"
    },
    # Indiana - Indianapolis
    {
        "name": "Meijer Gas Station #132",
        "brand": "Meijer",
        "address": "5325 E Southport Rd",
        "city": "Indianapolis",
        "state": "IN",
        "postal_code": "46237",
        "latitude": 39.6645,
        "longitude": -86.0770,
        "has_e85": True,
        "e85_price": 2.45,
        "gas_price": 3.39,
        "verified": True,
        "rating": 4.7,
        "amenities": "Groceries,Air,Restrooms,Pay_At_Pump"
    },
    # Ohio - Columbus
    {
        "name": "Sheetz Fuel & Café #580",
        "brand": "Sheetz",
        "address": "5221 Tuttle Crossing Blvd",
        "city": "Dublin",
        "state": "OH",
        "postal_code": "43016",
        "latitude": 40.0980,
        "longitude": -83.1490,
        "has_e85": True,
        "e85_price": 2.48,
        "gas_price": 3.42,
        "verified": True,
        "rating": 4.8,
        "amenities": "MTO_Touchscreen_Ordering,Clean_Restrooms,DEF"
    },
    # Florida - Orlando / Tampa
    {
        "name": "Wawa Fuel Center #5172",
        "brand": "Wawa",
        "address": "5710 S Orange Blossom Trl",
        "city": "Orlando",
        "state": "FL",
        "postal_code": "32839",
        "latitude": 28.4815,
        "longitude": -81.4010,
        "has_e85": True,
        "e85_price": 2.59,
        "gas_price": 3.39,
        "verified": True,
        "rating": 4.8,
        "amenities": "Touchscreen_Deli,Free_Air,Clean_Restrooms"
    }
]

class FuelStationService:
    @staticmethod
    def seed_initial_stations(db: Session):
        """Seed station records if database is empty."""
        count = db.query(FuelStation).count()
        if count == 0:
            for s_data in INITIAL_STATIONS:
                station = FuelStation(
                    name=s_data["name"],
                    brand=s_data["brand"],
                    address=s_data["address"],
                    city=s_data["city"],
                    state=s_data["state"],
                    postal_code=s_data["postal_code"],
                    latitude=s_data["latitude"],
                    longitude=s_data["longitude"],
                    has_e85=s_data["has_e85"],
                    e85_price=s_data["e85_price"],
                    gas_price=s_data["gas_price"],
                    price_updated_at=datetime.now(timezone.utc),
                    verified=s_data["verified"],
                    rating=s_data["rating"],
                    amenities=s_data["amenities"]
                )
                db.add(station)
            db.commit()

    @staticmethod
    def search_nearby(
        db: Session,
        lat: float,
        lon: float,
        radius_miles: float = 25.0,
        has_e85: bool = True,
        max_results: int = 20
    ) -> List[Dict[str, Any]]:
        """
        Query fuel stations within radius using spherical trigonometry.
        """
        stations = db.query(FuelStation).filter(FuelStation.has_e85 == has_e85).all()
        results = []
        
        for st in stations:
            dist = haversine_distance_miles(lat, lon, st.latitude, st.longitude)
            if dist <= radius_miles:
                amenity_list = [a.strip() for a in (st.amenities or "").split(",") if a.strip()]
                results.append({
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
                    "amenities": amenity_list,
                    "distance_miles": dist
                })
                
        # Sort by distance
        results.sort(key=lambda x: x["distance_miles"])
        return results[:max_results]

    @staticmethod
    def get_all_stations(db: Session, limit: int = 50) -> List[Dict[str, Any]]:
        stations = db.query(FuelStation).limit(limit).all()
        results = []
        for st in stations:
            amenity_list = [a.strip() for a in (st.amenities or "").split(",") if a.strip()]
            results.append({
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
                "amenities": amenity_list,
                "distance_miles": None
            })
        return results

station_service = FuelStationService()
