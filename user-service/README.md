# Murabba-BE-CRM

NestJS HTTP API for Metr user sign-up, sign-in, and logout (`user-service`).

## Setup

```bash
cp .env.example .env
npm install
npm run start:dev
```

Local/dev DB is configured in `.env`. Schema is applied with TypeORM migrations (not `synchronize`).

```bash
cp .env.example .env
npm install
npm run migration:run
npm run start:dev
```

OTP is sent with 4Jawaly when `JAWALY_API_KEY`, `JAWALY_API_SECRET`, and `JAWALY_SENDER` are set. Otherwise the code is logged in the server console.

Profile photos are written under `UPLOAD_DIR` (default `uploads/profiles/`) and served at `/uploads/...`. The database stores only `photoPath`.

Only advertisers (`isAdvertiser: true`) can be followed, appear in search/suggestions, and show a Followers list. Normal users always have `followersCount: 0`. Following lists only include advertisers. The following **posts** feed is not in this service.

## Frontend integration

Give this to the frontend (and their AI):

- [docs/Metr-User-Service-Frontend-API-Guide.pdf](docs/Metr-User-Service-Frontend-API-Guide.pdf) — printable contract
- [docs/Metr-User-Service-Frontend-API-Guide.md](docs/Metr-User-Service-Frontend-API-Guide.md) — same content, easier for AI tools to ingest

## Routes

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/health` | Liveness |
| `GET` | `/users/search?q=` | Search advertisers only (JWT) |
| `GET` | `/users/suggested` | Suggested advertisers (JWT) |
| `GET` | `/users/:id` | Profile + follow counts/flags (JWT) |
| `GET` | `/users/:id/followers` | Followers (empty if normal user) |
| `GET` | `/users/:id/following` | Advertisers they follow |
| `POST` | `/users/:id/follow` | Follow an advertiser |
| `DELETE` | `/users/:id/follow` | Unfollow |
| `POST` | `/auth/signup` | Start sign-up OTP |
| `POST` | `/auth/login` | Start login OTP |
| `POST` | `/auth/otp/verify` | Verify OTP, return JWT |
| `POST` | `/auth/otp/resend` | Resend OTP |
| `GET` | `/auth/me` | Current user (JWT) |
| `PATCH` | `/auth/me` | Update display name, city, bio |
| `POST` | `/auth/me/photo` | Upload profile photo (local disk) |
| `GET` | `/uploads/...` | Serve stored photos |
| `POST` | `/auth/logout` | Invalidate JWT |
| `DELETE` | `/auth/account` | Delete account |

## Scripts

| Command | Description |
| --- | --- |
| `npm run start:dev` | Watch mode |
| `npm run migration:run` | Create/update tables |
| `npm run migration:revert` | Undo last migration |
| `npm test` | Unit tests |
| `npm run test:e2e` | End-to-end tests |
