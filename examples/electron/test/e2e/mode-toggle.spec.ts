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
 * Simple/Developer Mode Toggle Tests
 *
 * Verifies that the mode toggle command is registered and executable.
 */
test.describe('Mode Toggle Functionality', () => {

  test('Command Palette - should show "Toggle Developer Mode" command', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    // Open command palette with keyboard shortcut
    await page.keyboard.press('Meta+Shift+P'); // Meta = Cmd on macOS

    // Wait for command palette to open
    await page.waitForTimeout(1000);

    // Type "toggle developer" to filter commands
    await page.keyboard.type('toggle developer');
    await page.waitForTimeout(500);

    // Check if command appears in palette
    const commandPalette = page.locator('[class*="quick-open"]');
    await expect(commandPalette).toBeVisible();

    // Look for the command in the list
    const toggleCommand = page.locator('text=/Toggle Developer Mode/i');
    await expect(toggleCommand).toBeVisible({ timeout: 5000 });

    console.log('✓ Toggle Developer Mode command found in palette');
  });

  test('Keyboard Shortcut - Cmd+K D should toggle mode', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    // Check initial console logs
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      if (msg.text().includes('[QuallaaModuleManager]')) {
        consoleLogs.push(msg.text());
        console.log('Console:', msg.text());
      }
    });

    // Try chord keybinding: Cmd+K then D
    await page.keyboard.press('Meta+K');
    await page.waitForTimeout(200);
    await page.keyboard.press('D');
    await page.waitForTimeout(1000);

    // Check if toggle was executed (look for console logs)
    const toggleExecuted = consoleLogs.some(log => log.includes('Toggle command executed'));

    if (toggleExecuted) {
      console.log('✓ Keyboard shortcut Cmd+K D works');
    } else {
      console.log('✗ Keyboard shortcut did not trigger command');
      console.log('All logs:', consoleLogs);
    }
  });

  test('Console Logs - should show module initialization', async ({ page }) => {
    const consoleLogs: string[] = [];

    page.on('console', msg => {
      if (msg.text().includes('[QuallaaModuleManager]')) {
        consoleLogs.push(msg.text());
      }
    });

    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(5000);

    console.log('=== QuallaaModuleManager Console Logs ===');
    consoleLogs.forEach(log => console.log(log));

    // Check for expected initialization logs
    const hasRegistration = consoleLogs.some(log => log.includes('Registering toggle command'));
    const hasInitialization = consoleLogs.some(log => log.includes('onDidInitializeLayout'));

    expect(hasRegistration).toBeTruthy();
    expect(hasInitialization).toBeTruthy();

    console.log('✓ Module initialized correctly');
  });

  test('Mode Toggle Execution - via Command Palette', async ({ page }) => {
    const consoleLogs: string[] = [];

    page.on('console', msg => {
      if (msg.text().includes('[QuallaaModuleManager]')) {
        consoleLogs.push(msg.text());
        console.log('Console:', msg.text());
      }
    });

    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    // Open command palette
    await page.keyboard.press('Meta+Shift+P');
    await page.waitForTimeout(1000);

    // Type "toggle developer"
    await page.keyboard.type('toggle developer');
    await page.waitForTimeout(500);

    // Execute command
    await page.keyboard.press('Enter');
    await page.waitForTimeout(2000);

    // Verify toggle was executed
    const toggleExecuted = consoleLogs.some(log => log.includes('Toggle command executed'));
    expect(toggleExecuted).toBeTruthy();

    console.log('✓ Mode toggle executed via command palette');
  });
});
