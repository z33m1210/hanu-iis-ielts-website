# Course Detail Testing Guide

Follow these steps to verify that the Course Detail page transition is working correctly.

## 1. Guest Access (Non-Logged In)
*   **Action**: Open `http://localhost:5174/course/?id=16` in an Incognito window or after logging out.
*   **Expected Results**:
    *   **Identity**: Title should be "IELTS Speaking Masterclass", and a description should appear.
    *   **Price**: The price should show (e.g., "$49.99").
    *   **Video**: A YouTube player should load in the hero section instead of a static image.
    *   **CTA**: The "Buy Now" and "Add to Cart" buttons should be visible and active.
    *   **Reviews**: Scroll down to see reviews with gold stars.

## 2. Buyer Access (Already Purchased)
*   **Action**: Log in with an account that has already purchased Course #16.
*   **Expected Results**:
    *   **Button State**: The "Buy Now" button should say **"Already Bought"**.
    *   **Styling**: The button should be grayed out and non-clickable.
    *   **Cart Logic**: The "Add to Cart" button should be hidden.
    *   **Review Form**: If the user hasn't reviewed yet, the "Leave a Review" form should appear above the review list.

## 3. Review Submission
*   **Action**:
    1. Log in as a buyer who hasn't reviewed yet.
    2. Scroll to the "Student Feedback" section.
    3. Select a star rating (1-5).
    4. Type a comment and click "Post Review".
*   **Expected Results**:
    *   An alert should say "Thank you for your review!".
    *   The page will reload, and your review should appear at the top of the list with the correct stars and date.

## 4. Edge Cases to Check
*   **Invalid ID**: Visit `http://localhost:5174/course/?id=999999`. It should redirect you to the homepage or show a safe error state.
*   **No Video**: Visit a course without a `previewVideoUrl`. It should gracefully fallback (currently handled by the rendering logic).
