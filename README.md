# LexTrust Backend API

Node.js + Express + MongoDB (Mongoose) backend for the LexTrust law firm website.

## What's included

- **Contact form** — `/api/contact` — used by both the Home page "Let's Talk" section and the `/contact` (Let's Talk) page. Saves to the `leads` collection.
- **Newsletter** — `/api/newsletter` — saves to the `subscribers` collection, blocks duplicate emails, supports unsubscribe.
- **Practice Areas / Lawyers / Testimonials** — public read endpoints + admin CRUD endpoints.
- **Site Content** — flexible key/value store used for the About Us page text.
- **Settings** — office phone/email/address/hours shown on the Contact page.
- **Admin auth** — JWT login (`/api/auth/login`).
- **Admin dashboard endpoints** — combined leads inbox, subscriber management, CSV export, dashboard stats (`/api/admin/*`).

## 1. Install dependencies

```bash
cd lextrust-backend
npm install
```

## 2. Configure your `.env`

```bash
cp .env.example .env
```

Then open `.env` and fill in:

- **`MONGO_URI`** — your MongoDB Atlas connection string.
  1. Go to [MongoDB Atlas](https://cloud.mongodb.com) → your Cluster → **Connect** → **Drivers** → Node.js.
  2. Copy the connection string, it looks like:
     `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
  3. Replace `<username>` and `<password>` with your Atlas database user credentials (Database Access tab in Atlas).
  4. Add your database name right after `.net/`, e.g. `.../lextrust?retryWrites=true...`
  5. Make sure your current IP (or `0.0.0.0/0` for testing) is allowed under **Network Access** in Atlas.
- **`JWT_SECRET`** — any long random string (used to sign admin login tokens).
- **`ADMIN_EMAIL`** / **`ADMIN_PASSWORD`** — credentials for the first admin account (created by the seed script). Change the password after first login.
- **`CLIENT_ORIGIN`** — comma-separated list of frontend URLs allowed to call this API (e.g. your React site + admin dashboard URLs).
- Email settings (`EMAIL_ENABLED`, `SMTP_*`) are optional — leave `EMAIL_ENABLED=false` if you don't need notification/welcome emails yet.

The collection name variables (`COLLECTION_LEADS`, `COLLECTION_SUBSCRIBERS`, etc.) let you rename MongoDB collections without touching code, if you want.

## 3. Seed the database

This loads your existing Practice Areas / Lawyers / Testimonials content into MongoDB and creates your first admin user:

```bash
npm run seed
```

## 4. Run the server

```bash
npm run dev     # with auto-reload (nodemon)
# or
npm start
```

Server runs on `http://localhost:5000` by default (change `PORT` in `.env`).

Health check: `GET http://localhost:5000/api/health`

## API Overview

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/contact` | Public | Submit contact form (home + contact page) |
| POST | `/api/newsletter` | Public | Subscribe to newsletter |
| POST | `/api/newsletter/unsubscribe` | Public | Unsubscribe by email |
| GET | `/api/practice-areas` | Public | List published practice areas |
| GET | `/api/practice-areas/:slug` | Public | Single practice area |
| GET | `/api/lawyers` | Public | List published lawyers |
| GET | `/api/lawyers/:slug` | Public | Single lawyer |
| GET | `/api/testimonials` | Public | List published testimonials |
| GET | `/api/testimonials/:slug` | Public | Single testimonial |
| GET | `/api/site-content/:key` | Public | Content block (e.g. `about-page`) |
| GET | `/api/settings` | Public | Office info |
| POST | `/api/auth/login` | Public | Admin login → returns JWT |
| GET/POST/PUT/DELETE | `/api/admin/leads`, `/api/practice-areas`, `/api/lawyers`, `/api/testimonials`, `/api/site-content`, `/api/settings`, `/api/admin/subscribers` | **Admin (JWT required)** | Manage everything from the admin dashboard |

Admin routes require header: `Authorization: Bearer <token>` (token comes from `/api/auth/login`).

## Deploying

Any Node host works (Render, Railway, Fly.io, a VPS, etc.). Set the same environment variables there as in `.env`, and update `CLIENT_ORIGIN` to your deployed frontend/admin URLs.
