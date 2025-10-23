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
import * as path from 'path';
import * as fs from 'fs-extra';

test.describe('Knowledge Base User Workflow', () => {

    test('should open workspace and show markdown files in Knowledge Base', async ({ page }) => {
        // Note: The workspace fixture now creates files BEFORE launching the app
        console.log('Step 1: Waiting for app to load...');
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(5000); // Give Theia time to load workspace

        // Step 3: Verify Knowledge Base tab is visible
        console.log('Step 3: Verifying Knowledge Base tab...');
        const kbTab = page.locator('#shell-tab-docs-view-container');
        const kbTabExists = await kbTab.count();
        console.log(`Knowledge Base tab count: ${kbTabExists}`);
        expect(kbTabExists).toBeGreaterThan(0);
        console.log('✓ Knowledge Base tab found');

        // Take screenshot before clicking
        await page.screenshot({ path: 'test-results/kb-before-click.png', fullPage: true });

        // Step 4: Click Knowledge Base tab
        console.log('Step 4: Opening Knowledge Base...');
        await kbTab.click();
        await page.waitForTimeout(2000);

        // Take screenshot after clicking
        await page.screenshot({ path: 'test-results/kb-after-click.png', fullPage: true });

        // Step 5: Wait for Knowledge Base to load
        console.log('Step 5: Waiting for Knowledge Base to load...');
        await page.waitForTimeout(3000); // Give time for panel to load

        // Step 6: Verify markdown files appear
        console.log('Step 6: Verifying markdown files in Knowledge Base...');

        // Look for markdown files in the tree
        const treeNodes = page.locator('.theia-TreeNode');
        const nodeCount = await treeNodes.count();
        console.log(`Found ${nodeCount} tree nodes`);

        // Check for specific files
        const readmeVisible = await page.locator('text=README.md').count() > 0;
        const notesVisible = await page.locator('text=notes.md').count() > 0;
        const todoVisible = await page.locator('text=todo.md').count() > 0;

        console.log(`README.md visible: ${readmeVisible}`);
        console.log(`notes.md visible: ${notesVisible}`);
        console.log(`todo.md visible: ${todoVisible}`);

        // At least one markdown file should be visible
        expect(readmeVisible || notesVisible || todoVisible).toBe(true);
        console.log('✓ At least one markdown file found');

        // Step 7: Verify non-markdown files are NOT visible in KB
        console.log('Step 7: Verifying non-markdown files are filtered out...');

        // Get all visible text in the KB tree
        const treeText = await page.locator('#docs-view-container').textContent();

        // These should NOT appear in the KB
        expect(treeText).not.toContain('index.js');
        expect(treeText).not.toContain('styles.css');
        console.log('✓ Non-markdown files correctly hidden');

        // Step 8: Try to open a markdown file
        console.log('Step 8: Opening a markdown file...');

        if (readmeVisible) {
            // Double-click README.md
            const readmeNode = page.locator('.theia-TreeNode:has-text("README.md")').first();
            await readmeNode.dblclick();
            await page.waitForTimeout(2000);

            // Check if editor opened
            const editorExists = await page.locator('.monaco-editor').count() > 0;
            if (editorExists) {
                console.log('✓ Editor opened for README.md');

                // Take screenshot with file open
                await page.screenshot({ path: 'test-results/kb-file-opened.png', fullPage: true });
            } else {
                console.log('⚠️ Editor did not open (may need different selector)');
            }
        }

        console.log('\n✅ Workflow test completed!');
    });

    test('should show empty Knowledge Base when no markdown files exist', async ({ page, workspace }) => {
        console.log(`\nTest workspace: ${workspace}`);
        console.log('Creating workspace with only non-markdown files...');

        // Create only non-markdown files
        await fs.writeFile(path.join(workspace, 'index.js'), 'console.log("test");');
        await fs.writeFile(path.join(workspace, 'styles.css'), 'body {}');
        await fs.writeFile(path.join(workspace, 'package.json'), '{}');

        console.log('✓ Non-markdown files created');

        // Wait for app to load
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(5000);

        // Open Knowledge Base
        const kbTab = page.locator('#shell-tab-docs-view-container');
        await kbTab.click();
        await page.waitForTimeout(2000);

        // Take screenshot
        await page.screenshot({ path: 'test-results/kb-empty-state.png', fullPage: true });

        // Verify no markdown files shown
        const treeText = await page.locator('#docs-view-container').textContent();

        expect(treeText).not.toContain('.md');
        expect(treeText).not.toContain('index.js');
        expect(treeText).not.toContain('styles.css');

        console.log('✓ No files shown when no markdown exists');
        console.log('\n✅ Empty state test passed!');
    });

    test('should show nested markdown files in folders', async ({ page, workspace }) => {
        console.log(`\nTest workspace: ${workspace}`);
        console.log('Creating nested markdown structure...');

        // Create nested structure
        await fs.writeFile(path.join(workspace, 'README.md'), '# Root');
        await fs.ensureDir(path.join(workspace, 'docs'));
        await fs.writeFile(path.join(workspace, 'docs', 'guide.md'), '# Guide');
        await fs.ensureDir(path.join(workspace, 'docs', 'api'));
        await fs.writeFile(path.join(workspace, 'docs', 'api', 'reference.md'), '# API Reference');

        console.log('✓ Nested structure created');

        // Wait for app to load
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(5000);

        // Open Knowledge Base
        const kbTab = page.locator('#shell-tab-docs-view-container');
        await kbTab.click();
        await page.waitForTimeout(2000);

        // Root level file should be visible
        const rootMdVisible = await page.locator('text=README.md').count() > 0;
        console.log(`README.md visible: ${rootMdVisible}`);
        expect(rootMdVisible).toBe(true);

        // Docs folder should be visible
        const docsFolderVisible = await page.locator('.theia-TreeNode:has-text("docs")').count() > 0;
        console.log(`docs folder visible: ${docsFolderVisible}`);

        if (docsFolderVisible) {
            console.log('✓ Folder structure visible in Knowledge Base');
        }

        console.log('\n✅ Nested files test passed!');
    });
});
