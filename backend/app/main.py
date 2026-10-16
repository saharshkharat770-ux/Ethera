from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.api.v1 import auth, vehicles, prediction, economics, stations, trips, insights
from app.services.station_service import station_service
from app.api.v1.auth import seed_demo_user

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure tables created and initial data seeded
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        station_service.seed_initial_stations(db)
        seed_demo_user(db)
    finally:
        db.close()
    yield

app = FastAPI(
    title="ETHERA Automotive Intelligence API",
    description="AI-Powered Fuel Intelligence, E85 Mileage Prediction, Smart Navigation, and Sustainable Mobility Platform",
    version=settings.VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/api/v1/openapi.json"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Versioned API routes
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(vehicles.router, prefix=settings.API_V1_STR)
app.include_router(prediction.router, prefix=settings.API_V1_STR)
app.include_router(economics.router, prefix=settings.API_V1_STR)
app.include_router(stations.router, prefix=settings.API_V1_STR)
app.include_router(trips.router, prefix=settings.API_V1_STR)
app.include_router(insights.router, prefix=settings.API_V1_STR)

@app.get("/api/v1/health", tags=["System Health"])
def health_check():
    """System health and readiness check."""
    return {
        "status": "operational",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "tagline": settings.TAGLINE,
        "ai_engine": "online",
        "database": "connected"
    }

@app.get("/", tags=["Root"])
def root_redirect():
    """Root metadata."""
    return {
        "name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "tagline": settings.TAGLINE,
        "documentation": "/docs",
        "status": "healthy"
    }
