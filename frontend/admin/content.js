document.addEventListener('DOMContentLoaded', async () => {
    // RBAC Check
    const user = Auth.getUser();
    if (!user || user.role !== 'ADMIN') {
        window.location.href = '../sign-in/';
        return;
    }

    // 1. DOM Elements
    const contentTableBody = document.getElementById('contentTableBody');
    const postModal = document.getElementById('postModal');
    const postForm = document.getElementById('postForm');
    const addContentBtn = document.getElementById('addContentBtn');
    const savePostBtn = document.getElementById('savePostBtn');
    const modalTitle = document.getElementById('modalTitle');

    // 2. State
    let allPosts = [];

    // 3. Modal Management
    window.openPostModal = (post = null) => {
        postForm.reset();
        document.getElementById('postId').value = post ? post.id : '';
        
        if (post) {
            modalTitle.textContent = 'Edit Content';
            document.getElementById('postTitle').value = post.title;
            document.getElementById('postType').value = post.type;
            document.getElementById('postStatus').value = post.status;
            document.getElementById('postContent').value = post.content || '';
        } else {
            modalTitle.textContent = 'Add New Content';
        }
        
        postModal.classList.add('active');
    };

    window.closePostModal = () => {
        postModal.classList.remove('active');
    };

    // 4. API Operations
    async function fetchPosts() {
        try {
            const data = await Auth.fetchWithAuth('/posts');
            if (data.success) {
                allPosts = data.posts;
                renderContentTable(allPosts);
            }
        } catch (error) {
            console.error('Error fetching content:', error);
        }
    }

    async function savePost() {
        const id = document.getElementById('postId').value;
        const payload = {
            title: document.getElementById('postTitle').value,
            type: document.getElementById('postType').value,
            status: document.getElementById('postStatus').value,
            content: document.getElementById('postContent').value
        };

        if (!payload.title) {
            alert('Title is required');
            return;
        }

        try {
            savePostBtn.disabled = true;
            savePostBtn.textContent = 'Saving...';

            const method = id ? 'PUT' : 'POST';
            const url = id ? `/posts/${id}` : '/posts';

            const data = await Auth.fetchWithAuth(url, {
                method,
                body: JSON.stringify(payload)
            });

            if (data.success) {
                closePostModal();
                fetchPosts();
            }
        } catch (error) {
            alert('Failed to save content: ' + error.message);
        } finally {
            savePostBtn.disabled = false;
            savePostBtn.textContent = 'Save Content';
        }
    }

    function renderContentTable(posts) {
        if (!contentTableBody) return;

        if (posts.length === 0) {
            contentTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem; color: var(--on-surface-variant);">No content found.</td></tr>';
            return;
        }

        contentTableBody.innerHTML = posts.map(p => `
            <tr>
                <td style="font-weight: 600;">${p.title}</td>
                <td style="text-transform: capitalize;">${p.type.toLowerCase()}</td>
                <td>${p.author ? p.author.name || p.author.email : 'Unknown'}</td>
                <td><span class="badge badge-${p.status.toLowerCase()}">${p.status}</span></td>
                <td>${new Date(p.updatedAt).toLocaleDateString()}</td>
                <td>
                    <div class="actions">
                        <button class="action-btn" title="Edit" onclick="handleEdit('${p.id}')"><i data-lucide="edit-3"></i></button>
                        <button class="action-btn btn-delete" title="Delete" onclick="handleDelete('${p.id}')"><i data-lucide="trash-2"></i></button>
                    </div>
                </td>
            </tr>
        `).join('');

        if (window.lucide) lucide.createIcons();
    }

    // 5. Global Handlers
    window.handleEdit = (id) => {
        const post = allPosts.find(p => p.id == id);
        if (post) openPostModal(post);
    };

    window.handleDelete = (id) => {
        const post = allPosts.find(p => p.id == id);
        if (!post) return;

        Confirm.show(
            'Delete Content',
            `Are you sure you want to delete "${post.title}"? This action cannot be undone.`,
            async () => {
                try {
                    await Auth.fetchWithAuth(`/posts/${id}`, { method: 'DELETE' });
                    fetchPosts();
                } catch (error) {
                    alert('Failed to delete content: ' + error.message);
                }
            }
        );
    };

    // 6. Listeners
    addContentBtn.addEventListener('click', () => openPostModal());
    savePostBtn.addEventListener('click', savePost);

    // 7. Init
    fetchPosts();
});
