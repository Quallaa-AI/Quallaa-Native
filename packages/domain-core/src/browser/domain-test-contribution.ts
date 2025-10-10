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

/**
 * Test command for validating domain registry.
 *
 * Provides a command palette entry to test that:
 * - Domain registry is initialized
 * - Domains are registered correctly
 * - Domain metadata is accessible
 */

export const DOMAIN_TEST_COMMAND: Command = {
    id: 'quallaa.domain.test',
    category: 'Quallaa',
    label: 'Test Domain Registry'
};

@injectable()
export class DomainTestCommandContribution implements CommandContribution {

    @inject(DomainRegistry)
    protected readonly domainRegistry: DomainRegistry;

    @inject(MessageService)
    protected readonly messageService: MessageService;

    registerCommands(commands: CommandRegistry): void {
        commands.registerCommand(DOMAIN_TEST_COMMAND, {
            execute: () => this.testDomainRegistry()
        });
    }

    protected testDomainRegistry(): void {
        console.log('=== Quallaa Domain Registry Test ===');

        const allDomains = this.domainRegistry.getAllDomains();
        const templates = this.domainRegistry.getTemplateDomains();
        const instances = this.domainRegistry.getInstanceDomains();

        console.log(`Total domains: ${allDomains.length}`);
        console.log(`Template domains: ${templates.length}`);
        console.log(`Instance domains: ${instances.length}`);
        console.log('');

        if (allDomains.length === 0) {
            console.warn('[Quallaa] No domains registered!');
            this.messageService.warn('No domains registered in domain registry');
            return;
        }

        allDomains.forEach((domain, index) => {
            console.log(`[${index + 1}] ${domain.displayName} (${domain.id})`);
            console.log(`    Type: ${domain.isTemplate ? 'Template' : 'Instance'}`);
            console.log(`    Modifiable: ${domain.modifiable}`);
            console.log(`    Modified: ${domain.isModified}`);

            if (domain.description) {
                console.log(`    Description: ${domain.description}`);
            }

            const capabilities = domain.getCapabilities();
            console.log(`    Capabilities: ${capabilities.length}`);
            capabilities.forEach(cap => {
                console.log(`      - ${cap.displayName} (${cap.id}) [${cap.source}]`);
            });

            if (domain.getServices) {
                const services = domain.getServices();
                console.log(`    Services: ${services.length}`);
                services.forEach(service => {
                    console.log(`      - ${service.type}: ${service.provider} (${service.required ? 'required' : 'optional'})`);
                });
            }

            if (domain.getSourcePaths) {
                const paths = domain.getSourcePaths();
                console.log('    Source Paths:');
                if (paths.widgets) {console.log(`      widgets: ${paths.widgets}`); }
                if (paths.services) {console.log(`      services: ${paths.services}`); }
                if (paths.migrations) {console.log(`      migrations: ${paths.migrations}`); }
                if (paths.readonly) {console.log(`      readonly: ${paths.readonly.join(', ')}`); }
            }

            console.log('');
        });

        this.messageService.info(
            `Domain Registry Test: ${allDomains.length} domain(s) registered. Check console for details.`
        );
    }
}
