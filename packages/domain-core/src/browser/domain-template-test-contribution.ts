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
import { Command, CommandContribution, CommandRegistry, MessageService } from '@theia/core';
import { DomainRegistry } from '../common/domain-protocol';
import { DomainTemplateBrowser } from './widgets/domain-template-browser';

/**
 * Test command for debugging template browser widget.
 */
export const TEST_TEMPLATE_BROWSER_COMMAND: Command = {
    id: 'quallaa.domain.testTemplateBrowser',
    category: 'Quallaa',
    label: 'Test Template Browser Widget'
};

@injectable()
export class DomainTemplateBrowserTestContribution implements CommandContribution {

    @inject(DomainRegistry)
    protected readonly domainRegistry: DomainRegistry;

    @inject(MessageService)
    protected readonly messageService: MessageService;

    @inject(DomainTemplateBrowser)
    protected readonly templateBrowser: DomainTemplateBrowser;

    registerCommands(commands: CommandRegistry): void {
        commands.registerCommand(TEST_TEMPLATE_BROWSER_COMMAND, {
            execute: () => this.testTemplateBrowser()
        });
    }

    protected testTemplateBrowser(): void {
        console.log('=== Quallaa Template Browser Test ===');

        // Test 1: Check domain registry
        console.log('\n[Test 1] Checking Domain Registry...');
        const allDomains = this.domainRegistry.getAllDomains();
        const templates = this.domainRegistry.getTemplateDomains();

        console.log(`  Total domains: ${allDomains.length}`);
        console.log(`  Template domains: ${templates.length}`);

        if (templates.length === 0) {
            console.error('  ❌ FAIL: No template domains found!');
            this.messageService.error('No template domains found in registry');
            return;
        } else {
            console.log('  ✅ PASS: Templates found');
            templates.forEach(t => {
                console.log(`    - ${t.displayName} (${t.id})`);
            });
        }

        // Test 2: Check widget injection
        console.log('\n[Test 2] Checking Widget Injection...');
        if (!this.templateBrowser) {
            console.error('  ❌ FAIL: Template browser widget not injected!');
            this.messageService.error('Template browser widget injection failed');
            return;
        }
        console.log('  ✅ PASS: Widget injected successfully');
        console.log(`    Widget ID: ${this.templateBrowser.id}`);
        console.log(`    Widget title: ${this.templateBrowser.title.label}`);

        // Test 3: Check widget's domain registry reference
        console.log('\n[Test 3] Checking Widget Dependencies...');
        const widgetRegistry = (this.templateBrowser as any).domainRegistry;
        if (!widgetRegistry) {
            console.error('  ❌ FAIL: Widget does not have domain registry injected!');
            this.messageService.error('Widget missing domain registry dependency');
            return;
        }
        console.log('  ✅ PASS: Widget has domain registry');

        const widgetTemplates = widgetRegistry.getTemplateDomains();
        console.log(`    Templates accessible from widget: ${widgetTemplates.length}`);

        // Test 4: Test render method
        console.log('\n[Test 4] Testing Widget Render...');
        try {
            // Force widget to render
            this.templateBrowser.update();
            console.log('  ✅ PASS: Widget update() called successfully');
        } catch (error) {
            console.error('  ❌ FAIL: Widget update() threw error:', error);
        }

        // Test 5: Check if widget is attached
        console.log('\n[Test 5] Checking Widget State...');
        console.log(`    Is attached: ${this.templateBrowser.isAttached}`);
        console.log(`    Is visible: ${this.templateBrowser.isVisible}`);
        console.log(`    Is disposed: ${this.templateBrowser.isDisposed}`);

        console.log('\n=== Test Complete ===');
        this.messageService.info('Template Browser Test Complete - Check console for results');
    }
}
