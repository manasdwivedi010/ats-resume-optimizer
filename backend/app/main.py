import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.mongodb import db_manager
from app.api.auth import router as auth_router
from app.api.ats import router as ats_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("ats.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: connect to MongoDB
    logger.info("Initializing application lifespan...")
    await db_manager.connect()
    yield
    # Shutdown: close MongoDB
    logger.info("Cleaning up application lifespan...")
    await db_manager.close()

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Role-Based ATS Resume Reader & Optimizer with Email OTP and MongoDB",
    version="1.0.0",
    lifespan=lifespan
)

# CORS setup for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows local Vite dev and staging
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(auth_router, prefix="/api")
app.include_router(ats_router, prefix="/api")

@app.get("/")
async def root():
    return {
        "app": settings.PROJECT_NAME,
        "status": "online",
        "database": "mongodb" if db_manager.is_connected else "in-memory-fallback",
        "otp_mode": "dev_console" if settings.OTP_DEV_MODE else "smtp"
    }

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "database_connected": db_manager.is_connected
    }
