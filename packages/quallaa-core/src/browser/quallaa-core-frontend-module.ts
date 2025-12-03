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

import { ContainerModule } from '@theia/core/shared/inversify';
import { FrontendApplicationContribution } from '@theia/core/lib/browser';
import { MenuContribution } from '@theia/core/lib/common/menu';
import { QuallaaModuleManager } from './quallaa-mode-manager';
import { QuallaaMenuContribution } from './quallaa-contribution';

import './style/quallaa-modes.css';

/**
 * Quallaa Core frontend module.
 *
 * Provides simple mode / developer mode toggle functionality.
 */
export default new ContainerModule(bind => {
    // Mode manager (singleton)
    // Also serves as FrontendApplicationContribution for lifecycle hooks
    bind(QuallaaModuleManager).toSelf().inSingletonScope();
    bind(FrontendApplicationContribution).toService(QuallaaModuleManager);

    // Menu contribution for View > Layout > Toggle Developer Mode
    bind(QuallaaMenuContribution).toSelf().inSingletonScope();
    bind(MenuContribution).toService(QuallaaMenuContribution);

    // NOTE: Command and keybinding registration happens in QuallaaModuleManager.onStart()
    // to avoid async dependency issues that would break the keybinding system.
});
