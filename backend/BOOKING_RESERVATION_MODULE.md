# Enterprise Customer Booking & Reservation Module Architecture & Technical Specification

Multi-tenant SaaS Customer Booking & Reservation Backend Module (BookMyShow / Eventbrite Style) built with **Node.js, Express.js, Prisma ORM, MongoDB/PostgreSQL, Zod, JWT, Atomic Inventory Locks, and Clean Architecture**.

---

## 🏗️ 1. Directory & Folder Structure

All code for this module is isolated inside `src/modules/booking/`:

```text
src/
└── modules/
    └── booking/
        ├── controllers/
        │   ├── booking.controller.js
        │   ├── reservation.controller.js
        │   ├── myBooking.controller.js
        │   ├── organizerBooking.controller.js
        │   ├── adminBooking.controller.js
        │   └── qr.controller.js
        ├── services/
        │   ├── booking.service.js
        │   ├── reservation.service.js
        │   ├── inventoryLock.service.js
        │   ├── bookingValidation.service.js
        │   └── qr.service.js
        ├── repositories/
        │   ├── booking.repository.js
        │   ├── reservation.repository.js
        │   ├── bookingItem.repository.js
        │   └── auditLog.repository.js
        ├── routes/
        │   ├── booking.routes.js
        │   ├── reservation.routes.js
        │   ├── customerBooking.routes.js
        │   ├── organizerBooking.routes.js
        │   └── adminBooking.routes.js
        ├── validations/
        │   └── booking.validation.js
        ├── dto/
        │   └── booking.dto.js
        ├── middleware/
        │   ├── inventoryLock.middleware.js
        │   └── bookingWindowGuard.middleware.js
        ├── utils/
        │   ├── qrGenerator.util.js
        │   └── bookingNumberGenerator.util.js
        ├── booking.controller.js
        ├── booking.service.js
        ├── booking.repository.js
        ├── reservation.service.js
        ├── booking.routes.js
        ├── qr.service.js
        └── index.js
```

---

## 🔄 2. Complete Booking & Reservation Lifecycle Workflow

```text
[Browse Event & Schedule] ---> [Select Section & Ticket Type] ---> [POST /api/reservations]
                                                                        |
                                                                        v
[Auto Expire & Release Inventory] <--- (No Payment in 15 mins) <--- [Lock Inventory (15m)]
                                                                        |
                                                                        v
[Generate Encrypted QR Ticket] <--- [Booking Status: CONFIRMED] <--- [POST /api/bookings/confirm]
                                                                        |
                                                                        v
                                                             [QR Check-In at Event]
```

### State Machine Lifecycle Transitions

#### Booking Status (`bookingStatus`)
- **`Pending`**: Draft booking initiated.
- **`Reserved`**: Inventory reserved for 15-minute checkout window.
- **`AwaitingPayment`**: Payment checkout initiated.
- **`Confirmed`**: Payment verified & tickets issued.
- **`Cancelled`**: Cancelled by customer or admin prior to event start.
- **`Expired`**: 15-minute checkout timer elapsed without payment.
- **`Refunded`**: Booking refunded by admin.
- **`CheckedIn`**: Customer scanned QR at venue entrance.

#### Payment Status (`paymentStatus`)
- `Pending` $\rightarrow$ `Authorized` $\rightarrow$ `Paid` / `Failed` / `Cancelled` / `Refunded` / `PartiallyRefunded`.

---

## 🔒 3. Transaction-Safe Atomic Inventory Locking Engine

To guarantee zero overselling under heavy concurrent user loads (e.g. Flash sales), inventory reservation executes inside an atomic Prisma transaction:

```text
CONCURRENCY SCENARIO:
Available Capacity: 20
User A requests: 5 tickets
User B requests: 18 tickets

Transaction 1 (User A):
- Read Available: 20 >= 5 (OK)
- Update Stock: reservedQuantity += 5, availableQuantity -= 5 (Now 15)
- Lock Reservation expiresAt = now() + 15 mins
- COMMIT ✅

Transaction 2 (User B):
- Read Available: 15 < 18 (INSUFFICIENT INVENTORY)
- ROLLBACK & Throw 400 Bad Request ("Only 15 tickets available") ❌
```

---

## 🎟️ 4. Unique QR Code Ticket Generator Engine

Each confirmed ticket item receives a unique, cryptographically signed payload structure:

```json
{
  "bookingNumber": "BMS-20260805-889911",
  "ticketCode": "TCK-88997766",
  "eventId": "65c3ab12ef4512001a89bcde",
  "scheduleId": "65c3ac34ef4512001a89bcdf",
  "section": "VIP Lounge",
  "ticketType": "Early Bird VIP",
  "customerId": "65c3aa00ef4512001a89bcd1",
  "signature": "sha256_hmac_hash_signature"
}
```

---

## 🔐 5. Multi-Tenant Role-Based Access Control (RBAC) Matrix

| Entity / Action | CUSTOMER | EVENT_ORGANIZER | SUPER_ADMIN |
| :--- | :---: | :---: | :---: |
| **Create Reservation / Booking** | ✅ (Own account) | ❌ | ❌ |
| **View Customer Bookings** | ✅ (`/api/my-bookings`) | ❌ | ✅ (All bookings) |
| **View Organizer Bookings** | ❌ | ✅ (Own events only) | ✅ (All events) |
| **Cancel Booking** | ✅ (Before event start) | ❌ | ✅ (Any time) |
| **Confirm Booking** | ✅ (Payment callback) | ❌ | ✅ |
| **Download QR Ticket** | ✅ (Own confirmed tickets) | ❌ | ✅ |
| **View Booking Analytics** | ❌ | ✅ (Own events) | ✅ (Platform wide) |

---

## 🌐 6. RESTful API Catalogue

### 1. Booking Core APIs
- `POST /api/bookings`: Create Booking & initiate checkout.
- `GET /api/bookings`: Search & list all bookings (Admin/Organizer filters).
- `GET /api/bookings/:bookingId`: Get booking details by ID or Booking Number.
- `PUT /api/bookings/:bookingId`: Update booking details.
- `DELETE /api/bookings/:bookingId`: Delete booking draft.
- `PATCH /api/bookings/:bookingId/cancel`: Cancel booking & release inventory.
- `PATCH /api/bookings/:bookingId/confirm`: Confirm booking after successful payment.
- `GET /api/bookings/:bookingId/items`: List individual ticket items.

### 2. Inventory Reservation APIs
- `POST /api/reservations`: Reserve inventory for 15-minute lock.
- `GET /api/reservations/:reservationId`: Get reservation lock status.
- `DELETE /api/reservations/:reservationId`: Cancel reservation & release stock.

### 3. Customer Specific My-Booking APIs
- `GET /api/my-bookings`: Customer's booking history.
- `GET /api/my-bookings/:bookingId`: Customer single booking view.
- `GET /api/my-upcoming-events`: Customer upcoming booked events.
- `GET /api/my-past-events`: Customer past attended events.

### 4. Organizer Specific Booking APIs
- `GET /api/organizer/bookings`: List bookings for organizer's events.
- `GET /api/organizer/bookings/:bookingId`: View organizer booking details.
- `GET /api/organizer/bookings/analytics`: Dashboard metrics (Today's bookings, conversion rate, AOV, pending reservations).

### 5. Admin Specific Booking APIs
- `GET /api/admin/bookings`: Platform-wide booking search.
- `PATCH /api/admin/bookings/:bookingId/override-status`: Override status (Admin).
- `GET /api/admin/bookings/export`: Export bookings CSV/JSON.

---

## 📜 7. Standard API Response Formats

### Success Response
```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "bookingNumber": "BMS-20260805-998811",
    "totalAmount": 2999.00,
    "bookingStatus": "Reserved",
    "paymentStatus": "Pending",
    "expiresAt": "2026-08-05T18:15:00.000Z"
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Booking validation failed",
  "errors": [
    {
      "field": "tickets",
      "message": "Requested quantity (5) exceeds available inventory (3)"
    }
  ],
  "statusCode": 400
}
```
