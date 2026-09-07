# CivicLens AI — API Documentation

## Base URL

```
http://localhost:8000
```

Deployed backend (Render):

```
https://civiclens-ai-1-f708.onrender.com
```

All routes are served under the `/api` prefix.

---

## Authentication

Most endpoints require authentication. Include the access token in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

The `access_token` is a JWT (HS256) valid for 60 minutes (`JWT_EXPIRES_MINUTES`). The `refresh_token` is a random 256-bit value valid for 30 days (`REFRESH_TOKEN_DAYS`); only its SHA-256 hash is stored on the server.

The frontend stores both tokens client-side and clears them on logout. With **"Remember me"** checked they live in `localStorage`, otherwise in `sessionStorage`. An HTTP interceptor transparently refreshes the access token on an expired-token `401`.

---

## Response Format

### Success Response

Successful responses are plain JSON. Typical shapes:

- `{ "message": "Description of what happened" }` — operation messages
- `{ "items": [ ... ] }` — list responses (history, saved topics, trackers)
- A resource object or array directly — e.g. `/api/topics`, `/api/auth/me`

### Error Response

Errors use the FastAPI shape:

```json
{
  "detail": "Error description"
}
```

If an operation succeeds even when there is nothing meaningful to return, the API
returns a `200` with an `{ "message": ... }` body rather than an error.

Note: no endpoints are paginated — all list endpoints return the full set.

### HTTP Status Codes

| Code | Meaning                                             |
| ---- | --------------------------------------------------- |
| 200  | Success                                             |
| 400  | Bad Request (duplicate email, invalid reset link)   |
| 401  | Unauthorized (invalid/missing/expired token)        |
| 404  | Not Found (unknown topic, tracker, saved item)      |
| 422  | Validation Error (missing/malformed request fields) |
| 500  | Internal Server Error                               |
| 502  | AI provider unavailable / rate-limited / unverified |
| 503  | Service unavailable (e.g. Google Sign-In unconfigured) |

---

# Endpoints

---

## Configuration

### GET `/api/config`

Public, non-sensitive frontend configuration.

**Auth Required:** No

**Response (200):**

```json
{
  "googleClientId": "1234567890-....apps.googleusercontent.com"
}
```

**Note:** `googleClientId` is `null` when Google Sign-In is not configured
server-side (no `GOOGLE_CLIENT_ID` env var) — the frontend hides the Google
button in that case.

---

## Topics

### GET `/api/topics`

Returns all civic topics stored in MongoDB.

**Auth Required:** No

**Response (200):** array of topic documents

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

## Authentication

### POST `/api/auth/signup`

Create a user account with a learning profile.

**Auth Required:** No

**Request Body:**

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

**Validation Rules:**

- `fullName`: Required, non-empty string
- `email`: Required, valid email format, unique
- `password`: Required, string (≥ 6 characters recommended)
- `age`: Required, integer (learning profile)
- `educationLevel`: Required, string (e.g. `School`, `College`, `Professional`)
- `interests`: Required, array of strings

**Response (200):**

```json
{
  "message": "Account created successfully."
}
```

**Errors:**

- `400` — `{ "detail": "An account with this email already exists." }`
- `422` — Validation failed

---

### POST `/api/auth/login`

Authenticate a user with email and password.

**Auth Required:** No

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "secret123"
}
```

**Response (200):**

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

**Errors:**

- `401` — `{ "detail": "Invalid email or password." }`
- `422` — Validation failed

**Notes:** `access_token` expires per `JWT_EXPIRES_MINUTES` (default 60).
`refresh_token` is valid for `REFRESH_TOKEN_DAYS` (default 30); storage and
auto-refresh are described under [Authentication](#authentication).

---

### POST `/api/auth/google`

Sign in (or auto-sign up) with a Google Identity Services ID token.

**Auth Required:** No

**Request Body:**

```json
{
  "credential": "<google_id_token>"
}
```

**Validation Rules:**

- `credential`: Required, a Google ID token

**Verification:** the backend fetches Google's JWKS and verifies signature,
issuer (`accounts.google.com`), audience (`GOOGLE_CLIENT_ID`) and that an email
is present before trusting the token. If no account exists for the email, one is
auto-created from the Google profile; otherwise the Google identity is linked to
the existing account.

**Response (200):** same shape as `/api/auth/login` (`access_token`,
`refresh_token`, `user`, …)

**Errors:**

- `400` — `{ "detail": "Your Google account has no email address associated with it." }`
- `401` — `{ "detail": "Invalid Google credential. Please try again." }` (also covers invalid issuer)
- `503` — `{ "detail": "Google Sign-In is not configured on the server yet." }`
- `422` — Validation failed

---

### POST `/api/auth/forgot-password`

Request a one-time password-reset link. Always returns the same message whether
or not the email exists (it never reveals account existence).

**Auth Required:** No

**Request Body:**

```json
{
  "email": "user@example.com"
}
```

**Response (200):**

```json
{
  "message": "If an account exists with that email, a reset link has been sent."
}
```

**Notes:** when SMTP is configured, the reset URL is emailed to the address
(`FRONTEND_URL` builds the link). When SMTP is **not** configured, the response
also includes a development-only link so the flow is testable locally:

```json
{
  "message": "If an account exists with that email, a reset link has been sent.",
  "dev_reset_link": "http://localhost:4200/reset-password?token=<token>"
}
```

---

### POST `/api/auth/reset-password`

Complete a password reset with the token from the reset link.

**Auth Required:** No

**Request Body:**

```json
{
  "token": "<reset_token>",
  "new_password": "newsecret123"
}
```

**Validation Rules:**

- `token`: Required, the one-time token from the reset link
- `new_password`: Required, at least 6 characters

**Side Effects:**

- Rehashes the password
- Invalidates the reset token
- Revokes **all active sessions** (refresh token cleared)

**Response (200):**

```json
{
  "message": "Password updated successfully. You can now sign in."
}
```

**Errors:**

- `400` — `{ "detail": "This reset link is invalid or has expired. Please request a new one." }`
- `400` — `{ "detail": "Password must be at least 6 characters." }`

---

### POST `/api/auth/refresh`

Exchange a valid refresh token for a fresh token pair. The old refresh token is
**rotated** (revoked) on success.

**Auth Required:** No (uses the refresh token in the body)

**Request Body:**

```json
{
  "refresh_token": "<refresh_token>"
}
```

**Response (200):**

```json
{
  "access_token": "<new jwt>",
  "refresh_token": "<new refresh token>",
  "token_type": "bearer"
}
```

**Errors:**

- `401` — `{ "detail": "No refresh token provided." }`
- `401` — `{ "detail": "Your session has expired. Please log in again." }` (invalid, revoked, or expired refresh token)
- `422` — Validation failed

---

### POST `/api/auth/logout`

Revoke the given refresh token (sign out on the server so the token can't be reused).

**Auth Required:** No (takes the refresh token in the body)

**Request Body:**

```json
{
  "refresh_token": "<refresh_token>"
}
```

**Side Effects:** clears the stored `refreshTokenHash` / expiry. Returns `200`
even if the token was already revoked.

**Response (200):**

```json
{
  "message": "Logged out successfully."
}
```

---

### GET `/api/auth/me`

Get the currently authenticated user's profile.

**Auth Required:** Yes

**Response (200):**

```json
{
  "fullName": "Example User",
  "email": "user@example.com",
  "age": 22,
  "educationLevel": "College",
  "interests": ["Economy", "Education"]
}
```

**Errors:**

- `401` — missing/invalid/expired token

---

## AI

### POST `/api/ai/explain`

Generate an age/education-appropriate, neutral explanation for a topic.

**Status:** live (Phase 6–7). Backed by Gemini, verified against the topic's
official sources, cached in-memory for 10 minutes (same topic + profile).

**Auth Required:** No

**Request Body:**

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

**Validation Rules:**

| Field             | Type              | Required | Notes                                            |
| ----------------- | ----------------- | -------- | ------------------------------------------------ |
| `topic_id`        | string            | yes      | Topic id from `/api/topics` (e.g. `gst`)         |
| `age`             | integer           | yes      | Used to match explanation depth                  |
| `education_level` | string            | yes      | e.g. `School`, `College`, `Professional`          |
| `interests`       | array of strings  | no       | Adds helpful examples where the material supports it |
| `style`           | string            | no       | e.g. `simple`, `detailed`; omitted → automatic   |
| `language`        | string            | no       | `English`, `Hindi`, `Hinglish`; default `English` |

**Response (200):** `ExplainResponse`

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

**Errors:**

| Code | Meaning |
| ---- | ------- |
| `404` | Topic not found (`{ "detail": "Topic not found." }`) |
| `422` | Validation error (missing/invalid request fields) |
| `502` | AI provider unavailable, rate-limited, or output failed verification |
| `500` | Unexpected server error |

---

### POST `/api/ai/chat`

Answer follow-up questions about a topic, grounded in the topic material and its
official sources.

**Status:** live (Phase 7). The last 6 conversation turns are sent to the provider.

**Auth Required:** No

**Request Body:**

```json
{
  "topic_id": "gst",
  "messages": [
    { "role": "user", "content": "What is GST in one sentence?" }
  ],
  "language": "English"
}
```

**Validation Rules:**

| Field      | Type                         | Required | Notes                                                          |
| ---------- | ---------------------------- | -------- | -------------------------------------------------------------- |
| `topic_id` | string                       | yes      | Topic id from `/api/topics`                                    |
| `messages` | array of `{role, content}`   | yes      | `role` is `user` or `assistant`; oldest turns beyond the last 6 are trimmed server-side |
| `language` | string                       | no       | `English`, `Hindi`, `Hinglish`; default `English`               |

**Response (200):**

```json
{
  "reply": "Goods and Services Tax (GST) is an indirect tax ..."
}
```

**Errors:**

| Code | Meaning |
| ---- | ------- |
| `404` | Topic not found |
| `422` | Empty `messages` or validation error |
| `502` | AI provider unavailable / rate-limited, or reply cited a URL outside the topic's official sources (rejected by verification) |
| `500` | Unexpected server error |

**Notes:** transient provider errors (HTTP 429/5xx) are retried up to
`GEMINI_MAX_RETRIES` times (default 3) with backoff (5s → 20s → 40s). A live
`429` (free-tier daily quota) returns a `502` with a rate-limit hint.

---

### POST `/api/ai/explain-tracker`

Generate an age/education-appropriate, neutral explanation for a **bill or
protest tracker** (`/api/trackers` item). Same contract and verification as
`/api/ai/explain`, but grounded in the tracker document (summary, status,
stage, viewpoints, official sources) instead of a topic.

**Status:** live (Phase 12). Backed by Gemini, verified against the tracker's
official sources, cached in-memory for 10 minutes (same tracker + profile).

**Auth Required:** No

**Request Body:**

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

**Validation Rules:**

| Field             | Type              | Required | Notes                                          |
| ----------------- | ----------------- | -------- | ---------------------------------------------- |
| `tracker_id`      | string            | yes      | Tracker id from `/api/trackers` (e.g. `fcra-amendment`) |
| `age`             | integer           | yes      | Used to match explanation depth                |
| `education_level` | string            | yes      | e.g. `School`, `College`, `Professional`        |
| `interests`       | array of strings  | no       | Adds helpful examples where the material supports it |
| `style`           | string            | no       | e.g. `simple`, `detailed`; omitted → automatic |
| `language`        | string            | no       | `English`, `Hindi`, `Hinglish`; default `English` |

**Response (200):** an `ExplainResponse` (same shape as `/api/ai/explain`).

**Errors:**

| Code | Meaning |
| ---- | ------- |
| `404` | Tracker not found (`{ "detail": "Tracker not found." }`) |
| `422` | Validation error (missing/invalid request fields) |
| `502` | AI provider unavailable, rate-limited, or output failed verification against the tracker's sources |
| `500` | Unexpected server error |

---

### POST `/api/ai/chat-tracker`

Answer follow-up questions about a **bill or protest tracker**, grounded in the
tracker document and its official sources. Same contract as `/api/ai/chat`.

**Status:** live (Phase 13). The last 6 conversation turns are sent to the provider.

**Auth Required:** No

**Request Body:**

```json
{
  "tracker_id": "fcra-amendment",
  "messages": [
    { "role": "user", "content": "What does this bill change?" }
  ],
  "language": "English"
}
```

**Validation Rules:**

| Field        | Type                         | Required | Notes                                                          |
| ------------ | ---------------------------- | -------- | -------------------------------------------------------------- |
| `tracker_id` | string                       | yes      | Tracker id from `/api/trackers`                                |
| `messages`   | array of `{role, content}`   | yes      | `role` is `user` or `assistant`; oldest turns beyond the last 6 are trimmed server-side |
| `language`   | string                       | no       | `English`, `Hindi`, `Hinglish`; default `English`               |

**Response (200):**

```json
{
  "reply": "The Bill changes the Foreign Contribution (Regulation) Act ..."
}
```

**Errors:**

| Code | Meaning |
| ---- | ------- |
| `404` | Tracker not found |
| `422` | Empty `messages` or validation error |
| `502` | AI provider unavailable / rate-limited, or reply cited a URL outside the tracker's official sources (rejected by verification) |
| `500` | Unexpected server error |

**Notes:** returns the same rate-limit-friendly `502` messaging as the other AI
endpoints when the free-tier daily quota is exhausted.

---

## History (Dashboard)

Per-user history stored inside `users_collection` under `savedHistory` (max 100
items, newest first). All routes require `Authorization: Bearer <token>` (401 if
missing/expired).

**Status:** live (Phase 8).

### GET `/api/history`

List the signed-in user's saved items.

**Auth Required:** Yes

**Response (200):**

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

**Notes:** `content` is an `ExplainResponse` (type `explain`) or
`{ "messages": [...], "reply": "..." }` (type `chat`).

---

### POST `/api/history`

Save an item to the dashboard.

**Auth Required:** Yes

**Request Body:**

```json
{
  "type": "explain",
  "topicId": "gst",
  "topicTitle": "GST",
  "language": "English",
  "content": {}
}
```

**Validation Rules:**

- `type`: Required, `"explain"` or `"chat"`
- `topicId`: Required, string
- `topicTitle`: Required, string
- `language`: Optional, default `"English"`
- `content`: Required, the saved payload (an `ExplainResponse` shape, or `{ "messages": [...], "reply": "..." }`)

**Response (200):**

```json
{
  "message": "Saved to your dashboard.",
  "item": { ... }
}
```

---

### DELETE `/api/history/{item_id}`

Remove one saved item.

**Auth Required:** Yes

**Path Parameters:**

| Parameter | Type   | Description |
| --------- | ------ | ----------- |
| `item_id` | string | Saved item ID |

**Response (200):**

```json
{
  "message": "Removed from your dashboard."
}
```

**Errors:**

- `404` — `{ "detail": "Saved item not found." }`

---

### DELETE `/api/history`

Clear the entire saved history.

**Auth Required:** Yes

**Response (200):**

```json
{
  "message": "Your dashboard has been cleared."
}
```

---

## Saved Topics (bookmarks)

Per-user saved topics stored inside `users_collection` under `savedTopics`
(max 100, newest first, deduplicated by `topicId`). All routes require
`Authorization: Bearer <token>` (401 if missing/expired).

**Status:** live (Phase 10).

### GET `/api/history/topics`

List the signed-in user's saved topics.

**Auth Required:** Yes

**Response (200):**

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

---

### POST `/api/history/topics`

Save a topic.

**Auth Required:** Yes

**Request Body:**

```json
{
  "topicId": "gst",
  "topicTitle": "GST",
  "category": "Economy",
  "readTime": "5 min",
  "summary": "An indirect tax system ..."
}
```

**Validation Rules:**

- `topicId`: Required; deduplicated (saving an existing one is idempotent)
- `topicTitle`, `category`, `readTime`, `summary`: Optional, informational (may be empty)

**Response (200):**

```json
{
  "message": "Topic saved. | Topic already saved.",
  "item": { ... }
}
```

---

### DELETE `/api/history/topics/{topic_id}`

Remove a saved topic.

**Auth Required:** Yes

**Path Parameters:**

| Parameter  | Type   | Description      |
| ---------- | ------ | ---------------- |
| `topic_id` | string | Saved topic id   |

**Response (200):**

```json
{
  "message": "Topic removed from your saved list."
}
```

**Errors:**

- `404` — `{ "detail": "Saved topic not found." }`

---

## Trackers

### GET `/api/trackers`

Civic trackers — bills before Parliament and active/concluded protests.
Read-only; content is curated and seeded (`python -m app.seed_trackers`),
neutral, with both sides noted under `viewpoints` and URL-verified sources.

**Auth Required:** No

**Query Parameters:**

| Parameter | Type   | Notes                                                      |
| --------- | ------ | ---------------------------------------------------------- |
| `type`    | string | optional; `bill` or `protest`. Omitted → all items. Any other value → all items. |

**Response (200):** items sorted by `lastUpdated` descending

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

---

### GET `/api/trackers/{tracker_id}`

Fetch a single tracker by its `id` slug (e.g. `fcra-amendment`).

**Auth Required:** No

**Path Parameters:**

| Parameter    | Type   | Description      |
| ------------ | ------ | ---------------- |
| `tracker_id` | string | Tracker's id slug |

**Response (200):** a single tracker document (same shape as one item above).

**Errors:**

- `404` — `{ "detail": "Tracker not found." }`

---

# Error Examples

### Validation Error (422)

```json
{
  "detail": [
    {
      "type": "missing",
      "loc": ["body", "email"],
      "msg": "Field required",
      "input": { "fullName": "Example User" }
    }
  ]
}
```

### Unauthorized (401)

```json
{
  "detail": "Invalid email or password."
}
```

### Not Found (404)

```json
{
  "detail": "Topic not found."
}
```

### Bad Request (400)

```json
{
  "detail": "An account with this email already exists."
}
```

### AI Unavailable (502)

```json
{
  "detail": "The AI service is temporarily unavailable while explaining this topic. Please try again later."
}
```