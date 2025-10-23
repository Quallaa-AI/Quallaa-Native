/********************************************************************************
 * Copyright (C) 2025 Quallaa and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the Eclipse
 * Public License v. 2.0 are satisfied: GNU General Public License, version 2
 * with the GNU Classpath Exception which is available at
 * https://www.gnu.org/software/classpath/license.html.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0-only WITH Classpath-exception-2.0
 ********************************************************************************/

import { injectable } from '@theia/core/shared/inversify';
import { AbstractViewContribution } from '@theia/core/lib/browser/shell/view-contribution';
import { KeybindingRegistry, FrontendApplication, FrontendApplicationContribution } from '@theia/core/lib/browser';
import { Command, CommandRegistry, MenuModelRegistry } from '@theia/core/lib/common';
import { DocsTreeWidget } from './docs-tree-widget';
import { DOCS_VIEW_CONTAINER_ID, DOCS_TREE_WIDGET_ID, DOCS_TOGGLE_COMMAND_ID, DOCS_REFRESH_COMMAND_ID } from '../common';
import { DOCS_VIEW_CONTAINER_TITLE_OPTIONS } from './docs-widget-factory';

/**
 * Commands for the Knowledge Base view.
 */
export namespace DocsCommands {
    export const TOGGLE: Command = {
        id: DOCS_TOGGLE_COMMAND_ID,
        label: 'Toggle Knowledge Base'
    };
    export const REFRESH: Command = {
        id: DOCS_REFRESH_COMMAND_ID,
        label: 'Refresh Knowledge Base'
    };
}

/**
 * Contribution for the Docs view, handling view registration and commands.
 */
@injectable()
export class DocsContribution extends AbstractViewContribution<DocsTreeWidget> implements FrontendApplicationContribution {

    constructor() {
        super({
            viewContainerId: DOCS_VIEW_CONTAINER_ID,
            widgetId: DOCS_TREE_WIDGET_ID,
            widgetName: DOCS_VIEW_CONTAINER_TITLE_OPTIONS.label,
            defaultWidgetOptions: {
                area: 'left',
                rank: 10  // Lower rank = higher in sidebar (Explorer is 100)
            },
            toggleCommandId: DOCS_TOGGLE_COMMAND_ID,
            toggleKeybinding: 'ctrlcmd+shift+d'
        });
    }

    /**
     * Initialize the view layout on application startup.
     */
    async initializeLayout(app: FrontendApplication): Promise<void> {
        await this.openView();
    }

    /**
     * Register commands for the docs view.
     */
    override registerCommands(registry: CommandRegistry): void {
        super.registerCommands(registry);
        registry.registerCommand(DocsCommands.REFRESH, {
            execute: () => this.refreshDocsView()
        });
    }

    /**
     * Register keybindings for the docs view.
     */
    override registerKeybindings(registry: KeybindingRegistry): void {
        super.registerKeybindings(registry);
        registry.registerKeybinding({
            command: DOCS_REFRESH_COMMAND_ID,
            keybinding: 'ctrlcmd+shift+r',
            when: 'docsViewFocus'
        });
    }

    /**
     * Register menu items for the docs view.
     */
    override registerMenus(menus: MenuModelRegistry): void {
        super.registerMenus(menus);
        // Add refresh command to view menu if needed
        // menus.registerMenuAction(...);
    }

    /**
     * Refreshes the docs view by reloading the tree model.
     */
    protected async refreshDocsView(): Promise<void> {
        const widget = await this.widget;
        if (widget && widget.model) {
            widget.model.refresh();
        }
    }
}
