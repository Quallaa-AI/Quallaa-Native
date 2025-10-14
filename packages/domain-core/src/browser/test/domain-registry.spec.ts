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

import { expect } from 'chai';
import { DomainRegistryImpl } from '../domain-registry';
import { createMockDomainProvider } from './test-utilities';
import { ContributionProvider } from '@theia/core';

describe('DomainRegistry', () => {
    let registry: DomainRegistryImpl;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let mockContributions: ContributionProvider<any>;

    beforeEach(() => {
        // Create mock contribution provider
        mockContributions = {
            getContributions: () => []
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any;

        // Create registry instance
        registry = new DomainRegistryImpl();

        // Inject mock contributions and initialize
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (registry as any).contributions = mockContributions;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (registry as any).init();
    });

    describe('registerDomain', () => {
        it('should register a new domain', () => {
            const domain = createMockDomainProvider('test-1');

            registry.registerDomain(domain);

            expect(registry.getDomain('test-1')).to.equal(domain);
        });

        it('should not register duplicate domain IDs', () => {
            const domain1 = createMockDomainProvider('test-1');
            const domain2 = createMockDomainProvider('test-1');

            registry.registerDomain(domain1);
            registry.registerDomain(domain2);

            const allDomains = registry.getAllDomains();
            expect(allDomains).to.have.length(1);
            expect(registry.getDomain('test-1')).to.equal(domain1);
        });

        it('should register multiple domains with different IDs', () => {
            const domain1 = createMockDomainProvider('test-1');
            const domain2 = createMockDomainProvider('test-2');
            const domain3 = createMockDomainProvider('test-3');

            registry.registerDomain(domain1);
            registry.registerDomain(domain2);
            registry.registerDomain(domain3);

            expect(registry.getAllDomains()).to.have.length(3);
        });
    });

    describe('getDomain', () => {
        it('should return domain by ID', () => {
            const domain = createMockDomainProvider('test-1');
            registry.registerDomain(domain);

            const result = registry.getDomain('test-1');

            expect(result).to.equal(domain);
        });

        it('should return undefined for non-existent domain', () => {
            const result = registry.getDomain('non-existent');

            expect(result).to.be.undefined;
        });

        it('should return correct domain when multiple registered', () => {
            const domain1 = createMockDomainProvider('test-1');
            const domain2 = createMockDomainProvider('test-2');
            const domain3 = createMockDomainProvider('test-3');

            registry.registerDomain(domain1);
            registry.registerDomain(domain2);
            registry.registerDomain(domain3);

            expect(registry.getDomain('test-2')).to.equal(domain2);
        });
    });

    describe('getAllDomains', () => {
        it('should return empty array when no domains registered', () => {
            expect(registry.getAllDomains()).to.be.empty;
        });

        it('should return all registered domains', () => {
            const domain1 = createMockDomainProvider('test-1');
            const domain2 = createMockDomainProvider('test-2');

            registry.registerDomain(domain1);
            registry.registerDomain(domain2);

            const result = registry.getAllDomains();

            expect(result).to.have.length(2);
            expect(result).to.include(domain1);
            expect(result).to.include(domain2);
        });

        it('should return new array instance on each call', () => {
            const domain = createMockDomainProvider('test-1');
            registry.registerDomain(domain);

            const result1 = registry.getAllDomains();
            const result2 = registry.getAllDomains();

            expect(result1).to.not.equal(result2); // Different array instances
            expect(result1).to.deep.equal(result2); // But same content
        });
    });

    describe('getTemplateDomains', () => {
        it('should return empty array when no domains registered', () => {
            expect(registry.getTemplateDomains()).to.be.empty;
        });

        it('should return only template domains', () => {
            const template1 = createMockDomainProvider('template-1', { isTemplate: true });
            const template2 = createMockDomainProvider('template-2', { isTemplate: true });
            const instance1 = createMockDomainProvider('instance-1', { isTemplate: false });
            const instance2 = createMockDomainProvider('instance-2', { isTemplate: false });

            registry.registerDomain(template1);
            registry.registerDomain(instance1);
            registry.registerDomain(template2);
            registry.registerDomain(instance2);

            const result = registry.getTemplateDomains();

            expect(result).to.have.length(2);
            expect(result).to.include(template1);
            expect(result).to.include(template2);
            expect(result).to.not.include(instance1);
            expect(result).to.not.include(instance2);
        });

        it('should return all domains when all are templates', () => {
            const template1 = createMockDomainProvider('template-1', { isTemplate: true });
            const template2 = createMockDomainProvider('template-2', { isTemplate: true });

            registry.registerDomain(template1);
            registry.registerDomain(template2);

            const result = registry.getTemplateDomains();

            expect(result).to.have.length(2);
        });

        it('should return empty array when only instances registered', () => {
            const instance1 = createMockDomainProvider('instance-1', { isTemplate: false });
            const instance2 = createMockDomainProvider('instance-2', { isTemplate: false });

            registry.registerDomain(instance1);
            registry.registerDomain(instance2);

            const result = registry.getTemplateDomains();

            expect(result).to.be.empty;
        });
    });

    describe('getInstanceDomains', () => {
        it('should return empty array when no domains registered', () => {
            expect(registry.getInstanceDomains()).to.be.empty;
        });

        it('should return only instance domains', () => {
            const template1 = createMockDomainProvider('template-1', { isTemplate: true });
            const template2 = createMockDomainProvider('template-2', { isTemplate: true });
            const instance1 = createMockDomainProvider('instance-1', { isTemplate: false });
            const instance2 = createMockDomainProvider('instance-2', { isTemplate: false });

            registry.registerDomain(template1);
            registry.registerDomain(instance1);
            registry.registerDomain(template2);
            registry.registerDomain(instance2);

            const result = registry.getInstanceDomains();

            expect(result).to.have.length(2);
            expect(result).to.include(instance1);
            expect(result).to.include(instance2);
            expect(result).to.not.include(template1);
            expect(result).to.not.include(template2);
        });

        it('should return all domains when all are instances', () => {
            const instance1 = createMockDomainProvider('instance-1', { isTemplate: false });
            const instance2 = createMockDomainProvider('instance-2', { isTemplate: false });

            registry.registerDomain(instance1);
            registry.registerDomain(instance2);

            const result = registry.getInstanceDomains();

            expect(result).to.have.length(2);
        });

        it('should return empty array when only templates registered', () => {
            const template1 = createMockDomainProvider('template-1', { isTemplate: true });
            const template2 = createMockDomainProvider('template-2', { isTemplate: true });

            registry.registerDomain(template1);
            registry.registerDomain(template2);

            const result = registry.getInstanceDomains();

            expect(result).to.be.empty;
        });
    });

    describe('initialization', () => {
        it('should call contributions on init', () => {
            const contribution1 = {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                registerDomain: (reg: any) => {
                    reg.registerDomain(createMockDomainProvider('from-contribution-1'));
                }
            };
            const contribution2 = {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                registerDomain: (reg: any) => {
                    reg.registerDomain(createMockDomainProvider('from-contribution-2'));
                }
            };

            const mockContribs = {
                getContributions: () => [contribution1, contribution2]
            };

            const newRegistry = new DomainRegistryImpl();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (newRegistry as any).contributions = mockContribs;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (newRegistry as any).init();

            expect(newRegistry.getAllDomains()).to.have.length(2);
            expect(newRegistry.getDomain('from-contribution-1')).to.exist;
            expect(newRegistry.getDomain('from-contribution-2')).to.exist;
        });
    });
});
