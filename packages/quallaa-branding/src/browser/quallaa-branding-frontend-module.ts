// *****************************************************************************
// Copyright (C) 2025 Quallaa AI
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

import { ContainerModule } from 'inversify';
import { AboutDialog } from '@theia/core/lib/browser/about-dialog';
import { GettingStartedWidget } from '@theia/getting-started/lib/browser/getting-started-widget';
import { QuallaaAboutDialog } from './quallaa-about-dialog';
import { QuallaaGettingStartedWidget } from './quallaa-getting-started-widget';

export default new ContainerModule((bind, unbind, isBound, rebind) => {
    bind(QuallaaAboutDialog).toSelf().inSingletonScope();
    rebind(AboutDialog).toService(QuallaaAboutDialog);

    bind(QuallaaGettingStartedWidget).toSelf().inSingletonScope();
    rebind(GettingStartedWidget).toService(QuallaaGettingStartedWidget);
});
