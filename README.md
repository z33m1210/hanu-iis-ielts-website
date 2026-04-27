# BandPath IELTS – A 3-Column Pro-Exam Platform

BandPath IELTS is a premium, high-performance learning management system specifically engineered for the rigors of IELTS preparation. It features a state-of-the-art "Stitch" design aesthetic, focused on delivering a distraction-free, academic-grade testing environment.

## 🌟 Key Features

### 1. Adaptive Pro-Exam UI
The platform physically transforms its structure based on the test category to maximize student focus:
- **Reading Mode**: A balanced 50/50 split-screen layout featuring a high-fidelity PDF/Document viewer on the left and a scrollable interaction panel on the right.
- **Listening Mode**: A full-width, centered interaction panel with a fixed "Sticky Audio Footer" that provides seamless playback control while navigating questions.

### 2. Advanced Navigation & Review
- **Dropdown Review Panel**: A sophisticated overlay that tracks the status of every question (Answered vs. Unanswered) and allows for instantaneous jumping between sections without losing context.
- **Strict 100vh Layout**: A professional dashboard experience with zero page-level scrolling, ensuring all controls remain fixed and accessible at all times.

### 3. Comprehensive Admin Control
- **Category-Locked Management**: Admins can manage Reading and Listening assets independently.
- **Automated Section Grouping**: The system intelligently groups questions by `Section ID` (e.g., Passage 1, Section A), allowing for complex multi-resource exams.
- **Order Fulfillment**: A dedicated dashboard for tracking sales and manually fulfilling orders with external resource links.

---

## 🚀 Installation & Setup

Get the platform operational in under 5 minutes by following these steps:

### 1. Clone the Repository
```bash
git clone <repository-url>
cd hanu-iis-ielts-website
```

### 2. Backend Configuration
Navigate to the backend directory and install dependencies:
```bash
cd backend
npm install
```

Create your environment file:
```bash
cp .env.example .env
```
*Open `.env` and configure your `DATABASE_URL` (default is SQLite) and `EMAIL_APP_PASSWORD` for result notifications.*

Initialize the database and apply migrations:
```bash
npx prisma migrate dev
```

### 3. Frontend Configuration
Navigate to the frontend directory and install dependencies:
```bash
cd ../frontend
npm install
```

### 4. Launch the Platform
Start both servers (in separate terminals or using a runner):

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm run dev
```

---

## 🔐 Admin Onboarding

**Default Admin Credentials:**
- **Email/Username**: `admin`
- **Password**: `123456`

### First Steps for Administrators:
The platform is distributed without default seed data to ensure a clean slate for your institution. To begin:
1. **Access the Manager**: Log in as Admin and navigate to the **Free Trial Quiz** section.
2. **Category Selection**: Choose either **Listening** or **Reading**.
3. **Resource Upload**: Click **Add Question**. You must manually enter the URL for your MP3 (Listening) or PDF (Reading) resources. 
   > **Note**: We recommend uploading your media to the `/public/uploads/` directory on the server or using a CDN for production.
4. **Section Grouping**: Ensure questions belonging to the same passage or audio clip share the exact same **Section ID**. The UI will automatically group them into a cohesive test experience for the student.

---

## 🛠 Tech Stack
- **Frontend**: Vite, Vanilla JS, CSS (Stitch Design System)
- **Backend**: Node.js, Express, Prisma ORM
- **Database**: SQLite (Development) / PostgreSQL (Production ready)
- **Mailing**: Nodemailer (Gmail Integration)

---

## 📄 License
Internal Distribution Only.
