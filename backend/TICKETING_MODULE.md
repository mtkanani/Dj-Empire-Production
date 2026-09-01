# Enterprise Ticketing & Event Operations Module Architecture & Technical Specification

Multi-tenant SaaS Ticketing & Event Operations Backend Module (BookMyShow / Eventbrite Style) built with **Node.js, Express.js, Prisma ORM, MongoDB/PostgreSQL, Zod, JWT, and Clean Architecture**.

---

## 🏗️ 1. Directory & Folder Structure

All code for this module is isolated inside `src/modules/ticketing/`:

```text
src/
└── modules/
    └── ticketing/
        ├── controllers/
        │   ├── section.controller.js
        │   ├── ticketType.controller.js
        │   ├── inventory.controller.js
        │   ├── pricing.controller.js
        │   ├── bookingRules.controller.js
        │   ├── seatMap.controller.js
        │   ├── waitlist.controller.js
        │   ├── coupon.controller.js
        │   └── analytics.controller.js
        ├── services/
        │   ├── section.service.js
        │   ├── ticketType.service.js
        │   ├── inventory.service.js
        │   ├── pricing.service.js
        │   ├── waitlist.service.js
        │   ├── coupon.service.js
        │   └── capacityValidation.service.js
        ├── repositories/
        │   ├── section.repository.js
        │   ├── ticketType.repository.js
        │   ├── inventory.repository.js
        │   ├── pricing.repository.js
        │   ├── bookingRules.repository.js
        │   ├── seatMap.repository.js
        │   ├── waitlist.repository.js
        │   └── coupon.repository.js
        ├── routes/
        │   ├── section.routes.js
        │   ├── ticketType.routes.js
        │   ├── inventory.routes.js
        │   ├── pricing.routes.js
        │   ├── waitlist.routes.js
        │   ├── coupon.routes.js
        │   └── analytics.routes.js
        ├── validations/
        │   └── ticketing.validation.js
        ├── dto/
        │   └── ticketing.dto.js
        ├── middleware/
        │   ├── capacityGuard.middleware.js
        │   └── inventoryLock.middleware.js
        ├── utils/
        │   └── inventoryCalculator.util.js
        ├── ticket.controller.js
        ├── ticket.service.js
        ├── ticket.repository.js
        ├── ticket.routes.js
        └── index.js
```

---

## 📐 2. Domain Architecture & Capacity Validation Rules

### A. Strict Venue Capacity Constraint Rule
Whenever an Event Organizer creates or updates a Section, the system validates:
$$\sum \text{Section Capacity} \le \text{Venue Capacity}$$

**Example Validation Scenario**:
- Venue Total Capacity: `5000`
- Section 1 (Diamond): `300`
- Section 2 (VIP): `500`
- Section 3 (Gold): `1000`
- Section 4 (Silver): `1200`
- Section 5 (General): `2000`
- **Total Section Capacity**: `5000` $\le$ `5000` $\rightarrow$ **ACCEPTED ✅**
- If organizer attempts to add Section 6 (Balcony: 500) $\rightarrow$ Total = `5500` > `5000` $\rightarrow$ **REJECTED (400 Bad Request) ❌**

---

## 📦 3. Real-Time Inventory Calculation Engine

The inventory engine manages stock independently per section and ticket type.

### Single Source of Truth Inventory Formula
$$\text{Available Quantity} = \text{Total Quantity} - \text{Reserved Quantity} - \text{Sold Quantity} - \text{Blocked Quantity}$$

- **`totalQuantity`**: Total allocated tickets.
- **`reservedQuantity`**: Temporarily locked in active customer checkout carts (expires in 10 minutes).
- **`soldQuantity`**: Confirmed completed purchases.
- **`blockedQuantity`**: Held by organizer for VIPs/sponsors.
- **`availableQuantity`**: Remaining for purchase.

---

## 🔄 4. Waitlist Auto-Fulfillment Lifecycle Workflow

```text
[Section Sold Out] ---> [User Joins Waitlist] ---> [Inventory Released / Cancellation]
                                                               |
                                                               v
[Auto Expire Link (15m)] <--- [Send Booking Link] <--- [Notify Top Waitlist User]
```

1. **Sold Out Detection**: When `availableQuantity == 0`, customers can join the Waitlist (`POST /api/waitlist`).
2. **Inventory Release**: If a booking is cancelled or reserved cart expires, inventory is freed.
3. **Queue Notification**: System automatically reserves 1 ticket for top waitlisted customer and emails a unique 15-minute booking purchase link.
4. **Auto-Expire**: If unfulfilled after 15 minutes, ticket moves to next user in waitlist queue.

---

## 🎟️ 5. Dynamic Pricing Engine

Supports 6 dynamic price tiers:
1. **`EARLY_BIRD`**: Tiered discount for early buyers.
2. **`REGULAR`**: Standard baseline price.
3. **`LAST_MINUTE`**: Price surge close to event start date.
4. **`FLASH_SALE`**: Time-limited promo pricing window.
5. **`WEEKEND_PRICING`**: Weekend surcharge rules.
6. **`HOLIDAY_PRICING`**: Holiday event pricing.

---

## 🏷️ 6. Coupon & Discount Engine

Supports 7 promo models:
- `PERCENTAGE` (e.g. 20% OFF up to ₹500)
- `FLAT_AMOUNT` (e.g. Flat ₹200 OFF)
- `BUY_X_GET_Y` (e.g. Buy 4 Get 1 Free)
- `STUDENT_DISCOUNT`
- `CORPORATE_DISCOUNT`
- `PROMO_CODE`
- `REFERRAL_CODE`

---

## 🌐 7. RESTful API Catalogue

### 1. Event Section APIs
- `POST /api/events/:eventId/sections` (Create Custom Section: Diamond, VIP, Gold, etc.)
- `GET /api/events/:eventId/sections` (List Event Sections with capacity counts)
- `GET /api/events/:eventId/sections/:sectionId` (Get Section details)
- `PUT /api/events/:eventId/sections/:sectionId` (Update Section)
- `DELETE /api/events/:eventId/sections/:sectionId` (Delete Section)

### 2. Ticket Type APIs
- `POST /api/events/:eventId/sections/:sectionId/ticket-types` (Create Ticket Type)
- `GET /api/events/:eventId/sections/:sectionId/ticket-types` (List Ticket Types)
- `PUT /api/events/:eventId/sections/:sectionId/ticket-types/:id` (Update Ticket Type)
- `DELETE /api/events/:eventId/sections/:sectionId/ticket-types/:id` (Delete Ticket Type)

### 3. Inventory & Live Availability APIs
- `GET /api/events/:eventId/inventory` (Get live inventory status across all sections)
- `PUT /api/events/:eventId/inventory` (Update/Block inventory quantities)
- `PATCH /api/events/:eventId/inventory/reset` (Reset inventory allocations)
- `GET /api/events/:eventId/availability/live` (Live ticket availability & occupancy %)

### 4. Dynamic Pricing & Booking Rules APIs
- `POST /api/events/:eventId/pricing` (Create Dynamic Pricing rule)
- `GET /api/events/:eventId/pricing` (Get Pricing rules)
- `PUT /api/events/:eventId/pricing/:id` (Update Pricing rule)
- `DELETE /api/events/:eventId/pricing/:id` (Delete Pricing rule)
- `POST /api/events/:eventId/booking-rules` (Configure Min/Max per user, OTP requirement, ID proof)

### 5. Seat Mapping APIs (Optional)
- `POST /api/events/:eventId/sections/:sectionId/seats` (Configure Grid Seat Map: A1, A2, VIP-A1)
- `GET /api/events/:eventId/sections/:sectionId/seats` (Get Seat Map status)

### 6. Waitlist APIs
- `POST /api/events/:eventId/waitlist` (Join Waitlist when sold out)
- `GET /api/events/:eventId/waitlist` (View Waitlist queue - Organizer)
- `DELETE /api/events/:eventId/waitlist/:id` (Leave / Remove from Waitlist)

### 7. Coupons & Discounts APIs
- `POST /api/coupons` (Create Coupon Code)
- `GET /api/coupons` (List active coupons)
- `POST /api/coupons/validate` (Validate coupon code against shopping cart)

### 8. Analytics & Organizer Dashboard APIs
- `GET /api/events/:eventId/analytics/dashboard` (Section-wise Revenue, Occupancy %, Average Ticket Price, Today's Sales, Sales by Day/Hour, Cancelled Count)

---

## 📜 8. Standard API Response Formats

### Success Response
```json
{
  "success": true,
  "message": "Section created successfully",
  "data": {
    "id": "65c3ab12ef4512001a89bcde",
    "eventId": "65c3aa00ef4512001a89bcd1",
    "name": "VIP Lounge",
    "capacity": 500,
    "availableCapacity": 500,
    "createdAt": "2026-08-05T18:00:00.000Z"
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "capacity",
      "message": "Total section capacity (5500) exceeds venue capacity (5000)"
    }
  ],
  "statusCode": 400
}
```
