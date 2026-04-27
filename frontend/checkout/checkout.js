let checkoutItems = [];

document.addEventListener('DOMContentLoaded', async () => {
    // ── Breadcrumb Dynamic Link ──
    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get('id');
    const detailsLink = document.getElementById('breadcrumb-details');
    if (detailsLink && courseId) {
        detailsLink.href = `../course/?id=${courseId}`;
    }

    if (!Auth.isLoggedIn()) {
        window.location.href = '../sign-in/';
        return;
    }

    // ── 1. User Session Auto-fill ───────────────────────
    const session = Auth.getSession();
    const billingNameInput = document.querySelector('.cd-input');
    if (session && billingNameInput) {
        billingNameInput.value = `${session.firstName} ${session.lastName}`.trim();
    }

    // ── 2. Payment Method Toggle ────────────────────────
    setupPaymentToggle();

    const directBuyId = courseId;

    if (directBuyId) {
        try {
            const data = await Auth.fetchWithAuth(`/courses/${directBuyId}`);
            if (data.success) {
                checkoutItems = [data.course];
            } else {
                throw new Error('Course not found');
            }
        } catch (err) {
            console.error('Direct buy error:', err);
            alert('Unable to load course details. Falling back to cart.');
            checkoutItems = Cart.getItems();
        }
    } else {
        checkoutItems = Cart.getItems();
    }

    if (checkoutItems.length === 0) {
        alert('Your cart is empty. Redirecting to courses...');
        window.location.href = '../category/';
        return;
    }

    renderOrderSummary();

    // ── 3. Loading State Handover ───────────────────────
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.style.opacity = '0';
        setTimeout(() => overlay.style.display = 'none', 500);
    }

    const submitBtn = document.querySelector('.submit-button');
    if (submitBtn) {
        submitBtn.addEventListener('click', handleCheckout);
    }
});

function setupPaymentToggle() {
    const radios = document.querySelectorAll('input[name="choice"]');
    const cardFields = document.querySelector('.paybox');
    
    // Initial state: ensure card fields are visible if first radio is checked
    radios.forEach((radio, index) => {
        radio.addEventListener('change', (e) => {
            if (index === 0) { // Credit Card
                // Keep card inputs visible
                document.querySelectorAll('.NoC, .cnum, .ED, .CVC').forEach(el => el.style.display = 'block');
                cardFields.style.opacity = '1';
            } else { // PayPal
                // Hide card specific inputs
                document.querySelectorAll('.NoC, .cnum, .ED, .CVC').forEach(el => el.style.display = 'none');
                // Show a message or just leave it clean
                const msg = document.createElement('p');
                msg.id = 'gateway-msg';
                msg.textContent = 'You will be redirected to the PayPal gateway.';
                msg.style.padding = '20px';
                msg.style.color = '#666';
                if (!document.getElementById('gateway-msg')) cardFields.appendChild(msg);
            }
        });
    });
}

function renderOrderSummary() {
    const firstItem = checkoutItems[0];
    const courseNameEl = document.getElementById('course-name');
    const courseMetaEl = document.getElementById('description');
    const coursePriceEl = document.getElementById('price');
    const courseImgEl   = document.getElementById('purchaser');

    if (courseNameEl)  courseNameEl.textContent  = firstItem.title;
    if (courseMetaEl)  courseMetaEl.textContent  = `${firstItem.lectures || 0} Lectures • ${firstItem.hours || 0} Total Hours`;
    if (coursePriceEl) coursePriceEl.textContent = `$${firstItem.price.toFixed(2)}`;
    if (courseImgEl && (firstItem.image || firstItem.thumbnail)) {
        courseImgEl.src = firstItem.image || firstItem.thumbnail;
    }

    // ── 4. Dynamic Price Logic: Original -> Discount -> Total ──
    const discountedSubtotal = checkoutItems.reduce((sum, i) => sum + (i.price || 0), 0);
    const originalTotal      = checkoutItems.reduce((sum, i) => sum + (i.originalPrice || i.price || 0), 0);
    const savings            = originalTotal - discountedSubtotal;
    
    const tax = discountedSubtotal * 0.1; 
    const total = discountedSubtotal + tax;

    const priceEl    = document.getElementById('price-num');    // Labeled 'Price' in UI
    const discountEl = document.getElementById('discount-num'); // Labeled 'Discount' in UI
    const taxEl      = document.getElementById('tax-num');
    const totalEl    = document.getElementById('total-num');

    // 1. Show the high 'Original Price' in the first slot
    if (priceEl) priceEl.textContent = `$${originalTotal.toFixed(2)}`;

    // 2. Show the 'Savings' in the second slot
    if (discountEl) {
        if (savings > 0) {
            discountEl.textContent = `-$${savings.toFixed(2)}`;
            discountEl.parentElement.style.display = 'flex';
        } else {
            discountEl.parentElement.style.display = 'none';
        }
    }

    // 3. Tax and Final Total based on the SALE price
    if (taxEl)   taxEl.textContent   = `$${tax.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;
    
    window.currentTotal = total;
}

async function handleCheckout() {
    const submitBtn = document.querySelector('.submit-button');

    if (checkoutItems.length === 0) return;

    // 1. UI 'Processing' State
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Processing your order...';
    submitBtn.disabled = true;

    try {
        const response = await Auth.fetchWithAuth('/payments/checkout', {
            method: 'POST',
            body: JSON.stringify({
                courseIds: checkoutItems.map(i => i.id)
            })
        });

        if (response.success) {
            // Save purchase data for the success page
            const session = Auth.getSession();
            const firstItem = checkoutItems[0];
            sessionStorage.setItem('last_purchase', JSON.stringify({
                customerName: session ? `${session.firstName} ${session.lastName}`.trim() : 'Valued Customer',
                courseTitle: firstItem ? firstItem.title : 'Your Course'
            }));

            // Clear cart
            Cart.clear();

            // 2. Redirect Path Handling (MoMo or Local)
            const redirectPath = response.redirectUrl || response.payUrl;
            if (redirectPath) {
                window.location.href = redirectPath;
            } else {
                // Fallback if no redirect is provided
                window.location.href = '../profile/';
            }
        } else {
            alert(response.message || 'Payment failed. Please try again.');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    } catch (err) {
        console.error('Checkout error:', err);
        alert('An error occurred during checkout.');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}
