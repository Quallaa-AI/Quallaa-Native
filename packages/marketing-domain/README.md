# @quallaa/marketing-domain

Marketing automation domain template for Quallaa - reference implementation of the domain abstraction pattern.

## Overview

The marketing-domain package is a **template domain** that demonstrates how to build AI-modifiable environments in Quallaa. It serves both as:

1. **Reference Implementation** - Shows domain-core usage patterns
2. **Starting Point** - Users copy this to create marketing automation projects

**Important:** This is a template, not a finished product. When users create a marketing project, they get a modifiable copy that AI can customize to their specific needs.

## What This Domain Provides

### Base Capabilities

Out of the box, this template includes:

1. **Campaign Management**
   - Create and manage email campaigns
   - Automated workflows
   - Drip sequences

2. **Email Automation**
   - Automated email sequences
   - Trigger-based messaging
   - Personalization and templating

3. **Audience Segmentation**
   - Segment by behavior
   - Attribute-based filtering
   - Engagement scoring

4. **Analytics Dashboard**
   - Campaign performance metrics
   - Open rates and click tracking
   - Conversion analytics

### Infrastructure Services

The template declares these infrastructure requirements:

#### Required Services

1. **PostgreSQL Database**
   - Schema: `marketing`
   - Tables: `customers`, `campaigns`, `segments`, `analytics`, `email_templates`
   - Purpose: Customer data and campaign management

2. **Resend API** (Email Delivery)
   - Purpose: Email sending service
   - Rate Limit: 100 emails per second
   - Requires: API key configuration

#### Optional Services

3. **Google Analytics API**
   - Purpose: Campaign tracking integration
   - Requires: API key configuration

4. **Redis Cache**
   - Purpose: Session storage and performance optimization
   - TTL: 3600 seconds

5. **Local File System**
   - Root: `templates/`
   - Watch Patterns: `*.email.tsx`, `*.landing.tsx`
   - Purpose: Email and landing page templates

## Architecture

### Template vs. Instance

```
┌─────────────────────────────────────────────────────────────┐
│ THIS PACKAGE: @quallaa/marketing-domain                     │
│ Type: Template (isTemplate: true)                           │
│ Modifiable: false (templates are read-only)                 │
│                                                              │
│ Provides:                                                    │
│  - Base capabilities (4 capabilities shown above)           │
│  - Infrastructure requirements                              │
│  - Example domain implementation                            │
└─────────────────────────────────────────────────────────────┘
                     │
                     │ User creates "New Marketing Project"
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ USER'S PROJECT: my-marketing-project                        │
│ Type: Instance (isTemplate: false)                          │
│ Modifiable: true (AI can modify)                            │
│                                                              │
│ Contains:                                                    │
│  - Copy of all template capabilities                        │
│  - User's customizations (added by AI)                      │
│  - Modified schemas, widgets, services                      │
└─────────────────────────────────────────────────────────────┘
```

### Example: AI Customization

When a user says: **"I need to track webinar campaigns with registration counts"**

The AI modifies the user's instance:

1. **Database Changes**
   ```sql
   CREATE TABLE webinar_campaigns (
       id SERIAL PRIMARY KEY,
       campaign_id INT REFERENCES campaigns(id),
       webinar_url VARCHAR(255),
       scheduled_date TIMESTAMP
   );

   CREATE TABLE webinar_registrations (
       id SERIAL PRIMARY KEY,
       webinar_campaign_id INT REFERENCES webinar_campaigns(id),
       customer_id INT REFERENCES customers(id),
       registered_at TIMESTAMP,
       attended BOOLEAN
   );
   ```

2. **New Widget** (`src/browser/widgets/webinar-campaign-builder.tsx`)
   ```tsx
   export class WebinarCampaignBuilder extends React.Component {
       render() {
           return (
               <div>
                   <h2>Create Webinar Campaign</h2>
                   <input placeholder="Webinar Title" />
                   <input type="datetime-local" placeholder="Scheduled Date" />
                   {/* ... registration tracking UI ... */}
               </div>
           );
       }
   }
   ```

3. **New Service** (`src/node/services/webinar-service.ts`)
   ```typescript
   @injectable()
   export class WebinarService {
       async trackRegistration(webinarId: number, customerId: number) {
           // Track registration in database
       }

       async getRegistrationCount(webinarId: number): Promise<number> {
           // Query registration count
       }
   }
   ```

4. **New Capability** (registered dynamically)
   ```typescript
   {
       id: 'webinar-tracking',
       displayName: 'Webinar Campaign Tracking',
       description: 'Track webinar registrations and attendance',
       source: 'user-customization',
       addedAt: new Date('2025-10-10')
   }
   ```

## Package Structure

```
@quallaa/marketing-domain/
├── src/
│   ├── common/
│   │   └── index.ts                        # Re-exports domain-core
│   └── browser/
│       ├── marketing-domain-provider.ts     # Domain implementation
│       ├── marketing-frontend-module.ts     # DI module
│       └── index.ts
├── package.json
├── tsconfig.json
└── README.md
```

## Implementation Details

### Domain Provider

The `MarketingDomainProvider` class implements `DomainProvider` from `@quallaa/domain-core`:

```typescript
@injectable()
export class MarketingDomainProvider implements DomainProvider {
    readonly id = 'marketing-automation';
    readonly displayName = 'Marketing Automation';
    readonly isTemplate = true;      // This is a template
    readonly modifiable = false;     // Templates cannot be modified
    readonly isModified = false;     // Templates have no modifications

    getCapabilities(): DomainCapability[] { /* ... */ }
    getServices(): DomainServiceConfig[] { /* ... */ }
    getSourcePaths(): DomainSourcePaths { /* ... */ }
    getCustomizations(): DomainCustomization[] { return []; }
}
```

### Frontend Module

The `marketing-frontend-module.ts` registers the domain using the contribution pattern:

```typescript
export default new ContainerModule(bind => {
    // Bind the provider as a singleton
    bind(MarketingDomainProvider).toSelf().inSingletonScope();

    // Register as a domain contribution
    bind(DomainContribution).toDynamicValue(ctx => ({
        registerDomain: (registry: DomainRegistry) => {
            const provider = ctx.container.get(MarketingDomainProvider);
            registry.registerDomain(provider);
        }
    })).inSingletonScope();
});
```

### Source Paths

The template defines where AI can modify code in user instances:

```typescript
getSourcePaths(): DomainSourcePaths {
    return {
        widgets: 'src/browser/widgets/',        // AI can add/modify widgets
        services: 'src/node/services/',         // AI can add/modify services
        migrations: 'src/node/migrations/',     // AI can create DB migrations
        interfaces: 'src/common/protocol.ts',   // AI can update interfaces
        aiTools: 'src/common/ai-tools.ts',      // AI can add MCP tools
        readonly: [
            'src/browser/marketing-frontend-module.ts',
            'src/node/marketing-backend-module.ts'
        ]
    };
}
```

## Usage as Reference

### For Domain Developers

To create a new domain based on this template:

1. **Copy package structure**
   ```bash
   cp -r packages/marketing-domain packages/my-domain
   ```

2. **Update package.json**
   ```json
   {
     "name": "@quallaa/my-domain",
     "description": "My custom domain"
   }
   ```

3. **Implement DomainProvider**
   - Define your capabilities
   - Declare infrastructure requirements
   - Specify source paths for AI modification

4. **Register domain contribution**
   - Use the same DI pattern shown in `marketing-frontend-module.ts`

5. **Add to application**
   - Add dependency to `examples/electron/package.json`
   - Rebuild and test

### For Users

Users don't directly use this package. Instead:

1. **Create New Project**: Select "Marketing Automation" from templates
2. **AI Customizes**: Issue commands like "Add webinar tracking"
3. **AI Modifies**: AI edits the user's instance (not this template)

## Service Configuration Examples

### PostgreSQL Configuration

```typescript
{
    type: 'database',
    provider: 'postgresql',
    required: true,
    config: {
        schema: 'marketing',
        tables: ['customers', 'campaigns', 'segments', 'analytics', 'email_templates'],
        description: 'Primary database for customer data and campaign management'
    }
}
```

### Resend API Configuration

```typescript
{
    type: 'api',
    provider: 'resend',
    required: true,
    config: {
        purpose: 'email-delivery',
        requiresApiKey: true,
        rateLimit: '100 emails per second',
        description: 'Email sending service for campaign delivery'
    }
}
```

### File System Configuration

```typescript
{
    type: 'file-system',
    provider: 'local-fs',
    required: true,
    config: {
        root: 'templates/',
        watchPatterns: ['*.email.tsx', '*.landing.tsx'],
        description: 'File system for email and landing page templates'
    }
}
```

## Capability Examples

### Campaign Management Capability

```typescript
{
    id: 'campaign-management',
    displayName: 'Campaign Management',
    description: 'Create and manage email campaigns with automated workflows',
    source: 'template'
}
```

### Email Automation Capability

```typescript
{
    id: 'email-automation',
    displayName: 'Email Automation',
    description: 'Automated email sequences, triggers, and drip campaigns',
    source: 'template'
}
```

## Testing

To verify this domain is registered correctly:

1. Start Quallaa application
2. Open Command Palette
3. Run: **Quallaa: Test Domain Registry**
4. Look for output:
   ```
   [1] Marketing Automation (marketing-automation)
       Type: Template
       Modifiable: false
       Modified: false
       Capabilities: 4
         - Campaign Management (campaign-management) [template]
         - Email Automation (email-automation) [template]
         - Audience Segmentation (audience-segmentation) [template]
         - Analytics Dashboard (analytics-dashboard) [template]
       Services: 5
         - database: postgresql (required)
         - api: resend (required)
         - api: google-analytics (optional)
         - file-system: local-fs (required)
         - cache: redis (optional)
   ```

## Future Enhancements

When this template becomes a full implementation (beyond MVP):

### Widgets to Implement

- **Campaign Builder** - Visual campaign creation
- **Email Template Editor** - Drag-and-drop email designer
- **Audience Segment Builder** - Visual segment query builder
- **Analytics Dashboard** - Charts and metrics visualization

### Services to Implement

- **CampaignService** - Campaign CRUD operations
- **EmailService** - Email sending and tracking
- **SegmentService** - Audience segmentation logic
- **AnalyticsService** - Metrics collection and reporting

### Database Schemas

- Complete SQL migrations in `src/node/migrations/`
- Seed data for testing
- Indexes for performance

### AI Tools (MCP)

- `create_campaign` - Create new campaign from natural language
- `send_test_email` - Send test email to user
- `query_analytics` - Query campaign performance
- `create_segment` - Create audience segment from criteria

## Comparison with Other Domain Types

| Aspect | Marketing Domain | Finance Domain | Legal Domain |
|--------|------------------|----------------|--------------|
| Primary UI | Campaign builder | Spreadsheet-like | Document editor |
| Main Database | Customer/campaign data | Transactions/reports | Contracts/clauses |
| Key API | Email provider | Payment processor | eSignature service |
| File Types | Email templates | Excel/CSV | PDF/DOCX |
| AI Tools | Campaign creation | Report generation | Contract analysis |

All domains follow the same pattern but with different capabilities and infrastructure requirements.

## Dependencies

- `@theia/core` - Dependency injection, UI framework
- `@quallaa/domain-core` - Domain abstraction interfaces

## See Also

- [Domain Core README](../domain-core/README.md) - Core abstractions and architecture
- [First Tiny Step Plan](../../docs/planning/first-tiny-step-plan.md) - Implementation guide
- [Domain Abstraction Principles](../../docs/architecture/domain-abstraction-principles.md) - Architecture deep dive
- [Marketing Environment MVP](../../docs/planning/marketing-environment-mvp.md) - Full implementation plan

## License

EPL-2.0 OR GPL-2.0-only WITH Classpath-exception-2.0
