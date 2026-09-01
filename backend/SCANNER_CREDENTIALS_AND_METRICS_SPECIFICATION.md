# Event Planner Scanner Credentials, Access Control & Dashboard Counter Technical Specification

Comprehensive Technical Architecture & Specification for Event Planners / Organizers to generate dedicated **Scanner Credentials (Email & Password)**, assign **Section & Gate Access Rules**, enforce **Strict Check-In Access Control**, and track **Real-time Check-In Counts on the Organizer Dashboard**.

---

## 📌 1. Overview & Business Value

In large-scale events (concerts, conferences, sports events, festivals), Event Planners (Organizers) need to delegate ticket scanning to ground staff or volunteers without sharing main organizer admin accounts.

### Key Requirements Addressed:
1. **Organizer-Controlled Credentials**: Event Planners can generate **multiple scanner credentials** (Email & Password) for scanning staff assigned to their specific events.
2. **Section & Gate Scoping**: Each scanner account can be constrained to specific event **sections** (e.g. VIP Lounge, Section A, Gold Gate, General Entry).
3. **Access Control Enforcement**: Scanner staff login using assigned credentials. The system verifies if the scanned ticket matches the scanner staff's permitted section/gate.
4. **Organizer Dashboard Metrics**: Every scan is linked to the scanner staff email and section, dynamically updating the **Event Planner's Dashboard counter** (total scans, scans per scanner account, section capacity percentages, real-time scan throughput).

---

## 🔄 2. System Architecture & Data Flow

```text
+-----------------------+           +-----------------------+           +-----------------------------+
|   Event Planner /     |           |     Scanner Staff     |           |   Check-In Access Control   |
|  Organizer Dashboard  |           |   (Mobile App / Web)  |           |          Engine             |
+-----------------------+           +-----------------------+           +-----------------------------+
            |                                   |                                      |
1. Create Scanner Credentials                   |                                      |
   (Email, Pass, Sections)                      |                                      |
------------------------------------------------>                                      |
            |                                   |                                      |
            |                       2. Staff Login with Email/Pass                     |
            |                       --------------------------------------------------->
            |                                   |  <-- Issue JWT with Allowed Sections |
            |                                   |                                      |
            |                                   | 3. Scan Ticket QR Code               |
            |                                   --------------------------------------->
            |                                   |                                      |
            |                                   |                      4. Verify Ticket & Section Rules
            |                                   |                         - Valid QR Signature?
            |                                   |                         - Ticket Section Allowed for Scanner?
            |                                   |                                      |
            |                                   | <--- Grant Entry / Reject Section    |
            |                                   |                                      |
5. Live Dashboard Counter Updates               |                                      |
   (Scans per scanner, per section, timeline)   |                                      |
<---------------------------------------------------------------------------------------+
```

---

## 🗄️ 3. Data Model Extensions (Prisma ORM for MongoDB)

To support event-planner generated scanner staff credentials and section metrics, the following schema additions are introduced in `prisma/schema.prisma`:

```prisma
// Scanner Credentials Model (Created by Event Organizers)
model ScannerAccount {
  id                 String       @id @default(auto()) @map("_id") @db.ObjectId
  eventId            String       @db.ObjectId
  event              Event        @relation(fields: [eventId], references: [id], onDelete: Cascade)
  organizerId        String       @db.ObjectId
  organizer          User         @relation("OrganizerScanners", fields: [organizerId], references: [id], onDelete: Cascade)
  scannerName        String       // e.g. "VIP Gate Scanner 1"
  scannerEmail       String       // Email generated/assigned by Event Planner
  passwordHash       String       // Encrypted password
  assignedSectionIds String[]     // Scoped Section IDs (e.g. VIP, General, Section A). Empty array = All Sections
  assignedGateIds    String[]     // Scoped Gate IDs
  isActive           Boolean      @default(true)
  totalScansCount    Int          @default(0)
  lastScanAt         DateTime?
  checkinLogs        CheckinLog[] @relation("ScannerCheckinLogs")
  createdAt          DateTime     @default(now())
  updatedAt          DateTime     @updatedAt

  @@unique([eventId, scannerEmail])
  @@index([eventId, organizerId])
}

// Updated CheckinLog Model with Scanner & Section Metrics
model CheckinLog {
  id                 String          @id @default(auto()) @map("_id") @db.ObjectId
  eventId            String          @db.ObjectId
  event              Event           @relation(fields: [eventId], references: [id], onDelete: Cascade)
  bookingId          String          @db.ObjectId
  ticketId           String          @db.ObjectId
  sectionId          String?         @db.ObjectId
  gateId             String?         @db.ObjectId
  scannerAccountId   String?         @db.ObjectId
  scannerAccount     ScannerAccount? @relation("ScannerCheckinLogs", fields: [scannerAccountId], references: [id])
  scannedByUserId    String?         @db.ObjectId
  scanStatus         ScanStatus      // SUCCESS, DENIED_SECTION_MISMATCH, DENIED_DUPLICATE, DENIED_INVALID
  denialReason       String?
  scannedAt          DateTime        @default(now())

  @@index([eventId, scannerAccountId])
  @@index([eventId, sectionId])
}

enum ScanStatus {
  SUCCESS
  DENIED_SECTION_MISMATCH
  DENIED_DUPLICATE
  DENIED_INVALID
  DENIED_REVOKED
}
```

---

## 🔒 4. Access Control Pipeline & Validation Rules

When a scanner staff account attempts to scan a ticket:

1. **Authentication Guard**: Verifies JWT token generated upon scanner login (`POST /api/v1/checkin/scanner/login`).
2. **Event Authorization**: Verifies scanner account belongs to the target `eventId` and `isActive == true`.
3. **Ticket Status Check**: Verifies ticket exists, booking is paid, and ticket status is `ISSUED`.
4. **Section Access Control Guard**:
   * Extracts `ticket.sectionId` from the ticket payload.
   * Compares `ticket.sectionId` against `scannerAccount.assignedSectionIds`.
   * **Rule**: If `assignedSectionIds` is configured and does NOT include `ticket.sectionId`, the system **rejects entry** with error `DENIED_SECTION_MISMATCH` ("Ticket section 'VIP' is not authorized for this scanner station ('General Entry')").
5. **Atomic Counter Execution**:
   * Marks ticket as `CHECKED_IN`.
   * Increments `ScannerAccount.totalScansCount` by 1.
   * Logs `CheckinLog` with `scannerAccountId`, `sectionId`, and `scannedAt`.
   * Emits live websocket event / metric update to the Event Planner's Dashboard.

---

## 🌐 5. RESTful API Endpoints Specification

### A. Event Organizer Scanner Credentials Management

#### 1. Create Scanner Credentials (Event Organizer Only)
* **HTTP Method**: `POST`
* **Path**: `/api/v1/organizer/events/:eventId/scanners`
* **Access Control**: Authenticated Event Organizer (`EVENT_ORGANIZER`, `SUPER_ADMIN`)
* **Request Body**:
```json
{
  "scannerName": "Gate A - VIP Scanner",
  "scannerEmail": "vipscanner1@my-event.com",
  "password": "SecurePassword123!",
  "assignedSectionIds": ["65c4a1f8b2d1e3a4c5f6a7b8"],
  "assignedGateIds": ["65c4a1f8b2d1e3a4c5f6a7b9"]
}
```
* **Response (210 Created)**:
```json
{
  "success": true,
  "message": "Scanner staff account created successfully by Event Planner",
  "data": {
    "id": "66b1a2c3d4e5f6a7b8c9d0e1",
    "eventId": "65c4a1f8b2d1e3a4c5f6a700",
    "scannerName": "Gate A - VIP Scanner",
    "scannerEmail": "vipscanner1@my-event.com",
    "assignedSectionIds": ["65c4a1f8b2d1e3a4c5f6a7b8"],
    "assignedGateIds": ["65c4a1f8b2d1e3a4c5f6a7b9"],
    "isActive": true,
    "totalScansCount": 0,
    "createdAt": "2026-08-09T13:45:00.000Z"
  }
}
```

#### 2. List All Scanner Accounts for Event
* **HTTP Method**: `GET`
* **Path**: `/api/v1/organizer/events/:eventId/scanners`
* **Access Control**: Authenticated Event Organizer
* **Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "66b1a2c3d4e5f6a7b8c9d0e1",
      "scannerName": "Gate A - VIP Scanner",
      "scannerEmail": "vipscanner1@my-event.com",
      "assignedSections": [{"id": "65c4a1f8b2d1e3a4c5f6a7b8", "name": "VIP Lounge"}],
      "isActive": true,
      "totalScansCount": 142,
      "lastScanAt": "2026-08-09T13:42:10.000Z"
    },
    {
      "id": "66b1a2c3d4e5f6a7b8c9d0e2",
      "scannerName": "Gate B - General Entrance",
      "scannerEmail": "generalscanner1@my-event.com",
      "assignedSections": [{"id": "65c4a1f8b2d1e3a4c5f6a7c0", "name": "General Standing"}],
      "isActive": true,
      "totalScansCount": 530,
      "lastScanAt": "2026-08-09T13:44:55.000Z"
    }
  ]
}
```

---

### B. Scanner Authentication & Check-In Validation

#### 1. Scanner Staff Login
* **HTTP Method**: `POST`
* **Path**: `/api/v1/checkin/scanner/login`
* **Request Body**:
```json
{
  "eventId": "65c4a1f8b2d1e3a4c5f6a700",
  "scannerEmail": "vipscanner1@my-event.com",
  "password": "SecurePassword123!"
}
```
* **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Scanner authenticated successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "scanner": {
    "id": "66b1a2c3d4e5f6a7b8c9d0e1",
    "scannerName": "Gate A - VIP Scanner",
    "assignedSectionIds": ["65c4a1f8b2d1e3a4c5f6a7b8"]
  }
}
```

#### 2. Execute Ticket Scan with Section Validation
* **HTTP Method**: `POST`
* **Path**: `/api/v1/checkin/scan`
* **Headers**: `Authorization: Bearer <Scanner_JWT_Token>`
* **Request Body**:
```json
{
  "qrPayload": "EVT-992211-TCK-778844-SIG-A1B2C3D4"
}
```
* **Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Check-in successful. Section verified.",
  "data": {
    "ticketNumber": "TCK-778844",
    "customerName": "Jane Doe",
    "sectionName": "VIP Lounge",
    "gateName": "VIP Gate A",
    "checkedInAt": "2026-08-09T13:46:00.000Z",
    "scannerName": "Gate A - VIP Scanner",
    "scannerTotalScans": 143
  }
}
```
* **Error Response - Section Mismatch (403 Forbidden)**:
```json
{
  "success": false,
  "statusCode": 403,
  "message": "Entry Denied: Section Mismatch",
  "errors": [
    {
      "field": "section",
      "message": "This ticket is for 'General Standing', but this scanner is restricted to 'VIP Lounge'."
    }
  ]
}
```

---

### C. Event Planner Dashboard Counter & Metrics APIs

#### Get Live Scanner & Section Metrics for Event Planner
* **HTTP Method**: `GET`
* **Path**: `/api/v1/organizer/events/:eventId/dashboard/scanner-metrics`
* **Access Control**: Authenticated Event Organizer
* **Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "eventId": "65c4a1f8b2d1e3a4c5f6a700",
    "summary": {
      "totalTicketsIssued": 2500,
      "totalCheckedIn": 1850,
      "totalRemaining": 650,
      "overallCheckinPercentage": 74.0,
      "activeScannerAccounts": 6
    },
    "scannersBreakdown": [
      {
        "scannerAccountId": "66b1a2c3d4e5f6a7b8c9d0e1",
        "scannerName": "Gate A - VIP Scanner",
        "scannerEmail": "vipscanner1@my-event.com",
        "assignedSections": ["VIP Lounge"],
        "totalScans": 320,
        "scansPerHour": 80,
        "lastActive": "2026-08-09T13:44:12.000Z"
      },
      {
        "scannerAccountId": "66b1a2c3d4e5f6a7b8c9d0e2",
        "scannerName": "Gate B - General Entrance",
        "scannerEmail": "generalscanner1@my-event.com",
        "assignedSections": ["General Standing"],
        "totalScans": 680,
        "scansPerHour": 170,
        "lastActive": "2026-08-09T13:45:00.000Z"
      }
    ],
    "sectionsBreakdown": [
      {
        "sectionId": "65c4a1f8b2d1e3a4c5f6a7b8",
        "sectionName": "VIP Lounge",
        "totalTickets": 400,
        "checkedInCount": 320,
        "remainingCount": 80,
        "occupancyPercentage": 80.0
      },
      {
        "sectionId": "65c4a1f8b2d1e3a4c5f6a7c0",
        "sectionName": "General Standing",
        "totalTickets": 2100,
        "checkedInCount": 1530,
        "remainingCount": 570,
        "occupancyPercentage": 72.85
      }
    ]
  }
}
```

---

## 📊 6. Event Planner Dashboard Metrics Features

The **Event Planner's Dashboard** includes the following key widgets powered by this module:

1. 🔢 **Total Check-In Counter**: Real-time counter of total checked-in tickets vs remaining.
2. 👤 **Scanner Staff Leaderboard**: Dynamic list of all created scanner credentials (Email ID) showing total scans completed by each individual scanner staff member.
3. 🚪 **Section-wise Occupancy Cards**: Visual progress bars showing check-in progress per section (e.g., VIP Lounge: 80% Full, General Standing: 72% Full).
4. ⚡ **Scans Rate & Velocity**: Scans per minute / per hour graph to monitor gate congestion and staff efficiency.
5. ⚠️ **Section Mismatch Alert Log**: Highlights tickets presented at incorrect section gates to redirect attendees smoothly.

---

## 📝 7. Summary of Changes

1. **Created Technical Specification**: Comprehensive specification for Event Organizer created scanner accounts, section access control, and live dashboard counters.
2. **Multi-Scanner Management**: Event Planners can generate and manage multiple email/pass combinations per event.
3. **Section Guard**: Enforces section matching during check-in scan.
4. **Planner Dashboard Counter**: Aggregates all check-ins per scanner account and section.
