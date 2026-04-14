document.addEventListener('DOMContentLoaded', async () => {
    // 1. RBAC Check
    const user = Auth.getUser();
    if (!user || user.role !== 'ADMIN') {
        alert('Access Denied: Admin privileges required.');
        window.location.href = '../sign-in/';
        return;
    }

    // Initialize UI with Admin info
    document.getElementById('adminName').textContent = user.fullName || user.username;
    document.getElementById('adminInitial').textContent = (user.fullName || user.username).charAt(0).toUpperCase();

    // 2. State & Data
    let allUsers = [];

    // 3. Fetch Users
    async function fetchUsers() {
        try {
            const data = await Auth.fetchWithAuth('/admin/users');
            if (data.success) {
                allUsers = data.users;
                renderStats(allUsers);
                renderUserTable(allUsers);
            } else {
                throw new Error(data.message || 'Failed to fetch users');
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            document.getElementById('userTableBody').innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; color: var(--error-color); padding: 20px;">
                        Failed to load users. Please try again later.
                    </td>
                </tr>
            `;
        }
    }

    // 4. Render Functions
    function renderStats(users) {
        document.getElementById('totalUsersCount').textContent = users.length;
        document.getElementById('activeStudentsCount').textContent = users.filter(u => u.isActive && u.role === 'STUDENT').length;
        document.getElementById('teachersCount').textContent = users.filter(u => u.role === 'TEACHER').length;
    }

    function renderUserTable(users) {
        const tbody = document.getElementById('userTableBody');
        if (users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px;">No users found.</td></tr>';
            return;
        }

        tbody.innerHTML = users.map(user => `
            <tr>
                <td>
                    <div class="user-info">
                        <div class="admin-avatar" style="background-color: ${getRandomColor()}">${(user.name || user.email).charAt(0).toUpperCase()}</div>
                        <div>
                            <p class="user-name">${user.name || 'N/A'}</p>
                            <p class="user-email">${user.email}</p>
                        </div>
                    </div>
                </td>
                <td><span class="badge badge-${user.role.toLowerCase()}">${user.role}</span></td>
                <td>${new Date(user.createdAt).toLocaleDateString()}</td>
                <td>
                    <label class="switch">
                        <input type="checkbox" ${user.isActive ? 'checked' : ''} onchange="handleStatusToggle('${user.id}', this.checked)">
                        <span class="slider"></span>
                    </label>
                </td>
                <td>
                    <div class="actions">
                        <button class="action-btn" title="Edit" onclick="handleEdit('${user.id}')">
                            <i data-lucide="edit-2"></i>
                        </button>
                        <button class="action-btn btn-delete" title="Delete" onclick="handleDelete('${user.id}')">
                            <i data-lucide="trash-2"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        // Re-initialize icons for new DOM elements
        if (window.lucide) lucide.createIcons();
    }

    // 5. Action Handlers
    window.handleStatusToggle = async (userId, isChecked) => {
        try {
            await Auth.fetchWithAuth(`/admin/users/${userId}/status`, {
                method: 'PUT',
                body: JSON.stringify({ isActive: isChecked })
            });
            // Update local state and re-render stats if necessary
            const user = allUsers.find(u => u.id == userId);
            if (user) {
                user.isActive = isChecked;
                renderStats(allUsers);
            }
        } catch (error) {
            alert('Failed to update user status: ' + error.message);
            // Revert checkbox if failed
            fetchUsers(); 
        }
    };

    window.handleDelete = async (userId) => {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
        
        try {
            await Auth.fetchWithAuth(`/admin/users/${userId}`, {
                method: 'DELETE'
            });
            allUsers = allUsers.filter(u => u.id != userId);
            renderUserTable(allUsers);
            renderStats(allUsers);
        } catch (error) {
            alert('Failed to delete user: ' + error.message);
        }
    };

    window.handleEdit = (userId) => {
        alert('Edit functionality coming soon! User ID: ' + userId);
    };

    // 6. Search Functionality
    document.getElementById('userSearch').addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const filtered = allUsers.filter(user => 
            (user.name && user.name.toLowerCase().includes(query)) ||
            user.email.toLowerCase().includes(query)
        );
        renderUserTable(filtered);
    });

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
        Auth.logout();
        window.location.href = '../sign-in/';
    });

    // Helper: Random color for placeholders
    function getRandomColor() {
        const colors = ['#3B82F6', '#10B981', '#F59E0B', '#6366F1', '#EC4899', '#8B5CF6'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    // Initial Load
    fetchUsers();
});
