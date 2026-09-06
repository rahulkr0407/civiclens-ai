# Session Checkpoint — where we finished

> Read this first to resume work quickly. Updated: 2026-09-06.

## 1. Project state (LIVE)

- **Backend**: FastAPI + MongoDB on Render — `https://civiclens-ai-1-f708.onrender.com`
- **Frontend**: Angular + Tailwind on Vercel — `https://civiclensai-two.vercel.app`
- **AI**: Google Gemini via `google-genai==2.21.0`, model `gemini-3.6-flash`
- Both auto-deploy on push to `origin/main`.

## 2. Shipped phases & commits (newest last)

| Commit | What |
|---|---|
| *(next)* | Phase 8 (JWT auth + Dashboard + saved history) — pending deploy. |
| `e56bd10` | Hardening: retry-with-backoff, rate-limit 502s, AFC noise suppression, docs. |
| `1801569` | Phase 7: AI follow-up chat, language toggle, explain cache, Regenerate, 3 new topics (6 total). |
| `0159569` | Fix AI verification (loose title match, source-host URLs) + `gemini-3.6-flash` default. |
| `5b75b42` | Phases 1–6: seed, topics/search, auth, Sources/About, AI explanations + deploy. |

## 3. Feature inventory (all working)

- 6 topics (gst, nep-2020, farmers-protest, dpdp-2023, upi, electoral-bonds)
- `GET /api/topics`; auth signup/login (**JWT now** — `access_token`, `GET /auth/me`)
- `POST /api/ai/explain` (JSON schema output, verified, 10-min in-memory cache)
- `POST /api/ai/chat` (last 6 turns, plain text, URL-checked)
- Language toggle: English / Hindi / Hinglish (explain + chat)
- Regenerate button; rate-limit friendly 502s; provider error logging
- **Dashboard**: per-user saved explanations + conversations (`users_collection.savedHistory`, max 100) — Save buttons on explain/chat, Dashboard page (`/dashboard`), delete/clear

## 4. Known issues / open items (IMPORTANT)

1. **Free-tier quota: 20 requests/day for gemini-3.6-flash** (`generate_content_free_tier_requests`, limit 20). When exhausted the API returns 502 with a rate-limit hint until reset/raised. This was the root cause of the earlier "intermittent 502s" — NOT a code bug. **The previously leaked GEMINI_API_KEY has been rotated** (new key in a new AI Studio project; set on Render).
2. **`JWT_SECRET` must be set on Render** (backend service env var) or the API will refuse to start. Local value is in `backend/.env` (not committed). Optional `JWT_EXPIRES_MINUTES` (default 7 days).
3. Explain cache is in-memory only (resets on redeploy; fine for single instance).
4. Pre-existing broken unit specs: several `*.spec.ts` import named exports that don't exist (`import { Search }`, `{ Home }`, `{ Navbar }`, …) so `ng test` fails to compile repo-wide. Not touched; `ng build` is the CI gate.

## 5. Next steps candidates (not started)

- Bill Tracker / Protest Tracker
- User-saved topics
- JWT: access-token refresh / split token→HTTP-only cookie hardening
- Add a Dashboard route guard (currently the page just prompts to log in if no token)

## 6. Dev cheatsheet (Windows / PowerShell)

```powershell
# Seed/update topics (from backend/)
$env:PYTHONIOENCODING='utf-8'; .\.venv\Scripts\python.exe -m app.seed

# Local API + AI smoke (set GEMINI_API_KEY env; keep in mind the 20/day quota)
$env:PYTHONIOENCODING='utf-8'
$env:GEMINI_API_KEY='<key>'
.\.venv\Scripts\python.exe -c "from app.db.database import topics_collection; print(topics_collection.count_documents({}))"

# Build frontend (from frontend/)
npx ng build

# Render env vars
MONGO_URL, GEMINI_API_KEY, GEMINI_MODEL, JWT_SECRET
(optional GEMINI_MAX_RETRIES, default 3; JWT_EXPIRES_MINUTES, default 10080)

# Local backend smoke (JWT_SECRET is read from backend/.env)
$env:PYTHONIOENCODING='utf-8'
.\.venv\Scripts\python.exe -c "from app.core.security import create_access_token, decode_token; t = create_access_token('0'*24); assert decode_token(t) == '0'*24; print('token OK')"
```

## 7. Guardrails

- NEVER modify `backend/app/db/database.py` or `backend/app/main.py`.
- NEVER commit `.env`, `.venv`, `__pycache__`, `frontend/dist`, or API keys.
- Content must be politically neutral with **URL-verified official sources** only.
- When encountering the SDK "Direct use of automatic function calling" warning: gone since commit `e56bd10` (config `AutomaticFunctionCallingConfig(disable=True)`).