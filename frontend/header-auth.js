// ============================================================
//  header-auth.js  –  Tự động cập nhật header dựa theo session
//  Load file này trên MỌI trang sau auth.js
//  Không cần chỉnh HTML thủ công từng trang
// ============================================================

(function initHeader() {
    // Determine depth to set base path reliably
    const pathname = window.location.pathname;
    // Count directory depth (ignoring the filename like index.html)
    const isRoot = pathname === '/' || pathname === '/index.html' || pathname.endsWith('/frontend/') || pathname.endsWith('/frontend/index.html');
    const basePath = isRoot ? '.' : '..';

    // Màu avatar xoay vòng theo chữ cái đầu
    const AVATAR_COLORS = {
        A:'#f97316', B:'#8b5cf6', C:'#06b6d4', D:'#10b981',
        E:'#f59e0b', F:'#ef4444', G:'#3b82f6', H:'#ec4899',
        I:'#14b8a6', J:'#6366f1', K:'#84cc16', L:'#f97316',
        M:'#8b5cf6', N:'#06b6d4', O:'#10b981', P:'#f59e0b',
        Q:'#ef4444', R:'#3b82f6', S:'#ec4899', T:'#14b8a6',
        U:'#6366f1', V:'#84cc16', W:'#f97316', X:'#8b5cf6',
        Y:'#06b6d4', Z:'#10b981',
    };

    function getColor(letter) {
        return AVATAR_COLORS[letter.toUpperCase()] || '#334155';
    }

    // ── Inject CSS một lần ───────────────────────────────
    if (!document.getElementById('header-auth-style')) {
        const style = document.createElement('style');
        style.id = 'header-auth-style';
        style.textContent = `
            /* Avatar button */
            .ava-header {
                width: 40px; height: 40px;
                border-radius: 50%;
                color: white;
                font-weight: 700; font-size: 15px;
                display: flex; align-items: center; justify-content: center;
                cursor: pointer;
                user-select: none;
                position: relative;
                transition: box-shadow 0.2s, transform 0.15s;
                flex-shrink: 0;
            }
            .ava-header:hover {
                box-shadow: 0 4px 14px rgba(0,0,0,0.25);
                transform: scale(1.06);
            }

            /* Dropdown menu */
            .ava-dropdown {
                position: absolute;
                top: calc(100% + 10px);
                right: 0;
                width: 220px;
                background: white;
                border: 1px solid #e2e8f0;
                border-radius: 14px;
                box-shadow: 0 12px 32px rgba(0,0,0,0.12);
                z-index: 1000;
                overflow: hidden;
                opacity: 0;
                transform: translateY(-8px) scale(0.97);
                pointer-events: none;
                transition: opacity 0.2s ease, transform 0.2s ease;
            }
            .ava-dropdown.open {
                opacity: 1;
                transform: translateY(0) scale(1);
                pointer-events: all;
            }

            /* Dropdown header (user info) */
            .ava-dropdown-header {
                padding: 16px;
                border-bottom: 1px solid #f1f5f9;
                display: flex;
                align-items: center;
                gap: 12px;
            }
            .ava-dropdown-avatar {
                width: 40px; height: 40px;
                border-radius: 50%;
                color: white;
                font-weight: 700; font-size: 14px;
                display: flex; align-items: center; justify-content: center;
                flex-shrink: 0;
            }
            .ava-dropdown-name {
                font-weight: 600; font-size: 14px;
                color: #0f172a;
                white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
            }
            .ava-dropdown-email {
                font-size: 12px; color: #64748b;
                white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
            }

            /* Dropdown items */
            .ava-dropdown-item {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 11px 16px;
                font-size: 14px;
                color: #1e293b;
                cursor: pointer;
                transition: background 0.15s;
                text-decoration: none;
            }
            .ava-dropdown-item:hover { background: #f8fafc; }
            .ava-dropdown-item .item-icon { font-size: 16px; width: 20px; text-align: center; }
            .ava-dropdown-divider {
                height: 1px; background: #f1f5f9; margin: 4px 0;
            }
            .ava-dropdown-item.logout {
                color: #ef4444;
            }
            .ava-dropdown-item.logout:hover { background: #fff5f5; }

            /* Wrapper cần position:relative */
            .ava-wrapper {
                position: relative;
                display: flex;
                align-items: center;
            }

            /* Logged-OUT state: show Login/Signup buttons */
            .auth-buttons {
                display: flex;
                gap: 10px;
            }
            .auth-buttons .login-btn {
                padding: 8px 20px;
                font-size: 14px; font-weight: 500;
                border: 1px solid #d0d0d0;
                border-radius: 6px;
                background: white; color: #333;
                cursor: pointer;
                transition: background 0.2s;
            }
            .auth-buttons .login-btn:hover { background: #f8f8f8; }
            .auth-buttons .signup-btn {
                padding: 8px 20px;
                font-size: 14px; font-weight: 500;
                border-radius: 6px;
                background: #2c3e50; color: white;
                border: none; cursor: pointer;
                transition: background 0.2s;
            }
            .auth-buttons .signup-btn:hover { background: #34495e; }

            /* Toast */
            .hauth-toast {
                position: fixed; bottom: 28px; right: 28px;
                padding: 12px 20px; border-radius: 10px;
                background: #16a34a; color: white;
                font-size: 14px; font-weight: 500;
                z-index: 9999;
                opacity: 0; transform: translateY(16px);
                transition: opacity 0.3s, transform 0.3s;
                pointer-events: none;
            }
            .hauth-toast.show { opacity: 1; transform: translateY(0); }

            /* Mode Toggle in Header */
            .mode-toggle-wrapper {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 6px 12px;
                margin-right: 12px;
                background: #f8fafc;
                border-radius: 8px;
                border: 1px solid #e2e8f0;
            }
            .mode-toggle-wrapper .toggle-label {
                font-size: 11px;
                font-weight: 600;
                color: #64748b;
                transition: color 0.2s;
                user-select: none;
            }
            .mode-toggle-wrapper .toggle-label.active { color: #0f172a; }

            .mode-toggle-wrapper .switch {
                position: relative;
                display: inline-block;
                width: 32px;
                height: 18px;
            }
            .mode-toggle-wrapper .switch input { opacity: 0; width: 0; height: 0; }
            .mode-toggle-wrapper .slider {
                position: absolute;
                cursor: pointer;
                top: 0; left: 0; right: 0; bottom: 0;
                background-color: #e2e8f0;
                transition: .3s;
                border: 1px solid #cbd5e1;
            }
            .mode-toggle-wrapper .slider:before {
                position: absolute;
                content: "";
                height: 12px;
                width: 12px;
                left: 2px;
                bottom: 2px;
                background-color: white;
                transition: .3s;
                box-shadow: 0 1px 2px rgba(0,0,0,0.1);
            }
            .mode-toggle-wrapper input:checked + .slider {
                background-color: #0f172a;
                border-color: #0f172a;
            }
            .mode-toggle-wrapper input:checked + .slider:before {
                transform: translateX(14px);
            }
            .mode-toggle-wrapper .slider.round { border-radius: 20px; }
            .mode-toggle-wrapper .slider.round:before { border-radius: 50%; }
        `;
        document.head.appendChild(style);
    }

    // ── Render header user zone ───────────────────────────
    function render() {
        // Tìm .func-bar hoặc .button-container để thay thế
        const funcBar = document.querySelector('.func-bar');
        if (!funcBar) return;

        // Xóa button-container cũ (Login/Signup) nếu có
        const oldBtnContainer = funcBar.querySelector('.button-container');

        const session = typeof Auth !== 'undefined' ? Auth.getSession() : null;

        if (session) {
            // ── LOGGED IN ────────────────────────────────
            const initial = session.firstName.charAt(0).toUpperCase();
            const color   = getColor(initial);
            const fullName = `${session.firstName} ${session.lastName}`;

            // Xóa button container cũ
            if (oldBtnContainer) oldBtnContainer.remove();

            // Xóa mode-toggle cũ nếu đã có
            const oldToggle = funcBar.querySelector('.mode-toggle-wrapper');
            if (oldToggle) oldToggle.remove();

            // Xóa ava-wrapper cũ nếu đã có (tránh duplicate)
            const oldWrapper = funcBar.querySelector('.ava-wrapper');
            if (oldWrapper) oldWrapper.remove();

            // Tạo avatar + dropdown
            const wrapper = document.createElement('div');
            wrapper.className = 'ava-wrapper';
            wrapper.innerHTML = `
                <div class="ava-header" id="ava-btn"
                     style="background:${color};"
                     title="${fullName}">
                    ${initial}
                </div>
                <div class="ava-dropdown" id="ava-dropdown">
                    <div class="ava-dropdown-header">
                        <div class="ava-dropdown-avatar" style="background:${color};">${initial}</div>
                        <div>
                            <div class="ava-dropdown-name">${fullName}</div>
                            <div class="ava-dropdown-email">${session.email}</div>
                        </div>
                    </div>
                    <a class="ava-dropdown-item" href="${basePath}/profile/">
                        <span class="item-icon">👤</span> My Profile
                    </a>
                    <a class="ava-dropdown-item" href="${basePath}/profile/#enrolled-courses-section">
                        <span class="item-icon">📚</span> My Courses
                    </a>
                    <a class="ava-dropdown-item" href="${basePath}/wishlist/">
                        <span class="item-icon">❤️</span> Wishlist
                    </a>
                    <div class="ava-dropdown-divider"></div>
                    <a class="ava-dropdown-item" href="${basePath}/settings/">
                        <span class="item-icon">⚙️</span> Settings
                    </a>
                    <div class="ava-dropdown-divider"></div>
                    <div class="ava-dropdown-item logout" onclick="headerLogout()">
                        <span class="item-icon">🚪</span> Log Out
                    </div>
                </div>
            `;
            // ── ADMIN MODE TOGGLE ───────────────────────
            if (session.role === 'ADMIN') {
                const toggleWrapper = document.createElement('div');
                toggleWrapper.className = 'mode-toggle-wrapper';
                toggleWrapper.innerHTML = `
                    <span class="toggle-label active" id="h-custLabel">Customer</span>
                    <label class="switch">
                        <input type="checkbox" id="h-modeToggle">
                        <span class="slider round"></span>
                    </label>
                    <span class="toggle-label" id="h-adminLabel">Admin</span>
                `;
                funcBar.appendChild(toggleWrapper);

                const hToggle = toggleWrapper.querySelector('#h-modeToggle');
                hToggle.addEventListener('change', () => {
                    const hCust = toggleWrapper.querySelector('#h-custLabel');
                    const hAdmin = toggleWrapper.querySelector('#h-adminLabel');
                    
                    if (hToggle.checked) {
                        hCust.classList.remove('active');
                        hAdmin.classList.add('active');
                        // Redirect to Admin portal
                        setTimeout(() => {
                            window.location.href = `${basePath}/admin/`;
                        }, 300);
                    } else {
                        hCust.classList.add('active');
                        hAdmin.classList.remove('active');
                    }
                });
            }

            funcBar.appendChild(wrapper);

            // Toggle dropdown on avatar click
            const avaBtn  = wrapper.querySelector('#ava-btn');
            const dropdown = wrapper.querySelector('#ava-dropdown');

            avaBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdown.classList.toggle('open');
            });

            // Close dropdown on outside click
            document.addEventListener('click', () => {
                dropdown.classList.remove('open');
            });

        } else {
            // ── LOGGED OUT ───────────────────────────────
            // Xóa ava-wrapper cũ nếu có
            const oldWrapper = funcBar.querySelector('.ava-wrapper');
            if (oldWrapper) oldWrapper.remove();

            // Tạo Login/Signup buttons nếu chưa có
            if (!oldBtnContainer) {
                const btnContainer = document.createElement('div');
                btnContainer.className = 'auth-buttons';
                btnContainer.innerHTML = `
                    <button class="login-btn"
                        onclick="window.location.href='${basePath}/sign-in/'">Log In</button>
                    <button class="signup-btn"
                        onclick="window.location.href='${basePath}/sign-up/'">Sign Up</button>
                `;
                funcBar.appendChild(btnContainer);
            }
        }
    }

    // ── Logout handler (global) ───────────────────────────
    window.headerLogout = function () {
        if (typeof Auth !== 'undefined') Auth.logout();

        // Toast
        const toast = document.createElement('div');
        toast.className = 'hauth-toast';
        toast.textContent = '👋 Đã đăng xuất thành công!';
        document.body.appendChild(toast);
        requestAnimationFrame(() => toast.classList.add('show'));
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
                window.location.href = `${basePath}/sign-in/`;
            }, 400);
        }, 1500);
    };

    function initAddons() {
        const searchInput = document.querySelector('.search-box');
        if (searchInput) {
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    const query = searchInput.value.trim();
                    if (query) {
                        window.location.href = `${basePath}/category/?search=${encodeURIComponent(query)}`;
                    }
                }
            });
        }

        const cartIcon = document.querySelector('img[src*="Frame 427318762"]');
        if (cartIcon) {
            cartIcon.style.cursor = 'pointer';
            cartIcon.title = 'View Shopping Cart';
            cartIcon.addEventListener('click', () => {
                window.location.href = `${basePath}/shopping-cart/`;
            });
        }

        const heartIcon = document.querySelector('img[src*="heart.png"]');
        if (heartIcon) {
            heartIcon.style.cursor = 'pointer';
            heartIcon.title = 'Wishlist';
            heartIcon.addEventListener('click', () => {
                window.location.href = `${basePath}/wishlist/`;
            });
        }



        const logo = document.querySelector('.logo');
        if (logo) {
            logo.style.cursor = 'pointer';
            logo.addEventListener('click', () => {
                window.location.href = `${basePath}/`;
            });
        }
    }

    // ── Run after DOM ready ───────────────────────────────
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            render();
            initAddons();
        });
    } else {
        render();
        initAddons();
    }

})();
