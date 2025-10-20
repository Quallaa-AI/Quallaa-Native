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

import { injectable, postConstruct } from '@theia/core/shared/inversify';
import { CommandContribution, CommandRegistry, Command } from '@theia/core/lib/common/command';
import { KeybindingContribution, KeybindingRegistry } from '@theia/core/lib/browser/keybinding';
import { ApplicationShell } from '@theia/core/lib/browser/shell/application-shell';
import { StorageService } from '@theia/core/lib/browser/storage-service';

/**
 * Quallaa commands
 */
export namespace QuallaaCommands {
    export const TOGGLE_DEVELOPER_MODE: Command = {
        id: 'quallaa.toggleDeveloperMode',
        label: 'Toggle Developer Mode',
        category: 'View'
    };
}

/**
 * Registers Quallaa commands
 *
 * NOTE: We can't inject QuallaaModuleManager because it has async dependencies.
 * Instead, we duplicate the toggle logic here (acceptable for MVP).
 */
@injectable()
export class QuallaaCommandContribution implements CommandContribution {

    protected shell: ApplicationShell | undefined;
    protected storage: StorageService | undefined;

    @postConstruct()
    protected init(): void {
        // Services are injected later - we'll get them when the command executes
    }

    registerCommands(commands: CommandRegistry): void {
        commands.registerCommand(QuallaaCommands.TOGGLE_DEVELOPER_MODE, {
            execute: async () => {
                // Get services from the global container at runtime
                // This is a workaround for the async dependency issue
                if (!this.shell || !this.storage) {
                    // Services should be available by the time commands execute
                    return;
                }

                const MODE_KEY = 'quallaa-ui-mode';
                const current = await this.storage.getData<string>(MODE_KEY, 'simple');
                const newMode = current === 'simple' ? 'developer' : 'simple';
                await this.storage.setData(MODE_KEY, newMode);

                if (newMode === 'simple') {
                    this.shell.topPanel.hide();
                    await this.shell.collapsePanel('left');
                    await this.shell.collapsePanel('right');
                    await this.shell.collapsePanel('bottom');

                    try {
                        await this.shell.leftPanelHandler.activate('docs-view');
                        await this.shell.expandPanel('left');
                    } catch (e) { /* ignore */ }

                    try {
                        await this.shell.rightPanelHandler.activate('ide-ai-chat-view');
                        await this.shell.expandPanel('right');
                    } catch (e) { /* ignore */ }
                } else {
                    this.shell.topPanel.show();
                    await this.shell.expandPanel('left');
                    await this.shell.expandPanel('bottom');
                }
            },
            isEnabled: () => !!this.shell && !!this.storage
        });
    }

    // Method to set services (called from module)
    setServices(shell: ApplicationShell, storage: StorageService): void {
        this.shell = shell;
        this.storage = storage;
    }
}

/**
 * Registers Quallaa keybindings
 */
@injectable()
export class QuallaaKeybindingContribution implements KeybindingContribution {

    registerKeybindings(keybindings: KeybindingRegistry): void {
        // Chord keybinding: Cmd+K D / Ctrl+K D (like VS Code shortcuts)
        // This avoids conflict with debug view (Cmd+Shift+D) and docs view
        keybindings.registerKeybinding({
            command: QuallaaCommands.TOGGLE_DEVELOPER_MODE.id,
            keybinding: 'ctrlcmd+k d',
            context: 'true'
        });
    }
}
