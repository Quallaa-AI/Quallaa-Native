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
 * Knowledge Mode UI Tests
 *
 * Verifies that knowledge mode creates a clean Obsidian-like interface
 * with hidden UI chrome (activity bar, status bar, bottom panel).
 */
test.describe('Knowledge Mode UI', () => {

  test('Knowledge mode - should hide activity bar (left icon ribbon)', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(5000);

    // Check that left icon ribbon is hidden
    const leftTabBar = page.locator('.lm-TabBar.theia-app-left');
    const isLeftTabBarVisible = await leftTabBar.isVisible().catch(() => false);

    console.log('Left icon ribbon visible:', isLeftTabBarVisible);
    expect(isLeftTabBarVisible).toBe(false);
  });

  test('Knowledge mode - should hide status bar', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(5000);

    // Check that status bar is hidden
    const statusBar = page.locator('#theia-statusBar, .theia-statusBar');
    const isStatusBarVisible = await statusBar.isVisible().catch(() => false);

    console.log('Status bar visible:', isStatusBarVisible);
    expect(isStatusBarVisible).toBe(false);
  });

  test('Knowledge mode - should have docs panel widget', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(5000);

    // Check that docs panel widget exists (may be in collapsed state initially)
    const docsPanel = page.locator('[id*="docs-view"]').first();
    const exists = await docsPanel.count();

    console.log('Docs panel exists:', exists > 0);
    expect(exists).toBeGreaterThan(0);
  });

  test('Knowledge mode - should show chat panel', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(5000);

    // Check that chat panel is visible
    const chatPanel = page.locator('[id*="chat-view"]').first();
    const isChatPanelVisible = await chatPanel.isVisible({ timeout: 5000 }).catch(() => false);

    console.log('Chat panel visible:', isChatPanelVisible);
    expect(isChatPanelVisible).toBe(true);
  });

  test('Knowledge mode - bottom panel should be collapsed', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(5000);

    // Count visible UI chrome elements
    const uiElements = await page.evaluate(() => {
      const bottomPanel = document.querySelector('#theia-bottom-content-panel');

      return {
        bottomPanelVisible: bottomPanel ? (bottomPanel as HTMLElement).offsetHeight > 0 : false,
      };
    });

    console.log('Bottom panel visible:', uiElements.bottomPanelVisible);
    expect(uiElements.bottomPanelVisible).toBe(false);
  });

  test('Mode toggle - Cmd+Shift+M should switch to developer mode', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(5000);

    // Start in knowledge mode - verify clean UI
    const leftTabBarBefore = page.locator('.lm-TabBar.theia-app-left');
    const isHiddenBefore = await leftTabBarBefore.isVisible().catch(() => false);
    console.log('Before toggle - Left ribbon visible:', isHiddenBefore);

    // Toggle to developer mode (Cmd+Shift+M)
    await page.keyboard.press('Meta+Shift+M');
    await page.waitForTimeout(2000);

    // Check that UI elements are now visible
    const leftTabBarAfter = page.locator('.lm-TabBar.theia-app-left');
    const isVisibleAfter = await leftTabBarAfter.isVisible().catch(() => false);
    console.log('After toggle - Left ribbon visible:', isVisibleAfter);

    const statusBarAfter = page.locator('#theia-statusBar, .theia-statusBar');
    const isStatusBarVisibleAfter = await statusBarAfter.isVisible().catch(() => false);
    console.log('After toggle - Status bar visible:', isStatusBarVisibleAfter);

    // In developer mode, UI elements should be visible
    expect(isVisibleAfter).toBe(true);
    expect(isStatusBarVisibleAfter).toBe(true);

    console.log('✓ Mode toggle working: switched to developer mode');
  });

  test('Mode toggle - should toggle back to knowledge mode', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(5000);

    // First toggle to developer mode
    await page.keyboard.press('Meta+Shift+M');
    await page.waitForTimeout(2000);

    // Toggle back to knowledge mode
    await page.keyboard.press('Meta+Shift+M');
    await page.waitForTimeout(2000);

    // Verify back to clean UI
    const leftTabBar = page.locator('.lm-TabBar.theia-app-left');
    const isHiddenAgain = await leftTabBar.isVisible().catch(() => false);
    console.log('After second toggle - Left ribbon visible:', isHiddenAgain);

    expect(isHiddenAgain).toBe(false);
    console.log('✓ Mode toggle working: switched back to knowledge mode');
  });
});
