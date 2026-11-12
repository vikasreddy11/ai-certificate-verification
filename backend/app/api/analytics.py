from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from typing import Dict, Any, List

from app.core.database import get_db
from app.core.deps import require_role, get_current_user
from app.models import College, Student, Certificate, VerificationLog, AuditLog, User, UserRole, CertificateStatus, VerificationStatus

router = APIRouter()

@router.get("/admin/analytics")
async def get_admin_analytics(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.SUPER_ADMIN]))
) -> Dict[str, Any]:
    total_colleges = (await db.execute(select(func.count(College.id)))).scalar() or 0
    total_students = (await db.execute(select(func.count(Student.id)))).scalar() or 0
    total_certificates = (await db.execute(select(func.count(Certificate.id)))).scalar() or 0
    
    total_revoked = (await db.execute(
        select(func.count(Certificate.id)).where(Certificate.status == CertificateStatus.REVOKED)
    )).scalar() or 0

    total_attempts = (await db.execute(select(func.count(VerificationLog.id)))).scalar() or 0
    
    verified_attempts = (await db.execute(
        select(func.count(VerificationLog.id)).where(VerificationLog.verification_status == VerificationStatus.VERIFIED)
    )).scalar() or 0

    mismatch_attempts = (await db.execute(
        select(func.count(VerificationLog.id)).where(VerificationLog.verification_status == VerificationStatus.MISMATCH)
    )).scalar() or 0

    return {
        "total_colleges": total_colleges,
        "total_students": total_students,
        "total_certificates": total_certificates,
        "total_revoked_certificates": total_revoked,
        "total_verification_attempts": total_attempts,
        "verified_attempts": verified_attempts,
        "mismatches_detected": mismatch_attempts,
        "has_demo_data": True
    }

@router.get("/admin/audit-logs")
async def get_audit_logs(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.SUPER_ADMIN]))
):
    result = await db.execute(select(AuditLog).order_by(AuditLog.id.desc()).limit(100))
    return result.scalars().all()

@router.get("/company/history")
async def get_company_history(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.COMPANY, UserRole.SUPER_ADMIN]))
):
    query = select(VerificationLog).order_by(VerificationLog.id.desc()).limit(50)
    if current_user.role == UserRole.COMPANY:
        query = query.where(VerificationLog.company_user_id == current_user.id)
    result = await db.execute(query)
    return result.scalars().all()

