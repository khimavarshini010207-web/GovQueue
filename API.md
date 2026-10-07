# GovQueue AI — API Reference

All responses conform to the standard structure:

### Success Response:
```json
{
  "success": true,
  "data": {}
}
```

### Error Response:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable description"
  }
}
```

---

## 1. Authentication Endpoints

### `POST /api/auth/register`
Creates a new citizen profile.
- **Body**: `{ "fullName": "...", "email": "...", "phone": "...", "password": "..." }`
- **Response**: `{ "user": { "id": "...", "role": "CITIZEN" }, "token": "..." }`

### `POST /api/auth/login`
Authenticates user and returns JWT session cookie.
- **Body**: `{ "email": "...", "password": "..." }`

### `GET /api/auth/me`
Retrieves currently authenticated session.

---

## 2. Services Endpoints

### `GET /api/services`
Query parameters: `search`, `category`, `department`, `sort`.

### `GET /api/services/:id`
Returns full service details and authorized centers.

### `POST /api/services` (Admin only)
Creates new government service record.

---

## 3. Availability Endpoints

### `GET /api/availability`
- **Query parameters**: `centerId`, `serviceId`, `date` (format: `YYYY-MM-DD`)
- **Returns**: Operating hours, center capacity, and array of slots with `available: true/false`.

---

## 4. Appointments & Queues Endpoints

### `POST /api/appointments`
Creates appointment, allocates sequential queue token, and logs audit trail.
- **Body**: `{ "serviceId": "...", "centerId": "...", "appointmentDate": "YYYY-MM-DD", "startTime": "HH:MM" }`

### `POST /api/appointments/:id/check-in`
Checks citizen into queue, transitions token status to `WAITING`.

### `POST /api/queues/:id/call-next` (Staff / Admin)
Calls the next waiting token in line, transitions it to `SERVING`, and updates queue's current number.

### `POST /api/queues/:id/recall` (Staff / Admin)
Recalls currently serving citizen and issues reminder notification.

### `POST /api/queue-tokens/:id/complete` (Staff / Admin)
Marks service session complete.

### `POST /api/queue-tokens/:id/no-show` (Staff / Admin)
Marks citizen absent.

---

## 5. GovGuide AI Guidance

### `POST /api/ai/guide`
- **Body**: `{ "query": "I moved to a new house. What should I do?", "conversationId": "..." }`
- **Returns**: Structured recommendation from `gemini-3.8-flash` with matching service and required documents.

---

## 6. Admin Analytics

### `GET /api/admin/analytics`
Returns aggregated operational metrics for Recharts visualizations (appointments by day, service, center, wait times).
