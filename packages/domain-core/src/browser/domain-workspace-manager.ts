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

        // TODO: Call domain lifecycle hook (when we add it to protocol)
        // await domain.onActivate?.();

        // Apply shell layout
        await this.applyDomainLayout(domain);

        // TODO: Show domain widgets (when we add getWidgets() to protocol)
        // await this.showDomainWidgets(domain);

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

        // TODO: Call domain lifecycle hook
        // await this.activeDomain.onDeactivate?.();

        // TODO: Close domain widgets
        // const widgets = this.activeDomain.getWidgets();
        // for (const widget of widgets) {
        //     const w = this.shell.getWidgetById(widget.id);
        //     if (w) {
        //         w.close();
        //     }
        // }

        this.activeDomain = undefined;

        console.log('[DomainWorkspaceManager] Domain deactivated');
    }

    /**
     * Apply domain-specific shell layout.
     *
     * This hides/shows panels according to domain preferences.
     * For now, just hides left and bottom panels for any domain.
     *
     * TODO: Read layout configuration from domain provider
     *
     * @param domain Domain whose layout to apply
     */
    protected async applyDomainLayout(domain: DomainProvider): Promise<void> {
        console.log(`[DomainWorkspaceManager] Applying domain layout for: ${domain.id}`);

        // Hide IDE panels (domain-specific UI will be shown instead)
        // Left panel = Explorer, Search, Source Control
        this.shell.leftPanelHandler.collapse();

        // Bottom panel = Terminal, Problems, Output, Debug
        this.shell.bottomPanel.hide();

        // Right panel (if exists) - typically empty in default Theia
        if (this.shell.rightPanelHandler) {
            this.shell.rightPanelHandler.collapse();
        }

        console.log('[DomainWorkspaceManager] Domain layout applied (panels hidden)');
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
     * Get currently active domain.
     *
     * @returns Active domain provider or undefined if no domain active
     */
    getActiveDomain(): DomainProvider | undefined {
        return this.activeDomain;
    }
}
