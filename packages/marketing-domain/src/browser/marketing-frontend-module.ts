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

import { ContainerModule } from '@theia/core/shared/inversify';
import { DomainContribution, DomainRegistry } from '@quallaa/domain-core';
import { MarketingDomainProvider } from './marketing-domain-provider';

/**
 * Marketing Domain Frontend Module
 *
 * Registers the marketing domain with the domain registry using
 * the contribution pattern.
 */
export default new ContainerModule(bind => {
    // Bind the marketing domain provider as a singleton
    bind(MarketingDomainProvider).toSelf().inSingletonScope();

    // Register as a domain contribution
    // The domain registry will call registerDomain() during initialization
    bind(DomainContribution).toDynamicValue(ctx => ({
        registerDomain: (registry: DomainRegistry) => {
            const provider = ctx.container.get(MarketingDomainProvider);
            registry.registerDomain(provider);
        }
    })).inSingletonScope();

    console.log('[Quallaa] Marketing domain module loaded');
});
