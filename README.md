# user-service

NestJS HTTP API for Metr user sign-up, sign-in, and logout.

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

OTP is sent with Twilio when `TWILIO_*` env vars are set. Otherwise the code is logged in the server console.

## Frontend integration

Give this to the frontend (and their AI):

- [docs/Metr-User-Service-Frontend-API-Guide.pdf](docs/Metr-User-Service-Frontend-API-Guide.pdf) — printable contract
- [docs/Metr-User-Service-Frontend-API-Guide.md](docs/Metr-User-Service-Frontend-API-Guide.md) — same content, easier for AI tools to ingest

## Routes

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/health` | Liveness |
| `GET` | `/users/username/available?username=` | Username uniqueness |
| `POST` | `/auth/signup` | Start sign-up OTP |
| `POST` | `/auth/login` | Start login OTP |
| `POST` | `/auth/otp/verify` | Verify OTP, return JWT |
| `POST` | `/auth/otp/resend` | Resend OTP |
| `GET` | `/auth/me` | Current user |
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
