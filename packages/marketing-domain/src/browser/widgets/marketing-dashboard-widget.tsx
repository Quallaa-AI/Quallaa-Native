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
 * Marketing Dashboard Widget (Main Area).
 *
 * Provides welcome screen and overview of marketing domain.
 * This is a minimal placeholder for Phase 2 testing.
 */
@injectable()
export class MarketingDashboardWidget extends ReactWidget {
    static readonly ID = 'marketing-dashboard';
    static readonly LABEL = 'Marketing Dashboard';

    @postConstruct()
    protected init(): void {
        this.id = MarketingDashboardWidget.ID;
        this.title.label = MarketingDashboardWidget.LABEL;
        this.title.closable = true;
        this.title.iconClass = 'fa fa-dashboard';
        this.update();
    }

    protected override onActivateRequest(msg: Message): void {
        super.onActivateRequest(msg);
        this.node.focus();
    }

    protected override render(): React.ReactNode {
        return (
            <div style={{
                padding: '40px',
                height: '100%',
                overflow: 'auto',
                backgroundColor: 'var(--theia-editor-background)',
                color: 'var(--theia-editor-foreground)'
            }}>
                {/* Header */}
                <div style={{ marginBottom: '30px' }}>
                    <h1 style={{
                        fontSize: '28px',
                        fontWeight: 'bold',
                        marginBottom: '10px',
                        color: 'var(--theia-titleBar-activeForeground)'
                    }}>
                        <i className="fa fa-bullhorn" style={{ marginRight: '10px', color: 'var(--theia-button-background)' }}></i>
                        Marketing Automation
                    </h1>
                    <p style={{
                        fontSize: '14px',
                        opacity: 0.8
                    }}>
                        Welcome to your marketing environment. Domain UI is active.
                    </p>
                </div>

                {/* Status Cards */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '20px',
                    marginBottom: '30px'
                }}>
                    {this.renderCard('Campaigns', '0', 'fa-envelope', 'Create email campaigns')}
                    {this.renderCard('Audience', '0', 'fa-users', 'Manage customer segments')}
                    {this.renderCard('Templates', '0', 'fa-file-code-o', 'Email templates')}
                    {this.renderCard('Analytics', '-', 'fa-line-chart', 'Performance metrics')}
                </div>

                {/* Phase 2 Test Info */}
                <div style={{
                    padding: '20px',
                    backgroundColor: 'var(--theia-notifications-background)',
                    border: '1px solid var(--theia-panel-border)',
                    borderRadius: '6px',
                    marginBottom: '20px'
                }}>
                    <h3 style={{ marginBottom: '10px', fontSize: '16px' }}>
                        <i className="fa fa-info-circle" style={{ marginRight: '8px' }}></i>
                        Phase 2 Testing
                    </h3>
                    <p style={{ fontSize: '13px', lineHeight: '1.6', opacity: 0.9 }}>
                        This is a minimal placeholder widget for testing the shell layout system.
                        The navigation bar above and this dashboard demonstrate domain-specific UI.
                    </p>
                    <ul style={{
                        marginTop: '10px',
                        paddingLeft: '20px',
                        fontSize: '13px',
                        lineHeight: '1.8',
                        opacity: 0.9
                    }}>
                        <li> Domain detected from <code>.quallaa/project-type.json</code></li>
                        <li> IDE panels (Explorer, Terminal) are hidden</li>
                        <li> Marketing navigation widget in top panel</li>
                        <li> Dashboard widget in main area</li>
                        <li>=� Use <strong>View � Toggle IDE Panels</strong> to show/hide IDE panels</li>
                    </ul>
                </div>

                {/* Quick Actions */}
                <div>
                    <h3 style={{ marginBottom: '15px', fontSize: '16px' }}>Quick Start</h3>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {this.renderButton('Create Campaign', 'fa-plus', () => console.log('Create campaign'))}
                        {this.renderButton('Add Contacts', 'fa-user-plus', () => console.log('Add contacts'))}
                        {this.renderButton('New Template', 'fa-file-o', () => console.log('New template'))}
                        {this.renderButton('View Analytics', 'fa-bar-chart', () => console.log('View analytics'))}
                    </div>
                </div>
            </div>
        );
    }

    private renderCard(title: string, value: string, icon: string, subtitle: string): React.ReactNode {
        return (
            <div style={{
                padding: '20px',
                backgroundColor: 'var(--theia-sideBar-background)',
                border: '1px solid var(--theia-panel-border)',
                borderRadius: '6px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                    <i className={`fa ${icon}`} style={{
                        fontSize: '24px',
                        marginRight: '12px',
                        color: 'var(--theia-button-background)'
                    }}></i>
                    <div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{value}</div>
                        <div style={{ fontSize: '12px', opacity: 0.8 }}>{title}</div>
                    </div>
                </div>
                <div style={{ fontSize: '11px', opacity: 0.7 }}>{subtitle}</div>
            </div>
        );
    }

    private renderButton(label: string, icon: string, onClick: () => void): React.ReactNode {
        return (
            <button
                onClick={onClick}
                style={{
                    padding: '10px 20px',
                    backgroundColor: 'var(--theia-button-background)',
                    color: 'var(--theia-button-foreground)',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--theia-button-hoverBackground)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--theia-button-background)';
                }}
            >
                <i className={`fa ${icon}`}></i>
                {label}
            </button>
        );
    }
}
