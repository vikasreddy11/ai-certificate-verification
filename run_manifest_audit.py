"""
End-to-End Manifest and API Verification Script for CertiVerify AI
"""
import asyncio
import csv
import os
import sys
from pathlib import Path

# Setup paths and environment
BACKEND_DIR = Path(__file__).resolve().parent / "backend"
sys.path.insert(0, str(BACKEND_DIR))
DB_PATH = (Path(__file__).resolve().parent / "certiverify.db").resolve().as_posix()
os.environ["DATABASE_URL"] = f"sqlite+aiosqlite:///{DB_PATH}"

import httpx
from app.main import app

async def run_audit():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as client:
        # 1. Login as recruiter@google.com
        login_res = await client.post("/api/auth/login", json={
            "email": "recruiter@google.com",
            "password": "Recruiter@123"
        })
        if login_res.status_code != 200:
            print(f"[FAIL] Login failed: {login_res.status_code} - {login_res.text}")
            return
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        print(f"[OK] Authenticated as recruiter@google.com")

        # 2. Read manifest.csv
        manifest_path = BACKEND_DIR / "test_certificates" / "manifest.csv"
        if not manifest_path.exists():
            print(f"[FAIL] Manifest not found at {manifest_path}")
            return

        with open(manifest_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            rows = list(reader)

        print(f"\nProcessing {len(rows)} test certificate images...\n")
        results = []
        all_passed = True

        for row in rows:
            rel_file = row["file"].replace("\\", "/")
            expected_status = row["expected_status"]
            note = row.get("note", "")

            # file path relative to BACKEND_DIR
            if rel_file.startswith("test_certificates/"):
                img_path = BACKEND_DIR / rel_file
            else:
                img_path = BACKEND_DIR / "test_certificates" / rel_file

            if not img_path.exists():
                print(f"[FAIL] File not found: {img_path}")
                all_passed = False
                continue

            with open(img_path, "rb") as img_f:
                img_bytes = img_f.read()

            upload_res = await client.post(
                "/api/verification/upload",
                headers=headers,
                files={"file": (img_path.name, img_bytes, "image/png")}
            )

            if upload_res.status_code != 200:
                print(f"[FAIL] Upload error for {img_path.name}: {upload_res.status_code} - {upload_res.text}")
                all_passed = False
                continue

            data = upload_res.json()
            actual_status = data.get("verification_status")
            cert_id = data.get("certificate_id") or "N/A"
            mismatching_fields = data.get("mismatching_fields") or {}

            matched = (actual_status == expected_status)
            if not matched:
                all_passed = False

            results.append({
                "file": img_path.name,
                "cert_id": cert_id,
                "expected": expected_status,
                "actual": actual_status,
                "matched": matched,
                "mismatches": list(mismatching_fields.keys()),
                "note": note
            })

        # 3. Print Results Table
        print("=" * 115)
        print(f"{'File Name':<38} | {'Cert ID':<22} | {'Expected':<10} | {'Actual':<10} | {'Match':<5} | {'Mismatched Fields'}")
        print("=" * 115)
        for r in results:
            match_str = "PASS" if r["matched"] else "FAIL"
            mismatches_str = ", ".join(r["mismatches"]) if r["mismatches"] else "-"
            print(f"{r['file']:<38} | {r['cert_id']:<22} | {r['expected']:<10} | {r['actual']:<10} | {match_str:<5} | {mismatches_str}")
        print("=" * 115)

        # 4. Test GET /api/verification/verify/<real id> and <unknown id>
        real_id = "CERT-AIT-2024-00060"
        unknown_id = "CERT-AIT-2026-99999"

        print(f"\nTesting direct QR endpoint:")
        res_real = await client.get(f"/api/verification/verify/{real_id}")
        real_status = res_real.json().get("verification_status")
        print(f" - GET /api/verification/verify/{real_id}: {real_status} (Expected: VERIFIED) -> {'PASS' if real_status == 'VERIFIED' else 'FAIL'}")

        res_unknown = await client.get(f"/api/verification/verify/{unknown_id}")
        unknown_status = res_unknown.json().get("verification_status")
        print(f" - GET /api/verification/verify/{unknown_id}: {unknown_status} (Expected: NOT_FOUND) -> {'PASS' if unknown_status == 'NOT_FOUND' else 'FAIL'}")

        if all_passed and real_status == "VERIFIED" and unknown_status == "NOT_FOUND":
            print("\n>>> ALL 17 MANIFEST ROWS AND DIRECT VERIFY TESTS PASSED! <<<")
        else:
            print("\n>>> SOME TESTS FAILED. CHECK DETAILS ABOVE. <<<")

if __name__ == "__main__":
    asyncio.run(run_audit())
