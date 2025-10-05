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

import { injectable } from '@theia/core/shared/inversify';
import { GettingStartedWidget } from '@theia/getting-started/lib/browser/getting-started-widget';
import { nls } from '@theia/core/lib/common/nls';
import * as React from '@theia/core/shared/react';

@injectable()
export class QuallaaGettingStartedWidget extends GettingStartedWidget {

    /**
     * Render the `News` section with Quallaa-specific content.
     */
    protected override renderNews(): React.ReactNode {
        return <div className='gs-section'>
            <h3 className='gs-section-header'>
                <i className='fa fa-bullhorn'></i>
                {nls.localize('theia/getting-started/news', 'News')}
            </h3>
            <div className='gs-action-container'>
                <p className='gs-news-item'>
                    Welcome to Quallaa - Your AI-Native Development Environment
                </p>
                <p className='gs-sub-text'>
                    Quallaa brings together powerful AI assistance and a complete IDE experience,
                    helping you build software faster and smarter.
                </p>
            </div>
        </div>;
    }

    /**
     * Render the `Help` section with Quallaa-specific links.
     */
    protected override renderHelp(): React.ReactNode {
        const sourceUrl = 'https://github.com/Quallaa-AI/Quallaa-Native';
        const theiaUrl = 'https://theia-ide.org';

        return <div className='gs-section'>
            <h3 className='gs-section-header'>
                <i className='fa fa-question-circle'></i>
                {nls.localizeByDefault('Help')}
            </h3>
            <div className='gs-action-container'>
                <a
                    role={'button'}
                    tabIndex={0}
                    onClick={() => this.doOpenExternalLink(sourceUrl)}
                    onKeyDown={(e: React.KeyboardEvent) => this.doOpenExternalLinkEnter(e, sourceUrl)}>
                    Report an Issue
                </a>
            </div>
            <div className='gs-action-container'>
                <a
                    role={'button'}
                    tabIndex={0}
                    onClick={() => this.doOpenExternalLink(theiaUrl)}
                    onKeyDown={(e: React.KeyboardEvent) => this.doOpenExternalLinkEnter(e, theiaUrl)}>
                    About Eclipse Theia
                </a>
            </div>
            <div className='gs-action-container gs-built-on'>
                <p className='gs-sub-text'>
                    Quallaa is built on Eclipse Theia, an extensible platform for full-fledged IDEs.
                </p>
            </div>
        </div>;
    }
}
