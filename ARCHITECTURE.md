# GovQueue AI — Architecture & Technical Design

## 1. System Overview

GovQueue AI implements a modern full-stack decoupled architecture running an Express TypeScript backend with Vite middleware during development and optimized static asset serving in production.

```
┌────────────────────────────────────────────────────────┐
│                   React 19 Frontend                    │
│   (React Router, Tailwind CSS, Lucide Icons, Recharts) │
└───────────────────────────┬────────────────────────────┘
                            │ REST / JSON (Credentials: include)
┌───────────────────────────▼────────────────────────────┐
│                  Express TypeScript API                │
│  ├── /api/auth          ├── /api/services              │
│  ├── /api/centers       ├── /api/availability          │
│  ├── /api/appointments  ├── /api/queues                │
│  ├── /api/queue-tokens  ├── /api/ai                    │
│  └── /api/admin                                        │
└──────┬────────────────────┬────────────────────┬───────┘
       │                    │                    │
┌──────▼───────┐     ┌──────▼───────┐     ┌──────▼───────┐
│ Google Gemini│     │ PostgreSQL   │     │ Deterministic│
│ @google/genai│     │ / Supabase   │     │ Queue Engine │
│ 3.8-flash    │     │ Store        │     │ Engine       │
└──────────────┘     └──────────────┘     └──────────────┘
```

## 2. Relational Database Layer

The schema enforces strict relational consistency across the following entities:

1. `users`: Multi-role RBAC (`CITIZEN`, `STAFF`, `ADMIN`), bcrypt password hashing.
2. `services`: Catalog containing processing times, departments, required documents JSON.
3. `service_centers`: Code, address, district, helpline.
4. `operating_hours`: Weekly schedule with `day_of_week`, `open_time`, `close_time`, `is_closed`.
5. `counters`: Service desk counters determining concurrency per time slot.
6. `staff_profiles`: Relational assignment of users to centers with employee ID and designation.
7. `appointments`: Central booking record with unique booking reference `GQ-2026-XXXX`.
8. `queues`: Relational queue grouping by `centerId`, `serviceId`, and `date`.
9. `queue_tokens`: Sequential token codes (`A23`, `A27`), status lifecycle, and timestamps.
10. `notifications`: In-app event-driven citizen messages.
11. `ai_conversations` & `ai_messages`: Structured dialogue logging for GovGuide AI.
12. `audit_logs`: Append-only compliance log for regulatory traceability.

### Persistence Strategy
- When `DATABASE_URL` is configured: connects via `pg.Pool` to execute relational SQL tables, parameterized statements, and database constraints.
- When `DATABASE_URL` is omitted: uses a persistent relational store on disk (`data/govqueue_database.json`) with atomic write transactions to guarantee persistence across server restarts without in-memory transient data loss.

## 3. Queue Calculation Engine

Queue positions are computed deterministically on the server side:

$$\text{peopleAhead} = \sum [\text{active tokens in queue with status } \text{WAITING} \text{ and } \text{tokenNumber} < \text{current token}]$$

$$\text{estimatedWaitMinutes} = \text{peopleAhead} \times \text{service.estimatedMinutes}$$

This ensures mathematical precision without reliance on nondeterministic LLM calls.

## 4. Security & Authorization

- **JWT Authentication**: Sent via HTTP-only cookie (`token`) with Bearer header fallback.
- **RBAC Enforcement**: Middleware `requireAuth` and `requireRole(['STAFF', 'ADMIN'])` enforce permissions on backend API endpoints.
- **Input Validation**: Centralized Zod schemas validate bodies, query parameters, and IDs.
- **Audit Logging**: Every sensitive action creates an immutable log entry with user ID, entity ID, action name, and JSON metadata.
