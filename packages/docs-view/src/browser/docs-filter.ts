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

import { injectable } from '@theia/core/shared/inversify';
import { MaybePromise } from '@theia/core/lib/common/types';
import { DirNode, FileNode } from '@theia/filesystem/lib/browser';

/**
 * Filter for the Docs view that only shows markdown files (.md extension).
 * Directories are shown if they might contain markdown files.
 */
@injectable()
export class DocsFilter {

    /**
     * Filters items to show only markdown files and directories.
     * @param items Array of tree nodes to filter
     * @returns Filtered array containing only directories and .md files
     */
    async filter<T>(items: MaybePromise<T[]>): Promise<T[]> {
        return (await items).filter(item => this.filterItem(item));
    }

    /**
     * Determines if a single item should be displayed in the docs view.
     * @param item Tree node to check
     * @returns true if item should be shown (is directory or .md file)
     */
    protected filterItem(item: unknown): boolean {
        // Always show directories so users can navigate the tree
        if (DirNode.is(item)) {
            return true;
        }

        // For files, only show markdown files
        if (FileNode.is(item)) {
            const uri = item.uri.toString();
            return uri.endsWith('.md') || uri.endsWith('.markdown');
        }

        // Hide everything else
        return false;
    }
}
