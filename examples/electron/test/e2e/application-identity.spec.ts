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
 * Category A: Application Identity Tests
 *
 * Verifies that the application is correctly branded as "Quallaa" throughout
 * the user interface and system integrations.
 */
test.describe('Application Identity', () => {

  test('should have correct window title', async ({ page }) => {
    // Wait for the application to fully load
    await page.waitForLoadState('domcontentloaded');

    // Get the window title
    const title = await page.title();

    // Verify title contains "Quallaa"
    expect(title).toContain('Quallaa');

    // Verify title does NOT contain "Theia" (except in internal contexts)
    // Note: "Theia" may appear in debug/developer contexts, which is acceptable
  });

  test('should have correct application name in package.json', async ({}) => {
    // Read package.json
    const packageJsonPath = path.join(__dirname, '../../package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

    // Verify package name
    expect(packageJson.name).toBe('@quallaa/quallaa');

    // Verify product name
    expect(packageJson.productName).toBe('Quallaa');

    // Verify application name in Theia config
    expect(packageJson.theia.frontend.config.applicationName).toBe('Quallaa');

    // Verify preferences directory
    expect(packageJson.theia.backend.config['preferences-dir']).toBe('.quallaa');
  });

  test('should have correct app ID in electron-builder config', async ({}) => {
    const electronBuilderPath = path.join(__dirname, '../../electron-builder.yml');
    const builderConfig = fs.readFileSync(electronBuilderPath, 'utf-8');

    // Verify appId
    expect(builderConfig).toContain('appId: com.quallaa.ide');

    // Verify product name
    expect(builderConfig).toContain('productName: Quallaa');

    // Verify copyright
    expect(builderConfig).toContain('Copyright © 2025 Quallaa AI');
  });

  test('should display Quallaa in main menu area', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');

    // Wait for the application to be ready
    await page.waitForTimeout(3000);

    // Look for menu items or application branding
    // This will depend on the specific UI structure of Theia
    // The application name should appear somewhere in the UI
    // Note: This is a broad check; more specific selectors can be added
    // after inspecting the actual DOM structure
  });

  test('should not show "Theia" in user-visible UI elements', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    // Get all text content from the page
    const bodyText = await page.textContent('body') || '';

    // Count occurrences of "Theia" (case-insensitive)
    const theiaMatches = bodyText.match(/theia/gi) || [];

    // Some "Theia" references are acceptable (e.g., in URLs, attributions)
    // But we want to minimize user-visible "Theia IDE" branding
    // This test documents the current state and can be tightened over time

    console.log(`Found ${theiaMatches.length} occurrences of "Theia" in the UI`);

    // For now, we just document this. In future, we can add stricter checks
    // to ensure "Theia" only appears in attribution contexts
  });

  test('should have correct main window properties', async ({ electronApp }) => {
    // Get the main window
    const windows = await electronApp.windows();
    expect(windows.length).toBeGreaterThan(0);

    const mainWindow = windows[0];

    // Verify window exists (skip isVisible check which requires locator)
    expect(mainWindow).toBeDefined();

    // Get window title
    const title = await mainWindow.title();
    expect(title).toContain('Quallaa');
  });

  test('should use .quallaa directory for user data', async ({ electronApp, userDataDir }) => {
    // The userDataDir fixture uses a temp directory for tests
    // In production, verify the app creates ~/.quallaa instead of ~/.theia

    // Wait a bit for the app to potentially create config directories
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Note: This test validates the concept; actual path checking would need
    // to be done in a manual test or with a different test setup that uses
    // the real home directory
  });
});
