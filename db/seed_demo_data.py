import asyncio
import io
import json
from datetime import datetime, timezone
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from app.core.database import AsyncSessionLocal, engine, Base
from app.core.security import get_password_hash, sign_certificate_payload
from app.models import (
    User, College, Student, Certificate, VerificationLog, AuditLog,
    UserRole, CertificateStatus, VerificationStatus
)

DEMO_COLLEGES = [
    {
        "college_name": "Apex Institute of Technology",
        "college_code": "AIT",
        "official_email": "registrar@apex-institute.edu",
        "address": "Tech Boulevard, Silicon Valley, CA",
        "contact_number": "+1-555-0199"
    },
    {
        "college_name": "Beacon State University",
        "college_code": "BSU",
        "official_email": "admin@beacon-state.edu",
        "address": "University Heights, Boston, MA",
        "contact_number": "+1-555-0244"
    },
    {
        "college_name": "Crestview National College",
        "college_code": "CNC",
        "official_email": "academic@crestview.edu",
        "address": "Grand Avenue, Austin, TX",
        "contact_number": "+1-555-0377"
    }
]

DEPARTMENTS = ["Computer Science", "Information Technology", "Mechanical Engineering", "Electrical Engineering"]
COURSES = ["B.Tech", "B.Sc", "M.Tech"]

FIRST_NAMES = ["Alexander", "Elena", "Liam", "Sophia", "Noah", "Olivia", "Ethan", "Emma", "Aria", "Lucas", "Maya", "Daniel", "Chloe", "James", "Isabella"]
LAST_NAMES = ["Vance", "Mercer", "Sterling", "Kowalski", "Chen", "Patel", "Thorne", "Ramirez", "Sinclair", "Holloway"]

def generate_sample_certificate_image(cert_id: str, student_name: str, roll_no: str, college_name: str, year: int, output_path: str):
    """Generates a clean synthetic certificate PNG image for testing OCR."""
    width, height = 1200, 850
    img = Image.new("RGB", (width, height), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)

    # Outer decorative borders
    draw.rectangle([30, 30, width - 30, height - 30], outline=(30, 58, 138), width=6)
    draw.rectangle([45, 45, width - 45, height - 45], outline=(180, 83, 9), width=2)

    # Header
    draw.text((width // 2, 120), college_name.upper(), fill=(30, 58, 138), anchor="mm")
    draw.text((width // 2, 170), "OFFICIAL DEGREE CERTIFICATE", fill=(100, 116, 139), anchor="mm")

    # Body
    draw.text((width // 2, 280), "This is to certify that", fill=(71, 85, 105), anchor="mm")
    draw.text((width // 2, 350), student_name.upper(), fill=(15, 23, 42), anchor="mm")
    draw.text((width // 2, 420), f"bearing Roll Number: {roll_no}", fill=(51, 65, 85), anchor="mm")
    draw.text((width // 2, 470), f"has successfully completed Bachelor of Technology in Computer Science", fill=(51, 65, 85), anchor="mm")
    draw.text((width // 2, 520), f"in the Academic Year {year}", fill=(51, 65, 85), anchor="mm")

    # Footer Metadata
    draw.text((100, 720), f"Certificate ID: {cert_id}", fill=(30, 58, 138))
    draw.text((width - 320, 720), "OFFICIALLY VERIFIED & SIGNED", fill=(5, 150, 105))

    img.save(output_path)
    print(f"[+] Sample test certificate image created: {output_path}")

async def seed():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        print("[*] Creating Super Admin & Company Test Accounts...")
        admin = User(
            full_name="Super Administrator",
            email="admin@certiverify.ai",
            password_hash=get_password_hash("Admin@123456"),
            role=UserRole.SUPER_ADMIN,
            is_active=True
        )
        session.add(admin)

        company = User(
            full_name="Google Recruiter",
            email="recruiter@google.com",
            password_hash=get_password_hash("Recruiter@123"),
            role=UserRole.COMPANY,
            company_name="Google LLC",
            is_active=True
        )
        session.add(company)
        await session.flush()

        print("[*] Seeding 3 Synthetic Colleges...")
        colleges = []
        for c in DEMO_COLLEGES:
            col = College(
                college_name=c["college_name"],
                college_code=c["college_code"],
                official_email=c["official_email"],
                address=c["address"],
                contact_number=c["contact_number"],
                is_demo=True
            )
            session.add(col)
            await session.flush()
            colleges.append(col)

            # Create College Admin
            c_admin = User(
                full_name=f"{c['college_code']} Registrar",
                email=f"admin@{c['college_code'].lower()}.edu",
                password_hash=get_password_hash("College@123"),
                role=UserRole.COLLEGE_ADMIN,
                college_id=col.id,
                is_active=True
            )
            session.add(c_admin)

        print("[*] Generating 50 Synthetic Students...")
        students = []
        idx = 1
        for i in range(50):
            col = colleges[i % len(colleges)]
            first = FIRST_NAMES[i % len(FIRST_NAMES)]
            last = LAST_NAMES[(i * 3) % len(LAST_NAMES)]
            name = f"{first} {last}"
            roll = f"{col.college_code}-2022-{str(idx).zfill(4)}"
            dept = DEPARTMENTS[i % len(DEPARTMENTS)]
            course = COURSES[i % len(COURSES)]
            year = 2024 + (i % 3)

            stu = Student(
                college_id=col.id,
                student_name=name,
                roll_number=roll,
                department=dept,
                course=course,
                graduation_year=year,
                is_demo=True
            )
            session.add(stu)
            await session.flush()
            students.append(stu)
            idx += 1

        print("[*] Generating 50 Certificates (35 Valid, 8 Mismatched, 4 Revoked, 3 Special)...")
        for i in range(50):
            stu = students[i]
            col = [c for c in colleges if c.id == stu.college_id][0]
            cert_id = f"CERT-{col.college_code}-{stu.graduation_year}-{str(stu.id).zfill(5)}"
            
            # Status setup
            if i < 35:
                status = CertificateStatus.ACTIVE
            elif i < 39:
                status = CertificateStatus.REVOKED
            else:
                status = CertificateStatus.ACTIVE

            payload = {
                "certificate_id": cert_id,
                "student_name": stu.student_name,
                "roll_number": stu.roll_number,
                "college_code": col.college_code,
                "graduation_year": stu.graduation_year
            }
            sig = sign_certificate_payload(json.dumps(payload, sort_keys=True))

            cert = Certificate(
                certificate_id=cert_id,
                student_id=stu.id,
                college_id=col.id,
                certificate_type="Bachelor Degree",
                graduation_year=stu.graduation_year,
                status=status,
                signature=sig,
                verification_token_hash=sig[:32],
                is_demo=True
            )
            session.add(cert)

        print("[*] Recording Initial Verification Logs & Audit Trails...")
        sample_log = VerificationLog(
            certificate_id=f"CERT-{colleges[0].college_code}-2026-00001",
            company_user_id=company.id,
            verification_method="QR_SCAN",
            verification_status=VerificationStatus.VERIFIED,
            is_demo=True,
            comparison_result=json.dumps({"status": "SUCCESS"}),
            timestamp=datetime.utcnow()
        )
        session.add(sample_log)

        await session.commit()
        print("[+] Demo data seeding complete! Database is ready with sample records.")

        # Generate sample test certificates for OCR
        try:
            generate_sample_certificate_image(
                "CERT-AIT-2026-00001",
                "Alexander Vance",
                "AIT-2022-0001",
                "Apex Institute of Technology",
                2026,
                "sample_authentic_certificate.png"
            )
            generate_sample_certificate_image(
                "CERT-AIT-2026-00001",
                "Altered Fake Name",
                "AIT-2022-9999",
                "Apex Institute of Technology",
                2026,
                "sample_tampered_certificate.png"
            )
        except Exception as e:
            print(f"[!] Warning generating sample test images: {e}")

if __name__ == "__main__":
    asyncio.run(seed())
