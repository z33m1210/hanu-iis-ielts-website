// ============================================================
//  script.js  –  Category page logic
//  Uses coursesData from course-data.js (shared data file)
// ============================================================

let filteredCourses = [...coursesData];
let currentPage = 1;
const coursesPerPage = 9;

// ── Path to the course detail page ───────────────────────
// Adjust this relative path to match your folder structure:
//   category page is in:  .../category/index.html
//   course page is in:    .../course/course-page.html
const COURSE_PAGE_PATH = '../course/course-page.html';

// ── Render course cards ───────────────────────────────────
function renderCourses() {
    const grid = document.getElementById('coursesGrid');
    const startIndex = (currentPage - 1) * coursesPerPage;
    const endIndex   = startIndex + coursesPerPage;
    const coursesToShow = filteredCourses.slice(startIndex, endIndex);

    grid.innerHTML = coursesToShow.map(course => `
        <div class="course-card" onclick="goToCourse(${course.id})" style="cursor:pointer;">
            <div class="course-image">
                <img src="./Rectangle 1080.png" alt="${course.title}">
            </div>
            <div class="course-info">
                <h3 class="course-title">${course.title}</h3>
                <p class="course-author">By ${course.author}</p>
                <div class="course-rating">
                    <span class="rating-stars">${'★'.repeat(Math.floor(course.rating))}${'☆'.repeat(5 - Math.floor(course.rating))}</span>
                    <span class="rating-count">(${course.ratingCount.toLocaleString()} Ratings)</span>
                </div>
                <p class="course-details">${course.hours} Total Hours. ${course.lectures} Lectures. ${course.level}</p>
                <p class="course-price">$${course.price}</p>
            </div>
        </div>
    `).join('');

    renderPagination();
}

// ── Navigate to course detail page ───────────────────────
function goToCourse(id) {
    window.location.href = `${COURSE_PAGE_PATH}?id=${id}`;
}

// ── Pagination ────────────────────────────────────────────
function renderPagination() {
    const pagination = document.getElementById('pagination');
    const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);

    let html = `
        <button class="page-btn" onclick="changePage(${currentPage - 1})"
            ${currentPage === 1 ? 'disabled' : ''}>‹</button>
    `;
    for (let i = 1; i <= totalPages; i++) {
        html += `
            <button class="page-btn ${i === currentPage ? 'active' : ''}"
                onclick="changePage(${i})">${i}</button>
        `;
    }
    html += `
        <button class="page-btn" onclick="changePage(${currentPage + 1})"
            ${currentPage === totalPages ? 'disabled' : ''}>›</button>
    `;
    pagination.innerHTML = html;
}

function changePage(page) {
    const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        renderCourses();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// ── Filters ───────────────────────────────────────────────
function applyFilters() {
    filteredCourses = coursesData.filter(course => {
        const ratingFilters   = Array.from(document.querySelectorAll('input[id^="rating"]:checked')).map(cb => parseInt(cb.value));
        const chapterFilters  = Array.from(document.querySelectorAll('input[id^="chapters"]:checked')).map(cb => cb.value);
        const priceFilters    = Array.from(document.querySelectorAll('input[id^="price"]:checked')).map(cb => cb.value);
        const categoryFilters = Array.from(document.querySelectorAll('input[id^="cat"]:checked')).map(cb => cb.value);

        const passRating   = ratingFilters.length === 0   || ratingFilters.some(r => Math.floor(course.rating) >= r);
        const passChapter  = chapterFilters.length === 0  || chapterFilters.some(range => {
            const [min, max] = range.split('-').map(Number);
            return course.chapters >= min && course.chapters <= max;
        });
        const passPrice    = priceFilters.length === 0    || priceFilters.some(range => {
            const [min, max] = range.split('-').map(Number);
            return course.price >= min && course.price <= max;
        });
        const passCategory = categoryFilters.length === 0 || categoryFilters.includes(course.category);

        return passRating && passChapter && passPrice && passCategory;
    });

    currentPage = 1;
    renderCourses();
}

// ── Sort ──────────────────────────────────────────────────
function sortCourses() {
    const sortValue = document.getElementById('sortSelect').value;
    switch (sortValue) {
        case 'rating':     filteredCourses.sort((a, b) => b.rating - a.rating);   break;
        case 'price-low':  filteredCourses.sort((a, b) => a.price - b.price);     break;
        case 'price-high': filteredCourses.sort((a, b) => b.price - a.price);     break;
        case 'newest':     filteredCourses.sort((a, b) => b.id - a.id);           break;
        default:           filteredCourses = [...coursesData];
    }
    currentPage = 1;
    renderCourses();
}

// ── Sidebar toggle ────────────────────────────────────────
function toggleFilter(header) {
    header.classList.toggle('collapsed');
    const content = header.nextElementSibling;
    content.classList.toggle('hidden');
}

function toggleMobileFilters() {
    const sidebar = document.getElementById('sidebar');
    sidebar.style.display = sidebar.style.display === 'none' ? 'block' : 'none';
}

// ── Init ──────────────────────────────────────────────────
renderCourses();
