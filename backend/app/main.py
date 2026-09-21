"""
FastAPI Application Entry Point & Lifespan Controller
AI-Based Crop Yield Prediction System
"""

import time
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.config import settings
from backend.app.database import connect_to_mongo, close_mongo_connection, get_database
from backend.app.services.prediction_service import PredictionEngine
from backend.app.routes.auth import router as auth_router
from backend.app.routes.predict import router as predict_router
from backend.app.routes.analytics import router as analytics_router
from backend.app.routes.models_info import router as models_router
from backend.app.routes.feedback import router as feedback_router
from backend.app.routes.admin import router as admin_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger(__name__)

start_time = time.time()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup Sequence
    logger.info("Initializing AI-Based Crop Yield Prediction System Backend...")
    await connect_to_mongo()
    
    # Pre-load ML Engine
    engine = PredictionEngine.get_instance()
    if engine.pipeline:
        logger.info("Active ML Pipeline successfully loaded into memory cache.")
    else:
        logger.warning("ML Pipeline could not be initialized at startup. Check model artifacts.")
        
    yield
    
    # Shutdown Sequence
    logger.info("Shutting down backend services...")
    await close_mongo_connection()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Enterprise-grade AI-Based Crop Yield Prediction System with real ML regression, MongoDB persistence, and explainable analytics.",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins during development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routes under /api prefix
app.include_router(auth_router, prefix="/api")
app.include_router(predict_router, prefix="/api")
app.include_router(analytics_router, prefix="/api")
app.include_router(models_router, prefix="/api")
app.include_router(feedback_router, prefix="/api")
app.include_router(admin_router, prefix="/api")

@app.get("/api/health", tags=["Health"])
async def health_check():
    """System health check endpoint verifying database and ML model connectivity."""
    db = get_database()
    db_connected = False
    try:
        if db is not None:
            await db.command("ping")
            db_connected = True
    except Exception as e:
        logger.error(f"Health check DB ping error: {e}")

    engine = PredictionEngine.get_instance()
    model_loaded = engine.pipeline is not None

    return {
        "status": "HEALTHY" if (db_connected and model_loaded) else "DEGRADED",
        "uptime_seconds": round(time.time() - start_time, 2),
        "database_connected": db_connected,
        "model_loaded": model_loaded,
        "active_model_version": engine.metadata.get("version", "v1.0"),
        "active_model_name": engine.metadata.get("model_name", "Random Forest Regressor (Optimized)")
    }

@app.get("/", tags=["Root"])
async def root():
    return {
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "documentation": "/docs",
        "health": "/api/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
