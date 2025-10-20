# Claude Code + Quallaa Domain Integration Plan

**Goal**: Connect Claude Code's autonomous coding capabilities with Quallaa's AI-modifiable domain architecture to enable domain experts to customize their environments through natural language.

**Status**: Planning Phase
**Timeline**: 2-3 weeks for MVP
**Prerequisites**: Theia 1.65.0 ✅, Domain Core ✅, Marketing Domain Template ✅, Claude Code Integration ✅

---

## Executive Summary

This plan combines:
1. **Claude Code** (Anthropic's coding agent) - Already integrated in Theia 1.65.0
2. **Quallaa Domain Architecture** - Already built (`packages/domain-core/`, `packages/marketing-domain/`)
3. **MCP (Model Context Protocol)** - Already available in Theia 1.65.0

to create a system where:
- Domain experts issue natural language commands
- High-level domain agents parse intent
- Claude Code modifies domain source code
- Capabilities expand dynamically
- All tracked and reversible

**Inspired by**: Theia IDE Claude Code demo video showing multi-agent delegation (App Tester → Claude Code pattern)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│ User                                                             │
│ "I need to track webinar campaigns with registration counts"   │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│ MarketingCampaignAgent (High-level domain agent)                │
│                                                                  │
│ 1. Parse user intent                                            │
│ 2. Check current domain capabilities                            │
│ 3. Detect: Requires domain customization                        │
│ 4. Build modification prompt with context                       │
│ 5. Delegate to Claude Code                                      │
└──────────────────────┬──────────────────────────────────────────┘
                       │ Delegation
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│ Claude Code Agent (Autonomous coding agent)                     │
│                                                                  │
│ 1. Receives domain context (capabilities, source paths)         │
│ 2. Uses Edit/Write tools to modify files:                       │
│    - .quallaa/domain/migrations/003_webinar_support.sql         │
│    - .quallaa/domain/widgets/WebinarCampaignBuilder.tsx         │
│    - .quallaa/domain/types/campaign-types.ts                    │
│ 3. All changes tracked in IDE diff view                         │
└──────────────────────┬──────────────────────────────────────────┘
                       │ Changes tracked
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│ User Reviews Changes                                             │
│                                                                  │
│ - Sees all modifications in single view                         │
│ - Can review each file change individually                      │
│ - Clicks "Apply Changes"                                        │
└──────────────────────┬──────────────────────────────────────────┘
                       │ Approved
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│ Domain Instance Updates                                          │
│                                                                  │
│ 1. domain.registerCapability('webinar-tracking')                │
│ 2. domain.recordCustomization({ ... })                          │
│ 3. Restart MCP servers with new schema                          │
│ 4. UI refreshes to show new capability                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Verify Claude Code Integration (Day 1, ~2 hours)

### Objectives
- Confirm Claude Code is working in Quallaa Electron app
- Test IDE context awareness
- Verify change tracking works
- Understand delegation patterns

### Tasks

#### 1.1 Environment Setup
```bash
# Check Claude Code installation
which claude

# Set API key (if not already set)
export ANTHROPIC_API_KEY="sk-ant-..."

# Verify in shell
echo $ANTHROPIC_API_KEY
```

#### 1.2 Test in Quallaa IDE
```bash
cd /Users/jefftoffoli/Documents/GitHub/Quallaa-Native
npm run start:electron
```

**In Quallaa:**
1. View → Chat
2. Settings → Enable AI Features
3. Test commands:
   - `@ClaudeCode who are you?`
   - `@ClaudeCode what files are open?`
   - `@ClaudeCode create a new file called test.ts with a hello world function`
   - Review changes in diff view

#### 1.3 Study Existing Integration
**Files to review:**
- `packages/ai-claude-code/src/browser/claude-code-chat-agent.ts` - Agent implementation
- `packages/ai-claude-code/src/browser/claude-code-edit-tool-service.ts` - Change tracking
- `packages/ai-core/src/common/agent.ts` - Agent interface

**Key concepts to understand:**
- How agents register with `ChatAgentService`
- How delegation works between agents
- How Edit/Write tool calls are tracked
- How IDE context is passed to agents

### Success Criteria
- [ ] Claude Code responds to chat messages
- [ ] IDE context (open files, selection) is visible to Claude Code
- [ ] File edits appear in diff view
- [ ] Can approve/reject changes

---

## Phase 2: Create Marketing Campaign Agent (Days 2-4, ~3 days)

### Objectives
- Create domain-aware AI agent
- Implement intent parsing (operation vs. customization)
- Build delegation logic to Claude Code
- Handle customization tracking

### Package Structure
```
packages/quallaa-marketing-agent/
├── package.json
├── src/
│   ├── browser/
│   │   ├── marketing-campaign-agent.ts          # Main agent
│   │   ├── intent-parser.ts                     # Parse user commands
│   │   ├── domain-modification-builder.ts       # Build Claude Code prompts
│   │   ├── marketing-agent-frontend-module.ts   # DI bindings
│   │   └── index.ts
│   └── common/
│       ├── marketing-agent-protocol.ts          # Types/interfaces
│       └── index.ts
└── tsconfig.json
```

### Key Components

#### 2.1 Marketing Campaign Agent
```typescript
// marketing-campaign-agent.ts
import { Agent, ChatAgent, MutableChatRequestModel } from '@theia/ai-chat';
import { ClaudeCodeChatAgent } from '@theia/ai-claude-code';
import { DomainRegistry, DomainProvider } from '@quallaa/domain-core';
import { MCPServerManager } from '@theia/ai-mcp';

@injectable()
export class MarketingCampaignAgent implements Agent, ChatAgent {
  id = 'MarketingCampaign';
  name = 'Marketing Campaign';
  description = 'AI agent for marketing operations and domain customization';

  @inject(DomainRegistry)
  protected domainRegistry: DomainRegistry;

  @inject(ClaudeCodeChatAgent)
  protected claudeCode: ClaudeCodeChatAgent;

  @inject(MCPServerManager)
  protected mcpManager: MCPServerManager;

  async invoke(request: MutableChatRequestModel): Promise<void> {
    // 1. Get current marketing domain instance
    const domain = this.getCurrentDomain();

    // 2. Parse user intent
    const intent = await this.parseIntent(request.request.text);

    // 3. Route based on intent type
    if (intent.type === 'domain-customization') {
      await this.handleDomainCustomization(domain, intent, request);
    } else if (intent.type === 'campaign-operation') {
      await this.handleCampaignOperation(domain, intent);
    } else if (intent.type === 'data-query') {
      await this.handleDataQuery(domain, intent);
    }
  }

  private async handleDomainCustomization(
    domain: DomainProvider,
    intent: CustomizationIntent,
    request: MutableChatRequestModel
  ): Promise<void> {
    // Build Claude Code prompt with domain context
    const prompt = this.buildCustomizationPrompt(domain, intent);

    // Delegate to Claude Code
    request.request.text = `@ClaudeCode ${prompt}`;
    await this.claudeCode.invoke(request);

    // Claude Code will make edits, user reviews in diff view
    // After approval, track customization (see Phase 5)
  }

  private async handleCampaignOperation(
    domain: DomainProvider,
    intent: OperationIntent
  ): Promise<void> {
    // Use MCP tools to execute operations
    await this.mcpManager.callTool(
      'marketing-email',
      'create_campaign',
      { segment_id: intent.segmentId, template: intent.template }
    );
  }
}
```

#### 2.2 Intent Parser
```typescript
// intent-parser.ts

export type UserIntent =
  | CustomizationIntent    // Requires domain modification
  | OperationIntent        // Use existing capabilities
  | DataQueryIntent;       // Query database

export interface CustomizationIntent {
  type: 'domain-customization';
  description: string;           // "Add webinar campaign support"
  newCapability: string;         // "webinar-tracking"
  requiredChanges: {
    database?: boolean;          // Need schema changes?
    widgets?: boolean;           // Need new UI components?
    services?: boolean;          // Need backend logic?
    mcpTools?: boolean;          // Need new AI tools?
  };
}

export class IntentParser {
  async parse(text: string): Promise<UserIntent> {
    // Use LLM to classify intent
    // For MVP, can use simple keyword matching:

    const customizationKeywords = [
      'add', 'create new', 'I need', 'track', 'support for',
      'customize', 'extend', 'new feature'
    ];

    if (customizationKeywords.some(kw => text.toLowerCase().includes(kw))) {
      return {
        type: 'domain-customization',
        description: text,
        // ... parse specific requirements
      };
    }

    // Otherwise, assume it's an operation
    return { type: 'campaign-operation', ... };
  }
}
```

#### 2.3 Domain Modification Builder
```typescript
// domain-modification-builder.ts

export class DomainModificationBuilder {
  buildPrompt(
    domain: DomainProvider,
    intent: CustomizationIntent
  ): string {
    const sourcePaths = domain.getSourcePaths();
    const currentCapabilities = domain.getCapabilities();

    return `
You are modifying the Quallaa marketing domain to add: ${intent.description}

## Current State
Domain: ${domain.displayName}
Capabilities: ${currentCapabilities.map(c => c.id).join(', ')}

## Source Structure
Widgets: ${sourcePaths.widgets}
Services: ${sourcePaths.services}
Migrations: ${sourcePaths.migrations}
Interfaces: ${sourcePaths.interfaces}
AI Tools: ${sourcePaths.aiTools}

## Required Changes

${intent.requiredChanges.database ? `
### 1. Database Migration
Create: ${sourcePaths.migrations}/add_${intent.newCapability}.sql
- Add necessary tables/columns for ${intent.description}
- Include appropriate indexes and constraints
` : ''}

${intent.requiredChanges.widgets ? `
### 2. UI Widget
Create: ${sourcePaths.widgets}/${intent.newCapability}-builder.tsx
- Create React component for ${intent.description}
- Follow existing widget patterns in the directory
- Use Theia's widget framework (@theia/core)
` : ''}

${intent.requiredChanges.services ? `
### 3. Backend Service
Create: ${sourcePaths.services}/${intent.newCapability}-service.ts
- Implement business logic for ${intent.description}
- Use dependency injection (@injectable)
` : ''}

${intent.requiredChanges.mcpTools ? `
### 4. MCP Tools
Update: ${sourcePaths.aiTools}
- Add tools for AI to interact with ${intent.newCapability}
- Follow MCP tool schema format
` : ''}

### 5. TypeScript Interfaces
Update: ${sourcePaths.interfaces}
- Add type definitions for new data structures

## Success Criteria
After changes, the domain will support: ${intent.newCapability}
`;
  }
}
```

### Integration

```typescript
// marketing-agent-frontend-module.ts
export default new ContainerModule(bind => {
  bind(MarketingCampaignAgent).toSelf().inSingletonScope();
  bind(Agent).toService(MarketingCampaignAgent);
  bind(ChatAgent).toService(MarketingCampaignAgent);

  bind(IntentParser).toSelf().inSingletonScope();
  bind(DomainModificationBuilder).toSelf().inSingletonScope();
});
```

### Testing
```bash
# Add to lerna workspace
# Add to examples/electron/package.json dependencies

npm install
npm run compile

# Test in Quallaa
npm run start:electron

# In chat:
@MarketingCampaign I need to track webinar campaigns with registration counts
```

### Success Criteria
- [ ] Agent responds to `@MarketingCampaign` invocations
- [ ] Can parse customization vs. operation intents
- [ ] Delegates to Claude Code with proper domain context
- [ ] Claude Code receives source paths and current capabilities

---

## Phase 3: Build Marketing MCP Servers (Days 5-8, ~4 days)

### Objectives
- Expose domain infrastructure (PostgreSQL, Resend API) as MCP tools
- Enable AI to query databases and send emails
- Support both operations and customizations

### Package Structure
```
packages/quallaa-marketing-mcp/
├── package.json
├── src/
│   ├── node/
│   │   ├── database-mcp-server.ts           # PostgreSQL tools
│   │   ├── email-mcp-server.ts              # Resend API tools
│   │   ├── analytics-mcp-server.ts          # Campaign metrics
│   │   ├── mcp-backend-module.ts            # DI bindings
│   │   └── index.ts
│   └── common/
│       ├── mcp-tools-protocol.ts            # Tool schemas
│       └── index.ts
└── tsconfig.json
```

### Key Components

#### 3.1 Database MCP Server
```typescript
// database-mcp-server.ts
import { MCPServer } from '@theia/ai-mcp';
import { DomainRegistry } from '@quallaa/domain-core';
import { Pool } from 'pg';

@injectable()
export class MarketingDatabaseMCPServer implements MCPServer {
  private pool: Pool;

  @inject(DomainRegistry)
  protected domainRegistry: DomainRegistry;

  async initialize(): Promise<void> {
    // Get database config from marketing domain
    const domain = this.domainRegistry.getDomain('marketing-automation');
    const dbService = domain?.getServices().find(s => s.type === 'database');

    if (dbService) {
      this.pool = new Pool({
        host: dbService.config.host,
        database: dbService.config.database,
        // ... other config
      });
    }
  }

  getTools() {
    return [
      {
        name: 'query_customers',
        description: 'Query customer database with SQL',
        inputSchema: {
          type: 'object',
          properties: {
            sql: { type: 'string', description: 'SQL query to execute' },
            limit: { type: 'number', description: 'Max rows to return' }
          },
          required: ['sql']
        }
      },
      {
        name: 'create_segment',
        description: 'Create audience segment with filters',
        inputSchema: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            filters: { type: 'object' }
          },
          required: ['name', 'filters']
        }
      },
      {
        name: 'get_segment_members',
        description: 'Get customers in a segment',
        inputSchema: {
          type: 'object',
          properties: {
            segment_id: { type: 'string' }
          },
          required: ['segment_id']
        }
      }
    ];
  }

  async callTool(name: string, args: any): Promise<any> {
    switch (name) {
      case 'query_customers':
        const result = await this.pool.query(args.sql);
        return {
          rows: result.rows.slice(0, args.limit || 100),
          count: result.rowCount
        };

      case 'create_segment':
        const insertResult = await this.pool.query(
          'INSERT INTO segments (name, filters) VALUES ($1, $2) RETURNING id',
          [args.name, JSON.stringify(args.filters)]
        );
        return { segment_id: insertResult.rows[0].id };

      case 'get_segment_members':
        // Execute segment query
        return { /* ... */ };

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }
}
```

#### 3.2 Email MCP Server
```typescript
// email-mcp-server.ts
import { MCPServer } from '@theia/ai-mcp';
import { Resend } from 'resend';

@injectable()
export class MarketingEmailMCPServer implements MCPServer {
  private resend: Resend;

  async initialize(): Promise<void> {
    const domain = this.domainRegistry.getDomain('marketing-automation');
    const emailService = domain?.getServices().find(s => s.provider === 'resend');

    this.resend = new Resend(emailService?.config.apiKey);
  }

  getTools() {
    return [
      {
        name: 'send_campaign',
        description: 'Send email campaign to segment',
        inputSchema: {
          type: 'object',
          properties: {
            segment_id: { type: 'string' },
            template_id: { type: 'string' },
            subject: { type: 'string' },
            schedule_at: { type: 'string' }
          },
          required: ['segment_id', 'template_id', 'subject']
        }
      },
      {
        name: 'send_test_email',
        description: 'Send test email to single address',
        inputSchema: {
          type: 'object',
          properties: {
            to: { type: 'string' },
            template_id: { type: 'string' },
            subject: { type: 'string' }
          },
          required: ['to', 'template_id']
        }
      },
      {
        name: 'get_campaign_stats',
        description: 'Get analytics for campaign',
        inputSchema: {
          type: 'object',
          properties: {
            campaign_id: { type: 'string' }
          },
          required: ['campaign_id']
        }
      }
    ];
  }

  async callTool(name: string, args: any): Promise<any> {
    switch (name) {
      case 'send_campaign':
        // Get segment members from database
        const members = await this.getSegmentMembers(args.segment_id);

        // Send emails via Resend
        const results = await Promise.all(
          members.map(member =>
            this.resend.emails.send({
              from: 'campaigns@quallaa.com',
              to: member.email,
              subject: args.subject,
              // ... render template
            })
          )
        );

        return { sent: results.length, campaign_id: '...' };

      case 'send_test_email':
        const result = await this.resend.emails.send({
          from: 'test@quallaa.com',
          to: args.to,
          subject: args.subject,
          // ... render template
        });

        return { message_id: result.id };

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }
}
```

#### 3.3 MCP Server Registration
```typescript
// mcp-backend-module.ts
export default new ContainerModule(bind => {
  bind(MarketingDatabaseMCPServer).toSelf().inSingletonScope();
  bind(MarketingEmailMCPServer).toSelf().inSingletonScope();

  bind(MCPServer).toService(MarketingDatabaseMCPServer);
  bind(MCPServer).toService(MarketingEmailMCPServer);
});
```

### Testing
```typescript
// In Quallaa chat:
@MarketingCampaign show me customers who signed up this week
// → Uses query_customers MCP tool

@MarketingCampaign create segment "Trial Users" for users with status=trial
// → Uses create_segment MCP tool

@MarketingCampaign send welcome campaign to Trial Users segment
// → Uses send_campaign MCP tool
```

### Success Criteria
- [ ] MCP servers start with Quallaa backend
- [ ] Database queries execute via MCP tools
- [ ] Email sending works via Resend API
- [ ] MarketingCampaignAgent can call MCP tools
- [ ] Claude Code can call MCP tools when customizing domain

---

## Phase 4: Domain Instance Creation (Days 9-11, ~3 days)

### Objectives
- Copy template to user's project
- Create modifiable instance
- Initialize infrastructure (database, MCP servers)
- Enable project detection

### Workflow
```
User: File → New → Marketing Project
  ↓
Wizard: Enter project name, configure services
  ↓
System: Copy template, create instance, start MCP servers
  ↓
UI: Custom marketing shell loads
```

### Components

#### 4.1 Project Creation Service
```typescript
// packages/domain-core/src/browser/domain-project-service.ts

@injectable()
export class DomainProjectService {
  @inject(FileService)
  protected fileService: FileService;

  @inject(WorkspaceService)
  protected workspaceService: WorkspaceService;

  @inject(DomainRegistry)
  protected domainRegistry: DomainRegistry;

  async createMarketingProject(
    projectName: string,
    targetPath: string,
    config: MarketingProjectConfig
  ): Promise<void> {
    // 1. Copy template source
    const templatePath = '/path/to/marketing-domain/template';
    const domainPath = `${targetPath}/${projectName}/.quallaa/domain`;

    await this.copyTemplate(templatePath, domainPath);

    // 2. Create project metadata
    await this.fileService.write(
      `${targetPath}/${projectName}/.quallaa/project.json`,
      JSON.stringify({
        type: 'marketing-automation',
        version: '1.0.0',
        created: new Date().toISOString(),
        template: {
          id: 'marketing-automation',
          version: '1.0.0'
        },
        services: {
          database: config.databaseConfig,
          email: config.emailConfig
        }
      })
    );

    // 3. Initialize database
    if (config.databaseConfig.provider === 'postgresql') {
      await this.initializeDatabase(config.databaseConfig);
    }

    // 4. Create domain instance
    const instance = new MarketingInstanceProvider({
      projectPath: `${targetPath}/${projectName}`,
      config
    });

    this.domainRegistry.registerDomain(instance);

    // 5. Start MCP servers
    await this.startMCPServers(instance);
  }

  private async initializeDatabase(config: DatabaseConfig): Promise<void> {
    // Run initial migrations
    const migrationsPath = `${config.projectPath}/.quallaa/domain/migrations`;
    // Execute SQL files in order
  }

  private async startMCPServers(domain: DomainProvider): Promise<void> {
    const services = domain.getServices();

    for (const service of services) {
      if (service.type === 'database') {
        await this.mcpManager.addOrUpdateServer({
          name: 'marketing-database',
          command: 'node',
          args: [`${domain.projectPath}/.quallaa/domain/mcp-servers/database.js`],
          env: { /* database connection info */ }
        });
      }

      if (service.provider === 'resend') {
        await this.mcpManager.addOrUpdateServer({
          name: 'marketing-email',
          command: 'node',
          args: [`${domain.projectPath}/.quallaa/domain/mcp-servers/email.js`],
          env: { RESEND_API_KEY: service.config.apiKey }
        });
      }
    }
  }
}
```

#### 4.2 Project Detection
```typescript
// packages/domain-core/src/browser/workspace-domain-detector.ts

@injectable()
export class WorkspaceDomainDetector {
  @inject(WorkspaceService)
  protected workspaceService: WorkspaceService;

  @inject(DomainRegistry)
  protected domainRegistry: DomainRegistry;

  @postConstruct()
  protected init(): void {
    // When workspace opens, detect project type
    this.workspaceService.onWorkspaceChanged(() => {
      this.detectAndLoadDomain();
    });
  }

  private async detectAndLoadDomain(): Promise<void> {
    const roots = await this.workspaceService.roots;

    for (const root of roots) {
      const projectPath = `${root.resource.path}/.quallaa/project.json`;
      const exists = await this.fileService.exists(projectPath);

      if (exists) {
        const content = await this.fileService.read(projectPath);
        const project = JSON.parse(content.value);

        if (project.type === 'marketing-automation') {
          await this.loadMarketingInstance(root.resource.path, project);
        }
      }
    }
  }

  private async loadMarketingInstance(
    projectPath: string,
    project: ProjectMetadata
  ): Promise<void> {
    // Create instance provider
    const instance = new MarketingInstanceProvider({
      projectPath,
      config: project
    });

    this.domainRegistry.registerDomain(instance);

    // Start MCP servers
    await this.startMCPServers(instance);

    // Load custom shell if configured
    // (See Phase 2 of marketing-environment-mvp.md)
  }
}
```

#### 4.3 Template Directory Structure
```
packages/marketing-domain/template/
├── migrations/
│   ├── 001_initial_schema.sql
│   ├── 002_add_analytics.sql
│   └── README.md
├── widgets/
│   ├── CampaignBuilder.tsx
│   ├── EmailEditor.tsx
│   ├── AudienceManager.tsx
│   └── AnalyticsDashboard.tsx
├── services/
│   ├── campaign-service.ts
│   ├── email-service.ts
│   └── analytics-service.ts
├── mcp-servers/
│   ├── database.ts
│   ├── email.ts
│   └── analytics.ts
├── types/
│   ├── campaign-types.ts
│   ├── customer-types.ts
│   └── analytics-types.ts
├── ai-tools/
│   └── marketing-tools.json
└── README.md
```

### Success Criteria
- [ ] Can create new marketing project via wizard
- [ ] Template files copied to `.quallaa/domain/`
- [ ] Domain instance registered with DomainRegistry
- [ ] MCP servers start automatically
- [ ] Workspace detection loads existing projects

---

## Phase 5: Customization Tracking (Days 12-13, ~2 days)

### Objectives
- Track when AI modifies domain
- Record what changed and why
- Persist customization history
- Enable undo/redo

### Components

#### 5.1 Instance Provider with Customization Support
```typescript
// packages/marketing-domain/src/browser/marketing-instance-provider.ts

@injectable()
export class MarketingInstanceProvider implements DomainProvider {
  readonly id = 'marketing-automation';
  readonly displayName = 'Marketing Automation';
  readonly isTemplate = false;
  readonly modifiable = true;

  private capabilities: DomainCapability[];
  private customizations: DomainCustomization[] = [];

  constructor(config: InstanceConfig) {
    // Load capabilities from template
    this.capabilities = [...baseCapabilities];

    // Load any saved customizations
    this.loadCustomizations(config.projectPath);
  }

  registerCapability(capability: DomainCapability): void {
    this.capabilities.push({
      ...capability,
      source: 'user-customization',
      addedAt: new Date()
    });

    this.saveCapabilities();
  }

  recordCustomization(customization: DomainCustomization): void {
    this.customizations.push(customization);
    this.saveCustomizations();
  }

  private async loadCustomizations(projectPath: string): Promise<void> {
    const path = `${projectPath}/.quallaa/customizations.json`;
    if (await this.fileService.exists(path)) {
      const content = await this.fileService.read(path);
      this.customizations = JSON.parse(content.value);
    }
  }

  private async saveCustomizations(): Promise<void> {
    const path = `${this.projectPath}/.quallaa/customizations.json`;
    await this.fileService.write(
      path,
      JSON.stringify(this.customizations, null, 2)
    );
  }
}
```

#### 5.2 Post-Customization Hook
```typescript
// In MarketingCampaignAgent

private async handleDomainCustomization(
  domain: DomainProvider,
  intent: CustomizationIntent,
  request: MutableChatRequestModel
): Promise<void> {
  // Build and delegate to Claude Code
  const prompt = this.buildCustomizationPrompt(domain, intent);
  request.request.text = `@ClaudeCode ${prompt}`;

  await this.claudeCode.invoke(request);

  // Wait for user to approve changes
  // (Claude Code tracks edits in session)

  // After approval (hook into change approval event):
  this.onChangesApproved(request.sessionId, async (changes) => {
    // Extract what was modified
    const filesModified = changes.map(c => c.filePath);

    // Record customization
    if (domain.recordCustomization) {
      domain.recordCustomization({
        timestamp: new Date(),
        description: intent.description,
        userCommand: request.request.text,
        filesModified,
        capabilitiesAdded: [intent.newCapability],
        capabilitiesRemoved: [],
        aiModel: 'claude-3.5-sonnet',
        tokensUsed: await this.getSessionTokens(request.sessionId)
      });
    }

    // Register new capability
    if (domain.registerCapability) {
      domain.registerCapability({
        id: intent.newCapability,
        displayName: intent.displayName,
        description: intent.description,
        source: 'user-customization',
        addedAt: new Date()
      });
    }

    // Restart MCP servers if needed
    if (filesModified.some(f => f.includes('migrations/'))) {
      await this.restartMCPServers(domain);
    }
  });
}
```

#### 5.3 Customization History View
```typescript
// Simple widget showing customization history

export class CustomizationHistoryWidget extends ReactWidget {
  render(): React.ReactNode {
    const domain = this.domainRegistry.getDomain('marketing-automation');
    const customizations = domain?.getCustomizations() || [];

    return (
      <div className="customization-history">
        <h3>Domain Customizations</h3>
        {customizations.map(c => (
          <div key={c.timestamp.toString()} className="customization-item">
            <div className="timestamp">{c.timestamp.toLocaleString()}</div>
            <div className="description">{c.description}</div>
            <div className="user-command">"{c.userCommand}"</div>
            <div className="files">
              Modified: {c.filesModified.join(', ')}
            </div>
            <div className="capabilities">
              Added: {c.capabilitiesAdded.join(', ')}
            </div>
            <div className="metadata">
              Model: {c.aiModel} | Tokens: {c.tokensUsed}
            </div>
          </div>
        ))}
      </div>
    );
  }
}
```

### Success Criteria
- [ ] Customizations saved to `.quallaa/customizations.json`
- [ ] Capabilities tracked in `.quallaa/capabilities.json`
- [ ] Can view customization history
- [ ] Timestamps, file changes, and token usage recorded

---

## Phase 6: End-to-End Demo (Days 14-15, ~2 days)

### Objectives
- Create complete workflow demonstration
- Test all integration points
- Document usage patterns
- Record demo video

### Demo Script

#### Setup
1. Start Quallaa with Claude Code enabled
2. Create new marketing project: "Acme Marketing"
3. Configure PostgreSQL and Resend API keys

#### Scenario 1: Basic Operation (No Customization)
```
User: @MarketingCampaign show me all customers who signed up this week

Agent: Uses query_customers MCP tool
Result: Displays 47 customers in table

User: @MarketingCampaign create segment "New This Week" for those customers

Agent: Uses create_segment MCP tool
Result: Segment created with ID 123

User: @MarketingCampaign send welcome email to segment 123

Agent: Uses send_campaign MCP tool
Result: 47 emails sent via Resend
```

#### Scenario 2: Domain Customization (The Magic!)
```
User: @MarketingCampaign I need to track webinar campaigns with registration counts

Agent: Detects customization intent
      Checks current capabilities: campaign-management, email-automation, audience-segmentation
      Determines: Needs new capability "webinar-tracking"
      Delegates to Claude Code with domain context

Claude Code:
      Reads .quallaa/domain/migrations/002_analytics.sql (current schema)
      Creates .quallaa/domain/migrations/003_webinar_support.sql:
        CREATE TABLE webinar_campaigns (
          id SERIAL PRIMARY KEY,
          campaign_id INTEGER REFERENCES campaigns(id),
          webinar_date TIMESTAMP,
          registration_count INTEGER,
          attendance_count INTEGER
        );

      Creates .quallaa/domain/widgets/WebinarCampaignBuilder.tsx:
        export class WebinarCampaignBuilder extends React.Component {
          // Form with webinar date, registration tracking
        }

      Updates .quallaa/domain/types/campaign-types.ts:
        export interface WebinarCampaign extends Campaign {
          webinarDate: Date;
          registrationCount: number;
          attendanceCount: number;
        }

      Updates .quallaa/domain/ai-tools/marketing-tools.json:
        {
          "name": "create_webinar_campaign",
          "description": "Create webinar campaign with registration tracking"
        }

User: Reviews all changes in diff view
      Approves changes

System: domain.recordCustomization({ ... })
        domain.registerCapability('webinar-tracking')
        Restarts MCP servers with new schema

UI: "Webinar Campaigns" tab appears in shell
    Can now create webinar campaigns

User: @MarketingCampaign create webinar campaign for "AI Workshop" on March 15

Agent: Uses NEW create_webinar_campaign MCP tool
Result: Webinar campaign created!
```

### Demo Validation
- [ ] Basic operations work via MCP tools
- [ ] Customization request triggers Claude Code delegation
- [ ] Claude Code receives domain context (capabilities, source paths)
- [ ] All file modifications appear in diff view
- [ ] User can approve/reject changes
- [ ] After approval, new capability is registered
- [ ] MCP servers restart with new schema
- [ ] New capability immediately usable

---

## Success Metrics

### Technical Metrics
- [ ] Agent can detect 90%+ customization vs. operation intents
- [ ] Claude Code successfully modifies domain files
- [ ] MCP tools execute without errors
- [ ] Customization tracking persists across sessions
- [ ] End-to-end latency < 30 seconds for simple customizations

### User Experience Metrics
- [ ] Domain expert can request customization in natural language
- [ ] Changes are reviewable before applying
- [ ] New capabilities work immediately after approval
- [ ] Customization history is clear and informative

### Code Quality Metrics
- [ ] All new packages compile without errors
- [ ] DI bindings work correctly
- [ ] No memory leaks in long-running sessions
- [ ] Follows Theia/Quallaa coding standards

---

## Dependencies & Prerequisites

### Already Available ✅
- Theia 1.65.0 with Claude Code integration
- Domain abstraction architecture
- Marketing domain template
- MCP framework

### Need to Install
```bash
# PostgreSQL (for local development)
brew install postgresql
brew services start postgresql

# Resend SDK
npm install resend

# PostgreSQL client
npm install pg
```

### Environment Variables
```bash
export ANTHROPIC_API_KEY="sk-ant-..."
export DATABASE_URL="postgresql://localhost/quallaa_marketing"
export RESEND_API_KEY="re_..."
```

---

## Risk Mitigation

### Risk: Claude Code makes incorrect modifications
**Mitigation**:
- User reviews all changes before approval
- Can reject and retry with refined prompt
- Customization history allows rollback

### Risk: MCP tools fail or timeout
**Mitigation**:
- Graceful error handling
- Retry logic with exponential backoff
- Fallback to manual operations

### Risk: Intent parsing misclassifies user requests
**Mitigation**:
- Start with simple keyword matching
- Add LLM-based classification in Phase 7
- Allow user to override agent choice (`@ClaudeCode` directly)

### Risk: Database migrations fail
**Mitigation**:
- Dry-run migrations before applying
- Automatic backups before schema changes
- Rollback capability

---

## Future Enhancements (Post-MVP)

### Phase 7: Advanced Intent Understanding
- Use LLM for intent classification
- Multi-step customization workflows
- Context-aware suggestions

### Phase 8: Customization Marketplace
- Share customizations between users
- Template customizations for common use cases
- Community-contributed capabilities

### Phase 9: Multi-Domain Support
- Finance domain
- Legal domain
- Consulting domain
- Cross-domain data sharing

### Phase 10: Team Collaboration
- Shared customization history
- Approval workflows for customizations
- Domain versioning and branching

---

## Appendix: Key Files Reference

### Domain Architecture
- `packages/domain-core/src/common/domain-protocol.ts` - Core interfaces
- `packages/marketing-domain/src/browser/marketing-domain-provider.ts` - Template

### Claude Code Integration
- `packages/ai-claude-code/src/browser/claude-code-chat-agent.ts` - Agent implementation
- `packages/ai-claude-code/src/browser/claude-code-edit-tool-service.ts` - Change tracking

### MCP Integration
- `packages/ai-mcp/src/node/mcp-server-manager-impl.ts` - Server management
- `packages/ai-mcp/src/common/mcp-server-manager.ts` - Protocol

### AI Framework
- `packages/ai-core/src/common/agent.ts` - Agent interface
- `packages/ai-chat/src/common/chat-agent-service.ts` - Agent registry

---

## Timeline Summary

| Phase | Days | Description |
|-------|------|-------------|
| 1 | 0.5 | Verify Claude Code integration |
| 2 | 3 | Marketing Campaign Agent |
| 3 | 4 | MCP servers (database, email) |
| 4 | 3 | Domain instance creation |
| 5 | 2 | Customization tracking |
| 6 | 2 | End-to-end demo |
| **Total** | **14.5** | **~3 weeks** |

---

## Next Steps

1. Review this plan with team
2. Validate Phase 1 (Claude Code works)
3. Begin Phase 2 implementation
4. Iterate based on learnings

---

**Questions? Concerns? Suggestions?**
This is a living document. Update as implementation progresses.
