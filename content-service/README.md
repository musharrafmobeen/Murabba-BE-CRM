# content-service

NestJS HTTP API for Murabba content and Contact Us. Port **3001**.

App copy (About, Help, Version, contact types) is stored in Postgres. Error strings stay in `src/common/error-messages.json`.

Public app routes need no auth. Admin panel routes need header `x-admin-key: $ADMIN_API_KEY`.

## Public routes

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/health` | No | Liveness |
| `GET` | `/about` | No | About the App (EN + AR) |
| `GET` | `/help` | No | Help Center / FAQs (EN + AR) |
| `GET` | `/version` | No | App version and build (footer) |
| `GET` | `/languages` | No | Language selector (AR / EN) |
| `GET` | `/contact/types` | No | Contact dropdown types |
| `POST` | `/contact` | No | Submit Contact Us |

## Admin routes

All of these use `x-admin-key`.

| Method | Path |
| --- | --- |
| `GET` `POST` | `/admin/about` |
| `GET` `PATCH` `DELETE` | `/admin/about/:id` |
| `GET` `POST` | `/admin/help-pages` |
| `GET` `PATCH` `DELETE` | `/admin/help-pages/:id` |
| `GET` `POST` | `/admin/help-categories` |
| `GET` `PATCH` `DELETE` | `/admin/help-categories/:id` |
| `GET` `POST` | `/admin/help-items` |
| `GET` `PATCH` `DELETE` | `/admin/help-items/:id` |
| `GET` `POST` | `/admin/versions` |
| `GET` `PATCH` `DELETE` | `/admin/versions/:id` |
| `GET` `POST` | `/admin/contact-types` |
| `GET` `PATCH` `DELETE` | `/admin/contact-types/:id` |
| `GET` `POST` | `/admin/language-pages` |
| `GET` `PATCH` `DELETE` | `/admin/language-pages/:id` |
| `GET` `POST` | `/admin/languages` |
| `GET` `PATCH` `DELETE` | `/admin/languages/:id` |

## Setup

```bash
cp .env.example .env
npm install
npm run migration:run
npm run start:dev
```

Set `ADMIN_API_KEY` in `.env`. Public `GET`s read the active row in each table. The first CMS migration seeds the current About / Help / Version / contact-type copy.

`GET /version` uses the active `app_versions` row. If none exists, it uses `APP_VERSION`, `APP_BUILD`, and `APP_CHANNEL` from `.env`.

## Language selector

`GET /languages` returns sheet labels plus Arabic (`rtl`) and English (`ltr`). The app should:

- Persist the chosen code in local storage (Shared Preferences / UserDefaults) — Word spec
- If none is saved, use the device language when it is `ar` or `en`, otherwise `fallbackCode`
- Apply RTL/LTR immediately without restart

Hamburger sheet, radio highlight, and layout flip are frontend.

## Contact Us

Word spec rules:

- Phone **or** email (or both)
- `title` required (3–120)
- `type` must match a row in `contact_types`
- `message` 20–256 characters
- `acceptedPrivacy: true`
- Max 3 submissions per phone/email every 15 minutes

```json
POST /contact
{
  "phone": "+96651234567",
  "email": "user@example.com",
  "title": "Cannot login",
  "type": "ACCOUNT_ISSUE",
  "message": "I cannot sign in with my phone number today.",
  "acceptedPrivacy": true
}
```

Hamburger menu, thank-you UI, accordion, and logged-in pre-fill are frontend.
