import { defineConfig, devices } from '@playwright/test';

// Use the port from the environment when set, otherwise Astro's default, so
// parallel runs don't collide on one shared port.
const port = process.env.CONDUCTOR_PORT ?? '4321';
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: '.',
  timeout: 30_000,
  expect: {
    timeout: 5_000,
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.005,
    },
  },
  use: {
    baseURL,
    ...devices['Desktop Chrome'],
  },
  webServer: {
    command: `npm run docs:dev -- --host 127.0.0.1 --port ${port}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
  },
});
