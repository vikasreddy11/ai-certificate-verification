from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import delete
from app.core.database import get_db
from app.core.deps import require_role
from app.models import UserRole, User, College, Student, Certificate, VerificationLog
import subprocess
import sys
import os

router = APIRouter()

@router.post("/reset")
async def reset_demo_data(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.SUPER_ADMIN]))
):
    # Delete demo certificates, students, colleges
    await db.execute(delete(VerificationLog).where(VerificationLog.is_demo == True))
    await db.execute(delete(Certificate).where(Certificate.is_demo == True))
    await db.execute(delete(Student).where(Student.is_demo == True))
    await db.execute(delete(College).where(College.is_demo == True))
    await db.commit()
    return {"message": "All synthetic demo data removed successfully."}

@router.post("/seed")
async def seed_demo_data_endpoint(
    current_user: User = Depends(require_role([UserRole.SUPER_ADMIN]))
):
    try:
        # Run seed script
        script_path = os.path.join(os.getcwd(), "db", "seed_demo_data.py")
        subprocess.run([sys.executable, script_path], check=True)
        return {"message": "Synthetic demo data seeded successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to seed demo data: {str(e)}")

