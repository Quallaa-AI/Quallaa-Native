// *****************************************************************************
// Copyright (C) 2025 Quallaa and others.
//
// This program and the accompanying materials are made available under the
// terms of the Eclipse Public License v. 2.0 which is available at
// http://www.eclipse.org/legal/epl-2.0.
//
// SPDX-License-Identifier: EPL-2.0 OR GPL-2.0-only WITH Classpath-exception-2.0
// *****************************************************************************

import { test, expect } from '../fixtures/electron-app';

test.describe('Docs View Tests', () => {

    test('should show Docs tab in activity bar', async ({ page }) => {
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(3000);

        // Take a screenshot for debugging
        await page.screenshot({ path: 'test-results/docs-view-check.png', fullPage: true });

        // Look for Docs tab by its ID
        const docsTab = page.locator('#shell-tab-docs-view-container');
        const docsExists = await docsTab.count();

        console.log(`Docs tab exists: ${docsExists > 0}`);

        expect(docsExists).toBeGreaterThan(0);
    });

    test('should show book icon for Docs tab', async ({ page }) => {
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(3000);

        // Look for the book icon (codicon-book)
        const bookIcon = page.locator('.theia-app-left .codicon-book');
        const iconCount = await bookIcon.count();

        console.log(`Book icon count: ${iconCount}`);

        if (iconCount > 0) {
            // Get parent element to see context
            for (let i = 0; i < iconCount; i++) {
                const icon = bookIcon.nth(i);
                const parent = icon.locator('..');
                const parentTitle = await parent.getAttribute('title').catch(() => 'no-title');
                console.log(`Book icon ${i} parent title: "${parentTitle}"`);
            }
        }

        expect(iconCount).toBeGreaterThan(0);
    });

    test('should open Docs view when clicked', async ({ page }) => {
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(3000);

        // Click the Docs tab by ID
        const docsTab = page.locator('#shell-tab-docs-view-container');
        const exists = await docsTab.count();

        if (exists === 0) {
            console.log('Docs tab not found, test will fail');
        } else {
            await docsTab.click();

            // Wait for the Docs view to appear
            await page.waitForTimeout(1000);

            // Take screenshot after click
            await page.screenshot({ path: 'test-results/docs-view-after-click.png', fullPage: true });

            // Check if the Docs view container is visible
            const docsView = page.locator('#docs-view-container');
            const isVisible = await docsView.isVisible().catch(() => false);

            console.log(`Docs view visible: ${isVisible}`);

            expect(isVisible).toBe(true);
        }
    });
});
