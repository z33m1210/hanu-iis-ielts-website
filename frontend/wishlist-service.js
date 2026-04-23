/**
 * wishlist-service.js
 * Manages a local cache of the user's wishlist for fast UI updates.
 */

const Wishlist = {
    _wishlist: new Set(),
    _initialized: false,

    async init() {
        if (typeof Auth === 'undefined' || !Auth.isLoggedIn()) {
            return;
        }
        try {
            const data = await Auth.fetchWithAuth('/wishlist');
            if (data.success) {
                this._wishlist = new Set((data.courses || []).map(c => Number(c.id)));
                this._initialized = true;
                console.log('Wishlist initialized with', this._wishlist.size, 'items');
                if (window.updateHeaderBadges) window.updateHeaderBadges();
                document.dispatchEvent(new CustomEvent('wishlistLoaded'));
            }
        } catch (err) {
            console.error('Failed to initialize Wishlist service:', err);
        }
    },

    isWishlisted(courseId) {
        if (!this._initialized) return false;
        return this._wishlist.has(Number(courseId));
    },

    add(courseId) {
        this._wishlist.add(Number(courseId));
        if (window.updateHeaderBadges) window.updateHeaderBadges();
    },

    remove(courseId) {
        this._wishlist.delete(Number(courseId));
        if (window.updateHeaderBadges) window.updateHeaderBadges();
    },

    async toggle(courseId) {
        if (typeof Auth === 'undefined' || !Auth.isLoggedIn()) return { success: false, message: 'Not logged in' };
        
        const id = Number(courseId);
        const isAdding = !this._wishlist.has(id);
        
        try {
            const response = await Auth.fetchWithAuth('/wishlist/toggle', {
                method: 'POST',
                body: JSON.stringify({ courseId: id })
            });

            if (response.success) {
                if (isAdding) this.add(id);
                else this.remove(id);
            }
            return response;
        } catch (err) {
            console.error('Wishlist toggle error:', err);
            return { success: false, message: 'Network error' };
        }
    }
};

// Export to window explicitly
window.Wishlist = Wishlist;

// Initialize early
if (typeof Auth !== 'undefined' && Auth.isLoggedIn()) {
    Wishlist.init();
}

// ── Global Helper for UI Contexts ────────────────────────────────
window.toggleWishlist = async function(courseId, btnElement) {
    if (typeof Auth === 'undefined' || !Auth.isLoggedIn()) {
        window.location.href = '../sign-in/';
        return;
    }
    
    // Optimistic UI update — toggle .active class (CSS handles the fill/color)
    const isCurrentlyWishlisted = Wishlist.isWishlisted(courseId);
    btnElement.classList.toggle('active', !isCurrentlyWishlisted);

    const res = await Wishlist.toggle(courseId);
    
    // Revert if API failed
    if (!res.success && res.message !== 'Not logged in') {
        if (window.showToast) {
            showToast('Wishlist Error', 'Failed to update wishlist. Please try again.', 'warning');
        } else {
            alert('Failed to update wishlist. Please try again.');
        }
        btnElement.classList.toggle('active', isCurrentlyWishlisted);
    } else if (res.success) {
        if (window.showToast) {
            const msg = !isCurrentlyWishlisted ? 'Course added to your wishlist.' : 'Course removed from your wishlist.';
            showToast('Wishlist Updated', msg, 'success');
        }
    }
};
