# Static Information Gap Report: Course Detail Page

This report identifies all remaining hardcoded elements in `frontend/course/index.html` and maps them to the existing dynamic data in the BandPath backend.

## 1. Static Element Identification
The following elements currently display static "placeholder" text and are not updated by `course-page.js`.

| Feature Area | HTML Selector (ID/Class) | Current Static Text | Priority |
| :--- | :--- | :--- | :--- |
| **Meta Row** | `#course-meta` | `30h • 20 Lectures • Beginner` | High |
| **Sub-Header** | `#course-reviews` | `(0 ratings)` | High |
| **Header Badge** | `.rating-pill span` | `0.0` | High |
| **Breadcrumbs** | `.breadcrumb-nav a[href*="category"]` | `category` | Medium |
| **Pricing** | `#price-original` | `$0` | Medium |
| **Review Stats** | `#avg-rating` | `4.8` | Medium |
| **Overview Body** | `#desc-body` | `This IELTS course is expertly designed...` | Medium |
| **Updated Date** | *New element needed* | N/A | Low |

---

## 2. Backend Availability Check
A cross-reference with `backend/prisma/schema.prisma` confirms that **100% of the required data already exists** in the `Course` model.

**No Prisma migrations are required.**

| Static Element | Prisma Field | Data Type | Available in API? |
| :--- | :--- | :--- | :--- |
| Course Hours | `hours` | `Int` | ✅ Yes |
| Lecture Count | `lectures` | `Int` | ✅ Yes |
| Skill Level | `level` | `String` | ✅ Yes |
| Rating Score | `rating` | `Float` | ✅ Yes |
| Rating Count | `ratingCount` | `Int` | ✅ Yes |
| Category | `category` | `String` | ✅ Yes |
| Original Price | `originalPrice` | `Float?` | ✅ Yes |
| Updated At | `updatedAt` | `DateTime` | ✅ Yes |

---

## 3. API Payload Audit
**Endpoint**: `GET /api/courses/:id`
**Controller**: `backend/src/controllers/courseController.js`

The current implementation of `getCourseById` uses a standard `findUnique` call without a `select` block, meaning **all fields** listed above are already being sent to the frontend.

**Example current payload snippet:**
```json
{
  "success": true,
  "course": {
    "id": 16,
    "title": "IELTS Speaking Masterclass",
    "hours": 30,
    "lectures": 25,
    "level": "Intermediate",
    "rating": 4.8,
    "ratingCount": 120,
    "updatedAt": "2026-04-25T10:00:00.000Z"
  }
}
```

---

## 4. Recommendation Table (Action Plan)

| HTML Selector | Prisma Field | Proposed JS Variable | Implementation Logic |
| :--- | :--- | :--- | :--- |
| `#course-meta` | `hours`, `lectures`, `level` | `metaText` | `` `${c.hours}h • ${c.lectures} Lectures • ${c.level}` `` |
| `#course-reviews` | `ratingCount` | `reviewText` | `` `(${c.ratingCount} ratings)` `` |
| `#avg-rating` | `rating` | `avgRating` | `c.rating.toFixed(1)` |
| `#price-original` | `originalPrice` | `oldPrice` | If exists, show `$${c.originalPrice}` |
| `.breadcrumb-nav a` | `category` | `catText` | Capitalize `c.category` |

### Recommended Migration Commands
*No migrations needed at this time.*

---
**Auditor Signature:** Senior Web Auditor - BandPath Development Team
