// admin/orders.js
document.addEventListener('DOMContentLoaded', async () => {
    const tableBody = document.getElementById('ordersTableBody');
    const tabPending = document.getElementById('tabPending');
    const tabFulfilled = document.getElementById('tabFulfilled');
    
    let currentStatus = 'COMPLETED';

    async function loadOrders() {
        try {
            const data = await Auth.fetchWithAuth(`/admin/orders?status=${currentStatus}`);
            if (data.success) {
                renderOrders(data.orders);
            }
        } catch (err) {
            console.error('Failed to load orders:', err);
        }
    }

    function renderOrders(orders) {
        if (!tableBody) return;

        if (!orders || orders.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:2rem;">No ${currentStatus.toLowerCase()} orders found.</td></tr>`;
            return;
        }

        tableBody.innerHTML = orders.map(order => {
            const courses = order.enrollments.map(e => e.course.title).join(', ');
            const date = new Date(order.createdAt).toLocaleDateString();
            const isFulfilled = order.status === 'FULFILLED';
            
            return `
                <tr class="${order.isRead ? '' : 'unread-order'}" style="${order.isRead ? '' : 'background: rgba(186, 26, 26, 0.05);'}">
                    <td>#${order.id}</td>
                    <td><strong>${order.student.name || 'N/A'}</strong></td>
                    <td>${order.student.email}</td>
                    <td><div style="max-width:250px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${courses}">${courses}</div></td>
                    <td><strong>$${order.amount.toFixed(2)}</strong></td>
                    <td>${date}</td>
                    <td><span class="badge ${isFulfilled ? 'badge-published' : 'badge-draft'}">${order.status}</span></td>
                    <td>
                        ${isFulfilled ? 
                            '<span style="color:var(--success); font-size:12px;">Sent to Email</span>' : 
                            `<button class="btn-primary" style="padding: 0.4rem 0.8rem; font-size: 12px; background: #059669;" onclick="fulfillOrder(${order.id})">Fulfill</button>`
                        }
                    </td>
                </tr>
            `;
        }).join('');
    }

    window.fulfillOrder = async (id) => {
        const driveLink = prompt("Please enter the Google Drive access link for this user:");
        if (!driveLink) return;

        try {
            const data = await Auth.fetchWithAuth(`/admin/orders/${id}/fulfill`, {
                method: 'PATCH',
                body: JSON.stringify({ driveLink })
            });

            if (data.success) {
                alert("Order fulfilled and email sent!");
                loadOrders();
                if (window.updateUnreadBadge) window.updateUnreadBadge();
            } else {
                alert("Error: " + data.message);
            }
        } catch (err) {
            console.error('Error fulfilling order:', err);
            alert("Failed to fulfill order. Check console.");
        }
    };

    // Tab Switching Logic with null checks
    if (tabPending) {
        tabPending.addEventListener('click', () => {
            currentStatus = 'COMPLETED';
            updateTabs();
            loadOrders();
        });
    }

    if (tabFulfilled) {
        tabFulfilled.addEventListener('click', () => {
            currentStatus = 'FULFILLED';
            updateTabs();
            loadOrders();
        });
    }

    function updateTabs() {
        [tabPending, tabFulfilled].forEach(tab => {
            if (tab) {
                tab.classList.remove('active');
                tab.style.borderBottomColor = 'transparent';
                tab.style.color = 'var(--on-surface-variant)';
            }
        });

        const activeTab = currentStatus === 'COMPLETED' ? tabPending : tabFulfilled;
        if (activeTab) {
            activeTab.classList.add('active');
            activeTab.style.borderBottomColor = 'var(--primary)';
            activeTab.style.color = 'var(--primary)';
        }
    }

    loadOrders();
});
