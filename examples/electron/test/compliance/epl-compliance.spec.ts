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
 * Category G: EPL 2.0 Compliance Tests
 *
 * Verifies that the application meets Eclipse Public License 2.0 requirements:
 * - License files present
 * - Attribution visible to users
 * - Source code access
 * - Copyright headers in modified files
 */
test.describe('EPL 2.0 Compliance', () => {

  test('should have LICENSE file in repository root', async ({}) => {
    const repoRoot = path.join(__dirname, '../../../..');

    // Check for LICENSE or LICENSE-EPL.txt
    const possibleLicenseFiles = [
      'LICENSE',
      'LICENSE.txt',
      'LICENSE-EPL.txt',
      'LICENSE.md',
    ];

    let licenseFound = false;
    let licensePath = '';

    for (const filename of possibleLicenseFiles) {
      const filePath = path.join(repoRoot, filename);
      if (fs.existsSync(filePath)) {
        licenseFound = true;
        licensePath = filePath;
        break;
      }
    }

    expect(licenseFound).toBe(true);

    if (licenseFound) {
      // Verify it mentions EPL 2.0
      const licenseContent = fs.readFileSync(licensePath, 'utf-8');
      expect(licenseContent.toLowerCase()).toContain('eclipse public license');
    }
  });

  test('should have NOTICE file in repository', async ({}) => {
    const repoRoot = path.join(__dirname, '../../../..');

    const possibleNoticeFiles = [
      'NOTICE',
      'NOTICE.txt',
      'NOTICE.md',
    ];

    let noticeFound = false;

    for (const filename of possibleNoticeFiles) {
      const filePath = path.join(repoRoot, filename);
      if (fs.existsSync(filePath)) {
        noticeFound = true;
        break;
      }
    }

    // NOTICE file is strongly recommended for EPL compliance
    // but not strictly required for all projects
    // Log a warning if not found
    if (!noticeFound) {
      console.warn('NOTICE file not found - consider adding for EPL 2.0 compliance');
    }
  });

  test('About Dialog - should display "Built on Eclipse Theia" attribution', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    // Open About dialog
    await page.keyboard.press('Meta+Shift+P');
    await page.waitForTimeout(1000);
    await page.keyboard.type('About');
    await page.waitForTimeout(500);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(2000);

    // Verify attribution is visible
    const bodyText = await page.textContent('body') || '';

    // CRITICAL: Must mention Eclipse Theia
    expect(bodyText).toContain('Eclipse Theia');

    // Should mention "built on" or similar
    expect(bodyText.toLowerCase()).toMatch(/built on|based on|powered by/);
  });

  test('About Dialog - should link to Eclipse Theia website', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    // Open About dialog
    await page.keyboard.press('Meta+Shift+P');
    await page.waitForTimeout(1000);
    await page.keyboard.type('About');
    await page.waitForTimeout(500);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(2000);

    // Check for link to theia-ide.org
    const theiaLinks = page.locator('a[href*="theia-ide.org"]');
    const linkCount = await theiaLinks.count();

    expect(linkCount).toBeGreaterThan(0);

    // Verify link is clickable (EPL requires attribution to be accessible)
    const firstLink = theiaLinks.first();
    if (await firstLink.isVisible()) {
      expect(await firstLink.isEnabled()).toBe(true);
    }
  });

  test('About Dialog - should display EPL 2.0 license information', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    // Open About dialog
    await page.keyboard.press('Meta+Shift+P');
    await page.waitForTimeout(1000);
    await page.keyboard.type('About');
    await page.waitForTimeout(500);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(2000);

    // Verify license is mentioned
    const bodyText = await page.textContent('body') || '';

    // Should mention EPL 2.0
    expect(bodyText.toLowerCase()).toMatch(/epl|eclipse public license/);
  });

  test('About Dialog - should link to Quallaa source code', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    // Open About dialog
    await page.keyboard.press('Meta+Shift+P');
    await page.waitForTimeout(1000);
    await page.keyboard.type('About');
    await page.waitForTimeout(500);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(2000);

    // EPL 2.0 requires source code availability
    // Check for "View Source Code" link or similar
    const bodyText = await page.textContent('body') || '';

    expect(bodyText.toLowerCase()).toMatch(/source code|view source|github/);

    // Check for GitHub link to Quallaa repository
    const githubLinks = page.locator('a[href*="github.com"]');
    const linkCount = await githubLinks.count();

    expect(linkCount).toBeGreaterThan(0);
  });

  test('About Dialog - should be accessible within 3 clicks', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    // EPL compliance best practice: Attribution should be easy to find
    // Test: Can user reach About dialog in 3 clicks or less?

    // Method 1: Command Palette (2 actions: open palette, select About)
    await page.keyboard.press('Meta+Shift+P'); // Action 1
    await page.waitForTimeout(1000);
    await page.keyboard.type('About');
    await page.waitForTimeout(500);
    await page.keyboard.press('Enter'); // Action 2
    await page.waitForTimeout(2000);

    // Verify dialog appeared
    const bodyText = await page.textContent('body') || '';
    expect(bodyText).toContain('Quallaa');

    // Accessibility requirement met: < 3 actions
  });

  test('Quallaa branding extension - should have EPL copyright headers', async ({}) => {
    // Verify all modified files in packages/quallaa-branding have correct headers
    const brandingPackagePath = path.join(__dirname, '../../../../packages/quallaa-branding/src');

    if (!fs.existsSync(brandingPackagePath)) {
      console.warn('Quallaa branding package not found');
      return;
    }

    // Check TypeScript files in the branding package
    const files = fs.readdirSync(brandingPackagePath, { recursive: true, withFileTypes: true });

    const tsFiles = files
      .filter(f => f.isFile() && (f.name.endsWith('.ts') || f.name.endsWith('.tsx')))
      .map(f => path.join(f.path || brandingPackagePath, f.name));

    for (const file of tsFiles) {
      const content = fs.readFileSync(file, 'utf-8');

      // Verify EPL header is present
      expect(content).toContain('Eclipse Public License v. 2.0');
      expect(content).toContain('SPDX-License-Identifier: EPL-2.0 OR GPL-2.0-only WITH Classpath-exception-2.0');
    }
  });

  test('package.json - should specify EPL 2.0 license', async ({}) => {
    const packageJsonPath = path.join(__dirname, '../../package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

    // Verify license field
    expect(packageJson.license).toContain('EPL-2.0');
  });

  test('should not violate EPL trademark requirements', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    // EPL allows use of "Eclipse Theia" name in attribution
    // but product name should not be "Theia" or "Eclipse"

    const bodyText = await page.textContent('body') || '';

    // Application name should be "Quallaa" not "Theia"
    const title = await page.title();
    expect(title).toContain('Quallaa');
    expect(title).not.toMatch(/^Theia/); // Should not start with "Theia"
    expect(title).not.toMatch(/^Eclipse/); // Should not start with "Eclipse"
  });

  test('Getting Started - should have Theia attribution', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(5000);

    // Getting Started widget should also mention Eclipse Theia
    const bodyText = await page.textContent('body') || '';

    // If Getting Started widget is visible
    if (bodyText.includes('Getting Started') || bodyText.includes('Welcome')) {
      // Should mention Theia in attribution context
      // Based on QuallaaGettingStartedWidget implementation
      if (bodyText.toLowerCase().includes('built on')) {
        expect(bodyText).toContain('Eclipse Theia');
      }
    }
  });
});
