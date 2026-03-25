// ============================================================
//  auth.js  –  BandPath User Database (localStorage)
//  Dùng chung cho cả sign-in và sign-up page
// ============================================================

const Auth = (() => {

    const DB_KEY      = 'bandpath_users';
    const SESSION_KEY = 'bandpath_session';

    // ── Helpers ───────────────────────────────────────────
    function _getUsers() {
        return JSON.parse(localStorage.getItem(DB_KEY) || '[]');
    }

    function _saveUsers(users) {
        localStorage.setItem(DB_KEY, JSON.stringify(users));
    }

    // Simple hash (không dùng plain text, đủ cho frontend demo)
    function _hash(str) {
        let h = 0;
        for (let i = 0; i < str.length; i++) {
            h = Math.imul(31, h) + str.charCodeAt(i) | 0;
        }
        return h.toString(16);
    }

    // ── Public API ────────────────────────────────────────

    /**
     * Đăng ký tài khoản mới
     * @returns { ok: bool, message: string }
     */
    function register({ firstName, lastName, username, email, password, confirmPassword }) {
        // Validate
        if (!firstName || !lastName || !username || !email || !password) {
            return { ok: false, message: 'Vui lòng điền đầy đủ thông tin.' };
        }
        if (password !== confirmPassword) {
            return { ok: false, message: 'Mật khẩu xác nhận không khớp.' };
        }
        if (password.length < 6) {
            return { ok: false, message: 'Mật khẩu phải có ít nhất 6 ký tự.' };
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
            return { ok: false, message: 'Email không hợp lệ.' };
        }

        const users = _getUsers();

        // Check trùng username / email
        if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
            return { ok: false, message: 'Username đã được sử dụng.' };
        }
        if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
            return { ok: false, message: 'Email đã được đăng ký.' };
        }

        // Lưu user mới
        const newUser = {
            id:        Date.now(),
            firstName: firstName.trim(),
            lastName:  lastName.trim(),
            username:  username.trim(),
            email:     email.trim().toLowerCase(),
            password:  _hash(password),       // lưu hash, không lưu plain text
            avatar:    firstName.charAt(0).toUpperCase() + lastName.charAt(0).toUpperCase(),
            createdAt: new Date().toISOString(),
        };

        users.push(newUser);
        _saveUsers(users);

        // Tự động đăng nhập sau khi đăng ký
        _startSession(newUser);

        return { ok: true, message: 'Đăng ký thành công!', user: newUser };
    }

    /**
     * Đăng nhập
     * @returns { ok: bool, message: string, user?: object }
     */
    function login({ identifier, password }) {
        if (!identifier || !password) {
            return { ok: false, message: 'Vui lòng điền đầy đủ thông tin.' };
        }

        const users = _getUsers();
        const user  = users.find(u =>
            u.email    === identifier.toLowerCase() ||
            u.username === identifier
        );

        if (!user) {
            return { ok: false, message: 'Tài khoản không tồn tại.' };
        }

        if (user.password !== _hash(password)) {
            return { ok: false, message: 'Mật khẩu không đúng.' };
        }

        _startSession(user);
        return { ok: true, message: 'Đăng nhập thành công!', user };
    }

    /** Lưu session */
    function _startSession(user) {
        const session = {
            id:        user.id,
            firstName: user.firstName,
            lastName:  user.lastName,
            username:  user.username,
            email:     user.email,
            avatar:    user.avatar,
            loginAt:   new Date().toISOString(),
        };
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    }

    /** Lấy user đang đăng nhập (null nếu chưa) */
    function getSession() {
        return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
    }

    /** Đăng xuất */
    function logout() {
        localStorage.removeItem(SESSION_KEY);
    }

    /** Kiểm tra đã đăng nhập chưa */
    function isLoggedIn() {
        return getSession() !== null;
    }

    /** Lấy danh sách tất cả user (để debug) */
    function getAllUsers() {
        return _getUsers().map(u => ({ ...u, password: '***' }));
    }

    return { register, login, logout, getSession, isLoggedIn, getAllUsers };
})();