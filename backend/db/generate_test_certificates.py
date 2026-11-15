"""
Creates certificate images to test the verifier:
  out/real/      -> identical to the database record  (expect VERIFIED)
  out/tampered/  -> QR is REAL (id exists in DB) but details printed on the certificate
                    differ from the database record               (expect MISMATCH)
  out/revoked/   -> looks genuine, but revoked in DB      (expect REVOKED)
  out/fake/      -> QR code contains a certificate ID that is NOT in the database
                    (expect NOT_FOUND)
  out/manifest.csv

Run from backend root after seeding:
    FRONTEND_URL=https://your-frontend.onrender.com python -m db.generate_test_certificates
(set DATABASE_URL to the Render *External* database URL to read the Render DB from your laptop)
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
import csv
import os

from pathlib import Path

import qrcode
from PIL import Image, ImageDraw, ImageFont

FONT_CANDIDATES = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    "/Library/Fonts/Arial.ttf", "/System/Library/Fonts/Supplemental/Arial.ttf",
    "C:/Windows/Fonts/arial.ttf",
]
BOLD_CANDIDATES = [p.replace("DejaVuSans.ttf", "DejaVuSans-Bold.ttf").replace("Arial.ttf", "Arial Bold.ttf")
                   .replace("arial.ttf", "arialbd.ttf") for p in FONT_CANDIDATES]
COURSE_FULL = {"B.Tech": "Bachelor of Technology", "B.Sc": "Bachelor of Science", "M.Tech": "Master of Technology"}


def _font(size, bold=False):
    for p in (BOLD_CANDIDATES if bold else FONT_CANDIDATES):
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default(size)  # Pillow >= 10.1


def render_certificate(path, *, cert_id, student_name, roll_number, college_name, course, department,
                       year, frontend_url, qr_cert_id=None):
    W, H = 1400, 1000
    img = Image.new("RGB", (W, H), (255, 255, 255))
    d = ImageDraw.Draw(img)
    d.rectangle([30, 30, W - 30, H - 30], outline=(30, 58, 138), width=8)
    d.rectangle([50, 50, W - 50, H - 50], outline=(180, 83, 9), width=3)

    def center(y, text, size, color, bold=False):
        d.text((W // 2, y), text, fill=color, anchor="mm", font=_font(size, bold))

    center(130, college_name.upper(), 44, (30, 58, 138), True)
    center(195, "OFFICIAL DEGREE CERTIFICATE", 30, (100, 116, 139))
    center(300, "This is to certify that", 30, (71, 85, 105))
    center(380, student_name.upper(), 56, (15, 23, 42), True)
    center(465, f"bearing Roll Number: {roll_number}", 32, (51, 65, 85))
    center(535, f"has successfully completed {COURSE_FULL.get(course, course)} in {department}", 32, (51, 65, 85))
    center(595, f"in the Academic Year {year}", 32, (51, 65, 85))

    d.text((110, 880), f"Certificate ID: {cert_id}", fill=(30, 58, 138), font=_font(28, True))
    d.text((W - 110, 880), "OFFICIALLY VERIFIED & SIGNED", fill=(5, 150, 105), font=_font(24), anchor="ra")

    qr = qrcode.make(f"{frontend_url.rstrip('/')}/verify/{qr_cert_id or cert_id}").convert("RGB").resize((190, 190))
    img.paste(qr, (W // 2 - 95, 650))
    img.save(path)


def _row(cert):
    s, c = cert.student, cert.college
    return dict(cert_id=cert.certificate_id, student_name=s.student_name, roll_number=s.roll_number,
                college_name=c.college_name, course=s.course, department=s.department, year=cert.graduation_year)


async def main():
    from sqlalchemy.future import select
    from sqlalchemy.orm import selectinload
    from app.core.database import AsyncSessionLocal, engine
    from app.models import Certificate, CertificateStatus

    frontend = os.getenv("FRONTEND_URL", "http://localhost:3000")
    out = Path(os.getenv("OUT_DIR", "out"))
    for sub in ("real", "tampered", "revoked", "fake"):
        (out / sub).mkdir(parents=True, exist_ok=True)

    async with AsyncSessionLocal() as s:
        res = await s.execute(select(Certificate).options(selectinload(Certificate.student),
                                                           selectinload(Certificate.college))
                              .where(Certificate.is_demo == True).order_by(Certificate.id))  # noqa: E712
        certs = res.scalars().all()
    await engine.dispose()

    active = [c for c in certs if c.status == CertificateStatus.ACTIVE]
    revoked = [c for c in certs if c.status == CertificateStatus.REVOKED]
    if len(active) < 12:
        sys.exit("Not enough demo data. Run: python -m db.seed_demo_data")

    manifest = []

    def make(sub, name, expect, note, **kw):
        p = out / sub / f"{name}.png"
        render_certificate(p, frontend_url=frontend, **kw)
        manifest.append([str(p), expect, note])
        print("[+]", p)

    for c in active[:6]:
        make("real", c.certificate_id, "VERIFIED", "matches DB", **_row(c))

    tamper_specs = [
        ("name", "student_name", lambda r, o: o["student_name"], "name replaced with another student's"),
        ("roll", "roll_number", lambda r, o: r["roll_number"][:-4] + "9999", "roll number altered"),
        ("year", "year", lambda r, o: r["year"] + 1, "graduation year altered"),
        ("course", "course", lambda r, o: "M.Tech" if r["course"] != "M.Tech" else "B.Tech", "degree upgraded/changed"),
        ("department", "department", lambda r, o: "Mechanical Engineering" if r["department"] != "Mechanical Engineering" else "Electrical Engineering", "department changed"),
    ]
    for k, (label, field, fn, note) in enumerate(tamper_specs):
        base, other = _row(active[6 + k]), _row(active[-1 - k])
        row = dict(base)
        row[field] = fn(base, other)
        make("tampered", f"{label}_{base['cert_id']}", "MISMATCH", note, **row)  # QR + ID stay genuine

    for c in revoked[:2]:
        make("revoked", c.certificate_id, "REVOKED", "revoked by institution", **_row(c))

    # several fields changed at once (QR still real)
    base = _row(active[11])
    row = dict(base, student_name=_row(active[-6])["student_name"],
               roll_number=base["roll_number"][:-4] + "9999", year=base["year"] + 1)
    make("tampered", f"multiple_{base['cert_id']}", "MISMATCH", "name + roll number + year altered", **row)

    # forged certificates: details look real, but the QR / printed ID is not in the database
    for k, ghost_id in enumerate(["CERT-AIT-2026-99999", "CERT-BSU-2025-88888", "CERT-CNC-2024-77777"]):
        ghost = _row(active[20 + k])
        ghost["cert_id"] = ghost_id
        make("fake", f"fake_qr_{ghost_id}", "NOT_FOUND", "QR id not in database", **ghost)

    with open(out / "manifest.csv", "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["file", "expected_status", "note"])
        w.writerows(manifest)
    print(f"\nDone: {len(manifest)} images in {out}/ (see manifest.csv)")


if __name__ == "__main__":
    asyncio.run(main())
