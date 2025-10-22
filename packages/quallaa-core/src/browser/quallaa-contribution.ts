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
 * NOTE: Command registration happens in QuallaaModuleManager.onStart() to avoid async dependency issues.
 * This contribution class is kept for potential future extensions.
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
        // Command registration now handled in QuallaaModuleManager.onStart()
        // This method is kept empty for potential future command registrations
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
        // Keybinding registration now handled in QuallaaModuleManager.onStart()
        // This method is kept empty for potential future keybinding registrations
    }
}
