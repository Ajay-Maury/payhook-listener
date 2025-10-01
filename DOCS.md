# API Documentation

## Base URL
[http://localhost:3000/api](http://localhost:3000/api)

---

## Endpoints

### 🔹 POST `/webhook/payments`

**Description**:  
Receives webhook payloads (Razorpay/PayPal style). Validates signature and saves event.

**Headers**:
- `Content-Type: application/json`
- `X-Razorpay-Signature: <computed HMAC-SHA256>`

**Body Example**:
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
````

**Curl Example with files**:

```bash
curl --location 'http://localhost:3000/webhook/payments' \
  --header 'Content-Type: application/json' \
  --header 'X-Razorpay-Signature: 8a2b49db038942c4535f310377ff4e0f09fe5548c68400406dcf9bd1e7cbf41f' \
  --data-binary '@mock_payloads/payment_authorized.json'
```

**Responses**:

* ✅ `200 OK`

```json
{ "success": true, "message": "Event saved" }
```

* 🔁 Duplicate event:

```json
{ "success": false, "message": "Event already exists" }
```

* ❌ Invalid JSON → `400 Bad Request`
* ❌ Missing/invalid signature → `403 Forbidden`

---

### 🔹 GET `/webhook/payments/:payment_id/events`

**Description**:
Fetches all events for a given `payment_id`.

**Example Request**:

```bash
GET /api/webhook/payments/pay_001/events
```

**Response**:

```json
[
  { "event_type": "payment_authorized", "received_at": "2025-10-01T12:00:00.000Z" },
  { "event_type": "payment_captured", "received_at": "2025-10-01T12:05:00.000Z" }
]
```

---
