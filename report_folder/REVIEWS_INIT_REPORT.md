# My Reviews Feature Initialization Report

**Project:** Hanu-IIS IELTS Website (BandPath)  
**Role:** Lead Developer Analysis  
**Date:** 2026-04-25  

---

## 1. Database Schema Check
The `Review` model is already defined in `backend/prisma/schema.prisma`.

### Fields:
- `id`: Int (Auto-incrementing ID)
- `userId`: Int (Link to User)
- `courseId`: Int (Link to Course)
- `rating`: Int (Default: 5)
- `comment`: String (Optional)
- `createdAt`: DateTime (Default: now)

### Relationships:
- **User ↔ Review:** One-to-Many (`User.reviews[]`).
- **Course ↔ Review:** One-to-Many (`Course.reviews[]`).
- **Constraint:** `@@unique([userId, courseId])` – Ensures a user can only leave one review per course.

---

## 2. API & Controller Audit
Located: `backend/src/controllers/reviewController.js` and `backend/src/routes/reviewRoutes.js`.

### Existing Endpoints:
- `GET /api/reviews/:courseId`: Fetches reviews for a specific course.
- `GET /api/reviews/:courseId/can-review`: Checks if current user can review (buyer check).
- `POST /api/reviews/`: Creates or updates a review.

### Gap Analysis:
- **Missing:** There is currently **no endpoint** to fetch reviews written by the logged-in user (e.g., `GET /api/reviews/my`).
- **Required Action:** Implement `exports.getMyReviews` in `reviewController.js` and register it in `reviewRoutes.js`.

---

## 3. HTML Structure Check
File: `frontend/profile/index.html`

### Current State:
- A placeholder sidebar item exists: `<div id="func5"><p>My Reviews</p></div>`.
- **Missing:** No content container for reviews in the tab panels.

### Suggestion:
Insert the following block after the `#tab-purchases` panel (around line 120):

```html
<div id="tab-reviews" class="tab-panel">
    <div class="my-reviews-section" style="grid-column: 1 / -1; margin-top: 40px;">
        <h2 style="font-size: 24px; margin-bottom: 20px; color: #0f172a;">My Reviews</h2>
        <div id="my-reviews-container" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 24px;">
            <p style="color: #64748b;">Loading your reviews...</p>
        </div>
    </div>
</div>
```

---

## 4. Tab Switching Logic
File: `frontend/profile/profile.js`

### Current `switchTab` Code:
```javascript
window.switchTab = function(tab) {
    const profilePanel   = document.getElementById('tab-profile');
    const purchasesPanel = document.getElementById('tab-purchases');
    const func1          = document.getElementById('func1');
    const func2          = document.getElementById('func2');

    if (tab === 'profile') {
        if (profilePanel)   profilePanel.classList.add('active');
        if (purchasesPanel) purchasesPanel.classList.remove('active');
        if (func1) func1.classList.add('active-tab');
        if (func2) func2.classList.remove('active-tab');
    } else {
        if (profilePanel)   profilePanel.classList.remove('active');
        if (purchasesPanel) purchasesPanel.classList.add('active');
        if (func1) func1.classList.remove('active-tab');
        if (func2) func2.classList.add('active-tab');
    }
};
```

### Proposed 3-State Logic:
We will refactor this to handle the `'reviews'` state and sync with `func5`.

```javascript
window.switchTab = function(tab) {
    // 1. Define all panels and buttons
    const panels = {
        'profile':   document.getElementById('tab-profile'),
        'purchases': document.getElementById('tab-purchases'),
        'reviews':   document.getElementById('tab-reviews')
    };
    const buttons = {
        'profile':   document.getElementById('func1'),
        'purchases': document.getElementById('func2'),
        'reviews':   document.getElementById('func5')
    };

    // 2. Toggle classes
    Object.keys(panels).forEach(key => {
        if (panels[key]) {
            key === tab ? panels[key].classList.add('active') : panels[key].classList.remove('active');
        }
        if (buttons[key]) {
            key === tab ? buttons[key].classList.add('active-tab') : buttons[key].classList.remove('active-tab');
        }
    });

    // 3. Lazy load reviews if selected
    if (tab === 'reviews' && typeof loadMyReviews === 'function') {
        loadMyReviews();
    }
};
```
