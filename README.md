# ⚡ RevTerm // SaaS Revenue Intelligence Platform

A high-performance, commercial-grade SaaS revenue & metrics intelligence platform built with **Express.js**, **Sequelize ORM**, **React 18**, **Redux Toolkit (RTK Query)**, and a **Modern Glassmorphic Dark UI**.

---

## 🌟 Architecture & Tech Stack

```text
revterm/
├── server/                    # Layered Express.js + Sequelize Backend
│   ├── src/
│   │   ├── config/            # DB connection (PostgreSQL / SQLite) & Seed data
│   │   ├── models/            # Sequelize Models (User, Organization, Transaction, Customer)
│   │   ├── controllers/       # HTTP Request Handlers
│   │   ├── services/          # Business logic & 30-day analytics aggregation
│   │   ├── middlewares/       # Centralized error handler & JWT Auth
│   │   ├── routes/            # REST API endpoints
│   │   ├── app.js             # Express app setup & static SPA serving
│   │   └── server.js          # Server bootstrap & graceful shutdown
│   └── package.json
│
├── client/                    # React 18 + Redux Toolkit Frontend
│   ├── src/
│   │   ├── app/               # Redux store & RTK Query (apiSlice.js)
│   │   ├── features/ui/       # UI slice (tabs, search, pro modal)
│   │   ├── components/        # Reusable UI component kit
│   │   │   ├── Navbar.jsx     # Header with live polling indicator & simulation trigger
│   │   │   ├── StatCard.jsx   # Glassmorphic KPI cards with growth pills
│   │   │   ├── RevenueChart.jsx # Interactive Recharts gradient area chart
│   │   │   ├── LiveEventFeed.jsx # Real-time billing transactions stream
│   │   │   ├── CustomerTable.jsx # Searchable customer directory & MRR sort
│   │   │   └── LicenseModal.jsx # Pro licensing & cryptographic key activation
│   │   ├── App.jsx            # Main dashboard view
│   │   └── main.jsx
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── Dockerfile                 # Multi-stage production container
└── docker-compose.yml         # Full-stack runtime with PostgreSQL
```

---

## 🚀 Quickstart (Local Development)

### 1. Launch the Server (Serves API + Built UI on Port 5001)

```bash
npm start
```
- Open [http://localhost:5001](http://localhost:5001) in your browser.
- Health check available at [http://localhost:5001/health](http://localhost:5001/health).

### 2. Run in Development Mode with Hot Reloading

Terminal 1 (Backend):
```bash
npm run server:dev
```

Terminal 2 (Frontend with Vite HMR):
```bash
npm run client:dev
```
- Open [http://localhost:3000](http://localhost:3000).

---

## 🌐 0-to-Publish Deployment Guide

### Option A: 1-Click Deploy to Render / Railway with Docker
1. Push this repository to GitHub.
2. In **Render** or **Railway**, create a new **Web Service** from your GitHub repo.
3. Select **Docker** as the environment.
4. Add environment variables:
   - `NODE_ENV=production`
   - `DATABASE_URL` (Attach a managed PostgreSQL database)
   - `JWT_SECRET` (A strong random secret key)
5. Hit **Deploy**. The multi-stage Docker build will automatically build the frontend assets, bundle the backend, and start the service with automatic SSL!

### Option B: Separate Frontend & Backend
- **Frontend (Vercel)**:
  - Root directory: `client`
  - Build command: `npm run build`
  - Output directory: `dist`
  - Environment variable: `VITE_API_BASE_URL=https://your-backend.railway.app`
- **Backend (Render / Railway / Fly.io)**:
  - Root directory: `server`
  - Start command: `npm start`
