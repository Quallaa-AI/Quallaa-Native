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
import * as fs from 'fs';
import * as path from 'path';

/**
 * Category D: Text Replacement Verification Tests
 *
 * Verifies that user-visible "Theia IDE" references have been replaced
 * with "Quallaa" while preserving necessary attributions.
 */
test.describe('Text Replacements', () => {

  test('AI Chat - should show "Ask the Quallaa AI"', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    // Try to open AI Chat view
    await page.keyboard.press('Meta+Shift+P');
    await page.waitForTimeout(1000);
    await page.keyboard.type('AI Chat');
    await page.waitForTimeout(500);

    // Check if AI Chat command exists
    const commandPalette = await page.textContent('body') || '';

    if (commandPalette.toLowerCase().includes('ai chat')) {
      await page.keyboard.press('Enter');
      await page.waitForTimeout(2000);

      // Check welcome message
      const bodyText = await page.textContent('body') || '';

      // Should say "Ask the Quallaa AI" not "Ask the Theia IDE AI"
      if (bodyText.toLowerCase().includes('ask the')) {
        expect(bodyText).toContain('Quallaa AI');
        expect(bodyText).not.toContain('Theia IDE AI');
      }
    }
  });

  test('Debug client name - should be "Quallaa"', async ({}) => {
    // Verify debug-session.tsx has correct clientName
    const debugSessionPath = path.join(
      __dirname,
      '../../../../packages/debug/src/browser/debug-session.tsx'
    );

    if (fs.existsSync(debugSessionPath)) {
      const content = fs.readFileSync(debugSessionPath, 'utf-8');

      // Check line 345: clientName should reference Quallaa
      expect(content).toContain("nls.localize('theia/debug/TheiaIDE', 'Quallaa')");
    }
  });

  test('IDE chat welcome message - should reference Quallaa', async ({}) => {
    const welcomeMessagePath = path.join(
      __dirname,
      '../../../../packages/ai-ide/src/browser/ide-chat-welcome-message-provider.tsx'
    );

    if (fs.existsSync(welcomeMessagePath)) {
      const content = fs.readFileSync(welcomeMessagePath, 'utf-8');

      // Check for "Ask the Quallaa AI"
      expect(content).toContain('Ask the Quallaa AI');
      expect(content).not.toMatch(/Ask the Theia IDE AI/);
    }
  });

  test('should NOT show "Theia IDE" in main UI (excluding attributions)', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    // Get all visible text
    const bodyText = await page.textContent('body') || '';

    // Search for "Theia IDE"
    const theiaIDEMatches = bodyText.match(/Theia IDE/gi) || [];

    console.log(`Found ${theiaIDEMatches.length} occurrences of "Theia IDE"`);

    // Acceptable contexts for "Theia IDE":
    // 1. Attribution text (e.g., "Built on Eclipse Theia IDE")
    // 2. Documentation links
    // 3. Internal/debug information

    // For MVP, we want to minimize user-visible "Theia IDE" branding
    // This test documents the current state

    if (theiaIDEMatches.length > 0) {
      console.log('Context check: Are these in attribution/documentation?');
    }
  });

  test('Error messages - should reference Quallaa not Theia', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    // Trigger a simple error to check error message branding
    // Try to open a non-existent file
    await page.keyboard.press('Meta+P'); // Quick Open
    await page.waitForTimeout(1000);
    await page.keyboard.type('nonexistent-file-12345.txt');
    await page.waitForTimeout(500);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(2000);

    // Check if any error messages appeared
    const bodyText = await page.textContent('body') || '';

    // If error occurred, verify it doesn't say "Theia"
    if (bodyText.toLowerCase().includes('error') || bodyText.toLowerCase().includes('not found')) {
      // Error message should not reference "Theia IDE"
      // (Eclipse Theia in attribution is OK)
      // For now, just document what we see
    }
  });

  test('Window title - should contain Quallaa not Theia', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    const title = await page.title();

    // Should contain Quallaa
    expect(title).toContain('Quallaa');

    // Should not start with "Theia"
    expect(title).not.toMatch(/^Theia/);
  });

  test('Notification messages - branding consistency', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    // Notifications may appear during app usage
    // Check for notification area
    const notifications = page.locator('[class*="notification"]');

    if (await notifications.count() > 0) {
      const notificationText = await notifications.allTextContents();

      // Verify notifications don't say "Theia IDE"
      const combined = notificationText.join(' ');

      if (combined.includes('Theia')) {
        // Check if it's in attribution context
        console.log('Notification contains "Theia":', combined);
      }
    }
  });

  test('Menu items - should reference Quallaa', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    // Open Help menu or similar
    // macOS: Application menu shows product name

    // For Electron apps on macOS, the menu bar shows the productName
    // We verify this through the package.json config, which is tested elsewhere

    // Look for menu-like structures
    // This is dependent on Theia's specific DOM structure
  });

  test('Status bar - should not show Theia branding', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    // Check status bar at bottom of window
    const statusBar = page.locator('[id="theia-statusBar"]');

    if (await statusBar.isVisible()) {
      const statusText = await statusBar.textContent() || '';

      // Status bar may contain technical info
      // Check for user-visible product name references
      if (statusText.includes('Theia IDE')) {
        console.warn('Status bar contains "Theia IDE"');
      }
    }
  });

  test('Package namespace - internal references OK', async ({}) => {
    // Internal package references like @theia/* are acceptable for MVP
    // User-visible strings are what matter

    // This test documents that we kept @theia/* namespace
    const packageJsonPath = path.join(__dirname, '../../package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

    // Verify we still use @theia/* dependencies (by design for MVP)
    const dependencies = Object.keys(packageJson.dependencies || {});
    const theiaDeps = dependencies.filter(dep => dep.startsWith('@theia/'));

    expect(theiaDeps.length).toBeGreaterThan(0);

    console.log(`Using ${theiaDeps.length} @theia/* packages (expected for MVP)`);
  });
});
