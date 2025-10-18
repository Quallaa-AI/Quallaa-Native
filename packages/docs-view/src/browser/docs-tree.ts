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

import { injectable, inject } from '@theia/core/shared/inversify';
import { FileTree } from '@theia/filesystem/lib/browser';
import { TreeNode, CompositeTreeNode } from '@theia/core/lib/browser';
import { DocsFilter } from './docs-filter';
import { WorkspaceNode, WorkspaceRootNode } from '@theia/navigator/lib/browser/navigator-tree';
import URI from '@theia/core/lib/common/uri';
import { FileStat } from '@theia/filesystem/lib/common/files';

/**
 * Tree implementation for the Docs view that filters to show only markdown files.
 */
@injectable()
export class DocsTree extends FileTree {

    @inject(DocsFilter)
    protected readonly docsFilter: DocsFilter;

    /**
     * Resolves children for a given parent node, applying markdown-only filtering.
     */
    override async resolveChildren(parent: CompositeTreeNode): Promise<TreeNode[]> {
        // Workspace nodes should return their children directly (workspace roots)
        if (WorkspaceNode.is(parent)) {
            return parent.children;
        }
        // For all other nodes, apply the docs filter to show only .md files
        const children = await super.resolveChildren(parent);
        return this.docsFilter.filter(children);
    }

    /**
     * Creates a unique ID for a node relative to a workspace root.
     */
    protected override toNodeId(uri: URI, parent: CompositeTreeNode): string {
        const workspaceRootNode = WorkspaceRootNode.find(parent);
        if (workspaceRootNode) {
            return this.createId(workspaceRootNode, uri);
        }
        return super.toNodeId(uri, parent);
    }

    /**
     * Creates an ID for a node within a workspace root.
     */
    createId(root: WorkspaceRootNode, uri: URI): string {
        const id = super.toNodeId(uri, root);
        return id === root.id ? id : `${root.id}:${id}`;
    }

    /**
     * Creates a workspace root node from a file stat.
     */
    async createWorkspaceRoot(rootFolder: FileStat, workspaceNode: WorkspaceNode): Promise<WorkspaceRootNode> {
        const node = this.toNode(rootFolder, workspaceNode) as WorkspaceRootNode;
        Object.assign(node, {
            visible: workspaceNode.name !== WorkspaceNode.name,
        });
        return node;
    }
}
