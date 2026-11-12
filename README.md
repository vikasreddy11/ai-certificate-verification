# CertiVerify AI - AI-Based Fake Certificate Detection and Verification Platform

A modern, enterprise-grade full-stack web application bridging educational institutions and hiring companies to detect academic credential fraud and verify certificates using **Ed25519 asymmetric cryptography**, **QR code tokens**, and **AI/OCR document matching**.

---

## Architecture Overview

```
                      ┌───────────────────────────────────────┐
                      │          CertiVerify AI Platform      │
                      └──────────────────┬────────────────────┘
                                         │
        ┌────────────────────────────────┼────────────────────────────────┐
        │                                │                                │
┌───────▼────────┐             ┌─────────▼────────┐             ┌─────────▼────────┐
│  Super Admin   │             │  College Admin   │             │     Company      │
│  - Analytics   │             │  - Enroll Student│             │  - Scan QR Code  │
│  - Colleges    │             │  - Issue Certs   │             │  - Upload Doc/PDF│
│  - Audit Logs  │             │  - Sign & Gen QR │             │  - Run OCR Match │
│  - Demo Reset  │             │  - Revocations   │             │  - View Report   │
└────────────────┘             └──────────────────┘             └──────────────────┘
```

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS, Headless UI, Heroicons, Axios.
- **Backend**: FastAPI, Async SQLAlchemy 2.0, PostgreSQL (asyncpg), Pydantic v2.
- **Security & Signatures**: Argon2 password hashing, JWT authentication, **Ed25519** asymmetric digital signing.
- **AI & OCR Pipeline**: OpenCV document pre-processing (denoising, grayscale, adaptive Gaussian thresholding), PaddleOCR text extraction engine, NLP regex field mapping.

---

## Project Structure

```
mini Project/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── analytics.py        # System metrics, logs, company history
│   │   │   ├── auth.py             # Login, register, me endpoints
│   │   │   ├── certificates.py     # Certificate issuance, Ed25519 signing, QR generation
│   │   │   ├── colleges.py         # University CRUD & college admins
│   │   │   ├── demo_data.py        # Seed & reset synthetic data endpoints
│   │   │   ├── students.py         # Student records & CSV bulk upload
│   │   │   └── verification.py     # Public QR verify & AI/OCR document pipeline
│   │   ├── core/
│   │   │   ├── config.py           # App settings & secret keys
│   │   │   ├── database.py         # Async SQLAlchemy engine & session manager
│   │   │   ├── deps.py             # Auth dependencies & RBAC guards
│   │   │   └── security.py         # Argon2 hashing & Ed25519 cryptographic signatures
│   │   ├── models/                 # PostgreSQL tables (users, colleges, students, etc.)
│   │   ├── schemas/                # Pydantic validation models
│   │   ├── services/
│   │   │   └── ocr_service.py      # OpenCV document pre-processing & PaddleOCR logic
│   │   └── main.py                 # FastAPI application mount & CORS
│   └── requirements.txt
├── frontend/
│   ├── components/
│   │   └── DashboardLayout.tsx     # Role-based sidebar layout with DEMO badge
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── colleges.tsx        # Super admin institution management & admin creation
│   │   │   └── dashboard.tsx       # Super admin live metrics, analytics & demo controls
│   │   ├── college/
│   │   │   └── certificates.tsx    # College admin certificate issuance, QR vault & revoking
│   │   ├── company/
│   │   │   ├── scan.tsx            # Camera viewfinder & direct ID scanner
│   │   │   └── upload.tsx          # OCR document upload & discrepancy comparison studio
│   │   ├── verify/
│   │   │   └── [certificate_id].tsx # Public cryptographic verification endpoint
│   │   ├── index.tsx               # Enterprise landing page
│   │   ├── login.tsx               # Sign in page with 1-click quick demo fill buttons
│   │   └── _app.tsx
│   ├── styles/globals.css
│   ├── utils/api.ts
│   └── package.json
├── db/
│   └── seed_demo_data.py           # 3 colleges, 50 students, 50 signed certificates generator
├── docker-compose.yml              # Complete orchestration (PostgreSQL + FastAPI + Next.js)
├── .env.example
└── README.md
```

---

## Quick Start Guide

### Option 1: Docker Compose (Recommended)

1. Clone or navigate to the repository directory:
   ```bash
   cd "mini Project"
   ```
2. Copy the environment variables:
   ```bash
   cp .env.example .env
   ```
3. Start the entire platform with Docker Compose:
   ```bash
   docker-compose up --build
   ```
4. Access the applications:
   - **Frontend UI**: [http://localhost:3000](http://localhost:3000)
   - **Backend API & Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

### Option 2: Local Development Setup

#### 1. Database Setup
Ensure PostgreSQL is installed and running locally, then create the database:
```sql
CREATE DATABASE certiverify_db;
```

#### 2. Backend Setup
```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
```

Seed the synthetic demo database:
```bash
python ../db/seed_demo_data.py
```

Run the backend server:
```bash
uvicorn app.main:app --reload --port 8000
```

#### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## Demo Accounts & Test Credentials

The seeding script prepares three primary test accounts:

| Role | Email | Password | Scope / Capabilities |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@certiverify.ai` | `Admin@123456` | Complete platform control, manage colleges, view audit logs, reset demo data. |
| **College Admin** | `admin@ait.edu` | `College@123` | Apex Institute of Technology (`AIT`): Issue signed certificates, download QRs, revoke credentials. |
| **Recruiter / Company**| `recruiter@google.com` | `Recruiter@123` | Scan QR codes, upload documents for AI/OCR comparison, check discrepancies. |

> *Tip: On the **Login Page** (`/login`), click any of the "Quick Demo Fill" buttons to populate test credentials instantly.*

---

## Testing Key Workflows

### 1. Public QR Verification
- Open your browser and navigate to:
  `http://localhost:3000/verify/CERT-AIT-2026-00001`
- The system checks the authoritative database and validates the **Ed25519 digital signature**, displaying `VERIFIED AUTHENTIC`.
- Try verifying a revoked certificate:
  `http://localhost:3000/verify/CERT-BSU-2025-00036` (Displays `REVOKED CREDENTIAL`).

### 2. Company AI & OCR Upload Pipeline
1. Log in as Company (`recruiter@google.com`).
2. Go to **OCR File Verification** (`/company/upload`).
3. Upload `sample_authentic_certificate.png` (generated during seeding) or any degree certificate.
4. The system executes OpenCV filtering, PaddleOCR extraction, and NLP pattern matching, presenting a green field-by-field verification report.
5. Upload `sample_tampered_certificate.png` to test discrepancy detection: mismatched candidate details appear in red with differences highlighted.

### 3. Institution Certificate & QR Issuance
1. Log in as College Admin (`admin@ait.edu`).
2. Navigate to **Issue Certificates & QR** (`/college/certificates`).
3. Select an enrolled student, choose graduation year, and click **Generate & Sign**.
4. The backend computes the Ed25519 signature and prepares the certificate record.
5. Click **View QR** to inspect or download the print-ready high-resolution QR code.
