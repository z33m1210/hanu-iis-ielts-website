# Project Status: BandPath IELTS Platform

**Current Status**: Development Phase (MVP Core Logic Implemented)  
**Last Updated**: April 25, 2026  
**Confidentiality**: Technical Onboarding Document

---

## 1. System Architecture

The project follows a decoupled **Full-Stack JavaScript** architecture with a centralized backend and a modern, high-performance frontend.

*   **Frontend**:
    *   **Core**: Vanilla JavaScript (ES6+) for logic.
    *   **Build Tool**: Vite 5.x.
    *   **Styling**: SCSS (Sass) compiled to CSS.
    *   **Architecture**: Multi-page application structure with shared services (`auth.js`, `cart.js`, `wishlist-service.js`).
*   **Backend**:
    *   **Framework**: Node.js with Express 5.x.
    *   **ORM**: Prisma 5.22.0.
    *   **Validation**: Joi (Request schema validation).
    *   **Security**: JWT (Authentication), Bcrypt (Password hashing), CORS.
*   **Database**:
    *   **Type**: Relational (SQLite for development).
    *   **Provider**: Prisma Client.
*   **Hosting**:
    *   **Current**: Local development (`localhost:5173` for frontend, `localhost:5000` for API).

---

## 2. Feature Audit

| Feature | Status | Details |
| :--- | :--- | :--- |
| **Authentication** | ✅ Completed | Register, Login (JWT), Logout, Password Recovery. |
| **Course Discovery** | ✅ Completed | Top courses API, category listing, course detail view. |
| **Shopping Cart** | ✅ Completed | LocalStorage based management, subtotal/tax calculations. |
| **Wishlist** | ✅ Completed | Persistent wishlist saved to database via API. |
| **Checkout Logic** | ✅ Completed | Robust transaction logic with atomic rollbacks implemented. |
| **User Profile** | 🟠 Partial | UI structures exist; basic data update logic implemented. |
| **Admin Dashboard** | 🟠 Partial | Backend CRUD for courses/users done; Frontend UI in progress. |
| **Automated Testing**| ✅ Completed | E2E (Playwright), Backend (Jest), and Frontend (Vitest) configured. |
| **Search Engine** | ❌ Missing | Search bar UI exists but lacks backend filtering integration. |
| **Course Content Player** | ❌ Missing | Syllabus logic exists in schema but player UI is pending. |

---

## 3. Database Schema (Prisma)

The database consists of 10 main tables handling core LMS logic.

### Core Tables
- **User**: Authentication, roles (USER/ADMIN), and profile metadata.
- **Course**: Title, price, rating, level (Beginner to Advanced), and syllabus storage.
- **Enrollment**: Junction table connecting `User` and `Course` with progress tracking.
- **Payment**: Transaction logs (amount, status, mock provider).

### Interactive Tables
- **Review**: Course ratings and comments from students.
- **Wishlist**: Tracks saved courses per user.
- **FAQ**: Course-specific frequently asked questions.
- **Post**: Blog/Article content management.

### Configuration
- **GlobalSettings**: Platform-wide settings (Name, Admin Email).
- **Setting**: Key-value pair storage for flexible configuration.

---

## 4. API Map (REST)

Base URL: `/api`

| Method | Endpoint | Description | Status |
| :--- | :--- | :--- | :--- |
| **POST** | `/auth/register` | User sign up | ✅ Active |
| **POST** | `/auth/login` | JWT Issue | ✅ Active |
| **GET** | `/courses` | List all courses | ✅ Active |
| **GET** | `/courses/:id` | Detailed course info | ✅ Active |
| **POST** | `/courses` | Create course (Admin) | ✅ Active |
| **POST** | `/payments/checkout` | Process mock payment | ✅ Active |
| **GET** | `/wishlist` | Get user's saved items | ✅ Active |
| **PUT** | `/admin/settings` | Update global config | ✅ Active |

---

## 5. Next Steps

Based on current gaps, the most logical next tasks are:

1.  **Frontend Search Implementation**: Connect the header search bar to a new `/api/courses/search` endpoint or filter the existing `/api/courses` list.
2.  **Category Filtering**: Enhance the `category/index.html` logic to dynamically filter courses based on the URL parameter (e.g., `?cat=listening`).
3.  **Admin UI**: Complete the "Add Course" modal in the admin panel to allow content managers to upload course images and set levels.
4.  **Payment Gateway Integration**: Move from mock transactions to real VNPay/MoMo integration.

---

## 6. Code Context

### Main Configuration (`backend/package.json`)
```json
{
  "dependencies": {
    "@prisma/client": "^5.22.0",
    "cors": "^2.8.6",
    "dotenv": "^17.4.0",
    "express": "^5.2.1",
    "joi": "^18.1.2"
  },
  "devDependencies": {
    "bcrypt": "^6.0.0",
    "jsonwebtoken": "^9.0.3",
    "prisma": "^5.22.0"
  }
}
```

### Core Payment Logic (Atomic Transactions)
```javascript
exports.processCheckout = async (req, res, next) => {
  const studentId = req.user.id;
  const { courseIds, amount } = req.body;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the Payment record
      const payment = await tx.payment.create({
        data: {
          studentId,
          amount: parseFloat(amount),
          status: 'COMPLETED',
          provider: 'MOCK_STRIPE'
        }
      });

      // 2. Create/Upsert Enrollments
      for (const courseId of courseIds) {
        await tx.enrollment.upsert({
          where: { studentId_courseId: { studentId, courseId: parseInt(courseId) } },
          update: {},
          create: { studentId, courseId: parseInt(courseId) }
        });
      }

      return payment;
    });

    res.json({ success: true, paymentId: result.id });
  } catch (error) {
    next(error); // Automatic rollback on failure
  }
};
```
