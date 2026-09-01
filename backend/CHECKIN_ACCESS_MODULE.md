# Enterprise QR Check-In & Event Access Management Module Architecture & Technical Specification

Multi-tenant SaaS QR Check-In & Event Access Management Backend Module (BookMyShow / Eventbrite Style) built with **Node.js, Express.js, Prisma ORM, MongoDB/PostgreSQL, Zod, JWT, HMAC Cryptographic QR Signatures, Device Authentication, Offline Sync Engine, and Clean Architecture**.

---

## 🏗️ 1. Directory & Folder Structure

All code for this module is isolated inside `src/modules/checkin/`:

```text
src/
└── modules/
    └── checkin/
        ├── controllers/
        │   ├── checkin.controller.js
        │   ├── gate.controller.js
        │   ├── device.controller.js
        │   └── attendance.controller.js
        ├── services/
        │   ├── checkin.service.js
        │   ├── qr.service.js
        │   ├── scanner.service.js
        │   ├── device.service.js
        │   ├── attendance.service.js
        │   ├── offlineSync.service.js
        │   └── fraudDetection.service.js
        ├── repositories/
        │   ├── checkinLog.repository.js
        │   ├── gate.repository.js
        │   ├── device.repository.js
        │   └── attendance.repository.js
        ├── routes/
        │   ├── checkin.routes.js
        │   ├── gate.routes.js
        │   ├── device.routes.js
        │   └── attendance.routes.js
        ├── validations/
        │   └── checkin.validation.js
        ├── dto/
        │   └── checkin.dto.js
        ├── middleware/
        │   ├── deviceAuth.middleware.js
        │   └── gateAccess.middleware.js
        ├── utils/
        │   └── qrCrypto.util.js
        ├── checkin.controller.js
        ├── checkin.service.js
        ├── qr.service.js
        ├── scanner.service.js
        ├── device.service.js
        ├── attendance.service.js
        ├── checkin.routes.js
        └── index.js
```

---

## 🔄 2. Multi-Gate Access Control & Scan Validation Workflow

```text
[Customer Scans QR at Gate] ---> [Device Authenticated] ---> [Validate Cryptographic Signature]
                                                                        |
                                                                        v
[Grant Entry (200 OK)] <--- [Mark CHECKED_IN] <--- [Validate Gate, Section & Booking Status]
         |
         v
[Log Audit Entry & Update Dashboard]
```

### Comprehensive 12-Step Validation Pipeline
1. **Device Registration Guard**: Validate Scanner Device ID & Authorization token.
2. **Signature & Checksum Verification**: Verify HMAC-SHA256 signature to reject tampered/modified QR codes.
3. **Replay Attack / Nonce Check**: Verify Nonce and timestamp expiry window.
4. **Event & Schedule Match**: Verify QR is for the correct event and current active schedule slot.
5. **Booking Status Check**: Assert `bookingStatus == "Confirmed"` and `paymentStatus == "Paid"`.
6. **Ticket Status Check**: Assert `ticketStatus == "ISSUED"`. If already `CHECKED_IN` $\rightarrow$ Trigger **`Duplicate Scan Detected`**.
7. **Gate & Section Access Rules**: Assert assigned gate allows customer's ticket section (e.g. General gate rejects VIP ticket if gate segregation is enforced).
8. **Re-Entry Policy Check**: Evaluate Re-Entry Rule (`NO_REENTRY`, `ONE_REENTRY`, `UNLIMITED`).
9. **Manual Override Support**: Staff with `Gate Manager` or `Security` role can execute manual check-in by Booking Number / Phone / Mobile / Email.
10. **Atomic Attendance Update**: Mark ticket status as `CHECKED_IN` with timestamp `checkedInAt`.
11. **Fraud Detection & Audit Logging**: Log scan attempt, IP, gate, device, staff ID, and result.
12. **Live Attendance Stream**: Emit real-time metrics to Organizer Dashboard.

---

## 📴 3. Offline Scanning & Recon Sync Engine

To ensure uninterrupted entry during venue network outages:

```text
[Device Online] ---> [Download Valid Ticket Tokens Cache] ---> [Network Loss Occurs]
                                                                     |
                                                                     v
[Sync Logs with Server] <--- [Reconnect to Internet] <--- [Scan & Store Logs Locally]
```

- **Manifest Download**: Scanners fetch encrypted valid ticket hashes before doors open.
- **Offline Scanning**: Device validates signature locally and stores scan logs in encrypted local SQLite/IndexedDB.
- **Reconciliation Engine**: Upon internet reconnection, device pushes offline batch scan logs (`POST /api/checkin/sync-offline`). System reconciles timestamps and flags any conflict/duplicate scans for security audit.

---

## 🔒 4. Gate & Scanner Device Security Matrix

### Access Control Gates
- `Gate A`, `Gate B` (General Entrance)
- `VIP Gate` (VIP / Platinum Lounge access)
- `Staff Gate` (Staff / Crew access)
- `Media Gate` (Press & Photographers)
- `Backstage Gate` (Performers & Management)

### Registered Scanner Devices
- `ANDROID_SCANNER`: Handheld industrial Zebra / Android laser scanner.
- `IPHONE_SCANNER`: iOS app scanner.
- `TABLET`: Kiosk station tablet.
- `WEB_SCANNER`: Browser camera web scanner.

---

## 🔐 5. Staff Role-Based Access Control (RBAC)

| Staff Role | Scan QR | Manual Check-In | Security Override | Gate Management | View Reports |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **SUPER_ADMIN** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **EVENT_ORGANIZER** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **GATE_MANAGER** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **SCANNER_STAFF** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **SECURITY** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **VOLUNTEER** | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## 🌐 6. RESTful API Catalogue

### 1. QR Generation & Verification APIs
- `POST /api/checkin/generate/:bookingId`: Generate secure HMAC-signed QR code.
- `GET /api/checkin/qr/:bookingId`: View QR code payload and digital signature.
- `POST /api/checkin/regenerate/:bookingId`: Regenerate / revoke old QR token.
- `POST /api/checkin/validate`: Read & validate QR code payload without marking attendance.
- `POST /api/checkin/scan`: Scan QR code & execute entrance validation pipeline.

### 2. Check-In & Entry Operations APIs
- `POST /api/checkin/entry`: Execute entry scan (Device/Staff auth required).
- `POST /api/checkin/manual`: Staff manual check-in by Booking Number, Email, Phone, or Customer Name.
- `PATCH /api/checkin/revoke`: Revoke check-in status (Revert to unused).
- `POST /api/checkin/sync-offline`: Sync batch offline scan logs from registered scanner devices.
- `GET /api/checkin/history`: Query entry scan history logs.

### 3. Gate Management APIs
- `POST /api/gates`: Create Gate (Admin/Organizer).
- `GET /api/gates`: List Event Gates & allowed sections.
- `PUT /api/gates/:gateId`: Update Gate configuration.
- `DELETE /api/gates/:gateId`: Delete Gate.

### 4. Scanner Device Management APIs
- `POST /api/devices`: Register Scanner Device & issue API Key.
- `GET /api/devices`: List Registered Devices & active status.
- `PUT /api/devices/:deviceId`: Update assigned gate or device status.
- `DELETE /api/devices/:deviceId`: De-register device.

### 5. Live Attendance & Dashboard APIs
- `GET /api/events/:eventId/attendance`: Get total tickets, checked-in, remaining, and no-show counts.
- `GET /api/events/:eventId/live-attendance`: Real-time scan rate (Check-ins per minute, gate loads, peak entry times).
- `GET /api/events/:eventId/occupancy`: Venue & Section occupancy percentage breakdown.

---

## 📜 7. Standard API Response Formats

### Success Response
```json
{
  "success": true,
  "message": "Check-in completed successfully. Entry granted.",
  "data": {
    "bookingStatus": "Confirmed",
    "ticketStatus": "CheckedIn",
    "customerName": "John Doe",
    "section": "VIP Lounge",
    "ticketType": "VIP Pass",
    "gate": "VIP Gate A",
    "checkedInAt": "2026-08-05T18:35:00.000Z"
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Entry denied. Duplicate scan detected",
  "errors": [
    {
      "field": "qrToken",
      "message": "Ticket code TCK-88997766 was already scanned at Gate A at 18:10:00"
    }
  ],
  "statusCode": 400
}
```

---

## 🎯 8. Event Planner Generated Scanner Credentials & Section Dashboard Metrics

Event Planners (Organizers) can create and manage dedicated **Scanner Credentials (Email & Password)** for ground staff assigned to specific event sections.

### Key Features:
- **Planner-Controlled Accounts**: Event Planners can generate multiple scanner login accounts (`scannerEmail` + `password`).
- **Section-Scoped Access Control**: Scanner accounts are restricted to specific event sections (e.g. VIP, General, Gold Gate). Scanning a ticket for an unauthorized section triggers a `DENIED_SECTION_MISMATCH` response.
- **Organizer Dashboard Counter**: Each scan is linked to the scanner staff email and section, dynamically updating the **Event Planner's Dashboard**:
  - Live total checked-in count vs capacity.
  - Scan breakdown per scanner account (Email ID).
  - Real-time section occupancy percentages.

*For complete technical architecture, data model schemas, and API definitions, refer to [SCANNER_CREDENTIALS_AND_METRICS_SPECIFICATION.md](file:///f:/djj/backend/SCANNER_CREDENTIALS_AND_METRICS_SPECIFICATION.md).*

---

## 🧾 9. Admin GST Tax Calculation, Post-Payment QR Generation & Multi-Ticket Group Counter

This feature ensures GST compliance, instant cryptographic QR code generation post-payment, and multi-ticket group check-in counting at the entrance.

### Key Capabilities:
- **Admin GST & Tax Engine**: System Admins configure GST percentages (e.g. 18% GST), platform fees, and service charges calculated dynamically at checkout.
- **Post-Payment Cryptographic QR Generation**: Once payment is 100% verified (`PAID` via UPI, Card, Netbanking), the system generates HMAC-signed QR codes representing the booking.
- **Multi-Ticket Group Quantity Attribution**: Purchasing multiple tickets (e.g., 3 tickets) generates a master booking QR code containing total ticket quantity ($N=3$).
- **Check-In Section Display & Group Counter**: Scanning the QR code displays:
  - **Section Badge & Name**: e.g., `VIP Lounge` (`#8B5CF6`), `Gold Zone` (`#FFD700`), `Silver Section` (`#C0C0C0`), or `General Standing` (`#3B82F6`).
  - **Section Ticket Count**: e.g., `VIP Pass × 3 Tickets`.
  - **Group Admittance Counter**: e.g., `Checked-In: 3 of 3` or partial admittance (`2 of 3`).
  - **Payment Verification Badge**: `PAID (GST Included)`.

*For complete technical architecture, data model schemas, tax formulas, and API definitions, refer to [MULTI_TICKET_GST_AND_CHECKIN_SPECIFICATION.md](file:///f:/djj/backend/MULTI_TICKET_GST_AND_CHECKIN_SPECIFICATION.md).*



