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
 */
test.describe('Knowledge Mode UI', () => {

  test('Knowledge mode - clean interface with hidden UI elements', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(5000);

    // Take screenshot of knowledge mode
    await page.screenshot({
      path: 'test-results/knowledge-mode-screenshot.png',
      fullPage: true
    });

    // Check that left icon ribbon is hidden
    const leftTabBar = page.locator('.lm-TabBar.theia-app-left');
    const isLeftTabBarVisible = await leftTabBar.isVisible().catch(() => false);
    console.log('Left icon ribbon visible:', isLeftTabBarVisible);

    // Check that status bar is hidden
    const statusBar = page.locator('#theia-statusBar, .theia-statusBar');
    const isStatusBarVisible = await statusBar.isVisible().catch(() => false);
    console.log('Status bar visible:', isStatusBarVisible);

    // Check that docs panel is visible
    const docsPanel = page.locator('[id*="docs-view"]').first();
    const isDocsPanelVisible = await docsPanel.isVisible({ timeout: 5000 }).catch(() => false);
    console.log('Docs panel visible:', isDocsPanelVisible);

    // Check that chat panel is visible
    const chatPanel = page.locator('[id*="chat-view"]').first();
    const isChatPanelVisible = await chatPanel.isVisible({ timeout: 5000 }).catch(() => false);
    console.log('Chat panel visible:', isChatPanelVisible);

    // Verify expectations
    expect(isLeftTabBarVisible).toBe(false); // Should be hidden
    expect(isStatusBarVisible).toBe(false); // Should be hidden
    expect(isDocsPanelVisible).toBe(true); // Should be visible
    expect(isChatPanelVisible).toBe(true); // Should be visible

    console.log('✓ Knowledge mode UI verified: clean and Obsidian-like');
  });

  test('Mode toggle - Cmd+Shift+M switches to developer mode', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(5000);

    // Start in knowledge mode - verify clean UI
    const leftTabBarBefore = page.locator('.lm-TabBar.theia-app-left');
    const isHiddenBefore = await leftTabBarBefore.isVisible().catch(() => false);
    console.log('Before toggle - Left ribbon visible:', isHiddenBefore);

    // Toggle to developer mode (Cmd+Shift+M)
    await page.keyboard.press('Meta+Shift+M');
    await page.waitForTimeout(2000);

    // Take screenshot of developer mode
    await page.screenshot({
      path: 'test-results/developer-mode-screenshot.png',
      fullPage: true
    });

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

    // Toggle back to knowledge mode
    await page.keyboard.press('Meta+Shift+M');
    await page.waitForTimeout(2000);

    // Take screenshot of knowledge mode after toggle
    await page.screenshot({
      path: 'test-results/knowledge-mode-after-toggle.png',
      fullPage: true
    });

    // Verify back to clean UI
    const isHiddenAgain = await leftTabBarBefore.isVisible().catch(() => false);
    console.log('After second toggle - Left ribbon visible:', isHiddenAgain);
    expect(isHiddenAgain).toBe(false);

    console.log('✓ Mode toggle working: switched back to knowledge mode');
  });

  test('Visual comparison - measure UI cleanliness', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(5000);

    // Count visible UI chrome elements
    const uiElements = await page.evaluate(() => {
      const leftRibbon = document.querySelector('.lm-TabBar.theia-app-left');
      const statusBar = document.querySelector('#theia-statusBar, .theia-statusBar');
      const bottomPanel = document.querySelector('#theia-bottom-content-panel');

      return {
        leftRibbonVisible: leftRibbon ? (leftRibbon as HTMLElement).offsetParent !== null : false,
        statusBarVisible: statusBar ? (statusBar as HTMLElement).offsetParent !== null : false,
        bottomPanelVisible: bottomPanel ? (bottomPanel as HTMLElement).offsetHeight > 0 : false,
      };
    });

    console.log('UI cleanliness metrics:', JSON.stringify(uiElements, null, 2));

    // Knowledge mode should have minimal UI chrome
    expect(uiElements.leftRibbonVisible).toBe(false);
    expect(uiElements.statusBarVisible).toBe(false);
    expect(uiElements.bottomPanelVisible).toBe(false);

    console.log('✓ UI is clean: minimal chrome elements visible');
  });
});
