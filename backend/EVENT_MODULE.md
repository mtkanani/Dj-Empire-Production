# Enterprise Event Management Module Architecture & Technical Specification

Multi-tenant SaaS Event Management Platform Backend (BookMyShow / Eventbrite Style) built with **Node.js, Express.js, Prisma ORM, MongoDB/PostgreSQL, Zod, JWT, and Clean Architecture**.

---

## 🏗️ 1. Directory & Folder Structure

All code for this module is isolated inside the modular directory `src/modules/event/`:

```text
src/
└── modules/
    └── event/
        ├── controllers/
        │   ├── event.controller.js
        │   ├── category.controller.js
        │   ├── schedule.controller.js
        │   ├── venue.controller.js
        │   ├── image.controller.js
        │   ├── faq.controller.js
        │   ├── policy.controller.js
        │   └── seo.controller.js
        ├── services/
        │   ├── event.service.js
        │   ├── schedule.service.js
        │   ├── venue.service.js
        │   ├── image.service.js
        │   ├── faq.service.js
        │   └── stateMachine.service.js
        ├── repositories/
        │   ├── event.repository.js
        │   ├── category.repository.js
        │   ├── schedule.repository.js
        │   ├── venue.repository.js
        │   ├── image.repository.js
        │   ├── faq.repository.js
        │   ├── policy.repository.js
        │   └── seo.repository.js
        ├── routes/
        │   ├── event.routes.js
        │   ├── category.routes.js
        │   ├── schedule.routes.js
        │   ├── venue.routes.js
        │   ├── image.routes.js
        │   ├── faq.routes.js
        │   ├── policy.routes.js
        │   └── seo.routes.js
        ├── validations/
        │   └── event.validation.js
        ├── dto/
        │   └── event.dto.js
        ├── middleware/
        │   ├── eventOwner.middleware.js
        │   └── stateTransition.middleware.js
        ├── utils/
        │   ├── slug.util.js
        │   └── stateMachine.util.js
        ├── event.controller.js
        ├── event.service.js
        ├── event.repository.js
        ├── event.routes.js
        ├── event.validation.js
        └── index.js
```

---

## 🔄 2. Event Lifecycle State Machine

The Event Lifecycle is governed by a strict finite state machine:

```text
Draft ------> PendingApproval ------> Approved ------> Published ------> Completed
  |                |                    |                |                  |
  +----------> Rejected                 +-----------> Unpublished           |
  |                |                    |                |                  |
  v                v                    v                v                  v
Archived       Archived             Archived         Cancelled --------> Archived
```

### State Definitions & Enums
- **`Draft`**: Initial creation state. Only visible to the Event Organizer.
- **`PendingApproval`**: Submitted by organizer for platform admin review.
- **`Approved`**: Verified by Super Admin; ready for publishing.
- **`Rejected`**: Rejected by Super Admin with feedback.
- **`Published`**: Live for public discovery, ticketing, and booking.
- **`Unpublished`**: Temporarily hidden from public view by organizer.
- **`Cancelled`**: Event cancelled due to unforeseen circumstances.
- **`Completed`**: Event end time passed successfully.
- **`Archived`**: Permanently archived state.

---

## 🔐 3. Multi-Tenant Role-Based Access Control (RBAC) Matrix

| Entity / Action | SUPER_ADMIN | EVENT_ORGANIZER | CUSTOMER (Public) |
| :--- | :---: | :---: | :---: |
| **Create Event** | ✅ | ✅ (Status = Draft) | ❌ |
| **View Own Events** | ✅ (All events) | ✅ (Own events only) | ❌ |
| **View Public Events** | ✅ | ✅ | ✅ (Published & Public only) |
| **Update Event** | ✅ | ✅ (Own events in Draft/Rejected) | ❌ |
| **Submit for Approval** | ❌ | ✅ (Own events) | ❌ |
| **Approve / Reject Event**| ✅ | ❌ | ❌ |
| **Publish / Unpublish** | ✅ | ✅ (If Approved) | ❌ |
| **Soft Delete Event** | ✅ | ✅ (Own events) | ❌ |
| **Restore Soft-Deleted**| ✅ | ❌ | ❌ |
| **Permanent Delete** | ✅ | ❌ | ❌ |
| **Manage Categories** | ✅ (Full CRUD) | ❌ (Read Only) | ❌ (Read Only) |
| **Manage Schedules** | ✅ | ✅ (Own events) | ❌ (Read Only) |
| **Manage Venues** | ✅ | ✅ (Own events) | ❌ (Read Only) |
| **Manage Images** | ✅ | ✅ (Own events) | ❌ (Read Only) |
| **Manage FAQs & Policy** | ✅ | ✅ (Own events) | ❌ (Read Only) |

---

## 📊 4. Database Models & Schema Specifications

### Event Model
- `id`: ObjectId
- `organizerId`: Relates to User (Role: `EVENT_ORGANIZER`)
- `title`: String
- `slug`: Unique String (Auto-generated from title + random hash)
- `shortDescription`: String
- `description`: String
- `categoryId`: Relates to Category
- `eventType`: Enum (`IN_PERSON`, `ONLINE`, `HYBRID`)
- `status`: Enum (`Draft`, `PendingApproval`, `Approved`, `Rejected`, `Published`, `Unpublished`, `Cancelled`, `Completed`, `Archived`)
- `visibility`: Enum (`PUBLIC`, `PRIVATE`, `UNLISTED`)
- `language`: String (Default: `"English"`)
- `currency`: String (Default: `"INR"`)
- `timezone`: String (Default: `"Asia/Kolkata"`)
- `publishAt`: DateTime?
- `unpublishAt`: DateTime?
- `ageRestriction`: String? (Default: `"All Ages"`)
- `featured`: Boolean (Default: `false`)
- `featuredUntil`: DateTime?
- `termsAccepted`: Boolean (Default: `true`)
- `isDeleted`: Boolean (Default: `false`)
- `deletedAt`: DateTime?
- `createdAt`: DateTime
- `updatedAt`: DateTime

### Nested Component Models
1. **Venue**: `venueName`, `address`, `city`, `state`, `country`, `postalCode`, `latitude`, `longitude`, `capacity`, `parkingAvailable`, `wheelchairAccessible`, `foodAllowed`, `smokingAllowed`.
2. **Schedule**: `startDate`, `endDate`, `startTime`, `endTime`, `gateOpenTime`, `bookingCloseTime`. (*Validation: endDate >= startDate, endTime > startTime*).
3. **EventImage**: `type` (`BANNER`, `POSTER`, `GALLERY`, `THUMBNAIL`), `imageUrl`, `displayOrder`.
4. **FAQ**: `question`, `answer`, `displayOrder`.
5. **Policy**: `refundPolicy`, `cancellationPolicy`, `entryPolicy`, `cameraPolicy`, `foodPolicy`, `childPolicy`, `parkingPolicy`, `idProofRequired`.
6. **SEO**: `metaTitle`, `metaDescription`, `keywords`, `canonicalUrl`, `ogImage`.

---

## 🌐 5. RESTful API Endpoint Catalogue

### A. Event Core & Lifecycle APIs
- **`POST /api/events`**: Create Event (Draft)
- **`GET /api/events`**: List & search events (Supports multi-column filtering & pagination)
- **`GET /api/events/:id`**: Get full event details by ID or Slug
- **`PUT /api/events/:id`**: Update event details
- **`DELETE /api/events/:id`**: Soft delete event
- **`PATCH /api/events/:id/restore`**: Restore soft-deleted event (Admin)
- **`DELETE /api/events/:id/permanent`**: Permanently purge event (Admin)

### B. Event Publishing & Lifecycle State APIs
- **`PATCH /api/events/:id/publish`**: Transition status to `Published`
- **`PATCH /api/events/:id/unpublish`**: Transition status to `Unpublished`
- **`PATCH /api/events/:id/cancel`**: Transition status to `Cancelled`
- **`PATCH /api/events/:id/archive`**: Transition status to `Archived`
- **`PATCH /api/events/:id/submit-approval`**: Transition status to `PendingApproval`
- **`PATCH /api/events/:id/approve`**: Admin approve event
- **`PATCH /api/events/:id/reject`**: Admin reject event with feedback

### C. Master Event Categories (Admin Only)
- **`POST /api/event-categories`**: Create category
- **`GET /api/event-categories`**: List all categories
- **`GET /api/event-categories/:id`**: Get category by ID
- **`PUT /api/event-categories/:id`**: Update category
- **`DELETE /api/event-categories/:id`**: Delete category

### D. Nested Sub-Resource Management APIs
- **Schedules**: `POST`, `GET`, `PUT`, `DELETE` under `/api/events/:eventId/schedules`
- **Venue**: `POST`, `GET`, `PUT`, `DELETE` under `/api/events/:eventId/venue`
- **Images**: `POST`, `GET`, `PUT`, `DELETE` under `/api/events/:eventId/images`
- **FAQs**: `POST`, `GET`, `PUT`, `DELETE` under `/api/events/:eventId/faqs`
- **Policies**: `POST`, `GET`, `PUT` under `/api/events/:eventId/policy`
- **SEO Details**: `POST`, `GET`, `PUT` under `/api/events/:eventId/seo`

---

## 🔍 6. Search, Filtering, and Pagination

### Query Parameters Supported
- `page`: Page number (Default: `1`)
- `limit`: Items per page (Default: `10`, Max: `100`)
- `sortBy`: Field name (Default: `"startDate"`)
- `sortOrder`: `"asc"` | `"desc"`
- `search`: Keyword matching `title` & `description`
- `categoryId`: Filter by category
- `eventType`: Filter by type (`IN_PERSON`, `ONLINE`, `HYBRID`)
- `status`: Filter by event status
- `city`: Filter by venue city
- `visibility`: Filter by visibility
- `startDate` & `endDate`: Date range filtering
- `isFeatured`: Boolean filter

---

## 📜 7. Standard API Response Formats

### Success Response
```json
{
  "success": true,
  "message": "Event created successfully",
  "data": {
    "id": "65c3ab12ef4512001a89bcde",
    "title": "Sunburn Goa 2026 - EDM Festival",
    "slug": "sunburn-goa-2026-edm-festival-a1b2c3",
    "status": "Draft",
    "createdAt": "2026-08-05T18:00:00.000Z"
  },
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
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
      "field": "schedules[0].endDate",
      "message": "End Date must be greater than or equal to Start Date"
    }
  ],
  "statusCode": 400
}
```
