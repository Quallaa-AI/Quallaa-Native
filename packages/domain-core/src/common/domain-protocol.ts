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

/**
 * Core domain abstraction for Quallaa.
 *
 * This module defines the foundational interfaces for AI-modifiable domains.
 * Domains follow the Template → Instance → Customization lifecycle.
 */

/**
 * Core abstraction for all Quallaa domains.
 *
 * Domains can be:
 * 1. **Templates** - Base definitions maintained in monorepo (not modifiable)
 * 2. **User instances** - Copied to user's project, AI can modify
 *
 * This interface supports the Template → Instance → Customization lifecycle,
 * enabling AI to extend domain capabilities based on user needs.
 *
 * @example
 * ```typescript
 * // Template domain (in packages/marketing-domain/)
 * const template: DomainProvider = {
 *   id: 'marketing-automation',
 *   displayName: 'Marketing Automation',
 *   isTemplate: true,
 *   modifiable: false,
 *   getCapabilities: () => [...baseCapabilities]
 * };
 *
 * // User instance (in user's project/.quallaa/domain/)
 * const instance: DomainProvider = {
 *   id: 'marketing-automation',
 *   displayName: 'Marketing Automation',
 *   isTemplate: false,
 *   modifiable: true,
 *   baseTemplate: { id: 'marketing-automation', version: '1.0.0' },
 *   getCapabilities: () => [...baseCapabilities, ...customCapabilities]
 * };
 * ```
 */
export interface DomainProvider {
    /**
     * Unique identifier for this domain.
     * @example 'marketing-automation', 'finance-analysis'
     */
    readonly id: string;

    /**
     * Human-readable display name.
     * @example 'Marketing Automation', 'Financial Analysis'
     */
    readonly displayName: string;

    /**
     * Optional description of what this domain provides.
     */
    readonly description?: string;

    /**
     * Is this a template or a user's instance?
     * - `true`: Template (base definition in monorepo)
     * - `false`: User instance (copied to project, AI-modifiable)
     */
    readonly isTemplate: boolean;

    /**
     * If this is an instance, which template is it based on?
     * Only defined for user instances.
     */
    readonly baseTemplate?: {
        /** Template ID (e.g., 'marketing-automation') */
        id: string;
        /** Template version when instance was created */
        version: string;
    };

    /**
     * Has this instance been modified by AI?
     * - `false`: Matches base template exactly
     * - `true`: AI has customized this instance
     */
    readonly isModified: boolean;

    /**
     * Can AI modify this domain?
     * - Templates: `false` (read-only reference)
     * - User instances: `true` (AI can add/modify capabilities)
     */
    readonly modifiable: boolean;

    /**
     * Get current capabilities provided by this domain.
     *
     * For templates: Returns fixed set of base capabilities
     * For instances: May evolve as AI modifies domain
     *
     * @returns Array of domain capabilities
     */
    getCapabilities(): DomainCapability[];

    /**
     * Register a new capability (AI-driven customization).
     *
     * Only valid for modifiable instances. Called by AI after
     * adding new functionality to the domain.
     *
     * @param capability The capability to register
     */
    registerCapability?(capability: DomainCapability): void;

    /**
     * Unregister a capability (AI-driven customization).
     *
     * Only valid for modifiable instances. Called by AI when
     * removing functionality from the domain.
     *
     * @param capabilityId ID of capability to remove
     */
    unregisterCapability?(capabilityId: string): void;

    /**
     * Get source paths where AI can modify code.
     *
     * Only meaningful for modifiable instances. Tells AI where
     * to create/modify widgets, services, migrations, etc.
     *
     * @returns Source path configuration
     */
    getSourcePaths?(): DomainSourcePaths;

    /**
     * Get infrastructure services this domain requires.
     *
     * Declares databases, APIs, file systems, queues, etc. that
     * the domain needs to function.
     *
     * @returns Array of service configurations
     */
    getServices?(): DomainServiceConfig[];

    /**
     * Get customization history for this instance.
     *
     * Only meaningful for user instances. Tracks what AI has
     * modified and when.
     *
     * @returns Array of customizations (empty for templates)
     */
    getCustomizations?(): DomainCustomization[];

    /**
     * Record a customization after AI modifies the domain.
     *
     * Only valid for modifiable instances. Called automatically
     * after AI successfully applies changes.
     *
     * @param customization Details of what was modified
     */
    recordCustomization?(customization: DomainCustomization): void;

    // =========================================================================
    // Shell Layout Methods (Phase 2)
    // =========================================================================

    /**
     * Get widgets that this domain provides.
     *
     * Optional method. If not implemented, domain has no custom widgets.
     *
     * @returns Array of widget contributions
     */
    getWidgets?(): DomainWidgetContribution[];

    /**
     * Get shell layout configuration for this domain.
     *
     * Optional method. If not implemented, uses default layout (no changes).
     *
     * @returns Shell layout configuration
     */
    getShellLayout?(): DomainShellLayout;

    /**
     * Called when domain is activated (workspace opened).
     *
     * Optional lifecycle hook. Domain can initialize state, load data, etc.
     */
    onActivate?(): Promise<void>;

    /**
     * Called when domain is deactivated (workspace closed or switched).
     *
     * Optional lifecycle hook. Domain can save state, cleanup resources, etc.
     */
    onDeactivate?(): Promise<void>;
}

/**
 * Describes a domain capability.
 *
 * Capabilities represent features/functionality the domain provides.
 * Can be base (from template) or custom (added by AI).
 */
export interface DomainCapability {
    /**
     * Unique identifier for this capability.
     * @example 'campaign-management', 'webinar-tracking'
     */
    id: string;

    /**
     * Human-readable name.
     * @example 'Campaign Management', 'Webinar Tracking'
     */
    displayName: string;

    /**
     * Description of what this capability provides.
     */
    description: string;

    /**
     * How was this capability added?
     * - `'template'`: Part of base domain template
     * - `'user-customization'`: Added by AI for user
     */
    source: 'template' | 'user-customization';

    /**
     * When was this capability added?
     * Undefined for template capabilities.
     */
    addedAt?: Date;
}

/**
 * Source code locations where AI can modify files.
 *
 * Tells AI where to create/modify code for domain customizations.
 * All paths are relative to domain root.
 */
export interface DomainSourcePaths {
    /**
     * Directory for widgets/UI components.
     * @example 'src/browser/widgets/'
     */
    widgets?: string;

    /**
     * Directory for backend services/business logic.
     * @example 'src/node/services/'
     */
    services?: string;

    /**
     * Directory for database migrations.
     * @example 'src/node/migrations/'
     */
    migrations?: string;

    /**
     * Path to TypeScript interfaces file.
     * @example 'src/common/protocol.ts'
     */
    interfaces?: string;

    /**
     * Path to AI tools definitions.
     * @example 'src/common/ai-tools.ts'
     */
    aiTools?: string;

    /**
     * Paths that are readonly (AI can read but not modify).
     * Typically includes module registration files.
     */
    readonly?: string[];
}

/**
 * Infrastructure service configuration.
 *
 * Declares a service (database, API, etc.) that the domain needs.
 */
export interface DomainServiceConfig {
    /**
     * Type of service.
     */
    type: 'database' | 'api' | 'file-system' | 'queue' | 'cache' | 'runtime';

    /**
     * Service provider identifier.
     * @example 'postgresql', 'resend', 'redis', 'docker'
     */
    provider: string;

    /**
     * Provider-specific configuration.
     */
    config: Record<string, unknown>;

    /**
     * Is this service required or optional?
     * - `true`: Domain cannot function without it
     * - `false`: Domain degrades gracefully if unavailable
     */
    required: boolean;
}

/**
 * Record of AI modification to domain.
 *
 * Tracks what changed, when, and why. Enables undo/redo and
 * helps users understand domain evolution.
 */
export interface DomainCustomization {
    /**
     * When this customization was made.
     */
    timestamp: Date;

    /**
     * Human-readable description of what changed.
     * @example 'Added webinar campaign tracking'
     */
    description: string;

    /**
     * Original user command that triggered this change.
     * @example 'I need to track webinar campaigns with registration counts'
     */
    userCommand: string;

    /**
     * Files that were modified.
     * @example ['widgets/WebinarBuilder.tsx', 'migrations/002_webinars.sql']
     */
    filesModified: string[];

    /**
     * Capability IDs that were added.
     */
    capabilitiesAdded: string[];

    /**
     * Capability IDs that were removed.
     */
    capabilitiesRemoved: string[];

    /**
     * AI model that performed the modification.
     * @example 'claude-3.5-sonnet', 'gpt-4'
     */
    aiModel: string;

    /**
     * Number of tokens used for this modification.
     */
    tokensUsed: number;
}

/**
 * Contribution point for domains to register themselves.
 *
 * Follows Theia's contribution pattern. Domains implement this
 * interface to self-register with the domain registry.
 */
export const DomainContribution = Symbol('DomainContribution');

export interface DomainContribution {
    /**
     * Register this domain with the registry.
     *
     * Called during application initialization. Domain should
     * provide its DomainProvider implementation.
     *
     * @param registry The domain registry to register with
     */
    registerDomain(registry: DomainRegistry): void;
}

/**
 * Central registry of all domains.
 *
 * Manages all registered domains (both templates and instances).
 * Provides queries to find domains by various criteria.
 */
export interface DomainRegistry {
    /**
     * Register a domain provider.
     *
     * @param provider The domain provider to register
     */
    registerDomain(provider: DomainProvider): void;

    /**
     * Get domain by ID.
     *
     * @param id Domain identifier
     * @returns Domain provider or undefined if not found
     */
    getDomain(id: string): DomainProvider | undefined;

    /**
     * Get all registered domains.
     *
     * @returns Array of all domain providers
     */
    getAllDomains(): DomainProvider[];

    /**
     * Get only template domains.
     *
     * Templates are base domain definitions maintained in monorepo.
     *
     * @returns Array of template domain providers
     */
    getTemplateDomains(): DomainProvider[];

    /**
     * Get only user instance domains.
     *
     * Instances are user's customized copies of templates.
     *
     * @returns Array of instance domain providers
     */
    getInstanceDomains(): DomainProvider[];
}

/**
 * Symbol for DomainProvider dependency injection.
 */
export const DomainProvider = Symbol('DomainProvider');

/**
 * Symbol for DomainRegistry dependency injection.
 */
export const DomainRegistry = Symbol('DomainRegistry');

// =============================================================================
// Shell Layout Interfaces (Phase 2)
// =============================================================================

/**
 * Widget contribution from a domain.
 *
 * Defines a widget that the domain wants to register in the shell.
 */
export interface DomainWidgetContribution {
    /**
     * Unique widget ID (must match the widget factory ID).
     * @example 'marketing-navigation', 'marketing-dashboard'
     */
    id: string;

    /**
     * Where should this widget be placed in the shell?
     */
    area: 'top' | 'left' | 'right' | 'main' | 'bottom';

    /**
     * Display rank (lower numbers appear first).
     * Optional, defaults to 0.
     */
    rank?: number;

    /**
     * Should this widget be shown automatically when domain activates?
     * Optional, defaults to true.
     */
    autoReveal?: boolean;
}

/**
 * Shell layout configuration for a domain.
 *
 * Describes how the shell should be arranged when this domain is active.
 */
export interface DomainShellLayout {
    /**
     * Panels to hide when domain is active.
     * Hides standard IDE panels (Explorer, Terminal, etc.) to show domain UI instead.
     */
    hidePanels?: Array<'left' | 'right' | 'bottom'>;

    /**
     * Widget to show in top panel (domain navigation).
     * This replaces or augments the standard menu bar.
     */
    topWidget?: string;

    /**
     * Main area layout configuration.
     * Defines what shows in the central editor area.
     */
    mainLayout?: {
        /**
         * Primary domain widget ID (dashboard, manager, etc.).
         */
        domainWidget: string;

        /**
         * Optional chat widget ID (for Claude Code side-by-side).
         */
        chatWidget?: string;

        /**
         * Split ratio (0.0 to 1.0) for domain vs chat.
         * @example 0.6 = 60% domain, 40% chat
         */
        ratio?: number;
    };
}
