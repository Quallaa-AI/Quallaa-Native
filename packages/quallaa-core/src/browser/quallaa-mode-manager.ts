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
import { WidgetManager } from '@theia/core/lib/browser/widget-manager';
import { QuallaaCommands } from './quallaa-contribution';

/**
 * Manages knowledge mode / developer mode toggle for Quallaa.
 *
 * Knowledge mode: Markdown editor + docs tree + AI chat (knowledge base/note-taking UI)
 * Developer mode: Full IDE with all panels visible
 *
 * Research validated: packages/quallaa-core/docs/research/2025-01-theia-shell-customization-research.md
 * Design: packages/quallaa-core/docs/architecture/shell-modes-design.md
 */
@injectable()
export class QuallaaModuleManager implements FrontendApplicationContribution {

    private static readonly MODE_KEY = 'quallaa-ui-mode';
    private static readonly FIRST_LAUNCH_KEY = 'quallaa-first-launch-complete';

    @inject(ApplicationShell)
    protected readonly shell: ApplicationShell;

    @inject(StorageService)
    protected readonly storage: StorageService;

    @inject(CommandRegistry)
    protected readonly commands: CommandRegistry;

    @inject(KeybindingRegistry)
    protected readonly keybindings: KeybindingRegistry;

    @inject(WidgetManager)
    protected readonly widgetManager: WidgetManager;

    private modeApplied = false;

    /**
     * Called when application is ready to start.
     * Registers command and keybinding manually to avoid async dependency issues.
     */
    async onStart(app: FrontendApplication): Promise<void> {
        console.log('[QuallaaModuleManager] Registering toggle command and keybinding');

        // Register command
        this.commands.registerCommand(QuallaaCommands.TOGGLE_DEVELOPER_MODE, {
            execute: async () => {
                console.log('[QuallaaModuleManager] Toggle command executed');
                await this.toggleMode();
            }
        });

        // Register keybinding (Cmd+Shift+M / Ctrl+Shift+M for "Mode")
        this.keybindings.registerKeybinding({
            command: QuallaaCommands.TOGGLE_DEVELOPER_MODE.id,
            keybinding: 'ctrlcmd+shift+m',
            context: 'true'
        });

        console.log('[QuallaaModuleManager] Command and keybinding registered successfully');

        // Apply mode AFTER shell is fully attached to DOM and ready
        // This ensures panel sizing works correctly
        if (!this.modeApplied) {
            // Check if this is the very first launch
            const firstLaunchComplete = await this.storage.getData<boolean>(
                QuallaaModuleManager.FIRST_LAUNCH_KEY
            );

            let mode: string;

            if (!firstLaunchComplete) {
                // First launch ever - force knowledge mode
                console.log('[QuallaaModuleManager] First launch detected, setting knowledge mode as default');
                mode = 'knowledge';
                await this.storage.setData(QuallaaModuleManager.MODE_KEY, mode);
                await this.storage.setData(QuallaaModuleManager.FIRST_LAUNCH_KEY, true);
            } else {
                // Not first launch - respect saved preference
                mode = await this.storage.getData<string>(
                    QuallaaModuleManager.MODE_KEY,
                    'knowledge' // Default to knowledge if somehow unset
                );
                console.log('[QuallaaModuleManager] Storage returned mode:', mode);
            }

            console.log('[QuallaaModuleManager] onStart: Applying mode:', mode);
            await this.applyMode(mode);
            this.modeApplied = true;
        }
    }

    /**
     * Called on first launch when there is no saved layout.
     * This is where we set up the default Quallaa knowledge mode layout.
     *
     * Lifecycle: Application starts → No saved layout → initializeLayout → onDidInitializeLayout → Shell attaches to DOM
     *
     * Note: onDidInitializeLayout will be called after this, so we just set up the widgets here
     * and let onDidInitializeLayout handle the mode application.
     */
    async initializeLayout(app: FrontendApplication): Promise<void> {
        console.log('[QuallaaModuleManager] initializeLayout called - first launch detected');

        // Set default mode to knowledge (will be applied in onDidInitializeLayout)
        await this.storage.setData(QuallaaModuleManager.MODE_KEY, 'knowledge');

        console.log('[QuallaaModuleManager] Default mode set to knowledge, will be applied in onDidInitializeLayout');
    }

    /**
     * Called after layout is initialized, regardless of whether it was restored or created fresh.
     * This runs AFTER Theia restores saved layout (if it exists) or after initializeLayout (if first launch).
     *
     * Lifecycle: Application starts → Layout initialized → onDidInitializeLayout → Shell attaches to DOM
     *
     * NOTE: This is where we ensure knowledge mode is the default for first launch.
     */
    async onDidInitializeLayout(app: FrontendApplication): Promise<void> {
        console.log('[QuallaaModuleManager] onDidInitializeLayout called');

        // Force knowledge mode as default if not explicitly set by user
        // This ensures fresh installs start in knowledge mode
        const existingMode = await this.storage.getData<string>(QuallaaModuleManager.MODE_KEY);
        if (!existingMode) {
            console.log('[QuallaaModuleManager] No mode set, defaulting to knowledge mode');
            await this.storage.setData(QuallaaModuleManager.MODE_KEY, 'knowledge');
        }
    }

    /**
     * Toggle between knowledge mode and developer mode.
     * Called by toggle command (Cmd+Shift+M for Mode).
     */
    async toggleMode(): Promise<void> {
        const current = await this.storage.getData<string>(
            QuallaaModuleManager.MODE_KEY,
            'knowledge'
        );
        const newMode = current === 'knowledge' ? 'developer' : 'knowledge';
        console.log('[QuallaaModuleManager] Toggling mode:', current, '→', newMode);
        await this.storage.setData(QuallaaModuleManager.MODE_KEY, newMode);
        await this.applyMode(newMode);
    }

    /**
     * Apply the given mode to the shell.
     */
    private async applyMode(mode: string): Promise<void> {
        console.log('[QuallaaModuleManager] Applying mode:', mode);
        if (mode === 'knowledge') {
            await this.enterKnowledgeMode();
        } else {
            await this.enterDeveloperMode();
        }
    }

    /**
     * Knowledge mode: Clean Obsidian-like UI.
     *
     * Layout:
     * - Left: Docs tree (markdown files only) - NO icon ribbon
     * - Main: Editor (markdown files)
     * - Right: AI chat (collapsible)
     * - Top: Menu bar visible
     * - Bottom: Status bar HIDDEN
     * - Left icon ribbon: HIDDEN
     *
     * This is the primary mode for note-taking, knowledge management, and AI-assisted writing.
     * Ultra-clean Obsidian-like experience.
     */
    private async enterKnowledgeMode(): Promise<void> {
        console.log('[QuallaaModuleManager] Entering knowledge mode');

        // Collapse bottom panel (terminal/problems)
        await this.shell.collapsePanel('bottom');

        // Show docs tree in left panel
        // Note: View container ID from packages/docs-view/src/common/index.ts
        try {
            console.log('[QuallaaModuleManager] Opening docs-view-container widget...');
            const docsWidget = await this.widgetManager.getOrCreateWidget('docs-view-container');
            console.log('[QuallaaModuleManager] Docs widget created:', docsWidget.id, docsWidget.title.label);

            // Add widget to left panel
            await this.shell.addWidget(docsWidget, { area: 'left' });

            // Directly expand the left panel and activate the widget
            const expandedWidget = this.shell.leftPanelHandler.expand(docsWidget.id);
            if (expandedWidget) {
                expandedWidget.activate();
                // Wait for expansion to complete before resizing
                await new Promise(resolve => setTimeout(resolve, 100));
                // Explicitly resize the left panel to 300px (default size)
                this.shell.leftPanelHandler.resize(300);
                console.log('[QuallaaModuleManager] ✓ Docs view expanded and activated, panel resized to 300px');
            } else {
                console.error('[QuallaaModuleManager] ✗ Failed to expand docs widget');
            }
        } catch (error) {
            console.error('[QuallaaModuleManager] ✗ Failed to open docs-view-container:', error);
            console.error('[QuallaaModuleManager]   Error details:', error instanceof Error ? error.message : String(error));
        }

        // Show AI chat in right panel
        // Note: Widget ID from packages/ai-chat-ui/src/browser/chat-view-widget.tsx
        try {
            console.log('[QuallaaModuleManager] Opening chat-view-widget...');
            const chatWidget = await this.widgetManager.getOrCreateWidget('chat-view-widget');
            console.log('[QuallaaModuleManager] Chat widget created:', chatWidget.id, chatWidget.title.label);

            // Add widget to right panel
            await this.shell.addWidget(chatWidget, { area: 'right' });

            // Directly expand the right panel and activate the widget
            const expandedWidget = this.shell.rightPanelHandler.expand(chatWidget.id);
            if (expandedWidget) {
                expandedWidget.activate();
                // Wait for expansion to complete before resizing
                await new Promise(resolve => setTimeout(resolve, 100));
                // Explicitly resize the right panel to 300px (default size)
                this.shell.rightPanelHandler.resize(300);
                console.log('[QuallaaModuleManager] ✓ Chat view expanded and activated, panel resized to 300px');
            } else {
                console.error('[QuallaaModuleManager] ✗ Failed to expand chat widget');
            }
        } catch (error) {
            console.error('[QuallaaModuleManager] ✗ Failed to open chat-view-widget:', error);
            console.error('[QuallaaModuleManager]   Error details:', error instanceof Error ? error.message : String(error));
        }

        // Main area = editor (automatically shows open files)
        // No action needed - Theia handles this

        // Hide UI chrome by adding CSS classes to the document body
        // This is more reliable than timing JavaScript .hide() calls
        document.body.classList.add('quallaa-knowledge-mode');
        document.body.classList.remove('quallaa-developer-mode');

        // Also call .hide() for good measure (works after first render)
        this.shell.leftPanelHandler.tabBar.hide();
        (this.shell as any).statusBar.hide();

        console.log('[QuallaaModuleManager] ✓ Knowledge mode UI chrome hidden');

        console.log('[QuallaaModuleManager] Knowledge mode layout complete');
    }

    /**
     * Developer mode: Show full IDE.
     *
     * Layout:
     * - Left: File explorer, search, git (full sidebar with icon ribbon)
     * - Main: Editor (all file types)
     * - Right: User-controlled (don't force-expand)
     * - Top: Menu bar visible
     * - Bottom: Status bar visible, terminal/problems panels visible
     */
    private async enterDeveloperMode(): Promise<void> {
        console.log('[QuallaaModuleManager] Entering developer mode');

        // Show UI chrome by removing knowledge mode class
        document.body.classList.remove('quallaa-knowledge-mode');
        document.body.classList.add('quallaa-developer-mode');

        // Show left icon ribbon (activity bar)
        this.shell.leftPanelHandler.tabBar.show();
        console.log('[QuallaaModuleManager] ✓ Left icon ribbon shown');

        // Show bottom status bar
        (this.shell as any).statusBar.show();
        console.log('[QuallaaModuleManager] ✓ Bottom status bar shown');

        // Expand left panel (file explorer, search, git)
        await this.shell.expandPanel('left');

        // Expand bottom panel (terminal, problems, output)
        await this.shell.expandPanel('bottom');

        // Let user control right panel (outline, properties, etc.)
        // Don't force-expand it - user may prefer it collapsed
    }
}
