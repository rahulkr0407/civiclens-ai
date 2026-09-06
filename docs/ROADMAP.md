# CivicLens AI — Roadmap

> Resume here: `docs/SESSION-CHECKPOINT.md` (project state, open items, cheatsheet).

## Phase 1 — Seed & content
- [x] Mongo topics collection with curated, politically neutral civic topics
- [x] Verified official sources only (PRS, India Code, MeitY, ECI, Digital India, NPCI)

## Phase 2 — Core pages & search
- [x] Home, Topics, Search, Topic Details
- [x] Category chips + keyword search against the topic content

## Phase 3 — Auth
- [x] Sign-up / login (argon2 password hashing, users collection)

## Phase 4 — Sources & About
- [x] Sources page, About page

## Phase 5 — AI design
- [x] AI contracts (models), grounded prompts, provider-agnostic service interface

## Phase 6 — AI explanations (live)
- [x] `POST /api/ai/explain` via Gemini (`gemini-3.6-flash`)
- [x] Response verification (title match, official-source URLs, non-empty fields)
- [x] Frontend "Explain with AI" UI + loading/error states
- [x] Deployed: backend on Render, frontend on Vercel

## Phase 7 — Chat, language, content, resilience (live)
- [x] `POST /api/ai/chat` follow-up Q&A grounded in the topic material
- [x] Chat URL verification (no fabricated sources in replies)
- [x] Language toggle (English / Hindi / Hinglish) for explain + chat
- [x] Regenerate button + in-memory explain cache (10 min TTL)
- [x] Rate-limit friendly 502 message + provider error logging
- [x] 3 new topics: DPDP Act 2023, UPI, Electoral Bonds (6 total)
- [x] `docs/ROADMAP.md` filled

## Phase 7.5 — Issues & hardening
- [x] Retry-with-backoff for transient provider errors (`GEMINI_MAX_RETRIES`,
      429 → 1 quick retry; 5xx → 5s/20s/40s backoff)
- [x] Sharper 502 messages (rate-limit hint vs generic outage)
- [x] Real provider-error logging in `generate()`/`chat()`
- [x] Disable SDK automatic function calling (removes log noise)
- [x] `docs/API.md` updated (chat contract, `language`, live status)
- [x] Root cause of live 502s identified: free-tier daily quota
      (`generate_content_free_tier_requests`, limit 20/model/day on the key)

## Phase 8 — Dashboard & saved history (live)
- [x] JWT auth (access token on login, `GET /api/auth/me`, Bearer interceptor)
- [x] `users_collection.savedHistory` persistence (explain + chat, max 100)
- [x] `/api/history` save / list / delete / clear
- [x] Dashboard page (`/dashboard`) + Save buttons on explain & chat

## Phase 8.5 — JWT hardening (live)
- [x] Rotating refresh tokens (60-min access, 30-day refresh, hashed at rest, rotation-on-refresh)
- [x] `POST /auth/refresh` + `POST /auth/logout` (server-side revocation)
- [x] Frontend auto-refresh on expired-token 401 + retry; `authGuard` on `/dashboard`
- [x] Sharper 502 message when 429 is the free-tier daily quota

## Phase 9 — Ideas (not started)
- [ ] Fix broken unit specs (`ng test` — stale named imports)
- [ ] User-saved topics
- [ ] Bill Tracker / Protest Tracker