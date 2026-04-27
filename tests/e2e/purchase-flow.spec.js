const { test, expect } = require('@playwright/test');

test.describe('Happy Path Purchase Flow', () => {
  const timestamp = Date.now();
  const testUser = {
    firstName: 'John',
    lastName: 'Doe',
    username: `johndoe${timestamp}`,
    email: `john${timestamp}@example.com`,
    password: 'Password123!',
    confirmPassword: 'Password123!'
  };

  test('should complete the entire purchase flow', async ({ page }) => {
    // 1. Registration
    await page.goto('/sign-up/');
    await page.fill('#firstName', testUser.firstName);
    await page.fill('#lastName', testUser.lastName);
    await page.fill('#username', testUser.username);
    await page.fill('#email', testUser.email);
    await page.fill('#password', testUser.password);
    await page.fill('#confirmPassword', testUser.confirmPassword);
    await page.click('#signup-btn');

    // Wait for redirect to category (sign-up redirects to category)
    await expect(page).toHaveURL(/\/category\//, { timeout: 10000 });
    
    // Verify token exists
    const token = await page.evaluate(() => localStorage.getItem('bandpath_token'));
    expect(token).not.toBeNull();

    // 2. Inventory - Add to Cart
    // Already at /category/
    await page.waitForSelector('.course-card');
    
    // Add to cart
    await page.locator('.cart-action').first().click();
    
    // Verify cart count updates (wait for async addToCart)
    await expect.poll(async () => {
      const text = await page.locator('#cart-count').innerText();
      return parseInt(text);
    }, { timeout: 10000 }).toBeGreaterThan(0);

    // 3. Checkout
    await page.goto('/checkout/');
    await page.fill('.country-input', 'Vietnam');
    await page.fill('.terry-input', 'Hanoi');
    await page.fill('.cd-input', 'John Doe');
    await page.fill('.cnum-input', '4242 4242 4242 4242');
    await page.fill('.ED-input', '12/25');
    await page.fill('.CVC-input', '123');
    
    // Intercept checkout API call
    const checkoutPromise = page.waitForResponse(response => 
      response.url().includes('/api/payments/checkout') && response.status() === 200
    );
    
    await page.click('.submit-button');
    
    await checkoutPromise;

    // 4. Verification
    await expect(page).toHaveURL(/\/order-completed\//, { timeout: 10000 });
    await expect(page.locator('p:has-text("Order Complete")')).toBeVisible();
  });
});
