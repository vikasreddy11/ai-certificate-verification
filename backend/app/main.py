from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import engine, Base
from app import models  # noqa: F401  (registers tables on Base.metadata)
from app.api import auth, colleges, students, certificates, verification, analytics, demo_data


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables on first boot (the Render DB starts empty)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield


app = FastAPI(
    title="CertiVerify AI API",
    description="Enterprise AI-Powered Certificate Authentication and Verification System",
    version="1.0.0",
    lifespan=lifespan,
)

origins = {settings.FRONTEND_URL.rstrip("/"), "http://localhost:3000", "http://localhost:5173"}
app.add_middleware(
    CORSMiddleware,
    allow_origins=list(origins),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(colleges.router, prefix="/api/colleges", tags=["Colleges"])
app.include_router(students.router, prefix="/api/students", tags=["Students"])
app.include_router(certificates.router, prefix="/api/certificates", tags=["Certificates"])
app.include_router(verification.router, prefix="/api/verification", tags=["Verification"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics & Logs"])
app.include_router(demo_data.router, prefix="/api/admin/demo-data", tags=["Demo Data Management"])


@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "CertiVerify AI Backend", "version": "1.0.0"}
