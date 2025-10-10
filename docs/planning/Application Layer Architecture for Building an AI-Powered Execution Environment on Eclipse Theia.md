# Application Layer Architecture for Building an AI-Powered Execution Environment on Eclipse Theia

## Executive Summary

This research report provides comprehensive architectural guidance for building an AI Execution Environment on Eclipse Theia targeting non-technical domain experts. The platform implements a three-way relationship between visual UI, AI command interface, and underlying files, with progressive disclosure, domain-specific environments, and real-time synchronization. This analysis synthesizes patterns from industry-leading tools including GitHub Copilot, Cursor IDE, VS Code, and modern online IDEs to provide actionable implementation strategies.

---

## 1. Eclipse Theia Architecture Foundation

### Core Extension Strategy

**Hybrid Extension Approach for Quallaa**

Eclipse Theia's dual extension model provides the perfect foundation for your use case:

**Theia Extensions (Compile-time) for Core Platform:**
- Custom workbench layout for domain-specific environments
- Domain registry and management system
- AI integration layer with full platform access
- Custom file system providers for domain abstractions
- Visual editors with unrestricted DOM manipulation

**VS Code Extensions (Runtime) for Domain Features:**
- User-installable domain packages from marketplace
- Language servers for domain-specific languages (marketing automation DSL)
- Syntax highlighting and code completion
- Compatible with existing VS Code extension ecosystem

This hybrid approach allows you to build a deeply customized platform while maintaining an open ecosystem for domain extensions.

### Dependency Injection Architecture for Domain Abstraction

Theia's InversifyJS-based DI system is ideal for your pluggable domain architecture:

```typescript
// Core abstraction interfaces (common package)
export const DomainProvider = Symbol('DomainProvider');

export interface DomainProvider {
  readonly id: string;
  readonly displayName: string;
  getCapabilities(): DomainCapability[];
  createEditor(uri: URI): Promise<DomainEditor>;
  createAIContext(): AIContextProvider;
}

// Contribution point pattern for domain registration
export const DomainContribution = Symbol('DomainContribution');

export interface DomainContribution {
  registerDomain(registry: DomainRegistry): void;
}

// Domain registry implementation
@injectable()
export class DomainRegistry {
  @inject(ContributionProvider)
  @named(DomainContribution)
  protected readonly contributions: ContributionProvider<DomainContribution>;

  @postConstruct()
  protected init(): void {
    this.contributions.getContributions()
      .forEach(contrib => contrib.registerDomain(this));
  }
}

// Marketing domain implementation
@injectable()
export class MarketingDomainProvider implements DomainProvider {
  readonly id = 'marketing-automation';
  readonly displayName = 'Marketing Automation';
  
  getCapabilities(): DomainCapability[] {
    return [
      DomainCapability.VISUAL_CAMPAIGN_BUILDER,
      DomainCapability.EMAIL_TEMPLATES,
      DomainCapability.ANALYTICS_DASHBOARD
    ];
  }
}
```

**Key Benefits:**
- Domains register themselves via contribution points (no direct coupling)
- Core platform remains domain-agnostic
- New domains added without modifying core code
- Service substitution enables testing and customization

### Custom Editor Implementation Pattern

For domain-specific visual editors with AI integration:

```typescript
@injectable()
export class CampaignEditorWidget extends ReactWidget 
  implements Saveable, AICommandTarget {
  
  @inject(FileService) 
  protected fileService: FileService;
  
  @inject(AICommandService)
  protected aiService: AICommandService;
  
  @inject(MarketingDomainContext)
  protected domainContext: MarketingDomainContext;
  
  // Three-way sync state
  private visualState: CampaignState;
  private fileContent: string;
  private syncManager: StateSyncManager;
  
  @postConstruct()
  protected async init(): Promise<void> {
    // Initialize sync manager for three-way relationship
    this.syncManager = new StateSyncManager({
      onVisualChange: (state) => this.syncToFile(state),
      onFileChange: (content) => this.syncToVisual(content),
      onAIChange: (command) => this.applyAICommand(command)
    });
    
    // Watch file changes
    this.toDispose.push(
      this.fileService.watch(this.uri)
    );
  }
  
  protected render(): React.ReactNode {
    return (
      <CampaignBuilder
        state={this.visualState}
        onChange={(state) => this.handleVisualEdit(state)}
        aiAssistant={this.aiService}
        domainContext={this.domainContext}
      />
    );
  }
  
  // AI command interface implementation
  async executeAICommand(command: AICommand): Promise<void> {
    const changes = await this.aiService.processCommand(
      command,
      this.getAIContext()
    );
    this.syncManager.applyAIChanges(changes);
  }
}
```

**Real-World Reference:** Arduino IDE 2.0 successfully used this pattern to create custom toolbars, board selection widgets, and serial monitors while maintaining Theia's core functionality.

---

## 2. Domain Abstraction Layer

### Pluggable Domain Architecture

**Registry Pattern with Factory Method:**

```typescript
// Domain factory interface
export interface DomainFactory {
  createProvider(): DomainProvider;
  createEditors(): Map<string, WidgetFactory>;
  createAITools(): AIToolRegistry;
  createValidators(): ValidationService;
}

// Domain registry managing all domains
@injectable()
export class DomainManager {
  private domains = new Map<string, DomainFactory>();
  private activeDomain?: string;
  
  @inject(PreferenceService)
  protected preferences: PreferenceService;
  
  registerDomain(id: string, factory: DomainFactory): void {
    this.domains.set(id, factory);
    this.emitter.fire({ type: 'domain-registered', id });
  }
  
  async activateDomain(id: string): Promise<void> {
    const factory = this.domains.get(id);
    if (!factory) throw new Error(`Domain ${id} not found`);
    
    // Progressive loading - lazy initialization
    const provider = factory.createProvider();
    await provider.initialize();
    
    // Register editors
    const editors = factory.createEditors();
    editors.forEach((factory, id) => 
      this.widgetManager.registerFactory(id, factory)
    );
    
    // Configure AI tools for domain
    const aiTools = factory.createAITools();
    this.aiService.registerTools(id, aiTools);
    
    this.activeDomain = id;
    this.updateWorkbenchForDomain(id);
  }
}
```

**Domain Package Structure:**

```
packages/
├── core/                       # Core platform
│   ├── domain-registry/
│   ├── ai-integration/
│   └── sync-engine/
├── domains/
│   ├── marketing/             # Marketing domain
│   │   ├── src/
│   │   │   ├── browser/
│   │   │   │   ├── editors/  # Campaign builder, email editor
│   │   │   │   ├── views/    # Analytics, audience explorer
│   │   │   │   └── ai/       # Marketing-specific AI tools
│   │   │   ├── common/
│   │   │   │   ├── protocol/ # Domain-specific types
│   │   │   │   └── dsl/      # Marketing automation DSL
│   │   │   └── node/
│   │   │       └── services/ # Backend services
│   │   ├── package.json
│   │   └── README.md
│   ├── finance/               # Future: Finance domain
│   └── analytics/             # Future: Analytics domain
└── applications/
    └── quallaa-app/           # Main application
```

**Domain Manifest Pattern:**

```json
{
  "domainId": "marketing-automation",
  "version": "1.0.0",
  "displayName": "Marketing Automation",
  "description": "Campaign management, email automation, and analytics",
  "icon": "resources/marketing-icon.svg",
  "capabilities": [
    "campaign-builder",
    "email-templates",
    "audience-segmentation",
    "analytics-dashboard"
  ],
  "fileTypes": [
    {
      "extension": ".campaign",
      "editorId": "marketing.campaign-editor",
      "icon": "campaign-icon.svg"
    }
  ],
  "aiTools": [
    "generate-campaign",
    "optimize-subject-lines",
    "suggest-audience-segments"
  ],
  "dependencies": {
    "platform": ">=1.5.0",
    "domains": {
      "shared-analytics": "^1.0.0"
    }
  }
}
```

### Language Server Protocol for Domain DSLs

Implement LSP servers for domain-specific languages to provide IntelliSense, validation, and AI context:

```typescript
// Marketing automation DSL language server
@injectable()
export class MarketingDSLLanguageServer {
  private connection: IConnection;
  private documents: TextDocuments<TextDocument>;
  
  async initialize(params: InitializeParams): Promise<InitializeResult> {
    return {
      capabilities: {
        textDocumentSync: TextDocumentSyncKind.Incremental,
        completionProvider: { resolveProvider: true },
        hoverProvider: true,
        definitionProvider: true,
        // AI-enhanced capabilities
        codeActionProvider: true, // AI-suggested fixes
        documentFormattingProvider: true
      }
    };
  }
  
  async onCompletion(params: TextDocumentPositionParams): Promise<CompletionItem[]> {
    const document = this.documents.get(params.textDocument.uri);
    const context = this.extractContext(document, params.position);
    
    // Combine static completions with AI suggestions
    const staticCompletions = this.getStaticCompletions(context);
    const aiCompletions = await this.aiService.suggestCompletions(context);
    
    return [...staticCompletions, ...aiCompletions];
  }
}
```

**Pattern Reference:** VS Code's language server ecosystem demonstrates this pattern excellently - Python, Java, TypeScript all use LSP with domain-specific features.

---

## 3. AI Integration Architecture

### LLM Integration with Context Aggregation

**Multi-Layer Context System inspired by Cursor IDE:**

```typescript
@injectable()
export class AIContextAggregator {
  @inject(WorkspaceService) 
  protected workspace: WorkspaceService;
  
  @inject(DomainRegistry)
  protected domainRegistry: DomainRegistry;
  
  @inject(VectorStoreService)
  protected vectorStore: VectorStoreService;
  
  async aggregateContext(command: AICommand): Promise<AIContext> {
    // Layer 1: Immediate editor context
    const editorContext = this.getActiveEditorContext();
    
    // Layer 2: Domain-specific context
    const domainContext = await this.getDomainContext();
    
    // Layer 3: Semantic search across workspace
    const relevantFiles = await this.vectorStore.search(
      command.intent,
      { limit: 5, domainFilter: this.domainRegistry.activeDomain }
    );
    
    // Layer 4: User's @-mentions
    const explicitContext = await this.resolveExplicitReferences(
      command.mentions
    );
    
    // Layer 5: Domain knowledge base
    const domainKnowledge = await this.domainRegistry
      .getActiveDomain()
      .getKnowledgeBase();
    
    return {
      editor: editorContext,
      domain: domainContext,
      codebase: relevantFiles,
      explicit: explicitContext,
      knowledge: domainKnowledge,
      tokenBudget: this.calculateTokenBudget()
    };
  }
  
  private calculateTokenBudget(): TokenAllocation {
    // Cursor-style token budget management
    return {
      systemPrompt: 1000,      // Cached
      domainKnowledge: 2000,   // Cached
      conversation: 1000,
      codeContext: 4000,
      outputReserve: 1000,
      total: 9000
    };
  }
}
```

**Caching Strategy for Performance:**

```typescript
@injectable()
export class PromptCacheService {
  private cache = new Map<string, CachedPrompt>();
  
  async getCachedPrompt(domain: string): Promise<CachedPrompt> {
    // Static system prompts for aggressive caching (Cursor pattern)
    const cacheKey = `domain:${domain}:system`;
    
    if (!this.cache.has(cacheKey)) {
      const domainProvider = await this.domainRegistry.getDomain(domain);
      const systemPrompt = await domainProvider.getSystemPrompt();
      const toolDescriptions = await domainProvider.getAITools();
      
      // Cache for LLM provider (Anthropic/OpenAI support prompt caching)
      this.cache.set(cacheKey, {
        content: `${systemPrompt}\n\n${toolDescriptions}`,
        cacheControl: { type: 'ephemeral' }
      });
    }
    
    return this.cache.get(cacheKey)!;
  }
}
```

### Streaming AI Responses to UI

**React Component Pattern with Streaming:**

```typescript
// React component for AI chat interface
export const AIChatPanel: React.FC<Props> = ({ aiService, editorContext }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [streaming, setStreaming] = useState<string>('');
  
  const handleCommand = async (command: string) => {
    setMessages([...messages, { role: 'user', content: command }]);
    setStreaming('');
    
    try {
      // Stream response chunks
      for await (const chunk of aiService.streamCompletion(command, editorContext)) {
        setStreaming(prev => prev + chunk);
      }
      
      // Finalize message
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: streaming 
      }]);
      setStreaming('');
    } catch (error) {
      handleError(error);
    }
  };
  
  return (
    <div className="ai-chat-panel">
      <MessageList messages={messages} />
      {streaming && <StreamingMessage content={streaming} />}
      <CommandInput onSubmit={handleCommand} />
    </div>
  );
};

// Backend streaming service
@injectable()
export class AIStreamingService {
  async *streamCompletion(
    command: string, 
    context: AIContext
  ): AsyncGenerator<string> {
    const response = await this.llmClient.chat.completions.create({
      model: 'gpt-4',
      messages: this.buildMessages(command, context),
      stream: true,
      tools: this.getToolsForDomain(context.domain)
    });
    
    for await (const chunk of response) {
      if (chunk.choices[0]?.delta?.content) {
        yield chunk.choices[0].delta.content;
      }
      
      // Handle tool calls
      if (chunk.choices[0]?.delta?.tool_calls) {
        yield* this.handleToolCall(chunk.choices[0].delta.tool_calls);
      }
    }
  }
}
```

### AI-Generated Code Change Management

**Semantic Diff Pattern (Cursor-inspired):**

```typescript
@injectable()
export class AIChangeApplier {
  @inject(EditorManager)
  protected editorManager: EditorManager;
  
  @inject(ValidationService)
  protected validator: ValidationService;
  
  async applyAIChanges(changes: AIGeneratedChanges): Promise<ApplyResult> {
    // Step 1: Generate semantic diff
    const semanticDiff = this.generateSemanticDiff(changes);
    
    // Step 2: Preview in editor
    const preview = await this.createPreview(semanticDiff);
    
    // Step 3: User approval (with live preview)
    const approved = await this.showPreviewDialog(preview);
    
    if (!approved) {
      return { status: 'rejected' };
    }
    
    // Step 4: Apply changes with validation
    const result = await this.applyWithValidation(semanticDiff);
    
    // Step 5: Create undo checkpoint
    this.commandHistory.pushAICommand({
      type: 'ai-changes',
      changes: semanticDiff,
      reverse: this.createReverseChanges(semanticDiff)
    });
    
    return result;
  }
  
  private async applyWithValidation(
    diff: SemanticDiff
  ): Promise<ApplyResult> {
    // Apply changes
    const files = await this.applyDiffToFiles(diff);
    
    // Validate with linter/domain validator
    const validation = await this.validator.validate(files);
    
    if (!validation.success) {
      // Feed validation errors back to AI for self-correction
      const corrected = await this.aiService.correctErrors(
        diff,
        validation.errors
      );
      return this.applyWithValidation(corrected);
    }
    
    return { status: 'success', files };
  }
}
```

**Multi-File Coordination Pattern:**

```typescript
interface MultiFileChange {
  files: Map<URI, FileChange>;
  dependencies: DependencyGraph;
  validations: ValidationRule[];
}

@injectable()
export class MultiFileChangeCoordinator {
  async planChanges(aiResponse: AIResponse): Promise<MultiFileChange> {
    // Analyze dependencies
    const graph = await this.analyzeDependencies(aiResponse.affectedFiles);
    
    // Order changes by dependency
    const ordered = this.topologicalSort(graph);
    
    // Plan validations
    const validations = this.planValidations(ordered);
    
    return { files: ordered, dependencies: graph, validations };
  }
  
  async executeChanges(plan: MultiFileChange): Promise<void> {
    for (const [uri, change] of plan.files) {
      await this.applyFileChange(uri, change);
      await this.runValidations(uri, plan.validations);
    }
  }
}
```

**Pattern Reference:** GitHub Copilot's agent mode uses ~30 tools with iterative loop: plan → execute → monitor → correct. Cursor's apply model generates semantic diffs that a specialized model converts to actual code.

---

## 4. State Synchronization Architecture

### Three-Way Sync Pattern

**Central Synchronization Manager:**

```typescript
@injectable()
export class ThreeWaySyncManager {
  // Event emitters for each source
  private visualChangeEmitter = new Emitter<VisualChange>();
  private fileChangeEmitter = new Emitter<FileChange>();
  private aiChangeEmitter = new Emitter<AIChange>();
  
  // Sync state
  private syncInProgress = false;
  private pendingChanges: Change[] = [];
  
  constructor(
    @inject(FileService) private fileService: FileService,
    @inject(EditorManager) private editorManager: EditorManager,
    @inject(AIChangeApplier) private aiApplier: AIChangeApplier
  ) {
    this.setupSyncListeners();
  }
  
  private setupSyncListeners(): void {
    // Visual UI → File + AI context
    this.visualChangeEmitter.event(change => {
      if (!this.syncInProgress) {
        this.syncInProgress = true;
        this.syncVisualToFile(change);
        this.updateAIContext(change);
        this.syncInProgress = false;
      }
    });
    
    // File change → Visual UI + AI context
    this.fileService.onDidFilesChange(event => {
      if (!this.syncInProgress) {
        this.syncInProgress = true;
        this.syncFileToVisual(event);
        this.updateAIContext(event);
        this.syncInProgress = false;
      }
    });
    
    // AI command → Visual UI + File
    this.aiChangeEmitter.event(async change => {
      if (!this.syncInProgress) {
        this.syncInProgress = true;
        await this.syncAIToVisual(change);
        await this.syncAIToFile(change);
        this.syncInProgress = false;
      }
    });
  }
  
  private async syncVisualToFile(change: VisualChange): Promise<void> {
    // Convert visual state to file representation
    const fileContent = this.visualToFileTransform(change);
    
    // Write to file system
    await this.fileService.write(change.uri, fileContent);
  }
  
  private async syncFileToVisual(event: FileChangeEvent): Promise<void> {
    // Detect conflicts
    const hasConflict = this.detectConflict(event);
    
    if (hasConflict) {
      // Show merge dialog
      const resolution = await this.showConflictDialog(event);
      this.applyResolution(resolution);
    } else {
      // Direct sync
      const visualState = this.fileToVisualTransform(event);
      this.editorManager.updateState(visualState);
    }
  }
}
```

### Conflict Resolution Strategy

**Optimistic Concurrency with Three-Way Merge:**

```typescript
@injectable()
export class ConflictResolver {
  async resolveConflict(
    visualState: State,
    fileState: State,
    aiState: State
  ): Promise<ResolvedState> {
    // Timestamp-based conflict detection
    const timestamps = {
      visual: visualState.lastModified,
      file: fileState.lastModified,
      ai: aiState.lastModified
    };
    
    // Determine conflict type
    if (this.isTwoWayConflict(timestamps)) {
      return this.resolveTwoWay(visualState, fileState);
    } else if (this.isThreeWayConflict(timestamps)) {
      return this.resolveThreeWay(visualState, fileState, aiState);
    }
    
    // No conflict - apply latest
    return this.applyLatest(timestamps, [visualState, fileState, aiState]);
  }
  
  private async resolveThreeWay(
    visual: State,
    file: State,
    ai: State
  ): Promise<ResolvedState> {
    // Attempt automatic merge
    const merged = this.attemptAutomaticMerge(visual, file, ai);
    
    if (merged.hasConflicts) {
      // Show VS Code-style 3-way merge editor
      return this.showMergeEditor({
        incoming: ai,
        current: visual,
        base: file,
        result: merged.partial
      });
    }
    
    return merged;
  }
}
```

### Command Pattern for Multi-Modal Undo/Redo

**Unified Command History:**

```typescript
interface Command {
  id: string;
  source: 'visual' | 'file' | 'ai';
  execute(): Promise<void>;
  undo(): Promise<void>;
  redo(): Promise<void>;
  canMerge(other: Command): boolean;
  merge(other: Command): Command;
}

@injectable()
export class MultiModalCommandManager {
  private undoStack: Command[] = [];
  private redoStack: Command[] = [];
  
  async executeCommand(command: Command): Promise<void> {
    // Check if can merge with recent command (e.g., consecutive typing)
    const last = this.undoStack[this.undoStack.length - 1];
    if (last && last.canMerge(command)) {
      const merged = last.merge(command);
      this.undoStack[this.undoStack.length - 1] = merged;
    } else {
      await command.execute();
      this.undoStack.push(command);
      this.redoStack = []; // Clear redo stack
    }
    
    this.emitHistoryChange();
  }
  
  async undo(): Promise<void> {
    const command = this.undoStack.pop();
    if (command) {
      await command.undo();
      this.redoStack.push(command);
      this.emitHistoryChange();
    }
  }
  
  async redo(): Promise<void> {
    const command = this.redoStack.pop();
    if (command) {
      await command.redo();
      this.undoStack.push(command);
      this.emitHistoryChange();
    }
  }
}

// Example: Visual edit command
export class VisualEditCommand implements Command {
  constructor(
    private editor: DomainEditor,
    private oldState: State,
    private newState: State
  ) {}
  
  async execute(): Promise<void> {
    await this.editor.setState(this.newState);
  }
  
  async undo(): Promise<void> {
    await this.editor.setState(this.oldState);
  }
  
  async redo(): Promise<void> {
    await this.execute();
  }
  
  canMerge(other: Command): boolean {
    return other instanceof VisualEditCommand 
      && other.editor === this.editor
      && this.isIncrementalEdit(other);
  }
}
```

**Pattern Reference:** Zed editor's collaborative undo/redo uses operation ID maps instead of stacks, allowing arbitrary-order undo across multiple users. VS Code Live Share implements similar patterns for real-time collaboration.

---

## 5. Execution & Preview Environment

### Hot-Reloading Preview System

**WebContainer Integration for Browser-Based Execution:**

```typescript
@injectable()
export class PreviewManager {
  private webcontainer?: WebContainer;
  private previewUrl?: string;
  
  @inject(FileService)
  protected fileService: FileService;
  
  async initialize(): Promise<void> {
    // Boot WebContainer (StackBlitz technology)
    this.webcontainer = await WebContainer.boot();
    
    // Mount workspace files
    await this.mountFiles();
    
    // Install dependencies
    await this.installDependencies();
    
    // Start dev server
    const process = await this.webcontainer.spawn('npm', ['run', 'dev']);
    
    // Capture server URL
    this.webcontainer.on('server-ready', (port, url) => {
      this.previewUrl = url;
      this.openPreview(url);
    });
  }
  
  async onFileChange(uri: URI): Promise<void> {
    // Hot reload on file change
    const content = await this.fileService.read(uri);
    await this.webcontainer?.fs.writeFile(
      uri.path.toString(),
      content.value
    );
    // WebContainer handles HMR automatically
  }
  
  private async mountFiles(): Promise<void> {
    const files = await this.getWorkspaceFiles();
    await this.webcontainer?.mount(files);
  }
}
```

**Domain-Specific Runtime Configuration:**

```typescript
// Marketing domain runtime
export class MarketingRuntimeProvider implements RuntimeProvider {
  async getRuntimeConfig(): Promise<RuntimeConfig> {
    return {
      framework: 'react',
      entryPoint: 'src/campaign-preview.tsx',
      hmr: {
        enabled: true,
        port: 3000,
        overlay: false // Hide error overlay for non-technical users
      },
      devServer: {
        proxy: {
          '/api': 'https://marketing-api.example.com'
        }
      },
      preview: {
        iframe: true,
        sandbox: ['allow-scripts', 'allow-same-origin'],
        csp: this.getCSPHeaders()
      }
    };
  }
}
```

### Sandboxed Execution with Security

**Iframe + Web Worker Pattern:**

```typescript
@injectable()
export class SandboxExecutionService {
  private iframe?: HTMLIFrameElement;
  private worker?: Worker;
  
  async createSandbox(): Promise<SandboxContext> {
    // Create sandboxed iframe
    this.iframe = document.createElement('iframe');
    this.iframe.sandbox.add(
      'allow-scripts',
      'allow-same-origin', // Needed for service workers
      'allow-forms'
    );
    
    // Set CSP headers
    const csp = this.generateCSP();
    this.iframe.setAttribute('csp', csp);
    
    // Create worker for compute-heavy tasks
    this.worker = new Worker('sandbox-worker.js');
    
    // Setup message passing
    const messageChannel = new MessageChannel();
    
    return {
      iframe: this.iframe,
      worker: this.worker,
      postMessage: (msg) => messageChannel.port1.postMessage(msg),
      onMessage: (handler) => messageChannel.port2.onmessage = handler
    };
  }
  
  private generateCSP(): string {
    return [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval'", // Needed for dynamic code
      "style-src 'self' 'unsafe-inline'",
      "connect-src 'self' https://api.example.com",
      "img-src 'self' data: https:",
      "frame-ancestors 'none'"
    ].join('; ');
  }
}
```

**Pattern Reference:** StackBlitz's WebContainers run entirely in the browser sandbox with 20% faster builds than local. CodeSandbox uses Firecracker microVMs with 2-second cold starts and 500ms snapshot resume.

### Live State Management with Time-Travel

**State Snapshot System:**

```typescript
@injectable()
export class StateSnapshotManager {
  private snapshots: Snapshot[] = [];
  private currentIndex = -1;
  
  @inject(EditorManager)
  protected editorManager: EditorManager;
  
  async captureSnapshot(label?: string): Promise<void> {
    const snapshot: Snapshot = {
      id: uuid(),
      timestamp: Date.now(),
      label: label || `Snapshot ${this.snapshots.length + 1}`,
      state: await this.captureFullState()
    };
    
    // Truncate future if we're not at the end
    if (this.currentIndex < this.snapshots.length - 1) {
      this.snapshots = this.snapshots.slice(0, this.currentIndex + 1);
    }
    
    this.snapshots.push(snapshot);
    this.currentIndex = this.snapshots.length - 1;
  }
  
  async restoreSnapshot(id: string): Promise<void> {
    const snapshot = this.snapshots.find(s => s.id === id);
    if (!snapshot) throw new Error('Snapshot not found');
    
    await this.restoreFullState(snapshot.state);
    this.currentIndex = this.snapshots.indexOf(snapshot);
  }
  
  async timeTravel(direction: 'back' | 'forward'): Promise<void> {
    const newIndex = direction === 'back' 
      ? this.currentIndex - 1 
      : this.currentIndex + 1;
    
    if (newIndex >= 0 && newIndex < this.snapshots.length) {
      await this.restoreSnapshot(this.snapshots[newIndex].id);
    }
  }
  
  private async captureFullState(): Promise<WorkspaceState> {
    return {
      files: await this.captureFileState(),
      editors: await this.captureEditorState(),
      ui: await this.captureUIState(),
      preview: await this.capturePreviewState()
    };
  }
}
```

**Pattern Reference:** Redux DevTools implements time-travel debugging through immutable state history. Replay.io provides production-ready time-travel debugging for JavaScript.

---

## 6. Progressive Disclosure UI Architecture

### View State Management

**Adaptive Interface Based on User Level:**

```typescript
@injectable()
export class ProgressiveUIManager {
  @inject(PreferenceService)
  protected preferences: PreferenceService;
  
  @inject(UserProfileService)
  protected userProfile: UserProfileService;
  
  private uiMode: 'beginner' | 'intermediate' | 'advanced' = 'beginner';
  
  @postConstruct()
  protected init(): void {
    // Infer user level from usage patterns
    this.uiMode = this.inferUserLevel();
    this.applyUIMode(this.uiMode);
  }
  
  private inferUserLevel(): UIMode {
    const profile = this.userProfile.getProfile();
    
    // Check usage patterns
    if (profile.commandPaletteUsage > 50) return 'advanced';
    if (profile.shortcutsUsed > 20) return 'intermediate';
    
    // Check feature usage
    if (profile.hasUsedCodeView) return 'intermediate';
    if (profile.hasUsedTerminal) return 'advanced';
    
    return 'beginner';
  }
  
  private applyUIMode(mode: UIMode): void {
    switch (mode) {
      case 'beginner':
        this.hidePanel('terminal');
        this.hidePanel('debug');
        this.hideView('file-explorer'); // Marketing users don't need files
        this.showView('campaign-gallery'); // Domain-specific
        break;
        
      case 'intermediate':
        this.showPanel('terminal', { defaultCollapsed: true });
        this.showView('file-explorer', { simplified: true });
        break;
        
      case 'advanced':
        this.showAllPanels();
        this.enableAdvancedFeatures();
        break;
    }
  }
}
```

**Domain-Specific View Layouts:**

```typescript
// Marketing domain workbench layout
export class MarketingWorkbenchLayout implements WorkbenchLayout {
  getDefaultLayout(): LayoutConfiguration {
    return {
      leftSidebar: {
        widgets: [
          'campaign-explorer',     // Instead of file explorer
          'audience-manager',
          'template-library'
        ],
        defaultOpen: 'campaign-explorer'
      },
      mainArea: {
        defaultEditor: 'visual-campaign-builder',
        splitMode: 'single' // No code editor splits for beginners
      },
      rightSidebar: {
        widgets: [
          'ai-assistant',
          'analytics-preview'
        ],
        defaultOpen: 'ai-assistant'
      },
      bottomPanel: {
        widgets: [
          'campaign-preview',
          'validation-results'
        ],
        defaultOpen: 'campaign-preview',
        hide: ['terminal', 'debug-console'] // Technical panels hidden
      }
    };
  }
}
```

### Command Palette for Discovery

**Natural Language Command Interface:**

```typescript
@injectable()
export class AIEnhancedCommandPalette extends QuickCommandService {
  @inject(AICommandService)
  protected aiService: AICommandService;
  
  async getCommands(filter: string): Promise<QuickPickItem[]> {
    // Static commands
    const staticCommands = super.getCommands(filter);
    
    // AI-suggested commands based on context
    const aiSuggestions = await this.aiService.suggestCommands({
      query: filter,
      context: this.getCurrentContext(),
      domain: this.domainRegistry.activeDomain
    });
    
    // Combine and rank
    return this.rankCommands([...staticCommands, ...aiSuggestions]);
  }
  
  private getCurrentContext(): CommandContext {
    return {
      activeEditor: this.editorManager.activeEditor?.uri.toString(),
      recentActions: this.commandHistory.getRecent(10),
      userLevel: this.progressiveUI.getUserLevel(),
      domainCapabilities: this.domainRegistry.getActiveCapabilities()
    };
  }
}
```

### Onboarding Pattern

**Interactive Tutorial System:**

```typescript
@injectable()
export class OnboardingService {
  @inject(TutorialManager)
  protected tutorialManager: TutorialManager;
  
  async startOnboarding(domain: string): Promise<void> {
    const tutorial = await this.getTutorialForDomain(domain);
    
    // Step-by-step guided tour
    await this.tutorialManager.runTutorial({
      steps: [
        {
          title: 'Welcome to Marketing Automation',
          content: 'Let\'s create your first campaign',
          highlight: 'campaign-explorer',
          action: 'none'
        },
        {
          title: 'Create a Campaign',
          content: 'Click "New Campaign" to get started',
          highlight: 'new-campaign-button',
          action: 'wait-for-click',
          onComplete: () => this.openCampaignBuilder()
        },
        {
          title: 'Meet Your AI Assistant',
          content: 'Ask questions or give commands in natural language',
          highlight: 'ai-assistant-panel',
          action: 'wait-for-input',
          examples: [
            'Create an email campaign for product launch',
            'Suggest subject lines for black friday sale'
          ]
        },
        // ... more steps
      ],
      optional: true, // Can skip
      progressive: true // Unlock more as they learn
    });
  }
}
```

**Pattern Reference:** Gitpod's instant onboarding eliminates setup entirely. Notion's scroll-based progressive disclosure reveals features when users are ready. VS Code's interactive playground teaches by doing.

---

## 7. Technical Implementation Strategy

### Frontend Architecture

**React Integration with Theia:**

```typescript
// Domain-specific React component
export const CampaignBuilderComponent: React.FC<Props> = ({
  campaign,
  onChange,
  aiAssistant
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  return (
    <div className="campaign-builder">
      {/* Progressive disclosure - basic options first */}
      <BasicCampaignOptions 
        campaign={campaign}
        onChange={onChange}
      />
      
      {/* AI assistant always visible */}
      <AIAssistantPanel assistant={aiAssistant} />
      
      {/* Advanced options - progressively disclosed */}
      <AdvancedSection 
        visible={showAdvanced}
        onToggle={setShowAdvanced}
      >
        <AdvancedCampaignOptions campaign={campaign} />
      </AdvancedSection>
      
      {/* Live preview */}
      <PreviewPane campaign={campaign} />
    </div>
  );
};

// Theia widget wrapper
@injectable()
export class CampaignBuilderWidget extends ReactWidget {
  @inject(MarketingService)
  protected marketingService: MarketingService;
  
  @inject(AIAssistant)
  protected aiAssistant: AIAssistant;
  
  protected render(): React.ReactNode {
    return (
      <CampaignBuilderComponent
        campaign={this.getCurrentCampaign()}
        onChange={this.handleChange.bind(this)}
        aiAssistant={this.aiAssistant}
      />
    );
  }
}
```

### Backend Service Architecture

**Microservices Pattern for Domain Services:**

```typescript
// Marketing domain backend service
@injectable()
export class MarketingBackendService {
  @inject(DatabaseService)
  protected db: DatabaseService;
  
  @inject(EmailServiceProxy)
  protected emailService: EmailServiceProxy;
  
  async validateCampaign(campaign: Campaign): Promise<ValidationResult> {
    // Domain-specific validation rules
    const errors: ValidationError[] = [];
    
    if (!campaign.subject) {
      errors.push({ field: 'subject', message: 'Subject is required' });
    }
    
    if (!campaign.audience || campaign.audience.size === 0) {
      errors.push({ field: 'audience', message: 'Select target audience' });
    }
    
    // AI-enhanced validation
    const aiSuggestions = await this.aiService.validateCampaign(campaign);
    
    return {
      valid: errors.length === 0,
      errors,
      suggestions: aiSuggestions
    };
  }
  
  async publishCampaign(campaign: Campaign): Promise<PublishResult> {
    // Integrate with external email service
    const result = await this.emailService.createCampaign({
      subject: campaign.subject,
      content: campaign.content,
      audience: campaign.audience.segments
    });
    
    // Store in database
    await this.db.campaigns.create({
      ...campaign,
      externalId: result.id,
      status: 'published'
    });
    
    return result;
  }
}
```

### Performance Optimization

**Lazy Loading and Code Splitting:**

```typescript
// Dynamic import for domain packages
@injectable()
export class DomainLoader {
  async loadDomain(domainId: string): Promise<DomainModule> {
    // Webpack code splitting via dynamic import
    switch (domainId) {
      case 'marketing':
        return import('@quallaa/marketing-domain');
      case 'finance':
        return import('@quallaa/finance-domain');
      default:
        throw new Error(`Unknown domain: ${domainId}`);
    }
  }
}

// Lazy load AI models
export class AIModelLoader {
  private models = new Map<string, AIModel>();
  
  async getModel(capability: string): Promise<AIModel> {
    if (!this.models.has(capability)) {
      // Load model on-demand
      const model = await this.loadModelForCapability(capability);
      this.models.set(capability, model);
    }
    return this.models.get(capability)!;
  }
}
```

**Memory Management:**

```typescript
@injectable()
export class ResourceManager implements Disposable {
  private disposables = new DisposableCollection();
  
  registerDisposable(disposable: Disposable): void {
    this.disposables.push(disposable);
  }
  
  dispose(): void {
    this.disposables.dispose();
  }
}

// Widget lifecycle management
export class ManagedWidget extends ReactWidget {
  protected resources = new ResourceManager();
  
  dispose(): void {
    this.resources.dispose();
    super.dispose();
  }
}
```

### Extension Marketplace

**Domain Package Distribution:**

```typescript
// package.json for domain extension
{
  "name": "@quallaa/marketing-domain",
  "version": "1.0.0",
  "keywords": ["theia-extension", "quallaa-domain"],
  "contributes": {
    "quallaa": {
      "domain": {
        "id": "marketing-automation",
        "displayName": "Marketing Automation",
        "entryPoint": "lib/browser/marketing-domain-module"
      }
    }
  },
  "theiaExtensions": [{
    "frontend": "lib/browser/marketing-domain-module",
    "backend": "lib/node/marketing-backend-module"
  }]
}
```

**Self-Hosted Registry for Enterprise:**

Deploy Open VSX Registry for internal domain packages:
- Control approval process for domain extensions
- Host proprietary marketing automation tools
- Version control and rollback capabilities
- Analytics on extension usage

---

## 8. Implementation Roadmap

### Phase 1: Core Platform (Months 1-3)

**Foundation:**
- Set up Theia monorepo with Lerna
- Implement domain registry system
- Create base domain abstraction interfaces
- Build three-way sync engine core
- Set up AI service integration layer

**Deliverables:**
- Working Theia application with custom branding
- Domain registry that can load/unload domains
- Basic React widget framework
- AI service connector (OpenAI/Anthropic)

### Phase 2: Marketing Domain MVP (Months 3-5)

**Marketing Domain:**
- Visual campaign builder (React component)
- Email template editor
- Basic audience segmentation UI
- Campaign file format (.campaign)
- Marketing DSL language server

**AI Integration:**
- AI assistant panel
- Natural language command processing
- Campaign generation from prompts
- Subject line optimization

**Deliverables:**
- Functional marketing automation environment
- AI-assisted campaign creation
- Visual editing with file synchronization

### Phase 3: Advanced Features (Months 5-7)

**Progressive Disclosure:**
- User level inference system
- Adaptive UI based on experience
- Interactive onboarding tutorial
- Command palette with AI suggestions

**Execution Environment:**
- Campaign preview with hot reload
- Sandboxed email preview
- Integration with email service APIs
- Analytics dashboard

**Deliverables:**
- Production-ready marketing domain
- Beginner-friendly interface
- Live preview system
- External service integrations

### Phase 4: Platform Expansion (Months 7-9)

**Multi-Domain Support:**
- Abstract marketing patterns into framework
- Create second domain (finance/analytics)
- Domain marketplace infrastructure
- Cross-domain capabilities

**Collaboration:**
- Real-time collaboration (OT/CRDT)
- Shared workspaces
- Team features
- Version control integration

**Deliverables:**
- Extensible platform architecture
- Domain package system
- Collaboration features

### Phase 5: Polish & Scale (Months 9-12)

**Performance:**
- Backend bundling optimization
- Frontend code splitting
- AI response caching
- Large file handling

**User Experience:**
- Advanced onboarding flows
- Contextual help system
- Accessibility improvements
- Mobile-responsive previews

**Deliverables:**
- Production-ready platform
- Performance optimizations
- Complete documentation

---

## 9. Key Architectural Decisions Summary

### Eclipse Theia: Right Choice

**Strengths for Your Use Case:**
- True platform (not a product) - perfect for building custom tools
- No artificial API boundaries - full customization
- React integration through ReactWidget
- Extension architecture supports domain plugins
- VS Code extension compatibility for ecosystem access
- Proven in commercial products (Arduino IDE, SAP BAS)

**Considerations:**
- More complex than VS Code (benefit: more powerful)
- Smaller community than VS Code (but responsive)
- Requires understanding of InversifyJS
- Best for custom white-labeled products (your goal)

### Domain Architecture: Contribution Points + Registry

**Pattern:** Use Theia's contribution point pattern for domain registration:
- Clean separation between core and domains
- No direct dependencies between domains
- Dynamic domain loading
- Factory pattern for domain-specific components

**Inspiration:** VS Code's language extension model + IntelliJ's plugin system

### AI Integration: Tool-Based Agent Architecture

**Pattern:** GitHub Copilot agent mode with Cursor's optimization:
- ~20-30 domain-specific tools
- Aggressive prompt caching (50-90% cost savings)
- Streaming responses with React hooks
- Semantic diff + validation loop
- Context aggregation with vector search

**Inspiration:** Cursor's apply model + GitHub Copilot's tool approach + Continue.dev's open architecture

### State Synchronization: Command Pattern + Optimistic Concurrency

**Pattern:** Central sync manager coordinating three sources:
- Command pattern for unified undo/redo
- Optimistic updates with conflict detection
- Three-way merge when conflicts occur
- Event-driven synchronization
- File watching with debouncing

**Inspiration:** Zed's CRDT approach + VS Code's editor architecture + Google Docs OT

### Execution Environment: WebContainers + Domain Runtimes

**Pattern:** StackBlitz WebContainers for browser execution:
- Zero server infrastructure
- Instant preview updates
- Domain-specific runtime configurations
- Hot module replacement
- Sandboxed iframe for preview

**Inspiration:** StackBlitz + CodeSandbox + Replit patterns

### Progressive Disclosure: Adaptive UI + Command Palette

**Pattern:** User level inference with adaptive interface:
- Three levels: beginner, intermediate, advanced
- Domain-specific layouts replacing developer UI
- Command palette for power users
- Interactive tutorials for onboarding
- Natural language AI commands

**Inspiration:** Webflow's progressive complexity + VS Code's command palette + Notion's scroll disclosure

---

## 10. Critical Success Factors

### Technical Excellence

1. **State Synchronization Reliability:** Three-way sync must be rock-solid
2. **AI Response Quality:** Context aggregation determines AI usefulness
3. **Performance:** Sub-second preview updates, fast AI responses
4. **Domain Abstraction:** Clean interfaces enable rapid domain addition

### User Experience

1. **Instant Gratification:** Users productive in minutes, not hours
2. **AI Integration:** Natural language feels magical, not gimmicky
3. **Progressive Disclosure:** Never overwhelming, always discoverable
4. **Visual Quality:** Professional, polished, marketing-tool grade

### Platform Qualities

1. **Extensibility:** Third parties can add domains
2. **Reliability:** Enterprise-grade stability
3. **Security:** Sandboxed execution, secure AI integration
4. **Performance:** Fast even with large campaigns/workspaces

---

## Conclusion

Building an AI-powered execution environment on Eclipse Theia for non-technical users is architecturally feasible and strategically sound. The research reveals consistent patterns across successful tools:

**Theia provides:** The extensible platform foundation with unlimited customization
**Domain abstraction enables:** Pluggable environments without core modifications  
**AI integration follows:** Proven patterns from Cursor, Copilot, Continue.dev
**State synchronization uses:** Battle-tested conflict resolution strategies
**Execution environment leverages:** Modern browser capabilities (WebContainers)
**Progressive disclosure applies:** Demonstrated patterns from Webflow, VS Code, Notion
**React integration offers:** Rich UI development within Theia's architecture

The three-way relationship (Visual UI ↔ AI Commands ↔ Files) is the most complex architectural challenge, requiring careful synchronization and conflict resolution. The research provides multiple proven approaches (OT, CRDT, optimistic concurrency) that can be adapted to your specific needs.

Success depends on:
1. Strong domain abstractions (clean interfaces, loose coupling)
2. Reliable state synchronization (command pattern, conflict resolution)
3. Intelligent AI integration (context aggregation, caching, validation)
4. Thoughtful progressive disclosure (adaptive UI, gradual revelation)
5. Robust execution environment (sandboxing, hot reload, previews)

The proposed architecture balances power (Theia's full extensibility) with simplicity (progressive UI for non-technical users), making it possible to serve both marketing analysts and power users effectively.

Your platform can differentiate by combining:
- Visual editing (like Webflow)
- AI assistance (like Cursor)  
- Domain specificity (like Retool)
- Progressive disclosure (like Notion)
- Browser execution (like StackBlitz)

All built on a solid, extensible Theia foundation that grows with your users' needs.

---

## ADDENDUM: Domain Modifiability Gap (Added 2025-10-10)

### Critical Architectural Insight Not Addressed in Original Research

This research report was prepared based on analysis of developer-focused AI tools (Cursor IDE, GitHub Copilot, Continue.dev) and IDE platforms (VS Code, Eclipse Theia). The recommendations are sound for those contexts, but **miss a fundamental requirement of Quallaa's architecture**.

### What the Research Assumes

The domain abstraction described in this report follows the **VS Code extension model**:

- User **installs** marketing domain (like installing an extension)
- Domain provides **fixed capabilities** (campaign builder, email editor)
- User **uses** what the domain provides
- AI helps user write their **application code** (campaigns, emails)
- Domain code itself is **not modified** by AI

This pattern works for:
- ✅ Developer tools (Cursor, Copilot helping developers write code)
- ✅ IDE extensions (fixed functionality, user installs and uses)
- ✅ SaaS products (domain-specific tools with configurable settings)

### What Quallaa Actually Requires

Quallaa's vision is fundamentally different: **Domains are AI-modifiable scaffolding, not fixed products**.

**Template → Instance → Customization Pattern:**

1. User creates "New Marketing Project" from template
2. Marketing domain **source code is copied** to user's project (`.quallaa/domain/`)
3. User commands: "I need to track webinar campaigns with registration counts"
4. AI **modifies the user's domain instance**:
   - Updates database schema (adds `webinar_campaigns` table)
   - Creates new `WebinarCampaignBuilder.tsx` widget
   - Modifies TypeScript interfaces
   - Adds backend service for registration tracking
   - Updates domain registration to expose new capability

5. User's domain **evolves uniquely** - no longer matches base template

### The Key Difference

| Research Report Assumes | Quallaa Actually Needs |
|------------------------|------------------------|
| **Installable extensions** (VS Code model) | **Copyable templates** (Replit/WordPress child theme model) |
| **Fixed capabilities** at compile time | **Dynamic capabilities** that evolve as AI modifies domain |
| **AI helps user code** (user writes app) | **AI modifies domain code** (extends platform itself) |
| **Domain as product** (use what's provided) | **Domain as scaffolding** (AI customizes to fit needs) |

### Missing Architectural Components

To support AI-modifiable domains, the architecture needs:

#### 1. Template vs. Instance Distinction
```typescript
export interface DomainProvider {
  readonly isTemplate: boolean;           // Template or user instance?
  readonly baseTemplate?: {               // If instance, what template?
    id: string;
    version: string;
  };
  readonly isModified: boolean;           // Has AI customized this?
}
```

#### 2. Source Path Metadata
AI needs to know where it can edit:
```typescript
export interface DomainProvider {
  getSourcePaths(): {
    widgets: string;      // Where to create/modify widgets
    services: string;     // Where to create/modify backend services
    migrations: string;   // Where to add database migrations
    interfaces: string;   // Where to modify TypeScript interfaces
  };
}
```

#### 3. Dynamic Capability Registration
Capabilities are not fixed - they evolve:
```typescript
export interface DomainProvider {
  getCapabilities(): DomainCapability[];        // Current capabilities
  registerCapability(cap: DomainCapability): void;  // AI adds new capability
  unregisterCapability(id: string): void;       // AI removes capability
}
```

#### 4. Customization Tracking
Track what AI has modified and why:
```typescript
export interface DomainProvider {
  getCustomizations(): DomainCustomization[];
  recordCustomization(customization: DomainCustomization): void;
}

export interface DomainCustomization {
  timestamp: Date;
  description: string;
  userCommand: string;              // "Track webinar campaigns..."
  filesModified: string[];
  capabilitiesAdded: string[];
  aiModel: string;
  tokensUsed: number;
}
```

#### 5. Infrastructure Orchestration Depth

The research mentions databases and APIs but focuses heavily on files. Quallaa requires **infrastructure as first-class**:

```typescript
export interface DomainServiceConfig {
  type: 'database' | 'api' | 'file-system' | 'queue' | 'cache' | 'runtime';
  provider: string;           // 'postgresql', 'resend', 'redis', 'docker'
  config: Record<string, any>;
  required: boolean;
}
```

AI orchestrates:
- PostgreSQL databases (customers, campaigns)
- External APIs (Resend for email, Stripe for payments)
- Background jobs (scheduled campaigns)
- File systems (templates, configuration)
- Cache layers (Redis for sessions)

Not just editing text files.

### Why This Gap Exists

The research was based on tools where:

**Cursor/GitHub Copilot**: AI helps **developers** write code
- Developer is already technical
- They understand "edit this TypeScript file"
- AI is an assistant, not primary interface

**VS Code extensions**: Fixed packages users install
- Extension provides capabilities
- User uses the extension, doesn't modify it
- Updates come from publisher

**Retool/Webflow**: Domain-specific products
- Fixed data models
- Configurable but not extensible
- Product mentality (hit ceiling)

**What the research missed:**

Quallaa enables **domain experts** (non-developers) to build custom solutions via AI commands. The domain itself must be modifiable - not just the user's application code, but the **platform capabilities**.

Closer analogies (not researched):
- **Replit templates**: Fork → modify → becomes unique project
- **WordPress child themes**: Base → customize → diverges
- **Glitch remixes**: Start from template, modify heavily
- **Jupyter notebooks**: Execute + modify in same environment

### Updated Architecture Recommendations

#### Domain Package Structure

Instead of:
```
packages/marketing-domain/    ← Installed like npm package
```

Use:
```
packages/marketing-domain/              ← Template (version controlled)
my-marketing-project/
└── .quallaa/domain/                    ← User's modifiable instance
    ├── widgets/
    ├── services/
    ├── migrations/
    └── domain-provider.ts
```

#### AI Modification Workflow

1. **User command**: "I need webinar tracking"
2. **AI analyzes**: Requires database table, widget, service
3. **AI modifies user's domain**:
   - Creates `migrations/002_add_webinars.sql`
   - Creates `widgets/WebinarCampaignBuilder.tsx`
   - Creates `services/WebinarService.ts`
   - Updates `domain-provider.ts` to register new capability
4. **Domain evolution**: User's instance diverges from template
5. **Customization tracking**: Record what changed and why

#### Validation & Safety

AI modifications must be validated:
```typescript
async function applyAIModification(changes: AIChanges): Promise<void> {
  // Apply changes
  await applyFileChanges(changes.files);

  // Validate with TypeScript compiler
  const validation = await validateTypeScript();

  if (!validation.success) {
    // AI self-corrects
    const corrected = await aiService.fixErrors(changes, validation.errors);
    return applyAIModification(corrected);
  }

  // Record customization
  await domain.recordCustomization({
    userCommand: changes.userCommand,
    filesModified: changes.files.map(f => f.path),
    // ...
  });
}
```

### Implications for Implementation

**First Tiny Step Must Support Modifiability:**

The domain abstraction interfaces (packages/domain-core) must explicitly support:
- ✅ Template vs. instance distinction
- ✅ Dynamic capability registration
- ✅ Source path declarations
- ✅ Customization tracking
- ✅ Infrastructure service orchestration

**Cannot defer this to "Phase 2"** - the foundation must support modifiability from day one, or we'll have to rebuild.

### Conclusion

This research report provides **70% of what Quallaa needs**:
- ✅ Theia as foundation (correct choice)
- ✅ Domain abstraction pattern (contribution points, DI)
- ✅ AI integration architecture (context, streaming, tools)
- ✅ Three-way sync concept (UI ↔ Code ↔ Runtime)
- ✅ Progressive disclosure patterns

The **missing 30%**:
- ❌ Domains as AI-modifiable scaffolding (not fixed extensions)
- ❌ Template → Instance → Customization lifecycle
- ❌ Infrastructure orchestration as first-class (not files-first)
- ❌ Dynamic capability evolution
- ❌ Customization tracking & version control

**Action Items:**

1. Review `docs/architecture/domain-abstraction-principles.md` (comprehensive coverage)
2. Implement domain abstraction with modifiability support (see CLAUDE.md "First Tiny Step")
3. Research backend service orchestration patterns if needed (or proceed with standard patterns)

The core insight: **We're not building domain-specific products. We're building a platform where AI helps users build their unique solutions.**

---

*Addendum prepared: 2025-10-10*
*See: `docs/architecture/domain-abstraction-principles.md` for complete architectural specification*
