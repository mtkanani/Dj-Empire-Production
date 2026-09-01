# DJ EMPIRE PRODUCTION - Real-Time Ticket Synchronization & System Architecture Guide

Welcome to the official documentation for the **DJ EMPIRE PRODUCTION Event Booking & Management Platform**. This guide details how real-time ticket purchasing, seat inventory, and cryptographic ticket generation automatically sync across all user and organizer views in the platform.

---

## ⚡ 1. Real-Time Ticket Synchronization Architecture

Whenever a customer purchases or reserves a ticket, the system triggers instant real-time events via the **Socket.IO Real-Time Engine** (`ws://localhost:3000`). This guarantees that ticket availability, remaining seats, sales metrics, and digital passes update live everywhere ticket information is displayed without needing a page refresh.

```
       [ Customer Ticket Purchase / Checkout ]
                          │
                          ▼
           [ Backend Booking & Inventory Service ]
                          │
                          ▼
      [ MongoDB Database + Socket.IO Event Engine ]
       │                                         │
       ├───────────────────┬─────────────────────┤
       ▼                   ▼                     ▼
[ Customer Screens ]  [ Organizer Views ]  [ Admin Analytics ]
• Ticket Selection   • Live Dashboard      • Real-time Sales
• Event Details      • Event Table         • Revenue Charts
• My Tickets Pass    • Attendance Roster   • Ticket Counts
```

---

## 🔄 2. How Ticket Purchases Sync Across All Displays

### 🎟️ A. Customer Discovery & Booking Pages
1. **Explore Events & Event Details (`/events` & `/events/:id`)**:
   - Displays lowest ticket starting prices and available seat counts.
   - Updates live when ticket inventory changes.
2. **Ticket Selection Page (`/events/:id/book`)**:
   - Subscribes to real-time socket events (`useEventRealtime(eventId)`).
   - As tickets are purchased or held, the `quantityAvailable` badge and counter automatically decrement live.
   - When a tier reaches `0`, it instantly transitions to **Sold Out** state.
3. **My Digital Tickets & Bookings (`/my-tickets` & `/my-bookings`)**:
   - Upon payment confirmation (`/booking/:id/success`), the new ticket pass with QR Code entrance token immediately appears under the customer's **My Tickets** collection.

### 📊 B. Organizer Dashboard & Event Management Pages
1. **Organizer Dashboard (`/organizer/dashboard`)**:
   - Listens for `booking:confirmed` and `seat:sold` real-time socket broadcasts.
   - Automatically recalculates:
     - **Today's Sales** & **Monthly Revenue**
     - **Total Tickets Sold** & **Tickets Remaining**
     - **Real-Time Attendance Breakdown** (Checked-in vs. Issued vs. Cancelled)
     - **Recent Sales & Payment Widgets**
2. **Organizer Events Table & Details (`/organizer/events` & `/organizer/events/:id`)**:
   - Displays live ticket tier quantities, remaining capacity, starting prices, and revenue breakdown.
   - Archived or deleted events are automatically excluded from active dashboard analytics.

---

## 📡 3. Real-Time Socket.IO Events Reference

| Event Name | Trigger Condition | Target Audience / Components | Effect |
| :--- | :--- | :--- | :--- |
| `booking:confirmed` | Payment successful & booking created | Dashboard, My Bookings, Event Table | Increments sales counters & creates digital ticket passes |
| `seat:sold` | Individual seat or ticket locked/purchased | Ticket Selection Page, Event Details | Decrements `quantityAvailable` in real-time |
| `seat:released` | 15-min reservation hold expires | Ticket Selection Page, Seating Maps | Restores `quantityAvailable` back to inventory |
| `attendance:updated` | Gate scanner checks in a customer QR | Attendance Roster, Dashboard Widgets | Marks ticket status as `CHECKED_IN` live |

---

## 🔒 4. Event Lifecycle & Archiving Rules

- **Live & Active Events**:
  - Tracked in real-time across customer discovery feeds and organizer dashboard metrics.
- **Archived Events**:
  - When an organizer archives an event, its sales data and ticket metrics are safely hidden from the active dashboard overview.
  - Customer ticket passes for archived events display an **`EVENT ARCHIVED`** badge with a grayed-out/muted card design for clear reference.
- **Deleted Events**:
  - Permanently removed from active listings with full confirmation prompts.

---

## 🛠️ 5. Development & Testing Commands

To run the full stack locally:

### Backend Server (`http://localhost:3000`):
```bash
cd f:\djj\backend
npm run dev
```

### Frontend Application (`http://localhost:5173`):
```bash
cd f:\djj\djj
npm run dev
```

---

*Documentation compiled for **DJ EMPIRE PRODUCTION** — All rights reserved.*
