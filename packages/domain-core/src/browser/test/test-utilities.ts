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

import { URI } from '@theia/core';
import { DomainProvider } from '../../common/domain-protocol';

/**
 * Test utilities for domain-core tests
 */

/**
 * Create a mock domain provider for testing
 *
 * @param id Domain ID
 * @param overrides Partial properties to override defaults
 * @returns Mock domain provider
 */
export function createMockDomainProvider(
    id: string = 'test-domain',
    overrides?: Partial<DomainProvider>
): DomainProvider {
    return {
        id,
        displayName: `Test Domain ${id}`,
        description: 'Test domain for unit tests',
        isTemplate: true,
        isModified: false,
        modifiable: false,
        getCapabilities: () => [],
        ...overrides
    };
}

/**
 * Create a test workspace URI
 *
 * @param path Optional path (defaults to /tmp/test-workspace)
 * @returns Workspace URI
 */
export function createTestWorkspaceUri(path: string = '/tmp/test-workspace'): URI {
    return new URI(`file://${path}`);
}

/**
 * Create mock project config content
 *
 * @param domainType Domain type identifier
 * @returns JSON string for .quallaa/project-type.json
 */
export function createMockProjectConfig(domainType: string): string {
    return JSON.stringify({
        type: domainType,
        name: 'Test Project',
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        services: {}
    }, null, 2);
}

/**
 * Stub type for ApplicationShell panel handlers
 */
export interface MockPanelHandler {
    expand: sinon.SinonStub;
    collapse: sinon.SinonStub;
}

/**
 * Stub type for ApplicationShell bottom panel
 */
export interface MockBottomPanel {
    show: sinon.SinonStub;
    hide: sinon.SinonStub;
    expanded?: boolean;
}

/**
 * Wait for async operations to complete
 *
 * @param ms Milliseconds to wait
 */
export function wait(ms: number = 10): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Create a promise that resolves after a condition is met
 *
 * @param condition Function that returns true when condition is met
 * @param timeout Maximum time to wait in ms
 * @param interval Check interval in ms
 */
export async function waitForCondition(
    condition: () => boolean,
    timeout: number = 1000,
    interval: number = 10
): Promise<void> {
    const startTime = Date.now();

    while (!condition()) {
        if (Date.now() - startTime > timeout) {
            throw new Error('Timeout waiting for condition');
        }
        await wait(interval);
    }
}
