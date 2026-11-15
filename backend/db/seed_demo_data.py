"""
Seeds the database with demo colleges, students, certificates, users and logs.
Safe to run many times (it wipes only demo rows first).

Run from the backend root:   python -m db.seed_demo_data
"""
import sys
from pathlib import Path

# Makes `app` importable whether this file sits in <root>/db or <root>/backend/db
_HERE = Path(__file__).resolve().parent
for _p in (_HERE.parent, _HERE.parent / "backend"):
    if (_p / "app").is_dir() and str(_p) not in sys.path:
        sys.path.insert(0, str(_p))
if str(_HERE) not in sys.path:
    sys.path.insert(0, str(_HERE))

import asyncio
import json
import random
from datetime import datetime, timedelta

from sqlalchemy import delete
from sqlalchemy.future import select

from app.core.database import AsyncSessionLocal, engine, Base
from app.core.security import get_password_hash, sign_certificate_payload
from app.models import (
    User, College, Student, Certificate, VerificationLog, AuditLog,
    UserRole, CertificateStatus, VerificationStatus,
)

DEMO_COLLEGES = [
    {"college_name": "Apex Institute of Technology", "college_code": "AIT",
     "official_email": "registrar@apex-institute.edu", "address": "Tech Boulevard, Silicon Valley, CA",
     "contact_number": "+1-555-0199"},
    {"college_name": "Beacon State University", "college_code": "BSU",
     "official_email": "admin@beacon-state.edu", "address": "University Heights, Boston, MA",
     "contact_number": "+1-555-0244"},
    {"college_name": "Crestview National College", "college_code": "CNC",
     "official_email": "academic@crestview.edu", "address": "Grand Avenue, Austin, TX",
     "contact_number": "+1-555-0377"},
]

DEPARTMENTS = ["Computer Science", "Information Technology", "Mechanical Engineering", "Electrical Engineering"]
COURSES = ["B.Tech", "B.Sc", "M.Tech"]
FIRST_NAMES = ["Alexander", "Elena", "Liam", "Sophia", "Noah", "Olivia", "Ethan", "Emma", "Aria", "Lucas",
               "Maya", "Daniel", "Chloe", "James", "Isabella"]
LAST_NAMES = ["Vance", "Mercer", "Sterling", "Kowalski", "Chen", "Patel", "Thorne", "Ramirez", "Sinclair", "Holloway"]

SUPER_ADMIN = ("admin@certiverify.ai", "Admin@123456")
COMPANY = ("recruiter@google.com", "Recruiter@123")
COLLEGE_ADMIN_PASSWORD = "College@123"
COLLEGE_ADMIN_EMAILS = [f"admin@{c['college_code'].lower()}.edu" for c in DEMO_COLLEGES]

N_STUDENTS = 50
N_REVOKED = 4          # students/certs index 35..38


async def reset_demo_data(session):
    """Removes all demo rows (certificates, students, colleges, logs, demo college admins)."""
    await session.execute(delete(VerificationLog).where(VerificationLog.is_demo == True))  # noqa: E712
    await session.execute(delete(Certificate).where(Certificate.is_demo == True))  # noqa: E712
    await session.execute(delete(Student).where(Student.is_demo == True))  # noqa: E712
    await session.execute(delete(College).where(College.is_demo == True))  # noqa: E712
    await session.execute(delete(User).where(User.email.in_(COLLEGE_ADMIN_EMAILS)))


async def _get_or_create_user(session, email, password, **fields):
    res = await session.execute(select(User).where(User.email == email))
    user = res.scalars().first()
    if user:
        return user
    user = User(email=email, password_hash=get_password_hash(password), is_active=True, **fields)
    session.add(user)
    await session.flush()
    return user


async def seed_demo(random_seed: int = 42) -> dict:
    rnd = random.Random(random_seed)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        await reset_demo_data(session)
        await session.flush()

        await _get_or_create_user(session, SUPER_ADMIN[0], SUPER_ADMIN[1],
                                  full_name="Super Administrator", role=UserRole.SUPER_ADMIN)
        company = await _get_or_create_user(session, COMPANY[0], COMPANY[1],
                                            full_name="Google Recruiter", role=UserRole.COMPANY,
                                            company_name="Google LLC")

        colleges = []
        for c in DEMO_COLLEGES:
            col = College(**c, is_demo=True)
            session.add(col)
            await session.flush()
            colleges.append(col)
            await _get_or_create_user(session, f"admin@{c['college_code'].lower()}.edu", COLLEGE_ADMIN_PASSWORD,
                                      full_name=f"{c['college_code']} Registrar",
                                      role=UserRole.COLLEGE_ADMIN, college_id=col.id)

        students = []
        for i in range(N_STUDENTS):
            col = colleges[i % len(colleges)]
            stu = Student(
                college_id=col.id,
                student_name=f"{FIRST_NAMES[i % len(FIRST_NAMES)]} {LAST_NAMES[(i * 3) % len(LAST_NAMES)]}",
                roll_number=f"{col.college_code}-2022-{str(i + 1).zfill(4)}",
                department=DEPARTMENTS[i % len(DEPARTMENTS)],
                course=COURSES[i % len(COURSES)],
                graduation_year=2024 + (i % 3),
                is_demo=True,
            )
            session.add(stu)
            students.append(stu)
        await session.flush()

        certs = []
        by_id = {c.id: c for c in colleges}
        for i, stu in enumerate(students):
            col = by_id[stu.college_id]
            cert_id = f"CERT-{col.college_code}-{stu.graduation_year}-{str(stu.id).zfill(5)}"
            payload = {
                "certificate_id": cert_id,
                "student_name": stu.student_name,
                "roll_number": stu.roll_number,
                "college_code": col.college_code,
                "graduation_year": stu.graduation_year,
            }
            sig = sign_certificate_payload(json.dumps(payload, sort_keys=True))
            revoked = 35 <= i < 35 + N_REVOKED
            cert = Certificate(
                certificate_id=cert_id, student_id=stu.id, college_id=col.id,
                certificate_type="Bachelor Degree", graduation_year=stu.graduation_year,
                status=CertificateStatus.REVOKED if revoked else CertificateStatus.ACTIVE,
                signature=sig, verification_token_hash=sig[:32], is_demo=True,
            )
            session.add(cert)
            certs.append(cert)
        await session.flush()

        # --- sample verification history so the analytics dashboards aren't empty
        now = datetime.utcnow()
        active = [c for c in certs if c.status == CertificateStatus.ACTIVE]
        revoked = [c for c in certs if c.status == CertificateStatus.REVOKED]

        def log(cert_id, method, status, result, days_ago):
            session.add(VerificationLog(
                certificate_id=cert_id, company_user_id=company.id, verification_method=method,
                verification_status=status, comparison_result=json.dumps(result), is_demo=True,
                timestamp=now - timedelta(days=days_ago, hours=rnd.randint(0, 20)),
            ))

        for c in rnd.sample(active, 20):
            log(c.certificate_id, rnd.choice(["QR_SCAN", "OCR_UPLOAD"]), VerificationStatus.VERIFIED,
                {"status": "SUCCESS"}, rnd.randint(0, 14))
        for c in rnd.sample(active, 8):
            log(c.certificate_id, "OCR_UPLOAD", VerificationStatus.MISMATCH,
                {"mismatches": {"student_name": {"official": "?", "extracted": "tampered"}}}, rnd.randint(0, 14))
        for c in revoked[:2]:
            log(c.certificate_id, "QR_SCAN", VerificationStatus.REVOKED, {}, rnd.randint(0, 7))
        for _ in range(3):
            log(None, "OCR_UPLOAD", VerificationStatus.MANUAL_REVIEW_REQUIRED, {}, rnd.randint(0, 7))

        session.add(AuditLog(action="SEED_DEMO_DATA", entity_type="SYSTEM",
                             details=f"Seeded {len(colleges)} colleges, {len(students)} students, {len(certs)} certificates"))
        await session.commit()

    return {
        "colleges": len(colleges), "students": len(students), "certificates": len(certs),
        "revoked": len(revoked),
        "logins": {
            "super_admin": list(SUPER_ADMIN),
            "company": list(COMPANY),
            "college_admins": [[e, COLLEGE_ADMIN_PASSWORD] for e in COLLEGE_ADMIN_EMAILS],
        },
    }


if __name__ == "__main__":
    async def _main():
        print(json.dumps(await seed_demo(), indent=2))
        await engine.dispose()
    asyncio.run(_main())
