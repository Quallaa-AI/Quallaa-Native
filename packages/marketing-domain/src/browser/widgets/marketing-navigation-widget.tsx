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

import * as React from '@theia/core/shared/react';
import { injectable, postConstruct } from '@theia/core/shared/inversify';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import { Message } from '@theia/core/lib/browser/widgets/widget';

/**
 * Marketing Navigation Widget (Top Panel).
 *
 * Provides domain-specific navigation tabs: Home | Campaigns | Audience | Analytics | Docs
 * This is a minimal placeholder for Phase 2 testing.
 */
@injectable()
export class MarketingNavigationWidget extends ReactWidget {
    static readonly ID = 'marketing-navigation';
    static readonly LABEL = 'Marketing Navigation';

    private activeTab: string = 'home';

    @postConstruct()
    protected init(): void {
        this.id = MarketingNavigationWidget.ID;
        this.title.label = MarketingNavigationWidget.LABEL;
        this.title.closable = false;
        this.title.iconClass = 'fa fa-bullhorn'; // Marketing icon
        this.update();
    }

    protected override onActivateRequest(msg: Message): void {
        super.onActivateRequest(msg);
        this.node.focus();
    }

    protected override render(): React.ReactNode {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                height: '100%',
                padding: '0 20px',
                backgroundColor: 'var(--theia-titleBar-activeBackground)',
                color: 'var(--theia-titleBar-activeForeground)',
                borderBottom: '1px solid var(--theia-panel-border)'
            }}>
                {/* Brand Logo/Name */}
                <div style={{
                    fontWeight: 'bold',
                    fontSize: '14px',
                    marginRight: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    <i className="fa fa-bullhorn" style={{ fontSize: '16px' }}></i>
                    <span>Marketing</span>
                </div>

                {/* Navigation Tabs */}
                <div style={{ display: 'flex', gap: '5px' }}>
                    {this.renderTab('home', 'Home')}
                    {this.renderTab('campaigns', 'Campaigns')}
                    {this.renderTab('audience', 'Audience')}
                    {this.renderTab('analytics', 'Analytics')}
                    {this.renderTab('docs', 'Docs')}
                </div>

                {/* Spacer */}
                <div style={{ flexGrow: 1 }}></div>

                {/* Info */}
                <div style={{
                    fontSize: '11px',
                    opacity: 0.7,
                    fontStyle: 'italic'
                }}>
                    Phase 2 Test - Minimal Widget
                </div>
            </div>
        );
    }

    private renderTab(id: string, label: string): React.ReactNode {
        const isActive = this.activeTab === id;

        return (
            <button
                key={id}
                onClick={() => this.handleTabClick(id)}
                style={{
                    padding: '8px 16px',
                    border: 'none',
                    backgroundColor: isActive
                        ? 'var(--theia-button-background)'
                        : 'transparent',
                    color: isActive
                        ? 'var(--theia-button-foreground)'
                        : 'var(--theia-titleBar-activeForeground)',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: isActive ? 600 : 400,
                    borderRadius: '4px',
                    transition: 'all 0.2s',
                    opacity: isActive ? 1 : 0.8
                }}
                onMouseEnter={(e) => {
                    if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'var(--theia-button-hoverBackground)';
                        e.currentTarget.style.opacity = '1';
                    }
                }}
                onMouseLeave={(e) => {
                    if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.opacity = '0.8';
                    }
                }}
            >
                {label}
            </button>
        );
    }

    private handleTabClick(tabId: string): void {
        console.log(`[MarketingNavigation] Tab clicked: ${tabId}`);
        this.activeTab = tabId;
        this.update();

        // TODO: Emit event to switch main area widget
        // For now, just log
    }
}
