# Domain Abstraction Principles

**Document Version:** 1.0
**Last Updated:** 2025-10-10
**Status:** Canonical Architecture Reference

---

## Overview

This document defines the core architectural principles for Quallaa's domain abstraction system. The fundamental insight is that **domains must be AI-modifiable scaffolding, not fixed products**.

This principle emerged from the realization that Quallaa is not building a "marketing automation product" or "financial analysis product" - we're building a **platform where AI helps domain experts build their unique solutions**.

---

## Core Principle: Domains Are Living Codebases

### The Fundamental Difference

**Traditional Software (Product Mentality):**
```
Developer builds → User installs → User configures settings
```
- Fixed data models
- Fixed UI components
- Fixed workflows
- Can only combine what's provided
- Hit ceiling quickly

**Quallaa (Platform Mentality):**
```
We provide template → User creates instance → AI modifies domain code → Unique solution emerges
```
- Extensible data models (AI adds tables/fields)
- Extensible UI (AI creates new widgets)
- Extensible workflows (AI orchestrates infrastructure)
- Full programming capability via natural language
- No ceiling - unlimited extensibility

### Why This Matters

When a user says "I need to track webinar campaigns", they're not asking for a feature we pre-built. They're asking AI to **modify the marketing domain itself** to support webinars.

This is fundamentally different from:
- **No-code tools** (Webflow, Bubble): Fixed models, configurable but limited
- **SaaS products** (HubSpot, Marketo): Request features, wait for roadmap
- **Traditional IDEs** (VS Code): Manually write all code yourself

Quallaa uniquely combines:
- **IDE foundation** (full programming capability)
- **AI execution** (natural language commands)
- **Domain scaffolding** (80% foundation provided)

---

## Template → Instance → Customization Pattern

### Phase 1: Template Definition

The **marketing domain template** is maintained in the monorepo as a reference implementation:

```
packages/marketing-domain/
├── src/
│   ├── browser/
│   │   ├── widgets/
│   │   │   ├── CampaignBuilder.tsx    # Base campaign builder
│   │   │   ├── EmailEditor.tsx        # Email template editor
│   │   │   └── AudienceManager.tsx    # Segment management
│   │   └── marketing-frontend-module.ts
│   ├── common/
│   │   ├── protocol.ts                # TypeScript interfaces
│   │   └── schema.sql                 # Database schema
│   └── node/
│       ├── services/
│       │   ├── CampaignService.ts     # Business logic
│       │   └── EmailService.ts        # Email API integration
│       └── migrations/
│           └── 001_initial.sql        # Initial database setup
├── package.json
└── README.md
```

**Template characteristics:**
- ✅ Provides foundation (80% of common needs)
- ✅ Well-documented (AI can understand structure)
- ✅ Extensible (clear patterns for adding capabilities)
- ✅ Version controlled (git tracks template evolution)
- ❌ NOT installed as package (would lock down modifiability)
- ❌ NOT user-facing directly (users create instances)

### Phase 2: Instance Creation

When user creates "New Marketing Project", Quallaa:

1. **Copies template source code** to user's project:
```
my-marketing-project/
├── .quallaa/
│   ├── domain/                        # COPY of marketing-domain template
│   │   ├── widgets/
│   │   ├── services/
│   │   └── schema.sql
│   ├── project.json                   # Domain metadata
│   │   {
│   │     "domainTemplate": "marketing-automation",
│   │     "templateVersion": "1.0.0",
│   │     "isModified": false,
│   │     "customizations": []
│   │   }
│   └── services.json                  # API keys (encrypted)
├── campaigns/
├── templates/
└── segments/
```

2. **Provisions infrastructure** based on domain requirements:
   - Spins up PostgreSQL database (Docker container or cloud)
   - Runs initial schema migration
   - Configures API integrations (Resend, analytics)
   - Sets up file watchers

3. **Registers domain instance** with Quallaa runtime:
   - Domain capabilities become available in UI
   - AI tools become available for commands
   - Custom shell layout loads

**Instance characteristics:**
- ✅ User owns the code (in their project directory)
- ✅ AI can modify anything
- ✅ Git tracks changes (version control for customizations)
- ✅ Independent from template (diverges as needed)
- ⚠️ Can merge upstream template updates (with conflict resolution)

### Phase 3: AI-Driven Customization

User issues command: **"I need to track webinar campaigns with registration counts"**

AI performs multi-step modification:

**Step 1: Analyze request**
- Identifies new domain capability: webinar tracking
- Determines required changes: database, UI, business logic

**Step 2: Modify database schema**
```sql
-- my-marketing-project/.quallaa/domain/migrations/002_add_webinars.sql
CREATE TABLE webinar_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id),
  webinar_date TIMESTAMP NOT NULL,
  registration_url TEXT,
  registration_count INTEGER DEFAULT 0,
  reminder_1day_sent BOOLEAN DEFAULT FALSE,
  reminder_1hour_sent BOOLEAN DEFAULT FALSE
);

CREATE TABLE webinar_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webinar_campaign_id UUID REFERENCES webinar_campaigns(id),
  customer_id UUID REFERENCES customers(id),
  registered_at TIMESTAMP DEFAULT NOW(),
  attended BOOLEAN DEFAULT FALSE
);
```

**Step 3: Update TypeScript interfaces**
```typescript
// my-marketing-project/.quallaa/domain/protocol.ts
export interface WebinarCampaign extends Campaign {
  webinarDate: Date;
  registrationUrl: string;
  registrationCount: number;
  remindersSent: {
    oneDayBefore: boolean;
    oneHourBefore: boolean;
  };
}

export interface WebinarRegistration {
  id: string;
  webinarCampaignId: string;
  customerId: string;
  registeredAt: Date;
  attended: boolean;
}
```

**Step 4: Create new widget**
```typescript
// my-marketing-project/.quallaa/domain/widgets/WebinarCampaignBuilder.tsx
import { CampaignBuilder } from './CampaignBuilder';

export const WebinarCampaignBuilder: React.FC<Props> = ({ campaign }) => {
  return (
    <div className="webinar-campaign-builder">
      {/* Reuse base campaign builder */}
      <CampaignBuilder campaign={campaign} />

      {/* Webinar-specific fields */}
      <FormSection title="Webinar Details">
        <DateTimePicker
          label="Webinar Date"
          value={campaign.webinarDate}
          onChange={...}
        />
        <Input
          label="Registration URL"
          value={campaign.registrationUrl}
          onChange={...}
        />
      </FormSection>

      <FormSection title="Automated Reminders">
        <Checkbox label="Send reminder 1 day before" />
        <Checkbox label="Send reminder 1 hour before" />
      </FormSection>

      <RegistrationList campaignId={campaign.id} />
    </div>
  );
};
```

**Step 5: Add backend service**
```typescript
// my-marketing-project/.quallaa/domain/services/WebinarService.ts
@injectable()
export class WebinarService {
  async trackRegistration(
    webinarId: string,
    customerId: string
  ): Promise<void> {
    await this.db.query(`
      INSERT INTO webinar_registrations (webinar_campaign_id, customer_id)
      VALUES ($1, $2)
    `, [webinarId, customerId]);

    await this.updateRegistrationCount(webinarId);
  }

  async sendReminders(webinarId: string): Promise<void> {
    const webinar = await this.getWebinar(webinarId);
    const now = new Date();

    // Check if 1 day reminder should send
    if (!webinar.remindersSent.oneDayBefore) {
      const oneDayBefore = new Date(webinar.webinarDate);
      oneDayBefore.setDate(oneDayBefore.getDate() - 1);

      if (now >= oneDayBefore) {
        await this.sendReminderEmails(webinarId, '1-day');
        await this.markReminderSent(webinarId, 'oneDayBefore');
      }
    }

    // Similar for 1 hour reminder...
  }
}
```

**Step 6: Register new AI tools**
```typescript
// my-marketing-project/.quallaa/domain/ai-tools.ts
export const webinarTools: AIToolDefinition[] = [
  {
    name: 'create_webinar_campaign',
    description: 'Create a new webinar campaign with registration tracking',
    parameters: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        webinarDate: { type: 'string', format: 'date-time' },
        registrationUrl: { type: 'string' }
      }
    },
    handler: async (params) => {
      // Implementation
    }
  },
  {
    name: 'get_webinar_registrations',
    description: 'Get list of registrations for a webinar',
    parameters: {
      type: 'object',
      properties: {
        webinarId: { type: 'string' }
      }
    },
    handler: async (params) => {
      // Implementation
    }
  }
];
```

**Step 7: Update domain registration**
```typescript
// my-marketing-project/.quallaa/domain/domain-provider.ts
export class UserMarketingDomain implements DomainProvider {
  getCapabilities(): string[] {
    return [
      'campaign-management',
      'email-automation',
      'audience-segmentation',
      'webinar-tracking',        // ← NEW capability added by AI
    ];
  }

  getWidgets(): WidgetFactory[] {
    return [
      { id: 'campaign-builder', factory: () => new CampaignBuilder() },
      { id: 'email-editor', factory: () => new EmailEditor() },
      { id: 'audience-manager', factory: () => new AudienceManager() },
      { id: 'webinar-builder', factory: () => new WebinarCampaignBuilder() }, // ← NEW
    ];
  }

  getAITools(): AIToolDefinition[] {
    return [
      ...baseCampaignTools,
      ...webinarTools,            // ← NEW tools added
    ];
  }
}
```

**Step 8: Record customization**
```json
// my-marketing-project/.quallaa/project.json
{
  "domainTemplate": "marketing-automation",
  "templateVersion": "1.0.0",
  "isModified": true,
  "customizations": [
    {
      "timestamp": "2025-10-10T14:30:00Z",
      "description": "Added webinar campaign tracking with registration management",
      "userCommand": "I need to track webinar campaigns with registration counts",
      "filesModified": [
        ".quallaa/domain/migrations/002_add_webinars.sql",
        ".quallaa/domain/protocol.ts",
        ".quallaa/domain/widgets/WebinarCampaignBuilder.tsx",
        ".quallaa/domain/services/WebinarService.ts",
        ".quallaa/domain/ai-tools.ts",
        ".quallaa/domain/domain-provider.ts"
      ],
      "capabilitiesAdded": ["webinar-tracking"],
      "aiModel": "claude-3.5-sonnet",
      "tokensUsed": 15420
    }
  ]
}
```

**Result:**
- User's marketing domain now has webinar functionality
- Capability that didn't exist in base template
- Fully integrated (database, UI, business logic, AI tools)
- User can continue customizing ("Add Zoom integration", "Track post-webinar follow-ups")

---

## Domain Abstraction Interface Requirements

To support this modifiability pattern, the domain abstraction must provide:

### 1. Template vs. Instance Distinction

```typescript
export interface DomainProvider {
  readonly id: string;
  readonly displayName: string;

  // Is this a template or user's instance?
  readonly isTemplate: boolean;

  // If instance, what template is it based on?
  readonly baseTemplate?: {
    id: string;
    version: string;
  };

  // Has this instance diverged from template?
  readonly isModified: boolean;
}
```

### 2. Dynamic Capability Registration

Capabilities are not fixed at compile time - they evolve as AI modifies the domain.

```typescript
export interface DomainProvider {
  // Returns current capabilities (may change over time)
  getCapabilities(): DomainCapability[];

  // Register new capability (called by AI after modification)
  registerCapability(capability: DomainCapability): void;

  // Remove capability (if user asks AI to remove feature)
  unregisterCapability(capabilityId: string): void;
}

export interface DomainCapability {
  id: string;
  displayName: string;
  description: string;
  addedBy: 'template' | 'user-customization';
  addedAt?: Date;
}
```

### 3. Source Path Metadata

AI needs to know where it can edit code.

```typescript
export interface DomainProvider {
  // Declare source code locations AI can modify
  getSourcePaths(): DomainSourcePaths;
}

export interface DomainSourcePaths {
  widgets: string;       // 'my-project/.quallaa/domain/widgets/'
  services: string;      // 'my-project/.quallaa/domain/services/'
  migrations: string;    // 'my-project/.quallaa/domain/migrations/'
  interfaces: string;    // 'my-project/.quallaa/domain/protocol.ts'
  aiTools: string;       // 'my-project/.quallaa/domain/ai-tools.ts'

  // Some paths may be readonly (template internals)
  readonly?: string[];
}
```

### 4. Customization Tracking

Track what AI has modified and why.

```typescript
export interface DomainProvider {
  getCustomizations(): DomainCustomization[];
  recordCustomization(customization: DomainCustomization): void;
}

export interface DomainCustomization {
  timestamp: Date;
  description: string;
  userCommand: string;        // Original natural language request
  filesModified: string[];
  capabilitiesAdded: string[];
  capabilitiesRemoved: string[];
  aiModel: string;            // Which AI model performed modification
  tokensUsed: number;
}
```

### 5. Modifiability Flags

Some domains should not be modifiable (system domains).

```typescript
export interface DomainProvider {
  // Can AI modify this domain?
  readonly modifiable: boolean;

  // If not modifiable, why?
  readonly modifiabilityReason?: string;
}

// Example: System domain (not modifiable)
export class CoreSystemDomain implements DomainProvider {
  readonly modifiable = false;
  readonly modifiabilityReason = 'System domain - create user instance to customize';
}

// Example: User instance (modifiable)
export class UserMarketingDomain implements DomainProvider {
  readonly modifiable = true;
}
```

### 6. Service Declaration

Domains declare what infrastructure they need.

```typescript
export interface DomainProvider {
  // What backend services does this domain orchestrate?
  getServices(): DomainServiceConfig[];
}

export interface DomainServiceConfig {
  type: 'database' | 'api' | 'file-system' | 'queue' | 'cache' | 'runtime';
  provider: string;           // 'postgresql', 'resend', 'redis', 'docker'
  config: Record<string, any>;
  required: boolean;          // Must have or optional?
}

// Example: Marketing domain services
getServices(): DomainServiceConfig[] {
  return [
    {
      type: 'database',
      provider: 'postgresql',
      required: true,
      config: {
        schema: 'marketing',
        tables: ['customers', 'campaigns', 'segments']
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
      type: 'cache',
      provider: 'redis',
      required: false,          // Optional - degrades gracefully
      config: {
        purpose: 'session-storage'
      }
    }
  ];
}
```

---

## Infrastructure as Source of Truth

### The Hybrid Model

Different data types require different storage:

| Data Type | Storage | Why | AI Access |
|-----------|---------|-----|-----------|
| **Customer records** | PostgreSQL | Relational, fast queries, concurrent access | SQL queries via tool |
| **Campaign data** | PostgreSQL | Same - relational structure | SQL queries + updates |
| **Email templates** | Files (.email.tsx) | Version control, AI can edit code | Read/write files |
| **Configuration** | Files (.quallaa/) | Git-trackable, portable | Read/write JSON |
| **Analytics events** | PostgreSQL + TimescaleDB | Time-series data, aggregations | SQL queries |
| **API keys** | Files (encrypted) | Secure storage, user-managed | Decrypt when needed |
| **Session data** | Redis | Fast, ephemeral | Cache operations |
| **Background jobs** | Database queue | Persistent, retryable | Enqueue/dequeue |
| **Domain source code** | Files (.quallaa/domain/) | Version control, AI modifies | Read/write TypeScript |

### AI Orchestration Pattern

AI doesn't just edit files - it orchestrates entire infrastructure:

```typescript
// User command: "Create welcome campaign for trial users and send tomorrow at 9am"

// AI execution plan:
async function executeUserCommand() {
  // Step 1: Query database for segment
  const trialUsers = await db.query(`
    SELECT * FROM customers
    WHERE segment_id = (SELECT id FROM segments WHERE name = 'Trial Users')
  `);

  // Step 2: Read email template file
  const template = await fileSystem.read('templates/welcome.email.tsx');

  // Step 3: Create campaign record in database
  const campaign = await db.query(`
    INSERT INTO campaigns (name, template_id, segment_id, scheduled_for)
    VALUES ('Welcome Campaign', $1, $2, $3)
    RETURNING id
  `, [template.id, trialUsers.segmentId, '2025-10-11 09:00:00']);

  // Step 4: Schedule background job (database queue)
  await db.query(`
    INSERT INTO job_queue (job_type, payload, scheduled_for)
    VALUES ('send_campaign', $1, $2)
  `, [{ campaignId: campaign.id }, '2025-10-11 09:00:00']);

  // Step 5: Update UI
  await ui.refreshCampaignList();
  await ui.showNotification(`Campaign scheduled for ${trialUsers.length} recipients`);
}
```

AI coordinates:
- ✅ Database queries (PostgreSQL)
- ✅ File operations (templates)
- ✅ Background jobs (queue)
- ✅ UI updates (widgets)

All from a single natural language command.

---

## Comparison with Research Report

### What the Research Report Got Right

The research document ("Application Layer Architecture...") correctly identified:

✅ **Theia as foundation** - Perfect IDE platform for customization
✅ **Domain abstraction pattern** - Contribution points, DI, registry
✅ **AI integration architecture** - Context aggregation, streaming, tool-based
✅ **Three-way sync concept** - Visual UI ↔ Source ↔ Runtime
✅ **Progressive disclosure** - Adaptive UI patterns
✅ **React integration** - ReactWidget component patterns

### What the Research Report Missed

The research assumed domains are **installable extensions** (VS Code model), not **AI-modifiable scaffolding**.

❌ **Missing: Template vs. Instance distinction**
- Report treats domains like installed packages
- Reality: Users get a copy of domain source code to modify

❌ **Missing: Dynamic capability registration**
- Report assumes fixed capabilities at compile time
- Reality: Capabilities evolve as AI modifies domain

❌ **Missing: Source path metadata**
- Report doesn't address "where can AI edit"
- Reality: Need clear declaration of modifiable paths

❌ **Missing: Infrastructure orchestration depth**
- Report mentions databases/APIs but focuses on files
- Reality: AI orchestrates full stack (DB, API, files, queues, runtime)

❌ **Missing: Customization tracking**
- Report doesn't address version control for AI modifications
- Reality: Need to track what AI changed and why

❌ **Missing: Modifiability as first-class concept**
- Report treats it as incidental (AI can edit code)
- Reality: Modifiability is THE core principle

### Why This Happened

Research sources were developer-focused tools:
- **Cursor/Copilot**: AI helps developers write code (manual development)
- **VS Code extensions**: Fixed packages you install and use
- **Retool/Webflow**: Domain-specific products (configurable but limited)

None of these tools have **AI modifying the domain abstraction itself** based on user requests.

Closer analogies (that research missed):
- **Replit templates**: Fork, modify, becomes unique project
- **WordPress child themes**: Base theme → customize → diverges
- **Glitch remixes**: Start from template, modify heavily
- **Jupyter notebooks**: Execute + modify in same environment

---

## Implementation Implications

### First Tiny Step

The domain abstraction interfaces must explicitly support modifiability from day one:

```typescript
// packages/domain-core/src/common/domain-protocol.ts

export interface DomainProvider {
  readonly id: string;
  readonly displayName: string;

  // Template vs. instance
  readonly isTemplate: boolean;
  readonly baseTemplate?: { id: string; version: string };

  // Dynamic capabilities
  getCapabilities(): DomainCapability[];
  registerCapability(capability: DomainCapability): void;

  // Source paths for AI modification
  getSourcePaths(): DomainSourcePaths;

  // Customization tracking
  getCustomizations(): DomainCustomization[];
  recordCustomization(customization: DomainCustomization): void;

  // Modifiability
  readonly modifiable: boolean;

  // Infrastructure requirements
  getServices(): DomainServiceConfig[];
}
```

This interface supports:
- ✅ Creating instances from templates
- ✅ AI modifying domain code
- ✅ Tracking customizations
- ✅ Evolving capabilities dynamically
- ✅ Orchestrating infrastructure

### Architecture Decisions

**1. Where does user's domain code live?**
```
my-marketing-project/
├── .quallaa/
│   ├── domain/          ← User's modifiable domain code
│   └── project.json     ← Metadata about customizations
```

**2. How does AI know what to modify?**
- Domain provider declares `getSourcePaths()`
- AI reads TypeScript files to understand structure
- AI follows patterns from template (naming conventions, imports)

**3. How do we handle template updates?**
- Git-style merge (user domain = fork, template = upstream)
- User can pull upstream changes
- Conflict resolution when user has modified same files

**4. How do multiple domains coexist?**
- Each project has ONE active domain instance
- Can switch domains (marketing → finance) but not simultaneously
- Hybrid projects (future): Multiple domains with coordination layer

**5. How do we prevent AI from breaking things?**
- Validation after each modification (TypeScript compiler, linter)
- AI self-corrects if validation fails
- User can undo customizations (command history + reversal)
- Snapshot before major changes (time-travel debugging)

---

## Success Metrics

We'll know this architecture is successful when:

1. **User can customize without limits**
   - AI adds features that weren't in template
   - No "this isn't supported" responses

2. **Customizations feel natural**
   - User describes outcome in natural language
   - AI handles implementation details
   - Changes integrate seamlessly with existing code

3. **Domains evolve uniquely**
   - Sarah's marketing domain ≠ Bob's marketing domain
   - Each reflects unique business needs
   - No two instances are exactly alike

4. **AI understands domain structure**
   - AI can read existing code and extend it
   - AI follows conventions established in template
   - AI suggests improvements based on domain patterns

5. **Template updates don't break customizations**
   - Users can pull upstream template improvements
   - Merge conflicts are rare and resolvable
   - Core improvements flow to all instances

---

## Open Questions for Implementation

1. **Domain packaging:** NPM packages vs. git submodules vs. file copy?
2. **TypeScript compilation:** Compile domain code on-the-fly or ahead-of-time?
3. **Hot reload:** How do domain modifications reload without restart?
4. **Multi-user:** Can teams collaborate on same domain instance?
5. **Domain marketplace:** Can third parties publish domain templates?
6. **Hybrid domains:** Can user combine marketing + finance domains?
7. **AI guardrails:** How do we prevent AI from making dangerous database changes?
8. **Rollback:** What's the UX for "undo last AI customization"?
9. **Testing:** How does AI test modifications before applying?
10. **Performance:** Does copying domain source code bloat projects?

---

## Conclusion

The domain abstraction is not a plugin system - it's a **scaffolding system that AI modifies to build exactly what users need**.

This is the architectural foundation that makes Quallaa fundamentally different from:
- **No-code tools** (limited extensibility)
- **SaaS products** (wait for features)
- **Traditional IDEs** (manual coding required)

By treating domains as living codebases that AI evolves based on user needs, we enable:
- Unlimited customization through natural language
- Future-proof architecture (anything tokenizable)
- Progressive capability revelation (start simple, grow complex)
- User ownership (their domain, their data, their code)

This is the vision. This is the architecture. Now we build.

---

**Next Steps:**
1. Implement base domain abstraction interfaces (see CLAUDE.md "First Tiny Step")
2. Create dummy marketing domain template to validate pattern
3. Build domain instance creation workflow
4. Implement AI modification capabilities
5. Test with real user scenarios

**References:**
- `CLAUDE.md` - Development guidance and project context
- `docs/Quallaa-Product-Overview.md` - Product vision and market positioning
- `docs/planning/Application Layer Architecture...md` - Research report (with gaps noted)
- Implementation will be in: `packages/domain-core/`, `packages/marketing-domain/`
