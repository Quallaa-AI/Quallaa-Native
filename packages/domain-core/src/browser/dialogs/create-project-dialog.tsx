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

import { AbstractDialog } from '@theia/core/lib/browser/dialogs';
import { Message } from '@theia/core/shared/@lumino/messaging';
import { FileService } from '@theia/filesystem/lib/browser/file-service';
import { FileDialogService } from '@theia/filesystem/lib/browser';
import { DomainProvider } from '../../common/domain-protocol';

export interface CreateProjectDialogResult {
    projectName: string;
    projectPath: string;
}

/**
 * Dialog for creating a new project from a domain template.
 */
export class CreateProjectDialog extends AbstractDialog<CreateProjectDialogResult> {

    protected projectName: string = '';
    protected projectPath: string = '';
    protected override readonly contentNode: HTMLDivElement;

    constructor(
        protected readonly template: DomainProvider,
        protected readonly fileService: FileService,
        protected readonly fileDialogService: FileDialogService
    ) {
        super({
            title: `Create ${template.displayName} Project`
        });

        this.contentNode = document.createElement('div');
        this.contentNode.className = 'create-project-dialog';
        this.contentNode.innerHTML = this.getDialogHTML();
        this.node.appendChild(this.contentNode);

        this.appendAcceptButton('Create');
        this.appendCloseButton('Cancel');

        // Add event listeners
        this.setupEventListeners();
    }

    protected getDialogHTML(): string {
        return `
            <div class="dialog-section">
                <label for="project-name">Project Name</label>
                <input
                    type="text"
                    id="project-name"
                    class="theia-input"
                    placeholder="my-marketing-project"
                    value="${this.projectName}"
                />
            </div>

            <div class="dialog-section">
                <label for="project-path">Project Location</label>
                <div class="input-with-button">
                    <input
                        type="text"
                        id="project-path"
                        class="theia-input"
                        placeholder="/path/to/projects"
                        value="${this.projectPath}"
                        readonly
                    />
                    <button
                        id="browse-button"
                        class="theia-button"
                    >
                        Browse...
                    </button>
                </div>
            </div>

            <div class="dialog-info">
                <p>
                    Project will be created at:
                    <br />
                    <code id="full-path">(select project name and location)</code>
                </p>
            </div>
        `;
    }

    protected setupEventListeners(): void {
        const nameInput = this.contentNode.querySelector('#project-name') as HTMLInputElement;
        const pathInput = this.contentNode.querySelector('#project-path') as HTMLInputElement;
        const browseButton = this.contentNode.querySelector('#browse-button') as HTMLButtonElement;

        if (nameInput) {
            nameInput.addEventListener('input', () => {
                this.projectName = nameInput.value;
                this.updateFullPath();
                this.validate();
            });
        }

        if (browseButton) {
            browseButton.addEventListener('click', async () => {
                const uri = await this.fileDialogService.showOpenDialog({
                    title: 'Select Project Location',
                    canSelectFiles: false,
                    canSelectFolders: true,
                    canSelectMany: false
                });

                if (uri && pathInput) {
                    this.projectPath = uri.path.fsPath();
                    pathInput.value = this.projectPath;
                    this.updateFullPath();
                    this.validate();
                }
            });
        }
    }

    protected updateFullPath(): void {
        const fullPathElement = this.contentNode.querySelector('#full-path') as HTMLElement;
        if (fullPathElement) {
            if (this.projectPath && this.projectName) {
                fullPathElement.textContent = `${this.projectPath}/${this.projectName}`;
            } else {
                fullPathElement.textContent = '(select project name and location)';
            }
        }
    }

    get value(): CreateProjectDialogResult {
        return {
            projectName: this.projectName,
            projectPath: this.projectPath
        };
    }

    protected override isValid(value: CreateProjectDialogResult): boolean {
        return value.projectName.length > 0 && value.projectPath.length > 0;
    }

    protected override onAfterAttach(msg: Message): void {
        super.onAfterAttach(msg);
        const nameInput = this.contentNode.querySelector('#project-name') as HTMLInputElement;
        if (nameInput) {
            nameInput.focus();
        }
    }
}
