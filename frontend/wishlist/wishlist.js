document.addEventListener('DOMContentLoaded', async () => {
    // Session check
    if (!Auth.isLoggedIn()) {
        window.location.href = '../sign-in/';
        return;
    }

    const grid = document.getElementById('coursesGrid');
    const subtitle = document.getElementById('wishlist-subtitle');

    async function loadWishlist() {
        try {
            const data = await Auth.fetchWithAuth('/wishlist');
            if (data.success) {
                if (data.courses.length === 0) {
                    grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #64748b; font-size: 1.1em;">You haven\'t saved any courses yet. <a href="../category/" style="color: #4f46e5; font-weight: bold; text-decoration: underline;">Browse courses</a></div>';
                    subtitle.textContent = `0 Saved Courses`;
                } else {
                    subtitle.textContent = `${data.courses.length} Saved Course${data.courses.length === 1 ? '' : 's'}`;
                    renderGrid(data.courses);
                }
            } else {
                grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #dc2626;">Failed to load wishlist.</div>';
            }
        } catch (e) {
            console.error('Error fetching wishlist:', e);
            grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #dc2626;">Failed to load wishlist.</div>';
        }
    }

    function renderGrid(courses) {
        grid.innerHTML = courses.map(course => `
            <div class="course-card" onclick="window.location.href='../course/?id=${course.id}'" style="cursor:pointer; position: relative;">
                
                <!-- Heart Icon toggle -->
                <button onclick="event.stopPropagation(); window.toggleHeart(${course.id}, this)" class="action-icon-btn wishlist-action active" title="Remove from wishlist" style="position: absolute; top: 12px; right: 12px; z-index: 10;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-heart"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                </button>

                <div class="course-image">
                    <img src="${course.image || '../category/Rectangle 1080.png'}" alt="${course.title}">
                </div>
                <div class="course-info">
                    <h3 class="course-title">${course.title}</h3>
                    <div class="course-rating">
                        <span class="rating-stars">${'★'.repeat(Math.round(course.rating))}${'☆'.repeat(5 - Math.round(course.rating))}</span>
                        <span class="rating-count">(${course.ratingCount.toLocaleString()} Ratings)</span>
                    </div>
                    <p class="course-details">${course.hours} Total Hours. ${course.lectures} Lectures. ${course.level}</p>
                    <p class="course-price">$${course.price.toFixed(2)}</p>
                </div>
            </div>
        `).join('');
    }

    // Handle heart toggle
    window.toggleHeart = async (courseId, btn) => {
        btn.style.transform = 'scale(0.8)';
        try {
            const data = await Auth.fetchWithAuth('/wishlist/toggle', {
                method: 'POST',
                body: JSON.stringify({ courseId })
            });

            if (data.success) {
                // Instantly remove card for snappy UX
                btn.closest('.course-card').remove();
                
                // Update counter logic silently
                const currentCountStr = subtitle.textContent.split(' ')[0];
                let currentCount = parseInt(currentCountStr) || 0;
                if (currentCount > 0) {
                    currentCount--;
                    if (currentCount === 0) {
                        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #64748b; font-size: 1.1em;">You haven\'t saved any courses yet. <a href="../category/" style="color: #4f46e5; font-weight: bold; text-decoration: underline;">Browse courses</a></div>';
                    }
                    subtitle.textContent = `${currentCount} Saved Course${currentCount === 1 ? '' : 's'}`;
                }
            } else {
                btn.style.transform = 'scale(1)';
                alert(data.message || 'Failed to update wishlist');
            }
        } catch (e) {
            btn.style.transform = 'scale(1)';
            console.error('Toggle error:', e);
        }
    };

    loadWishlist();
});
