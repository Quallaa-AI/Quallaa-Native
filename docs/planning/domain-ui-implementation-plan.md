# Domain UI Implementation Plan

**Date:** 2025-10-14
**Status:** Ready to Execute
**Based On:** User journey analysis and Theia architecture review

---

## Executive Summary

This document provides the complete implementation plan for Quallaa's domain-specific UI system. The plan is organized into 6 phases, each building on the previous. Total estimated time: **4-6 weeks** for MVP (Phases 1-4).

### Core Principles

1. **Domain-first UX** - Users see familiar SaaS UI (like Mailchimp), not IDE
2. **Clean architecture** - Use Theia's extension points, no core modifications
3. **Progressive disclosure** - IDE features accessible but hidden by default
4. **EPL 2.0 compliant** - All custom code in separate packages
5. **No expertise detection** - Explicit user choice, not adaptive behavior

### Architecture Overview

```
packages/
├── domain-core/              # NEW: Domain abstraction system
│   ├── common/              # Interfaces, protocols
│   ├── browser/             # Domain detection, registry, shell customizer
│   └── node/                # Project template service, scaffolding
│
├── marketing-domain/         # NEW: First domain implementation
│   ├── browser/
│   │   ├── widgets/         # Navigation, dashboard, campaigns, etc.
│   │   └── marketing-frontend-module.ts
│   └── templates/           # Project scaffolding files
│
├── knowledge-base/           # NEW: Universal docs system
│   └── browser/
│       ├── knowledge-base-widget.tsx
│       └── knowledge-base-ai-context.ts
│
└── product/                  # EXISTING: Override getting started
    └── browser/
        └── getting-started-override.tsx
```

---

## Phase 1: Foundation (Week 1)

**Goal:** Core domain abstraction system that enables all future work

### 1.1 Create `packages/domain-core/` Package

**New Package Structure:**
```
packages/domain-core/
├── package.json
├── src/
│   ├── common/
│   │   ├── domain-protocol.ts          # Core interfaces
│   │   └── project-template-protocol.ts
│   ├── browser/
│   │   ├── domain-core-frontend-module.ts
│   │   ├── domain-registry.ts          # Registry of available domains
│   │   ├── domain-workspace-manager.ts # Detects & activates domains
│   │   └── domain-commands.ts          # Show/Hide IDE Panels
│   └── node/
│       ├── domain-core-backend-module.ts
│       └── project-template-service.ts  # Scaffolds new projects
└── README.md
```

### 1.2 Define Core Interfaces

**File:** `packages/domain-core/src/common/domain-protocol.ts`

```typescript
import { URI } from '@theia/core';
import { Widget } from '@lumino/widgets';

/**
 * Symbol for dependency injection
 */
export const DomainProvider = Symbol('DomainProvider');

/**
 * A domain provider defines a complete project environment (marketing, finance, etc.)
 * Multiple domain providers can be registered, and the active one is determined by project type.
 */
export interface DomainProvider {
  /** Unique identifier (e.g., 'marketing-automation') */
  readonly id: string;

  /** Display name (e.g., 'Marketing Automation') */
  readonly displayName: string;

  /** Description for project template selector */
  readonly description: string;

  /** Icon for project template card */
  readonly icon: string; // codicon name

  /**
   * Detect if a workspace matches this domain type.
   * @param workspaceUri Root URI of the workspace
   * @returns Domain ID if matched, undefined otherwise
   */
  detectProjectType(workspaceUri: URI): Promise<string | undefined>;

  /**
   * Get widgets that this domain provides.
   * These are registered when the domain is activated.
   */
  getWidgets(): DomainWidgetContribution[];

  /**
   * Get shell layout modifications for this domain.
   */
  getShellLayout(): DomainShellLayout;

  /**
   * Called when domain is activated (workspace opened)
   */
  onActivate(): Promise<void>;

  /**
   * Called when domain is deactivated (workspace closed or switched)
   */
  onDeactivate(): Promise<void>;
}

/**
 * Widget contribution from a domain
 */
export interface DomainWidgetContribution {
  /** Widget factory ID */
  id: string;

  /** Factory function to create widget */
  factory: () => Promise<Widget>;

  /** Optional widget options */
  options?: {
    area?: 'top' | 'left' | 'right' | 'main' | 'bottom';
    rank?: number;
  };
}

/**
 * Shell layout modifications for a domain
 */
export interface DomainShellLayout {
  /** Panels to hide by default */
  hidePanels?: Array<'left' | 'right' | 'bottom'>;

  /** Widget to show in top panel (domain navigation) */
  topWidget?: string;

  /** Main area layout */
  mainLayout?: {
    /** Primary domain widget (left/main area) */
    domainWidget: string;

    /** Optional chat widget (right split) */
    chatWidget?: string;

    /** Split ratio (0.6 = 60% domain, 40% chat) */
    ratio?: number;
  };
}

/**
 * Project template for creating new domain projects
 */
export interface ProjectTemplate {
  /** Domain ID this template belongs to */
  domainId: string;

  /** Template display name */
  name: string;

  /** Template description */
  description: string;

  /** Files to scaffold */
  files: ProjectTemplateFile[];
}

export interface ProjectTemplateFile {
  /** Relative path from project root */
  path: string;

  /** File content (can be template string) */
  content: string;
}

/**
 * Parameters for creating a new project
 */
export interface CreateProjectParams {
  /** Project name */
  name: string;

  /** Parent directory URI */
  location: URI;

  /** Domain type (e.g., 'marketing') */
  domainType: string;

  /** Optional service configurations */
  services?: Record<string, unknown>;
}

/**
 * AI Context Provider - domains can provide context to Claude Code
 */
export const AIContextProvider = Symbol('AIContextProvider');

export interface AIContextProvider {
  /**
   * Provide context string for AI
   */
  provideContext(): Promise<string>;
}
```

### 1.3 Implement Domain Registry

**File:** `packages/domain-core/src/browser/domain-registry.ts`

```typescript
import { injectable, inject, named, postConstruct } from '@theia/core/shared/inversify';
import { ContributionProvider } from '@theia/core';
import { DomainProvider } from '../common/domain-protocol';

@injectable()
export class DomainRegistry {

  @inject(ContributionProvider)
  @named(DomainProvider)
  protected readonly providers: ContributionProvider<DomainProvider>;

  protected providerMap = new Map<string, DomainProvider>();

  @postConstruct()
  protected init(): void {
    // Index all domain providers by ID
    for (const provider of this.providers.getContributions()) {
      this.providerMap.set(provider.id, provider);
    }
  }

  /**
   * Get all registered domain providers
   */
  getAllProviders(): DomainProvider[] {
    return Array.from(this.providerMap.values());
  }

  /**
   * Get domain provider by ID
   */
  getProvider(id: string): DomainProvider | undefined {
    return this.providerMap.get(id);
  }

  /**
   * Detect which domain matches a workspace URI
   */
  async detectDomain(workspaceUri: URI): Promise<DomainProvider | undefined> {
    for (const provider of this.providerMap.values()) {
      const domainId = await provider.detectProjectType(workspaceUri);
      if (domainId) {
        return provider;
      }
    }
    return undefined;
  }
}
```

### 1.4 Implement Domain Workspace Manager

**File:** `packages/domain-core/src/browser/domain-workspace-manager.ts`

```typescript
import { injectable, inject, postConstruct } from '@theia/core/shared/inversify';
import { WorkspaceService } from '@theia/workspace/lib/browser';
import { ApplicationShell } from '@theia/core/lib/browser';
import { DomainRegistry } from './domain-registry';
import { DomainProvider } from '../common/domain-protocol';

/**
 * Manages domain lifecycle based on workspace changes
 */
@injectable()
export class DomainWorkspaceManager {

  @inject(WorkspaceService)
  protected readonly workspaceService: WorkspaceService;

  @inject(ApplicationShell)
  protected readonly shell: ApplicationShell;

  @inject(DomainRegistry)
  protected readonly registry: DomainRegistry;

  protected activeDomain?: DomainProvider;

  @postConstruct()
  protected init(): void {
    // Listen for workspace changes
    this.workspaceService.onWorkspaceChanged(async () => {
      await this.handleWorkspaceChange();
    });

    // Check current workspace on startup
    this.handleWorkspaceChange();
  }

  protected async handleWorkspaceChange(): Promise<void> {
    const workspace = this.workspaceService.workspace;

    // No workspace open
    if (!workspace) {
      await this.deactivateCurrentDomain();
      return;
    }

    // Detect domain type
    const domain = await this.registry.detectDomain(workspace.resource);

    if (domain) {
      // Domain project detected
      if (this.activeDomain?.id !== domain.id) {
        await this.switchDomain(domain);
      }
    } else {
      // No domain → standard IDE mode
      await this.deactivateCurrentDomain();
      await this.activateStandardIDE();
    }
  }

  protected async switchDomain(newDomain: DomainProvider): Promise<void> {
    // Deactivate current domain
    await this.deactivateCurrentDomain();

    // Activate new domain
    await this.activateDomain(newDomain);
  }

  protected async activateDomain(domain: DomainProvider): Promise<void> {
    console.log(`[DomainWorkspaceManager] Activating domain: ${domain.id}`);

    // Call domain lifecycle hook
    await domain.onActivate();

    // Apply shell layout
    await this.applyDomainLayout(domain);

    // Show default domain widgets
    await this.showDomainWidgets(domain);

    this.activeDomain = domain;
  }

  protected async deactivateCurrentDomain(): Promise<void> {
    if (!this.activeDomain) return;

    console.log(`[DomainWorkspaceManager] Deactivating domain: ${this.activeDomain.id}`);

    // Call domain lifecycle hook
    await this.activeDomain.onDeactivate();

    // Close domain widgets
    const widgets = this.activeDomain.getWidgets();
    for (const widget of widgets) {
      const w = this.shell.getWidgetById(widget.id);
      if (w) {
        w.close();
      }
    }

    this.activeDomain = undefined;
  }

  protected async applyDomainLayout(domain: DomainProvider): Promise<void> {
    const layout = domain.getShellLayout();

    // Hide panels as specified
    if (layout.hidePanels?.includes('left')) {
      this.shell.leftPanelHandler.collapse();
    }
    if (layout.hidePanels?.includes('bottom')) {
      this.shell.bottomPanel.collapse();
    }
    if (layout.hidePanels?.includes('right')) {
      this.shell.rightPanelHandler?.collapse();
    }
  }

  protected async showDomainWidgets(domain: DomainProvider): Promise<void> {
    const layout = domain.getShellLayout();

    // Show top widget (domain navigation)
    if (layout.topWidget) {
      await this.shell.revealWidget(layout.topWidget);
    }

    // Show main area widgets
    if (layout.mainLayout) {
      const { domainWidget, chatWidget, ratio = 0.6 } = layout.mainLayout;

      // Show domain widget
      await this.shell.revealWidget(domainWidget);

      // Show chat widget if specified
      if (chatWidget) {
        await this.shell.revealWidget(chatWidget);
        // TODO: Configure split ratio
      }
    }
  }

  protected async activateStandardIDE(): Promise<void> {
    console.log('[DomainWorkspaceManager] Activating standard IDE mode');

    // Show all panels
    this.shell.leftPanelHandler.expand();
    this.shell.bottomPanel.expand();
  }

  /**
   * Get currently active domain
   */
  getActiveDomain(): DomainProvider | undefined {
    return this.activeDomain;
  }
}
```

### 1.5 Implement Show/Hide IDE Panels Command

**File:** `packages/domain-core/src/browser/domain-commands.ts`

```typescript
import { injectable, inject } from '@theia/core/shared/inversify';
import { Command, CommandContribution, CommandRegistry } from '@theia/core';
import { ApplicationShell } from '@theia/core/lib/browser';
import { MenuContribution, MenuModelRegistry } from '@theia/core/lib/common';

export namespace DomainCommands {
  export const SHOW_IDE_PANELS: Command = {
    id: 'domain.showIDEPanels',
    category: 'View',
    label: 'Show IDE Panels'
  };

  export const HIDE_IDE_PANELS: Command = {
    id: 'domain.hideIDEPanels',
    category: 'View',
    label: 'Hide IDE Panels'
  };

  export const TOGGLE_IDE_PANELS: Command = {
    id: 'domain.toggleIDEPanels',
    category: 'View',
    label: 'Toggle IDE Panels'
  };
}

@injectable()
export class DomainCommandContribution implements CommandContribution {

  @inject(ApplicationShell)
  protected readonly shell: ApplicationShell;

  protected panelsVisible = false;

  registerCommands(registry: CommandRegistry): void {
    registry.registerCommand(DomainCommands.SHOW_IDE_PANELS, {
      execute: () => this.showIDEPanels()
    });

    registry.registerCommand(DomainCommands.HIDE_IDE_PANELS, {
      execute: () => this.hideIDEPanels()
    });

    registry.registerCommand(DomainCommands.TOGGLE_IDE_PANELS, {
      execute: () => this.toggleIDEPanels()
    });
  }

  protected showIDEPanels(): void {
    this.shell.leftPanelHandler.expand();
    this.shell.bottomPanel.expand();
    this.panelsVisible = true;
  }

  protected hideIDEPanels(): void {
    this.shell.leftPanelHandler.collapse();
    this.shell.bottomPanel.collapse();
    this.panelsVisible = false;
  }

  protected toggleIDEPanels(): void {
    if (this.panelsVisible) {
      this.hideIDEPanels();
    } else {
      this.showIDEPanels();
    }
  }
}

@injectable()
export class DomainMenuContribution implements MenuContribution {
  registerMenus(menus: MenuModelRegistry): void {
    menus.registerMenuAction(['view'], {
      commandId: DomainCommands.TOGGLE_IDE_PANELS.id,
      label: DomainCommands.TOGGLE_IDE_PANELS.label,
      order: '0'
    });
  }
}
```

### 1.6 Implement Project Template Service (Backend)

**File:** `packages/domain-core/src/node/project-template-service.ts`

```typescript
import { injectable, inject } from '@theia/core/shared/inversify';
import { FileService } from '@theia/filesystem/lib/browser/file-service';
import { URI } from '@theia/core';
import { CreateProjectParams, ProjectTemplate } from '../common/domain-protocol';

/**
 * Backend service for creating new domain projects
 */
@injectable()
export class ProjectTemplateService {

  @inject(FileService)
  protected readonly fileService: FileService;

  /**
   * Create a new project from template
   */
  async createProject(params: CreateProjectParams): Promise<URI> {
    // Create project directory
    const projectUri = params.location.resolve(params.name);
    await this.fileService.createFolder(projectUri);

    // Create .quallaa directory
    const quallaaDir = projectUri.resolve('.quallaa');
    await this.fileService.createFolder(quallaaDir);

    // Write project-type.json
    await this.writeProjectConfig(projectUri, params);

    // Scaffold template files
    await this.scaffoldTemplateFiles(projectUri, params.domainType);

    return projectUri;
  }

  protected async writeProjectConfig(
    projectUri: URI,
    params: CreateProjectParams
  ): Promise<void> {
    const configUri = projectUri.resolve('.quallaa/project-type.json');

    const config = {
      type: params.domainType,
      name: params.name,
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      services: params.services || {}
    };

    await this.fileService.create(
      configUri,
      JSON.stringify(config, null, 2)
    );
  }

  protected async scaffoldTemplateFiles(
    projectUri: URI,
    domainType: string
  ): Promise<void> {
    // Template files will be provided by domain packages
    // For now, create basic structure

    const dirs = [
      'campaigns',
      'emails/templates',
      'segments',
      'docs'
    ];

    for (const dir of dirs) {
      const dirUri = projectUri.resolve(dir);
      await this.fileService.createFolder(dirUri);

      // Create .gitkeep
      await this.fileService.create(
        dirUri.resolve('.gitkeep'),
        ''
      );
    }

    // Create README.md
    const readme = `# ${projectUri.path.base}\n\nMarketing automation project created with Quallaa.\n`;
    await this.fileService.create(
      projectUri.resolve('README.md'),
      readme
    );
  }
}
```

### 1.7 Wire Up Frontend Module

**File:** `packages/domain-core/src/browser/domain-core-frontend-module.ts`

```typescript
import { ContainerModule } from '@theia/core/shared/inversify';
import { DomainRegistry } from './domain-registry';
import { DomainWorkspaceManager } from './domain-workspace-manager';
import { DomainCommandContribution, DomainMenuContribution } from './domain-commands';
import { CommandContribution, MenuContribution } from '@theia/core';

export default new ContainerModule(bind => {
  // Core services
  bind(DomainRegistry).toSelf().inSingletonScope();
  bind(DomainWorkspaceManager).toSelf().inSingletonScope();

  // Commands
  bind(CommandContribution).to(DomainCommandContribution).inSingletonScope();
  bind(MenuContribution).to(DomainMenuContribution).inSingletonScope();
});
```

### 1.8 Create package.json

**File:** `packages/domain-core/package.json`

```json
{
  "name": "@theia/domain-core",
  "version": "1.0.0",
  "description": "Core domain abstraction system for Quallaa",
  "license": "EPL-2.0 OR GPL-2.0-only WITH Classpath-exception-2.0",
  "keywords": [
    "theia-extension"
  ],
  "dependencies": {
    "@theia/core": "1.56.0",
    "@theia/filesystem": "1.56.0",
    "@theia/workspace": "1.56.0"
  },
  "theiaExtensions": [
    {
      "frontend": "lib/browser/domain-core-frontend-module",
      "backend": "lib/node/domain-core-backend-module"
    }
  ],
  "scripts": {
    "build": "theiaext build",
    "clean": "theiaext clean",
    "watch": "theiaext watch"
  },
  "files": [
    "lib",
    "src"
  ]
}
```

### 1.9 Add to Root Workspace

**File:** `package.json` (root)

Add to `workspaces`:
```json
{
  "workspaces": [
    "packages/*",
    "dev-packages/*",
    "examples/*"
  ]
}
```

Update `examples/electron/package.json` to include:
```json
{
  "dependencies": {
    "@theia/domain-core": "1.0.0"
  }
}
```

---

## Phase 1 Deliverables

✅ `@theia/domain-core` package created
✅ Core interfaces defined (`DomainProvider`, `DomainShellLayout`, etc.)
✅ `DomainRegistry` tracks available domains
✅ `DomainWorkspaceManager` detects project type and activates domains
✅ Show/Hide IDE Panels commands implemented
✅ `ProjectTemplateService` can scaffold new projects

**Next:** Phase 2 - Getting Started Experience

---

## Phase 2: Getting Started Experience (Week 1-2)

**Goal:** Override Theia's default getting started screen with project template selector

### 2.1 Override Getting Started Widget

**File:** `packages/product/src/browser/getting-started-override.tsx`

```typescript
import * as React from '@theia/core/shared/react';
import { injectable, inject } from '@theia/core/shared/inversify';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import { GettingStartedWidget } from '@theia/getting-started/lib/browser/getting-started-widget';
import { DomainRegistry } from '@theia/domain-core/lib/browser/domain-registry';
import { WorkspaceService } from '@theia/workspace/lib/browser';

@injectable()
export class QuallaaGettingStartedWidget extends GettingStartedWidget {

  static override ID = GettingStartedWidget.ID; // Same ID to replace it

  @inject(DomainRegistry)
  protected readonly domainRegistry: DomainRegistry;

  @inject(WorkspaceService)
  protected readonly workspaceService: WorkspaceService;

  protected override render(): React.ReactNode {
    return <ProjectTemplateSelector
      domains={this.domainRegistry.getAllProviders()}
      onSelectTemplate={(domainId) => this.handleCreateProject(domainId)}
      onOpenExisting={() => this.handleOpenExisting()}
    />;
  }

  protected async handleCreateProject(domainId: string): Promise<void> {
    // Open project creation wizard
    // TODO: Implement wizard
  }

  protected async handleOpenExisting(): Promise<void> {
    this.workspaceService.open();
  }
}

interface ProjectTemplateSelectorProps {
  domains: DomainProvider[];
  onSelectTemplate: (domainId: string) => void;
  onOpenExisting: () => void;
}

const ProjectTemplateSelector: React.FC<ProjectTemplateSelectorProps> = ({
  domains,
  onSelectTemplate,
  onOpenExisting
}) => {
  return (
    <div className="quallaa-getting-started">
      <div className="header">
        <h1>Welcome to Quallaa</h1>
        <p>What would you like to build?</p>
      </div>

      <div className="template-grid">
        {domains.map(domain => (
          <DomainTemplateCard
            key={domain.id}
            domain={domain}
            onClick={() => onSelectTemplate(domain.id)}
          />
        ))}
      </div>

      <div className="actions">
        <button onClick={onOpenExisting}>
          Open Existing Project...
        </button>
      </div>
    </div>
  );
};

interface DomainTemplateCardProps {
  domain: DomainProvider;
  onClick: () => void;
}

const DomainTemplateCard: React.FC<DomainTemplateCardProps> = ({ domain, onClick }) => {
  return (
    <button className="template-card" onClick={onClick}>
      <div className="card-icon">
        <i className={`codicon codicon-${domain.icon}`} />
      </div>
      <h3>{domain.displayName}</h3>
      <p>{domain.description}</p>
    </button>
  );
};
```

### 2.2 Rebind Getting Started Widget

**File:** `packages/product/src/browser/product-frontend-module.ts`

```typescript
import { ContainerModule } from '@theia/core/shared/inversify';
import { GettingStartedWidget } from '@theia/getting-started/lib/browser/getting-started-widget';
import { QuallaaGettingStartedWidget } from './getting-started-override';

export default new ContainerModule(bind => {
  // Rebind getting started widget
  bind(QuallaaGettingStartedWidget).toSelf().inSingletonScope();
  bind(GettingStartedWidget).toService(QuallaaGettingStartedWidget);

  // ... existing product bindings
});
```

### 2.3 Add Styling

**File:** `packages/product/src/browser/style/getting-started.css`

```css
.quallaa-getting-started {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px;
  max-width: 1200px;
  margin: 0 auto;
}

.quallaa-getting-started .header {
  text-align: center;
  margin-bottom: 48px;
}

.quallaa-getting-started h1 {
  font-size: 32px;
  font-weight: 600;
  margin-bottom: 8px;
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  width: 100%;
  margin-bottom: 48px;
}

.template-card {
  background: var(--theia-editor-background);
  border: 1px solid var(--theia-panel-border);
  border-radius: 8px;
  padding: 32px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.template-card:hover {
  border-color: var(--theia-button-background);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.template-card .card-icon {
  font-size: 48px;
  margin-bottom: 16px;
  color: var(--theia-button-background);
}

.template-card h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
}

.template-card p {
  font-size: 14px;
  color: var(--theia-descriptionForeground);
}
```

---

## Phase 2 Deliverables

✅ Getting Started screen shows project templates
✅ Domain template cards display name, description, icon
✅ "Open Existing Project" button works
✅ Clicking template card triggers wizard (Phase 3)

**Next:** Phase 3 - Marketing Domain Implementation

---

## Phase 3: Marketing Domain (Week 2-3)

**Goal:** First working domain with navigation, dashboard, and basic campaign management

### 3.1 Create Marketing Domain Package

**Structure:**
```
packages/marketing-domain/
├── package.json
├── src/
│   ├── common/
│   │   └── marketing-protocol.ts
│   ├── browser/
│   │   ├── marketing-frontend-module.ts
│   │   ├── marketing-domain-provider.ts
│   │   ├── widgets/
│   │   │   ├── marketing-navigation-widget.tsx
│   │   │   ├── marketing-dashboard-widget.tsx
│   │   │   ├── campaign-manager-widget.tsx
│   │   │   └── audience-manager-widget.tsx
│   │   └── style/
│   │       └── marketing.css
│   └── templates/
│       └── project-files/
│           ├── campaigns/
│           ├── emails/
│           └── README.md
└── README.md
```

### 3.2 Implement Marketing Domain Provider

**File:** `packages/marketing-domain/src/browser/marketing-domain-provider.ts`

```typescript
import { injectable, inject } from '@theia/core/shared/inversify';
import { DomainProvider, DomainWidgetContribution, DomainShellLayout } from '@theia/domain-core/lib/common/domain-protocol';
import { FileService } from '@theia/filesystem/lib/browser/file-service';
import { URI } from '@theia/core';
import {
  MARKETING_NAVIGATION_ID,
  MARKETING_DASHBOARD_ID,
  CAMPAIGN_MANAGER_ID,
  AUDIENCE_MANAGER_ID
} from './widget-ids';

@injectable()
export class MarketingDomainProvider implements DomainProvider {

  readonly id = 'marketing-automation';
  readonly displayName = 'Marketing Automation';
  readonly description = 'Email campaigns, audience segments, and analytics';
  readonly icon = 'mail'; // codicon name

  @inject(FileService)
  protected readonly fileService: FileService;

  async detectProjectType(workspaceUri: URI): Promise<string | undefined> {
    // Check for .quallaa/project-type.json
    const configUri = workspaceUri.resolve('.quallaa/project-type.json');

    try {
      const content = await this.fileService.read(configUri);
      const config = JSON.parse(content.value);

      if (config.type === 'marketing') {
        return this.id;
      }
    } catch (error) {
      // File doesn't exist or invalid JSON
    }

    return undefined;
  }

  getWidgets(): DomainWidgetContribution[] {
    return [
      {
        id: MARKETING_NAVIGATION_ID,
        factory: async () => {
          // Widget created via DI - will be implemented in 3.3
          return this.widgetManager.getOrCreateWidget(MARKETING_NAVIGATION_ID);
        },
        options: {
          area: 'top',
          rank: 0
        }
      },
      {
        id: MARKETING_DASHBOARD_ID,
        factory: async () => {
          return this.widgetManager.getOrCreateWidget(MARKETING_DASHBOARD_ID);
        },
        options: {
          area: 'main'
        }
      }
      // ... more widgets
    ];
  }

  getShellLayout(): DomainShellLayout {
    return {
      hidePanels: ['left', 'bottom'],
      topWidget: MARKETING_NAVIGATION_ID,
      mainLayout: {
        domainWidget: MARKETING_DASHBOARD_ID,
        chatWidget: 'claude-code-chat', // TODO: Verify actual ID
        ratio: 0.6
      }
    };
  }

  async onActivate(): Promise<void> {
    console.log('[MarketingDomain] Activated');
    // Load domain state, initialize services, etc.
  }

  async onDeactivate(): Promise<void> {
    console.log('[MarketingDomain] Deactivated');
    // Save state, cleanup, etc.
  }
}
```

### 3.3 Implement Navigation Widget

**File:** `packages/marketing-domain/src/browser/widgets/marketing-navigation-widget.tsx`

```typescript
import * as React from '@theia/core/shared/react';
import { injectable, inject, postConstruct } from '@theia/core/shared/inversify';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import { CommandService } from '@theia/core';
import { MARKETING_NAVIGATION_ID } from '../widget-ids';

export { MARKETING_NAVIGATION_ID };

@injectable()
export class MarketingNavigationWidget extends ReactWidget {

  static readonly ID = MARKETING_NAVIGATION_ID;

  @inject(CommandService)
  protected readonly commandService: CommandService;

  protected activeTab: string = 'home';

  @postConstruct()
  protected init(): void {
    this.id = MarketingNavigationWidget.ID;
    this.title.label = 'Marketing Navigation';
    this.title.closable = false;
    this.title.iconClass = 'codicon codicon-mail';
    this.addClass('marketing-navigation');
    this.update();
  }

  protected render(): React.ReactNode {
    return (
      <div className="marketing-navigation-tabs">
        <NavigationTab
          icon="home"
          label="Home"
          active={this.activeTab === 'home'}
          onClick={() => this.navigateTo('home')}
        />
        <NavigationTab
          icon="mail"
          label="Campaigns"
          active={this.activeTab === 'campaigns'}
          onClick={() => this.navigateTo('campaigns')}
        />
        <NavigationTab
          icon="organization"
          label="Audience"
          active={this.activeTab === 'audience'}
          onClick={() => this.navigateTo('audience')}
        />
        <NavigationTab
          icon="graph"
          label="Analytics"
          active={this.activeTab === 'analytics'}
          onClick={() => this.navigateTo('analytics')}
        />
        <NavigationTab
          icon="book"
          label="Docs"
          active={this.activeTab === 'docs'}
          onClick={() => this.navigateTo('docs')}
        />
      </div>
    );
  }

  protected navigateTo(tab: string): void {
    this.activeTab = tab;
    this.update();

    // Show corresponding widget
    switch (tab) {
      case 'home':
        this.commandService.executeCommand('marketing.showDashboard');
        break;
      case 'campaigns':
        this.commandService.executeCommand('marketing.showCampaigns');
        break;
      case 'audience':
        this.commandService.executeCommand('marketing.showAudience');
        break;
      case 'analytics':
        this.commandService.executeCommand('marketing.showAnalytics');
        break;
      case 'docs':
        this.commandService.executeCommand('knowledgeBase.show');
        break;
    }
  }
}

interface NavigationTabProps {
  icon: string;
  label: string;
  active: boolean;
  onClick: () => void;
}

const NavigationTab: React.FC<NavigationTabProps> = ({ icon, label, active, onClick }) => {
  return (
    <button
      className={`nav-tab ${active ? 'active' : ''}`}
      onClick={onClick}
    >
      <i className={`codicon codicon-${icon}`} />
      <span>{label}</span>
    </button>
  );
};
```

### 3.4 Implement Dashboard Widget

**File:** `packages/marketing-domain/src/browser/widgets/marketing-dashboard-widget.tsx`

```typescript
import * as React from '@theia/core/shared/react';
import { injectable, postConstruct } from '@theia/core/shared/inversify';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import { MARKETING_DASHBOARD_ID } from '../widget-ids';

export { MARKETING_DASHBOARD_ID };

@injectable()
export class MarketingDashboardWidget extends ReactWidget {

  static readonly ID = MARKETING_DASHBOARD_ID;

  @postConstruct()
  protected init(): void {
    this.id = MarketingDashboardWidget.ID;
    this.title.label = 'Marketing Dashboard';
    this.title.closable = false;
    this.addClass('marketing-dashboard');
    this.update();
  }

  protected render(): React.ReactNode {
    return (
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>🏠 Welcome to Your Marketing Hub</h1>
          <p>Get started with your marketing automation</p>
        </div>

        <div className="quick-start">
          <h2>Quick Start</h2>
          <ul className="checklist">
            <li>
              <input type="checkbox" />
              <span>Connect Resend API</span>
            </li>
            <li>
              <input type="checkbox" />
              <span>Import your first contacts</span>
            </li>
            <li>
              <input type="checkbox" />
              <span>Create welcome campaign</span>
            </li>
          </ul>
        </div>

        <div className="recent-activity">
          <h2>Recent Activity</h2>
          <p className="empty-state">No activity yet. Create your first campaign!</p>
        </div>

        <div className="dashboard-footer">
          <span className="hint">
            💡 Tip: Press <kbd>Cmd</kbd>+<kbd>Shift</kbd>+<kbd>P</kbd> to access all commands
          </span>
        </div>
      </div>
    );
  }
}
```

### 3.5 Wire Up Frontend Module

**File:** `packages/marketing-domain/src/browser/marketing-frontend-module.ts`

```typescript
import { ContainerModule } from '@theia/core/shared/inversify';
import { DomainProvider } from '@theia/domain-core/lib/common/domain-protocol';
import { WidgetFactory } from '@theia/core/lib/browser';
import { MarketingDomainProvider } from './marketing-domain-provider';
import { MarketingNavigationWidget } from './widgets/marketing-navigation-widget';
import { MarketingDashboardWidget } from './widgets/marketing-dashboard-widget';
// ... other widgets

export default new ContainerModule(bind => {
  // Register domain provider
  bind(DomainProvider).to(MarketingDomainProvider).inSingletonScope();

  // Register navigation widget
  bind(MarketingNavigationWidget).toSelf();
  bind(WidgetFactory).toDynamicValue(ctx => ({
    id: MarketingNavigationWidget.ID,
    createWidget: () => ctx.container.get(MarketingNavigationWidget)
  })).inSingletonScope();

  // Register dashboard widget
  bind(MarketingDashboardWidget).toSelf();
  bind(WidgetFactory).toDynamicValue(ctx => ({
    id: MarketingDashboardWidget.ID,
    createWidget: () => ctx.container.get(MarketingDashboardWidget)
  })).inSingletonScope();

  // ... register more widgets
});
```

---

## Phase 3 Deliverables

✅ Marketing domain package created
✅ Domain provider detects `.quallaa/project-type.json`
✅ Navigation widget shows tabs: Home | Campaigns | Audience | Analytics | Docs
✅ Dashboard widget shows welcome screen + quick start checklist
✅ Domain activates when marketing project opened

**Next:** Phase 4 - Knowledge Base

---

## Phase 4: Knowledge Base (Week 3-4)

This will be a separate document due to length. Key components:
- Knowledge base widget (markdown editor + file list)
- AI context provider (reads .md files)
- Integration with Claude Code

---

## Implementation Timeline

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| Phase 1: Foundation | Week 1 | Domain core system working |
| Phase 2: Getting Started | Week 1-2 | Template selector appears on launch |
| Phase 3: Marketing Domain | Week 2-3 | Navigation + dashboard functional |
| Phase 4: Knowledge Base | Week 3-4 | Docs tab + AI context |
| Phase 5: IDE Integration | Week 4-5 | Toggle panels working smoothly |
| Phase 6: Claude Code | Week 5-6 | AI reads knowledge base + domain state |

**Total: 6 weeks to fully functional MVP**

---

## Testing Strategy

### Phase 1 Testing
- [ ] Create test workspace, verify domain detection
- [ ] Open workspace, verify `DomainWorkspaceManager` activates
- [ ] Run "Show IDE Panels" command, verify panels appear

### Phase 2 Testing
- [ ] Launch Quallaa with no workspace, verify template selector appears
- [ ] Click template card, verify wizard opens (when implemented)

### Phase 3 Testing
- [ ] Create marketing project, verify domain UI appears
- [ ] Click navigation tabs, verify widgets switch
- [ ] Open different project type, verify domain switches

### Phase 4 Testing
- [ ] Click Docs tab, verify knowledge base appears
- [ ] Create markdown note, verify file saved
- [ ] Query AI, verify it reads markdown files

---

## Next Steps

1. ✅ Documentation complete
2. → **Execute Phase 1** (this is where we start coding)
3. → Test Phase 1 thoroughly
4. → Execute Phase 2
5. → Continue through phases

Ready to start implementing Phase 1?
