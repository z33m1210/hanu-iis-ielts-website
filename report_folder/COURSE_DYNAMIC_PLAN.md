# Course Detail Dynamic Transition Plan

This document outlines the strategy for transitioning the static Course Detail page (`/course/index.html`) into a dynamic, data-driven experience.

## 1. Data Fetching Strategy

The page will utilize the `URLSearchParams` API to extract the course ID and fetch the corresponding data from the backend.

### Implementation Steps:
- **ID Extraction**: Use `const urlParams = new URLSearchParams(window.location.search); const courseId = urlParams.get('id');`.
- **API Endpoint**: Call `GET /api/courses/:id`.
- **Authentication**: Use `Auth.fetchWithAuth()` to ensure that if a user is logged in, their session context (like enrollment status) is considered by the backend.
- **Error Handling**: Redirect to the homepage or show a "Course Not Found" state if the ID is invalid or the fetch fails.

---

## 2. State Management (Role-Based Views)

The UI will adapt based on the user's relationship with the course: **Guest**, **Buyer (Enrolled)**, or **Admin**.

| User State | Sidebar Actions | Content Visibility |
| :--- | :--- | :--- |
| **Guest** | Show Price, "Add to Cart", and "Buy Now" buttons. | Show Preview Video and Curriculum summary. |
| **Buyer** | Show "Start Learning" or "Continue" button. | Show Full Course Videos and interactive Curriculum. |
| **Admin** | Show "Edit Course" floating action button. | Show all content + internal analytics (optional). |

### Logic Workflow:
1. Fetch course details.
2. Call `GET /api/enrollments/check/:courseId` to verify if the current user has purchased the course.
3. Update the `sidebar-actions` container and `video-hero` section based on the returned status.

---

## 3. Module Rendering (Curriculum)

The curriculum will be rendered dynamically from the `syllabus` field (stored as JSON in the database).

### Template Function:
```javascript
function renderCourseContent(syllabusData) {
    const tocContainer = document.getElementById('toc-container');
    const syllabus = typeof syllabusData === 'string' ? JSON.parse(syllabusData) : syllabusData;

    tocContainer.innerHTML = syllabus.map((chapter, idx) => `
        <div class="toc-chapter">
            <div class="chapter-header" onclick="toggleChapter(this)">
                <span>${idx + 1}. ${chapter.title}</span>
                <span class="chevron">▼</span>
            </div>
            <div class="chapter-content">
                ${chapter.lessons.map(lesson => `
                    <div class="toc-card ${lesson.isPreview ? 'preview' : 'locked'}">
                        <img src="./play.png" alt="Play">
                        <p>${lesson.title}</p>
                        <span class="duration">${lesson.duration}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}
```

---

## 4. Review Integration

Reviews will be fetched independently to allow for pagination and to keep the initial page load fast.

### Fetching & Rendering:
- **API Call**: `GET /api/reviews/:courseId`.
- **Gold-Star Logic**: Use the standardized star-rating rendering developed for the profile page.
- **Card Template**:
```javascript
function renderReviews(reviews) {
    const reviewList = document.getElementById('review-list');
    reviewList.innerHTML = reviews.map(r => `
        <div class="review-card">
            <div class="review-header">
                <div class="avatar" style="background: ${getAvatarColor(r.user.name[0])}">
                    ${r.user.name[0]}
                </div>
                <div>
                    <div class="name">${r.user.name}</div>
                    <div class="stars">${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</div>
                </div>
            </div>
            <p class="comment">${r.comment}</p>
        </div>
    `).join('');
}
```
