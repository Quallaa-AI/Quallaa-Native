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

import { injectable } from '@theia/core/shared/inversify';
import {
    DomainProvider,
    DomainCapability,
    DomainServiceConfig,
    DomainSourcePaths,
    DomainCustomization,
    DomainWidgetContribution,
    DomainShellLayout
} from '@quallaa/domain-core';

/**
 * Marketing Automation Domain Provider (Template)
 *
 * This is the base template for marketing automation domains.
 * It provides foundation capabilities that user instances can extend.
 *
 * This is a dummy implementation for demonstrating the domain pattern.
 * Future implementations will include actual widgets, services, and functionality.
 */
@injectable()
export class MarketingDomainProvider implements DomainProvider {
    /**
     * Domain identifier.
     */
    readonly id = 'marketing-automation';

    /**
     * Human-readable name.
     */
    readonly displayName = 'Marketing Automation';

    /**
     * Description of what this domain provides.
     */
    readonly description = 'Email campaigns, audience segmentation, and analytics for marketing teams';

    /**
     * This is a template domain (not a user instance).
     */
    readonly isTemplate = true;

    /**
     * Template domains are not modified - they serve as base for instances.
     */
    readonly isModified = false;

    /**
     * Templates cannot be modified by AI.
     * Only user instances (copies of templates) can be modified.
     */
    readonly modifiable = false;

    /**
     * Get base capabilities provided by the marketing template.
     *
     * These capabilities will be available in all marketing instances.
     * User instances can add custom capabilities via AI modification.
     *
     * @returns Array of base marketing capabilities
     */
    getCapabilities(): DomainCapability[] {
        return [
            {
                id: 'campaign-management',
                displayName: 'Campaign Management',
                description: 'Create and manage email campaigns with automated workflows',
                source: 'template'
            },
            {
                id: 'email-automation',
                displayName: 'Email Automation',
                description: 'Automated email sequences, triggers, and drip campaigns',
                source: 'template'
            },
            {
                id: 'audience-segmentation',
                displayName: 'Audience Segmentation',
                description: 'Segment customers by behavior, attributes, and engagement',
                source: 'template'
            },
            {
                id: 'analytics-dashboard',
                displayName: 'Analytics Dashboard',
                description: 'Campaign performance metrics, open rates, click tracking',
                source: 'template'
            }
        ];
    }

    /**
     * Get infrastructure services required by the marketing domain.
     *
     * Declares databases, APIs, and other services needed for
     * marketing automation functionality.
     *
     * @returns Array of required service configurations
     */
    getServices(): DomainServiceConfig[] {
        return [
            {
                type: 'database',
                provider: 'postgresql',
                required: true,
                config: {
                    schema: 'marketing',
                    tables: ['customers', 'campaigns', 'segments', 'analytics', 'email_templates'],
                    description: 'Primary database for customer data and campaign management'
                }
            },
            {
                type: 'api',
                provider: 'resend',
                required: true,
                config: {
                    purpose: 'email-delivery',
                    requiresApiKey: true,
                    rateLimit: '100 emails per second',
                    description: 'Email sending service for campaign delivery'
                }
            },
            {
                type: 'api',
                provider: 'google-analytics',
                required: false,
                config: {
                    purpose: 'tracking',
                    requiresApiKey: true,
                    description: 'Optional analytics integration for campaign tracking'
                }
            },
            {
                type: 'file-system',
                provider: 'local-fs',
                required: true,
                config: {
                    root: 'templates/',
                    watchPatterns: ['*.email.tsx', '*.landing.tsx'],
                    description: 'File system for email and landing page templates'
                }
            },
            {
                type: 'cache',
                provider: 'redis',
                required: false,
                config: {
                    purpose: 'session-storage',
                    ttl: 3600,
                    description: 'Optional cache for performance optimization'
                }
            }
        ];
    }

    /**
     * Get source paths where AI can modify code.
     *
     * For templates, these are reference paths showing the structure.
     * User instances will have these paths in their project directory.
     *
     * @returns Source path configuration
     */
    getSourcePaths(): DomainSourcePaths {
        return {
            widgets: 'src/browser/widgets/',
            services: 'src/node/services/',
            migrations: 'src/node/migrations/',
            interfaces: 'src/common/protocol.ts',
            aiTools: 'src/common/ai-tools.ts',
            readonly: [
                'src/browser/marketing-frontend-module.ts',
                'src/node/marketing-backend-module.ts'
            ]
        };
    }

    /**
     * Get customization history.
     *
     * Templates have no customizations - they are the base definition.
     * Only user instances will have customization history.
     *
     * @returns Empty array (templates are not customized)
     */
    getCustomizations(): DomainCustomization[] {
        return [];
    }

    // =========================================================================
    // Phase 2: Shell Layout Methods
    // =========================================================================

    /**
     * Get widgets that this domain provides.
     *
     * These widgets will be shown when the domain is activated.
     *
     * @returns Array of widget contributions
     */
    getWidgets(): DomainWidgetContribution[] {
        return [
            {
                id: 'marketing-navigation',
                area: 'top',
                rank: 0,
                autoReveal: true
            },
            {
                id: 'marketing-dashboard',
                area: 'main',
                rank: 0,
                autoReveal: true
            }
        ];
    }

    /**
     * Get shell layout configuration for marketing domain.
     *
     * Hides standard IDE panels and shows marketing-specific UI.
     *
     * @returns Shell layout configuration
     */
    getShellLayout(): DomainShellLayout {
        return {
            // Hide standard IDE panels to show domain UI
            hidePanels: ['left', 'bottom'],

            // Show marketing navigation in top panel
            topWidget: 'marketing-navigation',

            // Main area layout
            mainLayout: {
                domainWidget: 'marketing-dashboard',
                // Chat widget integration (Phase 2+)
                chatWidget: undefined,
                ratio: 0.7
            }
        };
    }

    /**
     * Called when domain is activated (workspace opened).
     *
     * Future: Initialize database connections, load saved state, etc.
     */
    async onActivate(): Promise<void> {
        console.log('[MarketingDomain] Activated');
        // TODO: Initialize services, load state
    }

    /**
     * Called when domain is deactivated (workspace closed).
     *
     * Future: Save state, close connections, cleanup resources.
     */
    async onDeactivate(): Promise<void> {
        console.log('[MarketingDomain] Deactivated');
        // TODO: Save state, cleanup
    }
}
