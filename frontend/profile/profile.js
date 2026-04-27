// profile/profile.js
// ── Avatar color map (matches header-auth.js) ────────────────
const AVATAR_COLORS = {
    A:'#f97316', B:'#8b5cf6', C:'#06b6d4', D:'#10b981',
    E:'#f59e0b', F:'#ef4444', G:'#3b82f6', H:'#ec4899',
    I:'#14b8a6', J:'#6366f1', K:'#84cc16', L:'#f97316',
    M:'#8b5cf6', N:'#06b6d4', O:'#10b981', P:'#f59e0b',
    Q:'#ef4444', R:'#3b82f6', S:'#ec4899', T:'#14b8a6',
    U:'#6366f1', V:'#84cc16', W:'#f97316', X:'#8b5cf6',
    Y:'#06b6d4', Z:'#10b981',
};
function getAvatarColor(letter) {
    return AVATAR_COLORS[(letter || 'A').toUpperCase()] || '#334155';
}

let currentReviewCourseId = null;
let currentRating = 0;

window.openReviewModal = function(courseId, title, existingReview) {
    currentReviewCourseId = courseId;
    const modal = document.getElementById('review-modal');
    const titleEl = document.getElementById('modal-course-title');
    const commentEl = document.getElementById('review-comment');
    
    titleEl.textContent = existingReview ? `Edit Review: ${title}` : `Review: ${title}`;
    commentEl.value = existingReview ? existingReview.comment : '';
    setRating(existingReview ? existingReview.rating : 0);
    
    modal.style.display = 'flex';
};

function setRating(rating) {
    currentRating = rating;
    const stars = document.querySelectorAll('#star-selector span');
    stars.forEach(s => {
        const r = parseInt(s.getAttribute('data-rating'));
        s.style.color = r <= rating ? '#fbbf24' : '#cbd5e1';
    });
}

// ── Tab switching (global so HTML onclick works) ──────────────
window.switchTab = function(tab) {
    const panels = {
        'profile':   document.getElementById('tab-profile'),
        'purchases': document.getElementById('tab-purchases'),
        'reviews':   document.getElementById('tab-reviews')
    };
    const buttons = {
        'profile':   document.getElementById('func1'),
        'purchases': document.getElementById('func2'),
        'reviews':   document.getElementById('func5')
    };

    Object.keys(panels).forEach(key => {
        if (panels[key]) {
            key === tab ? panels[key].classList.add('active') : panels[key].classList.remove('active');
        }
        if (buttons[key]) {
            key === tab ? buttons[key].classList.add('active-tab') : buttons[key].classList.remove('active-tab');
        }
    });

    if (tab === 'purchases') loadEnrollments();
    if (tab === 'reviews')   loadMyReviews();
};

// ── Main init ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
    if (typeof Auth === 'undefined' || !Auth.isLoggedIn()) {
        window.location.href = '../sign-in/';
        return;
    }

    const session = Auth.getSession();
    const userId  = session?.id;

    // DOM refs
    const firstNameEl  = document.getElementById('prof-firstName');
    const lastNameEl   = document.getElementById('prof-lastName');
    const emailEl      = document.getElementById('prof-email');
    const sidebarName  = document.getElementById('prof-sidebarName');
    const avatarCircle = document.getElementById('prof-avatar-circle');
    const saveBtn      = document.getElementById('save-btn');
    const uploadBtn    = document.getElementById('upload-btn');
    const toast        = document.getElementById('toast');

    // ── Toast helper ─────────────────────────────────────────
    function showToast(msg, bg = '#16a34a') {
        if (!toast) return;
        toast.textContent = msg;
        toast.style.background = bg;
        toast.style.display = 'block';
        setTimeout(() => toast.style.display = 'none', 3000);
    }

    // ── Render sidebar avatar ─────────────────────────────────
    function renderAvatar(firstName, avatarUrl) {
        if (!avatarCircle) return;
        const initial = (firstName || '?').charAt(0).toUpperCase();

        if (avatarUrl) {
            const timestamp = Date.now();
            const fullUrl = avatarUrl.startsWith('http') ? avatarUrl : `http://localhost:5000${avatarUrl}?t=${timestamp}`;
            avatarCircle.innerHTML = `<img src="${fullUrl}" 
                style="width:100%; height:100%; border-radius:50%; object-fit:cover;" 
                onerror="this.parentElement.textContent='${initial}'; this.parentElement.style.background='${getAvatarColor(initial)}'">`;
            avatarCircle.style.background = 'transparent';
        } else {
            avatarCircle.textContent = initial;
            avatarCircle.style.background = getAvatarColor(initial);
        }
    }

    // ── Load user data ────────────────────────────────────────
    try {
        const data = await Auth.fetchWithAuth(`/users/${userId}`);
        if (data.success) {
            const user = data.user;

            // Split stored name into first/last
            const nameParts = (user.name || '').trim().split(' ');
            const firstName = nameParts[0] || '';
            const lastName  = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

            if (firstNameEl) firstNameEl.value = firstName;
            if (lastNameEl)  lastNameEl.value  = lastName;
            if (emailEl)     emailEl.value     = user.email || '';  // assigned once only

            // Sidebar & Preview
            const displayName = `${firstName} ${lastName}`.trim() || 'My Profile';
            if (sidebarName) sidebarName.textContent = displayName;
            renderAvatar(firstName, user.avatarUrl);

            const imgPreview = document.getElementById('prof-imgPreview');
            if (imgPreview && user.avatarUrl) {
                const fullUrl = user.avatarUrl.startsWith('http') ? user.avatarUrl : `http://localhost:5000${user.avatarUrl}`;
                imgPreview.src = fullUrl;
            }
        }
    } catch (e) {
        showToast('Failed to load profile.', '#dc2626');
    }

    // ── Save changes ──────────────────────────────────────────
    if (saveBtn) {
        saveBtn.addEventListener('click', async () => {
            saveBtn.textContent = 'Saving...';
            saveBtn.disabled = true;

            const firstName = firstNameEl?.value.trim() || '';
            const lastName  = lastNameEl?.value.trim()  || '';
            const name      = `${firstName} ${lastName}`.trim();

            const payload = {
                name
            };

            try {
                const data = await Auth.fetchWithAuth(`/users/${userId}`, {
                    method: 'PUT',
                    body: JSON.stringify(payload)
                });

                if (data.success) {
                    showToast('Profile updated successfully!');

                    // Update localStorage session for header display
                    const newSession = Auth.getSession();
                    if (newSession) {
                        newSession.firstName = firstName;
                        newSession.lastName  = lastName;
                        localStorage.setItem('bandpath_session', JSON.stringify(newSession));
                    }

                    // Update sidebar immediately without full reload
                    const displayName = `${firstName} ${lastName}`.trim();
                    if (sidebarName) sidebarName.textContent = displayName;
                    renderAvatar(firstName);
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

    // ── Avatar upload logic ──────────────────────────────────
    const avatarFileInput = document.getElementById('prof-avatarFileInput');

    if (uploadBtn && avatarFileInput) {
        uploadBtn.addEventListener('click', () => {
            avatarFileInput.click();
        });

        avatarFileInput.addEventListener('change', async () => {
            const file = avatarFileInput.files[0];
            if (!file) return;

            // Size limit check (2MB)
            if (file.size > 2 * 1024 * 1024) {
                showToast('File is too large. Max 2MB allowed.', '#dc2626');
                avatarFileInput.value = '';
                return;
            }

            const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                showToast('Only JPG, PNG, or WebP images are allowed.', '#dc2626');
                avatarFileInput.value = '';
                return;
            }

            const formData = new FormData();
            formData.append('avatar', file);

            uploadBtn.textContent = 'Uploading...';
            uploadBtn.disabled    = true;

            try {
                const session = Auth.getSession();
                const token   = Auth.getToken();

                const response = await fetch(`http://localhost:5000/api/users/${userId}/upload-avatar`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                });

                const data = await response.json();

                if (data.success) {
                    const avatarUrlWithCacheBuster = `${data.avatarUrl}?t=${Date.now()}`;
                    const fullAvatarUrl = `http://localhost:5000${avatarUrlWithCacheBuster}`;

                    // 1. Update Sidebar
                    renderAvatar(firstNameEl?.value, data.avatarUrl);

                    // 2. Update Profile Preview
                    const imgPreview = document.getElementById('prof-imgPreview');
                    if (imgPreview) imgPreview.src = fullAvatarUrl;

                    // 3. Update Session
                    const newSession = Auth.getSession();
                    if (newSession) {
                        newSession.avatarUrl = data.avatarUrl;
                        localStorage.setItem('bandpath_session', JSON.stringify(newSession));
                    }

                    // 4. Update Header Avatar
                    const headerAvatar = document.querySelector('.ava-header');
                    if (headerAvatar) {
                        headerAvatar.innerHTML = `<img src="${fullAvatarUrl}" 
                            style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
                    }

                    showToast('Profile picture updated!', '#16a34a');
                } else {
                    showToast(data.message || 'Upload failed.', '#dc2626');
                }
            } catch (err) {
                console.error('Avatar upload error:', err);
                showToast('Upload error. Please try again.', '#dc2626');
            } finally {
                uploadBtn.textContent = 'Upload Image';
                uploadBtn.disabled    = false;
                avatarFileInput.value = '';
            }
        });
    }

    // ── Load purchases ────────────────────────────────────────
    loadEnrollments();

    // ── Review Modal Event Listeners ────────────────────────
    const stars = document.querySelectorAll('#star-selector span');
    stars.forEach(s => {
        s.addEventListener('mouseover', () => {
            const r = parseInt(s.getAttribute('data-rating'));
            stars.forEach(star => {
                const sr = parseInt(star.getAttribute('data-rating'));
                star.style.color = sr <= r ? '#fbbf24' : '#cbd5e1';
            });
        });
        s.addEventListener('mouseout', () => {
            setRating(currentRating);
        });
        s.addEventListener('click', () => {
            setRating(parseInt(s.getAttribute('data-rating')));
        });
    });

    const closeBtn = document.getElementById('close-review-modal');
    const modal = document.getElementById('review-modal');
    if (closeBtn) closeBtn.onclick = () => modal.style.display = 'none';
    
    const submitBtn = document.getElementById('submit-review-btn');
    if (submitBtn) {
        submitBtn.onclick = async () => {
            if (currentRating === 0) {
                showToast('Please select a star rating.', '#dc2626');
                return;
            }
            
            const comment = document.getElementById('review-comment').value.trim();
            submitBtn.disabled = true;
            submitBtn.textContent = 'Submitting...';
            
            try {
                const res = await Auth.fetchWithAuth('/reviews', {
                    method: 'POST',
                    body: JSON.stringify({
                        courseId: currentReviewCourseId,
                        rating: currentRating,
                        comment
                    })
                });
                
                if (res.success) {
                    modal.style.display = 'none';
                    showToast('Review submitted successfully!');
                    loadEnrollments(); // Refresh to update button text
                    if (document.getElementById('tab-reviews').classList.contains('active')) {
                        loadMyReviews();
                    }
                } else {
                    showToast(res.message || 'Failed to submit review.', '#dc2626');
                }
            } catch (err) {
                showToast('Error submitting review.', '#dc2626');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Submit Review';
            }
        };
    }
});

// ── Fetch & render purchased content ─────────────────────────
async function loadEnrollments() {
    const grid = document.getElementById('enrolled-courses-grid');
    if (!grid) return;

    try {
        const data = await Auth.fetchWithAuth('/enrollments/my');
        if (data.success && data.enrollments.length > 0) {
            grid.innerHTML = data.enrollments.map(e => {
                const userReview = e.course.reviews && e.course.reviews.length > 0 ? e.course.reviews[0] : null;
                const reviewBtnText = userReview ? 'Edit Review' : 'Write a Review';
                const reviewBtnHtml = e.payment?.status === 'FULFILLED' 
                    ? `<button onclick="event.stopPropagation(); openReviewModal(${e.course.id}, '${e.course.title.replace(/'/g, "\\'")}', ${userReview ? JSON.stringify(userReview).replace(/"/g, '&quot;') : 'null'})" style="margin-top:12px; width:100%; padding:8px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; font-size:12px; font-weight:600; color:#4f46e5; cursor:pointer; transition:all 0.2s;">${reviewBtnText}</button>`
                    : '';

                return `
                <div class="course-card" style="background:white; border:1px solid #e2e8f0; border-radius:12px; overflow:hidden; cursor:pointer;" onclick="window.location.href='../course/?id=${e.course.id}'">
                    <img src="${e.course.image || '../Rectangle 1080.png'}" onerror="this.src='../Rectangle 1080.png'" style="width:100%; height:160px; object-fit:cover;">
                    <div style="padding:16px;">
                        <h3 style="font-size:16px; margin-bottom:4px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; min-height:44px;">${e.course.title}</h3>
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:12px;">
                            <span style="font-size:14px; font-weight:700; color:#0f172a;">$${e.course.price.toFixed(2)}</span>
                            ${e.payment?.status === 'FULFILLED'
                                ? '<span style="font-size:11px; padding:4px 8px; background:#ecfdf5; color:#059669; border-radius:4px; font-weight:700; border:1px solid #10b981;">✅ Sent</span>'
                                : '<span style="font-size:12px; padding:4px 8px; background:rgba(22,163,74,0.1); color:#16a34a; border-radius:4px; font-weight:600;">✔ Paid</span>'
                            }
                        </div>
                        ${reviewBtnHtml}
                    </div>
                </div>
            `;}).join('');
        } else {
            grid.innerHTML = `
                <div style="grid-column: 1 / -1; padding: 40px; text-align: center; border: 1px dashed #cbd5e1; border-radius: 12px;">
                    <p style="color: #64748b; margin-bottom: 16px;">You haven't purchased any courses yet.</p>
                    <a href="../category/" style="color: #4f46e5; font-weight: 600; text-decoration: none;">Explore Courses →</a>
                </div>
            `;
        }
    } catch (err) {
        if (grid) grid.innerHTML = '<p style="color: #dc2626;">Error loading purchases. Please try again.</p>';
    }
}

// ── Fetch & render my reviews ────────────────────────────────
async function loadMyReviews() {
    const container = document.getElementById('my-reviews-container');
    if (!container) return;

    try {
        const data = await Auth.fetchWithAuth('/reviews/my');
        if (data.success && data.reviews.length > 0) {
            container.innerHTML = data.reviews.map(r => `
                <div class="review-card" style="background:white; border:1px solid #e2e8f0; border-radius:12px; padding:20px; display:flex; flex-direction:column; gap:12px;">
                    <div style="display:flex; gap:16px; align-items:center;">
                        <img src="${r.course.image || '../Rectangle 1080.png'}" onerror="this.src='../Rectangle 1080.png'" style="width:60px; height:60px; border-radius:8px; object-fit:cover;">
                        <div>
                            <h3 style="font-size:16px; font-weight:600; color:#0f172a; margin-bottom:4px;">${r.course.title}</h3>
                            <div style="color:#fbbf24; font-size:16px; letter-spacing:2px;">${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</div>
                        </div>
                    </div>
                    <p style="color:#475569; font-size:14px; line-height:1.5; font-style:italic;">"${r.comment || 'No comment provided.'}"</p>
                    <div style="margin-top:auto; font-size:12px; color:#94a3b8;">Reviewed on ${new Date(r.createdAt).toLocaleDateString()}</div>
                </div>
            `).join('');
        } else {
            container.innerHTML = `
                <div style="grid-column: 1 / -1; padding: 40px; text-align: center; border: 1px dashed #cbd5e1; border-radius: 12px;">
                    <p style="color: #64748b; margin-bottom: 16px;">You haven't shared your thoughts on any courses yet.</p>
                    <button onclick="switchTab('purchases')" style="background:none; border:none; color:#4f46e5; font-weight:600; cursor:pointer; font-size:14px;">Review your purchases →</button>
                </div>
            `;
        }
    } catch (err) {
        container.innerHTML = '<p style="color: #dc2626;">Error loading reviews. Please try again.</p>';
    }
}
