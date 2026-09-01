# Ticket delivery, QR email & verification

Production flow after this module:

Registration (mandatory mobile) → Login → Browse events → Select tickets → Booking/payment → Booking stored → Unique tickets created (one per quantity) → QR generated per ticket → Email with **one QR image per ticket** → View / download PDF → Gate scan → Ticket marked USED → Duplicate scan rejected.

## New / updated APIs (`/api/v1`)

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/bookings/:bookingId/ticket` | Customer (owner) | Full ticket payload from User + Event + Booking + Tickets |
| GET | `/bookings/:bookingId/ticket/download` | Customer (owner) | PDF: one page and one QR per ticket |
| POST | `/bookings/:bookingId/ticket/resend` | Customer (owner), rate limited | Resend email with one QR PNG per ticket + PDF |
| POST | `/tickets/verify` | Scanner / organizer / staff, rate limited | `{ "ticketId": "..." }` atomic check-in |

Email failure does **not** cancel the booking. Tickets stay CONFIRMED (`ISSUED`). User can resend.

## QR payload

Signed HMAC token containing `ticketId`, `bookingId`, `ticketCode` only (no email/password/phone).

If a booking has 3 tickets, the email contains **3 distinct QR images**, the PDF has **3 pages**, and the app shows **3 QR passes**. Each QR admits one person.

## Ticket status mapping

| Database | Public |
| --- | --- |
| ISSUED | CONFIRMED |
| CHECKED_IN | USED |
| CANCELLED | CANCELLED |
| EXPIRED | EXPIRED |

## Environment

```
SMTP_HOST=   (or EMAIL_HOST)
SMTP_PORT=   (or EMAIL_PORT)
SMTP_USER=   (or EMAIL_USER)
SMTP_PASS=   (or EMAIL_PASSWORD)
EMAIL_FROM=
```

Never commit real SMTP passwords. Use Gmail App Passwords or your provider SMTP.

## How to test

1. Register with a unique mobile number (invalid / duplicate numbers should fail).
2. Login, book an event with quantity 3, complete payment.
3. Confirm booking is stored and 3 tickets exist in MongoDB.
4. Check email: 3 QR images + PDF attachment.
5. View / download / resend from My Tickets.
6. `POST /tickets/verify` with one ticketId → USED.
7. Scan the same ticket again → already used.
8. Stop SMTP and confirm booking still succeeds; resend later after SMTP is fixed.
