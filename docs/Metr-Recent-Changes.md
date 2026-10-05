# Metr Backend — Recent Changes (Oct 2026)

**Audience:** frontend, QA, stakeholders  
**Date:** 5 October 2026  
**Services:** `user-service` (`:3000`) · `content-service` (`:3001`)  
**Postman:** `postman/Metr-API.postman_collection.json`  
**Full API contract:** `docs/Metr-Frontend-API-Guide.md` / `.pdf`

This note covers the work from the last few days. Errors are bilingual:

```json
{ "error": "CODE", "message": { "en": "...", "ar": "..." } }
```

---

## 1. Account Recovery (guest) — content-service

Manual recovery only. Guest proves phone ownership with OTP, then submits a Contact Us ticket of type **Account Recovery**. Support reviews offline — **no auto-restore API**.

### Flow

1. Guest taps **Recover Account** (login / help) — frontend only; hide when logged in  
2. Contact Us opens with type locked to `ACCOUNT_RECOVERY`  
3. Enter mobile → OTP SMS (or content-service console if 4Jawaly empty)  
4. Verify 6-digit OTP  
5. Write message → Submit  
6. Thank-you + ticket id for support  

### OTP rules (same as auth)

| Rule | Value |
| --- | --- |
| Length | 6 digits |
| TTL | 2 minutes |
| Max wrong attempts | 3 → lock 5 minutes |
| Resend cooldown | 30 seconds |
| Max resends | 3 per session |

### Contact type

`ACCOUNT_RECOVERY` — labels: **Account Recovery** / **استرجاع الحساب**

### APIs

#### Start OTP

```bash
curl -X POST http://localhost:3001/contact/recovery/otp/start \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"+96651234567\"}"
```

**201**

```json
{
  "sessionId": "uuid",
  "expiresAt": "...",
  "resendAvailableAt": "...",
  "attemptsRemaining": 3
}
```

#### Verify OTP

```bash
curl -X POST http://localhost:3001/contact/recovery/otp/verify \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\":\"SESSION_ID\",\"code\":\"123456\"}"
```

**201** `{ "sessionId": "uuid", "verified": true, "phone": "+96651234567" }`

| Error | HTTP |
| --- | --- |
| `OTP_INVALID` | 400 + `attemptsRemaining` |
| `OTP_EXPIRED` | 400 |
| `OTP_LOCKED` | 429 + `lockedUntil` |
| `SESSION_NOT_FOUND` | 404 |

#### Resend OTP

```bash
curl -X POST http://localhost:3001/contact/recovery/otp/resend \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\":\"SESSION_ID\"}"
```

#### Submit recovery ticket

```bash
curl -X POST http://localhost:3001/contact \
  -H "Content-Type: application/json" \
  -d "{\"type\":\"ACCOUNT_RECOVERY\",\"phone\":\"+96651234567\",\"sessionId\":\"SESSION_ID\",\"message\":\"I deleted my account by mistake and want it back please.\",\"acceptedPrivacy\":true}"
```

Required: `type`, `phone`, verified `sessionId`, `message` (20–256), `acceptedPrivacy: true`.  
Optional: `email`, `title` (defaults to `Account Recovery`).

**201** `{ "id": "uuid", "message": { "en", "ar" }, "followUp": { "en", "ar" } }`

| Error | When |
| --- | --- |
| `RECOVERY_OTP_REQUIRED` | missing `sessionId` |
| `RECOVERY_OTP_NOT_VERIFIED` | not verified / phone mismatch |
| `CONTACT_PHONE_REQUIRED` | no phone |
| `CONTACT_RATE_LIMITED` | >3 submits / 15 min |

### Env (content-service)

```
OTP_SECRET=...
JAWALY_API_KEY=
JAWALY_API_SECRET=
JAWALY_SENDER=
```

If Jawaly keys are empty, OTP is logged in the **content-service** terminal.

---

## 2. Follow / Following (advertisers only) — user-service

Already on the API. Summary for handoff:

- Flag: `isAdvertiser` (default `false` on signup)
- Follow only advertisers → else `403 FOLLOW_NOT_ALLOWED`
- Search + suggested = advertisers only
- Following list = advertisers only
- Profile flags: `canFollow`, `isFollowing`, `showFollowers`, `canBeFollowed`

### Curls

```bash
# JWT required
curl "http://localhost:3000/users/search?q=ali" -H "Authorization: Bearer ACCESS_TOKEN"
curl "http://localhost:3000/users/suggested" -H "Authorization: Bearer ACCESS_TOKEN"
curl http://localhost:3000/users/USER_ID -H "Authorization: Bearer ACCESS_TOKEN"
curl http://localhost:3000/users/USER_ID/following?limit=20&offset=0 \
  -H "Authorization: Bearer ACCESS_TOKEN"
curl http://localhost:3000/users/USER_ID/followers?limit=20&offset=0 \
  -H "Authorization: Bearer ACCESS_TOKEN"
curl -X POST http://localhost:3000/users/ADVERTISER_ID/follow \
  -H "Authorization: Bearer ACCESS_TOKEN"
curl -X DELETE http://localhost:3000/users/ADVERTISER_ID/follow \
  -H "Authorization: Bearer ACCESS_TOKEN"
```

Following list item shape (for Unfollow UI):

```json
{
  "id": "uuid",
  "username": "agent1",
  "displayName": "Ali Ahmed",
  "photoUrl": "/uploads/...",
  "isAdvertiser": true,
  "followingCount": 3500,
  "isFollowing": true,
  "canFollow": false
}
```

Empty Following list → frontend empty state (“You’re not following any advertisers yet” + Find advertisers).

**Not built:** Following posts feed, video Follow CTAs, upgrade/downgrade advertiser API.

---

## 3. Combined docs & Postman

One collection and one frontend guide for **both** services:

| File | Use |
| --- | --- |
| `postman/Metr-API.postman_collection.json` | Import in Postman |
| `docs/Metr-Frontend-API-Guide.md` | Full contract (AI-friendly) |
| `docs/Metr-Frontend-API-Guide.pdf` | Printable handoff |

Folders: User Service (auth, profile, follows) · Content Service (About/Help/Version/Languages/Contact + recovery OTP + admin CMS).

Happy path: Sign up → paste OTP from **user-service** console → Verify → Me / Content / Recovery.

---

## 4. Normal Contact Us (unchanged + recovery type)

```bash
curl http://localhost:3001/contact/types
curl -X POST http://localhost:3001/contact \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"+96651234567\",\"title\":\"Cannot login\",\"type\":\"ACCOUNT_ISSUE\",\"message\":\"I cannot sign in with my phone number today.\",\"acceptedPrivacy\":true}"
```

Types include: `FEEDBACK`, `BUG_REPORT`, `FEATURE_REQUEST`, `ACCOUNT_ISSUE`, `OTHER`, **`ACCOUNT_RECOVERY`**.

---

## 5. Auth reminder (user-service)

```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"+96651234567\",\"username\":\"Murabaa-1837\",\"acceptedTerms\":true}"

curl -X POST http://localhost:3000/auth/otp/verify \
  -H "Content-Type: application/json" \
  -d "{\"sessionId\":\"SESSION_ID\",\"code\":\"123456\"}"

curl http://localhost:3000/auth/me -H "Authorization: Bearer ACCESS_TOKEN"
```

---

## Not in this release

- Video upload / feed / Scylla timeline  
- Search videos by username or city (Elasticsearch)  
- Media storage ticket (S3/etc.) — awaiting assignment  
- Auto account restore after recovery  
- Advertiser role upgrade/downgrade HTTP API  

---

## Quick test checklist

1. content-service health: `GET :3001/health`  
2. Recovery OTP start → console code → verify → `POST /contact` `ACCOUNT_RECOVERY`  
3. Wrong OTP → `OTP_INVALID`; 3 fails → `OTP_LOCKED`  
4. user-service: signup/login OTP still works  
5. Follow advertiser OK; follow normal user → `FOLLOW_NOT_ALLOWED`  
6. Search returns advertisers only  
