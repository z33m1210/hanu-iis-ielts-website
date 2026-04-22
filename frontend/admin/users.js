document.addEventListener('DOMContentLoaded', async () => {
    // RBAC Check
    const user = Auth.getUser();
    if (!user || user.role !== 'ADMIN') {
        window.location.href = '../sign-in/';
        return;
    }

    let allUsers = [];

    // Fetch Users (Now with support for the new backend search/filters)
    async function fetchUsers(search = '') {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const statusFilter = urlParams.get('status');
            
            let query = search ? `?search=${encodeURIComponent(search)}` : '';
            if (statusFilter === 'active') {
                query += (query ? '&' : '?') + 'isActive=true';
            }

            const data = await Auth.fetchWithAuth(`/admin/users${query}`);
            if (data.success) {
                allUsers = data.users;
                renderUserTable(allUsers);
            } else {
                throw new Error(data.message || 'Failed to fetch users');
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            document.getElementById('userTableBody').innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; color: var(--error); padding: 20px;">
                        Failed to load users. Please try again later.
                    </td>
                </tr>
            `;
        }
    }

    // Render User Table
    function renderUserTable(users) {
        const tbody = document.getElementById('userTableBody');
        if (users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px;">No users found.</td></tr>';
            return;
        }

        tbody.innerHTML = users.map(u => `
            <tr>
                <td>
                    <div class="user-info">
                        <div class="user-avatar" style="background-color: ${getRandomColor()}">${(u.fullName || u.name || u.email).charAt(0).toUpperCase()}</div>
                        <div>
                            <p class="user-name">${u.fullName || u.name || 'N/A'}</p>
                            <p class="user-email">${u.email}</p>
                        </div>
                    </div>
                </td>
                <td><span class="badge badge-review">${u.role === 'ADMIN' ? 'Administrator' : 'Customer'}</span></td>
                <td>${new Date(u.createdAt).toLocaleDateString()}</td>
                <td>
                    <span class="badge ${u.isOnline ? 'badge-active' : 'badge-disabled'}">${u.isOnline ? 'Online' : 'Offline'}</span>
                </td>
                <td>
                    <div class="actions">
                        <button class="action-btn" title="Edit" onclick="handleEdit('${u.id}')">
                            <i data-lucide="edit-3"></i>
                        </button>
                        <button class="action-btn btn-delete" title="Delete" onclick="handleDelete('${u.id}')">
                            <i data-lucide="trash-2"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        if (window.lucide) lucide.createIcons();
    }

    // Handlers
    window.closeUserModal = () => {
        document.getElementById('editUserModal').classList.remove('active');
    };

    window.handleEdit = (userId) => {
        const u = allUsers.find(user => user.id == userId);
        if (!u) return;

        document.getElementById('editUserId').value = u.id;
        document.getElementById('editUserName').value = u.name || '';
        document.getElementById('editUserEmail').value = u.email;

        document.getElementById('editUserModal').classList.add('active');
        if (window.lucide) lucide.createIcons();
    };

    window.saveUserEdits = async () => {
        const id = document.getElementById('editUserId').value;
        const name = document.getElementById('editUserName').value;
        const email = document.getElementById('editUserEmail').value;

        if (!name || !email) {
            alert('Please fill in all required fields.');
            return;
        }

        try {
            const data = await Auth.fetchWithAuth(`/admin/users/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ name, email })
            });
            
            if (data.success) {
                closeUserModal();
                fetchUsers(); // Refresh the list
            } else {
                alert('Failed to save changes: ' + (data.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Save error:', error);
            alert('Failed to save changes: ' + error.message);
        }
    };

    window.handleDelete = async (userId) => {
        Confirm.show({
            title: 'Delete User?',
            message: 'Are you sure you want to delete this user? This action will remove all their data and cannot be undone.',
            onConfirm: async () => {
                try {
                    await Auth.fetchWithAuth(`/admin/users/${userId}`, { method: 'DELETE' });
                    allUsers = allUsers.filter(u => u.id != userId);
                    renderUserTable(allUsers);
                    // Add a success toast message here if available
                } catch (error) {
                    alert('Failed to delete user: ' + error.message);
                }
            }
        });
    };

    // debounced search
    let searchTimeout;
    document.getElementById('userSearch').addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            fetchUsers(e.target.value);
        }, 300);
    });

    function getRandomColor() {
        const colors = ['#002b4c', '#004170', '#515f74', '#21293d', '#316192'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    fetchUsers();
});
