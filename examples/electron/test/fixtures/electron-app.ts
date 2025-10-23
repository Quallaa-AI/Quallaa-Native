// *****************************************************************************
// Copyright (C) 2025 Quallaa AI
//
// This program and the accompanying materials are made available under the
// terms of the Eclipse Public License v. 2.0 which is available at
// http://www.eclipse.org/legal/epl-2.0.
//
// SPDX-License-Identifier: EPL-2.0 OR GPL-2.0-only WITH Classpath-exception-2.0
// *****************************************************************************

import { test as base, _electron as electron, ElectronApplication, Page } from '@playwright/test';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';

/**
 * Extended test fixture that provides an Electron app instance
 */
export type TestFixtures = {
  electronApp: ElectronApplication;
  page: Page;
  userDataDir: string;
  workspace: string;
};

/**
 * Custom test fixture for Quallaa Electron app testing
 */
export const test = base.extend<TestFixtures>({
  /**
   * User data directory for isolated test environment
   */
  userDataDir: async ({}, use) => {
    const tempDir = path.join(os.tmpdir(), `quallaa-test-${Date.now()}`);
    fs.mkdirSync(tempDir, { recursive: true });
    await use(tempDir);
    // Cleanup after test
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  },

  /**
   * Test workspace directory with sample markdown files
   * Tests can modify this workspace before the app launches if needed
   */
  workspace: async ({}, use) => {
    const workspaceDir = path.join(os.tmpdir(), `quallaa-workspace-${Date.now()}`);
    fs.mkdirSync(workspaceDir, { recursive: true });

    // Create default test files
    fs.writeFileSync(path.join(workspaceDir, 'README.md'), '# My Project\n\nThis is a test project.');
    fs.writeFileSync(path.join(workspaceDir, 'notes.md'), '# Notes\n\nSome notes here.');
    fs.writeFileSync(path.join(workspaceDir, 'todo.md'), '# TODO\n\n- [ ] Task 1\n- [ ] Task 2');
    fs.writeFileSync(path.join(workspaceDir, 'index.js'), 'console.log("test");');
    fs.writeFileSync(path.join(workspaceDir, 'styles.css'), 'body { margin: 0; }');

    // Create subdirectory with markdown
    const docsDir = path.join(workspaceDir, 'docs');
    fs.mkdirSync(docsDir, { recursive: true });
    fs.writeFileSync(path.join(docsDir, 'guide.md'), '# Guide\n\nProject guide.');

    await use(workspaceDir);
    // Cleanup after test
    if (fs.existsSync(workspaceDir)) {
      fs.rmSync(workspaceDir, { recursive: true, force: true });
    }
  },

  /**
   * Electron application instance
   */
  electronApp: async ({ userDataDir, workspace }, use) => {
    // Path to the Electron main process
    const electronPath = require('electron');
    const appPath = path.join(__dirname, '../../lib/backend/electron-main.js');

    // Launch Electron app with workspace
    const app = await electron.launch({
      executablePath: electronPath as string,
      args: [
        appPath,
        workspace, // Open workspace on launch
        `--user-data-dir=${userDataDir}`,
        '--no-sandbox',
        '--disable-dev-shm-usage',
      ],
      env: {
        ...process.env,
        NODE_ENV: 'test',
      },
    });

    // Wait for the app to be ready
    await app.evaluate(({ app }) => app.whenReady());

    await use(app);

    // Close the app
    await app.close();
  },

  /**
   * Main window page
   */
  page: async ({ electronApp }, use) => {
    // Wait for the first window to open
    const window = await electronApp.firstWindow();

    // Wait for the page to be fully loaded
    await window.waitForLoadState('domcontentloaded');

    await use(window);
  },
});

export { expect } from '@playwright/test';
