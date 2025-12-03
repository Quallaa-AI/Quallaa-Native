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

import { injectable } from '@theia/core/shared/inversify';
import { Command } from '@theia/core/lib/common/command';
import { MenuContribution, MenuModelRegistry } from '@theia/core/lib/common/menu';
import { CommonMenus } from '@theia/core/lib/browser/common-frontend-contribution';

/**
 * Quallaa commands
 */
export namespace QuallaaCommands {
    export const TOGGLE_DEVELOPER_MODE: Command = {
        id: 'quallaa.toggleDeveloperMode',
        label: 'Toggle Developer Mode',
        category: 'View'
    };
}

/**
 * Registers Quallaa menu items
 */
@injectable()
export class QuallaaMenuContribution implements MenuContribution {

    registerMenus(registry: MenuModelRegistry): void {
        // Add "Toggle Developer Mode" to View > Layout menu
        registry.registerMenuAction(CommonMenus.VIEW_LAYOUT, {
            commandId: QuallaaCommands.TOGGLE_DEVELOPER_MODE.id,
            label: 'Toggle Developer Mode',
            order: '0' // First item in layout section
        });
    }
}
