// *****************************************************************************
// Copyright (C) 2025 Quallaa and others.
//
// This program and the accompanying materials are made available under the
// terms of the Eclipse Public License v. 2.0 which is available at
// http://www.eclipse.org/legal/epl-2.0.
//
// This Source Code may also be made available under the following Secondary
// Licenses when the conditions for such availability set forth in the Eclipse
// Public License v. 2.0 are satisfied: GNU General Public License, version 2
// with the GNU Classpath Exception which is available at
// https://www.gnu.org/software/classpath/license.html.
//
// SPDX-License-Identifier: EPL-2.0 OR GPL-2.0-only WITH Classpath-exception-2.0
// *****************************************************************************

import { injectable, inject } from '@theia/core/shared/inversify';
import { FrontendApplicationContribution } from '@theia/core/lib/browser/frontend-application-contribution';
import { FrontendApplication } from '@theia/core/lib/browser/frontend-application';
import { ApplicationShell } from '@theia/core/lib/browser/shell/application-shell';
import { StorageService } from '@theia/core/lib/browser/storage-service';
import { CommandRegistry } from '@theia/core/lib/common/command';
import { KeybindingRegistry } from '@theia/core/lib/browser/keybinding';
import { QuallaaCommands } from './quallaa-contribution';

/**
 * Manages simple mode / developer mode toggle for Quallaa.
 *
 * Simple mode: Markdown editor + docs tree + AI chat (minimal UI)
 * Developer mode: Full IDE with all panels visible
 *
 * Research validated: packages/quallaa-core/docs/research/2025-01-theia-shell-customization-research.md
 * Design: packages/quallaa-core/docs/architecture/shell-modes-design.md
 */
@injectable()
export class QuallaaModuleManager implements FrontendApplicationContribution {

    private static readonly MODE_KEY = 'quallaa-ui-mode';

    @inject(ApplicationShell)
    protected readonly shell: ApplicationShell;

    @inject(StorageService)
    protected readonly storage: StorageService;

    @inject(CommandRegistry)
    protected readonly commands: CommandRegistry;

    @inject(KeybindingRegistry)
    protected readonly keybindings: KeybindingRegistry;

    /**
     * Called when application is ready to start.
     * Registers command and keybinding manually to avoid async dependency issues.
     */
    onStart(app: FrontendApplication): void {
        console.log('[QuallaaModuleManager] Registering toggle command and keybinding');

        // Register command
        this.commands.registerCommand(QuallaaCommands.TOGGLE_DEVELOPER_MODE, {
            execute: async () => {
                console.log('[QuallaaModuleManager] Toggle command executed');
                await this.toggleMode();
            }
        });

        // Register keybinding (Cmd+K D / Ctrl+K D)
        this.keybindings.registerKeybinding({
            command: QuallaaCommands.TOGGLE_DEVELOPER_MODE.id,
            keybinding: 'ctrlcmd+k d',
            context: 'true'
        });

        console.log('[QuallaaModuleManager] Command and keybinding registered successfully');
    }

    /**
     * Called after layout is initialized.
     * This runs AFTER Theia restores saved layout, so we can override it.
     *
     * Lifecycle: Application starts → Theia restores layout → onDidInitializeLayout → Shell attaches to DOM
     */
    async onDidInitializeLayout(app: FrontendApplication): Promise<void> {
        console.log('[QuallaaModuleManager] onDidInitializeLayout called');
        try {
            const mode = await this.storage.getData<string>(
                QuallaaModuleManager.MODE_KEY,
                'simple'  // Default to simple mode
            );
            console.log('[QuallaaModuleManager] Current mode from storage:', mode);
            await this.applyMode(mode);
        } catch (error) {
            console.error('[QuallaaModuleManager] Error in onDidInitializeLayout:', error);
        }
    }

    /**
     * Toggle between simple and developer mode.
     * Called by toggle command (Cmd+K D).
     */
    async toggleMode(): Promise<void> {
        const current = await this.storage.getData<string>(
            QuallaaModuleManager.MODE_KEY,
            'simple'
        );
        const newMode = current === 'simple' ? 'developer' : 'simple';
        console.log('[QuallaaModuleManager] Toggling mode:', current, '→', newMode);
        await this.storage.setData(QuallaaModuleManager.MODE_KEY, newMode);
        await this.applyMode(newMode);
    }

    /**
     * Apply the given mode to the shell.
     */
    private async applyMode(mode: string): Promise<void> {
        console.log('[QuallaaModuleManager] Applying mode:', mode);
        if (mode === 'simple') {
            await this.enterSimpleMode();
        } else {
            await this.enterDeveloperMode();
        }
    }

    /**
     * Simple mode: Minimal UI showing docs tree + editor + AI chat.
     *
     * Layout:
     * - Left: Docs tree (markdown files only)
     * - Main: Editor (markdown files)
     * - Right: AI chat
     * - Top: VISIBLE (need menu bar for command palette access)
     * - Bottom: Hidden (no terminal/problems)
     *
     * MVP NOTE: We keep the menu bar visible to ensure keyboard shortcuts work.
     * Phase 2 will implement custom chrome to hide menu bar while preserving shortcuts.
     */
    private async enterSimpleMode(): Promise<void> {
        console.log('[QuallaaModuleManager] Entering simple mode');
        // MVP: Do NOT hide top panel - breaks command palette and keyboard shortcuts
        // this.shell.topPanel.hide(); // Commented out for MVP

        // Collapse all side panels first
        await this.shell.collapsePanel('left');
        await this.shell.collapsePanel('right');
        await this.shell.collapsePanel('bottom');

        // Show docs tree in left panel
        // Note: Widget IDs from packages/docs-view/src/browser/docs-tree-widget.tsx
        try {
            await this.shell.leftPanelHandler.activate('docs-view');
            await this.shell.expandPanel('left');
        } catch (error) {
            // Widget not found - silently ignore
        }

        // Show AI chat in right panel
        // Note: Widget ID from packages/ai-chat-ui/
        try {
            await this.shell.rightPanelHandler.activate('ide-ai-chat-view');
            await this.shell.expandPanel('right');
        } catch (error) {
            // Widget not found - silently ignore
        }

        // Main area = editor (automatically shows open files)
        // No action needed - Theia handles this
    }

    /**
     * Developer mode: Show full IDE.
     *
     * Layout:
     * - Left: File explorer, search, git (full sidebar)
     * - Main: Editor (all file types)
     * - Right: User-controlled (don't force-expand)
     * - Top: Always visible (menu bar needed for shortcuts)
     * - Bottom: Visible (terminal, problems, output)
     */
    private async enterDeveloperMode(): Promise<void> {
        console.log('[QuallaaModuleManager] Entering developer mode');
        // MVP: Top panel stays visible in both modes
        // this.shell.topPanel.show(); // Not needed - always visible

        // Expand left panel (file explorer, search, git)
        await this.shell.expandPanel('left');

        // Expand bottom panel (terminal, problems, output)
        await this.shell.expandPanel('bottom');

        // Let user control right panel (outline, properties, etc.)
        // Don't force-expand it - user may prefer it collapsed
    }
}
