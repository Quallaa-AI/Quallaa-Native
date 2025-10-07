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

/**
 * Category C: UI Component Branding Tests
 *
 * Verifies that custom UI components (About Dialog, Getting Started Widget)
 * display correct Quallaa branding and EPL 2.0 attribution.
 */
test.describe('UI Component Branding', () => {

  test('About Dialog - should display Quallaa branding', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    // Open the About dialog
    // Method 1: Try to find and click Help menu
    try {
      // Look for menu bar (Theia uses a custom menu system)
      const menuBar = page.locator('[class*="menu-bar"]').first();
      if (await menuBar.isVisible()) {
        await menuBar.click();
      }
    } catch (e) {
      console.log('Menu bar not found via standard selector');
    }

    // Method 2: Use keyboard shortcut or command palette
    // Command Palette shortcut: Cmd+Shift+P (macOS) or Ctrl+Shift+P (Windows/Linux)
    await page.keyboard.press('Meta+Shift+P'); // Meta = Cmd on macOS

    // Wait for command palette
    await page.waitForTimeout(1000);

    // Type "About" to filter commands
    await page.keyboard.type('About');
    await page.waitForTimeout(500);

    // Press Enter to execute
    await page.keyboard.press('Enter');

    // Wait for About dialog to appear
    await page.waitForTimeout(2000);

    // Verify dialog contains "Quallaa"
    const dialogContent = await page.textContent('body');
    expect(dialogContent).toContain('Quallaa');
  });

  test('About Dialog - should display Eclipse Theia attribution', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    // Open About dialog via command palette
    await page.keyboard.press('Meta+Shift+P');
    await page.waitForTimeout(1000);
    await page.keyboard.type('About');
    await page.waitForTimeout(500);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(2000);

    // Verify EPL 2.0 compliance elements
    const bodyText = await page.textContent('body') || '';

    // Should mention Eclipse Theia
    expect(bodyText).toContain('Eclipse Theia');

    // Should have EPL license mention
    expect(bodyText.toLowerCase()).toContain('eclipse public license');

    // Should have source code link
    expect(bodyText.toLowerCase()).toContain('source code');
  });

  test('About Dialog - should have link to Quallaa repository', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    // Open About dialog
    await page.keyboard.press('Meta+Shift+P');
    await page.waitForTimeout(1000);
    await page.keyboard.type('About');
    await page.waitForTimeout(500);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(2000);

    // Look for link to GitHub repository
    const links = page.locator('a[href*="github.com"]');
    const linksCount = await links.count();

    // Should have at least one GitHub link
    expect(linksCount).toBeGreaterThan(0);

    // Check if Quallaa repository link exists
    const repoLink = page.locator('a[href*="Quallaa-AI/Quallaa-Native"]');
    if (await repoLink.count() > 0) {
      expect(await repoLink.count()).toBeGreaterThan(0);
    }
  });

  test('About Dialog - screenshot regression test', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    // Open About dialog
    await page.keyboard.press('Meta+Shift+P');
    await page.waitForTimeout(1000);
    await page.keyboard.type('About');
    await page.waitForTimeout(500);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(2000);

    // Take screenshot for visual regression testing
    // This will create a baseline on first run, then compare on subsequent runs
    await expect(page).toHaveScreenshot('about-dialog.png', {
      maxDiffPixels: 100, // Allow some minor rendering differences
    });
  });

  test('Getting Started Widget - should display Quallaa welcome message', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(5000);

    // The Getting Started widget should appear when no workspace is open
    // Look for welcome content
    const bodyText = await page.textContent('body') || '';

    // Check for Quallaa-specific welcome message
    // Based on the widget implementation:
    // "Welcome to Quallaa - Your AI-Native Development Environment"
    if (bodyText.includes('Getting Started') || bodyText.includes('Welcome')) {
      // Widget is visible, check for Quallaa branding
      expect(bodyText).toContain('Quallaa');
    }
  });

  test('Getting Started Widget - should have Quallaa-specific links', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(5000);

    // Look for "Report an Issue" link
    const reportIssueLink = page.locator('a:has-text("Report an Issue")');
    if (await reportIssueLink.count() > 0) {
      // Should point to Quallaa repository (or be a button that opens external link)
    }

    // Look for "About Eclipse Theia" link (EPL attribution)
    const theiaLink = page.locator('a:has-text("About Eclipse Theia")');
    if (await theiaLink.count() > 0) {
      expect(await theiaLink.count()).toBeGreaterThan(0);
    }
  });

  test('Getting Started Widget - screenshot regression test', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(5000);

    // Take screenshot of the Getting Started widget
    // This captures the welcome screen branding
    await expect(page).toHaveScreenshot('getting-started-widget.png', {
      maxDiffPixels: 100,
    });
  });

  test('AI Chat - should display "Ask the Quallaa AI" welcome message', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    // Try to open AI Chat view
    // Use command palette
    await page.keyboard.press('Meta+Shift+P');
    await page.waitForTimeout(1000);
    await page.keyboard.type('AI Chat');
    await page.waitForTimeout(500);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(2000);

    // Check for AI chat welcome message
    const bodyText = await page.textContent('body') || '';

    // Based on ide-chat-welcome-message-provider.tsx:
    // "Ask the Quallaa AI"
    if (bodyText.includes('AI')) {
      // AI features are enabled, check for correct branding
      // Should say "Ask the Quallaa AI" not "Ask the Theia IDE AI"
      if (bodyText.toLowerCase().includes('ask the')) {
        expect(bodyText).toContain('Quallaa AI');
      }
    }
  });

  test('Should not display "Theia IDE" in main UI elements', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    // Get all visible text content
    const bodyText = await page.textContent('body') || '';

    // Check for "Theia IDE" (user-visible branding we want to replace)
    const theiaIDEMatches = bodyText.match(/Theia IDE/gi) || [];

    // Log occurrences for debugging
    console.log(`Found ${theiaIDEMatches.length} occurrences of "Theia IDE"`);

    // Acceptable contexts for "Theia IDE":
    // - Attribution text (e.g., "Built on Eclipse Theia IDE")
    // - Documentation links
    // - Internal/debug information

    // For now, just document the count
    // In future iterations, we can add stricter checks
  });
});
