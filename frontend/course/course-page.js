// course-page.js - Dynamic Implementation
document.addEventListener('DOMContentLoaded', async () => {
    // 1. URL Handling (Section 1 of Plan)
    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get('id');

    if (!courseId) {
        window.location.href = '../';
        return;
    }

    // DOM Elements
    const titleEl = document.getElementById('course-title');
    const descEl = document.getElementById('course-desc');
    const priceEl = document.getElementById('price-sale');
    const videoWrapper = document.querySelector('.video-hero');
    const buyNowBtn = document.querySelector('.buy-now-button');
    const addToCartBtn = document.querySelector('.add-to-cart-button');
    const reviewListEl = document.getElementById('review-list');

    let currentCourse = null;

    // ── Section 1: Fetch Course Data ──────────────────────────
    async function loadCourse() {
        try {
            const data = await Auth.fetchWithAuth(`/courses/${courseId}`);
            if (data.success) {
                currentCourse = data.course;
                const c = currentCourse;

                // 1. Primary Identity
                if (titleEl) titleEl.textContent = c.title;
                if (descEl) descEl.textContent = c.description;
                if (priceEl) priceEl.textContent = `$${c.price.toFixed(2)}`;

                // Dynamic Thumbnail Sync
                const bannerImg = document.getElementById('course-banner');
                if (bannerImg) {
                    bannerImg.src = c.thumbnail || './Rectangle 1080.png';
                }

                // Breadcrumb Title
                const breadcrumbTitle = document.getElementById('breadcrumb-title');
                if (breadcrumbTitle) breadcrumbTitle.textContent = c.title;

                // 2. Metadata Row
                const metaRow = document.getElementById('course-meta');
                if (metaRow) {
                    metaRow.textContent = `${c.hours || 0}h • ${c.lectures || 0} Lectures • ${c.level || 'All Levels'}`;
                }

                // 3. Ratings & Reviews
                const ratingSpan = document.querySelector('.rating-pill span');
                const avgRatingText = document.getElementById('avg-rating');
                const ratingCountEl = document.getElementById('course-reviews');

                if (ratingSpan) ratingSpan.textContent = (c.rating || 0).toFixed(1);
                if (avgRatingText) avgRatingText.textContent = (c.rating || 0).toFixed(1);
                if (ratingCountEl) ratingCountEl.textContent = `(${(c.ratingCount || 0)} ratings)`;

                // 4. Pricing (Original Price)
                const originalPriceEl = document.getElementById('price-original');
                if (originalPriceEl) {
                    if (c.originalPrice && c.originalPrice > c.price) {
                        originalPriceEl.textContent = `$${c.originalPrice.toFixed(2)}`;
                        originalPriceEl.style.display = 'inline';
                    } else {
                        originalPriceEl.style.display = 'none';
                    }
                }

                // 5. Category Breadcrumbs & Header
                const categoryLink = document.querySelector('.breadcrumb-nav a[href*="category"]');
                const headerCategory = document.querySelector('header .header-container p');

                if (c.category) {
                    const formattedCat = c.category.charAt(0).toUpperCase() + c.category.slice(1);
                    if (categoryLink) categoryLink.textContent = formattedCat;
                    if (headerCategory) headerCategory.textContent = `${formattedCat} Skills`;
                }

                // 6. Last Updated Date
                const lastUpdatedEl = document.createElement('div');
                lastUpdatedEl.style.fontSize = '13px';
                lastUpdatedEl.style.color = '#64748b';
                lastUpdatedEl.style.marginTop = '12px';

                if (c.updatedAt) {
                    const date = new Date(c.updatedAt);
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const year = date.getFullYear();
                    lastUpdatedEl.textContent = `Last updated ${month}/${year}`;

                    // Inject after metadata block
                    const metaBlock = document.querySelector('.course-metadata-block');
                    if (metaBlock) metaBlock.appendChild(lastUpdatedEl);
                }

                // 7. Full Description Body
                const descBody = document.getElementById('desc-body');
                if (descBody) descBody.textContent = c.description;

                // 8. Curriculum (Syllabus)
                if (c.syllabus) {
                    try {
                        const syllabus = JSON.parse(c.syllabus);
                        renderCurriculum(syllabus);
                    } catch (e) {
                        console.error('Syllabus parsing error:', e);
                    }
                }

                // YouTube Player Logic
                renderYouTubeVideo(c.previewVideoUrl || '');
            }
        } catch (err) {
            console.error('Error loading course:', err);
        }
    }

    function renderCurriculum(syllabus) {
        const container = document.getElementById('toc-container');
        if (!container || !Array.isArray(syllabus)) return;

        if (syllabus.length === 0) {
            container.innerHTML = '<p style="padding:20px; font-size:13px; color:#94a3b8;">No curriculum available yet.</p>';
            return;
        }

        container.innerHTML = syllabus.map((item, index) => `
            <div class="toc-card ${index === 0 ? 'active' : ''}">
                <img src="./play.png" alt="Play" onerror="this.src='../play-icon.png'">
                <p>${item.title || 'Untitled Lesson'}</p>
                <span class="duration">${item.duration || '00:00'}</span>
            </div>
        `).join('');
    }

    function renderYouTubeVideo(url) {
        if (!videoWrapper) return;

        let videoId = '';
        if (url.includes('youtube.com/watch?v=')) {
            videoId = url.split('v=')[1].split('&')[0];
        } else if (url.includes('youtu.be/')) {
            videoId = url.split('youtu.be/')[1].split('?')[0];
        } else if (url.includes('youtube.com/embed/')) {
            videoId = url.split('embed/')[1].split('?')[0];
        }

        if (videoId) {
            videoWrapper.innerHTML = `
                <iframe 
                    width="100%" 
                    height="100%" 
                    src="https://www.youtube.com/embed/${videoId}" 
                    title="YouTube video player" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                    referrerpolicy="strict-origin-when-cross-origin" 
                    allowfullscreen
                    style="aspect-ratio: 16/9; border-radius: 12px; border: none;">
                </iframe>`;
        }
    }

    // ── Section 2: Enrollment State ───────────────────────────
    async function checkEnrollment() {
        if (!Auth.isLoggedIn()) return;

        try {
            const data = await Auth.fetchWithAuth(`/enrollments/check/${courseId}`);
            if (data.success && data.isEnrolled) {
                // Button Transformation
                if (buyNowBtn) {
                    buyNowBtn.textContent = 'Already Bought';
                    buyNowBtn.disabled = true;
                    buyNowBtn.style.background = '#94a3b8'; // Gray background
                    buyNowBtn.style.color = '#fff';
                    buyNowBtn.style.borderColor = '#94a3b8';
                    buyNowBtn.style.cursor = 'not-allowed';
                    buyNowBtn.onclick = null;
                }
                if (addToCartBtn) {
                    addToCartBtn.style.display = 'none';
                }
            }
        } catch (err) {
            console.error('Error checking enrollment:', err);
        }
    }

    // ── Section 3: Review Rendering ───────────────────────────
    async function loadReviews() {
        if (!reviewListEl) return;

        try {
            const data = await Auth.fetchWithAuth(`/reviews/${courseId}`);
            if (data.success) {
                if (data.reviews.length > 0) {
                    renderReviews(data.reviews);
                } else {
                    reviewListEl.innerHTML = '<p style="text-align:center; color:#94a3b8; padding:40px;">No reviews yet.</p>';
                }

                // Render Distribution Statistics
                if (data.distribution && data.total !== undefined) {
                    renderRatingStats(data.distribution, data.total);
                }
            }
        } catch (err) {
            console.error('Error loading reviews:', err);
        }
    }

    function renderRatingStats(dist, total) {
        const distContainer = document.getElementById('rating-distribution');
        const starContainer = document.getElementById('avg-rating-stars');

        if (!distContainer) return;

        // Update Average Stars in Feedback Section
        if (starContainer && currentCourse) {
            const r = Math.round(currentCourse.rating || 0);
            starContainer.textContent = '★'.repeat(r) + '☆'.repeat(5 - r);
        }

        // Render Bars (5 down to 1)
        let html = '';
        for (let i = 5; i >= 1; i--) {
            const count = dist[i] || 0;
            const percent = total > 0 ? Math.round((count / total) * 100) : 0;

            html += `
                <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="flex: 1; height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden;">
                        <div style="width: ${percent}%; height: 100%; background: #4f46e5; transition: width 0.6s ease-out;"></div>
                    </div>
                    <span style="font-size: 13px; color: #64748b; font-weight: 600; width: 30px;">${i}★</span>
                    <span style="font-size: 13px; color: #94a3b8; width: 40px;">${percent}%</span>
                </div>
            `;
        }
        distContainer.innerHTML = html;
    }

    function renderReviews(reviews) {
        reviewListEl.innerHTML = reviews.map(r => `
            <div class="review-card" style="padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 16px; background:white;">
                <div class="review-header" style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                    <div class="avatar" style="width: 40px; height: 40px; background: #4f46e5; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700;">
                        ${r.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div class="name" style="font-weight: 700; color: #1e293b;">${r.user.name}</div>
                        <div class="stars" style="color: #fbbf24; font-size: 14px;">
                            ${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}
                        </div>
                    </div>
                </div>
                <p class="comment" style="color: #475569; line-height: 1.6; margin:0;">${r.comment || 'No comment provided.'}</p>
            </div>
        `).join('');
    }

    // ── Review Form Interaction ──────────────────────────────
    let selectedRating = 0;
    const starSpans = document.querySelectorAll('.rating-input span');
    starSpans.forEach(span => {
        span.addEventListener('click', () => {
            selectedRating = parseInt(span.getAttribute('data-v'));
            starSpans.forEach((s, idx) => {
                const val = parseInt(s.getAttribute('data-v'));
                s.textContent = val <= selectedRating ? '★' : '☆';
                s.style.color = val <= selectedRating ? '#fbbf24' : '#cbd5e1';
            });
        });
    });

    window.submitReview = async function () {
        const commentEl = document.getElementById('review-comment');
        const comment = commentEl ? commentEl.value.trim() : '';

        if (selectedRating === 0) return alert('Please select a rating.');
        if (!Auth.isLoggedIn()) return alert('Please log in to leave a review.');

        try {
            const data = await Auth.fetchWithAuth('/reviews', {
                method: 'POST',
                body: JSON.stringify({ courseId, rating: selectedRating, comment })
            });
            if (data.success) {
                alert('Thank you for your review!');
                window.location.reload();
            } else {
                alert(data.message || 'Failed to submit review.');
            }
        } catch (e) {
            alert('Error submitting review.');
        }
    };

    window.loadMoreReviews = () => {
        const btn = document.getElementById('more-reviews');
        if (btn) btn.style.display = 'none';
    };

    window.scrollToSection = (id) => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    };

    // ── Check Review Eligibility ─────────────────────────────
    async function checkReviewEligibility() {
        if (!Auth.isLoggedIn()) return;
        try {
            const data = await Auth.fetchWithAuth(`/reviews/${courseId}/can-review`);
            const formContainer = document.getElementById('review-form-container');

            if (!formContainer) return;

            if (data.success) {
                if (data.canReview) {
                    formContainer.style.display = 'block';
                } else {
                    formContainer.style.display = 'block';
                    // Replace form content with reason message
                    if (data.reason === 'ALREADY_REVIEWED') {
                        formContainer.innerHTML = `
                            <div style="text-align: center; padding: 10px;">
                                <p style="color: #1e293b; font-weight: 600; margin-bottom: 12px;">You have already reviewed this course.</p>
                                <button onclick="window.location.reload()" style="background: white; border: 1px solid #e2e8f0; color: #4f46e5; padding: 8px 24px; border-radius: 8px; font-weight: 700; cursor: pointer;">Refresh to see your review</button>
                            </div>
                        `;
                    } else if (data.reason === 'NOT_ENROLLED') {
                        // Keep it hidden or show why (User chose to show reason)
                        formContainer.innerHTML = `
                            <div style="text-align: center; padding: 10px;">
                                <p style="color: #64748b; font-size: 14px;">${data.message}</p>
                            </div>
                        `;
                        formContainer.style.background = '#f8fafc';
                        formContainer.style.display = 'block';
                    }
                }
            }
        } catch (e) { }
    }

    // ── Section 4: Interaction Logic ────────────────────────
    window.buyNow = function () {
        if (!Auth.isLoggedIn()) {
            alert('Please sign in to continue.');
            window.location.href = '../sign-in/';
            return;
        }
        window.location.href = `../checkout/?id=${courseId}`;
    };

    window.addToCart = function () {
        if (!currentCourse) return;

        const success = Cart.addItem({
            id: currentCourse.id,
            title: currentCourse.title,
            price: currentCourse.price,
            image: currentCourse.image,
            lectures: currentCourse.lectures,
            hours: currentCourse.hours
        });

        if (success) {
            alert('Course added to cart!');
            // Optional: redirect to cart or just update UI
            // window.location.href = '../shopping-cart/';
        }
    };

    // Attach listeners as well for robustness
    if (buyNowBtn) buyNowBtn.addEventListener('click', window.buyNow);
    if (addToCartBtn) addToCartBtn.addEventListener('click', window.addToCart);

    // ── Section 5: Related Courses ──────────────────────────
    async function loadRelatedCourses() {
        const container = document.getElementById('related-courses');
        if (!container) return;

        try {
            const data = await Auth.fetchWithAuth('/courses/top');
            if (data.success) {
                // Filter out current course
                const filtered = data.courses.filter(c => c.id != courseId).slice(0, 4);

                container.innerHTML = filtered.map(c => `
                    <div class="course-card" onclick="window.location.href='../course/?id=${c.id}'" style="cursor:pointer;">
                        <div class="course-image">
                            <img src="${c.image || './Rectangle 1080.png'}" alt="${c.title}">
                            <button class="wishlist-action ${window.Wishlist && window.Wishlist.isWishlisted(c.id) ? 'active' : ''}" onclick="event.stopPropagation(); if(window.toggleWishlist) toggleWishlist(${c.id}, this)" title="Add to Wishlist">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-heart"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                            </button>
                        </div>
                        <div class="course-info">
                            <h3 class="course-title">${c.title}</h3>
                            <div class="course-rating">
                                <span class="rating-stars">${'★'.repeat(Math.round(c.rating || 0))}${'☆'.repeat(5 - Math.round(c.rating || 0))}</span>
                                <span class="rating-count">(${(c.ratingCount || 0).toLocaleString()} Ratings)</span>
                            </div>
                            <p class="course-details">${c.hours || 0}h • ${c.lectures || 0} Lectures • ${c.level || 'Beginner'}</p>
                            <div class="price-row">
                                <p class="course-price">$${c.price.toFixed(2)}</p>
                                <div class="card-actions">
                                    <button class="action-icon-btn cart-action ${window.Cart && window.Cart.isInCart(c.id) ? 'active' : ''}" onclick="event.stopPropagation(); if(window.addToCart) addToCart(${c.id})" title="Add to Cart">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shopping-cart"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('');
            }
        } catch (err) {
            console.error('Error loading related courses:', err);
        }
    }

    // Initialize
    await loadCourse();
    await checkEnrollment();
    await loadReviews();
    await checkReviewEligibility();
    await loadRelatedCourses();
});
