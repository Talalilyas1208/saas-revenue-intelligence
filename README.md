# ⚡ RevTerm // SaaS Revenue Intelligence Platform

A production-ready SaaS revenue & billing intelligence platform built with **Express.js**, **Sequelize ORM**, **Supabase PostgreSQL**, **React 18**, **Redux Toolkit (RTK Query)**, and a **clean medium-white UI** (plus an optional Python Textual TUI companion).

Repository: [https://github.com/Talalilyas1208/saas-revenue-intelligence](https://github.com/Talalilyas1208/saas-revenue-intelligence)

---

## 🌟 Architecture & Tech Stack

```text
saas-revenue-intelligence/
├── server/                    # Layered Express.js + Sequelize Backend
│   ├── src/
│   │   ├── config/            # Supabase Postgres / SQLite connection
│   │   ├── models/            # Sequelize Models (User, Organization, Transaction, Customer)
│   │   ├── controllers/       # Auth, Metrics, and Raw-Body Stripe Webhook controllers
│   │   ├── services/          # Stripe SDK sync, TTL MetricsCache, and analytics aggregation
│   │   ├── middlewares/       # Strict JWT Auth & centralized error handler
│   │   ├── routes/            # /api/v1/auth & /api/v1/metrics routes
│   │   ├── app.js             # Express app setup, SEO endpoints, & SPA serving
│   │   └── server.js          # Server bootstrap & graceful shutdown
│   ├── .env.example           # Environment variable template (never commit .env)
│   └── package.json
│
├── client/                    # React 18 + Redux Toolkit Frontend
│   ├── src/
│   │   ├── app/               # Redux store & RTK Query (apiSlice.js)
│   │   ├── features/ui/       # Auth token, active workspace, date range & UI state
│   │   ├── components/        # Code-split lazy-loaded UI components
│   │   │   ├── AuthScreen.jsx # Workspace setup & JWT sign-in
│   │   │   ├── Sidebar.jsx    # Multi-workspace switcher & navigation
│   │   │   ├── Header.jsx     # Global search (⌘K), date presets, Stripe sync & payment trigger
│   │   │   ├── StatCard.jsx   # KPI cards with explainer tooltips
│   │   │   ├── RevenueChart.jsx # Recharts area chart (7D / 30D / 90D / 1Y)
│   │   │   ├── LiveEventFeed.jsx # Real-time billing stream with status filters
│   │   │   ├── CustomerTable.jsx # Searchable subscriber directory, status toggle & CSV export
│   │   │   ├── SettingsView.jsx # Profile, live Stripe API key verification & Supabase status
│   │   │   ├── RecordPaymentModal.jsx # Manual invoice/payment recording
│   │   │   └── LicenseModal.jsx # Polar.sh / HMAC Pro license activation
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/                # sitemap.xml, robots.txt, compressed SVG assets
│   ├── vite.config.js         # Manual chunk splitting
│   └── tailwind.config.js
│
├── supabase/
│   └── schema.sql             # PostgreSQL schema, indexes & Row-Level Security lockdown
├── Dockerfile                 # Multi-stage production container
└── docker-compose.yml         # Full-stack runtime with PostgreSQL
```

---

## 🚀 Quickstart (Local Development)

### 1. Install Dependencies & Build Frontend
```bash
npm run install:all
npm run build
```

### 2. Configure Environment (Private — Gitignored)
```bash
cp server/.env.example server/.env
```
Set `SUPABASE_DB_URL` (your Supabase Transaction/Session Pooler URI) and `JWT_SECRET` in `server/.env`. Apply `supabase/schema.sql` in your Supabase SQL Editor to enforce Row-Level Security.

### 3. Start the Server
```bash
npm start
```
- Open [http://localhost:5001](http://localhost:5001) in your browser.
- Health check: [http://localhost:5001/health](http://localhost:5001/health)

---

## 🌐 0-to-Publish Deployment

1. Push to GitHub (`main` branch).
2. Create a Web Service on **Railway** or **Render** using the included `Dockerfile`.
3. Configure environment variables:
   - `NODE_ENV=production`
   - `SUPABASE_DB_URL` (or managed `DATABASE_URL`)
   - `JWT_SECRET`
   - `STRIPE_WEBHOOK_SECRET` (optional, for live Stripe webhooks at `/api/v1/webhooks/stripe`)
4. Deploy—the multi-stage build compiles the React frontend and launches Express on port `5001`.
