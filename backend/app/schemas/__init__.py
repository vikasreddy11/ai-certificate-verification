from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from app.models import UserRole, CertificateStatus, VerificationStatus

class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    full_name: str
    email: str
    role: UserRole
    college_id: Optional[int] = None
    company_name: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: UserRole
    college_id: Optional[int] = None
    company_name: Optional[str] = None

class UserOut(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    role: UserRole
    college_id: Optional[int] = None
    company_name: Optional[str] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class CollegeCreate(BaseModel):
    college_name: str
    college_code: str
    address: Optional[str] = None
    official_email: EmailStr
    contact_number: Optional[str] = None

class CollegeOut(BaseModel):
    id: int
    college_name: str
    college_code: str
    address: Optional[str] = None
    official_email: EmailStr
    contact_number: Optional[str] = None
    verification_status: str
    is_demo: bool
    created_at: datetime

    class Config:
        from_attributes = True

class StudentCreate(BaseModel):
    college_id: Optional[int] = None
    student_name: str
    roll_number: str
    department: str
    course: str
    graduation_year: int

class StudentOut(BaseModel):
    id: int
    college_id: int
    student_name: str
    roll_number: str
    department: str
    course: str
    graduation_year: int
    is_demo: bool
    created_at: datetime

    class Config:
        from_attributes = True

class CertificateCreate(BaseModel):
    student_id: int
    college_id: Optional[int] = None
    certificate_type: str = "Degree Certificate"
    graduation_year: int

class CertificateOut(BaseModel):
    id: int
    certificate_id: str
    student_id: int
    college_id: int
    certificate_type: str
    issue_date: datetime
    graduation_year: int
    status: CertificateStatus
    verification_token_hash: Optional[str] = None
    signature: Optional[str] = None
    is_demo: bool
    created_at: datetime
    student_name: Optional[str] = None
    college_name: Optional[str] = None

    class Config:
        from_attributes = True

class VerificationResultOut(BaseModel):
    certificate_id: Optional[str]
    verification_status: VerificationStatus
    verification_method: str
    message: str
    matching_fields: dict = {}
    mismatching_fields: dict = {}
    is_demo: bool = False
    official_record: Optional[dict] = None
    extracted_record: Optional[dict] = None
    timestamp: datetime

