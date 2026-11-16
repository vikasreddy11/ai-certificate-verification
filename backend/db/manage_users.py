"""
List, add or reset login accounts directly in the database.

Run from the backend folder (same env vars as for seeding: DATABASE_URL, ED25519_PRIVATE_KEY_HEX):
  python db/manage_users.py list
  python db/manage_users.py add --email boss@college.edu --password "Strong@123" --role COLLEGE_ADMIN --college-code AIT --name "Boss Name"
  python db/manage_users.py add --email root@me.com --password "Strong@123" --role SUPER_ADMIN --name "Root"
  python db/manage_users.py add --email hr@firm.com --password "Strong@123" --role COMPANY --company "Firm Ltd" --name "HR"
  python db/manage_users.py reset-password --email admin@ait.edu --password "NewPass@123"
"""
import argparse
import asyncio
import sys
from pathlib import Path

_HERE = Path(__file__).resolve().parent
for _p in (_HERE.parent, _HERE.parent / "backend"):
    if (_p / "app").is_dir() and str(_p) not in sys.path:
        sys.path.insert(0, str(_p))

from sqlalchemy.future import select  # noqa: E402
from app.core.database import AsyncSessionLocal, engine  # noqa: E402
from app.core.security import get_password_hash  # noqa: E402
from app.models import User, College, UserRole  # noqa: E402


async def main():
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)
    sub.add_parser("list")
    a = sub.add_parser("add")
    a.add_argument("--email", required=True)
    a.add_argument("--password", required=True)
    a.add_argument("--role", required=True, choices=[r.value for r in UserRole])
    a.add_argument("--name", default="")
    a.add_argument("--college-code")
    a.add_argument("--company")
    r = sub.add_parser("reset-password")
    r.add_argument("--email", required=True)
    r.add_argument("--password", required=True)
    args = ap.parse_args()

    async with AsyncSessionLocal() as s:
        if args.cmd == "list":
            users = (await s.execute(select(User).order_by(User.id))).scalars().all()
            colleges = {c.id: c.college_code for c in (await s.execute(select(College))).scalars().all()}
            print(f"{'ID':<4} {'EMAIL':<32} {'ROLE':<14} {'COLLEGE':<8} ACTIVE")
            for u in users:
                print(f"{u.id:<4} {u.email:<32} {u.role.value:<14} {colleges.get(u.college_id, '-'):<8} {u.is_active}")
            print(f"\n{len(users)} users, colleges: {', '.join(colleges.values()) or 'none'}")

        elif args.cmd == "add":
            email = args.email.strip().lower()
            if (await s.execute(select(User).where(User.email == email))).scalars().first():
                sys.exit(f"User {email} already exists. Use reset-password to change the password.")
            college_id = None
            if args.role == "COLLEGE_ADMIN":
                if not args.college_code:
                    sys.exit("COLLEGE_ADMIN needs --college-code (e.g. AIT). Run 'list' to see codes.")
                col = (await s.execute(select(College).where(College.college_code == args.college_code.upper()))).scalars().first()
                if not col:
                    sys.exit(f"College {args.college_code} not found.")
                college_id = col.id
            s.add(User(full_name=args.name or email, email=email, password_hash=get_password_hash(args.password),
                       role=UserRole(args.role), college_id=college_id, company_name=args.company, is_active=True))
            await s.commit()
            print(f"Created {args.role} {email}")

        elif args.cmd == "reset-password":
            u = (await s.execute(select(User).where(User.email == args.email.strip().lower()))).scalars().first()
            if not u:
                sys.exit("No such user. Run 'list' to see existing accounts.")
            u.password_hash = get_password_hash(args.password)
            u.is_active = True
            await s.commit()
            print(f"Password reset for {u.email}")
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())