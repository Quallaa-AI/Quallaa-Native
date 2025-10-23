/********************************************************************************
 * Copyright (C) 2025 Quallaa and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the Eclipse
 * Public License v. 2.0 are satisfied: GNU General Public License, version 2
 * with the GNU Classpath Exception which is available at
 * https://www.gnu.org/software/classpath/license.html.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0-only WITH Classpath-exception-2.0
 ********************************************************************************/

import { injectable, inject, postConstruct } from '@theia/core/shared/inversify';
import { TreeProps, ContextMenuRenderer, TreeNode, NodeProps } from '@theia/core/lib/browser';
import { FileTreeWidget } from '@theia/filesystem/lib/browser';
import { DocsTreeModel } from './docs-tree-model';
import { WorkspaceNode, WorkspaceRootNode } from '@theia/navigator/lib/browser/navigator-tree';
import { DOCS_TREE_WIDGET_ID } from '../common';
import { codicon } from '@theia/core/lib/browser/widgets/widget';
import * as React from '@theia/core/shared/react';

const DOCS_CLASS = 'theia-Docs';

/**
 * Tree widget for the Docs view, displaying only markdown files.
 */
@injectable()
export class DocsTreeWidget extends FileTreeWidget {

    constructor(
        @inject(TreeProps) props: TreeProps,
        @inject(DocsTreeModel) override readonly model: DocsTreeModel,
        @inject(ContextMenuRenderer) contextMenuRenderer: ContextMenuRenderer,
    ) {
        super(props, model, contextMenuRenderer);
        this.id = DOCS_TREE_WIDGET_ID;
        this.addClass(DOCS_CLASS);
    }

    @postConstruct()
    protected override init(): void {
        super.init();
        this.title.label = 'Knowledge Base';
        this.title.caption = 'Knowledge Base - Markdown Files';
        this.title.closable = true;
        this.title.iconClass = codicon('book');
    }

    /**
     * Updates the widget title based on the workspace root.
     */
    protected override doUpdateRows(): void {
        super.doUpdateRows();
        this.title.label = 'Knowledge Base';
        if (WorkspaceNode.is(this.model.root)) {
            if (this.model.root.name === WorkspaceNode.name) {
                const rootNode = this.model.root.children[0];
                if (WorkspaceRootNode.is(rootNode)) {
                    this.title.caption = `Knowledge Base - ${this.toNodeName(rootNode)}`;
                }
            } else {
                this.title.caption = `Knowledge Base - ${this.toNodeName(this.model.root)}`;
            }
        } else {
            this.title.caption = 'Knowledge Base - Markdown Files';
        }
    }

    /**
     * Customize icon rendering for markdown files.
     */
    protected override renderIcon(node: TreeNode, props: NodeProps): React.ReactNode {
        // Use markdown icon for all files (they're all .md anyway)
        const icon = this.toNodeIcon(node);
        if (icon) {
            return <div className={icon + ' theia-file-icon'}></div>;
        }
        return undefined;
    }

    /**
     * Show welcome view when no workspace is opened.
     */
    protected override shouldShowWelcomeView(): boolean {
        return this.model.root === undefined;
    }

    /**
     * Get container tree node for context operations.
     */
    override getContainerTreeNode(): TreeNode | undefined {
        const root = this.model.root;
        if (WorkspaceNode.is(root)) {
            return root.children[0];
        }
        return undefined;
    }
}
