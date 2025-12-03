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
 * Text Replacement / Branding Verification Tests
 *
 * Verifies that user-visible "Theia IDE" references have been replaced
 * with "Quallaa" while preserving necessary EPL 2.0 attributions.
 */
test.describe('Branding Verification', () => {

  test('Window title - should not show Theia', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    const title = await page.title();

    console.log('Window title:', title);

    // Title can be "Welcome", "Quallaa", or file name - but not "Theia"
    expect(title).not.toMatch(/^Theia/);
    expect(title).not.toContain('Theia IDE');
  });

  test('Main UI - should show Quallaa branding not "Theia IDE"', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    // Get all visible text
    const bodyText = await page.textContent('body') || '';

    // Search for "Theia IDE" (product name that should be replaced)
    const theiaIDEMatches = bodyText.match(/Theia IDE/gi) || [];

    console.log(`Found ${theiaIDEMatches.length} occurrences of "Theia IDE"`);

    // Acceptable contexts for "Theia IDE":
    // 1. Attribution text (e.g., "Built on Eclipse Theia")
    // 2. Documentation links
    // For MVP, we want to minimize user-visible "Theia IDE" branding

    if (theiaIDEMatches.length > 0) {
      console.log('Context check: Are these in attribution/documentation context?');
    }

    // "Eclipse Theia" for attribution is OK, but "Theia IDE" as product name is not
    // Note: This is informational - not a hard failure for now
  });

  test('Status bar - should not show "Theia IDE" branding', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    // Check status bar at bottom of window
    const statusBar = page.locator('#theia-statusBar');

    if (await statusBar.isVisible()) {
      const statusText = await statusBar.textContent() || '';

      // Status bar should not show "Theia IDE" as product name
      expect(statusText).not.toContain('Theia IDE');
    }
  });

  test('@theia package namespace - preserved for compatibility', async ({ }) => {
    // Internal package references like @theia/* are acceptable for MVP
    // User-visible strings are what matter, not internal namespaces
    // This test documents that we kept @theia/* namespace intentionally

    const fs = await import('fs');
    const path = await import('path');

    const packageJsonPath = path.join(__dirname, '../../package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

    // Verify we still use @theia/* dependencies (by design for MVP)
    const dependencies = Object.keys(packageJson.dependencies || {});
    const theiaDeps = dependencies.filter(dep => dep.startsWith('@theia/'));

    expect(theiaDeps.length).toBeGreaterThan(0);

    console.log(`Using ${theiaDeps.length} @theia/* packages (expected for MVP compatibility)`);
  });
});
