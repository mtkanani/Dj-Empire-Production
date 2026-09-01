# User/Customer Ticket Booking & Permission Guide

## Event Management SaaS Platform

This document presents the **Verified Permissions Matrix**, **Frontend Route Map**, **Backend API Specifications**, and **Step-by-Step Ticket Buying Workflow** strictly validated against the actual codebase of the Event Ticket Booking Platform.

---

## 🔒 1. User/Customer Permissions Matrix

In our Multi-Tenant Event SaaS Architecture, route access is protected by `ProtectedRoute` guards on the frontend ([`AppRoutes.jsx`](file:///f:/djj/djj/src/routes/AppRoutes.jsx)) and Role-Based Access Control (RBAC) middleware on the backend ([`auth.middleware.js`](file:///f:/djj/backend/src/middlewares/auth.middleware.js)).

| Action / Resource | Permission Level | Allowed Roles | Backend Endpoint | Frontend Route / Component | Description |
| :--- | :---: | :--- | :--- | :--- | :--- |
| **Browse Published Events** | Public | Anyone / Customer | `GET /api/v1/events` | `/events` ([`CustomerEventListingPage.jsx`](file:///f:/djj/djj/src/pages/customer/CustomerEventListingPage.jsx)) | Search & filter events by category, city, date, & price range. |
| **View Event & Schedule Details** | Public | Anyone / Customer | `GET /api/v1/events/:id` | `/events/:id` ([`CustomerEventDetailsPage.jsx`](file:///f:/djj/djj/src/pages/customer/CustomerEventDetailsPage.jsx)) | View venue, artist line-up, schedule, refund policy, & FAQs. |
| **Select Tickets & Seat Map** | Protected | `CUSTOMER`, `EVENT_ORGANIZER`, `SUPER_ADMIN` | `GET /api/v1/events/:id` | `/events/:eventId/book` ([`TicketSelectionPage.jsx`](file:///f:/djj/djj/src/pages/customer/TicketSelectionPage.jsx)) | View ticket tiers, pricing, live inventory, & select seat grid. |
| **Reserve Inventory (15-Min Hold)** | Protected | `CUSTOMER`, `EVENT_ORGANIZER`, `SUPER_ADMIN` | `POST /api/v1/reservations` | `/events/:eventId/book` (Triggered on Proceed) | Locks requested tickets & seats atomically for 15 minutes. |
| **Enter Customer & Attendee Details** | Protected | `CUSTOMER`, `EVENT_ORGANIZER`, `SUPER_ADMIN` | `GET /api/v1/reservations/:id` | `/events/:eventId/booking/customer` ([`CustomerDetailsPage.jsx`](file:///f:/djj/djj/src/pages/customer/CustomerDetailsPage.jsx)) | Input ticket buyer & attendee contact details. |
| **Review Order & Tax Breakdown** | Protected | `CUSTOMER`, `EVENT_ORGANIZER`, `SUPER_ADMIN` | `POST /api/v1/bookings` | `/events/:eventId/booking/summary` ([`OrderSummaryPage.jsx`](file:///f:/djj/djj/src/pages/customer/OrderSummaryPage.jsx)) | Review base total, platform fees, GST (18%), & coupon discounts. |
| **Process Payment Checkout** | Protected | `CUSTOMER`, `EVENT_ORGANIZER`, `SUPER_ADMIN` | `PATCH /api/v1/bookings/:id/confirm` | `/events/:eventId/booking/payment` ([`PaymentMethodPage.jsx`](file:///f:/djj/djj/src/pages/customer/PaymentMethodPage.jsx)) | Complete payment via Razorpay / Stripe / NetBanking. |
| **View Booking Confirmation** | Protected | `CUSTOMER`, `EVENT_ORGANIZER`, `SUPER_ADMIN` | `GET /api/v1/bookings/:id` | `/booking/:bookingId/success` ([`BookingConfirmationPage.jsx`](file:///f:/djj/djj/src/pages/customer/BookingConfirmationPage.jsx)) | Order receipt, invoice breakdown, & digital pass link. |
| **View My Bookings History** | Protected | `CUSTOMER` | `GET /api/v1/my-bookings` | `/my-bookings` ([`CustomerBookingsPage.jsx`](file:///f:/djj/djj/src/pages/customer/CustomerBookingsPage.jsx)) | View all past and upcoming booked event tickets. |
| **My Digital Entry Ticket Passes** | Protected | `CUSTOMER` | `GET /api/v1/bookings/:id/tickets/:ticketId/qr` | `/my-tickets` ([`MyTicketsPage.jsx`](file:///f:/djj/djj/src/pages/customer/MyTicketsPage.jsx)) | View digital pass card & generate encrypted SVG QR code. |
| **View Customer Payment History** | Protected | `CUSTOMER` | `GET /api/v1/customer/payments` | `/my-payments` ([`CustomerPaymentHistoryPage.jsx`](file:///f:/djj/djj/src/pages/customer/CustomerPaymentHistoryPage.jsx)) | Complete transaction logs & payment status history. |
| **Manage Events & Ticket Types** | **Forbidden** | `EVENT_ORGANIZER`, `SUPER_ADMIN` | `/api/v1/organizer/*` | `/organizer/*` ([`OrganizerLayout.jsx`](file:///f:/djj/djj/src/layouts/OrganizerLayout.jsx)) | Returns `403 Access Forbidden` for regular Customer accounts. |
| **Scan Venue Gate Passes** | **Forbidden** | `SCANNER_STAFF`, `GATE_MANAGER` | `/api/v1/checkin/*` | `/scanner` ([`ScannerAppView.jsx`](file:///f:/djj/djj/src/pages/ScannerAppView.jsx)) | Returns `403 Access Forbidden` for regular Customer accounts. |

---

## 🛒 2. Codebase Ticket Buying Workflow (Step-by-Step)

The customer booking journey follows a 6-step multi-page wizard controlled by [`BookingProvider`](file:///f:/djj/djj/src/context/BookingContext.jsx) context and [`BookingStepper`](file:///f:/djj/djj/src/components/customer/booking/BookingStepper.jsx):

```
Step 1: Event Discovery        Step 2: Ticket Selection & Lock     Step 3: Customer Info
  /events/:id              ──►   /events/:eventId/book          ──►   /events/:eventId/booking/customer
 (CustomerEventDetailsPage)     (TicketSelectionPage)                (CustomerDetailsPage)
                                        │
                                        ▼ (POST /api/v1/reservations - 15m Lock)
                                        │
Step 6: Digital Pass           Step 5: Payment Gateway            Step 4: Order Summary
  /my-tickets              ◄──   /events/:eventId/booking/payment ◄──   /events/:eventId/booking/summary
 (MyTicketsPage)                (PaymentMethodPage)                  (OrderSummaryPage)
                                        │
                                        ▼ (PATCH /api/v1/bookings/:id/confirm)
                                        │
                               /booking/:bookingId/success
                                (BookingConfirmationPage)
```

---

### STEP 1: Authentication & Event Discovery
1. Customer visits the portal and logs in via [`CustomerLogin.jsx`](file:///f:/djj/djj/src/pages/auth/CustomerLogin.jsx):
   - **Default Test Email**: `customer@example.com`
   - **Default Test Password**: `CustomerPass123!`
2. Token with role `"CUSTOMER"` is saved to `localStorage`.
3. Customer browses published events on `/events` ([`CustomerEventListingPage.jsx`](file:///f:/djj/djj/src/pages/customer/CustomerEventListingPage.jsx)) and clicks an event card to open `/events/:id` ([`CustomerEventDetailsPage.jsx`](file:///f:/djj/djj/src/pages/customer/CustomerEventDetailsPage.jsx)).

---

### STEP 2: Ticket Selection & 15-Minute Reservation Lock
1. Customer clicks **Book Tickets**, navigating to `/events/:eventId/book` ([`TicketSelectionPage.jsx`](file:///f:/djj/djj/src/pages/customer/TicketSelectionPage.jsx)).
2. Selects requested quantity for ticket tiers (e.g. *VIP*, *General Admission*) or chooses reserved seats from the interactive seat map grid.
3. Clicking **Proceed to Checkout** invokes `customerBookingService.createReservation(payload)`:
   - Backend API: `POST /api/v1/reservations`
   - Atomic inventory engine locks seats/tickets for **15 minutes**.
   - Timer starts counting down (`15:00` ... `00:00`).
4. User is navigated to `/events/:eventId/booking/customer`.

---

### STEP 3: Customer & Attendee Details Entry
1. On `/events/:eventId/booking/customer` ([`CustomerDetailsPage.jsx`](file:///f:/djj/djj/src/pages/customer/CustomerDetailsPage.jsx)):
   - Customer fills in Full Name, Email, Phone Number, and Attendee details.
2. Clicking **Continue to Summary** updates `BookingContext` state and navigates to `/events/:eventId/booking/summary`.

---

### STEP 4: Order Summary & Tax Calculation
1. On `/events/:eventId/booking/summary` ([`OrderSummaryPage.jsx`](file:///f:/djj/djj/src/pages/customer/OrderSummaryPage.jsx)):
   - Displays itemized pricing: Base Ticket Price + Platform Booking Fee + GST (18%).
   - Customer can apply discount promo codes.
2. Clicking **Proceed to Payment** submits draft order to backend (`POST /api/v1/bookings`) and navigates to `/events/:eventId/booking/payment`.

---

### STEP 5: Payment Gateway Checkout
1. On `/events/:eventId/booking/payment` ([`PaymentMethodPage.jsx`](file:///f:/djj/djj/src/pages/customer/PaymentMethodPage.jsx)):
   - Customer selects payment mode: **UPI / QR**, **Credit/Debit Card**, or **Net Banking**.
2. Executes payment transaction (`PATCH /api/v1/bookings/:bookingId/confirm`).
3. Backend validates payment status:
   $$\text{Booking Status}: \text{Reserved} \longrightarrow \text{Confirmed}$$
   $$\text{Payment Status}: \text{Pending} \longrightarrow \text{Paid}$$
4. Redirects to `/booking/:bookingId/success` ([`BookingConfirmationPage.jsx`](file:///f:/djj/djj/src/pages/customer/BookingConfirmationPage.jsx)) showing successful order invoice.

---

### STEP 6: Accessing Digital QR Ticket Passes
1. Customer accesses **My Tickets** at `/my-tickets` ([`MyTicketsPage.jsx`](file:///f:/djj/djj/src/pages/customer/MyTicketsPage.jsx)) or **My Bookings** at `/my-bookings` ([`CustomerBookingsPage.jsx`](file:///f:/djj/djj/src/pages/customer/CustomerBookingsPage.jsx)).
2. Each ticket card displays:
   - Event Title, Date, Time, Venue Name
   - Ticket Category & Assigned Seat Number
   - **View Pass / QR Code** button.
3. Clicking **View Pass** renders [`DigitalTicketCard.jsx`](file:///f:/djj/djj/src/components/ticket/DigitalTicketCard.jsx) with an encrypted SVG QR pass containing ticket hash validation payload.

---

### STEP 7: Physical Venue Entrance Check-In
1. At physical venue turnstiles, Customer displays smartphone screen showing digital QR ticket pass.
2. Venue Scanner Staff logs into `/scanner` ([`ScannerAppView.jsx`](file:///f:/djj/djj/src/pages/ScannerAppView.jsx)) with Scanner Staff credentials (`scanner1@musicfest.com` / `ScannerPass123!`).
3. Scanner app validates QR payload (`POST /api/v1/checkin/scan`), verifying:
   - Valid signature hash
   - Correct assigned gate
   - Ticket status transition: $\text{Confirmed} \longrightarrow \text{CheckedIn}$.

---

## 🛠️ 3. Verified Backend API Specifications

All backend booking services are located under [`src/modules/booking/`](file:///f:/djj/backend/src/modules/booking/):

### 1. Create Reservation Lock (15 Minutes)
- **Endpoint**: `POST /api/v1/reservations`
- **Controller**: [`ReservationController.createReservation`](file:///f:/djj/backend/src/modules/booking/controllers/reservation.controller.js)
- **Request Body**:
  ```json
  {
    "eventId": "evt_music_fest_2026",
    "ticketTypeId": "tkt_vip_001",
    "quantity": 2
  }
  ```
- **Response (`201 Created`)**:
  ```json
  {
    "success": true,
    "message": "Inventory locked successfully for 15 minutes",
    "data": {
      "id": "res_987654321",
      "eventId": "evt_music_fest_2026",
      "expiresAt": "2026-08-12T11:05:00.000Z",
      "status": "ACTIVE"
    }
  }
  ```

---

### 2. Draft Booking Order Creation
- **Endpoint**: `POST /api/v1/bookings`
- **Controller**: [`BookingController.createBooking`](file:///f:/djj/backend/src/modules/booking/controllers/booking.controller.js)
- **Request Body**:
  ```json
  {
    "eventId": "evt_music_fest_2026",
    "reservationId": "res_987654321",
    "customerDetails": {
      "fullName": "Alice Johnson",
      "email": "customer@example.com",
      "phone": "+919876543210"
    }
  }
  ```
- **Response (`201 Created`)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "bk_11223344",
      "bookingNumber": "BK-20260812-7712",
      "totalAmount": 3540.00,
      "bookingStatus": "Pending",
      "paymentStatus": "Pending"
    }
  }
  ```

---

### 3. Fetch Customer Bookings List
- **Endpoint**: `GET /api/v1/my-bookings`
- **Controller**: [`MyBookingController.getMyBookings`](file:///f:/djj/backend/src/modules/booking/controllers/myBooking.controller.js)
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "bk_11223344",
        "bookingNumber": "BK-20260812-7712",
        "bookingStatus": "Confirmed",
        "paymentStatus": "Paid",
        "event": {
          "title": "Summer Music Festival 2026",
          "startDateTime": "2026-09-15T18:00:00.000Z",
          "venue": { "name": "Grand Arena", "city": "Mumbai" }
        },
        "tickets": [
          { "id": "tkt_item_01", "ticketType": { "name": "VIP Ticket" }, "seatNumber": "VIP-A-12" }
        ]
      }
    ]
  }
  ```

---

### 4. Generate QR Ticket Payload
- **Endpoint**: `GET /api/v1/bookings/:bookingId/tickets/:ticketId/qr`
- **Controller**: [`QrController.generateQrTicket`](file:///f:/djj/backend/src/modules/booking/controllers/qr.controller.js)
- **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "qrCodeData": "data:image/svg+xml;base64,...",
      "securityToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "ticketId": "tkt_item_01"
    }
  }
  ```

---

## ❓ 4. Codebase Error Handling & Edge Cases

| Edge Case / Error | Cause | Codebase Mechanism | Solution |
| :--- | :--- | :--- | :--- |
| **`403 Access Forbidden`** | Customer attempted to access organizer/admin routes (`/organizer/*`, `/admin/*`). | [`ProtectedRoute`](file:///f:/djj/djj/src/routes/ProtectedRoute.jsx) redirects to role home or shows access denied toast. | Keep customer users within customer routes (`/events`, `/my-bookings`). |
| **`15-Minute Timer Expired`** | Checkout elapsed without completing payment. | Backend cleanup job updates status to `Expired` and releases Prisma inventory locks. | [`TicketSelectionPage.jsx`](file:///f:/djj/djj/src/pages/customer/TicketSelectionPage.jsx) shows toast alert and redirects user to re-select tickets. |
| **`401 Unauthorized`** | JWT token expired or absent in request header. | [`auth.middleware.js`](file:///f:/djj/backend/src/middlewares/auth.middleware.js) throws `AppError(401)`. | Axios interceptor clears local token and navigates to `/login`. |
| **`Payment Failure`** | Gateway processing error or payment rejected. | System navigates to `/booking/:id/failed` ([`PaymentFailedPage.jsx`](file:///f:/djj/djj/src/pages/customer/PaymentFailedPage.jsx)). | Allows customer to retry payment before reservation lock expires. |
