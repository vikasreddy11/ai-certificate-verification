from fastapi import APIRouter, Depends, HTTPException
from app.core.database import AsyncSessionLocal
from app.core.deps import require_role
from app.models import UserRole, User
from db.seed_demo_data import seed_demo, reset_demo_data

router = APIRouter()


@router.post("/reset")
async def reset_demo(current_user: User = Depends(require_role([UserRole.SUPER_ADMIN]))):
    async with AsyncSessionLocal() as session:
        await reset_demo_data(session)
        await session.commit()
    return {"message": "All synthetic demo data removed successfully."}


@router.post("/seed")
async def seed_demo_endpoint(current_user: User = Depends(require_role([UserRole.SUPER_ADMIN]))):
    try:
        summary = await seed_demo()
        return {"message": "Synthetic demo data seeded successfully.", **summary}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to seed demo data: {e}")
