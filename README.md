# Cattle & Buffalo Breed Recognition System

This project has:
- Backend: Flask + TensorFlow API
- Frontend: React (Vite)

## Quick Run (Recommended)

Open 2 terminals.

### Terminal 1 - Backend

```powershell
cd D:\3-2\hackathon
.\.venv310\Scripts\python.exe backend\app.py
```

### Terminal 2 - Frontend

```powershell
cd D:\3-2\hackathon\frontend
npm run dev
```

## URLs

- Frontend UI: `http://localhost:5173`
- Backend health: `http://127.0.0.1:5000/health`
- Backend breed list: `http://127.0.0.1:5000/class_list`

If port 5173 is busy, Vite will show another port (for example 5174). Use that frontend URL.

## First-Time Setup (One Time Only)

Run these once before starting the project.

### 1) Create Python 3.10 environment

```powershell
cd D:\3-2\hackathon
py -3.10 -m venv .venv310
```

### 2) Install backend dependencies

```powershell
cd D:\3-2\hackathon
.\.venv310\Scripts\python.exe -m pip install --upgrade pip
.\.venv310\Scripts\python.exe -m pip install -r backend\requirements.txt
```

### 3) Install frontend dependencies

```powershell
cd D:\3-2\hackathon\frontend
npm install
```

## Test Flow

1. Open frontend URL.
2. Upload image or capture from camera.
3. Click Predict Breed.
4. Confirm breed or change breed.
5. Submit final decision.

Saved decisions are written to:

`D:\3-2\hackathon\backend\submissions.json`

## Common Notes

- `http://127.0.0.1:5000/` showing "Not Found" is normal.
  The backend is API-only and does not define a root `/` page.
- Start backend first, then frontend.
- Keep both terminals running while testing.
