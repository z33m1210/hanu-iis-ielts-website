// ============================================================
//  auth.js  –  BandPath User Database Integration
//  Communicates with Node.js Express API
// ============================================================

const Auth = (() => {
    const API_URL = '/api';
    const SESSION_KEY = 'bandpath_session';
    const TOKEN_KEY = 'bandpath_token';

    // ── Public API ────────────────────────────────────────

    /**
     * Đăng ký tài khoản mới
     * @returns { Promise<{ ok: bool, message: string, user?: object }> }
     */
    async function register({ firstName, lastName, username, email, password, confirmPassword }) {
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

        try {
            const name = `${firstName.trim()} ${lastName.trim()}`;
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    email: email.trim().toLowerCase(), 
                    password, 
                    name, 
                    role: 'STUDENT' // Default to student
                })
            });

            const data = await response.json();
            if (!response.ok || !data.success) {
                 return { ok: false, message: data.message || 'Đăng ký thất bại' };
            }

            _startSession(data.user, data.token);
            return { ok: true, message: 'Đăng ký thành công!', user: data.user };
        } catch (error) {
            console.error('API Error:', error);
            return { ok: false, message: 'Không thể kết nối đến máy chủ.' };
        }
    }

    /**
     * Đăng nhập
     * @returns { Promise<{ ok: bool, message: string, user?: object }> }
     */
    async function login({ identifier, password }) {
        if (!identifier || !password) {
            return { ok: false, message: 'Vui lòng điền đầy đủ thông tin.' };
        }

        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: identifier.trim().toLowerCase(), password })
            });

            const data = await response.json();
            if (!response.ok || !data.success) {
                 return { ok: false, message: data.message || 'Email hoặc mật khẩu không chính xác.' };
            }

            _startSession(data.user, data.token);
            return { ok: true, message: 'Đăng nhập thành công!', user: data.user };
        } catch (error) {
            console.error('API Error:', error);
            return { ok: false, message: 'Không thể kết nối đến máy chủ.' };
        }
    }

    /** Lưu session */
    function _startSession(user, token) {
        // Parse name back into first and last name for frontend compatibility
        const nameParts = (user.name || '').split(' ');
        const firstName = nameParts[0] || 'User';
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
        
        let avatar = user.avatarUrl;
        if (!avatar) {
            const firstLetter = firstName.charAt(0).toUpperCase();
            const lastLetter = lastName ? lastName.charAt(0).toUpperCase() : '';
            avatar = firstLetter + lastLetter;
        }

        const session = {
            id:        user.id,
            firstName: firstName,
            lastName:  lastName,
            fullName:  user.name || `${firstName} ${lastName}`.trim(),
            username:  user.email.split('@')[0], // Basic fallback for Admin Panel
            email:     user.email,
            role:      user.role,
            avatar:    avatar,
            loginAt:   new Date().toISOString(),
        };
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
        localStorage.setItem(TOKEN_KEY, token);
    }

    /** Lấy user đang đăng nhập (null nếu chưa) - Alias for getSession */
    function getUser() {
        return getSession();
    }

    /** Lấy user đang đăng nhập (null nếu chưa) */
    function getSession() {
        return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
    }

    /** Lấy Auth Token JWT */
    function getToken() {
        return localStorage.getItem(TOKEN_KEY);
    }

    /** Đăng xuất */
    function logout() {
        localStorage.removeItem(SESSION_KEY);
        localStorage.removeItem(TOKEN_KEY);
    }

    /** Kiểm tra đã đăng nhập chưa */
    function isLoggedIn() {
        return getSession() !== null && getToken() !== null;
    }

    /** Utility func to make authenticated requests */
    async function fetchWithAuth(endpoint, options = {}) {
        const token = getToken();
        // Allow public routes (e.g. /courses) without redirection to login
        const headers = {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        try {
            const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
            
            if (res.status === 401 || res.status === 403) {
                logout();
                window.location.href = '../sign-in/';
                throw new Error('Unauthorized');
            }

            // Check content type before parsing
            const contentType = res.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const data = await res.json();
                if (!res.ok) {
                    console.warn(`API Error [${res.status}]:`, data.message);
                }
                return data;
            } else {
                // Not JSON (could be a 500 HTML error or something else)
                const text = await res.text();
                console.error(`API Non-JSON Response [${res.status}]:`, text.substring(0, 200));
                return { 
                    success: false, 
                    message: `Server Error (${res.status}). Please try again later.` 
                };
            }
        } catch (error) {
            console.error('Fetch error:', error);
            return { 
                success: false, 
                message: 'Không thể kết nối đến máy chủ.' 
            };
        }
    }

    return { register, login, logout, getSession, getUser, getToken, isLoggedIn, fetchWithAuth, API_URL };
})();
