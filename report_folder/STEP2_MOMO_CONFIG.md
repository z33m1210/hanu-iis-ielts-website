# Step 2: MoMo Configuration & Integration Audit

This report evaluates the backend's readiness for MoMo E-wallet integration, focusing on environment variables, security libraries, and data models.

## 1. Environment Variables
**Status**: ❌ **Missing Config**.
*   The `.env` file currently only contains database, JWT, and email credentials.
*   **Action Required**: Add the following placeholders to `.env`:
    ```env
    MOMO_PARTNER_CODE="MOMOBKUN20180529" # Example Test Partner Code
    MOMO_ACCESS_KEY="..."
    MOMO_SECRET_KEY="..."
    MOMO_API_URL="https://test-payment.momo.vn/v2/gateway/api/create"
    ```

---

## 2. Cryptographic Libraries
**Source**: `package.json`
*   **Built-in Support**: Node.js's native `crypto` module is sufficient for `HmacSHA256` signatures.
*   **Third-party**: `crypto-js` is not installed, but not strictly necessary unless specific browser-side hashing is required.
*   **Audit Result**: ✅ **Ready**. Native `require('crypto')` can handle the MoMo signature generation.

---

## 3. Payment Model Detail
**Source**: `backend/prisma/schema.prisma`

### Current Fields:
*   `id` (Int)
*   `studentId` (Int)
*   `amount` (Float)
*   `status` (String - PENDING, COMPLETED, etc.)
*   `provider` (String)
*   `isRead` (Boolean)

### Missing MoMo-Specific Fields:
To properly track and verify MoMo transactions, the following fields are **MISSING** from the `Payment` model:
1.  `orderId`: Unique ID sent to MoMo (usually `BP_PAYMENT_ID`).
2.  `requestId`: Unique request ID for MoMo tracking.
3.  `transId`: The transaction ID returned by MoMo after successful payment.
4.  `payUrl`: Stored temporary payment link (optional but helpful).

---

## 4. Endpoint Mapping
**File**: `backend/src/controllers/paymentController.js`

The integration flow should transition as follows:
1.  **Phase A (Price Verification)**: Already implemented. Sums prices from the DB.
2.  **Phase B (Pre-Payment Recording)**: 🟢 **Transition Point**. Create the `Payment` record with status `PENDING` before calling the gateway.
3.  **Phase C (Gateway Request)**: Call MoMo API with the `verifiedTotalAmount` and the `payment.id` as the `orderId`.
4.  **Phase D (Response)**: Return MoMo's `payUrl` to the frontend instead of an "Instant Success" message.

---

## 5. Intended Redirect URLs
For the MoMo configuration, we will use:
*   **Redirect URL (User View)**: `http://localhost:5174/order-completed/`
    *   *User lands here after finishing the MoMo transaction.*
*   **IPN URL (Server-to-Server)**: `http://localhost:5000/api/payments/momo-ipn`
    *   *MoMo sends a POST request here to confirm payment even if the user closes their browser.*

**Auditor Signature:** Senior Backend Architect - BandPath Development Team
