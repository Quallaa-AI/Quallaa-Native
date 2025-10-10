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
import { FileService } from '@theia/filesystem/lib/browser/file-service';
import { MessageService } from '@theia/core';
import URI from '@theia/core/lib/common/uri';
import { DomainProvider } from '../common/domain-protocol';

export interface ProjectCreationOptions {
    projectName: string;
    projectPath: string;
    template: DomainProvider;
}

/**
 * Service for creating domain-based projects from templates.
 */
@injectable()
export class DomainProjectService {

    @inject(FileService)
    protected readonly fileService: FileService;

    @inject(MessageService)
    protected readonly messageService: MessageService;

    /**
     * Creates a new project from a domain template.
     */
    async createProject(options: ProjectCreationOptions): Promise<URI | undefined> {
        const { projectName, projectPath, template } = options;

        try {
            // Construct full project URI
            const projectUri = new URI(`${projectPath}/${projectName}`);

            // Check if project directory already exists
            const exists = await this.fileService.exists(projectUri);
            if (exists) {
                this.messageService.error(`Project directory already exists: ${projectUri.path.fsPath()}`);
                return undefined;
            }

            // Create project directory
            await this.fileService.createFolder(projectUri);
            console.log('[Quallaa] Created project directory:', projectUri.path.fsPath());

            // Create .quallaa directory
            const quallaaDirUri = projectUri.resolve('.quallaa');
            await this.fileService.createFolder(quallaaDirUri);
            console.log('[Quallaa] Created .quallaa directory');

            // Create project-type.json
            await this.createProjectTypeFile(quallaaDirUri, template);

            // Create services.json (infrastructure configuration)
            await this.createServicesFile(quallaaDirUri, template);

            // Create README.md
            await this.createReadmeFile(projectUri, template, projectName);

            this.messageService.info(`Project "${projectName}" created successfully!`);

            return projectUri;

        } catch (error) {
            console.error('[Quallaa] Error creating project:', error);
            this.messageService.error(`Failed to create project: ${error}`);
            return undefined;
        }
    }

    /**
     * Creates the project-type.json file that identifies the domain.
     */
    protected async createProjectTypeFile(quallaaDirUri: URI, template: DomainProvider): Promise<void> {
        const projectType = {
            domainId: template.id,
            domainVersion: '1.0.0',
            displayName: template.displayName,
            createdAt: new Date().toISOString(),
            isTemplate: false
        };

        const content = JSON.stringify(projectType, null, 2);
        const fileUri = quallaaDirUri.resolve('project-type.json');

        await this.fileService.write(fileUri, content);

        console.log('[Quallaa] Created project-type.json');
    }

    /**
     * Creates the services.json file with infrastructure requirements.
     */
    protected async createServicesFile(quallaaDirUri: URI, template: DomainProvider): Promise<void> {
        const services = template.getServices ? template.getServices() : [];

        const servicesConfig = {
            services: services.map(service => ({
                type: service.type,
                provider: service.provider,
                required: service.required,
                configured: false,
                config: {}
            }))
        };

        const content = JSON.stringify(servicesConfig, null, 2);
        const fileUri = quallaaDirUri.resolve('services.json');

        await this.fileService.write(fileUri, content);

        console.log('[Quallaa] Created services.json with', services.length, 'services');
    }

    /**
     * Creates a README.md file with project information.
     */
    protected async createReadmeFile(projectUri: URI, template: DomainProvider, projectName: string): Promise<void> {
        const capabilities = template.getCapabilities();
        const services = template.getServices ? template.getServices() : [];

        const content = `# ${projectName}

This project was created from the **${template.displayName}** template.

## Description

${template.description || 'No description available.'}

## Capabilities

This project includes the following capabilities:

${capabilities.map(cap => `- **${cap.displayName}**: ${cap.description || 'No description'}`).join('\n')}

## Infrastructure Services

${services.length > 0 ? services.map(service =>
    `- ${service.type} (${service.provider})${service.required ? ' - **Required**' : ''}`
).join('\n') : 'No infrastructure services configured.'}

## Getting Started

This is a Quallaa domain project. Open it in Quallaa to begin building your custom environment.

## Configuration

Infrastructure services need to be configured in \`.quallaa/services.json\`.

---

*Created with Quallaa - Built on Eclipse Theia*
`;

        const fileUri = projectUri.resolve('README.md');

        await this.fileService.write(fileUri, content);

        console.log('[Quallaa] Created README.md');
    }
}
