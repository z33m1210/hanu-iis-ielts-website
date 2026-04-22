document.addEventListener('DOMContentLoaded', async () => {
    // RBAC Check
    const user = Auth.getUser();
    if (!user || user.role !== 'ADMIN') {
        window.location.href = '../sign-in/';
        return;
    }

    // Stats Animation Helper
    function countUp(elementId, targetValue, duration = 1000) {
        const el = document.getElementById(elementId);
        if (!el) return;
        
        let start = 0;
        const end = parseInt(targetValue);
        if (isNaN(end)) {
            el.textContent = targetValue;
            return;
        }

        const stepTime = Math.abs(Math.floor(duration / end));
        const timer = setInterval(() => {
            start += Math.ceil(end / 30); // Increment in chunks for smoothness
            if (start >= end) {
                el.textContent = end;
                clearInterval(timer);
            } else {
                el.textContent = start;
            }
        }, 30);
    }

    // Initialize UI
    document.getElementById('adminName').textContent = user.fullName || user.username;
    document.getElementById('adminInitial').textContent = (user.fullName || user.username).charAt(0).toUpperCase();

    // Fetch Stats
    async function fetchStats() {
        try {
            const data = await Auth.fetchWithAuth('/admin/stats');
            if (data.success) {
                const { stats, recentActivity, enrollmentTrends } = data;
                
                // Update Stats Grid with animation
                countUp('totalUsersCount', stats.totalUsers);
                countUp('activeUsersCount', stats.activeUsers);
                countUp('coursesCount', stats.totalCourses);
                countUp('systemPerformance', stats.performance);

                // Update Visualizations
                renderRecentActivity(recentActivity);
                if (enrollmentTrends) {
                    renderEnrollmentTrends(enrollmentTrends);
                }

                // Add Click Handlers for Drill-down
                const activeCard = document.getElementById('activeUsersCount').closest('.stat-card');
                if (activeCard) {
                    activeCard.style.cursor = 'pointer';
                    activeCard.onclick = () => window.location.href = 'users/?status=active';
                }

                const totalCard = document.getElementById('totalUsersCount').closest('.stat-card');
                if (totalCard) {
                    totalCard.style.cursor = 'pointer';
                    totalCard.onclick = () => window.location.href = 'users/';
                }
            }
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
        }
    }

    function renderEnrollmentTrends(trends) {
        const chart = document.getElementById('enrollmentTrendsChart');
        if (!chart) return;

        const maxCount = Math.max(...trends.map(t => t.count), 1); // Avoid division by zero
        
        chart.innerHTML = trends.map(t => {
            const heightPerc = (t.count / maxCount) * 100;
            const dateObj = new Date(t.date);
            const label = dateObj.toLocaleDateString('en-US', { weekday: 'short' });

            return `
                <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; height: 100%; justify-content: flex-end;">
                    <div class="chart-bar" style="width: 100%; max-width: 32px; height: ${heightPerc}%; background: var(--primary); border-radius: 4px 4px 0 0; transition: height 0.6s ease; position: relative;" title="${t.date}: ${t.count} enrollments">
                        <div style="position: absolute; top: -20px; left: 50%; transform: translateX(-50%); font-size: 0.625rem; font-weight: 700; color: var(--primary); opacity: ${t.count > 0 ? 1 : 0};">${t.count}</div>
                    </div>
                    <span style="font-size: 0.625rem; font-weight: 600; color: var(--on-surface-variant); text-transform: uppercase;">${label}</span>
                </div>
            `;
        }).join('');
    }

    function renderRecentActivity(activity) {
        const activityList = document.getElementById('recentActivityList');
        if (!activityList) return;

        let html = '';
        
        // Show Enrollments
        activity.enrollments.forEach(enroll => {
            html += `
                <li style="display: flex; gap: 1rem; font-size: 0.875rem;">
                    <div style="width: 8px; height: 8px; border-radius: 50%; background: var(--success); margin-top: 0.35rem;"></div>
                    <div>
                        <p style="font-weight: 600;">${enroll.student?.name || 'Student'}</p>
                        <p style="color: var(--on-surface-variant);">Enrolled in "${enroll.course?.title || 'Course'}"</p>
                    </div>
                </li>
            `;
        });

        // Show New Users
        activity.users.forEach(u => {
            html += `
                <li style="display: flex; gap: 1rem; font-size: 0.875rem;">
                    <div style="width: 8px; height: 8px; border-radius: 50%; background: var(--primary); margin-top: 0.35rem;"></div>
                    <div>
                        <p style="font-weight: 600;">${u.name || u.email}</p>
                        <p style="color: var(--on-surface-variant);">New ${u.role.toLowerCase()} joined the platform</p>
                    </div>
                </li>
            `;
        });

        activityList.innerHTML = html || '<p style="font-size: 0.875rem; color: var(--on-surface-variant); text-align: center; width: 100%;">No recent activity recorded.</p>';
    }

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', (e) => {
        e.preventDefault();
        Auth.logout();
        window.location.href = '../sign-in/';
    });

    fetchStats();
});
