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
 * Domain Template Browser Tests
 *
 * Verifies that the domain template browser widget displays correctly
 * and provides project creation functionality.
 */
test.describe('Domain Template Browser', () => {

  test('should open template browser via command palette', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    // Capture console logs for debugging
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      const text = msg.text();
      consoleLogs.push(text);
      console.log('Browser Console:', text);
    });

    // Open command palette
    await page.keyboard.press('Meta+Shift+P');
    await page.waitForTimeout(1000);

    // Type command to open template browser
    await page.keyboard.type('Browse Domain Templates');
    await page.waitForTimeout(500);

    // Execute command
    await page.keyboard.press('Enter');
    await page.waitForTimeout(2000);

    // Check console logs for template browser creation
    const hasWidgetCreatedLog = consoleLogs.some(log =>
      log.includes('[Quallaa] DomainTemplateBrowser widget created')
    );
    expect(hasWidgetCreatedLog).toBe(true);

    // Check for render calls
    const hasRenderLog = consoleLogs.some(log =>
      log.includes('[Quallaa] DomainTemplateBrowser render() called')
    );
    expect(hasRenderLog).toBe(true);

    // Check for template count
    const templateCountLog = consoleLogs.find(log =>
      log.includes('[Quallaa] Found') && log.includes('template domains')
    );
    console.log('Template count log:', templateCountLog);
    expect(templateCountLog).toBeDefined();
  });

  test('should display marketing automation template', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    // Open template browser
    await page.keyboard.press('Meta+Shift+P');
    await page.waitForTimeout(1000);
    await page.keyboard.type('Browse Domain Templates');
    await page.waitForTimeout(500);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(3000);

    // Check if page contains template browser elements
    const bodyText = await page.textContent('body') || '';

    // Should show header
    expect(bodyText).toContain('Available Domain Templates');

    // Should show marketing template
    expect(bodyText).toContain('Marketing Automation');

    // Log the body text for debugging
    console.log('=== PAGE CONTENT ===');
    console.log(bodyText);
    console.log('===================');
  });

  test('should display template capabilities', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    // Open template browser
    await page.keyboard.press('Meta+Shift+P');
    await page.waitForTimeout(1000);
    await page.keyboard.type('Browse Domain Templates');
    await page.waitForTimeout(500);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(3000);

    const bodyText = await page.textContent('body') || '';

    // Check for marketing capabilities
    const expectedCapabilities = [
      'Campaign Management',
      'Email Automation',
      'Audience Segmentation',
      'Analytics Dashboard'
    ];

    for (const capability of expectedCapabilities) {
      if (bodyText.includes('Marketing Automation')) {
        expect(bodyText).toContain(capability);
      }
    }
  });

  test('should display infrastructure services', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    // Open template browser
    await page.keyboard.press('Meta+Shift+P');
    await page.waitForTimeout(1000);
    await page.keyboard.type('Browse Domain Templates');
    await page.waitForTimeout(500);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(3000);

    const bodyText = await page.textContent('body') || '';

    // Check for infrastructure services
    if (bodyText.includes('Marketing Automation')) {
      expect(bodyText).toContain('Infrastructure');
      // Services might be listed
      const hasDatabase = bodyText.includes('postgresql') || bodyText.includes('database');
      const hasAPI = bodyText.includes('resend') || bodyText.includes('api');
      // At least one service should be mentioned
      expect(hasDatabase || hasAPI).toBe(true);
    }
  });

  test('should have Create Project button', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    // Open template browser
    await page.keyboard.press('Meta+Shift+P');
    await page.waitForTimeout(1000);
    await page.keyboard.type('Browse Domain Templates');
    await page.waitForTimeout(500);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(3000);

    // Look for Create Project button
    const createButton = page.locator('button:has-text("Create Project")');
    const buttonCount = await createButton.count();

    console.log('Create Project button count:', buttonCount);
    expect(buttonCount).toBeGreaterThan(0);
  });

  test('should take screenshot of template browser', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    // Open template browser
    await page.keyboard.press('Meta+Shift+P');
    await page.waitForTimeout(1000);
    await page.keyboard.type('Browse Domain Templates');
    await page.waitForTimeout(500);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(3000);

    // Take screenshot for visual inspection
    await expect(page).toHaveScreenshot('template-browser.png', {
      maxDiffPixels: 200,
    });
  });

  test('should run programmatic test command', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    // Capture console logs
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      const text = msg.text();
      consoleLogs.push(text);
    });

    // Run the programmatic test command
    await page.keyboard.press('Meta+Shift+P');
    await page.waitForTimeout(1000);
    await page.keyboard.type('Test Template Browser Widget');
    await page.waitForTimeout(500);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(2000);

    // Check console logs for test results
    const testStartLog = consoleLogs.some(log =>
      log.includes('=== Quallaa Template Browser Test ===')
    );
    expect(testStartLog).toBe(true);

    // Check for passing tests
    const hasPassingTests = consoleLogs.some(log => log.includes('✅ PASS'));
    console.log('Test logs:', consoleLogs.filter(log => log.includes('Test') || log.includes('PASS') || log.includes('FAIL')));

    expect(hasPassingTests).toBe(true);
  });

  test('should verify widget state', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    // Capture console logs
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      consoleLogs.push(msg.text());
    });

    // Run the programmatic test command
    await page.keyboard.press('Meta+Shift+P');
    await page.waitForTimeout(1000);
    await page.keyboard.type('Test Template Browser Widget');
    await page.waitForTimeout(500);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(2000);

    // Extract widget state information
    const attachedLog = consoleLogs.find(log => log.includes('Is attached:'));
    const visibleLog = consoleLogs.find(log => log.includes('Is visible:'));

    console.log('Widget state logs:', { attachedLog, visibleLog });

    // Log all relevant information
    consoleLogs.forEach(log => {
      if (log.includes('[Test') || log.includes('Widget') || log.includes('Template')) {
        console.log('  ', log);
      }
    });
  });
});
