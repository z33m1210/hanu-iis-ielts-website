document.addEventListener('DOMContentLoaded', async () => {
    // RBAC Check
    const user = Auth.getUser();
    if (!user || user.role !== 'ADMIN') {
        window.location.href = '../sign-in/';
        return;
    }

    let allCourses = [];

    // Fetch Courses
    async function fetchCourses() {
        try {
            const data = await Auth.fetchWithAuth('/courses?admin=true');
            if (data.success) {
                allCourses = data.courses;
                renderCourseTable(allCourses);
            }
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    }

    const CATEGORY_MAP = {
        'listening': 'Listening',
        'reading': 'Reading',
        'writing': 'Writing',
        'speaking': 'Speaking',
        'full': 'Full Course'
    };

    function renderCourseTable(courses) {
        const tbody = document.getElementById('courseTableBody');
        if (courses.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px;">No courses found.</td></tr>';
            return;
        }

        tbody.innerHTML = courses.map(c => `
            <tr>
                <td style="font-weight: 600;">${c.title}</td>
                <td>${CATEGORY_MAP[c.category.toLowerCase()] || c.category}</td>
                <td>${c.lectures || 0} Lectures</td>
                <td><span class="badge ${c.isPublished ? 'badge-published' : 'badge-draft'}">${c.isPublished ? 'Published' : 'Draft'}</span></td>
                <td>
                    <div class="actions">
                        <button class="action-btn" title="Edit" onclick="handleEdit('${c.id}')"><i data-lucide="edit-3"></i></button>
                        <button class="action-btn btn-delete" title="Delete" onclick="handleDelete('${c.id}')"><i data-lucide="trash-2"></i></button>
                    </div>
                </td>
            </tr>
        `).join('');

        if (window.lucide) lucide.createIcons();
    }

    window.handleDelete = (courseId) => {
        Confirm.show({
            title: 'Delete Course?',
            message: 'Are you sure you want to delete this course? This action cannot be undone.',
            onConfirm: async () => {
                try {
                    await Auth.fetchWithAuth(`/courses/${courseId}`, { method: 'DELETE' });
                    fetchCourses();
                } catch (error) {
                    alert('Failed to delete course: ' + error.message);
                }
            }
        });
    };

    window.closeCourseModal = () => {
        document.getElementById('editCourseModal').classList.remove('active');
    };

    window.openCreateCourseModal = () => {
        document.getElementById('createCourseForm').reset();
        document.getElementById('createCourseModal').classList.add('active');
        if (window.lucide) lucide.createIcons();
    };

    window.closeCreateCourseModal = () => {
        document.getElementById('createCourseModal').classList.remove('active');
    };

    window.submitCreateCourse = async () => {
        const title = document.getElementById('createCourseTitle').value;
        const description = document.getElementById('createCourseDescription').value;
        const category = document.getElementById('createCourseCategory').value;
        const level = document.getElementById('createCourseLevel').value;
        const price = parseFloat(document.getElementById('createCoursePrice').value);
        const originalPriceRaw = document.getElementById('createCourseOriginalPrice').value;
        const originalPrice = originalPriceRaw ? parseFloat(originalPriceRaw) : null;
        const hours = parseInt(document.getElementById('createCourseHours').value) || 0;
        const lectures = parseInt(document.getElementById('createCourseLectures').value);
        const chapters = parseInt(document.getElementById('createCourseChapters').value) || 0;

        if (!title || !description || !category || isNaN(price) || isNaN(lectures)) {
            alert('Please fill out all required fields correctly.');
            return;
        }

        try {
            await Auth.fetchWithAuth('/courses', {
                method: 'POST',
                body: JSON.stringify({ 
                    title, 
                    description, 
                    category,
                    level,
                    price,
                    originalPrice,
                    hours,
                    lectures,
                    chapters
                })
            });
            
            closeCreateCourseModal();
            fetchCourses(); // Refresh the list
        } catch (error) {
            alert('Failed to create course: ' + error.message);
        }
    };

    window.handleEdit = (courseId) => {
        const c = allCourses.find(course => course.id == courseId);
        if (!c) return;

        document.getElementById('editCourseId').value = c.id;
        document.getElementById('editCourseTitle').value = c.title;
        document.getElementById('editCourseDescription').value = c.description || '';
        document.getElementById('editCourseCategory').value = c.category;
        document.getElementById('editCourseStatus').value = c.isPublished ? 'true' : 'false';
        document.getElementById('editCourseLevel').value = c.level || 'Beginner';
        document.getElementById('editCoursePrice').value = c.price || 0;
        document.getElementById('editCourseOriginalPrice').value = c.originalPrice || '';
        document.getElementById('editCourseHours').value = c.hours || 0;
        document.getElementById('editCourseLectures').value = c.lectures || 0;
        document.getElementById('editCourseChapters').value = c.chapters || 0;

        document.getElementById('editCourseModal').classList.add('active');
        if (window.lucide) lucide.createIcons();
    };

    window.saveCourseEdits = async () => {
        const id = document.getElementById('editCourseId').value;
        const title = document.getElementById('editCourseTitle').value;
        const description = document.getElementById('editCourseDescription').value;
        const category = document.getElementById('editCourseCategory').value;
        const isPublished = document.getElementById('editCourseStatus').value === 'true';
        const level = document.getElementById('editCourseLevel').value;
        const price = parseFloat(document.getElementById('editCoursePrice').value);
        const originalPriceRaw = document.getElementById('editCourseOriginalPrice').value;
        const originalPrice = originalPriceRaw ? parseFloat(originalPriceRaw) : null;
        const hours = parseInt(document.getElementById('editCourseHours').value) || 0;
        const lectures = parseInt(document.getElementById('editCourseLectures').value) || 0;
        const chapters = parseInt(document.getElementById('editCourseChapters').value) || 0;

        try {
            await Auth.fetchWithAuth(`/courses/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ 
                    title, 
                    description, 
                    category, 
                    isPublished,
                    level,
                    price,
                    originalPrice,
                    hours,
                    lectures,
                    chapters
                })
            });
            
            closeCourseModal();
            fetchCourses(); // Refresh the list
        } catch (error) {
            alert('Failed to save changes: ' + error.message);
        }
    };

    fetchCourses();
});
