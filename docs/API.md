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
  "refresh_token": "<random>",
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

The `access_token` is a JWT (HS256) valid for 60 minutes
(`JWT_EXPIRES_MINUTES`). The `refresh_token` is a random 256-bit value valid
for 30 days (`REFRESH_TOKEN_DAYS`); only its SHA-256 hash is stored server-side.
Send `Authorization: Bearer <token>` on protected routes. The frontend stores
both tokens in `localStorage` and transparently refreshes on an expired-token
`401` via the HTTP interceptor.

---

## `POST /api/auth/refresh`

Exchange a valid refresh token for a fresh pair. The old refresh token is
**rotated** (revoked) on success.

**Request body:**

```json
{ "refresh_token": "<refresh_token>" }
```

**`200`:**

```json
{
  "access_token": "<new jwt>",
  "refresh_token": "<new refresh token>",
  "token_type": "bearer"
}
```

**`401`:** invalid, revoked, or expired refresh token
(`{ "detail": "Your session has expired. Please log in again." }`). **`422`** if
the field is missing/invalid.

---

## `POST /api/auth/logout`

Revoke the given refresh token (sign out on the server so the token can't be
reused). **Request body:** `{ "refresh_token": "<token>" }` — `200` even if the
token was already revoked.

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

## `POST /api/ai/chat-tracker`

Answer follow-up questions about a **bill or protest tracker**, grounded in the
tracker document and its official sources. Same contract as `/api/ai/chat`.
The last 6 conversation turns are sent to the provider.

**Status:** live (Phase 13).

**Request body:**

```json
{
  "tracker_id": "fcra-amendment",
  "messages": [
    { "role": "user", "content": "What does this bill change?" }
  ],
  "language": "English"
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `tracker_id` | string | yes | Tracker id from `/api/trackers` |
| `messages` | array of `{role, content}` | yes | `role` is `user` or `assistant`; oldest turns beyond the last 6 are trimmed server-side |
| `language` | string | no | `English`, `Hindi`, `Hinglish`; default `English` |

**`200`:**

```json
{ "reply": "The Bill changes the Foreign Contribution (Regulation) Act ..." }
```

**Error codes:**

| Code | Meaning |
|---|---|
| `404` | Tracker not found |
| `422` | Empty `messages` or validation error |
| `502` | AI provider unavailable / rate-limited, or reply cited a URL outside the tracker's official sources (rejected by verification) |
| `500` | Unexpected server error |

Returns the same rate-limit-friendly `502` messaging as the other AI
endpoints when the free-tier daily quota is exhausted.

---

## `POST /api/ai/explain-tracker`

Generate an age/education-appropriate, neutral explanation for a **bill or
protest tracker** (`/api/trackers` item). Same contract and verification as
`/api/ai/explain`, but grounded in the tracker document (summary, status,
stage, viewpoints, official sources) instead of a topic.

**Status:** live (Phase 12). Backed by Gemini, verified against the tracker's
official sources, cached in-memory for 10 minutes (same tracker + profile).

**Request body:**

```json
{
  "tracker_id": "fcra-amendment",
  "age": 16,
  "education_level": "School",
  "interests": ["Governance"],
  "style": "simple",
  "language": "English"
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `tracker_id` | string | yes | Tracker id from `/api/trackers` (e.g. `fcra-amendment`) |
| `age` | integer | yes | Used to match explanation depth |
| `education_level` | string | yes | e.g. `School`, `College`, `Professional` |
| `interests` | array of strings | no | Used to add helpful examples when supported by the material |
| `style` | string | no | e.g. `simple`, `detailed`; omitted → automatic |
| `language` | string | no | `English`, `Hindi`, `Hinglish`; default `English` |

**`200`** — an `ExplainResponse` (same shape as `/api/ai/explain`).

**Error codes:**

| Code | Meaning |
|---|---|
| `404` | Tracker not found (`{ "detail": "Tracker not found." }`) |
| `422` | Validation error (missing/invalid request fields) |
| `502` | AI provider unavailable, rate-limited, or output failed verification against the tracker's sources |
| `500` | Unexpected server error |

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

---

## Saved topics (bookmarks)

**Status:** live (Phase 10). Per-user saved topics stored inside
`users_collection` under `savedTopics` (max 100, newest first, deduplicated by
`topicId`). All routes require `Authorization: Bearer <token>` (401 if
missing/expired).

### `GET /api/history/topics`

List the signed-in user's saved topics.

**`200`:**

```json
{
  "items": [
    {
      "topicId": "gst",
      "topicTitle": "GST",
      "category": "Economy",
      "readTime": "5 min",
      "summary": "An indirect tax system ...",
      "savedAt": "2026-09-06T06:00:00+00:00"
    }
  ]
}
```

### `POST /api/history/topics`

Save a topic. **Request body:**

```json
{
  "topicId": "gst",
  "topicTitle": "GST",
  "category": "Economy",
  "readTime": "5 min",
  "summary": "An indirect tax system ..."
}
```

`topicId` is required; the other fields are informational (may be empty).

**`200`:** `{ "message": "Topic saved." | "Topic already saved.", "item": {...} }`

### `DELETE /api/history/topics/{topic_id}`

Remove a saved topic. **`200`** `{ "message": "Topic removed from your saved list." }`
· **`404`** if the topic id isn't saved.

---

## `GET /api/trackers`

Civic trackers — bills before Parliament and active/concluded protests.
Read-only; content is curated and seeded (`python -m app.seed_trackers`),
neutral, with both sides noted under `viewpoints` and URL-verified sources.

**Query params:**

| Param | Type | Notes |
|---|---|---|
| `type` | string | optional; `bill` or `protest`. Omitted → all items. Any other value → all items. |

**`200`** — items sorted by `lastUpdated` descending:

```json
{
  "items": [
    {
      "id": "fcra-amendment",
      "type": "bill",
      "title": "Foreign Contribution (Regulation) Amendment Bill, 2026",
      "category": "Governance",
      "status": "In Committee",
      "stage": "Referred to a Joint Parliamentary Committee (Aug 2026)",
      "summary": "The Bill amends the Foreign Contribution (Regulation) Act, 2010 ...",
      "viewpoints": [
        { "side": "Government view", "explanation": "..." },
        { "side": "Concerns raised", "explanation": "..." }
      ],
      "lastUpdated": "2026-08-12",
      "sources": [
        { "name": "PRS Legislative Research — Bill page", "url": "https://prsindia.org/billtrack/..." }
      ]
    }
  ]
}
```

## `GET /api/trackers/{tracker_id}`

Fetch a single tracker by its `id` slug (e.g. `fcra-amendment`).

**`200`** — a single tracker document (same shape as one item above).
**`404`** — `{ "detail": "Tracker not found." }`