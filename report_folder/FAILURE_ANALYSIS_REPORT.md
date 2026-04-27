# BandPath Failure Point Analysis & Testing Report

This report outlines technical vulnerabilities, testing infrastructure status, and critical paths for automation within the BandPath IELTS Platform.

---

## 1. Current Error & Vulnerability Analysis

### Backend "Silent" Failures
*   **Prisma Client Stale State**: `courseController.js` (Line 72) contains a comment about manually fetching relations to avoid "stale prisma client inclusions." This suggests the Prisma schema and the generated client are occasionally out of sync, which can lead to `undefined` relation fields during runtime.
*   **Incomplete Payment Error Handling**: In `paymentController.js`, if the transaction fails during enrollment upserts, the system triggers `next(error)`, which returns a generic 500. There is no rollback logic for the user session or specific "Retry Payment" status returned to the frontend.
*   **Role Escalation Risk**: While `requireRole(['ADMIN'])` exists, the `auth.js` frontend service defaults to `role: 'USER'` on registration. A direct API call to `/auth/register` without validation for the `role` field could potentially allow self-registration as an `ADMIN` if the backend Joi schema is not strictly stripping that field.

### Frontend Console & Logic Warnings
*   **Static Assets**: Course cards on the homepage (`script.js:39`) are hardcoded to `Rectangle 1080.png`. This results in repetitive UI and will break if the file is moved, as there is no fallback `onerror` handler for images.
*   **Race Conditions**: `loadTopCourses()` and `loadCounts()` run on `DOMContentLoaded`. If the `Auth` service (which provides `fetchWithAuth`) isn't initialized first, these calls will fail with `Auth is not defined`.
*   **Synchronous UI Updates**: Wishlist and Cart updates rely on re-rendering the entire course list (`syncWishlistUI`), which causes a flickering "flash of content" rather than smooth DOM manipulation.

---

## 2. Testing Compatibility

### Current Status
*   **Backend**: Semi-compatible. `jest` and `supertest` are installed, but `npm test` is currently just an echo.
*   **Frontend**: Incompatible. No testing framework or configuration exists in the `package.json`.

### Recommendations
*   **Backend (Jest)**: Stick with **Jest**. It is already partially integrated. Action: Create a `jest.config.js` and move `server.test.js` into a dedicated `tests/` directory.
*   **Frontend (Vitest)**: Implement **Vitest**. Since the project uses Vite, Vitest provides the fastest and most integrated experience for unit testing shared services like `auth.js` and `cart.js`.
*   **E2E (Playwright)**: For the critical path (Purchase Flow), use Playwright. It is superior for testing cross-page navigation (Cart -> Checkout -> Success).

---

## 3. Critical Path Mapping (for Automation)

The following sequence represents the highest-priority "Happy Path" for automation:

1.  **Identity Verification**:
    *   Call `Auth.register()` via UI.
    *   Assert `localStorage` contains `bandpath_token`.
2.  **Inventory Selection**:
    *   Navigate to `/category/`.
    *   Trigger `addToCart(courseId)` via clicking the cart icon.
    *   Assert `Cart.getItems()` length increases.
3.  **Checkout Initialization**:
    *   Navigate to `/checkout/`.
    *   Assert `renderOrderSummary()` populates totals (Subtotal, Tax, Total).
4.  **Transaction Execution**:
    *   Fill mock card details.
    *   Click `.submit-button` (Triggers `POST /api/payments/checkout`).
    *   Assert redirect to `/order-completed/`.
5.  **Entitlement Verification**:
    *   Query `GET /api/enrollments` for the user.
    *   Verify the new `courseId` exists in the enrollment list.

---

## 4. Logical Failure Points (Prioritized)
1.  **Payment -> Enrollment Desync**: If payment is recorded but the server crashes before the enrollment transaction finishes (unlikely due to `$transaction`, but possible if the DB connection drops mid-commit).
2.  **Hardcoded Relative Paths**: Moving any folder (e.g., moving `sign-in` into an `auth` folder) will break every `window.location.href` in the app.
3.  **Token Expiration**: The frontend `fetchWithAuth` logs users out on 401, but there is no "Refresh Token" logic, leading to abrupt session termination during active usage.
