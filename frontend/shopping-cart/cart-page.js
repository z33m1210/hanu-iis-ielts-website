// ============================================================
//  cart-page.js  –  Dynamic logic for shopping-cart.html
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    renderCart();

    // Listen for cart updates
    document.addEventListener('cartUpdated', renderCart);
});

function renderCart() {
    const cartItemsContainer = document.querySelector('.cart-items');
    const cartInfoEl = document.querySelector('.cart-info');
    const items = Cart.getItems();
    const stats = Cart.getStats();

    // 1. Update Title / Counter
    if (cartInfoEl) {
        cartInfoEl.textContent = `${items.length} Course${items.length !== 1 ? 's' : ''} in cart`;
    }

    if (items.length === 0) {
        cartItemsContainer.innerHTML = `
            <div style="text-align: center; padding: 60px; color: #64748b; border: 1px dashed #e2e8f0; border-radius: 12px; grid-column: 1/-1;">
                <p style="font-size: 18px; margin-bottom: 20px;">Your cart is empty.</p>
                <a href="../category/" style="color: #2563eb; font-weight: 600; text-decoration: none;">Browse Courses →</a>
            </div>
        `;
        updateOrderDetails(0, 0, 0);
        return;
    }

    // 2. Render Items
    cartItemsContainer.innerHTML = items.map(item => `
        <div class="cart-item">
            <img src="${item.image || './image 3.png'}" alt="${item.title}" class="item-image">
            <div class="item-details">
                <div class="item-title" style="cursor:pointer;" onclick="window.location.href='../course/course-page.html?id=${item.id}'">${item.title}</div>
                <div class="item-author">By ${item.author || 'Instructor'}</div>
                <div class="item-rating">
                    <span class="rating-number">4.8</span>
                    <span class="stars">★★★★★</span>
                    <span class="rating-count">(Live Ratings)</span>
                </div>
                <div class="item-info">${item.meta || 'All Levels'}</div>
                <div class="item-actions">
                    <span class="action-link remove" onclick="Cart.removeItem(${item.id})">Remove</span>
                </div>
            </div>
            <div class="item-price">$${item.price}</div>
        </div>
    `).join('');

    // 3. Update Order Summary
    updateOrderDetails(stats.subtotal, stats.tax, stats.total);
}

function updateOrderDetails(subtotal, tax, total) {
    const priceEl = document.querySelector('.order-row:nth-child(2) .order-value');
    const taxEl   = document.querySelector('.order-row:nth-child(4) .order-value');
    const totalEl = document.querySelector('.order-total span:nth-child(2)');
    const checkoutBtn = document.querySelector('.checkout-btn');

    if (priceEl) priceEl.textContent = `$${subtotal.toFixed(2)}`;
    if (taxEl)   taxEl.textContent   = `$${tax.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;

    if (checkoutBtn) {
        checkoutBtn.disabled = subtotal <= 0;
        checkoutBtn.style.opacity = subtotal <= 0 ? '0.5' : '1';
        checkoutBtn.onclick = () => {
            if (!Auth.isLoggedIn()) {
                window.location.href = '../sign-in/';
            } else {
                window.location.href = '../checkout/checkout.html';
            }
        };
    }
}
