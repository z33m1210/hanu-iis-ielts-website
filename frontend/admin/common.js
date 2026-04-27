document.addEventListener('DOMContentLoaded', () => {
    // 1. RBAC Check
    const user = Auth.getUser();
    if (!user || user.role !== 'ADMIN') {
        const isSubdir = window.location.pathname.includes('/users/') || 
                         window.location.pathname.includes('/courses/') || 
                         window.location.pathname.includes('/settings/') ||
                         window.location.pathname.includes('/orders/');
        window.location.href = isSubdir ? '../../sign-in/' : '../sign-in/';

        return;
    }

    // 2. Initialize Shared UI
    const adminNameEl = document.getElementById('adminName');
    const adminInitialEl = document.getElementById('adminInitial');
    
    if (adminNameEl) adminNameEl.textContent = user.fullName || user.username;
    if (adminInitialEl) adminInitialEl.textContent = (user.fullName || user.username).charAt(0).toUpperCase();

    // 3. Logout Logic
    const logoutBtns = document.querySelectorAll('#logoutBtn');
    logoutBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            Auth.logout();
            const isSubdir = window.location.pathname.includes('/users/') || 
                             window.location.pathname.includes('/courses/') || 
                             window.location.pathname.includes('/settings/') ||
                             window.location.pathname.includes('/orders/');
            window.location.href = isSubdir ? '../../sign-in/' : '../sign-in/';

        });
    });

    // 4. Mode Toggle Logic
    const modeToggle = document.getElementById('modeToggle');
    if (modeToggle) {
        modeToggle.addEventListener('change', () => {
            const custLabel = document.getElementById('custLabel');
            const adminLabel = document.getElementById('adminLabel');
            
            if (!modeToggle.checked) {
                // Change classes for visual feedback
                if (custLabel) custLabel.classList.add('active');
                if (adminLabel) adminLabel.classList.remove('active');
                
                // Redirect to Customer page
                const redirectPath = modeToggle.getAttribute('data-redirect') || '../';
                setTimeout(() => {
                    window.location.href = redirectPath;
                }, 300); // Small delay for visual feedback
            } else {
                if (custLabel) custLabel.classList.remove('active');
                if (adminLabel) adminLabel.classList.add('active');
            }
        });
    }

    // 5. Active State Logic
    const updateActiveNavItem = () => {
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('.nav-item');
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (!href || href === '#') return;

            // Resolve relative paths for comparison
            const linkPath = new URL(href, window.location.origin + window.location.pathname).pathname;
            
            // Normalize paths (remove trailing slashes and index.html)
            const normalize = (p) => p.replace(/\/$/, '').replace(/\/index\.html$/, '');
            
            if (normalize(currentPath) === normalize(linkPath)) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    };
    updateActiveNavItem();

    // 6. lucide Icons
    if (window.lucide) {
        lucide.createIcons();
    }

    // 7. Shared Confirmation Modal Helper
    window.Confirm = {
        callback: null,
        modal: null,
        
        init() {
            this.modal = document.getElementById('confirmModal');
            if (!this.modal) return;
            
            // Background click to close
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) this.hide();
            });
        },
        
        show(options = {}) {
            const { title, message, onConfirm } = options;
            if (!this.modal) this.init();
            if (!this.modal) return;

            const titleEl = document.getElementById('confirmTitle');
            const messageEl = document.getElementById('confirmMessage');
            if (titleEl) titleEl.textContent = title || 'Confirm Action';
            if (messageEl) messageEl.textContent = message || 'Are you sure you want to proceed?';
            this.callback = onConfirm;

            this.modal.classList.add('active');
        },
        
        hide() {
            if (this.modal) this.modal.classList.remove('active');
            this.callback = null;
        },
        
        execute() {
            if (this.callback) this.callback();
            this.hide();
        }
    };

    // 8. Unread Orders Badge Logic
    window.updateUnreadBadge = async () => {
        const badge = document.getElementById('unreadOrdersBadge');
        if (!badge) return;

        try {
            const data = await Auth.fetchWithAuth('/admin/unread-orders-count');
            if (data.success && data.count > 0) {
                badge.textContent = data.count;
                badge.style.display = 'inline-flex';
            } else {
                badge.style.display = 'none';
            }
        } catch (err) {
            console.warn('Failed to fetch unread orders count');
        }
    };

    updateUnreadBadge();
    setInterval(updateUnreadBadge, 30000); // Check every 30 seconds

    // Ensure Confirm is initialized if it's already in the DOM
    window.Confirm.init();
});

