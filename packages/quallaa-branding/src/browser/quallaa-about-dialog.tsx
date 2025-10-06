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

import * as React from 'react';
import { inject, injectable } from 'inversify';
import { AboutDialog, AboutDialogProps } from '@theia/core/lib/browser/about-dialog';
import { WindowService } from '@theia/core/lib/browser/window/window-service';
import { ApplicationServer } from '@theia/core/lib/common/application-protocol';
import { nls } from '@theia/core/lib/common/nls';
import { DEFAULT_SUPPORTED_API_VERSION } from '@theia/application-package/lib/api';

@injectable()
export class QuallaaAboutDialog extends AboutDialog {

    constructor(
        @inject(AboutDialogProps) protected override readonly props: AboutDialogProps,
        @inject(ApplicationServer) protected override readonly appServer: ApplicationServer,
        @inject(WindowService) protected override readonly windowService: WindowService
    ) {
        super(props);
    }

    protected override renderHeader(): React.ReactNode {
        const applicationInfo = this.applicationInfo;
        const theiaUrl = 'https://theia-ide.org';
        const sourceUrl = 'https://github.com/Quallaa-AI/Quallaa-Native';
        const compatibilityUrl = 'https://eclipse-theia.github.io/vscode-theia-comparator/status.html';

        const detailsLabel = nls.localizeByDefault('Details');
        const versionLabel = nls.localizeByDefault('Version');
        const defaultApiLabel = nls.localize('theia/core/about/defaultApi', 'Default {0} API', 'VS Code');
        const compatibilityLabel = nls.localize('theia/core/about/compatibility', '{0} Compatibility', 'VS Code');

        return <>
            <h3>{detailsLabel}</h3>
            <div className='about-details'>
                {applicationInfo && <p>{`${versionLabel}: ${applicationInfo.version}`}</p>}
                <p>{`${defaultApiLabel}: ${DEFAULT_SUPPORTED_API_VERSION}`}</p>
                <p>
                    <a
                        role={'button'}
                        tabIndex={0}
                        href={compatibilityUrl}
                        target='_blank'
                        rel='noopener noreferrer'
                        onClick={(e) => { e.preventDefault(); this.doOpenExternalLink(compatibilityUrl); }}
                        onKeyDown={(e: React.KeyboardEvent) => this.doOpenExternalLinkEnter(e, compatibilityUrl)}>
                        {compatibilityLabel}
                    </a>
                </p>
            </div>
            <div className='about-attribution' style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--theia-sideBarSectionHeader-border)' }}>
                <h3>About Quallaa</h3>
                <p>
                    Quallaa is built on{' '}
                    <a
                        role={'button'}
                        tabIndex={0}
                        href={theiaUrl}
                        target='_blank'
                        rel='noopener noreferrer'
                        onClick={(e) => { e.preventDefault(); this.doOpenExternalLink(theiaUrl); }}
                        onKeyDown={(e: React.KeyboardEvent) => this.doOpenExternalLinkEnter(e, theiaUrl)}>
                        Eclipse Theia
                    </a>
                    , an extensible platform to develop full-fledged multi-language IDEs.
                </p>
                <p>
                    © 2025 Quallaa AI. Licensed under the Eclipse Public License 2.0.
                </p>
                <p>
                    <a
                        role={'button'}
                        tabIndex={0}
                        href={sourceUrl}
                        target='_blank'
                        rel='noopener noreferrer'
                        onClick={(e) => { e.preventDefault(); this.doOpenExternalLink(sourceUrl); }}
                        onKeyDown={(e: React.KeyboardEvent) => this.doOpenExternalLinkEnter(e, sourceUrl)}>
                        View Source Code
                    </a>
                </p>
            </div>
        </>;
    }
}
