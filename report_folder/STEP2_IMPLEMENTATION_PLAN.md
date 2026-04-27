# Implementation Plan - Local Mock Checkout & Fulfillment

This plan outlines the steps to pivot from MoMo's external gateway to a Local Mock Checkout system. This will allow for testing the end-to-end enrollment and email fulfillment flow without external dependencies.

## User Review Required

> [!IMPORTANT]
> The checkout flow will now skip MoMo and immediately fulfill the order. This is for development and testing purposes only.

- **Instant Enrollment**: Users will be granted access to courses immediately upon clicking "Place Order".
- **Mock Success Page**: Users will be redirected to `/order-completed/` instead of an external MoMo URL.

## Proposed Changes

### Backend: Payment Controller

#### [MODIFY] [paymentController.js](file:///d:/Demo_web/New%20folder/hanu-iis-ielts-website/backend/src/controllers/paymentController.js)
- Remove MoMo-specific `axios` calls and signature logic for the `local` flow.
- Implement `prisma.$transaction` to handle `Payment` and `Enrollment` creation atomically.
- Set `Payment.status` to `COMPLETED` immediately.
- Integrate `emailService.sendEmail` to send a receipt upon successful local fulfillment.
- Return a `redirectUrl` pointing to the frontend success page.

### Frontend: Checkout Script

#### [MODIFY] [checkout.js](file:///d:/Demo_web/New%20folder/hanu-iis-ielts-website/frontend/checkout/checkout.js)
- Update `handleCheckout` to check for `response.redirectUrl` (local) in addition to `response.payUrl` (MoMo).
- Add logic to handle the immediate success response and redirect to the internal success page.

## Verification Plan

### Automated Tests
- Trigger a checkout using the "Place Order" button.
- Verify in the database that:
    - A `Payment` record exists with `status: 'COMPLETED'`.
    - `Enrollment` records exist for all purchased courses.
- Check the server console for "Email sent" confirmation.

### Manual Verification
- Confirm the browser redirects to the Order Completed page.
- Log in as the user and verify that the purchased courses now appear in the "Purchases" tab of the profile.
