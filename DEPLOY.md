# Deploying CertiVerify AI Backend on Render

## 1. Prerequisites & Files
All backend files are located in `/backend`:
- `requirements.txt` contains pinned dependencies for Python 3.11.9.
- `app/` contains the application code with asynchronous PostgreSQL (`asyncpg`) and SQLite fallback support.
- `db/` contains `seed_demo_data.py`, `generate_test_certificates.py`, and `setup_demo.py`.

---

## 2. Render Setup Steps

### Step A: Create the Database
1. In your Render Dashboard, click **New +** -> **PostgreSQL**.
2. Name: `certiverify-db`.
3. Plan: **Free**.
4. Once provisioned, note two values:
   - **Internal Database URL** (used by the backend web service).
   - **External Database URL** (used to seed from your laptop).

### Step B: Create the Web Service
1. Click **New +** -> **Web Service** and connect your GitHub repository.
2. Configure settings:
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**:
     ```bash
     pip install -r requirements.txt && pip install --no-deps rapidocr-onnxruntime
     ```
   - **Start Command**:
     ```bash
     uvicorn app.main:app --host 0.0.0.0 --port $PORT
     ```
3. Set **Environment Variables**:
   - `PYTHON_VERSION`: `3.11.9`
   - `DATABASE_URL`: *Internal Database URL* (e.g., `postgresql://certiverify_user:password@dpg-...-a/certiverify_db`)
   - `SECRET_KEY`: A 64-char hex string (generate via: `python -c "import secrets; print(secrets.token_hex(32))"`)
   - `ED25519_PRIVATE_KEY_HEX`: The 64-char hex private key (e.g. `4b1f4a9b6c4e2a8f9c1b3d5e7f0a2c4e6b8d0f2a4c6e8b0d2f4a6c8e0b2d4f6a`). **Must match the key used when seeding certificates, or signature checks will fail.**
   - `FRONTEND_URL`: Your deployed Render frontend URL (e.g., `https://certiverify.onrender.com`).
4. Click **Create Web Service**.

### Step C: Verify Health Check
Once deployed, open:
```
https://<your-backend>.onrender.com/api/health
```
Expected output:
```json
{"status": "healthy", "service": "CertiVerify AI Backend", "version": "1.0.0"}
```

---

## 3. Seeding the Remote Render Database from Your Laptop

Run the seeder from your local machine pointing to Render's **External Database URL** with SSL required:

### On Windows PowerShell:
```powershell
Set-Location "backend"
$env:DATABASE_URL = "<Render External Database URL>?ssl=require"
$env:ED25519_PRIVATE_KEY_HEX = "4b1f4a9b6c4e2a8f9c1b3d5e7f0a2c4e6b8d0f2a4c6e8b0d2f4a6c8e0b2d4f6a"
.\venv\Scripts\python.exe -m db.seed_demo_data
```

### On macOS / Linux:
```bash
cd backend
export DATABASE_URL="<Render External Database URL>?ssl=require"
export ED25519_PRIVATE_KEY_HEX="4b1f4a9b6c4e2a8f9c1b3d5e7f0a2c4e6b8d0f2a4c6e8b0d2f4a6c8e0b2d4f6a"
python -m db.seed_demo_data
```

---

## 4. Connecting the Deployed Frontend
In your frontend deployment settings (or `.env.production`):
```
NEXT_PUBLIC_API_URL=https://<your-backend>.onrender.com
```
Re-deploy the frontend on Render.

