from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import auth, upload, transactions, analytics, report
from .services.ml import ml_service

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure models are loaded (they load on import, but we can verify here)
    print("SpendLens Backend is starting up...")
    if ml_service.is_loaded:
        print("ML engine successfully initialized with pre-loaded models.")
    else:
        print("ML engine initialized in rule-based fallback mode.")
    yield
    print("SpendLens Backend is shutting down...")

app = FastAPI(
    title="SpendLens Personal Finance API",
    description="Backend API for SpendLens including Statement Parsing, ML Auto-Categorization, Anomaly Detection, and PDF Reports.",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS for local development and production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production deployments
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(upload.router)
app.include_router(transactions.router)
app.include_router(analytics.router)
app.include_router(report.router)

@app.get("/")
def read_root():
    return {
        "status": "running",
        "app": "SpendLens API",
        "ml_mode": "ML-Classifier" if ml_service.is_loaded else "Rule-based Fallback"
    }
