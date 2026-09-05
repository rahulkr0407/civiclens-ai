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

Note: no JWT/session token is issued yet. The frontend stores the returned
`user` object in `localStorage` for session UI; this is a known item for the
Phase 9 production hardening.

---

## `POST /api/ai/explain`

Generate an age/education-appropriate, neutral explanation for a topic.

**Status:** contract finalised (Phase 5). The endpoint currently returns a
**stub** matching the response shape. The real Gemini provider is connected in
Phase 6.

**Request body:**

```json
{
  "topic_id": "gst",
  "age": 16,
  "education_level": "School",
  "interests": ["Economy"],
  "style": "simple"
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `topic_id` | string | yes | Topic id from `/api/topics` (e.g. `gst`) |
| `age` | integer | yes | Used to match explanation depth |
| `education_level` | string | yes | e.g. `School`, `College`, `Professional` |
| `interests` | array of strings | no | Used to add helpful examples when supported by the material |
| `style` | string | no | e.g. `simple`, `detailed`; omitted → automatic |

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
| `502` | AI provider unavailable or returned invalid output (Phase 6) |
| `500` | Unexpected server error |