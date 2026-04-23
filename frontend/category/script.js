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
                <button class="wishlist-action ${window.Wishlist && window.Wishlist.isWishlisted(course.id) ? 'active' : ''}" onclick="event.stopPropagation(); if(window.toggleWishlist) toggleWishlist(${course.id}, this)" title="Add to Wishlist">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-heart"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                </button>
            </div>
            <div class="course-info">
                <h3 class="course-title">${course.title}</h3>
                <div class="course-rating">
                    <span class="rating-stars">${'★'.repeat(Math.round(course.rating || 0))}${'☆'.repeat(5 - Math.round(course.rating || 0))}</span>
                    <span class="rating-count">(${course.ratingCount ? course.ratingCount.toLocaleString() : 0} Ratings)</span>
                </div>
                <p class="course-details">${course.hours || 0} Total Hours. ${course.lectures || 0} Lectures. ${course.level || 'Beginner'}</p>
                <div class="price-row">
                    <p class="course-price">$${course.price}</p>
                    <div class="card-actions">
                        <button class="action-icon-btn cart-action ${window.Cart && window.Cart.isInCart(course ? course.id : c.id) ? 'active' : ''}" onclick="event.stopPropagation(); if(window.addToCart) addToCart(${course ? course.id : c.id})" title="Add to Cart">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shopping-cart"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
                        </button>
                        <button class="buy-btn" onclick="event.stopPropagation(); if(window.buyNow) buyNow(${course ? course.id : c.id})">Buy Now</button>
                    </div>
                </div>
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
                <div class="c${i+1} course-card" onclick="goToCourse(${c.id})" style="cursor:pointer;">
                    <div class="course-image">
                        <img src="./Rectangle 1080.png" alt="${c.title}">
                        <button class="wishlist-action ${window.Wishlist && window.Wishlist.isWishlisted(c.id) ? 'active' : ''}" onclick="event.stopPropagation(); if(window.toggleWishlist) toggleWishlist(${c.id}, this)" title="Add to Wishlist">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-heart"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                        </button>
                    </div>
                    <div class="course-info">
                        <h3 class="course-title">${c.title}</h3>
                        <div class="course-rating">
                            <span class="rating-stars">${'★'.repeat(Math.round(c.rating || 0))}${'☆'.repeat(5 - Math.round(c.rating || 0))}</span>
                            <span class="rating-count">(${c.ratingCount ? c.ratingCount.toLocaleString() : 0} Ratings)</span>
                        </div>
                        <p class="course-details">${c.hours || 0} Total Hours. ${c.lectures || 0} Lectures. ${c.level || 'Beginner'}</p>
                        <div class="price-row">
                            <p class="course-price">$${c.price}</p>
                            <div class="card-actions">
                                <button class="action-icon-btn cart-action ${window.Cart && window.Cart.isInCart(course ? course.id : c.id) ? 'active' : ''}" onclick="event.stopPropagation(); if(window.addToCart) addToCart(${course ? course.id : c.id})" title="Add to Cart">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shopping-cart"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
                                </button>
                                <button class="buy-btn" onclick="event.stopPropagation(); if(window.buyNow) buyNow(${course ? course.id : c.id})">Buy Now</button>
                            </div>
                        </div>
                    </div>
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

function syncWishlistUI() {
    renderCourses();
    renderTopItems();
}

// Listen for fetch completion
document.addEventListener('wishlistLoaded', syncWishlistUI);

// Handle cases where wishlist was already ready
if (window.Wishlist && window.Wishlist._initialized) {
    syncWishlistUI();
}
