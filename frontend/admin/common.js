document.addEventListener('DOMContentLoaded', () => {
    // 1. RBAC Check
    const user = Auth.getUser();
    if (!user || user.role !== 'ADMIN') {
        window.location.href = '../sign-in/';
        return;
    }

    // 2. Initialize Shared UI
    const adminNameEl = document.getElementById('adminName');
    const adminInitialEl = document.getElementById('adminInitial');
    
    if (adminNameEl) adminNameEl.textContent = user.fullName || user.username;
    if (adminInitialEl) adminInitialEl.textContent = (user.fullName || user.username).charAt(0).toUpperCase();

    // 3. Logout Logic
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            Auth.logout();
            window.location.href = '../sign-in/';
        });
    }

    // 4. Mode Toggle Logic
    const modeToggle = document.getElementById('modeToggle');
    if (modeToggle) {
        modeToggle.addEventListener('change', () => {
            const custLabel = document.getElementById('custLabel');
            const adminLabel = document.getElementById('adminLabel');
            
            if (!modeToggle.checked) {
                // Change classes for visual feedback
                custLabel.classList.add('active');
                adminLabel.classList.remove('active');
                
                // Redirect to Customer page
                const redirectPath = modeToggle.getAttribute('data-redirect') || '../';
                setTimeout(() => {
                    window.location.href = redirectPath;
                }, 300); // Small delay for visual feedback
            } else {
                custLabel.classList.remove('active');
                adminLabel.classList.add('active');
            }
        });
    }

    // 5. lucide Icons
    if (window.lucide) {
        lucide.createIcons();
    }

    // 5. Shared Confirmation Modal Helper
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

            document.getElementById('confirmTitle').textContent = title || 'Confirm Action';
            document.getElementById('confirmMessage').textContent = message || 'Are you sure you want to proceed?';
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

    // Ensure Confirm is initialized if it's already in the DOM
    window.Confirm.init();
});
