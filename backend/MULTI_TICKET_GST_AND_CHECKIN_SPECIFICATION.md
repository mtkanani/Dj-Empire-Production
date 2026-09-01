# Admin Tax/GST Configuration, Multi-Ticket QR Generation & Group Check-In Specification

Technical Architecture & Specification for **Admin-Configured Tax/GST Calculation**, **Post-Payment Cryptographic QR Code Generation**, **Multi-Ticket Grouping**, and **Check-In Access Control Group Ticket Counter Display**.

---

## 📌 1. Overview & Safety Value

To ensure safety, fraud prevention, fast venue throughput, and compliance with Indian GST regulations, this module specifies:

1. **Admin-Configured Tax & GST Engine**: System Admins configure applicable GST percentage (e.g. 18% GST = 9% CGST + 9% SGST / 18% IGST), service charges, and platform fees.
2. **Post-Payment Multi-Ticket QR Generation**: Upon 100% successful payment confirmation via UPI, Card, Netbanking, or Wallet, the system instantly generates cryptographic HMAC-signed QR Code(s).
3. **Multi-Ticket Quantity Attribution ($N$ Tickets)**: When a customer purchases multiple tickets (e.g., 3 tickets in 1 booking), the QR code payload contains the **Master Booking Reference** and total ticket quantity ($N=3$).
4. **Check-In Display & Group Counter**: Scanning the QR code at the entrance displays:
   - **Total Ticket Count** in this booking (e.g., `Total Tickets: 3`).
   - **Group Admittance Counter** (e.g., `Checked-In: 1 of 3`, `2 of 3`, or `Group Entry: All 3 Admitted`).
   - **Payment Verification Badge**: `PAID (GST Included)`.

---

## 🔄 2. End-to-End System Data Flow

```text
+-----------------------+           +-----------------------+           +-----------------------+           +-----------------------+
|      Admin Portal     |           |    Customer Order     |           |    Payment Gateway    |           |    Check-In Access    |
|   (Tax/GST Rules)     |           |    & Ticket Selection |           |  (UPI / Card / Netb)  |           |     Control Scanner   |
+-----------------------+           +-----------------------+           +-----------------------+           +-----------------------+
            |                                   |                                   |                                   |
1. Set Admin Tax Rules                          |                                   |                                   |
   (e.g., 18% GST + Fee)                        |                                   |                                   |
------------------------>                       |                                   |                                   |
            |                       2. Select 3 Tickets                             |                                   |
            |                          (Calculate Subtotal + GST)                   |                                   |
            |                       ------------------------>                       |                                   |
            |                                   |                       3. Pay Total Amount                         |
            |                                   |                          via UPI/Card                             |
            |                                   |                       -------------------->                       |
            |                                   |                                   | 4. Payment Verified (200 OK)      |
            |                                   | <----------------------------------                               |
            |                                   |                                   |                               |
            |                                   | 5. Issue HMAC QR Code             |                               |
            |                                   |    (Payload: 3 Tickets Count)     |                               |
            |                                   |                                   |                               |
            |                                   | 6. Customer Scans QR Code at Gate |                               |
            |                                   -------------------------------------------------------------------->
            |                                                                                                       | 7. Validate & Display:
            |                                                                                                       |    - Payment: PAID
            |                                                                                                       |    - Total Tickets: 3
            |                                                                                                       |    - Admitted: 3/3
```

---

## 🧾 3. Admin Tax & GST Calculation Engine

### 1. Admin Tax Settings Breakdown
Admins can define global or event-level tax configurations:
* `gstRate`: e.g. `18.0` (18% total GST)
* `cgstRate`: `9.0` (9% Central GST)
* `sgstRate`: `9.0` (9% State GST)
* `igstRate`: `18.0` (18% Inter-State GST)
* `platformFee`: Flat ₹10 per ticket or percentage fee
* `serviceCharge`: Admin processing fee

### 2. Price Calculation Formula
For a booking of $N$ tickets priced at $P$ per ticket:
$$\text{Base Subtotal} = N \times P$$
$$\text{Platform Fee Total} = N \times \text{Platform Fee}$$
$$\text{Taxable Amount} = \text{Base Subtotal} + \text{Platform Fee Total}$$
$$\text{GST Amount} = \text{Taxable Amount} \times \left(\frac{\text{GST Rate}}{100}\right)$$
$$\text{Total Payable Amount} = \text{Taxable Amount} + \text{GST Amount}$$

#### Example Order Breakdown (3 VIP Tickets @ ₹1,000 each):
- **Ticket Subtotal (3 × ₹1,000)**: ₹3,000.00
- **Platform Fee (3 × ₹20)**: ₹60.00
- **Taxable Subtotal**: ₹3,060.00
- **18% GST (9% CGST + 9% SGST)**: ₹550.80
- **Total Amount Paid via UPI/Card**: **₹3,610.80**

---

## 🎟️ 4. Multi-Ticket QR Code Generation Logic

Once payment webhook verifies `PaymentStatus == Paid`:

1. **Master Booking QR Code**: Generates a single master QR code representing the entire group booking.
2. **Individual Ticket Tokens**: Also generates $N$ individual cryptographic ticket sub-tokens (`TCK-001-A`, `TCK-001-B`, `TCK-001-C`).
3. **HMAC Cryptographic Signature**:
   ```text
   qrPayload = HMAC_SHA256(bookingId + eventId + totalTicketsCount + secretKey)
   ```

### QR Payload JSON Structure (Master Booking QR Code):
```json
{
  "ver": "1.0",
  "bookingNumber": "BKG-20260809-883311",
  "eventId": "65c4a1f8b2d1e3a4c5f6a700",
  "totalTickets": 3,
  "paymentStatus": "Paid",
  "sig": "e9b2c3d4f5a67890123456789abcdef0"
}
```

---

## 🚪 5. Check-In Access Control Multi-Ticket Counter Display

When the scanner staff scans the QR code at venue entrance, the backend access control engine performs multi-ticket group validation:

### Scanner Screen Display Information:
1. **Total Ticket Count Badge**: `Total Tickets Purchased: 3`
2. **Admittance Mode Selection**:
   * **Admit All Group (3 Tickets)**: Check in all 3 attendees together at once.
   * **Partial Group Entry (e.g. Admit 2 now, 1 later)**: Staff can admit 2 attendees now (`2/3 Checked-In`), and the remaining attendee can scan the same QR later to claim the 3rd check-in (`3/3 Checked-In`).
3. **Safety Protection (Over-Admittance Guard)**: If a scanner attempts to scan a booking where all 3/3 tickets are already checked in, the system flags **`DENIED_DUPLICATE_SCAN`** ("All 3 tickets in this booking have already been used for entry").

---

## 🗄️ 6. Data Model Extensions (Prisma ORM)

```prisma
// Admin Tax & Fee Settings Model
model TaxSetting {
  id             String   @id @default(auto()) @map("_id") @db.ObjectId
  gstRate        Float    @default(18.0) // 18% GST
  cgstRate       Float    @default(9.0)
  sgstRate       Float    @default(9.0)
  igstRate       Float    @default(18.0)
  platformFee    Float    @default(20.0) // Flat ₹20 per ticket
  serviceFee     Float    @default(0.0)
  gstNumber      String?  // Admin Business GSTIN
  isActive       Boolean  @default(true)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}

// Updated Booking Model with Group Check-In Counters
model Booking {
  id                   String            @id @default(auto()) @map("_id") @db.ObjectId
  bookingNumber        String            @unique
  eventId              String            @db.ObjectId
  customerId           String            @db.ObjectId
  totalTickets         Int               @default(1)
  checkedInTicketsCount Int               @default(0) // Tracks admitted count (0..N)
  subtotal             Float
  taxAmount            Float             // GST Amount
  totalAmount          Float             // Grand Total
  paymentStatus        PaymentStatus     @default(Pending)
  bookingStatus        BookingStatus     @default(Confirmed)
  tickets              Ticket[]
  payments             Payment[]
  createdAt            DateTime          @default(now())
  updatedAt            DateTime          @updatedAt
}
```

---

## 🌐 7. API Catalogue & Payload Examples

### 1. Admin Tax Settings API
* `POST /api/v1/admin/tax-settings`: Configure GST percentages and admin platform fees.
* `GET /api/v1/admin/tax-settings`: Fetch current GST & fee rules.

### 2. Multi-Ticket Check-In Scan API
* **Endpoint**: `POST /api/v1/checkin/scan`
* **Request Payload**:
```json
{
  "qrToken": "BKG-20260809-883311",
  "admitCount": 3,
  "gateId": "65c4a1f8b2d1e3a4c5f6a7b9"
}
```

* **Scanner Response (Group Check-In Success - 200 OK)**:
```json
{
  "success": true,
  "message": "Entry granted for 3 attendees",
  "data": {
    "bookingNumber": "BKG-20260809-883311",
    "customerName": "Rahul Sharma",
    "customerEmail": "rahul.sharma@example.com",
    "eventTitle": "Sunburn Concert 2026",
    "section": {
      "id": "65c4a1f8b2d1e3a4c5f6a7b8",
      "name": "VIP Lounge",
      "color": "#8B5CF6",
      "ticketCount": 3,
      "ticketType": "VIP Pass"
    },
    "paymentDetails": {
      "paymentStatus": "Paid",
      "paymentMethod": "UPI / GooglePay",
      "totalAmount": 3610.80,
      "gstPaid": 550.80
    },
    "groupCheckinSummary": {
      "totalTicketsPurchased": 3,
      "previouslyCheckedIn": 0,
      "newlyCheckedIn": 3,
      "totalCheckedInNow": 3,
      "remainingUnusedTickets": 0,
      "isFullyCheckedIn": true
    },
    "checkedInAt": "2026-08-09T14:00:00.000Z"
  }
}
```

* **Scanner Response (Partial Check-In Success - 200 OK)**:
```json
{
  "success": true,
  "message": "Entry granted for 2 of 3 attendees",
  "data": {
    "bookingNumber": "BKG-20260809-883311",
    "groupCheckinSummary": {
      "totalTicketsPurchased": 3,
      "previouslyCheckedIn": 0,
      "newlyCheckedIn": 2,
      "totalCheckedInNow": 2,
      "remainingUnusedTickets": 1,
      "isFullyCheckedIn": false
    }
  }
}
```

* **Scanner Error Response (Over-Admittance Attempt - 400 Bad Request)**:
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Entry Denied: All tickets in this booking have already been checked in",
  "errors": [
    {
      "field": "qrToken",
      "message": "This booking has 3 total tickets and all 3/3 have already entered the venue."
    }
  ]
}
```

---

## 🎯 8. Summary of Benefits

1. **GST Compliance**: Ensures clear tax invoicing with Admin-managed GST percentage and platform fees.
2. **Post-Payment Security**: QR codes are strictly generated **after** full payment verification.
3. **Multi-Ticket Group Management**: Enables scanning a single master QR code to admit groups of $N$ tickets (e.g. 3 tickets).
4. **Flexible & Safe Entrance Control**: Ground staff can view total ticket counts and admit whole groups or partial groups without double-admittance fraud.
