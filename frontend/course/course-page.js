// ============================================================
//  course-page.js  –  Dynamic logic for course-page.html
//  Reads ?id=N from URL, populates the page, handles all UX
// ============================================================

async function initCoursePage() {
    // ── 1. Read course ID from URL ────────────────────────────
    const params   = new URLSearchParams(window.location.search);
    const courseId = parseInt(params.get('id')) || 1;

    try {
        const data = await Auth.fetchWithAuth(`/courses/${courseId}`);
        if (!data.success) throw new Error('Course not found');
        
        const course = data.course;

        // ── 2. Populate header / breadcrumb ──────────────────────
        document.getElementById('breadcrumb-title').textContent = course.title;
        document.title = `BandPath – ${course.title}`;

        // ── 3. Populate Main Title block ─────────────────────────
        document.getElementById('course-title').textContent   = course.title;
        document.getElementById('course-desc').textContent    = course.description || 'No description available.';
        document.getElementById('course-rating').textContent  = course.rating.toFixed(1);
        document.getElementById('course-reviews').textContent = `(${course.ratingCount.toLocaleString()} ratings)`;
        document.getElementById('course-meta').textContent    =
            `${course.hours} Total Hours. ${course.lectures} Lectures. ${course.level}`;
        document.getElementById('course-author').textContent  = course.teacher.name;

        // ── 4. Populate price card ────────────────────────────────
        document.getElementById('price-sale').textContent     = `$${course.price}`;
        if (course.originalPrice) {
            document.getElementById('price-original').textContent = `$${course.originalPrice}`;
            document.getElementById('price-original').style.cssText = 'text-decoration:line-through; color:#9ca3af; font-size:14px;';
        } else {
            document.getElementById('price-original').style.display = 'none';
        }

        // ── 5. Populate Instructor section ───────────────────────
        document.getElementById('instructor-name').textContent    = course.teacher.name;
        document.getElementById('instructor-title').textContent   = course.teacher.title || 'IELTS Expert';
        document.getElementById('instructor-reviews').textContent = `${course.teacher.instructorReviews || '0'} Reviews`;
        document.getElementById('instructor-students').textContent= `${course.teacher.instructorStudents || '0'} Students`;
        document.getElementById('instructor-courses').textContent = `${course.teacher.instructorCourses || '0'} Courses`;
        document.getElementById('instructor-bio').textContent     = course.teacher.bio || 'Professional IELTS Instructor.';

        // ── 6. Build Syllabus (Mocked mapping for now as DB doesn't have syllabus nested yet) ────────────────
        // If syllabus data is needed, we could add a Syllabus model later. 
        // For now, let's keep the mock cards if data is missing, or just show a message.
        if (!course.syllabus || course.syllabus.length === 0) {
             const tocContainer = document.getElementById('toc-container');
             tocContainer.innerHTML = '<p style="padding: 20px;">Syllabus content is coming soon.</p>';
        }

        // Related courses logic can be simplified or fetched from another endpoint
        loadRelatedCourses(course.category, course.id);

    } catch (err) {
        console.error('Error loading course:', err);
        document.body.innerHTML = `<div style="text-align:center; padding: 100px;"><h1>Course Not Found</h1><a href="../category/">Back to courses</a></div>`;
    }
}

async function loadRelatedCourses(category, currentId) {
    try {
        const data = await Auth.fetchWithAuth(`/courses?category=${category}`);
        if (data.success) {
            const relatedContainer = document.getElementById('related-courses');
            const related = data.courses.filter(c => c.id !== currentId).slice(0, 4);
            
            relatedContainer.innerHTML = related.map(c => `
                <div class="course-card" onclick="window.location.href='../course/course-page.html?id=${c.id}'" style="cursor:pointer">
                    <img class="bk-card" src="./Rectangle 1080.png">
                    <div class="course-body">
                        <h3>${c.title}</h3>
                        <p class="author">By ${c.teacher.name}</p>
                        <div class="rating">
                            <img id="course-star" src="./Rating.png" style="width: auto; height: 16px;">
                            <p>(${c.ratingCount.toLocaleString()} Ratings)</p>
                        </div>
                        <p class="meta">${c.hours} Total Hours. ${c.lectures} Lectures. ${c.level}</p>
                        <p class="price">$${c.price}</p>
                    </div>
                </div>
            `).join('');
        }
    } catch (err) {}
}

function scrollToSection(sectionId, checkbox) {
    ['btn1','btn2','btn3','btn4'].forEach(id => {
        const el = document.getElementById(id);
        if (el && el !== checkbox) el.checked = false;
    });
    const target = document.getElementById(sectionId);
    if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function addToCart() {
    const btn = document.querySelector('.add-to-cart-button');
    const title = document.getElementById('course-title').textContent;
    const priceText = document.getElementById('price-sale').textContent;
    const priceValue = parseFloat(priceText.replace('$', ''));
    const author = document.getElementById('course-author').textContent;
    const meta = document.getElementById('course-meta').textContent;
    
    // Get ID from URL
    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get('id'));

    const course = {
        id,
        title,
        price: priceValue,
        author,
        meta,
        image: './Rectangle 1080.png'
    };

    if (Cart.addItem(course)) {
        btn.textContent = '✓ Added to Cart!';
        btn.style.background = 'linear-gradient(180deg, #166534, #14532d)';
        setTimeout(() => {
            btn.textContent = 'Add To Cart';
            btn.style.background = '';
        }, 2000);
    } else {
        btn.textContent = 'Already in Cart';
        setTimeout(() => {
            btn.textContent = 'Add To Cart';
        }, 2000);
    }
}

function buyNow() {
    const session = Auth.getSession();
    if (!session) {
        window.location.href = '../sign-in/';
        return;
    }
    
    // Make sure it's in cart first
    addToCart();
    
    // Redirect to checkout
    window.location.href = '../checkout/checkout.html';
}

document.addEventListener('DOMContentLoaded', initCoursePage);
