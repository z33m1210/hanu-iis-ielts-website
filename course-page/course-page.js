// ============================================================
//  course-page.js  –  Dynamic logic for course-page.html
//  Reads ?id=N from URL, populates the page, handles all UX
// ============================================================

// ── 1. Read course ID from URL ────────────────────────────
const params   = new URLSearchParams(window.location.search);
const courseId = parseInt(params.get('id')) || 1;
const course   = coursesData.find(c => c.id === courseId) || coursesData[0];

// ── 2. Populate header / breadcrumb ──────────────────────
document.getElementById('breadcrumb-title').textContent = course.title;
document.title = `BandPath – ${course.title}`;

// ── 3. Populate Main Title block ─────────────────────────
document.getElementById('course-title').textContent   = course.title;
document.getElementById('course-desc').textContent    = course.description;
document.getElementById('course-rating').textContent  = course.rating.toFixed(1);
document.getElementById('course-reviews').textContent = `(${course.ratingCount.toLocaleString()} ratings)`;
document.getElementById('course-meta').textContent    =
    `${course.hours} Total Hours. ${course.lectures} Lectures. ${course.level}`;
document.getElementById('course-author').textContent  = course.author;

// ── 4. Populate price card ────────────────────────────────
document.getElementById('price-sale').textContent     = `$${course.price}`;
document.getElementById('price-original').textContent = `$${course.originalPrice}`;

// style original price as strikethrough
document.getElementById('price-original').style.cssText =
    'text-decoration:line-through; color:#9ca3af; font-size:14px;';

// ── 5. Populate Instructor section ───────────────────────
document.getElementById('instructor-name').textContent    = course.author;
document.getElementById('instructor-title').textContent   = course.instructorTitle;
document.getElementById('instructor-reviews').textContent = `${course.instructorReviews} Reviews`;
document.getElementById('instructor-students').textContent= `${course.instructorStudents} Students`;
document.getElementById('instructor-courses').textContent = `${course.instructorCourses} Courses`;
document.getElementById('instructor-bio').textContent     = course.instructorBio;

// ── 6. Build Syllabus (TOC) ───────────────────────────────
const tocContainer = document.getElementById('toc-container');
tocContainer.innerHTML = '';

// reset grid to match actual number of chapters
const tocCount = course.syllabus.length;
tocContainer.style.cssText = `
    width:100%; border:1px solid #d1d5db; border-radius:8px;
    display:grid; grid-template-columns:1fr;
    grid-template-rows:repeat(${tocCount}, 1fr); height:auto;
`;

course.syllabus.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'toc-card-dyn';
    card.style.cssText = `
        display:flex; align-items:center; gap:10px; padding:14px 25px;
        cursor:pointer; transition:background 0.2s;
        ${index < tocCount - 1 ? 'border-bottom:1px solid #d1d5db;' : ''}
    `;
    card.innerHTML = `
        <img src="./chevron-down.png" alt="toggle"
             style="width:24px;height:24px;transition:transform 0.3s;">
        <p style="flex:1;font-weight:500;">${item.title}</p>
        <p style="margin-left:auto;padding-right:15px;color:#6b7280;font-size:14px;">
            ${item.lessons} Lessons
        </p>
        <p style="margin-right:25px;color:#6b7280;font-size:14px;">${item.duration}</p>
    `;
    // toggle expand animation on click
    card.addEventListener('click', () => {
        const arrow = card.querySelector('img');
        const isOpen = card.dataset.open === 'true';
        arrow.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
        card.dataset.open = isOpen ? 'false' : 'true';
        card.style.background = isOpen ? '' : '#f0f7ff';
    });
    tocContainer.appendChild(card);
});

// ── 7. Build Reviews ─────────────────────────────────────
const allReviews = course.reviews || [];
let shownReviews = 3;

function renderReviews() {
    const list = document.getElementById('review-list');
    list.innerHTML = '';

    allReviews.slice(0, shownReviews).forEach(rev => {
        const div = document.createElement('div');
        div.className = 'review1';    // reuses existing CSS
        div.style.marginBottom = '16px';
        div.innerHTML = `
            <div class="ava">
                <img src="./Ellipse 19.png">
                <p style="font-weight:600;">${rev.name}</p>
            </div>
            <div class="star-rating">
                <img src="./Star 3.png" style="width:18px;height:17px;">
                <p style="margin-left:4px;">${rev.stars}</p>
            </div>
            <p>${rev.date}</p>
            <p>${rev.comment}</p>
        `;
        list.appendChild(div);
    });

    document.getElementById('more-reviews').style.display =
        shownReviews >= allReviews.length ? 'none' : 'inline-block';
    document.getElementById('avg-rating').textContent = course.rating.toFixed(1);
}

function loadMoreReviews() {
    shownReviews += 3;
    renderReviews();
}

renderReviews();

// ── 8. Build FAQ ─────────────────────────────────────────
const faqList = document.getElementById('faq-list');
(course.faq || []).forEach((item, i) => {
    const block = document.createElement('div');
    block.className  = 'faq-item';
    block.style.cssText = `
        border:1px solid #e2e8f0; border-radius:10px;
        margin-bottom:12px; overflow:hidden;
    `;
    block.innerHTML = `
        <div class="faq-q" style="
            display:flex; justify-content:space-between; align-items:center;
            padding:16px 20px; cursor:pointer; background:#fff;
            font-weight:600; font-size:15px; user-select:none;
        ">
            <span>${item.q}</span>
            <span class="faq-arrow" style="transition:transform 0.3s; font-size:12px;">▼</span>
        </div>
        <div class="faq-a" style="
            max-height:0; overflow:hidden;
            transition:max-height 0.35s ease, padding 0.35s ease;
            background:#f8fafc; font-size:14px; color:#374151;
        ">
            <p style="padding:0 20px;">${item.a}</p>
        </div>
    `;
    const header  = block.querySelector('.faq-q');
    const content = block.querySelector('.faq-a');
    const arrow   = block.querySelector('.faq-arrow');

    header.addEventListener('click', () => {
        const isOpen = content.style.maxHeight !== '0px' && content.style.maxHeight !== '';
        // close all others
        document.querySelectorAll('.faq-a').forEach(el => {
            el.style.maxHeight = '0px';
            el.style.padding   = '0 20px';
        });
        document.querySelectorAll('.faq-arrow').forEach(el => {
            el.style.transform = 'rotate(0deg)';
        });
        if (!isOpen) {
            content.style.maxHeight = content.scrollHeight + 40 + 'px';
            content.style.padding   = '14px 20px';
            arrow.style.transform   = 'rotate(180deg)';
        }
    });
    faqList.appendChild(block);
});

// ── 9. Build Related Courses ─────────────────────────────
const relatedContainer = document.getElementById('related-courses');
const related = coursesData
    .filter(c => c.id !== course.id && c.category === course.category)
    .slice(0, 4);

// fallback: if same category has < 4, fill from others
const extras = coursesData
    .filter(c => c.id !== course.id && c.category !== course.category)
    .slice(0, 4 - related.length);

[...related, ...extras].forEach(c => {
    const card = document.createElement('div');
    card.className = 'course-card';
    card.style.cursor = 'pointer';
    card.innerHTML = `
        <img class="bk-card" src="./Rectangle 1080.png">
        <div class="course-body">
            <h3>${c.title}</h3>
            <p class="author">By ${c.author}</p>
            <div class="rating">
                <img id="course-star" src="./Rating.png">
                <p>(${c.ratingCount.toLocaleString()} Ratings)</p>
            </div>
            <p class="meta">${c.hours} Total Hours. ${c.lectures} Lectures. ${c.level}</p>
            <p class="price">$${c.price}</p>
        </div>
    `;
    card.addEventListener('click', () => {
        window.location.href = `../course-page/course-page.html?id=${c.id}`;
    });
    relatedContainer.appendChild(card);
});

// ── 10. Tab navbar – smooth scroll ───────────────────────
function scrollToSection(sectionId, checkbox) {
    // uncheck all other checkboxes
    ['btn1','btn2','btn3','btn4'].forEach(id => {
        const el = document.getElementById(id);
        if (el && el !== checkbox) el.checked = false;
    });
    const target = document.getElementById(sectionId);
    if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// ── 11. Add to cart / Buy now ─────────────────────────────
function addToCart() {
    const btn = document.querySelector('.add-to-cart-button');
    btn.textContent = '✓ Added to Cart!';
    btn.style.background = 'linear-gradient(180deg, #166534, #14532d)';
    setTimeout(() => {
        btn.textContent = 'Add To Cart';
        btn.style.background = '';
    }, 2000);
}

function buyNow() {
    alert(`Enrolling in: ${course.title}\nPrice: $${course.price}\n\nRedirecting to checkout...`);
}