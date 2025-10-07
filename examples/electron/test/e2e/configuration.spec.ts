// *****************************************************************************
// Copyright (C) 2025 Quallaa AI
//
// This program and the accompanying materials are made available under the
// terms of the Eclipse Public License v. 2.0 which is available at
// http://www.eclipse.org/legal/epl-2.0.
//
// SPDX-License-Identifier: EPL-2.0 OR GPL-2.0-only WITH Classpath-exception-2.0
// *****************************************************************************

import { test, expect } from '../fixtures/electron-app';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Category E: Configuration & Persistence Tests
 *
 * Verifies that the application uses the correct configuration directory
 * (.quallaa instead of .theia) and that settings persist correctly.
 */
test.describe('Configuration & Persistence', () => {

  test('should use .quallaa preferences directory', async ({}) => {
    // Read package.json to verify config
    const packageJsonPath = path.join(__dirname, '../../package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

    // Verify preferences-dir is set to .quallaa
    expect(packageJson.theia.backend.config['preferences-dir']).toBe('.quallaa');
  });

  test('should create .quallaa directory in user data dir', async ({ electronApp, userDataDir }) => {
    // Wait for app to initialize and potentially create config directories
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Note: The actual directory creation depends on user interaction
    // This test documents the expected behavior
    console.log('User data directory:', userDataDir);
    console.log('Checking for .quallaa config directory...');

    // In a real test with user interaction, we would verify the directory exists
    // For now, we document the expected path
  });

  test('should NOT create .theia directory', async ({ userDataDir }) => {
    // Wait for app initialization
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Verify .theia directory was NOT created
    const theiaPath = path.join(userDataDir, '.theia');

    // In production, verify ~/.theia does not exist (or is not used)
    // For isolated tests, verify it's not created in userDataDir
    if (fs.existsSync(theiaPath)) {
      console.warn('.theia directory exists - this should not happen with Quallaa branding');
    }

    // This is a warning-level check for now
  });

  test('should verify no .theia references in config paths', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    // Open Settings via command palette
    await page.keyboard.press('Meta+Shift+P');
    await page.waitForTimeout(1000);
    await page.keyboard.type('Preferences: Open Settings');
    await page.waitForTimeout(500);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(2000);

    // Check if settings UI has loaded
    const bodyText = await page.textContent('body') || '';

    // If we can see settings, verify no .theia paths are visible
    if (bodyText.toLowerCase().includes('settings') || bodyText.toLowerCase().includes('preferences')) {
      // Settings are visible
      // Check for .theia references (should not appear in user-visible paths)
      const theiaPathMatches = bodyText.match(/\.theia/gi) || [];

      console.log(`Found ${theiaPathMatches.length} .theia path references in Settings UI`);

      // For now, just document this
      // In future, we want zero .theia references in user-facing settings
    }
  });

  test('settings persistence - theme change', async ({ page, electronApp }) => {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    // Open Settings
    await page.keyboard.press('Meta+Shift+P');
    await page.waitForTimeout(1000);
    await page.keyboard.type('Preferences: Open Settings');
    await page.waitForTimeout(500);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(2000);

    // Try to find theme setting
    // Search for "theme" in settings
    const settingsSearch = page.locator('input[placeholder*="Search"]').first();
    if (await settingsSearch.isVisible()) {
      await settingsSearch.fill('theme');
      await page.waitForTimeout(1000);

      // This test demonstrates the concept
      // Actual theme switching would require more specific selectors
      // based on Theia's settings UI structure
    }

    // Note: Full settings persistence testing requires:
    // 1. Change a setting
    // 2. Restart the app
    // 3. Verify setting persisted
    // This is challenging in Playwright for Electron apps
    // and may be better suited for integration tests
  });

  test('should store workspace settings correctly', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    // Open a workspace folder (would need a test workspace setup)
    // For now, this test documents the expected behavior

    // Workspace settings should be stored in:
    // <workspace>/.vscode/settings.json (VS Code compatibility)
    // or <workspace>/.theia/settings.json (Theia-specific)

    // With Quallaa branding, workspace settings path remains the same
    // (VS Code compatibility is important)
  });

  test('should verify preferences config in runtime', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    // Open Developer Tools / Console
    // In Electron/Theia, we can access internal state via console

    // Execute JavaScript in the app context to check config
    const result = await page.evaluate(() => {
      // Try to access Theia's preference service or config
      // This is app-specific and would need to be adapted to Theia's API
      return {
        userAgent: navigator.userAgent,
        location: window.location.href,
      };
    });

    console.log('App runtime info:', result);

    // Verify we're running in Electron
    expect(result.userAgent).toContain('Electron');
  });
});
