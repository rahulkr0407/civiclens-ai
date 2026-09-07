# CivicLens AI — Architecture

This document describes the system at a high level: the services, how they talk to
each other, the frontend structure, the auth/session model, and how the AI service
is wired in. See also [`docs/API.md`](API.md) for the exact contracts and
[`docs/DATABASE.md`](DATABASE.md) for the data model.

---

## Overview

```
                        ┌────────────────────────────┐
                        │         Browser            │
                        │   Angular 20 (standalone)  │
                        │   Tailwind CSS v4          │
                        └────────────┬───────────────┘
                                     │ HTTPS (REST JSON)
                                     ▼
                  ┌────────────────────────────────────┐
                  │       Backend (FastAPI)  🆁  /api  │
                  │  topics · auth · ai · history ·    │
                  │  trackers · config                  │
                  └──────────────┬─────────────────────┘
                                 │
                     ┌───────────┴───────────┐
                     ▼                       ▼
              ┌────────────┐         ┌───────────────┐
              │   MongoDB   │         │ Google Gemini │
              │ topics /    │         │ (explain,     │
              │ users /     │         │  chat)        │
              │ trackers    │         └───────────────┘
              └────────────┘
```

Single-page app on the frontend; REST API on the backend; Mongo as the single
source of truth; Gemini used only through the backend AI service (never called
directly from the browser, and never given the ability to invent sources).

---

## Repo layout

```
backend/            FastAPI application (see section Backend)
  app/
    main.py         FastAPI app + CORS + GET /api/config
    api/routes/     topics.py, auth.py, ai.py, history.py, trackers.py
    ai/             service.py (Gemini), prompts.py, models.py
    core/           security.py (JWT/reset/refresh tokens), emails.py (SMTP)
    db/             database.py (Mongo clients + collections)
frontend/           Angular application (see section Frontend)
  src/app/
    core/           services, models, guards, interceptors, api-config, toast.service
    features/       feature modules: home, auth, topics, trackers, dashboard, search, sources, about
    shared/         navbar, footer, topic-card, chip, loading-spinner, section-title, toast-region
docs/               Architecture, API, DATABASE, ROADMAP, PRD, AI, …
docker-compose.yml  Local MongoDB (mongo:8)
```

---

## Data layer (MongoDB)

Backend accesses Mongo through `backend/app/db/database.py`, which exposes typed
collection handles:

| Collection          | Contents |
| ------------------- | -------- |
| `topics_collection` | Curated civic topics — id, title, category, summary, keyPoints, viewpoints, currentSituation, sources |
| `users_collection`  | User accounts; each document also carries `savedHistory` (max 100) and `savedTopics` (max 100) |
| `trackers_collection` | Bills + protests — id, type, status, stage, viewpoints, lastUpdated, sources |

Full field-level detail is in [`docs/DATABASE.md`](DATABASE.md).

---

## Backend (FastAPI)

All routes are mounted under the `/api` prefix in `backend/app/main.py`:

| Router       | Prefix      | Purpose                                        |
| ------------ | ----------- | ---------------------------------------------- |
| `topics.py`  | `/topics`   | List content topics                            |
| `auth.py`    | `/auth`     | Signup, login, Google, refresh, logout, me, forgot/reset password |
| `ai.py`      | `/ai`       | Explain, chat, explain-tracker, chat-tracker    |
| `history.py` | `/history`  | Saved explanations/chats + saved topics         |
| `trackers.py`| `/trackers` | Bills & protests (list + detail)                |
| `main.py`    | `/config`   | Public non-sensitive config (`googleClientId`)  |

### Auth & security (`core/security.py`, `api/routes/auth.py`)

| Layer | Details |
| ----- | ------- |
| **Passwords** | Argon2 via `pwdlib.PasswordHash.recommended()`. |
| **Access tokens** | JWT (`HS256`), encodes the user id, expires per `JWT_EXPIRES_MINUTES` (default 60). |
| **Refresh tokens** | Random 256-bit value; only its SHA-256 hash is stored. Rotated on every `/auth/refresh` and server-revoked on `/auth/logout`. Expiry per `REFRESH_TOKEN_DAYS` (default 30). |
| **Google Sign-In** | Browser gets a Google ID token; the backend fetches Google's JWKS and verifies signature, issuer, audience (`GOOGLE_CLIENT_ID`) and email. Accounts are auto-created/linked by email on first sign-in. |
| **Password reset** | `generate_reset_token()` produces a one-time token whose hash is stored with an expiry. A valid `/auth/reset-password` request hashes the new password and revokes the reset link **and** all active sessions. Reset links are delivered by SMTP (`core/emails.py`); when SMTP is not configured the API falls back to returning `dev_reset_link` so the flow stays testable locally. |

### AI service (`ai/service.py`)

A provider-agnostic wrapper around Google Gemini (`google-genai`,
`gemini-3.6-flash` default):

| Capability | Details |
| ---------- | ------- |
| **Prompt generation** | Builds grounded prompts from topic/tracker content + learner profile (`core/ai/prompts.py`) and forces JSON output schemas (`core/ai/models.py`). |
| **Response verification** | Title match against the topic/tracker, every cited URL must belong to the item's official sources, and required fields must be non-empty. Unverified output → `502`. |
| **Caching** | Explanations cached in-memory for 10 minutes (same item + learner profile). |
| **Retries** | Transient provider failures retried up to `GEMINI_MAX_RETRIES` (default 3) with backoff; free-tier daily-quota `429`s produce a rate-limit friendly `502`. |

---

## Frontend (Angular 20, standalone)

### Layout conventions

| Directory | Contents |
| --------- | -------- |
| `core/` | Singleton services (`auth`, `ai`, `search`, `history`, `trackers`, `toast`), domain models (`core/models/*`), `api-config.ts` (base URL), the HTTP auth interceptor, the `authGuard`, and the Google Sign-In helper. |
| `features/` | One folder per feature, each with `pages/` and `components/`: `home`, `topics`, `trackers`, `auth` (login/signup/forgot/reset/terms/privacy), `dashboard`, `search`, `sources`, `about`. |
| `shared/components/` | Reused dumb components: `navbar`, `footer`, `topic-card`, `chip`, `loading-spinner`, `section-title`, `toast-region`. |

Every component/service is **standalone** (no `NgModule`s); the app is wired from
`app.ts` + `app.routes.ts` + `app.config.ts`.

### Routes

| Route | Page | Guard |
| ----- | ---- | ----- |
| `/` , `/**` | → `/login` | – |
| `/home` | Home (hero, search, trending, features, learning profile) | – |
| `/topics` | Topic directory | – |
| `/topic/:id` | Topic detail (+ AI explain, chat, save) | – |
| `/search?q=` | Search results | – |
| `/trackers` | Bills & Protests list | – |
| `/tracker/:id` | Tracker detail (+ AI explain, chat, save) | – |
| `/sources`, `/about` | Static pages | – |
| `/dashboard` | Saved history + saved topics | `authGuard` |
| `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/terms`, `/privacy` | Auth pages | – |

### Session & auth state

| Aspect | Details |
| ------ | ------- |
| **Storage** | Session data lives in `localStorage` when "Remember me" is checked, otherwise `sessionStorage`. All readers check both, so a refresh keeps the session in the storage it was created in. |
| **Reactive auth state** | `AuthService` exposes `authState$` — a `BehaviorSubject<boolean>` updated by `persistSession()` (→ true) and `clearSession()` (→ false). Persistent components like the navbar subscribe to it, so the Login ⇄ `Hi, <name>` + Logout buttons update instantly without a reload. |
| **Interceptor** | `core/interceptors/auth.interceptor.ts` attaches `Authorization: Bearer <access token>` to outgoing requests; on a `401` it tries `/auth/refresh` once, retries the original request, and logs the user out if the refresh fails. |
| **Guard** | `core/guards/auth.guard.ts` blocks `/dashboard` when not logged in. |

### Toast system

| Component | Details |
| --------- | ------- |
| `core/services/toast.service.ts` | Root-provided queue: `success`, `error`, `warning`, `info`, `show(durationMs)`, `dismiss`. |
| `shared/components/toast-region/` | Mounted once in `app.html`, subscribes to `toasts$`, renders stacked toasts (auto-dismiss + manual close). |
| **Usage** | Transient feedback: login/signup/forgot/reset validation & server errors, AI explain/chat errors, save/unsave/delete confirmations. Page-load errors that need retained context use inline state on the page instead. |

### API access

The backend base URL lives in `frontend/src/app/core/services/api-config.ts` and
defaults to `https://civiclens-ai-1-f708.onrender.com/api`.

---

## Frontend build & test

```bash
cd frontend
npx ng build --configuration development       # type-check + build => dist/frontend
npx ng test --watch=false --browsers=ChromeHeadless   # 38 specs, headless
```

---

## Deployment

| Layer      | Host   | Details |
| ---------- | ------ | ------- |
| Backend    | Render | Env: `MONGO_URL`, `GEMINI_API_KEY`, `GEMINI_MODEL`, `JWT_SECRET`, optional `GOOGLE_CLIENT_ID`, `SMTP_HOST/PORT/USER/PASS/FROM`, `FRONTEND_URL`, `JWT_EXPIRES_MINUTES`, `REFRESH_TOKEN_DAYS`, `GEMINI_MAX_RETRIES`. Auto-deploys from `origin/main`. |
| Frontend   | Vercel | Static. Auto-deploys from `origin/main`. |
| MongoDB    | Atlas (prod) / `docker compose up -d` (local `mongo:8`) | — |

---

## Guardrails

- Never modify `backend/app/db/database.py` or `backend/app/main.py` except the documented one-line additions (trackers collection + router).
- Never commit `.env`, `.venv`, `__pycache__`, `frontend/dist`, or API keys.
- All civic content stays politically neutral with URL-verified official sources.
