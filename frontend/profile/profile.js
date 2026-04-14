// profile/profile.js
document.addEventListener('DOMContentLoaded', async () => {
    if (typeof Auth === 'undefined' || !Auth.isLoggedIn()) {
        window.location.href = '../sign-in/index.html';
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
});

