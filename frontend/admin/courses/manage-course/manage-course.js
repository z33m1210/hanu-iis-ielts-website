// manage-course.js

let currentCourse = null;

document.addEventListener('DOMContentLoaded', async () => {
    // 1. RBAC Check
    const user = Auth.getUser();
    if (!user || user.role !== 'ADMIN') {
        window.location.href = '../../../sign-in/';
        return;
    }

    // 2. Tab Management (Sidebar items)
    const tabs = document.querySelectorAll('.nav-links .nav-item[data-tab]');
    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = tab.getAttribute('data-tab');
            
            // UI Update
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            document.getElementById(targetId).classList.add('active');
        });
    });

    // 3. Level Selection
    document.querySelectorAll('.level-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.level-btn').forEach(b => {
                b.classList.remove('active');
            });
            btn.classList.add('active');
        });
    });

    // 4. Load Data
    const params = new URLSearchParams(window.location.search);
    const courseId = params.get('id');

    if (!courseId) {
        alert('No course ID provided');
        window.location.href = '../';
        return;
    }

    await loadCourseData(courseId);
});

async function loadCourseData(id) {
    try {
        const data = await Auth.fetchWithAuth(`/courses/${id}`);
        if (!data.success) throw new Error('Course not found');
        
        currentCourse = data.course;
        // Pre-parse syllabus for consistency
        try {
            if (currentCourse.syllabus && typeof currentCourse.syllabus === 'string') {
                currentCourse.syllabus = JSON.parse(currentCourse.syllabus);
            }
        } catch (e) {
            console.error('Syllabus parse error:', e);
            currentCourse.syllabus = [];
        }

        if (!Array.isArray(currentCourse.syllabus)) {
            currentCourse.syllabus = [];
        }
        
        populateForm(currentCourse);
    } catch (err) {
        console.error(err);
        showToast('Failed to load course data', 'error');
    }
}

function populateForm(course) {
    // Header & Titles
    document.getElementById('pageTitle').textContent = course.title;
    document.getElementById('headerSubtitle').textContent = `ID: ${course.id} • ${course.category || 'No Category'}`;
    
    // Status Badge
    const statusBadge = document.getElementById('statusBadge');
    statusBadge.textContent = course.isPublished ? 'Published' : 'Draft';
    statusBadge.className = `badge ${course.isPublished ? 'badge-published' : 'badge-draft'}`;

    // General Info
    document.getElementById('courseTitle').value = course.title;
    document.getElementById('courseDesc').value  = course.description || '';
    document.getElementById('courseCategory').value = (course.category || 'full').toLowerCase();
    document.getElementById('coursePrice').value = course.price;
    document.getElementById('courseIsPublished').checked = course.isPublished;

    // Stats
    document.getElementById('statLectures').value = course.lectures || 0;
    document.getElementById('statHours').value    = course.hours || 0;
    document.getElementById('statChapters').value = course.chapters || 0;

    // Level
    const levelBtn = document.querySelector(`.level-btn[data-level="${course.level || 'Beginner'}"]`);
    if (levelBtn) levelBtn.click();

    // Media
    const previewImg = document.getElementById('thumbnailPreview');
    const placeholder = document.getElementById('thumbnailPlaceholder');
    const urlInput = document.getElementById('courseThumbnailUrl');

    if (course.thumbnail) {
        previewImg.src = course.thumbnail;
        previewImg.style.display = 'block';
        placeholder.style.display = 'none';
        urlInput.value = course.thumbnail;
    } else {
        previewImg.style.display = 'none';
        placeholder.style.display = 'block';
        urlInput.value = '';
    }

    // Curriculum
    renderCurriculum(course.syllabus || []);
}

function renderCurriculum(syllabusData) {
    let syllabus = [];
    try {
        syllabus = typeof syllabusData === 'string' ? JSON.parse(syllabusData) : (syllabusData || []);
    } catch (e) {
        syllabus = [];
    }
    
    if (!Array.isArray(syllabus)) syllabus = [];

    const container = document.getElementById('lessonList');
    if (syllabus.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 4rem; color: var(--on-surface-variant); background: var(--surface-container-low); border-radius: var(--radius-xl); border: 2px dashed var(--outline-variant);">
                <div style="width: 64px; height: 64px; background: var(--surface-container-high); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem;">
                    <i data-lucide="book-open" style="width: 32px; height: 32px; opacity: 0.5;"></i>
                </div>
                <p style="font-weight: 700; font-size: 1.125rem; margin-bottom: 0.5rem; color: var(--on-surface);">No Course Content</p>
                <p style="font-size: 0.875rem; opacity: 0.7; max-width: 250px; margin: 0 auto;">Start building your curriculum by adding your first lesson.</p>
            </div>
        `;
        if (window.lucide) lucide.createIcons();
        return;
    }
    
    container.innerHTML = syllabus.map((lesson, idx) => `
        <div class="lesson-card">
            <div style="display: flex; align-items: center; gap: 1.5rem;">
                <div style="width: 40px; height: 40px; background: var(--primary-container); color: var(--primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-family: var(--font-headline);">
                    ${idx + 1}
                </div>
                <div>
                    <span style="display: block; font-weight: 700; color: var(--on-surface); font-size: 1rem;">${lesson.title}</span>
                    <div style="display: flex; align-items: center; gap: 0.75rem; margin-top: 0.25rem;">
                        <span style="display: flex; align-items: center; gap: 0.25rem; font-size: 0.75rem; color: var(--on-surface-variant); font-weight: 600;">
                            <i data-lucide="play-circle" style="width: 12px;"></i> Video
                        </span>
                        <span style="width: 4px; height: 4px; background: var(--outline-variant); border-radius: 50%;"></span>
                        <span style="font-size: 0.75rem; color: var(--on-surface-variant); font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">${lesson.duration || '00:00'}</span>
                    </div>
                </div>
            </div>
            <div style="display: flex; gap: 0.75rem;">
                <button class="btn-primary" style="padding: 0.5rem; background: var(--surface-container-high); color: var(--on-surface-variant); min-width: auto; border: 1px solid var(--outline-variant);" onclick="editLesson(${idx})">
                    <i data-lucide="edit-2" style="width: 16px;"></i>
                </button>
                <button class="btn-danger" style="padding: 0.5rem; min-width: auto;" onclick="deleteLesson(${idx})">
                    <i data-lucide="trash-2" style="width: 16px;"></i>
                </button>
            </div>
        </div>
    `).join('');
    
    if (window.lucide) lucide.createIcons();
}

async function saveAllChanges() {
    if (!currentCourse) return;

    const selectedLevelBtn = document.querySelector('.level-btn.active');
    
    const body = {
        title: document.getElementById('courseTitle').value,
        description: document.getElementById('courseDesc').value,
        category: document.getElementById('courseCategory').value,
        price: parseFloat(document.getElementById('coursePrice').value),
        isPublished: document.getElementById('courseIsPublished').checked,
        level: selectedLevelBtn ? selectedLevelBtn.getAttribute('data-level') : currentCourse.level,
        thumbnail: document.getElementById('courseThumbnailUrl').value,
        syllabus: JSON.stringify(currentCourse.syllabus || []),
        lectures: parseInt(document.getElementById('statLectures').value) || 0,
        chapters: parseInt(document.getElementById('statChapters').value) || 0,
        hours: parseInt(document.getElementById('statHours').value) || 0
    };

    try {
        const response = await Auth.fetchWithAuth(`/courses/${currentCourse.id}`, {
            method: 'PUT',
            body: JSON.stringify(body)
        });

        if (response.success) {
            showToast('Changes saved successfully!', 'success');
            loadCourseData(currentCourse.id);
        } else {
            throw new Error(response.message);
        }
    } catch (err) {
        console.error(err);
        showToast('Failed to save changes: ' + err.message, 'error');
    }
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    const toastIcon = document.getElementById('toastIcon');

    toastMessage.textContent = message;
    toast.className = `toast show toast-${type}`;
    
    if (type === 'success') {
        toastIcon.setAttribute('data-lucide', 'check-circle');
    } else {
        toastIcon.setAttribute('data-lucide', 'alert-circle');
    }
    
    if (window.lucide) lucide.createIcons();

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Lesson Modal Functions
function addLesson() {
    document.getElementById('newLessonTitle').value = '';
    document.getElementById('newLessonDuration').value = '10:00';
    document.getElementById('lessonModal').classList.add('active');
}

function closeLessonModal() {
    document.getElementById('lessonModal').classList.remove('active');
}

function confirmAddLesson() {
    const title = document.getElementById('newLessonTitle').value;
    const duration = document.getElementById('newLessonDuration').value;
    
    if (!title) {
        showToast('Please enter a lesson title', 'error');
        return;
    }
    
    if (!currentCourse.syllabus) currentCourse.syllabus = [];
    currentCourse.syllabus.push({ title, duration });
    
    renderCurriculum(currentCourse.syllabus);
    closeLessonModal();
    showToast('Lesson added! Click Save to persist.', 'success');
}

function deleteLesson(idx) {
    if (confirm('Are you sure you want to delete this lesson?')) {
        currentCourse.syllabus.splice(idx, 1);
        renderCurriculum(currentCourse.syllabus);
        showToast('Lesson removed', 'success');
    }
}

function editLesson(idx) {
    const lesson = currentCourse.syllabus[idx];
    const newTitle = prompt('Edit Lesson Title:', lesson.title);
    if (newTitle !== null) {
        lesson.title = newTitle;
        renderCurriculum(currentCourse.syllabus);
    }
}
