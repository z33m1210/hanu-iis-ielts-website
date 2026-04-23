// course-page.js

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const courseId = params.get('id');

    if (courseId) {
        loadCourseDetail(courseId);
        loadRelatedCourses(courseId);
    } else {
        window.location.href = '../';
    }
});

async function loadCourseDetail(id) {
    try {
        const response = await fetch(`${Auth.API_URL}/courses/${id}`);
        const data = await response.json();

        if (data.success) {
            renderCourseDetail(data.course);
        } else {
            console.error('Course not found');
            // Show placeholder or 404
        }
    } catch (error) {
        console.error('Error fetching course:', error);
    }
}

function renderCourseDetail(course) {
    // ── 1. Header & Title ──────────────────────────────────────
    document.title = `${course.title} – BandPath`;
    const breadcrumbTitle = document.getElementById('breadcrumb-title');
    if (breadcrumbTitle) breadcrumbTitle.textContent = course.title;

    const courseTitle = document.getElementById('course-title');
    if (courseTitle) courseTitle.textContent = course.title;

    const courseDesc = document.getElementById('course-desc');
    if (courseDesc) courseDesc.textContent = course.description || 'No description available.';

    // ── 2. Meta Info (Pills, Rating) ───────────────────────────
    const ratingEl = document.getElementById('course-rating');
    const avgRatingEl = document.getElementById('avg-rating');
    const reviewsEl = document.getElementById('course-reviews');
    const metaEl = document.getElementById('course-meta');

    if (ratingEl) ratingEl.textContent = course.rating.toFixed(1);
    if (avgRatingEl) avgRatingEl.textContent = course.rating.toFixed(1);
    if (reviewsEl) reviewsEl.textContent = `(${course.ratingCount || 0} ratings)`;
    if (metaEl) metaEl.textContent = `${course.hours}h • ${course.lectures} Lectures • ${course.level}`;

    // ── 3. Media & Banner ─────────────────────────────────────
    const bannerEl = document.getElementById('course-banner');
    if (bannerEl) bannerEl.src = course.image || './Rectangle 1080.png';

    // ── 4. Main Body Content ──────────────────────────────────
    const descBody = document.getElementById('desc-body');
    if (descBody) descBody.textContent = course.description || 'Join this course to master IELTS skills.';

    // ── 5. Pricing ────────────────────────────────────────────
    const priceEl = document.getElementById('price-sale');
    const originEl = document.getElementById('price-original');
    
    if (priceEl) priceEl.textContent = `$${course.price}`;
    if (originEl) {
        if (course.originalPrice) {
            originEl.textContent = `$${course.originalPrice}`;
            originEl.style.display = 'inline';
        } else {
            originEl.style.display = 'none';
        }
    }

    // ── 6. Course Content (Syllabus) ──────────────────────────
    const tocContainer = document.getElementById('toc-container');
    if (tocContainer) {
        let syllabus = [];
        try {
            syllabus = typeof course.syllabus === 'string' ? JSON.parse(course.syllabus) : (course.syllabus || []);
        } catch (e) {
            console.error('Error parsing syllabus:', e);
        }

        if (syllabus.length > 0) {
            tocContainer.innerHTML = syllabus.map((item, index) => `
                <div class="toc-card ${index === 0 ? 'active' : ''}" onclick="toggleTocActive(this)">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #4f46e5; opacity: 0.8;"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                    <p style="flex-grow: 1; margin-left: 8px;">${item.title || item.name}</p>
                    <span class="duration">${item.duration || item.dur || '0:00'}</span>
                </div>
            `).join('');
        } else {
            tocContainer.innerHTML = '<p style="color: #64748b; font-size: 14px; padding: 20px;">Detailed content coming soon.</p>';
        }
    }

    // ── 7. Reviews ────────────────────────────────────────────
    renderReviews(course.reviews || []);

    // ── 8. FAQs ───────────────────────────────────────────────
    const faqList = document.getElementById('faq-list');
    if (faqList) {
        if (course.faqs && course.faqs.length > 0) {
            faqList.innerHTML = course.faqs.map(faq => `
                <div class="faq-item" style="border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; background: white;">
                    <div style="padding: 16px; font-weight: 700; display: flex; justify-content: space-between; cursor: pointer; background: #f8fafc;" onclick="toggleFaq(this)">
                        <span>${faq.question}</span>
                        <span>+</span>
                    </div>
                    <div class="faq-ans" style="padding: 0 16px; max-height: 0; overflow: hidden; transition: all 0.3s ease;">
                        <p style="padding: 16px 0; color: #475569; border-top: 1px solid #f1f5f9;">${faq.answer}</p>
                    </div>
                </div>
            `).join('');
        } else {
            faqList.innerHTML = '<p style="color: #64748b; font-size: 14px;">No FAQs available for this course yet.</p>';
        }
    }
}

function renderReviews(reviews) {
    const reviewList = document.getElementById('review-list');
    if (!reviewList) return;

    if (reviews.length === 0) {
        reviewList.innerHTML = '<p style="color: #64748b; padding: 20px 0;">No reviews yet. Be the first to share your thoughts!</p>';
        return;
    }

    reviewList.innerHTML = reviews.map(rev => `
        <div class="review-item" style="padding: 24px 0; border-bottom: 1px solid #f1f5f9;">
            <div style="display: flex; gap: 16px; align-items: flex-start;">
                <div style="width: 44px; height: 44px; border-radius: 50%; background: #e2e8f0; display: flex; align-items: center; justify-content: center; font-weight: 700; color: #64748b; font-size: 18px;">
                    ${rev.user?.name ? rev.user.name[0] : 'U'}
                </div>
                <div style="flex-grow: 1;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                        <p style="font-weight: 700; color: #1e293b;">${rev.user?.name || 'Academic Student'}</p>
                        <span style="font-size: 12px; color: #94a3b8;">${new Date(rev.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div style="color: #fbbf24; font-size: 12px; margin-bottom: 8px;">
                        ${'★'.repeat(rev.rating)}${'☆'.repeat(5 - rev.rating)}
                    </div>
                    <p style="color: #475569; font-size: 14px; line-height: 1.6;">${rev.comment || 'Intentionally left blank.'}</p>
                </div>
            </div>
        </div>
    `).join('');
}

function toggleTocActive(el) {
    const container = el.parentElement;
    container.querySelectorAll('.toc-card').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
}

function toggleFaq(el) {
    const ans = el.nextElementSibling;
    const span = el.querySelector('span:last-child');
    if (ans.style.maxHeight === '0px' || !ans.style.maxHeight) {
        ans.style.maxHeight = '200px';
        span.textContent = '−';
    } else {
        ans.style.maxHeight = '0px';
        span.textContent = '+';
    }
}

async function loadRelatedCourses(excludeId) {
    try {
        const container = document.getElementById('related-courses');
        if (!container) return;

        const res = await fetch(`${Auth.API_URL}/courses?exclude=${excludeId}&limit=4`);
        const data = await res.json();

        if (data.success) {
            container.innerHTML = data.courses.map(c => `
                <div class="course-card-mini" style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; cursor: pointer; transition: all 0.2s;" onclick="window.location.href='../course/?id=${c.id}'">
                    <img src="${c.image || './Rectangle 1080.png'}" style="width: 100%; height: 160px; object-fit: cover;">
                    <div style="padding: 16px;">
                        <h3 style="font-size: 15px; font-weight: 700; color: #1e293b; margin-bottom: 8px; height: 40px; overflow: hidden;">${c.title}</h3>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-weight: 800; color: #4f46e5;">$${c.price}</span>
                            <div style="display: flex; align-items: center; gap: 4px; font-size: 12px; color: #64748b;">
                                <span>${c.rating.toFixed(1)}</span>
                                <span style="color: #fbbf24;">★</span>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    } catch (e) {
        console.error('Error loading related courses:', e);
    }
}

function scrollToSection(id) {
    const el = document.getElementById(id);
    if (el) {
        window.scrollTo({
            top: el.offsetTop - 100,
            behavior: 'smooth'
        });
    }
}

async function addToCart() {
    const params = new URLSearchParams(window.location.search);
    const courseId = params.get('id');
    if (!courseId) return;

    try {
        const res = await Auth.fetchWithAuth('/cart/add', {
            method: 'POST',
            body: JSON.stringify({ courseId: parseInt(courseId) })
        });
        
        if (res.success) {
            alert('Course added to cart!');
            // Refresh counts if needed
            if (window.updateCartBadge) window.updateCartBadge();
        } else {
            alert(res.message || 'Failed to add to cart');
        }
    } catch (e) {
        console.error(e);
    }
}

async function buyNow() {
    await addToCart();
    window.location.href = '../shopping-cart/';
}
