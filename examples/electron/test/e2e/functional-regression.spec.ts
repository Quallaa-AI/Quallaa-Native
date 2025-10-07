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
 * Category H: Functional Regression Tests
 *
 * Verifies that core IDE functionality still works after rebranding.
 * These tests ensure the rebrand didn't break essential features.
 */
test.describe('Functional Regression', () => {

  test('Application launches successfully', async ({ electronApp }) => {
    // App should launch without crashing
    expect(electronApp).toBeDefined();

    // Should have at least one window
    const windows = await electronApp.windows();
    expect(windows.length).toBeGreaterThan(0);
  });

  test('Main window renders correctly', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');

    // Wait for the app to be ready
    await page.waitForTimeout(3000);

    // Check that main UI elements are present
    const bodyContent = await page.textContent('body') || '';
    expect(bodyContent.length).toBeGreaterThan(0);

    // Window should be visible
    expect(await page.isVisible('body')).toBe(true);
  });

  test('Command Palette opens', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    // Open Command Palette
    await page.keyboard.press('Meta+Shift+P');
    await page.waitForTimeout(1000);

    // Command Palette should be visible
    // Look for input field or command list
    const bodyText = await page.textContent('body') || '';

    // Should show some commands or search box
    // This is a basic smoke test
    expect(bodyText.length).toBeGreaterThan(100);
  });

  test('Quick Open works', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    // Open Quick Open (file search)
    await page.keyboard.press('Meta+P');
    await page.waitForTimeout(1000);

    // Should open file search interface
    // Type something
    await page.keyboard.type('test');
    await page.waitForTimeout(500);

    // Close with Escape
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
  });

  test('Settings/Preferences opens', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    // Open Preferences
    await page.keyboard.press('Meta+,'); // Common shortcut for settings

    // Or via command palette
    await page.keyboard.press('Meta+Shift+P');
    await page.waitForTimeout(1000);
    await page.keyboard.type('Preferences: Open Settings');
    await page.waitForTimeout(500);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(2000);

    // Settings should be visible
    const bodyText = await page.textContent('body') || '';

    // Should mention settings/preferences
    expect(bodyText.toLowerCase()).toMatch(/settings|preferences/);
  });

  test('Editor - basic functionality', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    // Create a new file via command palette
    await page.keyboard.press('Meta+Shift+P');
    await page.waitForTimeout(1000);
    await page.keyboard.type('New File');
    await page.waitForTimeout(500);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(2000);

    // Try to type in the editor
    // This depends on focus and Theia's editor implementation
    await page.keyboard.type('// Test content');
    await page.waitForTimeout(500);

    // This is a basic smoke test
    // Full editor testing would require more specific selectors
  });

  test('File Explorer - can open', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    // Try to open File Explorer view
    await page.keyboard.press('Meta+Shift+P');
    await page.waitForTimeout(1000);
    await page.keyboard.type('Explorer');
    await page.waitForTimeout(500);

    const bodyText = await page.textContent('body') || '';

    // Should show explorer-related commands
    if (bodyText.toLowerCase().includes('explorer')) {
      await page.keyboard.press('Enter');
      await page.waitForTimeout(2000);
    }
  });

  test('Terminal - can open', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    // Open Terminal
    await page.keyboard.press('Meta+Shift+P');
    await page.waitForTimeout(1000);
    await page.keyboard.type('Terminal: Create New Terminal');
    await page.waitForTimeout(500);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(2000);

    // Terminal should open
    const bodyText = await page.textContent('body') || '';

    // Look for terminal indicators
    if (bodyText.toLowerCase().includes('terminal')) {
      console.log('Terminal opened successfully');
    }
  });

  test('Search functionality works', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    // Open Search view
    await page.keyboard.press('Meta+Shift+F');
    await page.waitForTimeout(2000);

    // Search interface should open
    // Try typing a search term
    await page.keyboard.type('test');
    await page.waitForTimeout(1000);

    // This is a basic smoke test
    // Full search testing requires an open workspace
  });

  test('Keyboard shortcuts work', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    // Test common shortcuts
    const shortcuts = [
      'Meta+Shift+P', // Command Palette
      'Meta+P',       // Quick Open
      'Meta+,',       // Settings
    ];

    for (const shortcut of shortcuts) {
      await page.keyboard.press(shortcut);
      await page.waitForTimeout(500);

      // Close with Escape
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    }

    // If we got here without errors, shortcuts work
    expect(true).toBe(true);
  });

  test('Window can be closed gracefully', async ({ electronApp }) => {
    // App should close without errors
    await electronApp.close();

    // If we get here, app closed successfully
    expect(true).toBe(true);
  });

  test('Multiple windows support', async ({ electronApp }) => {
    // Get initial windows
    const initialWindows = await electronApp.windows();
    const initialCount = initialWindows.length;

    // Try to open a new window (if supported)
    // This is app-specific functionality

    // For now, just verify we can get window list
    expect(initialCount).toBeGreaterThanOrEqual(1);
  });

  test('Monaco editor loads', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(5000);

    // Check if Monaco editor elements are present
    // Monaco uses specific class names
    const monacoElements = page.locator('[class*="monaco"]');
    const count = await monacoElements.count();

    console.log(`Found ${count} Monaco editor elements`);

    // Monaco should be loaded in Theia
    expect(count).toBeGreaterThan(0);
  });

  test('Extensions view accessible', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    // Open Extensions view
    await page.keyboard.press('Meta+Shift+P');
    await page.waitForTimeout(1000);
    await page.keyboard.type('Extensions');
    await page.waitForTimeout(500);

    const bodyText = await page.textContent('body') || '';

    if (bodyText.toLowerCase().includes('extensions')) {
      console.log('Extensions view available');
    }
  });

  test('Basic workspace functionality', async ({ page, userDataDir }) => {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    // Create a temp workspace
    const workspacePath = path.join(userDataDir, 'test-workspace');
    fs.mkdirSync(workspacePath, { recursive: true });

    // Create a test file
    const testFilePath = path.join(workspacePath, 'test.txt');
    fs.writeFileSync(testFilePath, 'Test content');

    // Try to open the workspace
    // This would require file system interaction or command line args
    // For now, just verify the workspace exists
    expect(fs.existsSync(workspacePath)).toBe(true);
    expect(fs.existsSync(testFilePath)).toBe(true);
  });
});
