# CivicLens AI — API Reference

Base URLs:
- Local: `http://localhost:8000`
- Deployed backend (Render): `https://civiclens-ai-1-f708.onrender.com`

All routes are served under the `/api` prefix.

---

## `GET /api/topics`

Returns all civic topics stored in MongoDB.

**Response `200`** — array of topic documents:

```json
[
  {
    "id": "gst",
    "title": "GST",
    "category": "Economy",
    "summary": "Goods and Services Tax is an indirect tax system ...",
    "readTime": "5 min",
    "whyItMatters": "GST affects the prices ...",
    "keyPoints": ["GST is an indirect tax.", "..."],
    "viewpoints": [
      { "side": "Supporters", "explanation": "..." },
      { "side": "Critics", "explanation": "..." }
    ],
    "currentSituation": "GST continues to be ...",
    "sources": [
      { "name": "GST Council — Government of India", "url": "https://www.gstcouncil.gov.in/" }
    ]
  }
]
```

---

## `POST /api/auth/signup`

Create a user account with a learning profile.

**Request body:**

```json
{
  "fullName": "Example User",
  "email": "user@example.com",
  "password": "secret123",
  "age": 22,
  "educationLevel": "College",
  "interests": ["Economy", "Education"]
}
```

**Responses:**
- `200` — `{ "message": "Account created successfully." }`
- `400` — `{ "detail": "An account with this email already exists." }`

---

## `POST /api/auth/login`

Authenticate a user.

**Request body:**

```json
{ "email": "user@example.com", "password": "secret123" }
```

**`200`:**

```json
{
  "message": "Login successful.",
  "access_token": "<jwt>",
  "token_type": "bearer",
  "user": {
    "fullName": "Example User",
    "email": "user@example.com",
    "age": 22,
    "educationLevel": "College",
    "interests": ["Economy", "Education"]
  }
}
```

**`401`:** `{ "detail": "Invalid email or password." }`

The `access_token` is a JWT (HS256). Send it on protected routes as
`Authorization: Bearer <token>`. The frontend stores it in `localStorage`
alongside the `user` object and attaches it automatically via an HTTP
interceptor. Token lifetime defaults to 7 days (`JWT_EXPIRES_MINUTES`).

---

## `GET /api/auth/me`

Returns the profile for the currently authenticated user. Requires a valid
Bearer token (uses the same `Authorization` header as login's `access_token`).

**`200`:**

```json
{
  "fullName": "Example User",
  "email": "user@example.com",
  "age": 22,
  "educationLevel": "College",
  "interests": ["Economy", "Education"]
}
```

**`401`:** missing/invalid/expired token.

---

## `POST /api/ai/explain`

Generate an age/education-appropriate, neutral explanation for a topic.

**Status:** live (Phase 6–7). Backed by Gemini, verified against the topic's
official sources, cached in-memory for 10 minutes (same topic + profile).

**Request body:**

```json
{
  "topic_id": "gst",
  "age": 16,
  "education_level": "School",
  "interests": ["Economy"],
  "style": "simple",
  "language": "English"
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `topic_id` | string | yes | Topic id from `/api/topics` (e.g. `gst`) |
| `age` | integer | yes | Used to match explanation depth |
| `education_level` | string | yes | e.g. `School`, `College`, `Professional` |
| `interests` | array of strings | no | Used to add helpful examples when supported by the material |
| `style` | string | no | e.g. `simple`, `detailed`; omitted → automatic |
| `language` | string | no | `English`, `Hindi`, `Hinglish`; default `English` |

**`200`** — `ExplainResponse`:

```json
{
  "topicTitle": "GST",
  "simpleExplanation": "...",
  "whyItMatters": "...",
  "keyPoints": ["...", "..."],
  "viewpoints": [
    { "side": "Supporters", "explanation": "..." },
    { "side": "Critics", "explanation": "..." }
  ],
  "questionsToThinkAbout": ["...", "...", "..."]
}
```

**Error codes:**

| Code | Meaning |
|---|---|
| `404` | Topic not found (`{ "detail": "Topic not found." }`) |
| `422` | Validation error (missing/invalid request fields) |
| `502` | AI provider unavailable, rate-limited, or returned output that failed verification |
| `500` | Unexpected server error |

---

## `POST /api/ai/chat`

Answer follow-up questions about a topic, grounded in the topic material and
its official sources. The last 6 conversation turns are sent to the provider.

**Status:** live (Phase 7).

**Request body:**

```json
{
  "topic_id": "gst",
  "messages": [
    { "role": "user", "content": "What is GST in one sentence?" }
  ],
  "language": "English"
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `topic_id` | string | yes | Topic id from `/api/topics` |
| `messages` | array of `{role, content}` | yes | `role` is `user` or `assistant`; oldest turns beyond the last 6 are trimmed server-side |
| `language` | string | no | `English`, `Hindi`, `Hinglish`; default `English` |

**`200`:**

```json
{ "reply": "Goods and Services Tax (GST) is an indirect tax ..." }
```

**Error codes:**

| Code | Meaning |
|---|---|
| `404` | Topic not found |
| `422` | Empty `messages` or validation error |
| `502` | AI provider unavailable / rate-limited, or reply cited a URL outside the topic's official sources (rejected by verification) |
| `500` | Unexpected server error |

**Resilience:** transient provider errors (HTTP 429/5xx) are retried up to
`GEMINI_MAX_RETRIES` times (default 3) with backoff (5s → 20s → 40s). A live
`429` (free-tier daily quota) returns a `502` with a rate-limit hint.

---

## Saved history (Dashboard)

**Status:** live (Phase 8). Per-user history stored inside `users_collection`
under `savedHistory` (max 100 items, newest first). All routes require
`Authorization: Bearer <token>` (401 if missing/expired).

### `GET /api/history`

List the signed-in user's saved items.

**`200`:**

```json
{
  "items": [
    {
      "id": "abc123...",
      "type": "explain",
      "topicId": "gst",
      "topicTitle": "GST",
      "language": "English",
      "savedAt": "2026-09-06T06:00:00+00:00",
      "content": { "simpleExplanation": "...", "...": "..." }
    }
  ]
}
```

`content` is an `ExplainResponse` (type `explain`) or
`{ "messages": [...], "reply": "..." }` (type `chat`).

### `POST /api/history`

Save an item. **Request body:**

```json
{
  "type": "explain",
  "topicId": "gst",
  "topicTitle": "GST",
  "language": "English",
  "content": {}
}
```

- `type`: `explain` | `chat` (required)
- `content`: the saved payload (ExplainResponse shape, or `{messages, reply}`)

**`200`:** `{ "message": "Saved to your dashboard.", "item": {...} }`

### `DELETE /api/history/{item_id}`

Remove one saved item. **`200`** `{ "message": "Removed from your dashboard." }`
· **`404`** if the item id isn't present.

### `DELETE /api/history`

Clear the entire saved history. **`200`**
`{ "message": "Your dashboard has been cleared." }`