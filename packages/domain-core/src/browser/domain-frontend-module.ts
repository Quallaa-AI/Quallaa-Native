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
import { bindContributionProvider, CommandContribution } from '@theia/core';
import { WidgetFactory } from '@theia/core/lib/browser';
import { DomainRegistry, DomainContribution } from '../common/domain-protocol';
import { DomainRegistryImpl } from './domain-registry';
import { DomainTestCommandContribution } from './domain-test-contribution';
import { DomainTemplateBrowser } from './widgets/domain-template-browser';
import { DomainTemplateBrowserContribution, DomainTemplateBrowserFactory } from './domain-template-browser-contribution';
import { DomainProjectService } from './domain-project-service';
import { DomainTemplateBrowserTestContribution } from './domain-template-test-contribution';

/**
 * Domain Core Frontend Module
 *
 * Binds the domain registry and sets up the contribution provider
 * for domains to self-register.
 */
export default new ContainerModule(bind => {
    // Bind the domain registry as a singleton
    // This ensures there's only one registry instance in the application
    bind(DomainRegistry).to(DomainRegistryImpl).inSingletonScope();

    // Set up contribution provider for domain contributions
    // This allows any package to register a domain by binding DomainContribution
    bindContributionProvider(bind, DomainContribution);

    // Bind test command for domain registry validation
    bind(DomainTestCommandContribution).toSelf().inSingletonScope();
    bind(CommandContribution).toService(DomainTestCommandContribution);

    // Bind domain project service
    bind(DomainProjectService).toSelf().inSingletonScope();

    // Bind domain template browser widget
    bind(DomainTemplateBrowser).toSelf().inSingletonScope();
    bind(WidgetFactory).to(DomainTemplateBrowserFactory).inSingletonScope();

    // Bind command to open template browser
    bind(DomainTemplateBrowserContribution).toSelf().inSingletonScope();
    bind(CommandContribution).toService(DomainTemplateBrowserContribution);

    // Bind test command for template browser
    bind(DomainTemplateBrowserTestContribution).toSelf().inSingletonScope();
    bind(CommandContribution).toService(DomainTemplateBrowserTestContribution);

    console.log('[Quallaa] Domain core module loaded');
});
