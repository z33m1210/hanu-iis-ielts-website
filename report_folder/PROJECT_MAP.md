# BandPath IELTS Platform Map

This document serves as the master technical reference for the BandPath IELTS platform, documenting directory structure, API routing, database schema, and asset management as of the latest **Clean URL Refactor**.

---

## 1. Directory Structure (Clean URL State)

The frontend uses a directory-based routing system (e.g., `/admin/orders/` serves `admin/orders/index.html`) to ensure clean URLs.

### Frontend Structure (`frontend/`)
```text
frontend/
├── index.html              # Main Landing Page
├── style.css               # Global Styles
├── auth.js                 # Global Authentication Service
├── header-auth.js          # Shared Header & Auth UI Logic
├── free-trial/             # Anonymous Placement Quiz
│   ├── index.html          # Pro-Exam Split View
│   └── quiz.js             # Section-based Quiz Logic
├── category/               # Course Listing & Filtering
│   ├── index.html
│   └── category.js
├── course/                 # Single Course View
│   └── index.html
├── admin/                  # Dashboard & Management
│   ├── index.html          # Admin Dashboard
│   ├── admin.css           # Standardized Admin Styling
│   ├── common.js           # Shared Admin Sidebar/Layout Logic
│   ├── quiz.html           # Quiz Manager (Modals & Grouping)
│   ├── quiz.js             # Admin Quiz Logic (Multer Integration)
│   ├── orders.html         # Order Management (Migration Pending to index.html)
│   ├── users/              # User Management [Clean URL]
│   │   └── index.html
│   ├── courses/            # Course Management [Clean URL]
│   │   └── index.html
│   └── settings/           # Global Platform Settings
│       └── index.html
└── public/                 # Static Assets (Logos, Icons)
```

### Backend Structure (`backend/`)
```text
backend/
├── prisma/
│   └── schema.prisma       # Database Models & Relationships
├── src/
│   ├── server.js           # Express App Entry & Static Hosting
│   ├── routes/             # API Endpoint Definitions
│   ├── controllers/        # Business Logic
│   ├── middlewares/        # Auth & Error Handlers
│   └── utils/              # Helper Functions
└── public/uploads/         # Server-side persistent storage
```

---

## 2. API Route Map

All routes are prefixed with `/api`.

### Quiz Service (`quizRoutes.js`)
| Method | Endpoint | Controller Action | Access |
| :--- | :--- | :--- | :--- |
| **GET** | `/quiz` | `getQuestions` | Public |
| **POST** | `/quiz/check` | `checkAnswers` | **Secure (Full Quiz)** |
| **GET** | `/quiz/admin/all` | `adminGetQuestions` | Admin Only |
| **POST** | `/quiz/admin/create` | `adminCreateQuestion` | Admin Only |
| **PUT** | `/quiz/admin/update/:id`| `adminUpdateQuestion` | Admin Only |
| **DELETE**| `/quiz/admin/delete/:id`| `adminDeleteQuestion` | Admin Only |
| **POST** | `/quiz/admin/upload` | `uploadQuizAudio` | Admin Only |

### Course Service (`courseRoutes.js`)
| Method | Endpoint | Controller Action | Access |
| :--- | :--- | :--- | :--- |
| **GET** | `/courses` | `getCourses` | Public |
| **GET** | `/courses/top` | `getTopCourses` | Public |
| **GET** | `/courses/:id` | `getCourseById` | Public |
| **POST** | `/courses` | `createCourse` | Admin Only |
| **PUT** | `/courses/:id` | `updateCourse` | Admin Only |
| **DELETE**| `/courses/:id` | `deleteCourse` | Admin Only |

### User Service (`userRoutes.js`)
| Method | Endpoint | Controller Action | Access |
| :--- | :--- | :--- | :--- |
| **GET** | `/users/:id` | `getUserProfile` | User (Self) |
| **PUT** | `/users/:id` | `updateUserProfile` | User (Self) |
| **POST** | `/users/:id/upload-avatar` | `uploadAvatar` | User (Self) |

---

## 3. Database Schema Snapshot (Prisma)

### `QuizQuestion` Model
The core model for the Free Trial assessment.
- **id**: `Int` (Auto-increment)
- **type**: `String` ('MCQ' | 'SHORT_ANSWER')
- **questionText**: `String`
- **options**: `String?` (JSON string storage for MCQ choices)
- **correctAnswer**: `String`
- **audioUrl**: `String?` (Link to hosted listening asset)
- **sectionId**: `String?` (Grouping tag for Listening Sections)

### `Course` Model
- **id**: `Int`
- **title**: `String`
- **price**: `Float`
- **category**: `String` (listening, reading, writing, speaking, full)
- **image**: `String?` (Thumbnail URL)
- **isPublished**: `Boolean`

### `User` Model
- **id**: `Int`
- **email**: `String` (Unique)
- **role**: `String` ('USER' | 'ADMIN')

---

## 4. Asset & Upload Paths

The backend serves the `public/uploads` directory at the `/uploads` URL prefix.

| Asset Type | Storage Path | Access URL Prefix |
| :--- | :--- | :--- |
| **Course Thumbnails** | `public/uploads/courses/` | `/uploads/courses/` |
| **Listening Audio** | `public/uploads/audio/` | `/uploads/audio/` |
| **Student Avatars** | `public/uploads/avatars/` | `/uploads/avatars/` |
| **Documents** | `public/uploads/documents/` | `/uploads/documents/` |

---

## 5. Shared Components

### Admin Suite
- **Layout**: The Admin Panel uses a standardized 2-column layout (Sidebar + Content).
- **Standardized Sidebar**: Managed via `frontend/admin/common.js`. It dynamically highlights the active tab and provides role-based navigation.
- **Global Admin CSS**: Located at `frontend/admin/admin.css`. Contains standardized cards, buttons, and form layouts.
- **Auth Integration**: `frontend/auth.js` provides `fetchWithAuth`, ensuring all admin requests include the JWT bearer token.

### Public Header
- **Dynamic Header**: Located at `frontend/header-auth.js`. Synchronizes user session state across the entire platform, including cart counts and login/profile visibility.

---

**Verification Status**: All paths verified for `Clean URL` integrity. Refactor of `admin/orders.html` to `admin/orders/index.html` is the next structural priority.
