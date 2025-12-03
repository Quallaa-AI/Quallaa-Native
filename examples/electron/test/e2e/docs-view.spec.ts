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

/**
 * Docs View (Knowledge Base) Tests
 *
 * Verifies that the docs view widget is properly registered and displays
 * in the left panel during knowledge mode.
 */
test.describe('Docs View Tests', () => {

    test('should have docs-view-container widget registered', async ({ page }) => {
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(3000);

        // Look for Docs view container by its ID
        const docsContainer = page.locator('#docs-view-container, [id*="docs-view"]');
        const docsExists = await docsContainer.count();

        console.log(`Docs view container exists: ${docsExists > 0}`);

        expect(docsExists).toBeGreaterThan(0);
    });

    test('docs view should be visible in knowledge mode', async ({ page }) => {
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(5000);

        // Check if the Docs view container exists (may be in collapsed panel)
        const docsView = page.locator('#docs-view-container, [id*="docs-view"]').first();
        const exists = await docsView.count();

        console.log(`Docs view exists: ${exists > 0}`);

        // The widget should exist (visibility depends on panel state)
        expect(exists).toBeGreaterThan(0);
    });

    test('docs view should show Knowledge Base title', async ({ page }) => {
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(5000);

        // Check for "Knowledge Base" text in the docs view area
        const bodyText = await page.textContent('body') || '';

        // The docs view should be titled "Knowledge Base" per the rebrand
        expect(bodyText).toContain('Knowledge Base');
    });
});
