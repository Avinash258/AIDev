import { defineConfig, devices } from '@playwright/test';
import { getBaseURL, getEnv } from './src/config/env';

const env = getEnv();

/**
 * See https://playwright.dev/docs/test-configuration.
 * Switch environment: TEST_ENV=dev|qa|stage
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  metadata: {
    environment: env.name,
    baseURL: env.baseURL,
  },
  use: {
    baseURL: getBaseURL(),
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
