from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List, Optional
import qrcode
import io
import json
from app.core.database import get_db
from app.core.deps import require_role, get_current_user
from app.core.security import sign_certificate_payload
from app.core.config import settings
from app.models import Certificate, Student, College, User, UserRole, CertificateStatus, AuditLog
from app.schemas import CertificateCreate, CertificateOut

router = APIRouter()

def generate_cert_id(college_code: str, grad_year: int, student_id: int) -> str:
    return f"CERT-{college_code.upper()}-{grad_year}-{str(student_id).zfill(5)}"

@router.get("", response_model=List[CertificateOut])
async def list_certificates(
    college_id: Optional[int] = None,
    status_filter: Optional[CertificateStatus] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = select(Certificate).options(selectinload(Certificate.student), selectinload(Certificate.college))
    if current_user.role == UserRole.COLLEGE_ADMIN:
        query = query.where(Certificate.college_id == current_user.college_id)
    elif college_id:
        query = query.where(Certificate.college_id == college_id)

    if status_filter:
        query = query.where(Certificate.status == status_filter)

    result = await db.execute(query.order_by(Certificate.id.desc()))
    certificates = result.scalars().all()
    
    # Map student_name & college_name for display
    output = []
    for cert in certificates:
        out = CertificateOut.model_validate(cert)
        out.student_name = cert.student.student_name if cert.student else "Unknown"
        out.college_name = cert.college.college_name if cert.college else "Unknown"
        output.append(out)
    return output

@router.post("", response_model=CertificateOut)
async def create_certificate(
    data: CertificateCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.SUPER_ADMIN, UserRole.COLLEGE_ADMIN]))
):
    student = await db.get(Student, data.student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    college = await db.get(College, student.college_id)
    if not college:
        raise HTTPException(status_code=404, detail="College not found")

    if current_user.role == UserRole.COLLEGE_ADMIN and current_user.college_id != student.college_id:
        raise HTTPException(status_code=403, detail="Cannot issue certificate for student of another institution")

    # Generate Unique Certificate ID
    cert_id = generate_cert_id(college.college_code, data.graduation_year, student.id)
    
    # Check if certificate exists
    existing = await db.execute(select(Certificate).where(Certificate.certificate_id == cert_id))
    if existing.scalars().first():
        raise HTTPException(status_code=400, detail="Certificate already issued for this student record")

    # Create cryptographic Ed25519 signature payload
    payload = {
        "certificate_id": cert_id,
        "student_name": student.student_name,
        "roll_number": student.roll_number,
        "college_code": college.college_code,
        "graduation_year": data.graduation_year
    }
    payload_str = json.dumps(payload, sort_keys=True)
    signature = sign_certificate_payload(payload_str)

    cert = Certificate(
        certificate_id=cert_id,
        student_id=student.id,
        college_id=college.id,
        certificate_type=data.certificate_type,
        graduation_year=data.graduation_year,
        status=CertificateStatus.ACTIVE,
        signature=signature,
        verification_token_hash=signature[:32], # preview token
        is_demo=student.is_demo
    )
    db.add(cert)
    await db.commit()
    await db.refresh(cert)

    audit = AuditLog(
        user_id=current_user.id,
        action="ISSUE_CERTIFICATE",
        entity_type="CERTIFICATE",
        entity_id=cert.certificate_id,
        details=f"Issued certificate {cert.certificate_id} for student {student.student_name}"
    )
    db.add(audit)
    await db.commit()

    res = CertificateOut.model_validate(cert)
    res.student_name = student.student_name
    res.college_name = college.college_name
    return res

@router.get("/{certificate_id}/qr")
async def get_certificate_qr(certificate_id: str, db: AsyncSession = Depends(get_db)):
    cert = await db.execute(select(Certificate).where(Certificate.certificate_id == certificate_id))
    cert_obj = cert.scalars().first()
    if not cert_obj:
        raise HTTPException(status_code=404, detail="Certificate not found")

    # The QR code points directly to the public verification endpoint
    verification_url = f"{settings.FRONTEND_URL}/verify/{cert_obj.certificate_id}"
    
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=4,
    )
    qr.add_data(verification_url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="#1E3A8A", back_color="white") # Navy blue styling
    
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    return Response(content=buf.getvalue(), media_type="image/png")

@router.patch("/{certificate_id}/revoke")
async def revoke_certificate(
    certificate_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.SUPER_ADMIN, UserRole.COLLEGE_ADMIN]))
):
    query = select(Certificate).where(Certificate.certificate_id == certificate_id)
    result = await db.execute(query)
    cert = result.scalars().first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found")

    if current_user.role == UserRole.COLLEGE_ADMIN and current_user.college_id != cert.college_id:
        raise HTTPException(status_code=403, detail="Unauthorized to revoke certificate from another institution")

    cert.status = CertificateStatus.REVOKED
    
    audit = AuditLog(
        user_id=current_user.id,
        action="REVOKE_CERTIFICATE",
        entity_type="CERTIFICATE",
        entity_id=cert.certificate_id,
        details=f"Revoked certificate {cert.certificate_id}"
    )
    db.add(audit)
    await db.commit()
    return {"message": f"Certificate {certificate_id} revoked successfully"}

