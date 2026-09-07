# CivicLens AI

Learn about India's bills, policies, protests, elections and government decisions
through **simple, neutral and age-appropriate explanations powered by AI**.

| Resource  | URL                                                         |
| --------- | ----------------------------------------------------------- |
| Frontend  | <https://civiclensai-two.vercel.app>                        |
| Backend   | <https://civiclens-ai-1-f708.onrender.com>                  |
| API docs  | [`docs/API.md`](docs/API.md)                                |

---

## What it does

| Feature | Description |
| ------- | ----------- |
| **Civic topics** | Curated, politically neutral topics (GST, NEP 2020, DPDP Act, UPI, Electoral Bonds, Farmers' Protest, …) with verified official sources. |
| **AI explanations** | "Explain with AI" produces a neutral, age/education-aware explanation in **English, Hindi, or Hinglish**, grounded in the topic's official sources and verified before display. |
| **AI follow-up chat** | Ask questions about a topic; replies are checked so the AI can't fabricate sources. |
| **Civic trackers** | Bills before Parliament and active/concluded protests with status badges, both-side viewpoints, official sources, AI explain + chat, and staleness flags. |
| **Accounts** | Sign up / log in (email + password or **Google Sign-In**), forgot / reset password, "remember me" sessions. |
| **Dashboard** | Save AI explanations and conversations, bookmark topics, then view, open, or delete them from `/dashboard`. |

---

## Tech stack

| Layer     | Technology                                                 |
| --------- | ---------------------------------------------------------- |
| Frontend  | Angular 20 (standalone components), TypeScript, Tailwind CSS v4 |
| Backend   | FastAPI (Python 3.12)                                      |
| Database  | MongoDB (Atlas in prod; Docker `mongo:8` locally)          |
| AI        | Google Gemini via `google-genai` (`gemini-3.6-flash`)      |
| Auth      | Argon2 password hashing + JWT (rotating refresh tokens), Google ID-token verification |

---

## Repo layout

```
ai-service/        # (placeholder) standalone AI service work
backend/           # FastAPI app: routers, AI service, auth, seed scripts
  app/
    main.py        # app + CORS + /api/config
    api/routes/    # topics, auth, ai, history, trackers
    ai/            # Gemini service, prompts, response models
    core/          # security.py (tokens/password), emails.py (SMTP reset mail)
    db/            # MongoDB collections
docs/              # architecture, API, DB, roadmap, PRD, session checkpoint, …
frontend/          # Angular app
ingestion/         # (placeholder) bulk content ingestion
shared/            # (placeholder) cross-service shared code
docker-compose.yml # local MongoDB
```

---

## Docs

| Doc | Contents |
| --- | -------- |
| `docs/FEATURES.md` | Feature list mapped to routes and API endpoints |
| `docs/ARCHITECTURE.md` | System architecture — backend, frontend, auth, AI, deploy |
| `docs/API.md` | Full REST API reference |
| `docs/DATABASE.md` | Data model & Mongo collections |
| `docs/ROADMAP.md` | Shipped phases and roadmap |
| `docs/PRD.md` | Product requirements |
| `docs/AI.md` | AI design / prompts |
| `docs/SESSION-CHECKPOINT.md` | Project state, open items, dev cheatsheet |
| `docs/UI_GUIDELINES.md` | Frontend UI conventions |

---

## Getting started

### 1. Local MongoDB (optional)

```bash
docker compose up -d
```

### 2. Backend

```bash
cd backend
python -m venv .venv
.\.venv\Scripts\activate          # Windows
pip install -r requirements.txt

# Environment — copy .env.example to .env and fill in values
# Required: MONGO_URL, JWT_SECRET
# Optional: GEMINI_API_KEY, GEMINI_MODEL, GOOGLE_CLIENT_ID, SMTP_HOST/PORT/USER/PASS/FROM,
#           JWT_EXPIRES_MINUTES (60), REFRESH_TOKEN_DAYS (30), GEMINI_MAX_RETRIES (3)

# Seed topics + trackers
$env:PYTHONIOENCODING='utf-8'
.\.venv\Scripts\python.exe -m app.seed
.\.venv\Scripts\python.exe -m app.seed_trackers

# Run
.\.venv\Scripts\uvicorn.exe app.main:app --reload
```

Swagger UI: <http://localhost:8000/docs>

### 3. Frontend

```bash
cd frontend
npm install
ng serve          # http://localhost:4200
```

The app talks to `https://civiclens-ai-1-f708.onrender.com/api` by default
(`frontend/src/app/core/services/api-config.ts`). Point it at
`http://localhost:8000/api` for local backend testing.

---

## Testing

```bash
cd frontend
npx ng build --configuration development       # type-check + build
npx ng test --watch=false --browsers=ChromeHeadless
```

---

## Deployment

| Layer      | Host   | Notes |
| ---------- | ------ | ----- |
| Backend    | Render | Env: `MONGO_URL`, `GEMINI_API_KEY`, `JWT_SECRET` (and `GOOGLE_CLIENT_ID`, `SMTP_*`, `FRONTEND_URL` for sign-in / reset email). Auto-deploys from `origin/main`. |
| Frontend   | Vercel | Static build from `frontend/`. Auto-deploys from `origin/main`. |

> **Note:** free-tier Gemini quota is ~20 requests/model/day; when exhausted the
> API returns a rate-limit `502`.

---

## Security notes

- Passwords are hashed with **Argon2** (`pwdlib`).
- `.env`, `.venv`, `__pycache__`, `frontend/dist`, and API keys are never committed.
- All civic content stays politically neutral with **URL-verified official sources** only.
