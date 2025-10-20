# First Tiny Step: Domain Abstraction Foundation

**Project Plan v1.0**
**Created:** 2025-10-10
**Estimated Duration:** 2-4 hours (single focused session)
**Outcome:** Elegant, robust foundation for AI-modifiable domains

---

## Vision

Create the **minimal viable domain abstraction** that proves the pattern works while setting an elegant foundation for everything that follows. This is not a prototype - it's production-quality foundational code that will be built upon, not replaced.

**What Success Looks Like:**
```typescript
// Marketing domain can register itself
const marketing = new MarketingDomain();
registry.registerDomain(marketing);

// Core platform can query capabilities
const capabilities = marketing.getCapabilities(); // ['campaign-management']

// AI knows where to edit
const paths = marketing.getSourcePaths(); // { widgets: '...', services: '...' }

// System tracks customizations
const customizations = marketing.getCustomizations(); // []

console.log('Domain abstraction is alive!');
```

---

## Scope

### In Scope (Tiny)
✅ TypeScript interfaces for domain abstraction
✅ Domain registry implementation
✅ Dummy marketing domain (proves pattern)
✅ Integration with Theia's DI system
✅ Comprehensive JSDoc documentation
✅ Type safety throughout

### Out of Scope (For Later)
❌ Actual marketing widgets (dummy placeholder only)
❌ Database provisioning
❌ AI integration
❌ Domain instance creation workflow
❌ Customization tracking persistence
❌ Template copying logic

**Philosophy:** Build the skeleton perfectly. Flesh comes later.

---

## Architecture

### Package Structure

```
packages/domain-core/
├── package.json
├── tsconfig.json
├── src/
│   ├── common/
│   │   ├── domain-protocol.ts         # Core interfaces
│   │   ├── domain-capability.ts       # Capability definitions
│   │   └── domain-service-config.ts   # Service configuration types
│   ├── browser/
│   │   ├── domain-registry.ts         # Registry implementation
│   │   └── domain-frontend-module.ts  # Theia DI bindings
│   └── node/
│       └── domain-backend-module.ts   # Backend DI bindings (future)
```

```
packages/marketing-domain/
├── package.json
├── tsconfig.json
├── src/
│   ├── common/
│   │   └── marketing-protocol.ts      # Marketing-specific types
│   └── browser/
│       ├── marketing-domain-provider.ts  # DomainProvider implementation
│       └── marketing-frontend-module.ts  # Theia DI bindings
```

### Core Interfaces

```typescript
// packages/domain-core/src/common/domain-protocol.ts

/**
 * Core abstraction for all Quallaa domains.
 *
 * Domains can be:
 * 1. Templates (base definitions maintained in monorepo)
 * 2. User instances (copied to user's project, AI-modifiable)
 *
 * This interface supports the Template → Instance → Customization lifecycle.
 */
export interface DomainProvider {
  /** Unique identifier (e.g., 'marketing-automation') */
  readonly id: string;

  /** Human-readable name (e.g., 'Marketing Automation') */
  readonly displayName: string;

  /** Optional description */
  readonly description?: string;

  /** Is this a template or a user's instance? */
  readonly isTemplate: boolean;

  /** If instance, which template is it based on? */
  readonly baseTemplate?: {
    id: string;
    version: string;
  };

  /** Has this instance been modified by AI? */
  readonly isModified: boolean;

  /** Can AI modify this domain? (templates: false, instances: true) */
  readonly modifiable: boolean;

  /**
   * Get current capabilities.
   * For templates: fixed set
   * For instances: may evolve as AI modifies domain
   */
  getCapabilities(): DomainCapability[];

  /**
   * Register new capability (AI-driven)
   * Only valid for modifiable instances
   */
  registerCapability?(capability: DomainCapability): void;

  /**
   * Unregister capability (AI-driven)
   * Only valid for modifiable instances
   */
  unregisterCapability?(capabilityId: string): void;

  /**
   * Get source paths where AI can modify code.
   * Only meaningful for modifiable instances.
   */
  getSourcePaths?(): DomainSourcePaths;

  /**
   * Get infrastructure services this domain requires.
   */
  getServices?(): DomainServiceConfig[];

  /**
   * Get customization history (what AI has modified)
   */
  getCustomizations?(): DomainCustomization[];

  /**
   * Record a customization (called after AI modifies domain)
   */
  recordCustomization?(customization: DomainCustomization): void;
}

/**
 * Describes a domain capability.
 */
export interface DomainCapability {
  id: string;
  displayName: string;
  description: string;

  /** How was this capability added? */
  source: 'template' | 'user-customization';

  /** When was it added (undefined for template capabilities) */
  addedAt?: Date;
}

/**
 * Source code locations where AI can modify files.
 */
export interface DomainSourcePaths {
  /** Directory for widgets/UI components */
  widgets?: string;

  /** Directory for backend services */
  services?: string;

  /** Directory for database migrations */
  migrations?: string;

  /** Path to TypeScript interfaces file */
  interfaces?: string;

  /** Path to AI tools definitions */
  aiTools?: string;

  /** Paths that are readonly (can read but not modify) */
  readonly?: string[];
}

/**
 * Infrastructure service configuration.
 */
export interface DomainServiceConfig {
  type: 'database' | 'api' | 'file-system' | 'queue' | 'cache' | 'runtime';
  provider: string;  // 'postgresql', 'resend', 'redis', etc.
  config: Record<string, any>;
  required: boolean;
}

/**
 * Record of AI modification to domain.
 */
export interface DomainCustomization {
  timestamp: Date;
  description: string;
  userCommand: string;
  filesModified: string[];
  capabilitiesAdded: string[];
  capabilitiesRemoved: string[];
  aiModel: string;
  tokensUsed: number;
}

/**
 * Contribution point for domains to register themselves.
 * Follows Theia's contribution pattern.
 */
export const DomainContribution = Symbol('DomainContribution');

export interface DomainContribution {
  registerDomain(registry: DomainRegistry): void;
}

/**
 * Central registry of all domains.
 */
export interface DomainRegistry {
  /**
   * Register a domain provider.
   */
  registerDomain(provider: DomainProvider): void;

  /**
   * Get domain by ID.
   */
  getDomain(id: string): DomainProvider | undefined;

  /**
   * Get all registered domains.
   */
  getAllDomains(): DomainProvider[];

  /**
   * Get only template domains.
   */
  getTemplateDomains(): DomainProvider[];

  /**
   * Get only user instance domains.
   */
  getInstanceDomains(): DomainProvider[];
}

// Symbol for DI
export const DomainProvider = Symbol('DomainProvider');
export const DomainRegistry = Symbol('DomainRegistry');
```

---

## Implementation Steps

### Step 1: Create Package Structure (15 minutes)

**Tasks:**
1. Create `packages/domain-core/` directory
2. Create `packages/marketing-domain/` directory
3. Set up package.json for both packages
4. Set up tsconfig.json (extending @theia config)
5. Create src/ directory structure

**Validation:**
- `npx lerna list` shows both new packages
- TypeScript can compile (even if empty)

**Commands:**
```bash
mkdir -p packages/domain-core/src/{common,browser,node}
mkdir -p packages/marketing-domain/src/{common,browser}

# Create package.json files
# Create tsconfig.json files
# Run lerna bootstrap

npm install
npx lerna bootstrap
```

### Step 2: Define Core Interfaces (30 minutes)

**Tasks:**
1. Create `domain-protocol.ts` with all interfaces
2. Create `domain-capability.ts` for capability types
3. Create `domain-service-config.ts` for service types
4. Add comprehensive JSDoc comments
5. Export all from `common/index.ts`

**Validation:**
- TypeScript compiles without errors
- All types are properly exported
- JSDoc appears in IDE hover tooltips

**Quality Bar:**
- Every interface has JSDoc with description
- Every property has inline comment
- Examples provided in JSDoc where helpful
- No `any` types (use `unknown` or specific types)

### Step 3: Implement Domain Registry (30 minutes)

**Tasks:**
1. Create `DomainRegistryImpl` class
2. Use Theia's `@injectable()` decorator
3. Implement all `DomainRegistry` methods
4. Add contribution provider pattern
5. Add logging (console.log for now)

**Implementation:**
```typescript
// packages/domain-core/src/browser/domain-registry.ts

import { injectable, inject, postConstruct, named } from '@theia/core/shared/inversify';
import { ContributionProvider } from '@theia/core';
import { DomainProvider, DomainRegistry, DomainContribution } from '../common';

@injectable()
export class DomainRegistryImpl implements DomainRegistry {
  private domains = new Map<string, DomainProvider>();

  @inject(ContributionProvider)
  @named(DomainContribution)
  protected readonly contributions: ContributionProvider<DomainContribution>;

  @postConstruct()
  protected init(): void {
    // Ask all contributions to register their domains
    this.contributions.getContributions().forEach(contrib => {
      contrib.registerDomain(this);
    });

    console.log(`[Quallaa] Domain registry initialized with ${this.domains.size} domains`);
  }

  registerDomain(provider: DomainProvider): void {
    if (this.domains.has(provider.id)) {
      console.warn(`[Quallaa] Domain already registered: ${provider.id}`);
      return;
    }

    this.domains.set(provider.id, provider);
    console.log(`[Quallaa] Registered domain: ${provider.displayName} (${provider.id})`);
  }

  getDomain(id: string): DomainProvider | undefined {
    return this.domains.get(id);
  }

  getAllDomains(): DomainProvider[] {
    return Array.from(this.domains.values());
  }

  getTemplateDomains(): DomainProvider[] {
    return this.getAllDomains().filter(d => d.isTemplate);
  }

  getInstanceDomains(): DomainProvider[] {
    return this.getAllDomains().filter(d => !d.isTemplate);
  }
}
```

**Validation:**
- Registry initializes on app startup
- Can register and retrieve domains
- Contribution pattern works

### Step 4: Create Theia DI Module (20 minutes)

**Tasks:**
1. Create `domain-frontend-module.ts`
2. Bind registry implementation
3. Set up contribution provider

**Implementation:**
```typescript
// packages/domain-core/src/browser/domain-frontend-module.ts

import { ContainerModule } from '@theia/core/shared/inversify';
import { DomainRegistry, DomainContribution } from '../common';
import { DomainRegistryImpl } from './domain-registry';
import { bindContributionProvider } from '@theia/core';

export default new ContainerModule(bind => {
  // Bind registry as singleton
  bind(DomainRegistry).to(DomainRegistryImpl).inSingletonScope();

  // Set up contribution provider for domains
  bindContributionProvider(bind, DomainContribution);
});
```

**Validation:**
- Module loads in Theia application
- Registry is injectable
- No DI errors on startup

### Step 5: Implement Dummy Marketing Domain (30 minutes)

**Tasks:**
1. Create `MarketingDomainProvider` class
2. Implement all required `DomainProvider` methods
3. Return hardcoded placeholder data
4. Create contribution to register domain

**Implementation:**
```typescript
// packages/marketing-domain/src/browser/marketing-domain-provider.ts

import { injectable } from '@theia/core/shared/inversify';
import {
  DomainProvider,
  DomainCapability,
  DomainServiceConfig,
  DomainSourcePaths,
  DomainCustomization
} from '@quallaa/domain-core';

@injectable()
export class MarketingDomainProvider implements DomainProvider {
  readonly id = 'marketing-automation';
  readonly displayName = 'Marketing Automation';
  readonly description = 'Email campaigns, audience segmentation, and analytics';
  readonly isTemplate = true;  // This is the base template
  readonly isModified = false;
  readonly modifiable = false; // Templates are not modifiable

  getCapabilities(): DomainCapability[] {
    return [
      {
        id: 'campaign-management',
        displayName: 'Campaign Management',
        description: 'Create and manage email campaigns',
        source: 'template'
      },
      {
        id: 'email-automation',
        displayName: 'Email Automation',
        description: 'Automated email sequences and triggers',
        source: 'template'
      },
      {
        id: 'audience-segmentation',
        displayName: 'Audience Segmentation',
        description: 'Segment customers by behavior and attributes',
        source: 'template'
      }
    ];
  }

  getServices(): DomainServiceConfig[] {
    return [
      {
        type: 'database',
        provider: 'postgresql',
        required: true,
        config: {
          schema: 'marketing',
          tables: ['customers', 'campaigns', 'segments', 'analytics']
        }
      },
      {
        type: 'api',
        provider: 'resend',
        required: true,
        config: {
          purpose: 'email-delivery',
          requiresApiKey: true
        }
      },
      {
        type: 'file-system',
        provider: 'local-fs',
        required: true,
        config: {
          root: 'templates/',
          watchPatterns: ['*.email.tsx', '*.landing.tsx']
        }
      }
    ];
  }

  getSourcePaths(): DomainSourcePaths {
    // For templates, these are reference paths
    return {
      widgets: 'src/browser/widgets/',
      services: 'src/node/services/',
      migrations: 'src/node/migrations/',
      interfaces: 'src/common/protocol.ts',
      aiTools: 'src/common/ai-tools.ts',
      readonly: ['src/browser/marketing-frontend-module.ts']
    };
  }

  getCustomizations(): DomainCustomization[] {
    // Templates have no customizations
    return [];
  }
}
```

```typescript
// packages/marketing-domain/src/browser/marketing-frontend-module.ts

import { ContainerModule } from '@theia/core/shared/inversify';
import { DomainContribution } from '@quallaa/domain-core';
import { MarketingDomainProvider } from './marketing-domain-provider';

export default new ContainerModule(bind => {
  // Bind marketing domain
  bind(MarketingDomainProvider).toSelf().inSingletonScope();

  // Register as contribution
  bind(DomainContribution).toDynamicValue(ctx => ({
    registerDomain: (registry) => {
      const provider = ctx.container.get(MarketingDomainProvider);
      registry.registerDomain(provider);
    }
  }));
});
```

**Validation:**
- Marketing domain registers on startup
- Console shows registration log
- Can retrieve marketing domain from registry

### Step 6: Wire Into Electron/Browser Applications (20 minutes)

**Tasks:**
1. Add dependencies to electron example
2. Add dependencies to browser example
3. Import modules in application
4. Verify loading

**package.json updates:**
```json
// examples/electron/package.json
{
  "dependencies": {
    "@quallaa/domain-core": "1.0.0",
    "@quallaa/marketing-domain": "1.0.0"
  }
}
```

**Application import:**
```typescript
// examples/electron/src/browser/frontend-module.ts
import domainCoreModule from '@quallaa/domain-core/lib/browser/domain-frontend-module';
import marketingDomainModule from '@quallaa/marketing-domain/lib/browser/marketing-frontend-module';

export default new ContainerModule((bind, unbind, isBound, rebind) => {
  // ... existing bindings
});

// Add to imports in theia-config
```

**Validation:**
- Electron app starts without errors
- Console shows domain registration logs
- Can inject DomainRegistry in command handler

### Step 7: Create Validation Command (15 minutes)

**Tasks:**
1. Create simple command to test registry
2. Log domain info to console
3. Bind command in module

**Implementation:**
```typescript
// packages/domain-core/src/browser/domain-test-command.ts

import { Command, CommandContribution, CommandRegistry } from '@theia/core';
import { inject, injectable } from '@theia/core/shared/inversify';
import { DomainRegistry } from '../common';

export const TEST_DOMAIN_COMMAND: Command = {
  id: 'quallaa.test-domains',
  label: 'Quallaa: Test Domain Registry'
};

@injectable()
export class DomainTestCommandContribution implements CommandContribution {
  @inject(DomainRegistry)
  protected readonly domainRegistry: DomainRegistry;

  registerCommands(registry: CommandRegistry): void {
    registry.registerCommand(TEST_DOMAIN_COMMAND, {
      execute: () => {
        console.log('=== Quallaa Domain Registry Test ===');

        const domains = this.domainRegistry.getAllDomains();
        console.log(`Total domains: ${domains.length}`);

        domains.forEach(domain => {
          console.log('\n---');
          console.log(`ID: ${domain.id}`);
          console.log(`Name: ${domain.displayName}`);
          console.log(`Description: ${domain.description}`);
          console.log(`Is Template: ${domain.isTemplate}`);
          console.log(`Modifiable: ${domain.modifiable}`);

          const capabilities = domain.getCapabilities();
          console.log(`Capabilities (${capabilities.length}):`);
          capabilities.forEach(cap => {
            console.log(`  - ${cap.displayName}: ${cap.description}`);
          });

          const services = domain.getServices?.();
          if (services) {
            console.log(`Services (${services.length}):`);
            services.forEach(svc => {
              console.log(`  - ${svc.type}: ${svc.provider} (required: ${svc.required})`);
            });
          }
        });

        console.log('\n=== End Test ===');
      }
    });
  }
}
```

**Bind in module:**
```typescript
bind(CommandContribution).to(DomainTestCommandContribution);
```

**Validation:**
- Command appears in command palette
- Running command logs all domain info
- No errors

### Step 8: Documentation & Polish (20 minutes)

**Tasks:**
1. Create README.md for domain-core package
2. Create README.md for marketing-domain package
3. Add inline code comments
4. Ensure all exports are documented

**domain-core README.md:**
```markdown
# @quallaa/domain-core

Core domain abstraction for Quallaa.

## Overview

This package provides the foundational interfaces and registry for Quallaa's domain system.

Domains in Quallaa are AI-modifiable scaffolding that provide:
- Base capabilities (templates)
- User customization (instances)
- Infrastructure orchestration (databases, APIs, services)

## Architecture

### Core Concepts

**DomainProvider**: Interface all domains must implement
**DomainRegistry**: Central registry managing all domains
**DomainContribution**: Contribution point for domains to self-register

### Template vs. Instance

- **Templates**: Base domain definitions (not modifiable)
- **Instances**: User's copy of template (AI can modify)

## Usage

### Creating a Domain

See `@quallaa/marketing-domain` for reference implementation.

### Registering a Domain

Domains register via contribution point:

```typescript
bind(DomainContribution).toDynamicValue(ctx => ({
  registerDomain: (registry) => {
    const provider = ctx.container.get(YourDomainProvider);
    registry.registerDomain(provider);
  }
}));
```

### Querying Domains

```typescript
@inject(DomainRegistry)
protected readonly domainRegistry: DomainRegistry;

const marketing = this.domainRegistry.getDomain('marketing-automation');
const capabilities = marketing.getCapabilities();
```

## See Also

- `docs/architecture/domain-abstraction-principles.md` - Detailed architecture
- `@quallaa/marketing-domain` - Example implementation
```

**Validation:**
- READMEs are clear and helpful
- Code is well-commented
- Package exports are clean

---

## Testing Strategy

### Manual Testing Checklist

- [ ] Application starts without errors
- [ ] Domain registry initializes
- [ ] Marketing domain registers
- [ ] Test command shows correct info
- [ ] Can inject DomainRegistry in other services
- [ ] TypeScript compilation has no errors
- [ ] No console warnings or errors

### Validation Script

Create a test that validates the entire flow:

```typescript
// packages/domain-core/test/domain-registry.spec.ts

import { expect } from 'chai';
import { Container } from 'inversify';
import { DomainRegistry, DomainProvider, DomainContribution } from '../src/common';
import { DomainRegistryImpl } from '../src/browser/domain-registry';

describe('DomainRegistry', () => {
  let container: Container;
  let registry: DomainRegistry;

  beforeEach(() => {
    container = new Container();
    container.bind(DomainRegistry).to(DomainRegistryImpl);
    registry = container.get(DomainRegistry);
  });

  it('should register domains', () => {
    const mockDomain: DomainProvider = {
      id: 'test-domain',
      displayName: 'Test Domain',
      isTemplate: true,
      isModified: false,
      modifiable: false,
      getCapabilities: () => []
    };

    registry.registerDomain(mockDomain);

    const retrieved = registry.getDomain('test-domain');
    expect(retrieved).to.equal(mockDomain);
  });

  it('should list all domains', () => {
    // ... similar tests
  });

  it('should filter templates vs instances', () => {
    // ... test getTemplateDomains() and getInstanceDomains()
  });
});
```

---

## Quality Checklist

Before considering this step complete:

### Code Quality
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] All public APIs have JSDoc
- [ ] Code follows Theia conventions
- [ ] Proper use of dependency injection
- [ ] No hardcoded strings (use constants)

### Functionality
- [ ] Registry initializes correctly
- [ ] Domains register via contribution
- [ ] Can query domains by ID
- [ ] Can list all/template/instance domains
- [ ] Marketing domain provides realistic data

### Documentation
- [ ] README.md for both packages
- [ ] Inline comments for complex logic
- [ ] JSDoc for all interfaces
- [ ] Examples in documentation
- [ ] References to architecture docs

### Integration
- [ ] Works in Electron app
- [ ] Works in Browser app
- [ ] No dependency conflicts
- [ ] Modules load in correct order
- [ ] Console logs are informative

### Future-Proofing
- [ ] Interfaces support modifiability
- [ ] Optional methods use `?:` syntax
- [ ] Clear distinction template vs instance
- [ ] Extensible (can add more domains)
- [ ] No assumptions about specific domains

---

## Success Metrics

You'll know this step is complete when:

1. **You can run the test command** and see marketing domain info
2. **Marketing domain declares** 3 capabilities, 3 services
3. **Registry shows** "Registered domain: Marketing Automation"
4. **TypeScript compilation** has zero errors
5. **Another developer** could create a new domain using marketing as reference
6. **The code feels elegant** - you're proud to show it to someone

---

## Timeline

**Total Estimated Time: 2-4 hours**

| Step | Task | Time | Cumulative |
|------|------|------|------------|
| 1 | Package structure | 15min | 15min |
| 2 | Core interfaces | 30min | 45min |
| 3 | Registry implementation | 30min | 1h 15min |
| 4 | Theia DI module | 20min | 1h 35min |
| 5 | Marketing domain | 30min | 2h 5min |
| 6 | Wire into apps | 20min | 2h 25min |
| 7 | Validation command | 15min | 2h 40min |
| 8 | Documentation | 20min | 3h |
| - | Testing & polish | 30-60min | 3h 30min - 4h |

**Recommended Approach:**
- Do all 8 steps in one focused session
- Don't context switch
- Validate each step before moving on
- Take a break after step 4 (midpoint)

---

## Post-Completion

After this step is done, you'll have:

✅ **Elegant foundation** - Domain abstraction interfaces that support modifiability
✅ **Working registry** - Domains can register and be queried
✅ **Proof of concept** - Marketing domain demonstrates the pattern
✅ **Integration complete** - Works in Theia application
✅ **Documentation** - Future developers can extend

**Next Steps** (not in this plan):
- Create domain instance from template workflow
- Implement AI modification capabilities
- Build actual marketing widgets
- Add database provisioning
- Create setup wizards

But those are for another day. First, we nail the foundation.

---

## Notes & Considerations

### Why This Scope?

- **Tiny:** Just interfaces + registry + one dummy domain
- **Provable:** Test command validates it works
- **Extensible:** Easy to add more domains
- **Elegant:** Clean abstractions, well-documented
- **Robust:** Proper DI, error handling, validation

### What Makes It Robust?

1. **Type safety** - No `any` types, comprehensive interfaces
2. **Dependency injection** - Proper Theia DI patterns
3. **Documentation** - Every interface explained
4. **Validation** - Test command proves it works
5. **Future-proof** - Supports modifiability from day one

### What Makes It Elegant?

1. **Clean separation** - Core vs domain packages
2. **Contribution pattern** - Domains self-register
3. **Optional methods** - Not all features required
4. **Descriptive names** - Clear intent
5. **Consistent style** - Follows Theia conventions

### Common Pitfalls to Avoid

- ❌ Over-engineering (keep it simple)
- ❌ Skipping documentation (write as you go)
- ❌ Not testing (run test command frequently)
- ❌ Hardcoding assumptions (use interfaces)
- ❌ Forgetting optional `?:` (not all methods required)

---

**Ready to build? Let's create the foundation that everything else depends on.**
