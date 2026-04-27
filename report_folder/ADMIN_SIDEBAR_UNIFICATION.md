# Admin Sidebar Unification Report & Implementation Plan

This document outlines the standardization of the administrative sidebar across all admin pages, using the **User Management** page as the "Source of Truth".

## 1. Template Extraction

### Source of Truth
- **File**: `frontend/admin/users/index.html`
- **Component**: `<aside class="sidebar">`
- **Extracted HTML Structure**:
```html
<aside class="sidebar">
    <div class="sidebar-logo" style="cursor: pointer;" onclick="window.location.href='/admin/'">
        <img src="/logo (1).png" alt="BandPath Logo">
        <span>BandPath</span>
    </div>
    <nav>
        <ul class="nav-links">
            <li><a href="/admin/" class="nav-item"><i data-lucide="layout-dashboard"></i><span>Dashboard</span></a></li>
            <li><a href="/admin/users/" class="nav-item"><i data-lucide="users"></i><span>Users</span></a></li>
            <li><a href="/admin/courses/" class="nav-item"><i data-lucide="book-open"></i><span>Courses</span></a></li>
            <li>
                <a href="/admin/orders.html" class="nav-item">
                    <i data-lucide="shopping-cart"></i>
                    <span>Orders</span>
                    <span id="unreadOrdersBadge" class="badge" style="display: none;">0</span>
                </a>
            </li>
            <li><a href="/admin/settings/" class="nav-item"><i data-lucide="settings"></i><span>Settings</span></a></li>
            <li><a href="#" id="logoutBtn" class="nav-item"><i data-lucide="log-out"></i><span>Logout</span></a></li>
            <div class="mode-toggle-wrapper">
                <span class="toggle-label" id="custLabel">Customer</span>
                <label class="switch">
                    <input type="checkbox" id="modeToggle" checked data-redirect="/">
                    <span class="slider round"></span>
                </label>
                <span class="toggle-label active" id="adminLabel">Admin</span>
            </div>
        </ul>
    </nav>
</aside>
```

### CSS Audit
- **Primary File**: `frontend/admin/admin.css`
- **Key Classes**:
    - `.sidebar`: Main container styling (background, padding, flex layout).
    - `.nav-links`: List styling.
    - `.nav-item`: Base link styling with hover effects.
    - `.nav-item.active`: Highlight for current page (background color, primary text color, font weight).
    - `.mode-toggle-wrapper`: Design for the Customer/Admin switch.

## 2. Global Implementation

### Orders Page Fix
The sidebar in `frontend/admin/orders.html` will be updated to match the Source of Truth, including:
- Adding the `Mode Toggle` component.
- Standardizing the `Logout` button placement.
- Ensuring consistent iconography using Lucide.

### Link Verification
All navigation links will be converted to absolute paths (relative to the frontend root) to ensure they work regardless of the page's directory depth:
- Dashboard: `/admin/`
- User Management: `/admin/users/`
- Course Management: `/admin/courses/`
- Orders: `/admin/orders.html`
- Settings: `/admin/settings/`

### Active State Logic
A shared JavaScript utility will be added to `frontend/admin/common.js` to automatically handle the `.active` class:
```javascript
function updateActiveNavItem() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-item');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === '#' || !href) return;
        
        // Remove trailing slashes for comparison
        const normalizedHref = href.replace(/\/$/, '');
        const normalizedPath = currentPath.replace(/\/$/, '');
        
        if (normalizedPath.endsWith(normalizedHref)) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}
```

## 3. Responsive & Layout Alignment

### Main Content Wrapper
- Verification of `.main-content` padding (`2.5rem 3rem`) across all pages to ensure no layout shifting.
- `admin/orders.html` currently uses `padding: 2.5rem 3rem` (inherited from `admin.css`), matching other pages.

### Mobile Toggle
- Currently, the admin portal does not have a dedicated mobile hamburger menu in the CSS. 
- **Recommendation**: Implement a basic mobile toggle in `common.js` and `admin.css` if responsive design is required for the sidebar.

## 4. Verification Plan

1. **Visual Consistency**: Navigate between Dashboard, Users, Courses, and Orders. Confirm the sidebar remains static without jumps.
2. **Highlighting**: Verify that each page correctly highlights its respective menu item.
3. **Functional Toggle**: Confirm the Customer/Admin toggle correctly redirects and maintains visual state.
4. **Logout**: Verify the logout button works across all pages.
