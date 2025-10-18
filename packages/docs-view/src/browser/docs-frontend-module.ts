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

import { ContainerModule } from '@theia/core/shared/inversify';
import {
    bindViewContribution,
    FrontendApplicationContribution,
    WidgetFactory
} from '@theia/core/lib/browser';
import { DocsTreeWidget } from './docs-tree-widget';
import { DocsContribution } from './docs-contribution';
import { createDocsTreeWidget } from './docs-container';
import { DOCS_TREE_WIDGET_ID } from '../common';
import { DocsWidgetFactory } from './docs-widget-factory';
import { DocsFilter } from './docs-filter';

/**
 * Frontend module for the Docs view.
 * Sets up all dependency injection bindings.
 */
export default new ContainerModule(bind => {
    // Bind the markdown filter
    bind(DocsFilter).toSelf().inSingletonScope();

    // Bind the contribution
    bindViewContribution(bind, DocsContribution);
    bind(FrontendApplicationContribution).toService(DocsContribution);

    // Bind the docs tree widget factory
    bind(DocsTreeWidget).toDynamicValue(ctx =>
        createDocsTreeWidget(ctx.container)
    );
    bind(WidgetFactory).toDynamicValue(({ container }) => ({
        id: DOCS_TREE_WIDGET_ID,
        createWidget: () => container.get(DocsTreeWidget)
    })).inSingletonScope();

    // Bind the view container factory
    bind(DocsWidgetFactory).toSelf().inSingletonScope();
    bind(WidgetFactory).toService(DocsWidgetFactory);
});
