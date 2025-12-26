# Safe Log AI - Setup & Verification Guide

## Quick Fix for CORS Error

The CORS error occurs because the backend server needs to be **running and restarted** with the updated CORS configuration.

## Step-by-Step Setup

### 1. Start the Masking Service (Python)

Open a terminal and run:
```bash
cd masking-service
python app.py
```

**Expected output:** `Running on http://0.0.0.0:5001`

### 2. Start the Backend Server (Node.js)

Open a **NEW terminal** and run:
```bash
cd backend
node server.js
```

**Expected output:**
```
Server running on port 3000
CORS enabled for: http://localhost:5173
```

**Important:** If the backend was already running, you MUST restart it to apply the CORS changes.

### 3. Start the Frontend (React/Vite)

Open a **NEW terminal** and run:
```bash
cd frontend
npm run dev
```

**Expected output:** Frontend running on `http://localhost:5173`

### 4. Verify Everything is Connected

#### Test Backend Health:
Open browser and visit: `http://localhost:3000/health`
Should return: `{"status":"ok","message":"Backend is running"}`

#### Test Masking Service:
Open browser and visit: `http://localhost:5001/mask` (should show error, but confirms service is running)

#### Test Frontend:
Open browser and visit: `http://localhost:5173`

## Troubleshooting

### CORS Error Still Appearing?

1. **Make sure backend is running:**
   - Check terminal shows "Server running on port 3000"
   - Visit `http://localhost:3000/health` in browser

2. **Restart the backend:**
   - Stop the backend (Ctrl+C)
   - Start it again: `node server.js`

3. **Check CORS configuration:**
   - Verify `backend/server.js` has `app.use(cors({...}))` before routes

### Masking Service Not Working?

1. **Check if it's running:**
   - Should be on port 5001
   - Backend will use fallback regex masking if service is down

2. **Verify Python dependencies:**
   ```bash
   cd masking-service
   pip install -r requirements.txt
   ```

### Database Connection Issues?

1. **Make sure MongoDB is running:**
   - Check your `.env` file in `backend/` has correct `MONGO_URI`

2. **Verify `.env` file exists:**
   ```
   PORT=3000
   MONGO_URI=mongodb://localhost:27017/safe-log-ai
   JWT_SECRET=your-secret-key-change-in-production
   NVIDIA_NIM_API_KEY=your_nvidia_nim_api_key
   ```

## Testing the Full Flow

1. **Signup:**
   - Go to `http://localhost:5173/signup`
   - Create an account with email and password (min 6 chars)

2. **Login:**
   - Go to `http://localhost:5173/login`
   - Login with your credentials

3. **Submit Log:**
   - Go to Dashboard
   - Paste an error log
   - Submit and see AI solution

4. **View History:**
   - Go to History page
   - See all your submitted logs

## All Services Running Checklist

- [ ] Masking service running on port 5001
- [ ] Backend server running on port 3000
- [ ] Frontend dev server running on port 5173
- [ ] MongoDB running and connected
- [ ] No CORS errors in browser console
- [ ] Can access `/health` endpoint

