from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.config import settings
from app.models import User, Vehicle, FuelLog
from app.schemas import UserCreate, UserLogin, UserResponse, TokenResponse
from app.api.deps import get_current_user_required

router = APIRouter(prefix="/auth", tags=["Authentication"])

def seed_demo_user(db: Session) -> User:
    """Ensures a demo user exists with a sample flex-fuel vehicle and logs."""
    demo_user = db.query(User).filter(User.email == settings.DEMO_USER_EMAIL).first()
    if not demo_user:
        demo_user = User(
            email=settings.DEMO_USER_EMAIL,
            hashed_password=get_password_hash(settings.DEMO_USER_PASSWORD),
            full_name="Alex Mercer (Demo Driver)",
            is_active=True,
            is_verified=True,
            role="driver"
        )
        db.add(demo_user)
        db.commit()
        db.refresh(demo_user)
        
        # Add default demo vehicle
        demo_vehicle = Vehicle(
            user_id=demo_user.id,
            nickname="Apex F-150 Flex",
            make="Ford",
            model="F-150 Flex-Fuel",
            year=2022,
            trim="XLT 5.0L V8 FFV",
            engine_disp=5.0,
            flex_fuel_verified=True,
            tank_capacity_gal=26.0,
            baseline_epa_mpg_gas=20.0,
            baseline_epa_mpg_e85=15.0,
            user_reported_mpg=14.8,
            preferred_units="imperial",
            preferred_currency="USD",
            is_default=True
        )
        db.add(demo_vehicle)
        db.commit()
        db.refresh(demo_vehicle)
        
        # Add sample fuel logs
        sample_logs = [
            {"fuel": "E85", "gal": 22.4, "price": 2.45, "cost": 54.88, "odo": 24150, "trip": 331.5, "mpg": 14.8, "station": "Thorntons Chicago #412"},
            {"fuel": "E85", "gal": 23.1, "price": 2.49, "cost": 57.52, "odo": 24490, "trip": 340.0, "mpg": 14.7, "station": "Casey's Joliet #341"},
            {"fuel": "E85", "gal": 21.8, "price": 2.39, "cost": 52.10, "odo": 24820, "trip": 330.0, "mpg": 15.1, "station": "Kwik Star Express #882"},
            {"fuel": "E10_GAS", "gal": 22.0, "price": 3.49, "cost": 76.78, "odo": 25260, "trip": 440.0, "mpg": 20.0, "station": "Shell Highway Station"}
        ]
        for l in sample_logs:
            f_log = FuelLog(
                user_id=demo_user.id,
                vehicle_id=demo_vehicle.id,
                fuel_type=l["fuel"],
                gallons_filled=l["gal"],
                price_per_gal=l["price"],
                total_cost=l["cost"],
                odometer_miles=l["odo"],
                trip_miles_observed=l["trip"],
                calculated_mpg=l["mpg"],
                ethanol_percent=85.0 if l["fuel"] == "E85" else 10.0,
                station_name=l["station"],
                timestamp=datetime.now(timezone.utc)
            )
            db.add(f_log)
        db.commit()
        
    return demo_user

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    """Register a new user account."""
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )
    
    new_user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        is_active=True,
        is_verified=True,
        role="driver"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Auto-create initial default flex-fuel vehicle for smooth onboarding
    default_vehicle = Vehicle(
        user_id=new_user.id,
        nickname="My Flex-Fuel Vehicle",
        make="Ford",
        model="F-150 Flex-Fuel",
        year=2021,
        trim="5.0L V8",
        engine_disp=5.0,
        flex_fuel_verified=True,
        tank_capacity_gal=26.0,
        baseline_epa_mpg_gas=20.0,
        baseline_epa_mpg_e85=15.0,
        is_default=True
    )
    db.add(default_vehicle)
    db.commit()
    
    access_token = create_access_token(subject=new_user.id)
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(new_user)
    )

@router.post("/login", response_model=TokenResponse)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    """Authenticate with email and password."""
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password credentials."
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated."
        )
        
    access_token = create_access_token(subject=user.id)
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )

@router.post("/demo-login", response_model=TokenResponse)
def demo_login(db: Session = Depends(get_db)):
    """Instant one-click demo login with pre-loaded realistic data."""
    demo_user = seed_demo_user(db)
    access_token = create_access_token(subject=demo_user.id)
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(demo_user)
    )

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(user: User = Depends(get_current_user_required)):
    """Get profile of current authenticated user."""
    return UserResponse.model_validate(user)
