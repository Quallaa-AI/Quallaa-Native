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

import * as React from 'react';
import { injectable, inject } from '@theia/core/shared/inversify';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import { MessageService } from '@theia/core';
import { Message } from '@theia/core/shared/@lumino/messaging';
import { WorkspaceService } from '@theia/workspace/lib/browser';
import { FileService } from '@theia/filesystem/lib/browser/file-service';
import { FileDialogService } from '@theia/filesystem/lib/browser';
import { DomainRegistry, DomainProvider } from '../../common/domain-protocol';
import { DomainProjectService } from '../domain-project-service';
import { CreateProjectDialog } from '../dialogs/create-project-dialog';
import {
    EnvelopeIcon,
    ChartBarIcon,
    CurrencyDollarIcon,
    ServerIcon
} from '@heroicons/react/24/outline';
import './domain-template-browser.css';
import '../dialogs/create-project-dialog.css';

/**
 * Widget that displays available domain templates.
 *
 * Shows all template domains from the registry with their capabilities
 * and infrastructure requirements. Foundation for future project creation workflow.
 */
@injectable()
export class DomainTemplateBrowser extends ReactWidget {
    static readonly ID = 'domain-template-browser';
    static readonly LABEL = 'Domain Templates';

    @inject(DomainRegistry)
    protected readonly domainRegistry: DomainRegistry;

    @inject(MessageService)
    protected readonly messageService: MessageService;

    @inject(DomainProjectService)
    protected readonly projectService: DomainProjectService;

    @inject(WorkspaceService)
    protected readonly workspaceService: WorkspaceService;

    @inject(FileService)
    protected readonly fileService: FileService;

    @inject(FileDialogService)
    protected readonly fileDialogService: FileDialogService;

    constructor() {
        super();
        this.id = DomainTemplateBrowser.ID;
        this.title.label = DomainTemplateBrowser.LABEL;
        this.title.caption = 'Browse available domain templates';
        this.title.closable = true;
        this.title.iconClass = 'fa fa-cube';
        this.addClass('quallaa-domain-template-browser');
        console.log('[Quallaa] DomainTemplateBrowser widget created');
    }

    protected override onAfterAttach(msg: Message): void {
        super.onAfterAttach(msg);
        console.log('[Quallaa] DomainTemplateBrowser widget attached to DOM');
        this.update();
    }

    protected override onActivateRequest(msg: Message): void {
        super.onActivateRequest(msg);
        console.log('[Quallaa] DomainTemplateBrowser widget activated');
        this.node.focus();
    }

    protected render(): React.ReactNode {
        console.log('[Quallaa] DomainTemplateBrowser render() called');
        const templates = this.domainRegistry.getTemplateDomains();
        console.log('[Quallaa] Found', templates.length, 'template domains:', templates);

        return (
            <div className="domain-template-browser">
                <div className="browser-header">
                    <h1>Available Domain Templates</h1>
                    <p>Choose a template to start building your custom environment</p>
                </div>

                {templates.length === 0 ? (
                    <div className="empty-state">
                        <ServerIcon className="empty-icon" />
                        <h3>No Templates Available</h3>
                        <p>Domain templates will appear here once registered.</p>
                    </div>
                ) : (
                    <div className="template-grid">
                        {templates.map(template => this.renderTemplateCard(template))}
                    </div>
                )}
            </div>
        );
    }

    protected renderTemplateCard(template: DomainProvider): React.ReactNode {
        const capabilities = template.getCapabilities();
        const services = template.getServices?.() || [];

        return (
            <div key={template.id} className="template-card">
                <div className="card-header">
                    <div className="icon-wrapper">
                        {this.getIconForDomain(template.id)}
                    </div>
                    <div className="header-content">
                        <h3>{template.displayName}</h3>
                        {template.isTemplate && <span className="template-badge">Template</span>}
                    </div>
                </div>

                <p className="card-description">
                    {template.description || 'No description available'}
                </p>

                <div className="capabilities-section">
                    <h4>Capabilities ({capabilities.length})</h4>
                    <div className="capabilities-list">
                        {capabilities.map(cap => (
                            <span key={cap.id} className="capability-badge">
                                {cap.displayName}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="services-section">
                    <h4>Infrastructure ({services.length} services)</h4>
                    <div className="services-list">
                        {services.slice(0, 3).map(service => (
                            <div key={`${service.type}-${service.provider}`} className="service-item">
                                <span className="service-type">{service.type}</span>
                                <span className="service-provider">{service.provider}</span>
                                {service.required && <span className="required-badge">required</span>}
                            </div>
                        ))}
                        {services.length > 3 && (
                            <span className="more-services">+{services.length - 3} more</span>
                        )}
                    </div>
                </div>

                <div className="card-footer">
                    <button
                        className="create-button"
                        onClick={() => this.handleCreateProject(template)}
                    >
                        Create Project
                    </button>
                </div>
            </div>
        );
    }

    protected getIconForDomain(domainId: string): React.ReactNode {
        const iconMap: Record<string, React.ReactNode> = {
            'marketing-automation': <EnvelopeIcon />,
            'finance-analysis': <CurrencyDollarIcon />,
            'analytics-dashboard': <ChartBarIcon />,
        };

        return iconMap[domainId] || <ServerIcon />;
    }

    protected async handleCreateProject(template: DomainProvider): Promise<void> {
        console.log('[Quallaa] Opening create project dialog for template:', template.id);

        // Create and open dialog with required services
        const dialog = new CreateProjectDialog(
            template,
            this.fileService,
            this.fileDialogService
        );

        // Show dialog and wait for result
        const result = await dialog.open();

        if (result) {
            console.log('[Quallaa] Creating project:', result);

            // Create the project
            const projectUri = await this.projectService.createProject({
                projectName: result.projectName,
                projectPath: result.projectPath,
                template
            });

            if (projectUri) {
                // Ask user if they want to open the project
                const openProject = await this.messageService.info(
                    `Project "${result.projectName}" created successfully! Would you like to open it now?`,
                    'Open Project',
                    'Later'
                );

                if (openProject === 'Open Project') {
                    await this.workspaceService.open(projectUri);
                }
            }
        } else {
            console.log('[Quallaa] Project creation cancelled');
        }
    }
}
