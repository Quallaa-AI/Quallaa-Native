// *****************************************************************************
// Copyright (C) 2025 Quallaa AI
//
// This program and the accompanying materials are made available under the
// terms of the Eclipse Public License v. 2.0 which is available at
// http://www.eclipse.org/legal/epl-2.0.
//
// SPDX-License-Identifier: EPL-2.0 OR GPL-2.0-only WITH Classpath-exception-2.0
// *****************************************************************************

import { defineConfig, devices } from '@playwright/test';
import * as path from 'path';

/**
 * Playwright configuration for Quallaa Electron app testing
 *
 * See https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: '.',

  // Maximum time one test can run
  timeout: 60 * 1000,

  // Expect timeout for assertions
  expect: {
    timeout: 10000
  },

  // Run tests in files in parallel
  fullyParallel: false,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Reporter to use
  reporter: [
    ['html', { outputFolder: 'test-results/html' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['list']
  ],

  // Shared settings for all the projects below
  use: {
    // Collect trace when retrying the failed test
    trace: 'on-first-retry',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Video on failure
    video: 'retain-on-failure',
  },

  // Configure projects for different test categories
  projects: [
    {
      name: 'e2e',
      testDir: './e2e',
      use: {
        ...devices['Desktop Chrome'],
        // Electron-specific configuration will be added per test
      },
    },
    {
      name: 'build',
      testDir: './build',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'compliance',
      testDir: './compliance',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'performance',
      testDir: './performance',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],

  // Output folder for test artifacts
  outputDir: 'test-results/artifacts',
});
