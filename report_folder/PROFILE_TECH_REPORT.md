# PROFILE_TECH_REPORT

**Lead Developer Report: Profile Page Current State Analysis**
**Generated:** 2026-04-25

---

## 1. Static Div Audit — Hardcoded Sections

The following elements in `profile/index.html` are **fully hardcoded** and not driven by any API or session data:

| Element | Selector / Location | Hardcoded Value | Action Required |
| :--- | :--- | :--- | :--- |
| **User Display Name** | `profile-header > p` (L42) | `"John Doe"` | Populate from session or API |
| **Profile Picture** | `profile-header > img` (L41) | `./Ellipse 53.png` (static file) | Replace with `avatarUrl` from API or initials |
| **Logo Brand Name** | `header .logo > span` (L17) | `"Byway"` | ⚠️ Must be renamed to `"BandPath"` |
| **Footer Brand Name** | `footer-logo > span` (L152) | `"Byway"` | ⚠️ Must be renamed to `"BandPath"` |
| **Footer Contact Address** | `contact-us` block (L177–179) | `123 Main Street, Anytown, CA` | Update to BandPath real address |
| **Footer Email** | `contact-us > p` (L179) | `bywayellu@webkul.in` | Update to `hello@bandpath.vn` |
| **Language Field** | `.lang input` (L85) | `placeholder="Label"` | Non-functional; no ID, no binding |
| **Social Link Fields** | `.lf1-input` – `.lf5-input` (L110–135) | All `placeholder="Label"` | Non-functional; no IDs, not saved |
| **Upload Image Button** | `#upload-btn` (L102) | Static button | No JS handler attached |

**Summary:** 9 sections are hardcoded or non-functional.

---

## 2. Current JS Logic — `profile.js`

### Authentication Guard
```javascript
if (typeof Auth === 'undefined' || !Auth.isLoggedIn()) {
    window.location.href = '../sign-in/';
}
```
✅ Correctly guards the page.

### User Data Fetch
The script calls **`GET /api/users/:id`** (by user ID from session), NOT `/api/users/me`:
```javascript
const session = Auth.getSession();
const userId = session.id;
const data = await Auth.fetchWithAuth(`/users/${userId}`);
```

**What it populates:**
- `#prof-firstName` ← splits `user.name` on space
- `#prof-lastName` ← remainder of the name
- `#prof-email` ← `user.email` (readonly)

**What it does NOT populate:**
- The sidebar display name (`<p>John Doe</p>`)
- The profile picture / avatar
- Language, website, or social link fields

**Bug detected:** Email is assigned twice (L36–37 are identical — redundant `emailEl.value = user.email`).

### Save Changes
Calls `PUT /api/users/:id` with a merged `name` string. After success, updates `localStorage` and reloads.

---

## 3. HTML Structure — Key IDs

```
profile/index.html
├── <header>
│   └── .func-bar         ← header-auth.js injects auth UI here
│
├── .profile-section      ← LEFT SIDEBAR
│   ├── .profile-header
│   │   ├── <img>         ⚠️ HARDCODED: ./Ellipse 53.png (no ID)
│   │   └── <p>           ⚠️ HARDCODED: "John Doe" (no ID)
│   └── .profile-func
│       ├── #func1        "Profile" tab
│       ├── #func2        "My Purchases" tab
│       ├── #func4        "Message" tab
│       └── #func5        "My Reviews" tab
│
├── .basic-profile        ← MAIN FORM (center column)
│   ├── #prof-firstName   ✅ JS-bound input
│   ├── #prof-lastName    ✅ JS-bound input
│   └── #prof-email       ✅ JS-bound input (readonly)
│
├── .image-section        ← RIGHT COLUMN
│   ├── #upload-btn       ⚠️ No JS handler
│   └── #save-btn         ✅ Triggers PUT /api/users/:id
│
├── .link-section         ⚠️ FULLY HARDCODED — no IDs, no JS binding
│   ├── Website field
│   ├── X/Twitter field
│   ├── LinkedIn field
│   ├── Facebook field
│   └── YouTube field
│
└── .enrolled-courses-section (bottom, full-width)
    └── #enrolled-courses-grid   ✅ JS-populated by loadEnrollments()
```

---

## 4. Purchase List Logic — "My Purchases"

The purchased content is rendered using a **JavaScript template literal** (dynamic, not a static list).

**Endpoint called:** `GET /api/enrollments/my`

**Response shape expected:**
```json
{
  "success": true,
  "enrollments": [
    {
      "course": { "id": 1, "title": "...", "price": 99, "image": "..." },
      "payment": { "status": "COMPLETED" | "FULFILLED" }
    }
  ]
}
```

**Rendering logic (`profile.js` L89–103):**
```javascript
grid.innerHTML = data.enrollments.map(e => `
    <div class="course-card" onclick="...go to course...">
        <img src="${e.course.image || '../Rectangle 1080.png'}">
        <div style="padding:16px;">
            <h3>${e.course.title}</h3>
            <span>$${e.course.price.toFixed(2)}</span>
            ${e.payment?.status === 'FULFILLED'
                ? '<span>Link Sent to Gmail</span>'   // ← Fulfillment badge
                : '<span>Status: Paid</span>'
            }
        </div>
    </div>
`).join('');
```

**✅ Dynamic:** Uses template literals — no static `<li>` or hardcoded course data.
**✅ Fulfillment-aware:** Correctly shows `"Link Sent to Gmail"` badge when `payment.status === 'FULFILLED'`.
**⚠️ Empty state:** Shows a hardcoded "You haven't enrolled in any courses yet" message with an `Explore Courses` link.

---

## 5. Issues Identified for Next Sprint

| # | Issue | Severity | Fix |
|---|-------|----------|-----|
| 1 | Sidebar name (`John Doe`) is hardcoded | 🔴 High | Add `id="prof-displayName"` and populate from session/API |
| 2 | Profile picture is a static image | 🟡 Medium | Generate initial-based avatar (like `header-auth.js` does) |
| 3 | Logo/Footer still says "Byway" | 🟡 Medium | Replace with "BandPath" |
| 4 | Footer contact details are placeholder | 🟡 Medium | Update to real BandPath data |
| 5 | Social link fields have no IDs or backend binding | 🟡 Medium | Add IDs, save endpoint, or remove the section |
| 6 | `#upload-btn` has no JS handler | 🔴 High | Attach handler or remove button to avoid confusion |
| 7 | Email assigned twice (L36–37 duplicate) | 🟢 Low | Remove duplicate line |
| 8 | `#func2`–`#func5` tab clicks do nothing | 🟡 Medium | Implement tab switching or remove inactive tabs |
