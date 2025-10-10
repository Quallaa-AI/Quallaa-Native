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

import { injectable, inject, postConstruct, named } from '@theia/core/shared/inversify';
import { ContributionProvider } from '@theia/core';
import { DomainProvider, DomainRegistry, DomainContribution } from '../common/domain-protocol';

/**
 * Implementation of the domain registry.
 *
 * Manages all registered domains and provides queries to find them.
 * Uses Theia's contribution provider pattern to allow domains to self-register.
 */
@injectable()
export class DomainRegistryImpl implements DomainRegistry {
    /**
     * Map of domain ID to domain provider.
     */
    private readonly domains = new Map<string, DomainProvider>();

    /**
     * Contribution provider for domain contributions.
     * Theia automatically discovers all bound DomainContribution implementations.
     */
    @inject(ContributionProvider)
    @named(DomainContribution)
    protected readonly contributions: ContributionProvider<DomainContribution>;

    /**
     * Initialize the registry after construction.
     * Called automatically by Theia's DI container.
     */
    @postConstruct()
    protected init(): void {
        // Ask all contributions to register their domains
        const contributions = this.contributions.getContributions();
        contributions.forEach(contrib => {
            contrib.registerDomain(this);
        });

        console.log(`[Quallaa] Domain registry initialized with ${this.domains.size} domain(s)`);

        // Log registered domains for visibility
        if (this.domains.size > 0) {
            this.domains.forEach(domain => {
                console.log(`[Quallaa]   - ${domain.displayName} (${domain.id})${domain.isTemplate ? ' [template]' : ' [instance]'}`);
            });
        }
    }

    /**
     * Register a domain provider.
     *
     * @param provider The domain provider to register
     */
    registerDomain(provider: DomainProvider): void {
        if (this.domains.has(provider.id)) {
            console.warn(`[Quallaa] Domain already registered: ${provider.id}. Skipping duplicate registration.`);
            return;
        }

        this.domains.set(provider.id, provider);
        console.log(`[Quallaa] Registered domain: ${provider.displayName} (${provider.id})`);
    }

    /**
     * Get domain by ID.
     *
     * @param id Domain identifier
     * @returns Domain provider or undefined if not found
     */
    getDomain(id: string): DomainProvider | undefined {
        return this.domains.get(id);
    }

    /**
     * Get all registered domains.
     *
     * @returns Array of all domain providers
     */
    getAllDomains(): DomainProvider[] {
        return Array.from(this.domains.values());
    }

    /**
     * Get only template domains.
     *
     * Templates are base domain definitions maintained in monorepo.
     *
     * @returns Array of template domain providers
     */
    getTemplateDomains(): DomainProvider[] {
        return this.getAllDomains().filter(domain => domain.isTemplate);
    }

    /**
     * Get only user instance domains.
     *
     * Instances are user's customized copies of templates.
     *
     * @returns Array of instance domain providers
     */
    getInstanceDomains(): DomainProvider[] {
        return this.getAllDomains().filter(domain => !domain.isTemplate);
    }
}
