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
import { WidgetFactory } from '@theia/core/lib/browser';
import { MarketingDomainProvider } from './marketing-domain-provider';
import { MarketingNavigationWidget } from './widgets/marketing-navigation-widget';
import { MarketingDashboardWidget } from './widgets/marketing-dashboard-widget';

/**
 * Marketing Domain Frontend Module
 *
 * Registers the marketing domain with the domain registry using
 * the contribution pattern. Also registers widget factories.
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

    // =========================================================================
    // Widget Factories (Phase 2)
    // =========================================================================

    // Navigation Widget Factory
    bind(MarketingNavigationWidget).toSelf();
    bind(WidgetFactory).toDynamicValue(ctx => ({
        id: MarketingNavigationWidget.ID,
        createWidget: () => ctx.container.get<MarketingNavigationWidget>(MarketingNavigationWidget)
    })).inSingletonScope();

    // Dashboard Widget Factory
    bind(MarketingDashboardWidget).toSelf();
    bind(WidgetFactory).toDynamicValue(ctx => ({
        id: MarketingDashboardWidget.ID,
        createWidget: () => ctx.container.get<MarketingDashboardWidget>(MarketingDashboardWidget)
    })).inSingletonScope();

    console.log('[Quallaa] Marketing domain module loaded with widget factories');
});
