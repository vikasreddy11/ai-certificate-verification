from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.deps import get_current_user
from app.models import User, UserRole, College, AuditLog
from app.schemas import Token, LoginRequest, UserCreate, UserOut

router = APIRouter()

@router.post("/login", response_model=Token)
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == req.email))
    user = result.scalars().first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is disabled")

    # Record login in audit log
    audit = AuditLog(user_id=user.id, action="LOGIN", entity_type="USER", entity_id=str(user.id), details=f"User {user.email} logged in")
    db.add(audit)
    await db.commit()

    token = create_access_token(data={"sub": user.email, "role": user.role.value, "user_id": user.id})
    return Token(
        access_token=token,
        token_type="bearer",
        user_id=user.id,
        full_name=user.full_name,
        email=user.email,
        role=user.role,
        college_id=user.college_id,
        company_name=user.company_name
    )

@router.post("/register-company", response_model=UserOut)
async def register_company(data: UserCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == data.email))
    if result.scalars().first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    new_user = User(
        full_name=data.full_name,
        email=data.email,
        password_hash=get_password_hash(data.password),
        role=UserRole.COMPANY,
        company_name=data.company_name or data.full_name,
        college_id=None
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user

@router.get("/me", response_model=UserOut)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

