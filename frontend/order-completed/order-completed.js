// order-completed/order-completed.js
document.addEventListener('DOMContentLoaded', () => {
    const customerNameEl = document.getElementById('successCustomerName');
    const courseTitleEl  = document.getElementById('successCourseTitle');
    const orderSummary   = document.getElementById('orderSummary');
    const primaryBtn     = document.getElementById('primaryActionBtn');
    const subtitle       = document.querySelector('.subtitle');

    // Retrieve purchase data from sessionStorage
    let purchaseData = null;
    try {
        purchaseData = JSON.parse(sessionStorage.getItem('last_purchase'));
    } catch (e) {
        purchaseData = null;
    }

    if (purchaseData && purchaseData.customerName && purchaseData.courseTitle) {
        // ── Valid purchase session ──────────────────────────
        if (customerNameEl) customerNameEl.textContent = purchaseData.customerName;
        if (courseTitleEl)  courseTitleEl.textContent  = purchaseData.courseTitle;
        if (orderSummary)   orderSummary.style.display = 'block';

        // Primary button → Continue Buying after a real order
        if (primaryBtn) {
            primaryBtn.textContent = 'Continue Buying';
            primaryBtn.onclick = () => window.location.href = '../category/';
        }

    } else {
        // ── Defensive: No session (direct navigation) ──────
        if (orderSummary) orderSummary.style.display = 'none';

        if (subtitle) {
            subtitle.textContent = "You don't have any recent orders. Ready to start your IELTS journey?";
        }

        // Change primary button to "Explore Courses"
        if (primaryBtn) {
            primaryBtn.textContent = 'Explore Courses';
            primaryBtn.onclick = () => window.location.href = '../category/';
        }
    }
});

