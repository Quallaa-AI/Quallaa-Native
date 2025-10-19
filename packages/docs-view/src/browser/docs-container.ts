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

import { interfaces, Container } from '@theia/core/shared/inversify';
import { TreeProps, defaultTreeProps } from '@theia/core/lib/browser';
import { createFileTreeContainer } from '@theia/filesystem/lib/browser';
import { DocsTree } from './docs-tree';
import { DocsTreeModel } from './docs-tree-model';
import { DocsTreeWidget } from './docs-tree-widget';

/**
 * Context menu path for the docs tree.
 */
export const DOCS_CONTEXT_MENU = ['docs-context-menu'];

/**
 * Tree properties for the docs view.
 */
export const DOCS_TREE_PROPS = <TreeProps>{
    ...defaultTreeProps,
    contextMenuPath: DOCS_CONTEXT_MENU,
    multiSelect: false,
    search: true,
    globalSelection: true
};

/**
 * Creates a container for the docs tree widget with all necessary bindings.
 */
export function createDocsTreeContainer(parent: interfaces.Container): Container {
    const child = createFileTreeContainer(parent, {
        tree: DocsTree,
        model: DocsTreeModel,
        widget: DocsTreeWidget,
        props: DOCS_TREE_PROPS,
    });

    return child;
}

/**
 * Creates a docs tree widget from a parent container.
 */
export function createDocsTreeWidget(parent: interfaces.Container): DocsTreeWidget {
    return createDocsTreeContainer(parent).get(DocsTreeWidget);
}
