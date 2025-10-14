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

import { injectable, inject, postConstruct } from '@theia/core/shared/inversify';
import { WorkspaceService } from '@theia/workspace/lib/browser';
import { ApplicationShell } from '@theia/core/lib/browser';
import { FileService } from '@theia/filesystem/lib/browser/file-service';
import { URI } from '@theia/core';
import { DomainProvider, DomainRegistry } from '../common/domain-protocol';

/**
 * Manages domain lifecycle based on workspace changes.
 *
 * This service:
 * 1. Listens for workspace open/close events
 * 2. Detects what type of project is opened (via .quallaa/project-type.json)
 * 3. Activates the appropriate domain
 * 4. Deactivates domains when workspace closes or changes
 *
 * This is the core mechanism that switches between domain-specific UI and standard IDE mode.
 */
@injectable()
export class DomainWorkspaceManager {

    @inject(WorkspaceService)
    protected readonly workspaceService: WorkspaceService;

    @inject(ApplicationShell)
    protected readonly shell: ApplicationShell;

    @inject(DomainRegistry)
    protected readonly registry: DomainRegistry;

    @inject(FileService)
    protected readonly fileService: FileService;

    /**
     * Currently active domain (if any)
     */
    protected activeDomain?: DomainProvider;

    /**
     * Initialize after construction.
     * Sets up workspace change listeners.
     */
    @postConstruct()
    protected init(): void {
        console.log('[DomainWorkspaceManager] Initializing...');

        // Listen for workspace changes
        this.workspaceService.onWorkspaceChanged(async () => {
            console.log('[DomainWorkspaceManager] Workspace changed, handling...');
            await this.handleWorkspaceChange();
        });

        // Check current workspace on startup
        this.handleWorkspaceChange();
    }

    /**
     * Handle workspace change event.
     * Detects project type and activates/deactivates domains accordingly.
     */
    protected async handleWorkspaceChange(): Promise<void> {
        const workspace = this.workspaceService.workspace;

        // No workspace open
        if (!workspace) {
            console.log('[DomainWorkspaceManager] No workspace open, deactivating domain');
            await this.deactivateCurrentDomain();
            return;
        }

        console.log(`[DomainWorkspaceManager] Workspace opened: ${workspace.resource.toString()}`);

        // Detect domain type from project configuration
        const domain = await this.detectDomain(workspace.resource);

        if (domain) {
            console.log(`[DomainWorkspaceManager] Domain detected: ${domain.displayName} (${domain.id})`);

            // Domain project detected
            if (this.activeDomain?.id !== domain.id) {
                await this.switchDomain(domain);
            } else {
                console.log('[DomainWorkspaceManager] Domain already active, skipping activation');
            }
        } else {
            console.log('[DomainWorkspaceManager] No domain detected, activating standard IDE mode');

            // No domain → standard IDE mode
            await this.deactivateCurrentDomain();
            await this.activateStandardIDE();
        }
    }

    /**
     * Detect which domain (if any) matches the given workspace.
     *
     * Checks for .quallaa/project-type.json file and reads domain type.
     *
     * @param workspaceUri Root URI of workspace
     * @returns Matching domain provider or undefined
     */
    protected async detectDomain(workspaceUri: URI): Promise<DomainProvider | undefined> {
        try {
            // Check for .quallaa/project-type.json
            const configUri = workspaceUri.resolve('.quallaa/project-type.json');
            const content = await this.fileService.read(configUri);
            const config = JSON.parse(content.value);

            if (config.type) {
                console.log(`[DomainWorkspaceManager] Project type found: ${config.type}`);

                // Find matching domain in registry
                const domain = this.registry.getDomain(config.type);
                if (domain) {
                    return domain;
                } else {
                    console.warn(`[DomainWorkspaceManager] Unknown domain type: ${config.type}`);
                }
            }
        } catch (error) {
            // File doesn't exist or can't be read - not a Quallaa project
            console.log('[DomainWorkspaceManager] No .quallaa/project-type.json found');
        }

        return undefined;
    }

    /**
     * Switch from current domain to a new domain.
     *
     * @param newDomain Domain to activate
     */
    protected async switchDomain(newDomain: DomainProvider): Promise<void> {
        console.log(`[DomainWorkspaceManager] Switching to domain: ${newDomain.displayName}`);

        // Deactivate current domain
        await this.deactivateCurrentDomain();

        // Activate new domain
        await this.activateDomain(newDomain);
    }

    /**
     * Activate a domain.
     *
     * This:
     * 1. Calls domain's onActivate lifecycle hook
     * 2. Applies domain shell layout (hides IDE panels, etc.)
     * 3. Shows domain widgets
     *
     * @param domain Domain to activate
     */
    protected async activateDomain(domain: DomainProvider): Promise<void> {
        console.log(`[DomainWorkspaceManager] Activating domain: ${domain.id}`);

        // Call domain lifecycle hook (if defined)
        if (domain.onActivate) {
            await domain.onActivate();
        }

        // Apply shell layout
        await this.applyDomainLayout(domain);

        // Show domain widgets
        await this.showDomainWidgets(domain);

        this.activeDomain = domain;

        console.log(`[DomainWorkspaceManager] Domain activated: ${domain.displayName}`);
    }

    /**
     * Deactivate the currently active domain.
     */
    protected async deactivateCurrentDomain(): Promise<void> {
        if (!this.activeDomain) {
            return;
        }

        console.log(`[DomainWorkspaceManager] Deactivating domain: ${this.activeDomain.id}`);

        // Call domain lifecycle hook (if defined)
        if (this.activeDomain.onDeactivate) {
            await this.activeDomain.onDeactivate();
        }

        // Close domain widgets
        await this.hideDomainWidgets(this.activeDomain);

        this.activeDomain = undefined;

        console.log('[DomainWorkspaceManager] Domain deactivated');
    }

    /**
     * Apply domain-specific shell layout.
     *
     * This hides/shows panels according to domain preferences.
     *
     * @param domain Domain whose layout to apply
     */
    protected async applyDomainLayout(domain: DomainProvider): Promise<void> {
        console.log(`[DomainWorkspaceManager] Applying domain layout for: ${domain.id}`);

        // Get layout configuration from domain (if defined)
        const layout = domain.getShellLayout?.();

        if (!layout) {
            console.log('[DomainWorkspaceManager] No layout configuration, using defaults');
            // Default: hide left and bottom panels
            this.shell.leftPanelHandler.collapse();
            this.shell.bottomPanel.hide();
            return;
        }

        // Hide panels as specified by domain
        if (layout.hidePanels) {
            for (const panel of layout.hidePanels) {
                switch (panel) {
                    case 'left':
                        this.shell.leftPanelHandler.collapse();
                        break;
                    case 'bottom':
                        this.shell.bottomPanel.hide();
                        break;
                    case 'right':
                        if (this.shell.rightPanelHandler) {
                            this.shell.rightPanelHandler.collapse();
                        }
                        break;
                }
            }
            console.log(`[DomainWorkspaceManager] Hid panels: ${layout.hidePanels.join(', ')}`);
        }

        console.log('[DomainWorkspaceManager] Domain layout applied');
    }

    /**
     * Activate standard IDE mode.
     *
     * This shows all IDE panels (Explorer, Terminal, etc.)
     * Used when no domain is detected.
     */
    protected async activateStandardIDE(): Promise<void> {
        console.log('[DomainWorkspaceManager] Activating standard IDE mode');

        // Show all panels
        this.shell.leftPanelHandler.expand();
        this.shell.bottomPanel.show();

        console.log('[DomainWorkspaceManager] Standard IDE mode activated');
    }

    /**
     * Show domain widgets in the shell.
     *
     * Reveals widgets specified by domain's getWidgets() method.
     *
     * @param domain Domain whose widgets to show
     */
    protected async showDomainWidgets(domain: DomainProvider): Promise<void> {
        const widgets = domain.getWidgets?.();

        if (!widgets || widgets.length === 0) {
            console.log('[DomainWorkspaceManager] No widgets to show');
            return;
        }

        console.log(`[DomainWorkspaceManager] Showing ${widgets.length} domain widgets`);

        for (const widgetContrib of widgets) {
            try {
                // For top panel widgets, add them directly
                if (widgetContrib.area === 'top') {
                    await this.addTopPanelWidget(widgetContrib.id);
                } else {
                    // For other areas, use revealWidget if autoReveal is true
                    if (widgetContrib.autoReveal !== false) {
                        await this.shell.revealWidget(widgetContrib.id);
                    }
                }

                console.log(`[DomainWorkspaceManager] Revealed widget: ${widgetContrib.id}`);
            } catch (error) {
                console.warn(`[DomainWorkspaceManager] Failed to reveal widget ${widgetContrib.id}:`, error);
            }
        }
    }

    /**
     * Hide domain widgets from the shell.
     *
     * Closes widgets specified by domain's getWidgets() method.
     *
     * @param domain Domain whose widgets to hide
     */
    protected async hideDomainWidgets(domain: DomainProvider): Promise<void> {
        const widgets = domain.getWidgets?.();

        if (!widgets || widgets.length === 0) {
            return;
        }

        console.log(`[DomainWorkspaceManager] Hiding ${widgets.length} domain widgets`);

        for (const widgetContrib of widgets) {
            try {
                // For top panel widgets, remove them
                if (widgetContrib.area === 'top') {
                    this.removeTopPanelWidget(widgetContrib.id);
                } else {
                    // For other areas, close the widget
                    const widget = this.shell.getWidgetById(widgetContrib.id);
                    if (widget) {
                        widget.close();
                        console.log(`[DomainWorkspaceManager] Closed widget: ${widgetContrib.id}`);
                    }
                }
            } catch (error) {
                console.warn(`[DomainWorkspaceManager] Failed to close widget ${widgetContrib.id}:`, error);
            }
        }
    }

    /**
     * Add a widget to the top panel.
     *
     * @param widgetId Widget ID to add
     */
    protected async addTopPanelWidget(widgetId: string): Promise<void> {
        try {
            const widget = await this.shell.revealWidget(widgetId);
            if (widget && !this.shell.topPanel.widgets.includes(widget)) {
                this.shell.topPanel.addWidget(widget);
                console.log(`[DomainWorkspaceManager] Added widget to top panel: ${widgetId}`);
            }
        } catch (error) {
            console.warn(`[DomainWorkspaceManager] Failed to add top panel widget ${widgetId}:`, error);
        }
    }

    /**
     * Remove a widget from the top panel.
     *
     * @param widgetId Widget ID to remove
     */
    protected removeTopPanelWidget(widgetId: string): void {
        const widget = this.shell.getWidgetById(widgetId);
        if (widget && this.shell.topPanel.widgets.includes(widget)) {
            widget.close();
            console.log(`[DomainWorkspaceManager] Removed widget from top panel: ${widgetId}`);
        }
    }

    /**
     * Get currently active domain.
     *
     * @returns Active domain provider or undefined if no domain active
     */
    getActiveDomain(): DomainProvider | undefined {
        return this.activeDomain;
    }
}
