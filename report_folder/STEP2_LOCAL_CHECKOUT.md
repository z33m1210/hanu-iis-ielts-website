# Step 2: Local Mock Checkout Audit

This report outlines the current state of the backend payment and fulfillment logic to facilitate a pivot from MoMo to a Local Mock Checkout system.

## Fulfillment Logic Status

- **Enrollment Creation**: Yes. In `paymentController.js` (Lines 70-82), the system currently creates `Enrollment` records linked to the `Payment` ID. However, because the `Payment` is created with `status: 'PENDING'`, these enrollments are effectively "unpaid."
- **Status Transition**: **MISSING**. There is currently no logic in the backend that updates `Payment.status` from `PENDING` to `COMPLETED`. The flow stops after requesting the MoMo URL.
- **Fulfillment Trigger**: In a real flow, this would happen in an `IPN` (Instant Payment Notification) listener. For the Local Mock, we will move this logic directly into the checkout handler.

## Email Service Status

- **Service Readiness**: The `emailService.js` is fully implemented and configured to use Gmail/SMTP.
- **Automatic Trigger**: **NO**. The `sendEmail` function is imported but never called in the checkout or payment flow.
- **Requirement**: Once the status hits `COMPLETED`, we should trigger `emailService.sendEmail`.

## Frontend Success Path

- **Current Behavior**: Redirects to `response.payUrl` (MoMo Gateway).
- **Intended Path**: The user should be redirected to a dedicated success page, such as `/order-completed/`.
- **Session Data**: The frontend already prepares `sessionStorage.setItem('last_purchase', ...)` (Lines 98-101), which is used to populate the receipt on the success page.

## Transaction Integrity

- **Current State**: The code currently performs two separate database operations:
    1. `prisma.payment.create`
    2. `prisma.enrollment.upsert` (multi-row)
- **Risk**: If the server crashes or the DB connection drops between these two calls, the user could be charged without being enrolled, or vice-versa.
- **Fix**: Wrap both operations in `prisma.$transaction([])` for the Local Mock implementation.

## Current "Success" Handler Snippet
This is the part of the code that needs to be refactored into a "Local Success" flow:

```javascript
// backend/src/controllers/paymentController.js (Lines 127-138)
if (momoData.resultCode === 0 && momoData.payUrl) {
    // Phase D: Update PayUrl and Handover
    await prisma.payment.update({
        where: { id: payment.id },
        data: { payUrl: momoData.payUrl }
    });

    return res.json({ 
        success: true, 
        message: 'Redirecting to MoMo...', 
        payUrl: momoData.payUrl 
    });
}
```

## Next Step Recommendation
We will replace the MoMo fetch call with a direct "Instant Fulfillment" block that updates the database immediately for local testing.
