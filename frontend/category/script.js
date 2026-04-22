let allCourses = [];
let filteredCourses = [];
let currentPage = 1;
const coursesPerPage = 9;
const COURSE_PAGE_PATH = '../course/';

// ── Fetch all courses from API ─────────────────────────────
async function fetchAllCourses() {
    try {
        const data = await Auth.fetchWithAuth('/courses');
        if (data.success) {
            allCourses = data.courses;
            applyFilters();
            renderTopItems();
        }
    } catch (err) {
        console.error('Failed to fetch courses:', err);
    }
}

// ── Render course cards ───────────────────────────────────
function renderCourses() {
    const grid = document.getElementById('coursesGrid');
    if (!grid) return;

    const startIndex = (currentPage - 1) * coursesPerPage;
    const endIndex   = startIndex + coursesPerPage;
    const coursesToShow = filteredCourses.slice(startIndex, endIndex);

    if (coursesToShow.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #64748b;">No courses found matching your criteria.</div>';
        renderPagination();
        return;
    }

    grid.innerHTML = coursesToShow.map(course => `
        <div class="course-card" onclick="goToCourse(${course.id})" style="cursor:pointer;">
            <div class="course-image">
                <img src="./Rectangle 1080.png" alt="${course.title}">
            </div>
            <div class="course-info">
                <h3 class="course-title">${course.title}</h3>
                <div class="course-rating">
                    <span class="rating-stars">${'★'.repeat(Math.round(course.rating))}${'☆'.repeat(5 - Math.round(course.rating))}</span>
                    <span class="rating-count">(${course.ratingCount.toLocaleString()} Ratings)</span>
                </div>
                <p class="course-details">${course.hours} Total Hours. ${course.lectures} Lectures. ${course.level}</p>
                <p class="course-price">$${course.price}</p>
            </div>
        </div>
    `).join('');

    renderPagination();
}

async function renderTopItems() {
    const container = document.querySelector('.top-cour');
    if (!container) return;
    try {
        const data = await Auth.fetchWithAuth('/courses/top');
        if (data.success) {
            const header = container.innerHTML.split('<div class="c1"')[0];
            const coursesHtml = data.courses.map((c, i) => `
                <div class="c${i+1}" onclick="goToCourse(${c.id})">
                    <img src="./Rectangle 1080.png">
                    <p>${c.title}</p>
                    <div class="rtin">
                        <img src="../ratings.png">
                        <p>${c.ratingCount.toLocaleString()} Ratings</p>
                    </div>
                    <p>${c.hours} Total Hours. ${c.lectures} Lectures. ${c.level}</p>
                    <p>$${c.price}</p>
                </div>
            `).join('');
            container.innerHTML = header + coursesHtml;
        }
    } catch (err) {}
}

// ── Navigate to course detail page ───────────────────────
function goToCourse(id) {
    window.location.href = `${COURSE_PAGE_PATH}?id=${id}`;
}

// ── Pagination ────────────────────────────────────────────
function renderPagination() {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;
    const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);

    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }

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

// ── Filters & Sort ────────────────────────────────────────
function applyFilters() {
    const ratingFilters   = Array.from(document.querySelectorAll('input[id^="rating"]:checked')).map(cb => parseInt(cb.value));
    const chapterFilters  = Array.from(document.querySelectorAll('input[id^="chapters"]:checked')).map(cb => cb.value);
    const priceFilters    = Array.from(document.querySelectorAll('input[id^="price"]:checked')).map(cb => cb.value);
    const categoryFilters = Array.from(document.querySelectorAll('input[id^="cat"]:checked')).map(cb => cb.value);

    filteredCourses = allCourses.filter(course => {
        const passRating   = ratingFilters.length === 0   || ratingFilters.some(r => Math.round(course.rating) >= r);
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

function sortCourses() {
    const sortValue = document.getElementById('sortSelect').value;
    switch (sortValue) {
        case 'rating':     filteredCourses.sort((a, b) => b.rating - a.rating);   break;
        case 'price-low':  filteredCourses.sort((a, b) => a.price - b.price);     break;
        case 'price-high': filteredCourses.sort((a, b) => b.price - a.price);     break;
        case 'newest':     filteredCourses.sort((a, b) => b.id - a.id);           break;
        default:           filteredCourses = [...allCourses];
    }
    currentPage = 1;
    renderCourses();
}

// ── Sidebar toggle ────────────────────────────────────────
function toggleFilter(header) {
    header.classList.toggle('collapsed');
    const content = header.nextElementSibling;
    if (content) content.classList.toggle('hidden');
}

function toggleMobileFilters() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.style.display = sidebar.style.display === 'none' ? 'block' : 'none';
}

// ── Init ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const targetCat = urlParams.get('category');
    if (targetCat) {
        const checkbox = document.querySelector(`input[id^="cat"][value="${targetCat}"]`);
        if (checkbox) checkbox.checked = true;
    }
    fetchAllCourses();
});
