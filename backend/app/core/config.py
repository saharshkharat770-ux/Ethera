import os
from typing import List

class Settings:
    PROJECT_NAME: str = "ETHERA"
    TAGLINE: str = "Know Your Range. Master Your Fuel."
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "ethera-cyber-secret-key-automotive-intelligence-2026-b8f34a")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./ethera.db")
    
    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "*"
    ]
    
    # Demo Account
    DEMO_USER_EMAIL: str = "demo@ethera.ai"
    DEMO_USER_PASSWORD: str = "EtheraDemo2026!"

settings = Settings()
