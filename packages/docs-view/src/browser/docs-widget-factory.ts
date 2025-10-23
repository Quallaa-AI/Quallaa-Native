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

import { inject, injectable } from '@theia/core/shared/inversify';
import {
    codicon,
    ViewContainer,
    ViewContainerTitleOptions,
    WidgetFactory,
    WidgetManager
} from '@theia/core/lib/browser';
import { DOCS_VIEW_CONTAINER_ID, DOCS_TREE_WIDGET_ID } from '../common';

/**
 * Title options for the Knowledge Base view container.
 */
export const DOCS_VIEW_CONTAINER_TITLE_OPTIONS: ViewContainerTitleOptions = {
    label: 'Knowledge Base',
    iconClass: codicon('book'),
    closeable: true
};

/**
 * Widget factory for creating the Docs view container.
 */
@injectable()
export class DocsWidgetFactory implements WidgetFactory {

    static ID = DOCS_VIEW_CONTAINER_ID;

    readonly id = DocsWidgetFactory.ID;

    @inject(ViewContainer.Factory)
    protected readonly viewContainerFactory: ViewContainer.Factory;

    @inject(WidgetManager)
    protected readonly widgetManager: WidgetManager;

    /**
     * Creates the Docs view container with the docs tree widget.
     */
    async createWidget(): Promise<ViewContainer> {
        const viewContainer = this.viewContainerFactory({
            id: DOCS_VIEW_CONTAINER_ID,
            progressLocationId: 'docs'
        });
        viewContainer.setTitleOptions(DOCS_VIEW_CONTAINER_TITLE_OPTIONS);

        // Add the docs tree widget to the container
        const docsWidget = await this.widgetManager.getOrCreateWidget(DOCS_TREE_WIDGET_ID);
        viewContainer.addWidget(docsWidget, {
            canHide: false,
            initiallyCollapsed: false,
            disableDraggingToOtherContainers: true
        });

        return viewContainer;
    }
}
