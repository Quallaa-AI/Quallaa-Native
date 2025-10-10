# @quallaa/domain-core

Core domain abstraction system for Quallaa AI-modifiable environments.

## Overview

The domain-core package provides the fundamental abstractions and infrastructure for Quallaa's domain system. It enables AI-modifiable application environments through a clean, extensible architecture.

**Key Concept:** Domains in Quallaa are not fixed products—they are AI-modifiable scaffolding. Users start with template domains and customize them through AI commands to build exactly what they need.

## What This Package Provides

### Core Interfaces

- **`DomainProvider`** - Main interface for domain implementations
  - Template vs. instance differentiation
  - Modifiability support
  - Capability management
  - Service configuration
  - Source path specification

- **`DomainRegistry`** - Central registry for all domains
  - Domain registration and lookup
  - Template domain queries
  - Instance domain queries

- **`DomainContribution`** - Contribution point for domain registration
  - Follows Theia's contribution provider pattern
  - Enables decoupled domain registration

### Supporting Interfaces

- **`DomainCapability`** - Describes domain features and functionality
- **`DomainServiceConfig`** - Infrastructure service requirements (databases, APIs, etc.)
- **`DomainSourcePaths`** - Locations where AI can modify code
- **`DomainCustomization`** - Tracks AI modifications to domain instances

### Implementation Classes

- **`DomainRegistryImpl`** - Registry implementation using InversifyJS
- **`DomainTestCommandContribution`** - Validation command for testing domain registration

## Architecture

### Template → Instance → Customization Pattern

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Template Domain (Read-only)                              │
│    - Base capabilities                                      │
│    - Infrastructure requirements                            │
│    - Default configuration                                  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ User creates new project
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Domain Instance (AI-modifiable copy)                     │
│    - All template capabilities                              │
│    - User's project directory                               │
│    - Modifiable = true                                      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ AI modifies code
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Customized Domain Instance                               │
│    - Template capabilities + custom capabilities            │
│    - Modified database schemas, widgets, services           │
│    - Customization history tracked                          │
└─────────────────────────────────────────────────────────────┘
```

### Infrastructure-Centric Design

Domains can configure infrastructure services across multiple types:

- **Databases** - PostgreSQL, MySQL, MongoDB, etc.
- **APIs** - REST APIs, GraphQL, external services
- **File Systems** - Local, cloud storage, CDNs
- **Queues** - Message queues, event streams
- **Cache** - Redis, Memcached, etc.
- **Runtime** - Docker containers, serverless functions

## Usage

### Creating a Domain Provider

```typescript
import { injectable } from '@theia/core/shared/inversify';
import { DomainProvider, DomainCapability, DomainServiceConfig } from '@quallaa/domain-core';

@injectable()
export class MyDomainProvider implements DomainProvider {
    readonly id = 'my-domain';
    readonly displayName = 'My Domain';
    readonly description = 'Custom domain for my use case';
    readonly isTemplate = true;
    readonly modifiable = false;

    getCapabilities(): DomainCapability[] {
        return [
            {
                id: 'my-capability',
                displayName: 'My Capability',
                description: 'What this capability does',
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
                    schema: 'my_schema',
                    tables: ['my_table'],
                    description: 'Primary database'
                }
            }
        ];
    }

    getSourcePaths() {
        return {
            widgets: 'src/browser/widgets/',
            services: 'src/node/services/',
            readonly: ['src/browser/my-frontend-module.ts']
        };
    }

    getCustomizations() {
        return [];
    }
}
```

### Registering a Domain

```typescript
import { ContainerModule } from '@theia/core/shared/inversify';
import { DomainContribution, DomainRegistry } from '@quallaa/domain-core';
import { MyDomainProvider } from './my-domain-provider';

export default new ContainerModule(bind => {
    bind(MyDomainProvider).toSelf().inSingletonScope();

    bind(DomainContribution).toDynamicValue(ctx => ({
        registerDomain: (registry: DomainRegistry) => {
            const provider = ctx.container.get(MyDomainProvider);
            registry.registerDomain(provider);
        }
    })).inSingletonScope();
});
```

### Accessing the Registry

```typescript
import { inject, injectable } from '@theia/core/shared/inversify';
import { DomainRegistry } from '@quallaa/domain-core';

@injectable()
export class MyService {
    @inject(DomainRegistry)
    protected readonly domainRegistry: DomainRegistry;

    listDomains(): void {
        const allDomains = this.domainRegistry.getAllDomains();
        const templates = this.domainRegistry.getTemplateDomains();
        const instances = this.domainRegistry.getInstanceDomains();

        console.log(`Found ${allDomains.length} domains`);
    }

    getDomain(id: string): void {
        const domain = this.domainRegistry.getDomain(id);
        if (domain) {
            console.log(`Found domain: ${domain.displayName}`);
        }
    }
}
```

## Testing Domain Registration

A test command is included for validating domain registration:

1. Start the Quallaa application
2. Open Command Palette (Cmd+Shift+P or Ctrl+Shift+P)
3. Run command: **Quallaa: Test Domain Registry**
4. Check console for detailed domain information

The command will log:
- Total number of registered domains
- Number of template vs. instance domains
- Detailed information for each domain (capabilities, services, source paths)

## Design Principles

### 1. Templates Are Read-Only

Template domains (`isTemplate: true`) cannot be modified. They serve as base definitions that users copy.

### 2. Instances Are AI-Modifiable

Instance domains (`isTemplate: false`, `modifiable: true`) can be modified by AI through natural language commands.

### 3. Infrastructure Is First-Class

Databases, APIs, files, queues, and runtime are equal concerns—not "just files with API integrations."

### 4. Capabilities Are Dynamic

Domain capabilities grow as AI modifies the instance. New features = new capabilities registered at runtime.

### 5. Source Paths Guide AI

The `getSourcePaths()` method tells AI where it can safely modify code and what files are read-only.

## Extending This Package

### Adding New Service Types

The `DomainServiceConfig` interface supports custom service types. To add a new type:

1. Define your service configuration in the `config` object
2. Document requirements in the `description` field
3. Mark as `required` or optional

### Adding New Capabilities

Capabilities can be added dynamically:

```typescript
if (domain.registerCapability) {
    domain.registerCapability({
        id: 'new-feature',
        displayName: 'New Feature',
        description: 'AI added this feature',
        source: 'user-customization',
        addedAt: new Date()
    });
}
```

### Tracking Customizations

Instance domains can track AI modifications:

```typescript
if (domain.recordCustomization) {
    domain.recordCustomization({
        timestamp: new Date(),
        description: 'Added webinar campaign tracking',
        aiModel: 'claude-3-opus',
        filesModified: ['src/browser/webinar-widget.tsx', 'schema.sql'],
        capabilitiesAdded: ['webinar-tracking']
    });
}
```

## Package Structure

```
@quallaa/domain-core/
├── src/
│   ├── common/
│   │   ├── domain-protocol.ts       # Core interfaces
│   │   └── index.ts
│   └── browser/
│       ├── domain-registry.ts        # Registry implementation
│       ├── domain-test-contribution.ts # Test command
│       ├── domain-frontend-module.ts  # DI module
│       └── index.ts
├── package.json
├── tsconfig.json
└── README.md
```

## Dependencies

- `@theia/core` - Dependency injection, contribution providers, UI services

## Integration Points

### Frontend Module

The `domain-frontend-module.ts` binds:
- `DomainRegistry` → `DomainRegistryImpl` (singleton)
- `DomainContribution` contribution provider
- `DomainTestCommandContribution` (command)

### Contribution Provider Pattern

Domains self-register using Theia's contribution provider pattern:
1. Domain package binds `DomainContribution`
2. Registry collects all contributions via `ContributionProvider<DomainContribution>`
3. Registry calls `registerDomain()` on each contribution during `@postConstruct`

## Future Enhancements

- **Domain Templates Marketplace** - Browse and install community templates
- **Version Management** - Track template versions and upgrade paths
- **Migration System** - Automated migration between template versions
- **Conflict Resolution** - Handle conflicts between AI modifications and template updates
- **Capability Dependencies** - Declare dependencies between capabilities
- **Service Orchestration** - Automated provisioning of infrastructure services

## See Also

- [Marketing Domain README](../marketing-domain/README.md) - Reference implementation
- [First Tiny Step Plan](../../docs/planning/first-tiny-step-plan.md) - Implementation guide
- [Domain Abstraction Principles](../../docs/architecture/domain-abstraction-principles.md) - Architecture deep dive

## License

EPL-2.0 OR GPL-2.0-only WITH Classpath-exception-2.0
