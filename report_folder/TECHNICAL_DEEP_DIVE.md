# BandPath IELTS Platform: Deep Technical Deep-Dive

This document provides a low-level architectural analysis of the BandPath IELTS Platform, designed for technical onboarding and collaborative development.

---

## 1. Full Database Schema (`prisma/schema.prisma`)

The system uses **Prisma** as the ORM with a **SQLite** provider. Below is the complete schema defining models and relationships.

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  password  String
  name      String?
  avatarUrl String?
  role      String   @default("USER") // USER, ADMIN
  isActive  Boolean  @default(true)
  lastActive DateTime @default(now())

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  enrollments    Enrollment[]
  payments       Payment[]
  wishlist       Wishlist[]
  reviews        Review[]
  posts          Post[]
}

model Course {
  id            Int      @id @default(autoincrement())
  title         String
  description   String?
  price         Float    @default(0.0)
  originalPrice Float?
  rating        Float    @default(0.0)
  ratingCount   Int      @default(0)
  hours         Int      @default(0)
  lectures      Int      @default(0)
  level         String   @default("Beginner") // Beginner, Intermediate, Advanced, All Levels
  category      String   @default("full") // listening, reading, writing, speaking, full
  chapters      Int      @default(0)
  image         String?
  syllabus      String?  @default("[]") // JSON string storage
  isPublished   Boolean  @default(false)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  enrollments Enrollment[]
  wishlist    Wishlist[]
  reviews     Review[]
  faqs        FAQ[]
}

model Enrollment {
  id        Int      @id @default(autoincrement())
  studentId Int
  courseId  Int
  progress  Float    @default(0.0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  student User   @relation(fields: [studentId], references: [id])
  course  Course @relation(fields: [courseId], references: [id])

  @@unique([studentId, courseId])
}

model Review {
  id        Int      @id @default(autoincrement())
  userId    Int
  courseId  Int
  rating    Int      @default(5)
  comment   String?
  createdAt DateTime @default(now())

  user   User   @relation(fields: [userId], references: [id])
  course Course @relation(fields: [courseId], references: [id])

  @@unique([userId, courseId])
}

model FAQ {
  id        Int      @id @default(autoincrement())
  courseId  Int
  question  String
  answer    String
  createdAt DateTime @default(now())

  course Course @relation(fields: [courseId], references: [id])
}

model Payment {
  id        Int      @id @default(autoincrement())
  studentId Int
  amount    Float
  status    String   @default("PENDING") // PENDING, COMPLETED, FAILED
  provider  String? // VNPay, MoMo
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  student User @relation(fields: [studentId], references: [id])
}

model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String?
  type      String   @default("ARTICLE")
  status    String   @default("DRAFT")
  authorId  Int
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  author    User     @relation(fields: [authorId], references: [id])
}

model Wishlist {
  id        Int      @id @default(autoincrement())
  userId    Int
  courseId  Int
  createdAt DateTime @default(now())

  user   User   @relation(fields: [userId], references: [id])
  course Course @relation(fields: [courseId], references: [id])

  @@unique([userId, courseId])
}

model GlobalSettings {
  id              Int     @id @default(1)
  platformName    String  @default("BandPath IELTS")
  adminEmail      String  @default("admin@bandpath.edu")
  defaultLanguage String  @default("English (US)")
  maintenanceMode Boolean @default(false)
}

model Setting {
  key   String @id
  value String
}
```

---

## 2. Project Directory Structure

### Backend (`/backend`)
```text
backend/
├── prisma/
│   ├── schema.prisma       # Database definitions
│   └── seed.js             # Initial data setup
├── src/
│   ├── controllers/        # Business logic per module
│   │   ├── authController.js
│   │   ├── courseController.js
│   │   └── ...
│   ├── middlewares/        # Express middlewares (Auth, Error handling)
│   │   ├── authMiddleware.js
│   │   └── validateRequest.js
│   ├── models/
│   │   └── prismaClient.js  # Singleton Prisma instance
│   ├── routes/             # API endpoint definitions
│   │   ├── authRoutes.js
│   │   ├── courseRoutes.js
│   │   └── ...
│   ├── utils/              # Validation schemas and helpers
│   └── server.js           # App entry point
└── .env                    # Environment config
```

### Frontend (`/frontend`)
```text
frontend/
├── admin/                  # Admin Dashboard sub-app
├── auth.js                 # Central authentication service
├── cart.js                 # Shopping cart service (localStorage)
├── category/               # Course listing page
├── checkout/               # Payment/Checkout page
├── course/                 # Course details page
├── profile/                # User profile management
├── shopping-cart/          # Cart overview page
├── style.scss              # Global styles
└── vite.config.js          # Build configuration
```

---

## 3. Authentication Middleware (`authMiddleware.js`)

Authentication is handled via JWT. The middleware verifies the token, validates the user status in the database, and attaches the user object to `req.user`.

```javascript
const jwt = require('jsonwebtoken');
const prisma = require('../models/prismaClient');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ success: false, message: 'Access denied.' });

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) return res.status(403).json({ success: false, message: 'Invalid token.' });
    
    try {
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, email: true, role: true, isActive: true }
      });

      if (!user || !user.isActive) {
        return res.status(403).json({ success: false, message: 'Access denied.' });
      }

      req.user = user; // Attached for downstream controllers
      next();
    } catch (dbError) {
      return res.status(500).json({ success: false, message: 'Auth server error.' });
    }
  });
};
```

---

## 4. API Pattern: Courses Module

This section demonstrates the established **Model-Route-Controller** pattern using the Courses module as a reference.

### Route (`routes/courseRoutes.js`)
```javascript
const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { authenticateToken, requireRole } = require('../middlewares/authMiddleware');

router.get('/', courseController.getCourses); // Public
router.post('/', authenticateToken, requireRole(['ADMIN']), courseController.createCourse); // Admin only

module.exports = router;
```

### Controller Snippet (`controllers/courseController.js`)
```javascript
exports.getCourses = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    const where = { isPublished: true };
    
    if (category) where.category = category.toLowerCase();
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const courses = await prisma.course.findMany({ where });
    res.json({ success: true, courses });
  } catch (error) {
    next(error); // Passes to errorHandler middleware
  }
};
```

---

## 5. Required Environment Variables

To run the platform locally, ensure the following keys are present in your environment configuration.

### Backend (`/backend/.env`)
*   `PORT`: The port number for the Express server (e.g., `5000`).
*   `DATABASE_URL`: Connection string for Prisma (e.g., `file:./dev.db`).
*   `JWT_SECRET`: A secure string for signing JSON Web Tokens.

### Frontend
*   *Note*: The frontend currently assumes the API is available at the `/api` relative path (served via Vite proxy or backend static hosting). If using a separate API domain, a `VITE_API_URL` variable should be added to a `.env` file in the `/frontend` directory.
