"""
ONE COMMAND: fills the database with demo data AND creates the certificate images.

    python db/setup_demo.py          (or: python -m db.setup_demo from the backend folder)

Result: database has colleges, students, certificates (IDs + details)
        test_certificates/real | tampered | revoked | fake  +  manifest.csv
"""
import asyncio
import json
import os
import sys
from pathlib import Path

_HERE = Path(__file__).resolve().parent
for _p in (_HERE.parent, _HERE.parent / "backend"):
    if (_p / "app").is_dir() and str(_p) not in sys.path:
        sys.path.insert(0, str(_p))
if str(_HERE) not in sys.path:
    sys.path.insert(0, str(_HERE))

os.environ.setdefault("OUT_DIR", "test_certificates")

import seed_demo_data            # noqa: E402
import generate_test_certificates  # noqa: E402


async def run():
    print("== 1/2 Seeding database ==")
    print(json.dumps(await seed_demo_data.seed_demo(), indent=2))
    print("\n== 2/2 Creating certificate images ==")
    await generate_test_certificates.main()


if __name__ == "__main__":
    asyncio.run(run())
