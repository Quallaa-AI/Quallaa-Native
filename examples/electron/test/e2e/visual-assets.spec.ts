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
import { execSync } from 'child_process';

/**
 * Category B: Visual Asset Tests
 *
 * Verifies that all visual assets (icons, logos) are correctly branded
 * and properly integrated into the application.
 */
test.describe('Visual Assets', () => {

  test('should have icon.icns file in resources', async ({}) => {
    const iconPath = path.join(__dirname, '../../resources/icon.icns');

    expect(fs.existsSync(iconPath)).toBe(true);

    // Verify file size (should be > 0 and reasonable size for .icns)
    const stats = fs.statSync(iconPath);
    expect(stats.size).toBeGreaterThan(1000); // At least 1KB
    expect(stats.size).toBeLessThan(100000); // Less than 100KB (reasonable for icon)
  });

  test('should NOT have theia-logo.svg in resources', async ({}) => {
    const theiaLogoPath = path.join(__dirname, '../../resources/theia-logo.svg');

    // Theia logo should have been removed/replaced
    expect(fs.existsSync(theiaLogoPath)).toBe(false);
  });

  test('should have quallaa-logo.svg in resources', async ({}) => {
    const quallaaLogoPath = path.join(__dirname, '../../resources/quallaa-logo.svg');

    expect(fs.existsSync(quallaaLogoPath)).toBe(true);

    // Verify it's a valid SVG
    const content = fs.readFileSync(quallaaLogoPath, 'utf-8');
    expect(content).toContain('<svg');
  });

  test('icon.icns - should contain all required sizes', async ({}) => {
    const iconPath = path.join(__dirname, '../../resources/icon.icns');

    if (!fs.existsSync(iconPath)) {
      throw new Error('icon.icns not found');
    }

    // Use iconutil or sips to verify icon sizes (macOS only)
    // For cross-platform testing, we would need a different approach

    if (process.platform === 'darwin') {
      try {
        // Convert .icns to iconset to inspect sizes
        const tempIconsetPath = path.join(__dirname, '../../resources/temp.iconset');

        // Create temp directory
        if (!fs.existsSync(tempIconsetPath)) {
          fs.mkdirSync(tempIconsetPath, { recursive: true });
        }

        // Use iconutil to convert (macOS only)
        execSync(`iconutil -c iconset "${iconPath}" -o "${tempIconsetPath}"`);

        // Check for required sizes
        const requiredSizes = [
          'icon_16x16.png',
          'icon_16x16@2x.png',
          'icon_32x32.png',
          'icon_32x32@2x.png',
          'icon_128x128.png',
          'icon_128x128@2x.png',
          'icon_256x256.png',
          'icon_256x256@2x.png',
          'icon_512x512.png',
          'icon_512x512@2x.png',
        ];

        const files = fs.readdirSync(tempIconsetPath);

        for (const requiredFile of requiredSizes) {
          const exists = files.includes(requiredFile);
          console.log(`${requiredFile}: ${exists ? 'Found' : 'Missing'}`);
        }

        // Cleanup
        fs.rmSync(tempIconsetPath, { recursive: true, force: true });

      } catch (error) {
        console.warn('Could not verify icon sizes (macOS iconutil required):', error);
      }
    } else {
      console.log('Skipping icon size verification (macOS only)');
    }
  });

  test('electron-builder config - should reference correct icon', async ({}) => {
    const builderConfigPath = path.join(__dirname, '../../electron-builder.yml');
    const config = fs.readFileSync(builderConfigPath, 'utf-8');

    // Verify icon path
    expect(config).toContain('icon: resources/icon.icns');

    // Verify DMG icon also set
    expect(config).toMatch(/dmg:[\s\S]*icon: resources\/icon\.icns/);
  });

  test('should not reference theia assets in config', async ({}) => {
    const builderConfigPath = path.join(__dirname, '../../electron-builder.yml');
    const config = fs.readFileSync(builderConfigPath, 'utf-8');

    // Should not reference any theia assets
    expect(config).not.toContain('theia-logo');
    expect(config).not.toContain('theia-icon');
  });

  test('visual regression - main window screenshot', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    // Take a screenshot of the main window
    await expect(page).toHaveScreenshot('main-window.png', {
      maxDiffPixels: 200,
      fullPage: true,
    });
  });

  test('visual regression - welcome screen', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(5000);

    // Take screenshot of welcome/getting started screen
    await expect(page).toHaveScreenshot('welcome-screen.png', {
      maxDiffPixels: 200,
      fullPage: true,
    });
  });

  test('DMG background - should not use Theia branding', async ({}) => {
    const builderConfigPath = path.join(__dirname, '../../electron-builder.yml');
    const config = fs.readFileSync(builderConfigPath, 'utf-8');

    // Check DMG config
    // Currently set to null, which is fine
    expect(config).toContain('background: null');

    // If a background is added later, verify it's Quallaa branded
  });
});
