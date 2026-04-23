// ============================================================
//  cart.js  –  Shared Cart Service
//  Manages shopping cart in localStorage
// ============================================================

const Cart = {
    STORAGE_KEY: 'bandpath_cart',

    // ── Get all items in cart ───────────────────────────────
    getItems() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('Failed to parse cart data:', e);
            return [];
        }
    },

    // ── Add course to cart ──────────────────────────────────
    // Expects a course object { id, title, price, author, hours, lectures, level, image }
    addItem(course) {
        const items = this.getItems();
        const exists = items.find(item => item.id === course.id);
        
        if (!exists) {
            items.push(course);
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
            
            // Notify header
            if (window.updateHeaderBadges) window.updateHeaderBadges();

            this.notifyChange();
            return true;
        }
        return false;
    },

    // ── Remove course from cart ─────────────────────────────
    removeItem(courseId) {
        let items = this.getItems();
        items = items.filter(item => item.id !== courseId);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
        this.notifyChange();
    },

    // ── Clear cart ──────────────────────────────────────────
    clear() {
        localStorage.removeItem(this.STORAGE_KEY);
        this.notifyChange();
    },

    // ── Cart Stats ──────────────────────────────────────────
    getStats() {
        const items = this.getItems();
        const subtotal = items.reduce((sum, item) => sum + (item.price || 0), 0);
        const tax = subtotal * 0.05; // 5% mock tax
        const total = subtotal + tax;
        
        return {
            count: items.length,
            subtotal,
            tax,
            total
        };
    },

    // ── Check if item exists in cart ────────────────────────
    isInCart(courseId) {
        const items = this.getItems();
        return items.some(item => Number(item.id) === Number(courseId));
    },

    // ── Notify other components ─────────────────────────────
    notifyChange() {
        document.dispatchEvent(new CustomEvent('cartUpdated', { detail: this.getStats() }));
    }
};

// Export to window
window.Cart = Cart;

// Auto-notify on load
window.addEventListener('load', () => Cart.notifyChange());

// ── Sleek Toast Notification System ────────────────────────────
window.showToast = function(title, message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <span class="toast-title">${title}</span>
            <span class="toast-message">${message}</span>
        </div>
        <div class="toast-close" onclick="this.parentElement.remove()">✕</div>
    `;

    container.appendChild(toast);
    
    // Animate in
    setTimeout(() => toast.classList.add('show'), 100);

    // Auto-remove
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 500);
    }, 4000);
};

// ── Global Helper for UI Contexts ────────────────────────────────
window.addToCart = async function(courseId) {
    if (!courseId) return;
    
    try {
        const response = await Auth.fetchWithAuth('/courses/' + courseId);
        if (response.success && response.course) {
            const added = Cart.addItem(response.course);
            if (added) {
                showToast('Success!', 'Course added to your shopping cart.', 'success');
                // Re-render UI to update cart icons immediately
                if (window.renderCourses) renderCourses();
                if (window.loadTopCourses) loadTopCourses();
            } else {
                showToast('Already in Cart', 'This course is already in your shopping cart.', 'warning');
            }
        } else {
            showToast('Error', 'Failed to retrieve course details.', 'warning');
        }
    } catch (e) {
        console.error('Error adding to cart:', e);
        showToast('Network Error', 'Could not connect to server.', 'warning');
    }
};

window.buyNow = async function(courseId) {
    if (!courseId) return;
    try {
        const response = await Auth.fetchWithAuth('/courses/' + courseId);
        if (response.success && response.course) {
            Cart.addItem(response.course); // Add without alerting
            // Calculate absolute path to handle being called from root '/' or subdirectories '/category/'
            const inSubDir = window.location.pathname.split('/').filter(Boolean).length > 0;
            window.location.href = inSubDir ? '../shopping-cart/' : './shopping-cart/';
        }
    } catch (e) {
        console.error('Error in buyNow route computation:', e);
    }
};
