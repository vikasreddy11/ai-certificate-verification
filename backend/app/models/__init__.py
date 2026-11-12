import enum
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Enum, Index
)
from sqlalchemy.orm import relationship
from app.core.database import Base

class UserRole(str, enum.Enum):
    SUPER_ADMIN = "SUPER_ADMIN"
    COLLEGE_ADMIN = "COLLEGE_ADMIN"
    COMPANY = "COMPANY"

class CertificateStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    REVOKED = "REVOKED"
    SUSPENDED = "SUSPENDED"

class VerificationStatus(str, enum.Enum):
    VERIFIED = "VERIFIED"
    MISMATCH = "MISMATCH"
    INVALID_SIGNATURE = "INVALID_SIGNATURE"
    REVOKED = "REVOKED"
    NOT_FOUND = "NOT_FOUND"
    MANUAL_REVIEW_REQUIRED = "MANUAL_REVIEW_REQUIRED"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.COMPANY)
    college_id = Column(Integer, ForeignKey("colleges.id", ondelete="SET NULL"), nullable=True)
    company_name = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    college = relationship("College", back_populates="users")
    verification_logs = relationship("VerificationLog", back_populates="verifier")
    audit_logs = relationship("AuditLog", back_populates="user")

class College(Base):
    __tablename__ = "colleges"

    id = Column(Integer, primary_key=True, index=True)
    college_name = Column(String(255), nullable=False, index=True)
    college_code = Column(String(50), unique=True, index=True, nullable=False)
    address = Column(Text, nullable=True)
    official_email = Column(String(255), unique=True, nullable=False)
    contact_number = Column(String(50), nullable=True)
    verification_status = Column(String(50), default="APPROVED", nullable=False)
    is_demo = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    users = relationship("User", back_populates="college")
    students = relationship("Student", back_populates="college", cascade="all, delete-orphan")
    certificates = relationship("Certificate", back_populates="college", cascade="all, delete-orphan")

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    college_id = Column(Integer, ForeignKey("colleges.id", ondelete="CASCADE"), nullable=False)
    student_name = Column(String(255), nullable=False, index=True)
    roll_number = Column(String(100), nullable=False)
    department = Column(String(150), nullable=False)
    course = Column(String(150), nullable=False)
    graduation_year = Column(Integer, nullable=False)
    is_demo = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    college = relationship("College", back_populates="students")
    certificates = relationship("Certificate", back_populates="student", cascade="all, delete-orphan")

    __table_args__ = (
        Index("idx_student_college_roll", "college_id", "roll_number", unique=True),
    )

class Certificate(Base):
    __tablename__ = "certificates"

    id = Column(Integer, primary_key=True, index=True)
    certificate_id = Column(String(100), unique=True, index=True, nullable=False)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    college_id = Column(Integer, ForeignKey("colleges.id", ondelete="CASCADE"), nullable=False)
    certificate_type = Column(String(100), default="Degree Certificate", nullable=False)
    issue_date = Column(DateTime, nullable=False, default=datetime.utcnow)
    graduation_year = Column(Integer, nullable=False)
    status = Column(Enum(CertificateStatus), default=CertificateStatus.ACTIVE, nullable=False)
    verification_token_hash = Column(String(512), nullable=True)
    signature = Column(Text, nullable=True)
    is_demo = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    student = relationship("Student", back_populates="certificates")
    college = relationship("College", back_populates="certificates")
    verification_logs = relationship("VerificationLog", back_populates="certificate", cascade="all, delete-orphan")

class VerificationLog(Base):
    __tablename__ = "verification_logs"

    id = Column(Integer, primary_key=True, index=True)
    certificate_id = Column(String(100), ForeignKey("certificates.certificate_id", ondelete="SET NULL"), nullable=True)
    company_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    verification_method = Column(String(50), nullable=False) # QR_SCAN, OCR_UPLOAD, MANUAL_INPUT
    extracted_data = Column(Text, nullable=True)             # JSON string of OCR/payload data
    comparison_result = Column(Text, nullable=True)          # JSON string of field-by-field diff
    verification_status = Column(Enum(VerificationStatus), nullable=False)
    is_demo = Column(Boolean, default=False, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)

    verifier = relationship("User", back_populates="verification_logs")
    certificate = relationship("Certificate", back_populates="verification_logs")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    action = Column(String(100), nullable=False)
    entity_type = Column(String(100), nullable=False)
    entity_id = Column(String(100), nullable=True)
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="audit_logs")

