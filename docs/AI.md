# CivicLens AI — AI Architecture

## Status

- **Phase 5 (design + contracts): complete.**
- **Phase 6 (implementation): complete** — backend provider, verification,
  error handling and frontend AI UI are implemented.
- Pending for end-to-end verification: set `GEMINI_API_KEY` in the Render
  environment and deploy.

The AI endpoint contract, prompt construction and service interface are
designed and in code. The endpoint returns a real Gemini-based explanation
when `GEMINI_API_KEY` is configured, and a clean `502` when it is not.

## Flow

```
Frontend ("Explain with AI")
  -> POST /api/ai/explain
       { topic_id, age, education_level, interests?, style? }
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

## Request / Response

See `docs/API.md` for the full contract and error codes.

## Provider configuration (server-side only)

| Variable | Purpose | Default |
|---|---|---|
| `GEMINI_API_KEY` | Gemini Developer API key | required |
| `GEMINI_MODEL` | Model used for explanations | `gemini-3.6-flash` |

- The key is read automatically by the `google-genai` client from the
  environment.
- Keys must **never** be set in the Angular frontend; they live only as Render
  environment variables.

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
- [ ] Set `GEMINI_API_KEY` (and optional `GEMINI_MODEL`) in Render env
- [x] Frontend: AI service call + loading/error states + explanation result UI