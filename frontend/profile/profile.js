// profile/profile.js
document.addEventListener('DOMContentLoaded', async () => {
    if (typeof Auth === 'undefined' || !Auth.isLoggedIn()) {
        window.location.href = '../sign-in/';
        return;
    }

    const session = Auth.getSession();
    const userId = session.id;

    // Elements
    const firstNameEl = document.getElementById('prof-firstName');
    const lastNameEl = document.getElementById('prof-lastName');
    const emailEl = document.getElementById('prof-email');
    const bioEl = document.getElementById('prof-bio');
    const saveBtn = document.getElementById('save-btn');
    const toast = document.getElementById('toast');

    function showToast(msg, bg) {
        toast.textContent = msg;
        toast.style.background = bg;
        toast.style.display = 'block';
        setTimeout(() => toast.style.display = 'none', 3000);
    }

    // Load user data
    try {
        const data = await Auth.fetchWithAuth(`/users/${userId}`);
        if (data.success) {
            const user = data.user;
            
            // Map 'name' back to first and last name
            const nameParts = (user.name || '').split(' ');
            firstNameEl.value = nameParts[0] || '';
            lastNameEl.value = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
            
            emailEl.value = user.email || '';
            bioEl.value = user.bio || '';
        }
    } catch (e) {
        showToast('Failed to load profile.', '#dc2626');
    }

    // Save changes
    if (saveBtn) {
        saveBtn.addEventListener('click', async () => {
            saveBtn.textContent = 'Saving...';
            saveBtn.disabled = true;

            const firstName = firstNameEl.value.trim();
            const lastName = lastNameEl.value.trim();
            const bio = bioEl.value.trim();
            const name = `${firstName} ${lastName}`.trim();

            try {
                const data = await Auth.fetchWithAuth(`/users/${userId}`, {
                    method: 'PUT',
                    body: JSON.stringify({ name, bio })
                });

                if (data.success) {
                    showToast('Profile updated successfully!', '#16a34a');
                    
                    // Update session in local storage for header display
                    const newSession = Auth.getSession();
                    newSession.firstName = firstName;
                    newSession.lastName = lastName;
                    localStorage.setItem('bandpath_session', JSON.stringify(newSession));
                    
                    // Refresh header if header-auth handles it dynamically (reloading is easiest)
                    setTimeout(() => window.location.reload(), 1000);
                } else {
                    showToast(data.message || 'Failed to update profile.', '#dc2626');
                }
            } catch (e) {
                showToast('Error updating profile.', '#dc2626');
            } finally {
                saveBtn.textContent = 'Save Changes';
                saveBtn.disabled = false;
            }
        });
    }
    // 4. Load Enrolled Courses
    async function loadEnrollments() {
        const grid = document.getElementById('enrolled-courses-grid');
        if (!grid) return;

        try {
            const data = await Auth.fetchWithAuth('/enrollments/my');
            if (data.success && data.enrollments.length > 0) {
                grid.innerHTML = data.enrollments.map(e => `
                    <div class="course-card" style="background:white; border:1px solid #e2e8f0; border-radius:12px; overflow:hidden; cursor:pointer;" onclick="window.location.href='../course/course-page.html?id=${e.course.id}'">
                        <img src="../Rectangle 1080.png" style="width:100%; height:160px; object-fit:cover;">
                        <div style="padding:16px;">
                            <h3 style="font-size:16px; margin-bottom:8px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; height:44px;">${e.course.title}</h3>
                            <p style="font-size:13px; color:#64748b; margin-bottom:12px;">By ${e.course.teacher.name}</p>
                            <div style="height:4px; background:#f1f5f9; border-radius:2px; margin-bottom:8px;">
                                <div style="width:${e.progress}%; height:100%; background:#2563eb; border-radius:2px;"></div>
                            </div>
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <span style="font-size:12px; font-weight:600; color:#0f172a;">${Math.round(e.progress)}% Complete</span>
                                <span style="font-size:12px; color:#2563eb; font-weight:600;">Continue →</span>
                            </div>
                        </div>
                    </div>
                `).join('');
            } else {
                grid.innerHTML = `
                    <div style="grid-column: 1 / -1; padding: 40px; text-align: center; border: 1px dashed #cbd5e1; border-radius: 12px;">
                        <p style="color: #64748b; margin-bottom: 16px;">You haven't enrolled in any courses yet.</p>
                        <a href="../category/" style="color: #2563eb; font-weight: 600; text-decoration: none;">Explore Courses</a>
                    </div>
                `;
            }
        } catch (err) {
            grid.innerHTML = '<p style="color: #dc2626;">Error loading enrollments.</p>';
        }
    }

    loadEnrollments();
});

