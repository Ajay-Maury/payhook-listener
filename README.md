# PayHook Listener Service

A NestJS application that simulates a webhook listener (e.g., Razorpay, PayPal).  
It validates incoming signatures, parses JSON payloads, and stores payment events in PostgreSQL using Prisma ORM.

---

## 🚀 Features
- NestJS + Prisma ORM + PostgreSQL
- HMAC-SHA256 signature validation (`X-Razorpay-Signature`)
- Captures raw body for correct signature verification
- Strict DTO validation with `class-validator`
- Idempotency: duplicate events (same `event_id`) are ignored
- Query API to fetch all events for a given `payment_id`
- Docker + Docker Compose support

---

## 🛠️ Setup (Local Development)

### 1. Clone repo
```bash
git clone https://github.com/<your-username>/payhook-listener.git
cd payhook-listener
````

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy `.env.example` to `.env` and update if needed:

```bash
cp .env.example .env
```

Default `.env.example` values:

```dotenv
# Postgres
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=webhooks
POSTGRES_HOST=db
POSTGRES_PORT=5432

# App
PORT=3000
SHARED_SECRET=test_secret   # Shared secret for HMAC validation
NODE_ENV=development

# Prisma
DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}?schema=public
```

### 4. Run Postgres with Docker Compose

```bash
docker compose up -d db
```

This runs PostgreSQL inside Docker and exposes it on `localhost:5434`.

### 5. Run Prisma migrations

```bash
# If running Prisma locally on your Mac:
DATABASE_URL=postgresql://postgres:postgres@localhost:5434/webhooks npx prisma migrate dev --name init
```

### 6. Start the app

```bash
npm run start:dev
```

App will be running at:
👉 [http://localhost:3000/api](http://localhost:3000/api)

---

## 🐳 Running everything in Docker

```bash
docker compose up --build
```

This builds the NestJS app and runs migrations on startup.

---

## 🧪 Testing the Webhook

### 1. Example payload

Save as `mock_payloads/payment_authorized.json`:

```json
{
  "event": "payment.authorized",
  "payload": {
    "payment": {
      "entity": {
        "id": "pay_001",
        "status": "authorized",
        "amount": 1000,
        "currency": "INR"
      }
    }
  },
  "created_at": 1751885965,
  "id": "evt_auth_001"
}
```

### 2. Compute HMAC

```bash
SIG=$(cat mock_payloads/payment_authorized.json | \
node -e "const fs=require('fs');const crypto=require('crypto');const d=fs.readFileSync(0);console.log(crypto.createHmac('sha256','test_secret').update(d).digest('hex'))")
```

### 3. Send curl

```bash
curl -X POST http://localhost:3000/api/webhook/payments \
  -H "Content-Type: application/json" \
  -H "X-Razorpay-Signature: $SIG" \
  --data-binary @mock_payloads/payment_authorized.json
```

**Response**

```json
{ "success": true, "message": "Event saved" }
```

---

## ✅ Edge Cases Handled

* **Missing/invalid signature** → 403 Forbidden
* **Invalid JSON** → 400 Bad Request
* **Missing required fields** → 400 Bad Request (via DTO validation)
* **Duplicate `event_id`** → ignored safely
* **Unsupported event type string (e.g., `payment.failed`)** → normalized (`payment_failed`)

---

## 📜 API Documentation

See [DOCS.md](./DOCS.md).
