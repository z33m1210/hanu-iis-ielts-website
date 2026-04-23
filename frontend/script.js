function initGauge(gaugeBox, targetPercentage) {
    const gaugeFill = gaugeBox.querySelector('.gauge-fill');
    const percentageText = gaugeBox.querySelector('.percentage');
    const circumference = Math.PI * 60;
    
    gaugeFill.style.strokeDasharray = circumference;
    gaugeFill.style.strokeDashoffset = circumference;
    percentageText.textContent = '0%';
    
    setTimeout(function() {
        const offset = circumference * (1 - targetPercentage / 100);
        gaugeFill.style.strokeDashoffset = offset;
        
        let currentPercentage = 0;
        const duration = 1000;
        const stepTime = 20;
        const steps = duration / stepTime;
        const increment = targetPercentage / steps;
        
        const counter = setInterval(function() {
            currentPercentage += increment;
            if (currentPercentage >= targetPercentage) {
                currentPercentage = targetPercentage;
                clearInterval(counter);
            }
            percentageText.textContent = currentPercentage.toFixed(1) + '%';
        }, stepTime);
    }, 100);
}

async function loadTopCourses() {
    const container = document.getElementById('topCoursesContainer');
    try {
        const data = await Auth.fetchWithAuth('/courses/top');
        if (data.success) {
            container.innerHTML = data.courses.map((c, i) => `
                <div class="c${i+1} course-card" onclick="window.location.href='./course/?id=${c.id}'" style="cursor:pointer;">
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
                                <button class="action-icon-btn cart-action ${window.Cart && window.Cart.isInCart(c.id) ? 'active' : ''}" onclick="event.stopPropagation(); if(window.addToCart) addToCart(${c.id})" title="Add to Cart">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shopping-cart"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
                                </button>
                                <button class="buy-btn" onclick="event.stopPropagation(); if(window.buyNow) buyNow(${c.id})">Buy Now</button>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    } catch (err) {
        console.error('Failed to load top courses:', err);
        container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: red;">Failed to load courses.</p>';
    }
}


async function loadCounts() {
    try {
        const data = await Auth.fetchWithAuth('/courses');
        if (data.success) {
            const counts = {
                listening: data.courses.filter(c => c.category === 'listening').length,
                reading: data.courses.filter(c => c.category === 'reading').length,
                writing: data.courses.filter(c => c.category === 'writing').length,
                speaking: data.courses.filter(c => c.category === 'speaking').length
            };
            
            document.getElementById('count-listening').textContent = `${counts.listening} Courses`;
            document.getElementById('count-reading').textContent = `${counts.reading} Courses`;
            document.getElementById('count-writing').textContent = `${counts.writing} Courses`;
            document.getElementById('count-speaking').textContent = `${counts.speaking} Courses`;
        }
    } catch (err) {
        console.error('Failed to load counts:', err);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    initGauge(document.querySelector('.gauge-box'), 87.6);
    loadTopCourses();
    loadCounts();
});

// Use a unified function for re-rendering when wishlist state is ready
function syncWishlistUI() {
    loadTopCourses();
}

// 1. Listen for the event (if initialization happens after this script loads)
document.addEventListener('wishlistLoaded', syncWishlistUI);

// 2. Check immediately (if initialization already happened before this script loaded)
if (window.Wishlist && window.Wishlist._initialized) {
    syncWishlistUI();
}
