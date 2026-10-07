# GovQueue AI — Citizen Appointment Booking & Real-Time Queue Management

**GovQueue AI** is a digital public administrative platform designed for government services appointment booking, real-time citizen queue progression tracking, and automated service navigation with **GovGuide AI** (powered by server-side Google Gemini).

---

## 🌟 Key Features

### For Citizens
- **Service Discovery**: Search, filter, and discover official government services (Aadhaar, PAN, Birth Certificate, Driving Licence, etc.) with required documents checklists.
- **GovGuide AI**: Conversational assistant that maps natural language citizen situations (e.g., "I moved to a new address") to exact civic services and required proofs using structured server-side Gemini output.
- **Multi-Step Appointment Booking**: Verified availability slots generated dynamically from service center capacity and counter availability.
- **Live Digital Queue Tracker**: Real-time polling tracking token number, currently serving token, citizens ahead, and estimated wait minutes.
- **In-App Notifications**: Real-time alerts when appointments are booked, checked in, or tokens are called.

### For Staff
- **Operational Queue Desk**: Live terminal with Call Next engine, Recall, Complete session, and No-Show markings.
- **Automated Queue Calculations**: Deterministic calculation of next waiting citizen and remaining wait times.
- **Counter Reception Check-In**: Instant lookup of today's citizen appointments and queue token activations.

### For Administrators
- **Executive Operations Console**: Full Recharts analytics covering appointments by day, by service, by center, and hourly queue load trends.
- **Catalog Management**: Add, update, and deactivate services, center operating hours, and active counters.
- **Immutable Audit Trail**: Detailed audit logs recording logins, bookings, cancellations, staff calls, and AI guidance invocations.

---

## 🛠 Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, React Router v7, Lucide React, Recharts
- **Backend**: Node.js, Express, TypeScript, tsx, Zod
- **Database**: Relational PostgreSQL schema (PostgreSQL via `pg.Pool` with connection pooling, transactional fallback to persistent atomic disk store)
- **AI**: Google Gemini (`gemini-3.8-flash`) via the official `@google/genai` TypeScript SDK with server-side structured JSON schemas and deterministic fallback

---

## 🔑 Demo Accounts

Use the **1-Click Demo Logins** button in the top navigation or enter the credentials below:

| Role | Email | Password | Details |
|---|---|---|---|
| **Citizen** | `citizen@govqueue.demo` | `Demo@123` | **Rahul Sharma** • Active Token **A27** |
| **Staff** | `staff@govqueue.demo` | `Demo@123` | **Priya Verma** • Public Services Officer |
| **Admin** | `admin@govqueue.demo` | `Demo@123` | **Rajesh Kumar** • District Director |

### Rahul Sharma Demo Queue State (7 October 2026):
- **Service**: Aadhaar Address Update
- **Center**: District Citizen Service Center
- **Appointment Time**: 10:30 AM
- **Token Code**: **A27**
- **Currently Serving**: **A23**
- **People Ahead**: **3** citizens (A24, A25, A26)
- **Estimated Wait**: **18 minutes** (3 people × 6 min average duration)

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env`:

```env
# Gemini API Key (server-side only)
GEMINI_API_KEY="your-gemini-api-key"

# Database Configuration (Optional PostgreSQL / Supabase)
DATABASE_URL="postgres://..."

# Auth
JWT_SECRET="govqueue_secure_jwt_secret_change_in_production"

# Port
PORT=3000
```

---

## 🚀 Running Locally

```bash
# Install dependencies
npm install

# Start full-stack development server (Express backend + Vite middleware)
npm run dev

# Build for production
npm run build

# Start production server
npm start
```
App runs at `http://localhost:3000`.
