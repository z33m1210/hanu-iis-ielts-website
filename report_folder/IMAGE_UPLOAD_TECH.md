# IMAGE_UPLOAD_TECH — Implementation Specification

**Lead Developer Report: Avatar Upload Feature — Local Storage + Instant Update**
**Generated:** 2026-04-25

---

## 1. Backend Environment Check

### 1.1 Multer Status
**❌ Multer is NOT installed.**

Confirmed by scanning `backend/package.json`:
```json
"dependencies": {
  "@prisma/client": "^5.22.0",
  "cors":           "^2.8.6",
  "dotenv":         "^17.4.0",
  "express":        "^5.2.1",
  "joi":            "^18.1.2",
  "nodemailer":     "^8.0.6"
}
```

### Installation Command
```bash
cd "d:\Demo_web\New folder\hanu-iis-ielts-website\backend"
npm install multer
```

---

### 1.2 Storage Directory Structure

Place uploaded files under **`backend/public/uploads/avatars/`** — a subfolder of `public/` so Express can serve the entire directory as static files with a single line.

```
backend/
└── public/
    └── uploads/
        └── avatars/
            ├── avatar-1.jpg       ← User ID 1
            ├── avatar-2.png       ← User ID 2
            └── avatar-42.webp     ← User ID 42
```

> This directory does NOT need to be created manually. The Multer config below creates it automatically with `fs.mkdirSync(..., { recursive: true })`.

---

## 2. Database Schema Update

### 2.1 Schema Status
**✅ `avatarUrl` ALREADY EXISTS in `schema.prisma` (L15). No changes needed.**

```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  password  String
  name      String?
  avatarUrl String?   // ← ALREADY PRESENT
  role      String   @default("USER")
  ...
}
```

Since the field already exists and `prisma db push` has already been run, the database column exists. **Skip to Section 3.**

> If you ever need to re-sync (e.g., fresh database), use:
> ```bash
> npx prisma db push
> ```

---

## 3. Endpoint Design — `POST /api/users/:id/upload-avatar`

### 3.1 Endpoint Specification

| Property | Value |
|---|---|
| **Method** | `POST` |
| **URL** | `/api/users/:id/upload-avatar` |
| **Auth** | Required (JWT via `authenticateToken`) |
| **Content-Type** | `multipart/form-data` |
| **Field Name** | `avatar` |
| **Max File Size** | 2 MB |
| **Allowed Types** | `image/jpeg`, `image/png`, `image/webp` |
| **File Naming** | `avatar-{userId}.{ext}` (overwrites old file automatically) |

---

### 3.2 Implementation Code

**Add to `backend/src/controllers/userController.js`:**

```javascript
const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

// ── Multer storage config ──────────────────────────────────────
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../../public/uploads/avatars');
    fs.mkdirSync(dir, { recursive: true }); // auto-create if missing
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    // Rename to avatar-{userId}.ext — overwrites old file, no duplicates
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `avatar-${req.params.id}${ext}`);
  }
});

const avatarUpload = multer({
  storage: avatarStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only .jpg, .png, and .webp images are allowed.'), false);
    }
  }
});

// ── Upload Avatar Handler ──────────────────────────────────────
exports.uploadAvatar = [
  avatarUpload.single('avatar'),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No image file received.' });
      }

      // Authorization: users can only update their own avatar
      if (req.user.role !== 'ADMIN' && req.user.id !== parseInt(req.params.id)) {
        return res.status(403).json({ success: false, message: 'Access denied.' });
      }

      // Build the public URL path the frontend will use to load the image
      const avatarUrl = `/uploads/avatars/${req.file.filename}`;

      // Persist avatarUrl in the database
      const updatedUser = await prisma.user.update({
        where: { id: parseInt(req.params.id) },
        data: { avatarUrl },
        select: { id: true, name: true, avatarUrl: true }
      });

      res.json({ success: true, avatarUrl: updatedUser.avatarUrl });

    } catch (error) {
      next(error);
    }
  }
];
```

---

### 3.3 Route Registration

**Modify `backend/src/routes/userRoutes.js`:**

```javascript
const express = require('express');
const router  = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middlewares/authMiddleware');

router.get('/:id',                  authenticateToken, userController.getUserProfile);
router.put('/:id',                  authenticateToken, userController.updateUserProfile);
router.post('/:id/upload-avatar',   authenticateToken, userController.uploadAvatar);  // ← ADD THIS

module.exports = router;
```

---

### 3.4 Static File Serving

**Modify `backend/src/server.js` — add ONE line after the existing static middleware:**

```javascript
// Existing static frontend serving (keep this)
app.use(express.static(path.join(__dirname, '../../frontend')));

// ← ADD THIS: serve uploaded avatars at /uploads/avatars/avatar-{id}.jpg
app.use('/uploads', express.static(path.join(__dirname, '../../public/uploads')));
```

This means an uploaded file at `backend/public/uploads/avatars/avatar-42.jpg`
will be accessible at: `http://localhost:5000/uploads/avatars/avatar-42.jpg`

---

## 4. Frontend "Instant Update" Logic

### 4.1 HTML — Hidden File Input

In `frontend/profile/index.html`, the `#upload-btn` already exists. Add a **hidden `<input type="file">`** adjacent to it:

```html
<!-- BEFORE (current) -->
<button id="upload-btn">Upload Image</button>

<!-- AFTER -->
<input type="file"
       id="prof-avatarFileInput"
       accept=".jpg,.jpeg,.png,.webp"
       style="display:none;"
       aria-label="Upload profile picture">
<button id="upload-btn">Upload Image</button>
```

---

### 4.2 JavaScript — `profile.js` Upload Logic

Replace the current `#upload-btn` placeholder handler with this complete implementation:

```javascript
// ── Avatar upload: trigger hidden input on button click ───────
const uploadBtn       = document.getElementById('upload-btn');
const avatarFileInput = document.getElementById('prof-avatarFileInput');

if (uploadBtn && avatarFileInput) {
    // Click the button → open the OS file picker
    uploadBtn.addEventListener('click', () => {
        avatarFileInput.click();
    });

    // File selected → upload immediately without waiting for "Save"
    avatarFileInput.addEventListener('change', async () => {
        const file = avatarFileInput.files[0];
        if (!file) return;

        // Client-side type guard (belt-and-suspenders on top of multer)
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            showToast('Only JPG, PNG, or WebP images are allowed.', '#dc2626');
            return;
        }

        // Build FormData — field name must match multer's upload.single('avatar')
        const formData = new FormData();
        formData.append('avatar', file);

        uploadBtn.textContent = 'Uploading...';
        uploadBtn.disabled    = true;

        try {
            const session = Auth.getSession();
            const token   = session?.token;

            const response = await fetch(`/api/users/${session.id}/upload-avatar`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                    // NOTE: Do NOT set Content-Type here.
                    // The browser sets it automatically with the correct boundary
                    // for multipart/form-data when using FormData.
                },
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                const fullAvatarUrl = `http://localhost:5000${data.avatarUrl}`;

                // ── Instant Update 1: Sidebar avatar circle → real image
                const avatarCircle = document.getElementById('prof-avatar-circle');
                if (avatarCircle) {
                    avatarCircle.innerHTML  = `<img src="${fullAvatarUrl}"
                        style="width:100%; height:100%; border-radius:50%; object-fit:cover;"
                        onerror="this.parentElement.textContent='${(session.firstName||'?').charAt(0).toUpperCase()}'">`;
                }

                // ── Instant Update 2: Profile page preview image
                const imgPreview = document.getElementById('prof-imgPreview');
                if (imgPreview) imgPreview.src = fullAvatarUrl;

                // ── Instant Update 3: Update session so header re-renders correctly
                const newSession = Auth.getSession();
                if (newSession) {
                    newSession.avatarUrl = data.avatarUrl;
                    localStorage.setItem('bandpath_session', JSON.stringify(newSession));
                }

                // ── Instant Update 4: Header avatar (if header-auth.js re-renders)
                // The header avatar is an initials circle injected by header-auth.js.
                // Force a re-render by calling initHeader if exposed, else update DOM directly.
                const headerAvatar = document.querySelector('.ava-header');
                if (headerAvatar) {
                    headerAvatar.innerHTML = `<img src="${fullAvatarUrl}"
                        style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;
                }

                showToast('Profile picture updated!', '#16a34a');
            } else {
                showToast(data.message || 'Upload failed.', '#dc2626');
            }
        } catch (err) {
            console.error('Avatar upload error:', err);
            showToast('Upload error. Please try again.', '#dc2626');
        } finally {
            uploadBtn.textContent = 'Upload Image';
            uploadBtn.disabled    = false;
            avatarFileInput.value = ''; // Reset so same file can be re-selected
        }
    });
}
```

---

## 5. Verification Checklist

After implementation, verify the following:

| # | Test | Expected Result |
|---|---|---|
| 1 | `npm install multer` completes | `node_modules/multer` exists |
| 2 | Click `#upload-btn` | OS file picker opens |
| 3 | Select a `.jpg` file | Upload starts immediately, no "Save" needed |
| 4 | Network tab in DevTools | `POST /api/users/42/upload-avatar` returns `200 { success: true, avatarUrl: "/uploads/avatars/avatar-42.jpg" }` |
| 5 | File exists on disk | `backend/public/uploads/avatars/avatar-42.jpg` exists |
| 6 | Image is accessible via URL | `http://localhost:5000/uploads/avatars/avatar-42.jpg` loads in browser |
| 7 | Sidebar avatar updates | Initials circle replaced by uploaded photo **without page reload** |
| 8 | Profile preview updates | `#prof-imgPreview` shows new photo |
| 9 | Select a `.pdf` file | Toast: "Only JPG, PNG, or WebP images are allowed." — no upload |
| 10 | Select a file > 2MB | Server returns `400 / multer error` |

---

## 6. Implementation Order

```
Step 1: Backend
  ├── npm install multer
  ├── Add uploadAvatar export to userController.js
  ├── Add POST /:id/upload-avatar route to userRoutes.js
  └── Add app.use('/uploads', express.static(...)) to server.js

Step 2: HTML
  └── Add <input type="file" id="prof-avatarFileInput" style="display:none"> to index.html

Step 3: Frontend JS
  └── Replace upload-btn placeholder handler in profile.js with full logic above

Step 4: Test
  └── Follow verification checklist above
```
