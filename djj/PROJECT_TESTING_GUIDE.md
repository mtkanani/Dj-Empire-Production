# COMPLETE END-TO-END VERIFICATION & TESTING GUIDE
## Event Management SaaS Platform (Phases 1 – 17)

This document provides a step-by-step user guide and verification workflow to test the entire Event Management SaaS platform.

---

## 🛠️ 1. PREREQUISITES & STARTING THE APPLICATION

### 1.1 Backend Server
Ensure the backend API server is running on port `5000`:
```bash
cd f:\djj\backend
npm run dev
```

### 1.2 Frontend Application
Ensure the Vite React frontend application is running on port `5173`:
```bash
cd f:\djj\djj
npm run dev
```
Access the application in your browser at: `http://localhost:5173`

---

## 🔑 2. USER ROLES & TEST CREDENTIALS

| Role | Default Email / Login | Purpose | Accessible Portals |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@eventbooking.com` / `SuperAdminPassword123!` | Platform administration, master data, organizers, global finances | `/admin/*` |
| **Event Organizer** | `organizer@musicfest.com` / `OrganizerPass123!` | Create & manage events, tickets, seat maps, gates, scanners, analytics, settlements | `/organizer/*` |
| **Customer** | `customer@example.com` / `CustomerPass123!` | Discover events, book tickets, select reserved seats, pay, download QR passes | `/`, `/events`, `/my-bookings`, `/my-tickets` |
| **Scanner Staff** | `scanner1@musicfest.com` / `ScannerPass123!` | Validate QR ticket passes at physical venue turnstiles | `/organizer/check-in` |

---

## 🧪 3. COMPLETE TESTING FLOW (STEP-BY-STEP)

```
1. Admin Portal Setup (Categories, Cities, Venues)
       │
       ▼
2. Organizer Event & Ticket Creation (Wizard, Ticket Types, Seat Map)
       │
       ▼
3. Customer Discovery & Booking (Search, Reserve Seats, Payment Gateway)
       │
       ▼
4. Digital Ticket & QR Generation (SVG Pass, Security Token)
       │
       ▼
5. Venue Gate Entry & Scanning (Camera Scan, 12-Step Validation)
       │
       ▼
6. Live Occupancy & Check-In Analytics (Real-Time Velocity, Recharts)
       │
       ▼
7. Financial Management & Settlements (Gross Revenue, Refunds, Tax Invoices, Payouts)
```

---

### STEP 1: SUPER ADMIN MASTER DATA & ORGANIZER APPROVAL

**Objective**: Verify platform setup, categories, cities, venues, and organizer approval.

1. **Login as Super Admin**:
   - Navigate to `http://localhost:5173/admin/login`
   - Enter credentials (`admin@eventbooking.com` / `SuperAdminPassword123!`)
2. **Master Data Configuration (`/admin/master-data`)**:
   - **Categories** (`/admin/categories`): Verify or add categories (e.g. *Music Festivals*, *Tech Conferences*, *Sports*).
   - **Cities** (`/admin/cities`): Verify or add cities (e.g. *Mumbai*, *Delhi*, *Bengaluru*).
   - **Venues** (`/admin/venues`): Add a venue with total capacity (e.g. *Grand Arena*, Capacity: `5,000`).
   - **Tax Settings** (`/admin/tax-settings`): Set GST/Tax rate (e.g. `18%`).
3. **Organizer Approval (`/admin/organizers`)**:
   - Inspect organizer accounts, review KYC documents, and toggle approval status to **Active / Verified**.

---

### STEP 2: ORGANIZER EVENT & TICKETING CREATION

**Objective**: Create an event, configure ticket types, and build a seat map.

1. **Login as Organizer**:
   - Navigate to `http://localhost:5173/organizer/login`
   - Enter credentials (`organizer@musicfest.com` / `OrganizerPass123!`)
2. **Create Event Wizard (`/organizer/events/create`)**:
   - **Step 1 — Basic Details**: Title (*Summer Music Festival 2026*), Category (*Music Festivals*), City (*Mumbai*).
   - **Step 2 — Schedule**: Start Date/Time & End Date/Time.
   - **Step 3 — Venue Location**: Select *Grand Arena*.
   - **Step 4 — Policy & FAQ**: Set age restriction (`18+`) and refund policy.
   - **Step 5 — Media**: Upload banner image URL.
   - **Step 6 — SEO & Status**: Set status to **PUBLISHED**.
3. **Configure Ticket Types (`/organizer/events/:id/tickets`)**:
   - Click **Add Ticket Type**:
     - *VIP Ticket*: Price `₹5,000`, Quantity `100`.
     - *General Admission*: Price `₹1,500`, Quantity `1,000`.
4. **Configure Reserved Seat Map (`/organizer/events/:id/seat-map`)**:
   - Create section *Section A (VIP)* and set row/column grid.
   - Assign *VIP Ticket* type to Section A.

---

### STEP 3: CUSTOMER DISCOVERY, SEAT SELECTION & BOOKING

**Objective**: Search events, select tickets/seats, and execute checkout.

1. **Navigate to Customer Portal (`http://localhost:5173/`)**:
   - View Hero banner and featured events.
   - Use search bar or category pills to filter by *Music Festivals* or *Mumbai*.
2. **Event Details Page (`/events/:id`)**:
   - Inspect event schedule, venue map, policies, and ticket tiers.
   - Click **Book Tickets**.
3. **Checkout Flow**:
   - **Ticket / Seat Selection** (`/events/:id/book`): Select quantity or pick reserved seats on interactive seat map grid.
   - **Customer Info** (`/events/:id/booking/customer`): Confirm attendee name, email, and phone number.
   - **Order Summary** (`/events/:id/booking/summary`): Verify line items, subtotal, 18% GST tax, and total amount.
   - **Payment Method Selection** (`/events/:id/booking/payment`): Choose gateway (*Razorpay*, *PayPal*, *Stripe*, or *Cash*).
   - **Complete Payment**: Click **Pay Now**. Observe payment verification signature.
   - **Booking Confirmation** (`/booking/:id/success`): View confirmed booking reference `#BK-XXXXXXXX` and order status.

---

### STEP 4: DIGITAL TICKET & QR CODE GENERATION

**Objective**: View digital pass and verify cryptographic QR code payload.

1. **Navigate to Customer My Bookings (`/my-bookings`)**:
   - Click on the newly confirmed booking `#BK-XXXXXXXX`.
   - Click **View Digital Ticket Pass** (`/my-tickets`).
2. **Inspect Digital Ticket Card**:
   - Verify rendered SVG QR code containing secure backend signature token (`QR-XXXX...`).
   - Click **Download Ticket Pass** / **Print Pass**.

---

### STEP 5: VENUE INFRASTRUCTURE & SCANNER CHECK-IN

**Objective**: Configure entrance gates, register scanner devices, and scan QR ticket at venue turnstiles.

1. **Gate Infrastructure Setup (`/organizer/gates`)**:
   - Create entrance turnstile: *Main Entrance Gate A* (Code: `GATE_A`, Capacity: `2,000`).
2. **Hardware & Staff Accounts (`/organizer/scanner-users`)**:
   - Create scanner staff account (`scanner1@musicfest.com`) assigned to *Gate A*.
3. **Execute Live Check-In (`/organizer/check-in`)**:
   - Select camera source or use manual QR entry fallback.
   - Enter/Scan ticket QR payload `QR-XXXX...`.
   - **Expected Outcome**:
     - Screen displays **SUCCESS (Entry Granted)** banner with green checkmark, customer name, ticket category, and gate location.
     - **Re-scan Test**: Re-scan the same QR payload.
     - **Expected Outcome**: Screen displays **REJECTED — DUPLICATE SCAN (Already Used)** alert card with timestamp of original entry.

---

### STEP 6: REAL-TIME OCCUPANCY & CHECK-IN ANALYTICS

**Objective**: Monitor live venue fill rates and scan audit log feeds.

1. **Navigate to Attendance Analytics (`/organizer/check-in-analytics`)**:
   - Select event *Summer Music Festival 2026*.
2. **Inspect Operational Metrics**:
   - **Summary Stat Cards**: Capacity, Total Sold, Checked-In Count, Remaining Unused, Occupancy Rate %.
   - **Hourly Check-In Velocity (Recharts AreaChart)**: Observe real-time entry flow curve.
   - **Gate Throughput Breakdown (Recharts BarChart)**: Compare throughput for *Gate A* vs *VIP Gate*.
   - **Scan Outcome Breakdown**: SUCCESS vs DUPLICATE_SCAN count.
3. **Check-In Audit Log History (`/organizer/check-in-history`)**:
   - Filter logs by outcome result (`SUCCESS`, `DUPLICATE_SCAN`). Test server-side pagination controls (`Previous`, `Next`).

---

### STEP 7: FINANCIAL MANAGEMENT, REFUNDS & SETTLEMENTS

**Objective**: Inspect gross revenue, process customer refunds, view tax invoices, and verify settlement payouts.

1. **Financial Operations Dashboard (`/organizer/financial-dashboard`)**:
   - View **Gross Revenue**, **Platform Fees (10%)**, **Gateway Fees (2%)**, **Tax (GST 18%)**, and **Net Settlement Payout**.
2. **Payment Transactions Log (`/organizer/payments`)**:
   - Filter transactions by Gateway (*Razorpay*, *Cash*) or Status (*Paid*, *Created*, *Failed*).
   - Click **View** to inspect transaction reference `#PAY-XXXXXXXX` and customer details.
3. **Refund Management (`/organizer/refunds`)**:
   - Click **Process Refund**. Enter Payment ID, refund amount, and reason (*Schedule cancellation*).
   - Confirm refund. Verify audit log entry `#RFD-XXXXXXXX` with status **PROCESSED**.
4. **GST Tax Invoices (`/organizer/invoices`)**:
   - View tax invoices table `#INV-XXXXXXXX`. Click **View Tax Invoice** to inspect customer billing address, subtotal, and 18% GST calculation.
5. **Payout Settlements (`/organizer/settlements`)**:
   - View settlement payout history `#STL-XXXXXXXX`, gross sales, fee deductions, and status **PAID**.

---

## ✅ 4. VERIFICATION CHECKLIST

- [x] **Authentication**: JWT token storage, role-based protection (`SUPER_ADMIN`, `EVENT_ORGANIZER`, `CUSTOMER`).
- [x] **Master Data**: Categories, cities, venues, and tax rates integrated into event wizard.
- [x] **Event Builder**: Multi-step wizard with validation, policy management, and publishing state machine.
- [x] **Ticketing & Seats**: Tier pricing, quantity limits, section builder, interactive seat selection.
- [x] **Discovery & Booking**: Search, category filters, customer checkout flow, multi-gateway integration.
- [x] **QR & Scanning**: SVG QR rendering, camera scanner, 12-step validation, duplicate scan detection.
- [x] **Venue Infrastructure**: Entrance gates, scanner hardware registration, staff accounts.
- [x] **Analytics**: Recharts entry velocity graph, gate load distribution, paginated audit log feeds.
- [x] **Financial Management**: Gross revenue, net payout calculations, refund processing, GST tax invoices, settlement reports.

---

## 🚀 5. SUMMARY
All 17 development phases have been built and verified with zero compilation or runtime errors.
