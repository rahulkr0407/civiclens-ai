# Session Checkpoint — where we finished

> Read this first to resume work quickly. Updated: 2026-09-05.

## 1. Project state (LIVE)

- **Backend**: FastAPI + MongoDB on Render — `https://civiclens-ai-1-f708.onrender.com`
- **Frontend**: Angular + Tailwind on Vercel — `https://civiclensai-two.vercel.app`
- **AI**: Google Gemini via `google-genai==2.21.0`, model `gemini-3.6-flash`
- Both auto-deploy on push to `origin/main`.

## 2. Shipped phases & commits (newest last)

| Commit | What |
|---|---|
| `e56bd10` | Hardening: retry-with-backoff, rate-limit 502s, AFC noise suppression, docs. **Current HEAD.** |
| `1801569` | Phase 7: AI follow-up chat, language toggle, explain cache, Regenerate, 3 new topics (6 total). |
| `0159569` | Fix AI verification (loose title match, source-host URLs) + `gemini-3.6-flash` default. |
| `5b75b42` | Phases 1–6: seed, topics/search, auth, Sources/About, AI explanations + deploy. |

## 3. Feature inventory (all working)

- 6 topics (gst, nep-2020, farmers-protest, dpdp-2023, upi, electoral-bonds)
- `GET /api/topics`; auth signup/login (argon2, no JWT yet)
- `POST /api/ai/explain` (JSON schema output, verified, 10-min in-memory cache)
- `POST /api/ai/chat` (last 6 turns, plain text, URL-checked)
- Language toggle: English / Hindi / Hinglish (explain + chat)
- Regenerate button; rate-limit friendly 502s; provider error logging

## 4. Known issues / open items (IMPORTANT)

1. **API key was leaked in chat → ROTATE IT.** Create a new key in a **new AI Studio project** (a new key in the same project keeps the consumed quota), **delete the old key**, and set Render → backend → `GEMINI_API_KEY`. Leave `GEMINI_MODEL=gemini-3.6-flash`.
2. **Free-tier quota: 20 requests/day for gemini-3.6-flash** (`generate_content_free_tier_requests`, limit 20). When exhausted the API returns 502 with a rate-limit hint until reset/raised. This was the root cause of the earlier "intermittent 502s" — NOT a code bug.
3. No JWT/session tokens yet (flagged "Phase 9 hardening" in docs/API.md).
4. Explain cache is in-memory only (resets on redeploy; fine for single instance).

## 5. Next steps candidates (not started)

- Phase 8 (recommended first): **Dashboard + saved chat/explanation history** in `users_collection`
- User-saved topics
- Bill Tracker / Protest Tracker
- JWT auth hardening

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
MONGO_URL, GEMINI_API_KEY, GEMINI_MODEL (optional GEMINI_MAX_RETRIES, default 3)
```

## 7. Guardrails

- NEVER modify `backend/app/db/database.py` or `backend/app/main.py`.
- NEVER commit `.env`, `.venv`, `__pycache__`, `frontend/dist`, or API keys.
- Content must be politically neutral with **URL-verified official sources** only.
- When encountering the SDK "Direct use of automatic function calling" warning: gone since commit `e56bd10` (config `AutomaticFunctionCallingConfig(disable=True)`).