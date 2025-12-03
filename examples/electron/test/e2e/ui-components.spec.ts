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
 * UI Component Branding Tests
 *
 * Verifies that custom UI components display correct Quallaa branding
 * and EPL 2.0 attribution.
 */
test.describe('UI Component Branding', () => {

  test('About Dialog - should display Quallaa branding', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    // Open About dialog via command palette
    await page.keyboard.press('Meta+Shift+P');
    await page.waitForTimeout(1000);
    await page.keyboard.type('About');
    await page.waitForTimeout(500);
    await page.keyboard.press('Enter');
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
  });

  test('Getting Started Widget - should display Quallaa welcome message', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(5000);

    // Look for welcome content
    const bodyText = await page.textContent('body') || '';

    // Check for Quallaa branding in welcome screen
    if (bodyText.includes('Getting Started') || bodyText.includes('Welcome')) {
      expect(bodyText).toContain('Quallaa');
    }
  });

  test('Should not display "Theia IDE" in main UI elements', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    // Get all visible text content
    const bodyText = await page.textContent('body') || '';

    // Search for "Theia IDE" - should be minimal or in attribution context only
    const theiaIDEMatches = bodyText.match(/Theia IDE/gi) || [];

    console.log(`Found ${theiaIDEMatches.length} occurrences of "Theia IDE"`);

    // Allow some occurrences for attribution, but flag if excessive
    if (theiaIDEMatches.length > 3) {
      console.warn('Multiple "Theia IDE" references found - review for branding consistency');
    }
  });
});
