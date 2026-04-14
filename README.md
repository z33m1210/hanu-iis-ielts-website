# BandPath IELTS Platform

A modern IELTS preparation platform with a Node.js backend (Express & Prisma) and a Vite-powered frontend.

## 🚀 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/)

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Copy the example file to a new `.env` file:
   ```bash
   cp .env.example .env
   ```
4. Initialize the database (SQLite):
   ```bash
   npx prisma migrate dev --name init
   ```
4. **Seed the database** (Create the Admin account):
   ```bash
   npx prisma db seed
   ```
5. Start the backend server:
   ```bash
   npm run dev
   ```
   The backend will run on `http://localhost:5000`.

### 3. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend dev server:
   ```bash
   npm run dev
   ```
   The frontend will run on `http://localhost:5174`.

## 🔑 Default Credentials

After running the seed command, you can log in with:

| Account Type | Email/Username | Password |
| :--- | :--- | :--- |
| **Admin** | `admin` | `123456` |
| **Test Student** | `student@test.com` | `password123` |

## 🛠 Tech Stack
- **Frontend**: Vite, Sass, Vanilla JS
- **Backend**: Node.js, Express
- **Database**: SQLite (via Prisma ORM)
