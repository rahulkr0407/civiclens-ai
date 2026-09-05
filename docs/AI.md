# CivicLens AI — AI Architecture

## Status

- **Phase 5 (design + contracts): complete.**
- **Phase 6 (implementation): complete and deployed** — backend provider,
  verification, error handling and frontend AI UI are live on Render/Vercel.
- **Phase 7 (chat + language + resilience): complete** — follow-up chat,
  language toggle, Regenerate, explain cache, rate-limit messaging and 3 new
  topics are implemented and deployed.

The AI endpoint contract, prompt construction and service interface are
designed and in code. The endpoints return real Gemini-based responses when
`GEMINI_API_KEY` is configured, and a clean `502` when it is not.

## Flow

```
Frontend ("Explain with AI")
  -> POST /api/ai/explain
       { topic_id, age, education_level, interests?, style?, language? }
Backend
  -> load topic document + its official sources from MongoDB
  -> build grounded prompts (app.ai.prompts)
       system prompt : neutrality / no-fabrication rules
       user prompt   : topic material + official references + learner profile
  -> call Gemini via google-genai SDK (app.ai.service.generate)
       structured output enforced with ExplainResponse schema
  -> validate response (Pydantic)
  -> verification pass (app.ai.service.verify)
       re-check claims against the topic's own content and sources only
  -> return ExplainResponse JSON
```

Follow-up chat uses the same grounding:

```
Frontend ("Ask a follow-up")
  -> POST /api/ai/chat
       { topic_id, messages[{role, content}], language? }
Backend
  -> load topic document + official sources from MongoDB
  -> build chat prompts (app.ai.prompts.build_chat_*)
       topic material embedded once + recent conversation (last 6 turns)
  -> call Gemini via google-genai SDK (app.ai.service.chat)
       plain text output (no JSON schema)
  -> URL check (app.ai.service.verify_chat)
       reject any URL whose host is not an official source host
  -> return { reply }
```

## Request / Response

See `docs/API.md` for the full contract and error codes.

## Provider configuration (server-side only)

| Variable | Purpose | Default |
|---|---|---|
| `GEMINI_API_KEY` | Gemini Developer API key | required |
| `GEMINI_MODEL` | Model used for explanations | `gemini-3.6-flash` |
| `GEMINI_MAX_RETRIES` | Transient-error retry attempts (429/5xx) | `3` |

- The key is read automatically by the `google-genai` client from the
  environment.
- Keys must **never** be set in the Angular frontend; they live only as Render
  environment variables.
- Transient provider errors are retried with backoff (5s → 20s → 40s). A live
  `429 RESOURCE_EXHAUSTED` for `generate_content_free_tier_requests` means the
  key's **free-tier daily quota is exhausted** (e.g. 20 requests/day/model) —
  the API returns a clear `502` with a rate-limit hint until the quota resets
  or is raised (new project or billing on the key's project).

## Neutrality and accuracy rules (enforced in the system prompt)

1. Use only the topic material and official references provided.
2. Never invent sources, URLs, statistics, dates, names or events.
3. Separate facts from viewpoints; present every viewpoint neutrally.
4. No political position or value judgements.
5. Adapt depth/vocabulary to age and education level without changing meaning.
6. Cite only by referring to the official references supplied.

## Personalisation (Option A)

The frontend sends the learner profile in the request body
(`age`, `education_level`, `interests`, optional `style`) from the
`civiclens_user` localStorage entry returned at login. No JWT/session is
required for the AI feature yet.

## Provider extensibility

`app.ai.service.generate()` is a thin interface. Gemini is the default
provider; the interface allows other providers later without touching the
route or prompts.

## Phase 6 checklist

- [x] Add `google-genai` to `backend/requirements.txt`
- [x] Implement `app.ai.service.generate()` using Gemini structured output
  (Pydantic schema) and grounded prompts
- [x] Implement `app.ai.service.verify()` claim check
- [x] Set `GEMINI_API_KEY` and `GEMINI_MODEL` in Render env
- [x] Frontend: AI service call + loading/error states + explanation result UI
- [x] Deploy and verify live (`/api/ai/explain` returns 200 with real content)

## Phase 7 checklist

- [x] `ChatRequest`/`ChatResponse` contracts + `app.ai.service.chat()` (plain text, temp 0.2, last 6 turns)
- [x] `app.ai.service.verify_chat()` URL-host check
- [x] `POST /api/ai/chat` route with 404/502 mapping
- [x] Language toggle (English / Hindi / Hinglish) in prompts + UI
- [x] Regenerate button + in-memory explain cache (10 min TTL, per-instance)
- [x] Provider error logging in `generate()`/`chat()`
- [x] Rate-limit friendly `502` message
- [x] Topics count 3 -> 6 (DPDP Act 2023, UPI, Electoral Bonds)
- [x] Retry-with-backoff for transient provider errors (`GEMINI_MAX_RETRIES`)
- [x] Sharper `502` message for rate limits (429) vs generic outages
- [x] Disable SDK automatic function calling to remove log noise