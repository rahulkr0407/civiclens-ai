# CivicLens AI — Features

This document lists the product's features. Each feature names the relevant
frontend route(s) (see [`ARCHITECTURE.md`](ARCHITECTURE.md)) and backend
endpoints (see [`API.md`](API.md)) so a feature can be traced through both sides.

---

## Civic topics

Browse curated, politically neutral topics about India's bills, policies,
protests, elections and government decisions.

| Item | Value |
| ---- | ----- |
| Status | Shipped |
| Routes | `/topics`, `/topic/:id` |
| Backend | `GET /api/topics` |

Details:

- Topics carry a `title`, `category`, `readTime`, `summary`, `whyItMatters`,
  `keyPoints`, neutral `viewpoints` (both sides), `currentSituation`, and
  **URL-verified official `sources`**.
- **Search** across topics from `/search?q=`.

---

## AI explanations

"Explain with AI" produces a neutral, age/education-aware explanation of a topic.

| Item | Value |
| ---- | ----- |
| Status | Shipped (Phase 6–7) |
| Route | `/topic/:id` |
| Backend | `POST /api/ai/explain` |

Details:

- Output is scaled to the learner's `age` and `education_level` (`School`,
  `College`, `Professional`).
- Available in **English, Hindi, or Hinglish** (`language`).
- `interests` add helpful examples where the material supports them.
- Output is **verified** against the topic's official sources before display.
- Explanations are **cached** in-memory for 10 minutes.
- Results can be **saved to the dashboard**.

---

## AI follow-up chat

Ask follow-up questions about a topic and get grounded, source-verified answers.

| Item | Value |
| ----- | ----- |
| Status | Shipped (Phase 7) |
| Route | `/topic/:id` |
| Backend | `POST /api/ai/chat` |

Details:

- Conversations are grounded in the topic material and its official sources.
- Replies that cite a URL outside the topic's official sources are **rejected** —
  the AI cannot fabricate sources.
- The last 6 conversation turns are sent to the provider.
- Chat sessions can be **saved to the dashboard**.

---

## Civic trackers

Bills before Parliament and active/concluded protests, with status and the ability
to learn and ask about them.

| Item | Value |
| ---- | ----- |
| Status | Shipped (Phases 10, 12, 13) |
| Route | `/trackers`, `/tracker/:id` |
| Backend | `GET /api/trackers`, `GET /api/trackers/{tracker_id}`, `POST /api/ai/explain-tracker`, `POST /api/ai/chat-tracker` |

Details:

- Read-only, curated, neutral content with both-side `viewpoints` and
  **URL-verified official `sources`**.
- Filter by type (`bill` or `protest`), sorted by `lastUpdated`.
- **AI explain** (`explain-tracker`) and **AI chat** (`chat-tracker`) work on
  trackers the same way they do on topics.
- **Staleness flags** warn when content "may be outdated".
- Results can be **saved to the dashboard**.

---

## Accounts

Sign up, log in, and manage the session with email + password or Google.

| Item | Value |
| ---- | ----- |
| Status | Shipped |
| Route | `/login`, `/signup`, `/forgot-password`, `/reset-password` |
| Backend | `POST /api/auth/signup`, `POST /api/auth/login`, `POST /api/auth/google`, `POST /api/auth/forgot-password`, `POST /api/auth/reset-password`, `POST /api/auth/refresh`, `POST /api/auth/logout`, `GET /api/auth/me` |

Details:

- **Sign up** collects a learning profile (`age`, `educationLevel`, `interests`).
- **Log in** with email + password, or **Google Sign-In** (ID-token verification
  against Google's JWKS; accounts auto-created/linked on first sign-in).
- **Forgot / reset password** via a one-time link (SMTP email, with a
  `dev_reset_link` fallback when SMTP is unconfigured). Resets invalidate the
  link and revoke all active sessions.
- **"Remember me"** sessions persist in `localStorage`; otherwise the session is
  `sessionStorage`.

---

## Dashboard

A personal area to revisit previously generated content.

| Item | Value |
| ---- | ----- |
| Status | Shipped (Phases 8, 10) |
| Route | `/dashboard` (`authGuard`) |
| Backend | `GET/POST/DELETE /api/history`, `GET/POST/DELETE /api/history/topics` |

Details:

- **Saved history** (max 100, newest first): AI explanations and chat
  conversations, viewable, openable, deletable, or clearable.
- **Saved topics** (bookmarks, max 100, deduplicated by `topicId`): save, view,
  or remove a topic from your list.

---

## Design & UX system

Consistent, reusable UI across every page.

| Item | Value |
| ----- | ----- |
| Status | Shipped |
| Scope | Frontend (`core/`, `shared/`, `features/`) |

Details:

- **Reactive auth state** — the navbar Login ⇄ `Hi, <name>` + Logout buttons
  update instantly without a reload (`authState$`).
- **Toast system** — transient feedback (validation & server errors, AI errors,
  save/unsave/delete confirmations) rendered via a root-mounted `toast-region`.
- Page-load errors that need retained context use inline state on the page.
- Shared dumb components: `navbar`, `footer`, `topic-card`, `chip`,
  `loading-spinner`, `section-title`, `toast-region`.
- UI conventions are documented in [`UI_GUIDELINES.md`](UI_GUIDELINES.md).
