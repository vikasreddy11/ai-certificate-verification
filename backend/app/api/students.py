from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
import csv
import io
from app.core.database import get_db
from app.core.deps import require_role, get_current_user
from app.models import Student, User, UserRole, College, AuditLog
from app.schemas import StudentCreate, StudentOut

router = APIRouter()

@router.get("", response_model=List[StudentOut])
async def list_students(
    college_id: Optional[int] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = select(Student)
    if current_user.role == UserRole.COLLEGE_ADMIN:
        query = query.where(Student.college_id == current_user.college_id)
    elif college_id:
        query = query.where(Student.college_id == college_id)

    if search:
        search_filter = f"%{search}%"
        query = query.where(
            (Student.student_name.ilike(search_filter)) | 
            (Student.roll_number.ilike(search_filter))
        )

    result = await db.execute(query.order_by(Student.id.desc()))
    return result.scalars().all()

@router.post("", response_model=StudentOut)
async def create_student(
    data: StudentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.SUPER_ADMIN, UserRole.COLLEGE_ADMIN]))
):
    target_college_id = current_user.college_id if current_user.role == UserRole.COLLEGE_ADMIN else data.college_id
    if not target_college_id:
        raise HTTPException(status_code=400, detail="College ID is required")

    # Check roll number uniqueness inside this college
    existing = await db.execute(select(Student).where(
        Student.college_id == target_college_id,
        Student.roll_number == data.roll_number
    ))
    if existing.scalars().first():
        raise HTTPException(status_code=400, detail="Student with this roll number already exists in this college")

    student = Student(
        college_id=target_college_id,
        student_name=data.student_name,
        roll_number=data.roll_number,
        department=data.department,
        course=data.course,
        graduation_year=data.graduation_year,
        is_demo=False
    )
    db.add(student)
    await db.commit()
    await db.refresh(student)

    audit = AuditLog(
        user_id=current_user.id,
        action="CREATE_STUDENT",
        entity_type="STUDENT",
        entity_id=str(student.id),
        details=f"Added student {student.student_name} (Roll: {student.roll_number})"
    )
    db.add(audit)
    await db.commit()

    return student

@router.post("/bulk-upload")
async def bulk_upload_students(
    file: UploadFile = File(...),
    college_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.SUPER_ADMIN, UserRole.COLLEGE_ADMIN]))
):
    target_college_id = current_user.college_id if current_user.role == UserRole.COLLEGE_ADMIN else college_id
    if not target_college_id:
        raise HTTPException(status_code=400, detail="College ID is required")

    content = await file.read()
    decoded = content.decode("utf-8-sig")
    reader = csv.DictReader(io.StringIO(decoded))
    
    created_count = 0
    errors = []

    for idx, row in enumerate(reader):
        try:
            name = row.get("student_name") or row.get("name")
            roll = row.get("roll_number") or row.get("roll_no")
            dept = row.get("department") or row.get("dept", "Computer Science")
            course = row.get("course", "B.Tech")
            grad_year = int(row.get("graduation_year") or row.get("year", 2026))

            if not name or not roll:
                errors.append(f"Row {idx+1}: Name or Roll Number missing")
                continue

            # Check duplicate
            existing = await db.execute(select(Student).where(
                Student.college_id == target_college_id,
                Student.roll_number == roll
            ))
            if existing.scalars().first():
                continue

            s = Student(
                college_id=target_college_id,
                student_name=name,
                roll_number=roll,
                department=dept,
                course=course,
                graduation_year=grad_year,
                is_demo=False
            )
            db.add(s)
            created_count += 1
        except Exception as e:
            errors.append(f"Row {idx+1}: {str(e)}")

    await db.commit()
    return {"message": f"Successfully imported {created_count} students", "errors": errors}

