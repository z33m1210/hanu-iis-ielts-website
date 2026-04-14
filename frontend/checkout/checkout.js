// ============================================================
//  checkout.js  –  Dynamic logic for checkout.html
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    if (!Auth.isLoggedIn()) {
        window.location.href = '../sign-in/';
        return;
    }

    renderOrderSummary();

    const submitBtn = document.querySelector('.submit-button');
    if (submitBtn) {
        submitBtn.addEventListener('click', handleCheckout);
    }
});

function renderOrderSummary() {
    const items = Cart.getItems();
    const stats = Cart.getStats();

    if (items.length === 0) {
        alert('Your cart is empty. Redirecting to courses...');
        window.location.href = '../category/';
        return;
    }

    // 1. Update the preview of the FIRST item in the cart (mock design usually shows one)
    const firstItem = items[0];
    const courseNameEl = document.getElementById('course-name');
    const courseMetaEl = document.getElementById('description');
    const coursePriceEl = document.getElementById('price');
    const courseImgEl   = document.getElementById('purchaser');

    if (courseNameEl)  courseNameEl.textContent  = firstItem.title;
    if (courseMetaEl)  courseMetaEl.textContent  = firstItem.meta || 'Online Course';
    if (coursePriceEl) coursePriceEl.textContent = `$${firstItem.price.toFixed(2)}`;
    // if (courseImgEl)   courseImgEl.src           = firstItem.image;

    // 2. Update totals
    const subtotalEl = document.getElementById('price-num');
    const taxEl      = document.getElementById('tax-num');
    const totalEl    = document.getElementById('total-num');

    if (subtotalEl) subtotalEl.textContent = `$${stats.subtotal.toFixed(2)}`;
    if (taxEl)      taxEl.textContent      = `$${stats.tax.toFixed(2)}`;
    if (totalEl)    totalEl.textContent    = `$${stats.total.toFixed(2)}`;
}

async function handleCheckout() {
    const submitBtn = document.querySelector('.submit-button');
    const items = Cart.getItems();
    const stats = Cart.getStats();

    if (items.length === 0) return;

    submitBtn.textContent = 'Processing...';
    submitBtn.disabled = true;

    try {
        const response = await Auth.fetchWithAuth('/payments/checkout', {
            method: 'POST',
            body: JSON.stringify({
                courseIds: items.map(i => i.id),
                amount: stats.total
            })
        });

        if (response.success) {
            // Clear cart
            Cart.clear();
            
            // Redirect to success page
            alert('Payment Successful! Thank you for your purchase.');
            window.location.href = '../order-completed/order_complete.html';
        } else {
            alert(response.message || 'Payment failed. Please try again.');
            submitBtn.textContent = 'Proceed to Checkout';
            submitBtn.disabled = false;
        }
    } catch (err) {
        console.error('Checkout error:', err);
        alert('An error occurred during checkout.');
        submitBtn.textContent = 'Proceed to Checkout';
        submitBtn.disabled = false;
    }
}
