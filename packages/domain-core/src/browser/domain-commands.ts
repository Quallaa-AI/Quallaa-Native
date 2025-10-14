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
import { Command, CommandContribution, CommandRegistry } from '@theia/core';
import { ApplicationShell } from '@theia/core/lib/browser';
import { MenuContribution, MenuModelRegistry, MenuPath } from '@theia/core/lib/common';

/**
 * Command IDs and definitions for domain operations
 */
export namespace DomainCommands {
    const DOMAIN_CATEGORY = 'View';

    export const SHOW_IDE_PANELS: Command = {
        id: 'domain.showIDEPanels',
        category: DOMAIN_CATEGORY,
        label: 'Show IDE Panels'
    };

    export const HIDE_IDE_PANELS: Command = {
        id: 'domain.hideIDEPanels',
        category: DOMAIN_CATEGORY,
        label: 'Hide IDE Panels'
    };

    export const TOGGLE_IDE_PANELS: Command = {
        id: 'domain.toggleIDEPanels',
        category: DOMAIN_CATEGORY,
        label: 'Toggle IDE Panels'
    };
}

/**
 * Command contribution for domain panel toggling.
 *
 * Provides commands to show/hide/toggle IDE panels (Explorer, Terminal, etc.)
 * This enables the progressive disclosure pattern where domain UI is shown
 * by default, but IDE features are accessible on demand.
 */
@injectable()
export class DomainCommandContribution implements CommandContribution {

    @inject(ApplicationShell)
    protected readonly shell: ApplicationShell;

    /**
     * Track whether IDE panels are currently visible.
     * Used for toggle command.
     */
    protected panelsVisible = false;

    /**
     * Register commands with the command registry.
     */
    registerCommands(registry: CommandRegistry): void {
        registry.registerCommand(DomainCommands.SHOW_IDE_PANELS, {
            execute: () => this.showIDEPanels()
        });

        registry.registerCommand(DomainCommands.HIDE_IDE_PANELS, {
            execute: () => this.hideIDEPanels()
        });

        registry.registerCommand(DomainCommands.TOGGLE_IDE_PANELS, {
            execute: () => this.toggleIDEPanels()
        });
    }

    /**
     * Show IDE panels (Explorer, Terminal, etc.)
     *
     * This reveals the traditional IDE interface while keeping
     * domain-specific UI visible.
     */
    protected showIDEPanels(): void {
        console.log('[DomainCommands] Showing IDE panels');

        // Expand left panel (Explorer, Search, Source Control)
        this.shell.leftPanelHandler.expand();

        // Show bottom panel (Terminal, Problems, Output, Debug Console)
        this.shell.bottomPanel.show();

        this.panelsVisible = true;
    }

    /**
     * Hide IDE panels.
     *
     * This returns to domain-only view, hiding traditional IDE chrome.
     */
    protected hideIDEPanels(): void {
        console.log('[DomainCommands] Hiding IDE panels');

        // Collapse left panel
        this.shell.leftPanelHandler.collapse();

        // Hide bottom panel
        this.shell.bottomPanel.hide();

        this.panelsVisible = false;
    }

    /**
     * Toggle IDE panels visibility.
     *
     * Convenient shortcut that shows/hides based on current state.
     */
    protected toggleIDEPanels(): void {
        if (this.panelsVisible) {
            this.hideIDEPanels();
        } else {
            this.showIDEPanels();
        }
    }
}

/**
 * Menu contribution for domain commands.
 *
 * Adds domain commands to the View menu for easy discovery.
 */
@injectable()
export class DomainMenuContribution implements MenuContribution {

    /**
     * Register menu items.
     */
    registerMenus(menus: MenuModelRegistry): void {
        // Add to View menu
        const VIEW_MENU: MenuPath = ['view'];

        menus.registerMenuAction(VIEW_MENU, {
            commandId: DomainCommands.TOGGLE_IDE_PANELS.id,
            label: DomainCommands.TOGGLE_IDE_PANELS.label,
            order: '0' // Place near top of View menu
        });
    }
}
