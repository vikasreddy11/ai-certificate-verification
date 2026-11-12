from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import auth, colleges, students, certificates, verification, analytics, demo_data

app = FastAPI(
    title="CertiVerify AI API",
    description="Enterprise AI-Powered Certificate Authentication and Verification System",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
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
