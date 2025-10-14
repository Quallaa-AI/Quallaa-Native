# Phase 1 Testing Plan - Domain Core

**Date:** 2025-10-14
**Status:** Ready to Execute

---

## Overview

Comprehensive testing strategy for Phase 1 (Foundation) of the Domain UI system. This plan covers unit tests, integration tests, and end-to-end scenarios.

## Testing Philosophy

### Principles
1. **Test behavior, not implementation** - Focus on what components do, not how
2. **Isolation** - Unit tests mock dependencies
3. **Integration** - Integration tests use real Theia infrastructure
4. **Coverage** - Aim for 80%+ code coverage on critical paths
5. **Fast feedback** - Unit tests run in < 1s, integration tests < 10s

### Test Pyramid

```
        /\
       /E2E\         (1-2 tests) - Full application scenarios
      /────\
     /Integ-\        (5-10 tests) - Component interaction
    /────────\
   /Unit Tests\      (20-30 tests) - Individual functions
  /────────────\
```

---

## Test Infrastructure

### Tools & Framework

**Testing Framework:** Mocha (already used by Theia)
**Assertion Library:** Chai
**Mocking:** Sinon
**Coverage:** NYC (already configured)

**Location:** `packages/domain-core/src/browser/test/`

### Test Utilities

Create shared utilities for common test scenarios:

```typescript
// test/test-utilities.ts

import { Container } from '@theia/core/shared/inversify';
import { WorkspaceService } from '@theia/workspace/lib/browser';
import { FileService } from '@theia/filesystem/lib/browser/file-service';
import { ApplicationShell } from '@theia/core/lib/browser';

/**
 * Create a test container with mocked dependencies
 */
export function createTestContainer(): Container {
    const container = new Container();

    // Bind mocks
    container.bind(WorkspaceService).toConstantValue(createMockWorkspaceService());
    container.bind(FileService).toConstantValue(createMockFileService());
    container.bind(ApplicationShell).toConstantValue(createMockApplicationShell());

    return container;
}

/**
 * Create mock workspace service
 */
export function createMockWorkspaceService(): WorkspaceService {
    return {
        workspace: undefined,
        roots: [],
        onWorkspaceChanged: () => ({ dispose: () => {} }),
        onWorkspaceLocationChanged: () => ({ dispose: () => {} }),
        // ... other required methods
    } as any;
}

/**
 * Create mock file service
 */
export function createMockFileService(): FileService {
    const readStub = sinon.stub();
    return {
        read: readStub,
        exists: sinon.stub(),
        // ... other required methods

        // Expose stubs for test assertions
        _readStub: readStub
    } as any;
}

/**
 * Create mock application shell
 */
export function createMockApplicationShell(): ApplicationShell {
    return {
        leftPanelHandler: {
            expand: sinon.stub(),
            collapse: sinon.stub()
        },
        bottomPanel: {
            show: sinon.stub(),
            hide: sinon.stub()
        },
        rightPanelHandler: {
            collapse: sinon.stub()
        }
    } as any;
}

/**
 * Create a mock domain provider for testing
 */
export function createMockDomainProvider(id: string = 'test-domain'): DomainProvider {
    return {
        id,
        displayName: 'Test Domain',
        description: 'Test domain for unit tests',
        isTemplate: true,
        isModified: false,
        modifiable: false,
        getCapabilities: () => []
    };
}

/**
 * Create a temporary workspace URI
 */
export function createTestWorkspaceUri(): URI {
    return new URI('file:///tmp/test-workspace');
}
```

---

## Unit Tests

### 1. DomainRegistry Tests

**File:** `test/domain-registry.spec.ts`

#### Test Suite: Domain Registration

```typescript
describe('DomainRegistry', () => {
    let registry: DomainRegistryImpl;
    let mockContributions: ContributionProvider<DomainContribution>;

    beforeEach(() => {
        mockContributions = {
            getContributions: sinon.stub().returns([])
        } as any;

        registry = new DomainRegistryImpl();
        // Inject mock contributions
        (registry as any).contributions = mockContributions;
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

            expect(registry.getAllDomains()).to.have.length(1);
            expect(registry.getDomain('test-1')).to.equal(domain1);
        });

        it('should warn on duplicate registration', () => {
            const consoleWarn = sinon.stub(console, 'warn');
            const domain = createMockDomainProvider('test-1');

            registry.registerDomain(domain);
            registry.registerDomain(domain);

            expect(consoleWarn).to.have.been.calledOnce;
            consoleWarn.restore();
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
    });

    describe('getTemplateDomains', () => {
        it('should return only template domains', () => {
            const template = createMockDomainProvider('template-1');
            template.isTemplate = true;

            const instance = createMockDomainProvider('instance-1');
            instance.isTemplate = false;

            registry.registerDomain(template);
            registry.registerDomain(instance);

            const result = registry.getTemplateDomains();

            expect(result).to.have.length(1);
            expect(result[0]).to.equal(template);
        });
    });

    describe('getInstanceDomains', () => {
        it('should return only instance domains', () => {
            const template = createMockDomainProvider('template-1');
            template.isTemplate = true;

            const instance = createMockDomainProvider('instance-1');
            instance.isTemplate = false;

            registry.registerDomain(template);
            registry.registerDomain(instance);

            const result = registry.getInstanceDomains();

            expect(result).to.have.length(1);
            expect(result[0]).to.equal(instance);
        });
    });
});
```

**Test Coverage:**
- ✅ Domain registration
- ✅ Duplicate prevention
- ✅ Domain retrieval by ID
- ✅ Template vs. instance filtering
- ✅ Empty state handling

---

### 2. DomainWorkspaceManager Tests

**File:** `test/domain-workspace-manager.spec.ts`

#### Test Suite: Workspace Detection

```typescript
describe('DomainWorkspaceManager', () => {
    let manager: DomainWorkspaceManager;
    let mockWorkspaceService: WorkspaceService;
    let mockFileService: FileService;
    let mockShell: ApplicationShell;
    let mockRegistry: DomainRegistry;

    beforeEach(() => {
        mockWorkspaceService = createMockWorkspaceService();
        mockFileService = createMockFileService();
        mockShell = createMockApplicationShell();
        mockRegistry = {
            getDomain: sinon.stub()
        } as any;

        manager = new DomainWorkspaceManager();
        (manager as any).workspaceService = mockWorkspaceService;
        (manager as any).fileService = mockFileService;
        (manager as any).shell = mockShell;
        (manager as any).registry = mockRegistry;
    });

    describe('detectDomain', () => {
        it('should detect marketing domain from config file', async () => {
            const workspaceUri = createTestWorkspaceUri();
            const configContent = JSON.stringify({ type: 'marketing-automation' });

            mockFileService.read.resolves({ value: configContent });
            mockRegistry.getDomain.withArgs('marketing-automation').returns(
                createMockDomainProvider('marketing-automation')
            );

            const result = await (manager as any).detectDomain(workspaceUri);

            expect(result).to.exist;
            expect(result.id).to.equal('marketing-automation');
        });

        it('should return undefined when config file does not exist', async () => {
            const workspaceUri = createTestWorkspaceUri();

            mockFileService.read.rejects(new Error('File not found'));

            const result = await (manager as any).detectDomain(workspaceUri);

            expect(result).to.be.undefined;
        });

        it('should return undefined when config has no type field', async () => {
            const workspaceUri = createTestWorkspaceUri();
            const configContent = JSON.stringify({ name: 'Test Project' });

            mockFileService.read.resolves({ value: configContent });

            const result = await (manager as any).detectDomain(workspaceUri);

            expect(result).to.be.undefined;
        });

        it('should warn when domain type is unknown', async () => {
            const consoleWarn = sinon.stub(console, 'warn');
            const workspaceUri = createTestWorkspaceUri();
            const configContent = JSON.stringify({ type: 'unknown-domain' });

            mockFileService.read.resolves({ value: configContent });
            mockRegistry.getDomain.returns(undefined);

            await (manager as any).detectDomain(workspaceUri);

            expect(consoleWarn).to.have.been.called;
            consoleWarn.restore();
        });

        it('should handle malformed JSON gracefully', async () => {
            const workspaceUri = createTestWorkspaceUri();

            mockFileService.read.resolves({ value: 'not valid json' });

            const result = await (manager as any).detectDomain(workspaceUri);

            expect(result).to.be.undefined;
        });
    });

    describe('applyDomainLayout', () => {
        it('should collapse left panel', async () => {
            const domain = createMockDomainProvider();

            await (manager as any).applyDomainLayout(domain);

            expect(mockShell.leftPanelHandler.collapse).to.have.been.calledOnce;
        });

        it('should hide bottom panel', async () => {
            const domain = createMockDomainProvider();

            await (manager as any).applyDomainLayout(domain);

            expect(mockShell.bottomPanel.hide).to.have.been.calledOnce;
        });

        it('should collapse right panel if it exists', async () => {
            const domain = createMockDomainProvider();

            await (manager as any).applyDomainLayout(domain);

            expect(mockShell.rightPanelHandler.collapse).to.have.been.calledOnce;
        });

        it('should handle missing right panel gracefully', async () => {
            const domain = createMockDomainProvider();
            mockShell.rightPanelHandler = undefined;

            await expect(
                (manager as any).applyDomainLayout(domain)
            ).to.eventually.be.fulfilled;
        });
    });

    describe('activateStandardIDE', () => {
        it('should expand left panel', async () => {
            await (manager as any).activateStandardIDE();

            expect(mockShell.leftPanelHandler.expand).to.have.been.calledOnce;
        });

        it('should show bottom panel', async () => {
            await (manager as any).activateStandardIDE();

            expect(mockShell.bottomPanel.show).to.have.been.calledOnce;
        });
    });

    describe('handleWorkspaceChange', () => {
        it('should activate domain when workspace has domain config', async () => {
            const workspaceUri = createTestWorkspaceUri();
            const domain = createMockDomainProvider('marketing-automation');

            mockWorkspaceService.workspace = { resource: workspaceUri } as any;
            mockFileService.read.resolves({ value: JSON.stringify({ type: 'marketing-automation' }) });
            mockRegistry.getDomain.returns(domain);

            await (manager as any).handleWorkspaceChange();

            expect((manager as any).activeDomain).to.equal(domain);
        });

        it('should activate standard IDE when no workspace', async () => {
            mockWorkspaceService.workspace = undefined;
            const expandStub = mockShell.leftPanelHandler.expand;

            await (manager as any).handleWorkspaceChange();

            expect((manager as any).activeDomain).to.be.undefined;
            expect(expandStub).to.not.have.been.called; // Already deactivated
        });

        it('should activate standard IDE when no domain detected', async () => {
            const workspaceUri = createTestWorkspaceUri();

            mockWorkspaceService.workspace = { resource: workspaceUri } as any;
            mockFileService.read.rejects(new Error('File not found'));

            await (manager as any).handleWorkspaceChange();

            expect((manager as any).activeDomain).to.be.undefined;
            expect(mockShell.leftPanelHandler.expand).to.have.been.calledOnce;
        });
    });

    describe('getActiveDomain', () => {
        it('should return active domain', () => {
            const domain = createMockDomainProvider();
            (manager as any).activeDomain = domain;

            expect(manager.getActiveDomain()).to.equal(domain);
        });

        it('should return undefined when no domain active', () => {
            expect(manager.getActiveDomain()).to.be.undefined;
        });
    });
});
```

**Test Coverage:**
- ✅ Config file detection
- ✅ Domain matching
- ✅ Panel management
- ✅ Error handling (missing files, malformed JSON)
- ✅ Edge cases (no workspace, unknown domains)

---

### 3. DomainCommandContribution Tests

**File:** `test/domain-commands.spec.ts`

```typescript
describe('DomainCommandContribution', () => {
    let contribution: DomainCommandContribution;
    let mockShell: ApplicationShell;
    let mockRegistry: CommandRegistry;

    beforeEach(() => {
        mockShell = createMockApplicationShell();
        mockRegistry = {
            registerCommand: sinon.stub()
        } as any;

        contribution = new DomainCommandContribution();
        (contribution as any).shell = mockShell;
    });

    describe('registerCommands', () => {
        it('should register show command', () => {
            contribution.registerCommands(mockRegistry);

            expect(mockRegistry.registerCommand).to.have.been.calledWith(
                sinon.match({ id: 'domain.showIDEPanels' })
            );
        });

        it('should register hide command', () => {
            contribution.registerCommands(mockRegistry);

            expect(mockRegistry.registerCommand).to.have.been.calledWith(
                sinon.match({ id: 'domain.hideIDEPanels' })
            );
        });

        it('should register toggle command', () => {
            contribution.registerCommands(mockRegistry);

            expect(mockRegistry.registerCommand).to.have.been.calledWith(
                sinon.match({ id: 'domain.toggleIDEPanels' })
            );
        });
    });

    describe('showIDEPanels', () => {
        it('should expand left panel', () => {
            (contribution as any).showIDEPanels();

            expect(mockShell.leftPanelHandler.expand).to.have.been.calledOnce;
        });

        it('should show bottom panel', () => {
            (contribution as any).showIDEPanels();

            expect(mockShell.bottomPanel.show).to.have.been.calledOnce;
        });

        it('should set panelsVisible flag', () => {
            (contribution as any).showIDEPanels();

            expect((contribution as any).panelsVisible).to.be.true;
        });
    });

    describe('hideIDEPanels', () => {
        it('should collapse left panel', () => {
            (contribution as any).hideIDEPanels();

            expect(mockShell.leftPanelHandler.collapse).to.have.been.calledOnce;
        });

        it('should hide bottom panel', () => {
            (contribution as any).hideIDEPanels();

            expect(mockShell.bottomPanel.hide).to.have.been.calledOnce;
        });

        it('should clear panelsVisible flag', () => {
            (contribution as any).panelsVisible = true;
            (contribution as any).hideIDEPanels();

            expect((contribution as any).panelsVisible).to.be.false;
        });
    });

    describe('toggleIDEPanels', () => {
        it('should hide panels when currently visible', () => {
            (contribution as any).panelsVisible = true;
            const hideStub = sinon.stub(contribution as any, 'hideIDEPanels');

            (contribution as any).toggleIDEPanels();

            expect(hideStub).to.have.been.calledOnce;
        });

        it('should show panels when currently hidden', () => {
            (contribution as any).panelsVisible = false;
            const showStub = sinon.stub(contribution as any, 'showIDEPanels');

            (contribution as any).toggleIDEPanels();

            expect(showStub).to.have.been.calledOnce;
        });
    });
});
```

**Test Coverage:**
- ✅ Command registration
- ✅ Panel show/hide operations
- ✅ Toggle logic
- ✅ State tracking

---

## Integration Tests

### 4. Workspace Detection Integration

**File:** `test/workspace-detection.integration.spec.ts`

```typescript
describe('Workspace Detection Integration', () => {
    let container: Container;
    let workspaceService: WorkspaceService;
    let fileService: FileService;
    let manager: DomainWorkspaceManager;
    let registry: DomainRegistry;

    beforeEach(async () => {
        // Create container with real services
        container = new Container();
        // ... bind real services (not mocks)

        workspaceService = container.get(WorkspaceService);
        fileService = container.get(FileService);
        manager = container.get(DomainWorkspaceManager);
        registry = container.get(DomainRegistry);
    });

    it('should detect marketing domain in real workspace', async () => {
        // Create temporary workspace
        const workspacePath = '/tmp/test-marketing-project';
        await fileService.createFolder(new URI(`file://${workspacePath}`));
        await fileService.createFolder(new URI(`file://${workspacePath}/.quallaa`));
        await fileService.create(
            new URI(`file://${workspacePath}/.quallaa/project-type.json`),
            JSON.stringify({ type: 'marketing-automation' })
        );

        // Register test domain
        const testDomain = createMockDomainProvider('marketing-automation');
        registry.registerDomain(testDomain);

        // Open workspace
        await workspaceService.open(new URI(`file://${workspacePath}`));

        // Wait for detection
        await new Promise(resolve => setTimeout(resolve, 100));

        // Verify domain activated
        expect(manager.getActiveDomain()).to.equal(testDomain);

        // Cleanup
        await fileService.delete(new URI(`file://${workspacePath}`), { recursive: true });
    });
});
```

---

## Test Execution

### Running Tests

```bash
# Run all tests in domain-core
cd packages/domain-core
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- --grep "DomainRegistry"

# Watch mode during development
npm run test:watch
```

### Expected Output

```
  DomainRegistry
    registerDomain
      ✓ should register a new domain
      ✓ should not register duplicate domain IDs
      ✓ should warn on duplicate registration
    getDomain
      ✓ should return domain by ID
      ✓ should return undefined for non-existent domain
    getAllDomains
      ✓ should return empty array when no domains registered
      ✓ should return all registered domains
    getTemplateDomains
      ✓ should return only template domains
    getInstanceDomains
      ✓ should return only instance domains

  DomainWorkspaceManager
    detectDomain
      ✓ should detect marketing domain from config file
      ✓ should return undefined when config file does not exist
      ✓ should return undefined when config has no type field
      ✓ should warn when domain type is unknown
      ✓ should handle malformed JSON gracefully
    applyDomainLayout
      ✓ should collapse left panel
      ✓ should hide bottom panel
      ✓ should collapse right panel if it exists
      ✓ should handle missing right panel gracefully
    activateStandardIDE
      ✓ should expand left panel
      ✓ should show bottom panel
    handleWorkspaceChange
      ✓ should activate domain when workspace has domain config
      ✓ should activate standard IDE when no workspace
      ✓ should activate standard IDE when no domain detected
    getActiveDomain
      ✓ should return active domain
      ✓ should return undefined when no domain active

  DomainCommandContribution
    registerCommands
      ✓ should register show command
      ✓ should register hide command
      ✓ should register toggle command
    showIDEPanels
      ✓ should expand left panel
      ✓ should show bottom panel
      ✓ should set panelsVisible flag
    hideIDEPanels
      ✓ should collapse left panel
      ✓ should hide bottom panel
      ✓ should clear panelsVisible flag
    toggleIDEPanels
      ✓ should hide panels when currently visible
      ✓ should show panels when currently hidden

  36 passing (245ms)
```

---

## Coverage Goals

| Component | Target Coverage | Priority |
|-----------|----------------|----------|
| DomainRegistry | 95%+ | High |
| DomainWorkspaceManager | 85%+ | High |
| DomainCommandContribution | 90%+ | High |
| Test utilities | 70%+ | Medium |

---

## CI Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/test-domain-core.yml
name: Test Domain Core

on:
  pull_request:
    paths:
      - 'packages/domain-core/**'
  push:
    branches:
      - master
      - feature/**

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '20.x'

      - name: Install dependencies
        run: npm install

      - name: Compile domain-core
        run: |
          cd packages/domain-core
          npm run compile

      - name: Run tests
        run: |
          cd packages/domain-core
          npm test

      - name: Check coverage
        run: |
          cd packages/domain-core
          npm run test:coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./packages/domain-core/coverage/lcov.info
```

---

## Next Steps

1. ✅ Create test utilities (`test/test-utilities.ts`)
2. ✅ Write unit tests for DomainRegistry
3. ✅ Write unit tests for DomainWorkspaceManager
4. ✅ Write unit tests for DomainCommandContribution
5. ✅ Run tests and verify coverage
6. ✅ Fix any failing tests
7. ✅ Document test patterns for Phase 2 & 3

Ready to implement these tests!
