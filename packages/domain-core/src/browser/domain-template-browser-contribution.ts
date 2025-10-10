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
import { WidgetFactory, WidgetManager, ApplicationShell } from '@theia/core/lib/browser';
import { DomainTemplateBrowser } from './widgets/domain-template-browser';

/**
 * Command for opening the domain template browser.
 */
export const OPEN_DOMAIN_TEMPLATES_COMMAND: Command = {
    id: 'quallaa.domain.openTemplates',
    category: 'Quallaa',
    label: 'Browse Domain Templates'
};

/**
 * Contribution that provides the command to open the domain template browser
 * and registers the widget factory.
 */
@injectable()
export class DomainTemplateBrowserContribution implements CommandContribution {

    @inject(WidgetManager)
    protected readonly widgetManager: WidgetManager;

    @inject(ApplicationShell)
    protected readonly shell: ApplicationShell;

    registerCommands(commands: CommandRegistry): void {
        commands.registerCommand(OPEN_DOMAIN_TEMPLATES_COMMAND, {
            execute: async () => {
                console.log('[Quallaa] Opening domain template browser...');
                const widget = await this.widgetManager.getOrCreateWidget(
                    DomainTemplateBrowser.ID
                );

                console.log('[Quallaa] Widget created, adding to shell...');
                // Open the widget in the main area
                await this.shell.addWidget(widget, { area: 'main' });

                console.log('[Quallaa] Widget added, revealing...');
                await this.shell.revealWidget(widget.id);

                console.log('[Quallaa] Widget revealed, activating...');
                await this.shell.activateWidget(widget.id);

                console.log('[Quallaa] Template browser opened successfully');
            }
        });
    }
}

/**
 * Widget factory for creating domain template browser instances.
 */
@injectable()
export class DomainTemplateBrowserFactory implements WidgetFactory {
    readonly id = DomainTemplateBrowser.ID;

    constructor(
        @inject(DomainTemplateBrowser) protected readonly widget: DomainTemplateBrowser
    ) {}

    async createWidget(): Promise<DomainTemplateBrowser> {
        console.log('[Quallaa] Factory creating template browser widget');
        return this.widget;
    }
}
