## Safe Log AI (backend)

Express + MongoDB backend for collecting application error logs, masking sensitive data, deduplicating them via fingerprints, and returning cached AI solutions when available.

### Current status (what’s built)
- API server boots from `backend/server.js`, loads environment variables, and connects to MongoDB via `backend/config/db.js`.
- Error logs are stored in `backend/models/ErrorLog.js` with fields for `userId`, `fingerprint`, `maskedLog`, optional `aiSolution`, and a `hitCount` to track repeat occurrences.
- `/api/logs/submit` (see `backend/routes/logs.js`) accepts `userId` and `rawLog`.
  - It sends `rawLog` to the Presidio masking service and receives `maskedLog`.
  - It generates a fingerprint from `maskedLog` (and also computes a legacy fingerprint from `rawLog` for backward-compatible cache hits).
  - If a matching log exists (by fingerprint), it increments `hitCount` and returns the cached `aiSolution` with `fromCache: true` (no AI call).
  - Otherwise (new fingerprint), it calls NVIDIA NIM Chat Completions using model `meta/llama-4-maverick-17b-128e-instruct`, stores `{ maskedLog, fingerprint, aiSolution }`, and returns the AI solution.
- Fingerprint utility in `backend/utils/fingerprint.js` normalizes error text and hashes it (SHA-256) for deduplication.
- Presidio masking client in `backend/services/presidioService.js` posts logs to the masking service with a regex fallback.
- Masking microservice (`masking-service/app.py`) built with Flask + Presidio Analyzer/Anonymizer:
  - Standard PII plus custom recognizers for `SESSION_TOKEN`, `USER_ID`, `API_KEY`
  - Post-processing masks sensitive key/value pairs and high-entropy tokens; a fail-safe masks any remaining long high-entropy tokens to `<UNKNOWN>`.
  - Exception-line protection: any line matching `\b[A-Za-z]+Exception\b` is skipped by Presidio + post-processing + fail-safe, and preserved verbatim in the final output.

### Project structure
- `backend/server.js` – Express bootstrap and route registration.
- `backend/config/db.js` – MongoDB connection helper.
- `backend/routes/logs.js` – Log submission endpoint logic.
- `backend/models/ErrorLog.js` – Mongoose schema/model.
- `backend/utils/fingerprint.js` – Fingerprinting helper for log normalization.
- `backend/services/presidioService.js` – Outbound client to masking service with timeout and regex fallback.
- `masking-service/app.py` – Flask + Presidio masking API.

### Prerequisites
- Node.js 18+ recommended.
- MongoDB instance (local or hosted).
- Python 3.10+ for masking service.

### Clone & run (fresh machine)
1) Clone the repo
```
git clone <your-repo-url>
cd safe-log-ai
```

2) Start MongoDB
- Make sure MongoDB is running and reachable (local or hosted).

3) Start the masking service (Python)
```
cd masking-service
python -m venv venv
.\venv\Scripts\pip install -r requirements.txt
.\venv\Scripts\python app.py
```

It should listen on `http://localhost:5001`.

4) Start the backend API (Node.js)
```
cd backend
npm install
node server.js
```

Create `.env` in `backend/` with:
```
PORT=3000
MONGO_URI=mongodb://localhost:27017/safe-log-ai
NVIDIA_NIM_API_KEY=your_nvidia_nim_api_key
```

Backend should listen on `http://localhost:3000`.

5) Quick test
```
node test/testBackendFlow.js
```

### API reference
- `POST /api/logs/submit`
  - Body: `{ "userId": "string", "rawLog": "string" }`
  - Responses:
    - Cache hit: `{ "fromCache": true, "solution": "<cached aiSolution>", "_id": "<logId>" }`
    - New log: `{ "fromCache": false, "message": "<aiSolution>", "solution": "<aiSolution>", "_id": "<logId>" }`

### Data model (`ErrorLog`)
```
userId: string (required)
fingerprint: string (required, indexed)
maskedLog: string (required)
aiSolution: string | null (defaults to null)
hitCount: number (defaults to 1)
timestamps: createdAt / updatedAt (auto)
```

### How deduplication and masking work
- Route sends `rawLog` to the masking service and receives `maskedLog`.
- Route fingerprints `maskedLog` and checks MongoDB for existing `{ userId, fingerprint }` (also checks a legacy fingerprint derived from `rawLog` for older records).
- Masking service uses Presidio (standard + custom recognizers) and additional regex/entropy-based passes to scrub secrets.
- Lines containing an exception token (matching `\b[A-Za-z]+Exception\b`) are not analyzed or modified by any masking stage.
- Cache hit returns the stored solution; cache miss calls NVIDIA NIM and stores the new solution.

### Suggested next steps
- Add retry/backoff and better error surfacing for AI call failures.
- Add validation (e.g., using `express-validator`/`zod`) and error handling middleware.
- Add environment-aware logging and health checks.
- Add tests and a `start`/`dev` script to `package.json`.

### Troubleshooting
- If masking returns fallback behavior, ensure the masking service is running on `http://localhost:5001`.
- If new logs return 500, confirm `NVIDIA_NIM_API_KEY` is set and valid.
- If MongoDB connection fails, verify `MONGO_URI` and that MongoDB is running.

