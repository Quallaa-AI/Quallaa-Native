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
import { QuallaaModuleManager } from './quallaa-mode-manager';

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

    // Command and keybinding contributions
    // NOTE: We don't bind these as CommandContribution or KeybindingContribution
    // because they would create async dependency issues that break the entire
    // keybinding system. Instead, QuallaaModuleManager registers them manually
    // in its onStart hook using CommandRegistry and KeybindingRegistry directly.
});
