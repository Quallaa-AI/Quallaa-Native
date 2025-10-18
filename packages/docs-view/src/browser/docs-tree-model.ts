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
import URI from '@theia/core/lib/common/uri';
import { FileNode, FileTreeModel } from '@theia/filesystem/lib/browser';
import { OpenerService, open, TreeNode, ExpandableTreeNode, CompositeTreeNode, SelectableTreeNode } from '@theia/core/lib/browser';
import { DocsTree } from './docs-tree';
import { WorkspaceService } from '@theia/workspace/lib/browser';
import { FrontendApplicationStateService } from '@theia/core/lib/browser/frontend-application-state';
import { WorkspaceNode, WorkspaceRootNode } from '@theia/navigator/lib/browser/navigator-tree';

/**
 * Tree model for the Docs view, managing the markdown file tree state.
 */
@injectable()
export class DocsTreeModel extends FileTreeModel {

    @inject(OpenerService)
    protected readonly openerService: OpenerService;

    @inject(DocsTree)
    protected override readonly tree: DocsTree;

    @inject(WorkspaceService)
    protected readonly workspaceService: WorkspaceService;

    @inject(FrontendApplicationStateService)
    protected readonly applicationState: FrontendApplicationStateService;

    @postConstruct()
    protected override init(): void {
        super.init();
        this.initializeRoot();
    }

    /**
     * Initialize the tree root based on workspace roots.
     */
    protected async initializeRoot(): Promise<void> {
        await Promise.all([
            this.applicationState.reachedState('initialized_layout'),
            this.workspaceService.roots
        ]);
        await this.updateRoot();
        if (this.toDispose.disposed) {
            return;
        }
        // Update root when workspace changes
        this.toDispose.push(this.workspaceService.onWorkspaceChanged(() => this.updateRoot()));
        this.toDispose.push(this.workspaceService.onWorkspaceLocationChanged(() => this.updateRoot()));

        // Auto-expand single root workspace
        if (this.selectedNodes.length) {
            return;
        }
        const root = this.root;
        if (CompositeTreeNode.is(root) && root.children.length === 1) {
            const child = root.children[0];
            if (SelectableTreeNode.is(child) && !child.selected && ExpandableTreeNode.is(child)) {
                this.selectNode(child);
                this.expandNode(child);
            }
        }
    }

    /**
     * Opens a file node in the editor.
     */
    protected override doOpenNode(node: TreeNode): void {
        if (node.visible === false) {
            return;
        } else if (FileNode.is(node)) {
            open(this.openerService, node.uri);
        }
    }

    /**
     * Gets tree nodes matching a given URI.
     */
    override *getNodesByUri(uri: URI): IterableIterator<TreeNode> {
        const workspace = this.root;
        if (WorkspaceNode.is(workspace)) {
            for (const root of workspace.children) {
                const id = this.tree.createId(root, uri);
                const node = this.getNode(id);
                if (node) {
                    yield node;
                }
            }
        }
    }

    /**
     * Updates the tree root.
     */
    protected async updateRoot(): Promise<void> {
        this.root = await this.createRoot();
    }

    /**
     * Creates the tree root from workspace roots.
     */
    protected async createRoot(): Promise<TreeNode | undefined> {
        if (this.workspaceService.opened) {
            const stat = this.workspaceService.workspace;
            const isMulti = (stat) ? !stat.isDirectory : false;
            const workspaceNode = isMulti
                ? this.createMultipleRootNode()
                : WorkspaceNode.createRoot();
            const roots = await this.workspaceService.roots;
            for (const root of roots) {
                workspaceNode.children.push(
                    await this.tree.createWorkspaceRoot(root, workspaceNode)
                );
            }
            return workspaceNode;
        }
    }

    /**
     * Creates a multi-root workspace node.
     */
    protected createMultipleRootNode(): WorkspaceNode {
        const workspace = this.workspaceService.workspace;
        let name = workspace
            ? workspace.resource.path.name
            : 'untitled';
        name += ' (Workspace)';
        return WorkspaceNode.createRoot(name);
    }

    /**
     * Reveals a markdown file in the docs tree.
     */
    async revealFile(uri: URI): Promise<TreeNode | undefined> {
        // Only reveal .md files
        if (!uri.toString().endsWith('.md') && !uri.toString().endsWith('.markdown')) {
            return undefined;
        }
        if (!uri.path.isAbsolute) {
            return undefined;
        }
        let node = this.getNodeClosestToRootByUri(uri);

        if (WorkspaceRootNode.is(node)) {
            if (ExpandableTreeNode.is(node)) {
                if (!node.expanded) {
                    node = await this.expandNode(node);
                }
                return node;
            }
            return undefined;
        }

        if (uri.path.isRoot) {
            return undefined;
        }

        if (await this.revealFile(uri.parent)) {
            if (node === undefined) {
                node = this.getNodeClosestToRootByUri(uri);
            }
            if (ExpandableTreeNode.is(node) && !node.expanded) {
                node = await this.expandNode(node);
            }
            return node;
        }
        return undefined;
    }

    /**
     * Gets the node closest to the workspace root for a given URI.
     */
    protected getNodeClosestToRootByUri(uri: URI): TreeNode | undefined {
        const nodes = [...this.getNodesByUri(uri)];
        return nodes.length > 0
            ? nodes.reduce((node1, node2) =>
                node1.id.length >= node2.id.length ? node1 : node2
            ) : undefined;
    }
}
