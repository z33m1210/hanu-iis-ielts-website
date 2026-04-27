# FULFILLMENT_TECH_REPORT (RESOLVED)

This report provides a technical analysis of the current Order Management System and the approved implementation plan for the fulfillment workflow.

## 1. Database State (`schema.prisma`)
The current system uses a `Payment` model to track transactions. 

```prisma
model Payment {
  id        Int      @id @default(autoincrement())
  studentId Int
  amount    Float
  status    String   @default("PENDING") // PENDING, COMPLETED, FAILED
  provider  String? // VNPay, MoMo
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  student   User @relation(fields: [studentId], references: [id])
  isRead    Boolean  @default(false)
  enrollments Enrollment[]
}
```

**Key Observations:**
- **Status Field:** Currently only supports `PENDING`, `COMPLETED`, and `FAILED`. 
- **Update Required:** We will add a `FULFILLED` status to differentiate between paid and delivered orders.
- **isRead Flag:** Will be maintained to highlight new activity.

## 2. Controller Logic

### Checkout Logic (`paymentController.js`)
Currently, `processCheckout` marks payments as `COMPLETED`. 
**Plan:** Post-payment, we will trigger an internal event or hook that prepares the order for fulfillment.

### Admin Management (`adminController.js`)
Currently handles viewing and reading orders.
**Plan:** 
- Add a `fulfillOrder` endpoint that sends the Gmail notification.
- Update `getOrders` to support filtering by `COMPLETED` (Pending) vs `FULFILLED` (Sent).

## 3. Dependencies (`package.json`)
**Decision:** We will install `nodemailer` to handle Gmail SMTP communication.

## 4. Admin UI Context (`admin/orders.html`)
**Decision:** 
- Add a "Fulfill Order" button in the Action column.
- Clicking the button will open a prompt/modal for the Google Drive link.
- On success, the row will move to a "Fulfilled" view/tab.

---

## 5. Resolved User Requirements

### Q1: Email Service
**Answer:** Gmail.
**Implementation:** We will use a Gmail account with an App Password via Nodemailer.

### Q2: Fulfillment Workflow
**Answer:** Both.
**Implementation:** The system will update the order status to `FULFILLED` **and** the UI will move these orders to a separate list/tab to keep the main view clean.

### Q3: Link Persistence
**Answer:** No.
**Implementation:** The Google Drive link will be sent via email but **will not** be stored in the database.
