from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from app.core.database import get_db
from app.core.deps import require_role, get_current_user
from app.core.security import get_password_hash
from app.models import College, User, UserRole, AuditLog
from app.schemas import CollegeCreate, CollegeOut, UserCreate, UserOut

router = APIRouter()

@router.get("", response_model=List[CollegeOut])
async def list_colleges(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role == UserRole.COLLEGE_ADMIN:
        result = await db.execute(select(College).where(College.id == current_user.college_id))
    else:
        result = await db.execute(select(College).order_by(College.id.desc()))
    return result.scalars().all()

@router.post("", response_model=CollegeOut)
async def create_college(
    data: CollegeCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.SUPER_ADMIN]))
):
    # Check duplicate code or email
    existing = await db.execute(select(College).where(
        (College.college_code == data.college_code) | (College.official_email == data.official_email)
    ))
    if existing.scalars().first():
        raise HTTPException(status_code=400, detail="College code or official email already exists")

    college = College(
        college_name=data.college_name,
        college_code=data.college_code.upper(),
        address=data.address,
        official_email=data.official_email,
        contact_number=data.contact_number,
        verification_status="APPROVED",
        is_demo=False
    )
    db.add(college)
    await db.commit()
    await db.refresh(college)

    audit = AuditLog(
        user_id=current_user.id,
        action="CREATE_COLLEGE",
        entity_type="COLLEGE",
        entity_id=str(college.id),
        details=f"Created college {college.college_name} ({college.college_code})"
    )
    db.add(audit)
    await db.commit()

    return college

@router.post("/{college_id}/admins", response_model=UserOut)
async def create_college_admin(
    college_id: int,
    data: UserCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.SUPER_ADMIN]))
):
    college = await db.get(College, college_id)
    if not college:
        raise HTTPException(status_code=404, detail="College not found")

    existing_user = await db.execute(select(User).where(User.email == data.email))
    if existing_user.scalars().first():
        raise HTTPException(status_code=400, detail="Email already registered")

    admin = User(
        full_name=data.full_name,
        email=data.email,
        password_hash=get_password_hash(data.password),
        role=UserRole.COLLEGE_ADMIN,
        college_id=college_id
    )
    db.add(admin)
    await db.commit()
    await db.refresh(admin)

    return admin

@router.delete("/{college_id}")
async def delete_college(
    college_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.SUPER_ADMIN]))
):
    college = await db.get(College, college_id)
    if not college:
        raise HTTPException(status_code=404, detail="College not found")

    await db.delete(college)
    await db.commit()
    return {"message": f"College {college.college_name} deleted successfully"}

