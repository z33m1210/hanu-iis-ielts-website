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

    // ── Notify other components ─────────────────────────────
    notifyChange() {
        document.dispatchEvent(new CustomEvent('cartUpdated', { detail: this.getStats() }));
    }
};

// Auto-notify on load
window.addEventListener('load', () => Cart.notifyChange());
