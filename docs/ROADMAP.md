# CivicLens AI — Roadmap

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

## Phase 8 — Ideas (not started)
- [ ] Dashboard + saved chat/explanation history (users-collection persistence)
- [ ] Bill Tracker / Protest Tracker
- [ ] User-saved topics