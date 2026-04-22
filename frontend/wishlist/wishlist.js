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
                <button onclick="event.stopPropagation(); window.toggleHeart(${course.id}, this)" class="wishlist-btn" title="Remove from wishlist" style="position: absolute; top: 12px; right: 12px; background: white; border: none; border-radius: 50%; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 10; font-size: 18px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); color: #dc2626; transition: transform 0.2s;">
                    ❤️
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
