# Recommended Cards Upgrade: Visual & Structural Redesign

This report outlines the plan to transform the existing static course cards on the homepage into premium, dynamic, and interactive components that reflect the latest database updates.

## 1. Structural Audit
- **Dynamic Thumbnails**: 
    - **Current**: Mostly hardcoded in `index.html` or static in `script.js`.
    - **Upgrade**: Fully bind the `img` src to the `thumbnail` (or `image`) field from the API. Implement an `onerror` fallback to a branded placeholder.
- **Metadata Slots**:
    - **Add**: `level-badge` (Beginner/Intermediate/Advanced) and `category-badge` (e.g., Speaking).
    - **Placement**: Floating in the top corners of the thumbnail area.
- **Price Verification**:
    - **Logic**: Use the `price` field as the primary sale price.
    - **Enhancement**: If `originalPrice` exists and is higher than `price`, display it with a strike-through next to the main price.

## 2. Visual Enhancements (CSS/UI)
- **Interactive States**:
    - **Subtle Lift**: Refine `transform: translateY(-5px)` with a custom cubic-bezier transition for a "premium" feel.
    - **Soft Shadow**: Replace harsh shadows with a multi-layered `box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)`.
- **Typography**:
    - **Weight**: Set `.course-title` to `font-weight: 600` (Semi-bold).
    - **Clamping**: Maintain `line-clamp: 2` to prevent layout breaking with long titles.
- **Badges**:
    - **Design**: Semi-transparent background (Glassmorphism) with high-contrast text.

## 3. Interactive Elements
- **Quick Add Feature**:
    - **UI**: Add a floating circular button in the bottom-right of the image area with a Lucide `shopping-cart` icon.
    - **Logic**: Wire it to the existing `Cart.addItem()` utility.
- **Navigation**:
    - Ensure the entire card (or specifically the image and title) is wrapped in an anchor or has an `onclick` listener pointing to `/course/?id=${course.id}`.

---

## 🛠️ Implementation Plan

### Phase 1: Global Style Update (`frontend/style.css`)
Modify the `.course-card` class and its children to support badges, the quick-add button, and refined hover effects.

### Phase 2: Logic Sync (`frontend/script.js`)
Update the `loadTopCourses()` function to:
1. Inject the new HTML structure (badges, original price, etc.).
2. Apply the dynamic thumbnail logic.
3. Bind the Quick Add button to the Cart service.

### Phase 3: Verification
Verify that **Course #30** (Accelerator) displays its unique thumbnail, shows its true price/discount, and that the "Quick Add" button correctly updates the cart count.
