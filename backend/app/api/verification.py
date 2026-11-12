from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import Optional, Dict, Any
from datetime import datetime
import json

from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.security import verify_certificate_signature
from app.models import Certificate, Student, College, VerificationLog, VerificationStatus, CertificateStatus, User, UserRole
from app.schemas import VerificationResultOut
from app.services.ocr_service import run_ocr, extract_structured_fields

router = APIRouter()

def compare_records(official: Dict[str, Any], extracted: Dict[str, Any]):
    matching = {}
    mismatches = {}
    
    comparable_fields = ["student_name", "roll_number", "graduation_year", "course", "department"]
    
    for f in comparable_fields:
        off_val = official.get(f)
        ext_val = extracted.get(f)
        if ext_val is not None:
            # Normalized case-insensitive comparison
            if str(off_val).strip().lower() == str(ext_val).strip().lower():
                matching[f] = {"official": off_val, "extracted": ext_val}
            else:
                mismatches[f] = {"official": off_val, "extracted": ext_val}
        else:
            matching[f] = {"official": off_val, "extracted": "Not detected"}

    return matching, mismatches

@router.get("/verify/{certificate_id}", response_model=VerificationResultOut)
async def verify_by_id(certificate_id: str, db: AsyncSession = Depends(get_db)):
    """
    Public QR-code verification endpoint: Retrieves and validates official database records.
    """
    query = (
        select(Certificate)
        .options(selectinload(Certificate.student), selectinload(Certificate.college))
        .where(Certificate.certificate_id == certificate_id)
    )
    result = await db.execute(query)
    cert = result.scalars().first()

    now = datetime.utcnow()

    if not cert:
        return VerificationResultOut(
            certificate_id=certificate_id,
            verification_status=VerificationStatus.NOT_FOUND,
            verification_method="QR_SCAN_OR_DIRECT",
            message="Certificate ID not registered in official database.",
            is_demo=False,
            timestamp=now
        )

    if cert.status == CertificateStatus.REVOKED:
        return VerificationResultOut(
            certificate_id=cert.certificate_id,
            verification_status=VerificationStatus.REVOKED,
            verification_method="QR_SCAN_OR_DIRECT",
            message="This certificate was officially REVOKED by the issuing institution.",
            is_demo=cert.is_demo,
            official_record={
                "student_name": cert.student.student_name,
                "college_name": cert.college.college_name,
                "roll_number": cert.student.roll_number,
                "graduation_year": cert.graduation_year,
                "status": cert.status
            },
            timestamp=now
        )

    # Validate asymmetric digital signature
    payload = {
        "certificate_id": cert.certificate_id,
        "student_name": cert.student.student_name,
        "roll_number": cert.student.roll_number,
        "college_code": cert.college.college_code,
        "graduation_year": cert.graduation_year
    }
    payload_str = json.dumps(payload, sort_keys=True)
    is_valid_sig = verify_certificate_signature(payload_str, cert.signature) if cert.signature else True

    if not is_valid_sig:
        return VerificationResultOut(
            certificate_id=cert.certificate_id,
            verification_status=VerificationStatus.INVALID_SIGNATURE,
            verification_method="QR_SCAN_OR_DIRECT",
            message="Tampering detected! Cryptographic Ed25519 signature validation failed.",
            is_demo=cert.is_demo,
            timestamp=now
        )

    # Success verified
    official_data = {
        "student_name": cert.student.student_name,
        "roll_number": cert.student.roll_number,
        "college_name": cert.college.college_name,
        "course": cert.student.course,
        "department": cert.student.department,
        "graduation_year": cert.graduation_year,
        "issue_date": cert.issue_date.isoformat(),
        "status": cert.status
    }

    # Log verification attempt
    log = VerificationLog(
        certificate_id=cert.certificate_id,
        verification_method="QR_SCAN",
        verification_status=VerificationStatus.VERIFIED,
        is_demo=cert.is_demo,
        comparison_result=json.dumps({"status": "SUCCESS"}),
        timestamp=now
    )
    db.add(log)
    await db.commit()

    return VerificationResultOut(
        certificate_id=cert.certificate_id,
        verification_status=VerificationStatus.VERIFIED,
        verification_method="QR_SCAN",
        message="Certificate is authentic, active, and verified against the institutional registry.",
        is_demo=cert.is_demo,
        official_record=official_data,
        timestamp=now
    )

@router.post("/upload", response_model=VerificationResultOut)
async def verify_by_upload(
    file: UploadFile = File(...),
    certificate_id: Optional[str] = Form(None),
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Company/Recruiter verification pipeline:
    Accepts JPG/PNG/PDF, performs OCR, extracts fields, and matches against the database.
    """
    file_bytes = await file.read()
    raw_ocr_text = run_ocr(file_bytes)
    extracted = extract_structured_fields(raw_ocr_text)

    target_cert_id = certificate_id or extracted.get("certificate_id")
    now = datetime.utcnow()

    if not target_cert_id:
        return VerificationResultOut(
            certificate_id=None,
            verification_status=VerificationStatus.MANUAL_REVIEW_REQUIRED,
            verification_method="OCR_UPLOAD",
            message="Certificate ID could not be identified from document OCR. Manual review required.",
            extracted_record=extracted,
            timestamp=now
        )

    # Look up official record
    query = (
        select(Certificate)
        .options(selectinload(Certificate.student), selectinload(Certificate.college))
        .where(Certificate.certificate_id == target_cert_id)
    )
    result = await db.execute(query)
    cert = result.scalars().first()

    if not cert:
        return VerificationResultOut(
            certificate_id=target_cert_id,
            verification_status=VerificationStatus.NOT_FOUND,
            verification_method="OCR_UPLOAD",
            message=f"No institutional record found for Certificate ID {target_cert_id}.",
            extracted_record=extracted,
            timestamp=now
        )

    official_data = {
        "student_name": cert.student.student_name,
        "roll_number": cert.student.roll_number,
        "college_name": cert.college.college_name,
        "course": cert.student.course,
        "department": cert.student.department,
        "graduation_year": cert.graduation_year,
        "status": cert.status
    }

    if cert.status == CertificateStatus.REVOKED:
        status_val = VerificationStatus.REVOKED
        msg = "The certificate was revoked by the educational institution."
        matching, mismatches = {}, {}
    else:
        matching, mismatches = compare_records(official_data, extracted)
        if mismatches:
            status_val = VerificationStatus.MISMATCH
            msg = "Field mismatches detected between physical document and institutional registry."
        else:
            status_val = VerificationStatus.VERIFIED
            msg = "All detectable fields match the official institutional registry."

    # Log in database
    log = VerificationLog(
        certificate_id=cert.certificate_id,
        company_user_id=current_user.id if current_user else None,
        verification_method="OCR_UPLOAD",
        extracted_data=json.dumps(extracted),
        comparison_result=json.dumps({"matching": matching, "mismatches": mismatches}),
        verification_status=status_val,
        is_demo=cert.is_demo,
        timestamp=now
    )
    db.add(log)
    await db.commit()

    return VerificationResultOut(
        certificate_id=cert.certificate_id,
        verification_status=status_val,
        verification_method="OCR_UPLOAD",
        message=msg,
        matching_fields=matching,
        mismatching_fields=mismatches,
        is_demo=cert.is_demo,
        official_record=official_data,
        extracted_record=extracted,
        timestamp=now
    )

