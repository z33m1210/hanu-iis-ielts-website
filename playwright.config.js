const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Keep it sequential to avoid DB locks in SQLite
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5174',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'npm run dev',
      cwd: './backend',
      port: 5000,
      reuseExistingServer: !process.env.CI,
      env: {
        DATABASE_URL: 'file:./dev_test.db',
      }
    },
    {
      command: 'npm run dev',
      cwd: './frontend',
      port: 5174,
      reuseExistingServer: !process.env.CI,
    }
  ],
});
