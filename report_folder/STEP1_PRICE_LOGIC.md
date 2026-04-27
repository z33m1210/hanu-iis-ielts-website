# Step 1: Price Logic & URL Handling Audit

This report details the technical implementation of price processing and routing for the BandPath checkout system.

## 1. Backend Price Retrieval
**File**: `backend/src/controllers/paymentController.js`

*   **Logic Found**: The controller currently extracts the `amount` directly from the request body:
    ```javascript
    const { courseIds, amount } = req.body;
    ```
*   **Security Risk**: High. The function **does not** perform a `prisma.course.findUnique` to retrieve the source-of-truth price from the database. It trusts the client-side calculated value.
*   **Audit Result**: 🚨 **Gap Identified**. Backend validation is missing.

---

## 2. Course Schema Check
**File**: `backend/prisma/schema.prisma`

*   **Field Name**: `price`
*   **Data Type**: `Float`
*   **Default Value**: `0.0`
*   **Secondary Fields**: `originalPrice` (`Float?`) is also available for calculating discounts.
*   **Audit Result**: ✅ **Confirmed**. Standard floating-point precision is being used.

---

## 3. Frontend URL Handling
**File**: `frontend/checkout/checkout.js`

*   **URLSearchParams Logic**: ❌ **None**.
*   **Direct Buy (?id=) Support**: ❌ **Missing**. The current `renderOrderSummary()` function strictly pulls data from the `Cart` service (localStorage).
*   **Impact**: If a user clicks "Buy Now" on a course page and is sent to `checkout/?id=16`, the checkout page will likely redirect them back to the category list because `Cart.getItems()` will be empty.
*   **Audit Result**: ⚠️ **Gap Identified**. URL-based checkout is not yet supported.

---

## 4. Cart vs. ID Conflict
*   **Current Priority**: **Cart (localStorage)**.
*   **Reasoning**: Because the code lacks any logic to parse `window.location.search`, it behaves as if the URL parameters do not exist. It only renders what is physically present in the `bandpath_cart` local storage key.
*   **Conflict Scenario**: If a user has Course A in their cart but visits `checkout/?id=CourseB`, the page will only show Course A.

---

## 5. Summary Table

| Requirement | Implementation Detail | Status |
| :--- | :--- | :--- |
| **Backend Price Verification** | Trusted from `req.body` | ❌ Insecure |
| **Schema Field** | `price` (Float) | ✅ Accurate |
| **URL Parameter Support** | None | ❌ Missing |
| **Conflict Resolution** | Prioritizes LocalStorage | ⚠️ Hardcoded |

**Auditor Signature:** Senior Backend Architect - BandPath Development Team
