# Quallaa Agentic Implementation Plan

**Project:** Implement Claude Agent SDK orchestration with specialized subagents
**Timeline:** 3-4 weeks
**Goal:** Transform Quallaa from UI foundation to working agentic execution environment
**Target Demo Date:** 2025-11-15

---

## Table of Contents

1. [Project Scope & Objectives](#project-scope--objectives)
2. [Technical Architecture](#technical-architecture)
3. [Prerequisites & Dependencies](#prerequisites--dependencies)
4. [Week 1: Foundation & First Agent](#week-1-foundation--first-agent)
5. [Week 2: Multi-Agent Orchestration](#week-2-multi-agent-orchestration)
6. [Week 3: Production Features](#week-3-production-features)
7. [Week 4: Polish & Demo Prep](#week-4-polish--demo-prep)
8. [Testing Strategy](#testing-strategy)
9. [Documentation Requirements](#documentation-requirements)
10. [Risk Mitigation](#risk-mitigation)
11. [Success Criteria](#success-criteria)

---

## Project Scope & Objectives

### What We're Building

Transform Quallaa from a dual-mode UI into a **command-based agentic execution environment** where users can:

```
User: "Organize my product research notes by topic"
→ File System Agent creates folders, moves files, updates links

User: "Commit my changes with a good message"
→ Git Agent reviews diff, generates message, creates commit

User: "Find all notes about React and create a summary"
→ Knowledge Base Agent searches, reads files, creates summary.md

User: "Run the tests and fix what fails"
→ Execution Agent runs tests, Code Quality Agent fixes issues
```

### Core Deliverables

**Week 1:**
- ✅ Claude Agent SDK integrated into Theia
- ✅ AI chat panel wired to Claude API
- ✅ First MCP server (filesystem operations)
- ✅ Basic conversation working

**Week 2:**
- ✅ 5 specialized subagents implemented
- ✅ Main orchestrator coordinating workflows
- ✅ MCP servers for git, terminal, search
- ✅ Multi-step demo workflows

**Week 3:**
- ✅ Guardrails and safety patterns
- ✅ Structured outputs with validation
- ✅ Basic observability
- ✅ Error handling

**Week 4:**
- ✅ Polish and optimization
- ✅ Demo preparation
- ✅ Documentation complete
- ✅ Interview-ready

### Out of Scope (Phase 2)

- Vector database / semantic search (planned, not critical for demo)
- Comprehensive eval harness (basic tests only)
- Multi-user / team features
- Advanced observability dashboard
- Web deployment optimization

---

## Technical Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         Quallaa UI                          │
│  ┌──────────┐    ┌─────────────┐    ┌──────────────┐      │
│  │   Docs   │    │   Monaco    │    │   AI Chat    │      │
│  │   Tree   │    │   Editor    │    │    Panel     │      │
│  └──────────┘    └─────────────┘    └──────┬───────┘      │
└──────────────────────────────────────────────┼──────────────┘
                                               │
                                               ▼
                                   ┌───────────────────────┐
                                   │  Main Orchestrator    │
                                   │  (Claude Agent SDK)   │
                                   └───────────┬───────────┘
                                               │
                     ┌─────────────────────────┼─────────────────────────┐
                     │                         │                         │
                     ▼                         ▼                         ▼
           ┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
           │  Knowledge Base │      │   File System   │      │   Git Agent     │
           │     Agent       │      │     Agent       │      │                 │
           └────────┬────────┘      └────────┬────────┘      └────────┬────────┘
                    │                        │                        │
                    ▼                        ▼                        ▼
           ┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
           │  Code Quality   │      │   Execution     │      │   MCP Servers   │
           │     Agent       │      │     Agent       │      │  - Filesystem   │
           └─────────────────┘      └─────────────────┘      │  - Git          │
                                                              │  - Terminal     │
                                                              │  - Search       │
                                                              └─────────────────┘
```

### Technology Stack

**Core Framework:**
- Claude Agent SDK (TypeScript/Node)
- Model Context Protocol (MCP)
- Eclipse Theia platform

**AI/ML:**
- Claude 3.5 Sonnet (primary model)
- Anthropic API

**Backend:**
- Node.js 20+
- TypeScript 5.x
- WebSocket for real-time communication

**Tools & Integrations:**
- Simple-git (git operations)
- Node filesystem APIs
- Child process for terminal execution

---

## Prerequisites & Dependencies

### Before Starting Week 1

**1. API Access**
```bash
# Get Anthropic API key
# Sign up at: https://console.anthropic.com
# Set environment variable
export ANTHROPIC_API_KEY="sk-ant-..."
```

**2. Install Claude Agent SDK**
```bash
# In project root
npm install @anthropic-ai/sdk
npm install @modelcontextprotocol/sdk
```

**3. Verify Current Build**
```bash
cd /Users/jefftoffoli/Documents/GitHub/Quallaa-Native
npm install
npm run compile
cd examples/electron
npm run start

# Verify:
# - Dual-mode toggle works (Cmd+Shift+M)
# - AI chat panel visible (right side)
# - No console errors
```

**4. Create Feature Branch**
```bash
git checkout -b feature/agentic-sdk-integration
```

**5. Set Up Development Environment**
```bash
# Create .env file in examples/electron/
cat > examples/electron/.env << EOF
ANTHROPIC_API_KEY=your_key_here
NODE_ENV=development
LOG_LEVEL=debug
EOF

# Add to .gitignore if not already there
echo ".env" >> .gitignore
```

### New Dependencies to Add

```json
// Add to packages/*/package.json as needed
{
  "dependencies": {
    "@anthropic-ai/sdk": "^0.27.0",
    "@modelcontextprotocol/sdk": "^0.5.0",
    "simple-git": "^3.25.0",
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0"
  }
}
```

---

## Week 1: Foundation & First Agent

**Goal:** Get Claude Agent SDK working in Quallaa with basic conversation and first MCP server

### Day 1-2: Claude Agent SDK Integration

**Objective:** Connect AI chat panel to Claude API

**Tasks:**

**1. Create Agent Service Package** (4 hours)

```bash
# Create new package for agent orchestration
mkdir -p packages/quallaa-agent/src/node
mkdir -p packages/quallaa-agent/src/common
mkdir -p packages/quallaa-agent/src/browser

# Create package.json
cat > packages/quallaa-agent/package.json << EOF
{
  "name": "@quallaa/agent",
  "version": "1.0.0",
  "dependencies": {
    "@anthropic-ai/sdk": "^0.27.0",
    "@modelcontextprotocol/sdk": "^0.5.0",
    "@theia/core": "1.65.0",
    "inversify": "^6.0.1"
  }
}
EOF
```

**2. Implement Claude Client Service** (6 hours)

Create `packages/quallaa-agent/src/node/claude-client-service.ts`:

```typescript
import Anthropic from '@anthropic-ai/sdk';
import { injectable } from 'inversify';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface AgentResponse {
  content: string;
  toolCalls?: ToolCall[];
}

export interface ToolCall {
  name: string;
  input: Record<string, unknown>;
}

@injectable()
export class ClaudeClientService {
  private client: Anthropic;
  private conversationHistory: Message[] = [];

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });
  }

  async sendMessage(userMessage: string): Promise<AgentResponse> {
    this.conversationHistory.push({
      role: 'user',
      content: userMessage
    });

    const response = await this.client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages: this.conversationHistory,
      system: this.getSystemPrompt()
    });

    const assistantMessage = response.content[0];

    if (assistantMessage.type === 'text') {
      this.conversationHistory.push({
        role: 'assistant',
        content: assistantMessage.text
      });

      return {
        content: assistantMessage.text
      };
    }

    throw new Error('Unexpected response type');
  }

  private getSystemPrompt(): string {
    return `You are Quallaa, an AI assistant that helps users manage their knowledge base and execute development tasks via natural language.

You can:
- Search and read markdown notes
- Create, edit, and organize files
- Run terminal commands
- Perform git operations
- Execute code and interpret results

Always be concise, helpful, and execute tasks directly when requested.`;
  }

  clearHistory(): void {
    this.conversationHistory = [];
  }
}
```

**3. Wire Up to AI Chat Panel** (4 hours)

Find and modify the AI chat widget (likely in `packages/ai-chat-ui/` or similar):

```typescript
// packages/ai-chat-ui/src/browser/ai-chat-widget.tsx

import { ClaudeClientService } from '@quallaa/agent/lib/node/claude-client-service';
import { inject, injectable } from 'inversify';

@injectable()
export class AIChatWidget extends ReactWidget {

  @inject(ClaudeClientService)
  protected readonly claudeClient: ClaudeClientService;

  protected async handleUserMessage(message: string): Promise<void> {
    try {
      // Show user message in chat
      this.addMessage('user', message);

      // Get response from Claude
      const response = await this.claudeClient.sendMessage(message);

      // Show assistant response
      this.addMessage('assistant', response.content);
    } catch (error) {
      console.error('Error sending message:', error);
      this.addMessage('error', 'Failed to get response from AI');
    }
  }
}
```

**4. Register Service in DI Container** (2 hours)

Create `packages/quallaa-agent/src/node/quallaa-agent-backend-module.ts`:

```typescript
import { ContainerModule } from 'inversify';
import { ClaudeClientService } from './claude-client-service';

export default new ContainerModule(bind => {
  bind(ClaudeClientService).toSelf().inSingletonScope();
});
```

Add to backend module imports in `examples/electron/src/backend/main.ts`.

**Day 1-2 Deliverable:**
- ✅ Type message in AI chat panel
- ✅ Get response from Claude
- ✅ Conversation history maintained
- ✅ No errors in console

**Testing:**
```
User: "Hello, what can you help me with?"
Expected: Claude responds with capabilities description

User: "What is 2+2?"
Expected: Claude responds "4"
```

---

### Day 3-4: First MCP Server (Filesystem)

**Objective:** Create MCP server for file operations and connect to Claude

**Tasks:**

**1. Create MCP Server Infrastructure** (4 hours)

```bash
mkdir -p packages/quallaa-mcp-servers/src/filesystem
mkdir -p packages/quallaa-mcp-servers/src/common
```

Create `packages/quallaa-mcp-servers/src/filesystem/filesystem-server.ts`:

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import * as fs from 'fs/promises';
import * as path from 'path';

interface ReadFileArgs {
  path: string;
}

interface WriteFileArgs {
  path: string;
  content: string;
}

interface ListFilesArgs {
  directory: string;
  pattern?: string;
}

export class FilesystemMCPServer {
  private server: Server;
  private workspaceRoot: string;

  constructor(workspaceRoot: string) {
    this.workspaceRoot = workspaceRoot;
    this.server = new Server(
      {
        name: 'quallaa-filesystem',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
  }

  private setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'read_file',
          description: 'Read the contents of a file',
          inputSchema: {
            type: 'object',
            properties: {
              path: {
                type: 'string',
                description: 'Path to the file to read (relative to workspace)',
              },
            },
            required: ['path'],
          },
        },
        {
          name: 'write_file',
          description: 'Write content to a file',
          inputSchema: {
            type: 'object',
            properties: {
              path: {
                type: 'string',
                description: 'Path to the file to write (relative to workspace)',
              },
              content: {
                type: 'string',
                description: 'Content to write to the file',
              },
            },
            required: ['path', 'content'],
          },
        },
        {
          name: 'list_files',
          description: 'List files in a directory',
          inputSchema: {
            type: 'object',
            properties: {
              directory: {
                type: 'string',
                description: 'Directory to list (relative to workspace)',
              },
              pattern: {
                type: 'string',
                description: 'Optional glob pattern to filter files',
              },
            },
            required: ['directory'],
          },
        },
      ],
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      switch (request.params.name) {
        case 'read_file':
          return await this.handleReadFile(request.params.arguments as ReadFileArgs);
        case 'write_file':
          return await this.handleWriteFile(request.params.arguments as WriteFileArgs);
        case 'list_files':
          return await this.handleListFiles(request.params.arguments as ListFilesArgs);
        default:
          throw new Error(`Unknown tool: ${request.params.name}`);
      }
    });
  }

  private async handleReadFile(args: ReadFileArgs) {
    try {
      const fullPath = path.join(this.workspaceRoot, args.path);
      const content = await fs.readFile(fullPath, 'utf-8');

      return {
        content: [
          {
            type: 'text',
            text: content,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error reading file: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  private async handleWriteFile(args: WriteFileArgs) {
    try {
      const fullPath = path.join(this.workspaceRoot, args.path);

      // Ensure directory exists
      await fs.mkdir(path.dirname(fullPath), { recursive: true });

      // Write file
      await fs.writeFile(fullPath, args.content, 'utf-8');

      return {
        content: [
          {
            type: 'text',
            text: `Successfully wrote to ${args.path}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error writing file: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  private async handleListFiles(args: ListFilesArgs) {
    try {
      const fullPath = path.join(this.workspaceRoot, args.directory);
      const entries = await fs.readdir(fullPath, { withFileTypes: true });

      const files = entries.map(entry => ({
        name: entry.name,
        type: entry.isDirectory() ? 'directory' : 'file',
      }));

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(files, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error listing files: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.log('Filesystem MCP server started');
  }
}
```

**2. Integrate MCP Server with Claude Client** (6 hours)

Update `packages/quallaa-agent/src/node/claude-client-service.ts`:

```typescript
import Anthropic from '@anthropic-ai/sdk';
import { FilesystemMCPServer } from '@quallaa/mcp-servers/lib/filesystem/filesystem-server';

@injectable()
export class ClaudeClientService {
  private client: Anthropic;
  private mcpServers: Map<string, any> = new Map();
  private availableTools: any[] = [];

  async initialize(workspaceRoot: string) {
    // Start filesystem MCP server
    const fsServer = new FilesystemMCPServer(workspaceRoot);
    await fsServer.start();
    this.mcpServers.set('filesystem', fsServer);

    // Register tools from MCP servers
    this.availableTools = [
      {
        name: 'read_file',
        description: 'Read the contents of a file',
        input_schema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Path to the file to read',
            },
          },
          required: ['path'],
        },
      },
      {
        name: 'write_file',
        description: 'Write content to a file',
        input_schema: {
          type: 'object',
          properties: {
            path: { type: 'string' },
            content: { type: 'string' },
          },
          required: ['path', 'content'],
        },
      },
      {
        name: 'list_files',
        description: 'List files in a directory',
        input_schema: {
          type: 'object',
          properties: {
            directory: { type: 'string' },
          },
          required: ['directory'],
        },
      },
    ];
  }

  async sendMessage(userMessage: string): Promise<AgentResponse> {
    this.conversationHistory.push({
      role: 'user',
      content: userMessage
    });

    const response = await this.client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages: this.conversationHistory,
      tools: this.availableTools, // Add tools to request
      system: this.getSystemPrompt()
    });

    // Handle tool use
    if (response.stop_reason === 'tool_use') {
      const toolUseBlocks = response.content.filter(
        block => block.type === 'tool_use'
      );

      // Execute tools and get results
      const toolResults = await Promise.all(
        toolUseBlocks.map(async (toolBlock) => {
          const result = await this.executeTool(
            toolBlock.name,
            toolBlock.input
          );
          return {
            type: 'tool_result',
            tool_use_id: toolBlock.id,
            content: result.content,
          };
        })
      );

      // Add tool use and results to history
      this.conversationHistory.push({
        role: 'assistant',
        content: response.content,
      });

      this.conversationHistory.push({
        role: 'user',
        content: toolResults,
      });

      // Get final response after tool execution
      return this.sendMessage(''); // Continue conversation
    }

    // Regular text response
    const textBlock = response.content.find(block => block.type === 'text');
    if (textBlock && textBlock.type === 'text') {
      this.conversationHistory.push({
        role: 'assistant',
        content: textBlock.text
      });

      return {
        content: textBlock.text
      };
    }

    throw new Error('Unexpected response format');
  }

  private async executeTool(name: string, input: any): Promise<any> {
    // Route to appropriate MCP server
    if (['read_file', 'write_file', 'list_files'].includes(name)) {
      const fsServer = this.mcpServers.get('filesystem');
      return await fsServer.handleToolCall(name, input);
    }

    throw new Error(`Unknown tool: ${name}`);
  }
}
```

**Day 3-4 Deliverable:**
- ✅ Claude can read files via tool calling
- ✅ Claude can write files via tool calling
- ✅ Claude can list directory contents

**Testing:**
```
User: "Read the README.md file"
Expected: Claude uses read_file tool and shows contents

User: "Create a file called test.md with 'Hello World'"
Expected: Claude uses write_file tool, file is created

User: "List all files in the docs folder"
Expected: Claude uses list_files tool, shows directory listing
```

---

### Day 5-7: Knowledge Base Agent (Subagent)

**Objective:** Implement first specialized subagent for knowledge base operations

**Tasks:**

**1. Create Subagent Framework** (4 hours)

Create `packages/quallaa-agent/src/node/subagents/base-agent.ts`:

```typescript
import { ClaudeClientService } from '../claude-client-service';

export interface AgentTask {
  instruction: string;
  context?: Record<string, unknown>;
}

export interface AgentResult {
  success: boolean;
  result: string;
  metadata?: Record<string, unknown>;
}

export abstract class BaseAgent {
  constructor(
    protected claudeClient: ClaudeClientService,
    protected name: string,
    protected capabilities: string[]
  ) {}

  abstract execute(task: AgentTask): Promise<AgentResult>;

  protected getSystemPrompt(): string {
    return `You are ${this.name}, a specialized agent in the Quallaa system.

Your capabilities:
${this.capabilities.map(c => `- ${c}`).join('\n')}

You should:
1. Focus only on tasks within your capabilities
2. Be concise and direct
3. Use available tools when needed
4. Report clear results

Always execute tasks directly rather than explaining what you would do.`;
  }
}
```

**2. Implement Knowledge Base Agent** (6 hours)

Create `packages/quallaa-agent/src/node/subagents/knowledge-base-agent.ts`:

```typescript
import { BaseAgent, AgentTask, AgentResult } from './base-agent';
import { ClaudeClientService } from '../claude-client-service';

export class KnowledgeBaseAgent extends BaseAgent {
  constructor(claudeClient: ClaudeClientService) {
    super(
      claudeClient,
      'Knowledge Base Agent',
      [
        'Search markdown notes semantically',
        'Read and summarize documents',
        'Find connections between concepts',
        'Extract key information from notes',
      ]
    );
  }

  async execute(task: AgentTask): Promise<AgentResult> {
    try {
      // Create isolated context for this subagent
      const subagentClient = this.createSubagentClient();

      // Send task to subagent
      const response = await subagentClient.sendMessage(
        `${task.instruction}\n\nContext: ${JSON.stringify(task.context || {})}`
      );

      return {
        success: true,
        result: response.content,
        metadata: {
          agent: this.name,
          toolsUsed: response.toolCalls?.map(t => t.name) || [],
        },
      };
    } catch (error) {
      return {
        success: false,
        result: `Error: ${error.message}`,
        metadata: {
          agent: this.name,
          error: error.message,
        },
      };
    }
  }

  private createSubagentClient(): ClaudeClientService {
    // Create new client instance with specialized system prompt
    const client = new ClaudeClientService();
    client.setSystemPrompt(this.getSystemPrompt());
    return client;
  }
}
```

**3. Implement Main Orchestrator** (6 hours)

Create `packages/quallaa-agent/src/node/orchestrator.ts`:

```typescript
import { ClaudeClientService } from './claude-client-service';
import { KnowledgeBaseAgent } from './subagents/knowledge-base-agent';
import { BaseAgent, AgentTask } from './subagents/base-agent';

export interface OrchestratorResponse {
  response: string;
  subagentsUsed: string[];
  metadata: Record<string, unknown>;
}

@injectable()
export class AgentOrchestrator {
  private agents: Map<string, BaseAgent> = new Map();
  private mainClient: ClaudeClientService;

  constructor(
    @inject(ClaudeClientService) claudeClient: ClaudeClientService
  ) {
    this.mainClient = claudeClient;
    this.initializeAgents();
  }

  private initializeAgents() {
    // Register specialized agents
    const kbAgent = new KnowledgeBaseAgent(new ClaudeClientService());
    this.agents.set('knowledge_base', kbAgent);
  }

  async processUserRequest(message: string): Promise<OrchestratorResponse> {
    // Determine if we need subagents
    const analysis = await this.analyzeRequest(message);

    if (analysis.needsSubagents) {
      return await this.orchestrateSubagents(message, analysis);
    } else {
      // Handle directly with main client
      const response = await this.mainClient.sendMessage(message);
      return {
        response: response.content,
        subagentsUsed: [],
        metadata: {},
      };
    }
  }

  private async analyzeRequest(message: string): Promise<any> {
    // Use Claude to determine if we need subagents
    const analysisPrompt = `Analyze this user request and determine if it requires specialized agents:

User request: "${message}"

Available agents:
- knowledge_base: Search notes, summarize documents, find connections

Respond with JSON:
{
  "needsSubagents": true/false,
  "agents": ["agent_name"],
  "reason": "explanation"
}`;

    const response = await this.mainClient.sendMessage(analysisPrompt);

    // Parse JSON response
    try {
      return JSON.parse(response.content);
    } catch {
      // Default to no subagents if parsing fails
      return { needsSubagents: false };
    }
  }

  private async orchestrateSubagents(
    message: string,
    analysis: any
  ): Promise<OrchestratorResponse> {
    const results = [];

    // Execute tasks with appropriate subagents
    for (const agentName of analysis.agents) {
      const agent = this.agents.get(agentName);
      if (agent) {
        const task: AgentTask = {
          instruction: message,
          context: { originalRequest: message },
        };

        const result = await agent.execute(task);
        results.push(result);
      }
    }

    // Synthesize results
    const synthesis = await this.synthesizeResults(message, results);

    return {
      response: synthesis,
      subagentsUsed: analysis.agents,
      metadata: {
        subagentResults: results,
      },
    };
  }

  private async synthesizeResults(
    originalRequest: string,
    results: any[]
  ): Promise<string> {
    const synthesisPrompt = `Synthesize these subagent results into a coherent response for the user.

Original request: "${originalRequest}"

Subagent results:
${results.map((r, i) => `${i + 1}. ${r.result}`).join('\n\n')}

Provide a clear, concise response that answers the user's request.`;

    const response = await this.mainClient.sendMessage(synthesisPrompt);
    return response.content;
  }
}
```

**4. Wire Orchestrator to UI** (4 hours)

Update AI chat widget to use orchestrator instead of direct client:

```typescript
@injectable()
export class AIChatWidget extends ReactWidget {

  @inject(AgentOrchestrator)
  protected readonly orchestrator: AgentOrchestrator;

  protected async handleUserMessage(message: string): Promise<void> {
    try {
      this.addMessage('user', message);

      // Use orchestrator instead of direct client
      const response = await this.orchestrator.processUserRequest(message);

      // Show which subagents were used (for debugging)
      if (response.subagentsUsed.length > 0) {
        console.log('Subagents used:', response.subagentsUsed);
      }

      this.addMessage('assistant', response.response);
    } catch (error) {
      console.error('Error:', error);
      this.addMessage('error', 'Failed to process request');
    }
  }
}
```

**Day 5-7 Deliverable:**
- ✅ Knowledge Base Agent working as subagent
- ✅ Orchestrator delegates to KB agent when appropriate
- ✅ Can search and summarize notes

**Testing:**
```
User: "Find all my notes about React"
Expected: KB Agent searches, returns list of files

User: "Summarize my product research notes"
Expected: KB Agent reads files, creates summary

User: "What did I write about authentication?"
Expected: KB Agent searches, extracts relevant info
```

---

## Week 2: Multi-Agent Orchestration

**Goal:** Implement remaining 4 subagents and parallel coordination

### Day 8-9: File System Agent

**Objective:** Agent for organizing files, refactoring, maintaining structure

**Tasks:**

**1. Implement File System Agent** (8 hours)

Create `packages/quallaa-agent/src/node/subagents/file-system-agent.ts`:

```typescript
import { BaseAgent, AgentTask, AgentResult } from './base-agent';

export class FileSystemAgent extends BaseAgent {
  constructor(claudeClient: ClaudeClientService) {
    super(
      claudeClient,
      'File System Agent',
      [
        'Organize files into folders',
        'Rename and move files',
        'Maintain consistent folder structure',
        'Update imports/references when moving files',
        'Clean up unused files',
      ]
    );
  }

  async execute(task: AgentTask): Promise<AgentResult> {
    // Similar to KB Agent but focused on file organization
    // Can use read_file, write_file, list_files tools
    // Plus additional logic for maintaining references
  }
}
```

**2. Add Move/Rename Tools to MCP Server** (4 hours)

Extend filesystem MCP server:

```typescript
// Add to FilesystemMCPServer
{
  name: 'move_file',
  description: 'Move or rename a file',
  inputSchema: {
    type: 'object',
    properties: {
      source: { type: 'string' },
      destination: { type: 'string' },
    },
    required: ['source', 'destination'],
  },
},
{
  name: 'delete_file',
  description: 'Delete a file (requires confirmation)',
  inputSchema: {
    type: 'object',
    properties: {
      path: { type: 'string' },
      confirmed: { type: 'boolean' },
    },
    required: ['path', 'confirmed'],
  },
}
```

**3. Register with Orchestrator** (2 hours)

Add to `orchestrator.ts`:

```typescript
private initializeAgents() {
  const kbAgent = new KnowledgeBaseAgent(new ClaudeClientService());
  const fsAgent = new FileSystemAgent(new ClaudeClientService());

  this.agents.set('knowledge_base', kbAgent);
  this.agents.set('file_system', fsAgent);
}
```

**Day 8-9 Deliverable:**
- ✅ File System Agent working
- ✅ Can organize files into folders
- ✅ Can rename and move files

**Testing:**
```
User: "Organize my components into feature folders"
Expected: FS Agent creates folders, moves files

User: "Rename all .jsx files to .tsx"
Expected: FS Agent renames files systematically
```

---

### Day 10-11: Git Agent

**Objective:** Agent for version control operations

**Tasks:**

**1. Create Git MCP Server** (6 hours)

Create `packages/quallaa-mcp-servers/src/git/git-server.ts`:

```typescript
import simpleGit, { SimpleGit } from 'simple-git';

export class GitMCPServer {
  private git: SimpleGit;

  constructor(workspaceRoot: string) {
    this.git = simpleGit(workspaceRoot);
  }

  // Implement tools:
  // - git_status
  // - git_diff
  // - git_stage
  // - git_commit
  // - git_log
  // - git_branch
}
```

**2. Implement Git Agent** (6 hours)

Create `packages/quallaa-agent/src/node/subagents/git-agent.ts`:

```typescript
export class GitAgent extends BaseAgent {
  constructor(claudeClient: ClaudeClientService) {
    super(
      claudeClient,
      'Git Agent',
      [
        'Stage and commit changes',
        'Generate descriptive commit messages',
        'Create and manage branches',
        'Review diffs and status',
      ]
    );
  }

  // Special capability: Generate commit messages from diffs
  async generateCommitMessage(diff: string): Promise<string> {
    const prompt = `Generate a concise git commit message for this diff:

${diff}

Follow conventional commits format (feat:, fix:, docs:, etc.)
Be specific about what changed and why.
Keep it under 72 characters.`;

    const response = await this.claudeClient.sendMessage(prompt);
    return response.content;
  }
}
```

**Day 10-11 Deliverable:**
- ✅ Git Agent working
- ✅ Can commit with auto-generated messages
- ✅ Can review status and diffs

**Testing:**
```
User: "Commit my changes"
Expected: Git Agent reviews diff, generates message, commits

User: "Show me what I've changed"
Expected: Git Agent shows git status and diff

User: "Create a feature branch for authentication"
Expected: Git Agent creates branch
```

---

### Day 12-13: Execution Agent

**Objective:** Agent for running terminal commands

**Tasks:**

**1. Create Terminal MCP Server with Guardrails** (6 hours)

```typescript
export class TerminalMCPServer {
  private allowedCommands = [
    'npm', 'yarn', 'node', 'python', 'git',
    'ls', 'cat', 'echo', 'mkdir', 'touch'
  ];

  private dangerousCommands = [
    'rm -rf', 'sudo', 'dd', 'mkfs', ':(){:|:&};:'
  ];

  async executeCommand(command: string): Promise<any> {
    // Validate command safety
    if (this.isDangerous(command)) {
      return {
        error: 'Dangerous command blocked',
        requiresConfirmation: true
      };
    }

    // Execute safely
    const result = await this.runCommand(command);
    return result;
  }

  private isDangerous(command: string): boolean {
    return this.dangerousCommands.some(
      dangerous => command.includes(dangerous)
    );
  }
}
```

**2. Implement Execution Agent** (6 hours)

```typescript
export class ExecutionAgent extends BaseAgent {
  constructor(claudeClient: ClaudeClientService) {
    super(
      claudeClient,
      'Execution Agent',
      [
        'Run terminal commands',
        'Execute scripts',
        'Install dependencies',
        'Run build processes',
        'Interpret command output',
      ]
    );
  }

  // Parse and explain command output
  async interpretOutput(
    command: string,
    output: string,
    exitCode: number
  ): Promise<string> {
    if (exitCode === 0) {
      return `Command succeeded:\n${output}`;
    }

    const prompt = `This command failed. Explain what went wrong and how to fix it:

Command: ${command}
Exit code: ${exitCode}
Output:
${output}

Provide a clear, actionable explanation.`;

    const response = await this.claudeClient.sendMessage(prompt);
    return response.content;
  }
}
```

**Day 12-13 Deliverable:**
- ✅ Execution Agent working
- ✅ Can run safe terminal commands
- ✅ Blocks dangerous commands
- ✅ Interprets failures

**Testing:**
```
User: "Install the dependencies"
Expected: Runs npm install, shows output

User: "Run the tests"
Expected: Runs npm test, interprets results

User: "Delete everything with rm -rf /"
Expected: Blocks dangerous command
```

---

### Day 14: Code Quality Agent

**Objective:** Agent for linting, testing, refactoring

**Tasks:**

**1. Implement Code Quality Agent** (8 hours)

```typescript
export class CodeQualityAgent extends BaseAgent {
  constructor(claudeClient: ClaudeClientService) {
    super(
      claudeClient,
      'Code Quality Agent',
      [
        'Run linters and formatters',
        'Execute tests',
        'Interpret test failures',
        'Suggest fixes for errors',
        'Refactor code',
      ]
    );
  }

  async fixLintErrors(errors: string): Promise<string> {
    // Parse lint output
    // Suggest or apply fixes
    // Return results
  }

  async interpretTestFailures(output: string): Promise<string> {
    // Parse test output
    // Explain failures
    // Suggest fixes
  }
}
```

**2. Register All Agents** (2 hours)

Update orchestrator with all 5 agents:

```typescript
private initializeAgents() {
  this.agents.set('knowledge_base', new KnowledgeBaseAgent(...));
  this.agents.set('file_system', new FileSystemAgent(...));
  this.agents.set('git', new GitAgent(...));
  this.agents.set('execution', new ExecutionAgent(...));
  this.agents.set('code_quality', new CodeQualityAgent(...));
}
```

**Day 14 Deliverable:**
- ✅ All 5 subagents registered
- ✅ Orchestrator can delegate to any agent
- ✅ Can run end-to-end workflows

**Testing:**
```
User: "Run the linter and fix all issues"
Expected: Code Quality Agent runs lint, applies fixes

User: "Run tests and fix what fails"
Expected: Execution Agent runs tests, Code Quality interprets, fixes
```

---

## Week 3: Production Features

**Goal:** Add guardrails, safety, observability, error handling

### Day 15-16: Guardrails & Safety

**Tasks:**

**1. Implement Rate Limiting** (4 hours)

```typescript
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();

  async checkLimit(userId: string, maxRequests: number, windowMs: number): Promise<boolean> {
    const now = Date.now();
    const userRequests = this.requests.get(userId) || [];

    // Remove old requests
    const recentRequests = userRequests.filter(
      timestamp => now - timestamp < windowMs
    );

    if (recentRequests.length >= maxRequests) {
      return false; // Rate limit exceeded
    }

    recentRequests.push(now);
    this.requests.set(userId, recentRequests);
    return true;
  }
}
```

**2. Implement Dangerous Operation Detection** (4 hours)

```typescript
export class SafetyChecker {
  private dangerousPatterns = [
    /rm\s+-rf\s+\//,
    /sudo\s+.*?rm/,
    /dd\s+if=/,
    /mkfs/,
    /:\(\)\{:\|:&\};:/,  // fork bomb
  ];

  isDangerous(command: string): boolean {
    return this.dangerousPatterns.some(pattern =>
      pattern.test(command)
    );
  }

  requiresConfirmation(operation: string): boolean {
    const confirmOperations = [
      'delete_file',
      'git_push',
      'npm_publish',
    ];
    return confirmOperations.includes(operation);
  }
}
```

**3. Implement User Confirmation Flows** (6 hours)

Add to AI chat widget:

```typescript
protected async confirmDangerousOperation(
  operation: string,
  details: string
): Promise<boolean> {
  return new Promise((resolve) => {
    const dialog = new ConfirmDialog({
      title: 'Confirm Operation',
      msg: `This operation requires confirmation:\n\n${operation}\n\n${details}\n\nProceed?`,
      ok: 'Confirm',
      cancel: 'Cancel'
    });

    dialog.open().then(result => {
      resolve(result === true);
    });
  });
}
```

**Day 15-16 Deliverable:**
- ✅ Rate limiting active
- ✅ Dangerous commands blocked
- ✅ Confirmation dialogs working

---

### Day 17-18: Structured Outputs & Validation

**Tasks:**

**1. Add Zod Schemas for Validation** (6 hours)

```typescript
import { z } from 'zod';

// Define schemas for tool inputs
export const ReadFileSchema = z.object({
  path: z.string().min(1),
});

export const WriteFileSchema = z.object({
  path: z.string().min(1),
  content: z.string(),
});

export const GitCommitSchema = z.object({
  message: z.string().min(1).max(72),
  files: z.array(z.string()).optional(),
});

// Validate inputs before execution
function validateToolInput<T>(schema: z.ZodSchema<T>, input: unknown): T {
  const result = schema.safeParse(input);

  if (!result.success) {
    throw new Error(`Validation failed: ${result.error.message}`);
  }

  return result.data;
}
```

**2. Add Type Safety to Agent Communication** (6 hours)

```typescript
// Define strict types for agent communication
export interface AgentTaskTyped<T = unknown> {
  instruction: string;
  context?: T;
  expectedOutput: 'text' | 'json' | 'file_list';
}

export interface AgentResultTyped<T = unknown> {
  success: boolean;
  result: T;
  metadata: {
    agent: string;
    duration: number;
    toolsUsed: string[];
  };
}

// Type-safe agent execution
class TypedBaseAgent<TInput, TOutput> {
  async execute(
    task: AgentTaskTyped<TInput>
  ): Promise<AgentResultTyped<TOutput>> {
    // Implementation with type safety
  }
}
```

**Day 17-18 Deliverable:**
- ✅ All tool inputs validated
- ✅ Type-safe agent communication
- ✅ Proper error messages for validation failures

---

### Day 19-20: Basic Observability

**Tasks:**

**1. Implement API Call Logging** (4 hours)

```typescript
export class APILogger {
  private logs: APILog[] = [];

  logRequest(request: {
    model: string;
    prompt: string;
    tokens: number;
  }): void {
    this.logs.push({
      timestamp: Date.now(),
      type: 'request',
      ...request,
    });
  }

  logResponse(response: {
    tokens: number;
    duration: number;
    cost: number;
  }): void {
    this.logs.push({
      timestamp: Date.now(),
      type: 'response',
      ...response,
    });
  }

  getMetrics(): {
    totalRequests: number;
    totalTokens: number;
    totalCost: number;
    averageDuration: number;
  } {
    // Calculate metrics from logs
  }
}
```

**2. Track Success/Failure Rates** (4 hours)

```typescript
export class SuccessTracker {
  private operations: Map<string, {
    success: number;
    failure: number;
  }> = new Map();

  recordOperation(
    operation: string,
    success: boolean
  ): void {
    const stats = this.operations.get(operation) || {
      success: 0,
      failure: 0
    };

    if (success) {
      stats.success++;
    } else {
      stats.failure++;
    }

    this.operations.set(operation, stats);
  }

  getSuccessRate(operation: string): number {
    const stats = this.operations.get(operation);
    if (!stats) return 0;

    const total = stats.success + stats.failure;
    return total > 0 ? stats.success / total : 0;
  }
}
```

**3. Simple Metrics Dashboard** (6 hours)

Add metrics view to Quallaa UI:

```typescript
@injectable()
export class MetricsWidget extends ReactWidget {
  render() {
    const metrics = this.metricsService.getMetrics();

    return (
      <div className="metrics-dashboard">
        <h2>Agent Metrics</h2>

        <div className="metric">
          <label>Total Requests</label>
          <value>{metrics.totalRequests}</value>
        </div>

        <div className="metric">
          <label>Success Rate</label>
          <value>{(metrics.successRate * 100).toFixed(1)}%</value>
        </div>

        <div className="metric">
          <label>Total Cost</label>
          <value>${metrics.totalCost.toFixed(2)}</value>
        </div>

        <h3>By Agent</h3>
        {metrics.byAgent.map(agent => (
          <div key={agent.name}>
            <strong>{agent.name}</strong>: {agent.requests} requests, {(agent.successRate * 100).toFixed(1)}% success
          </div>
        ))}
      </div>
    );
  }
}
```

**Day 19-20 Deliverable:**
- ✅ All API calls logged
- ✅ Success/failure tracking
- ✅ Basic metrics dashboard

---

### Day 21: Error Handling & Resilience

**Tasks:**

**1. Implement Retry Logic** (4 hours)

```typescript
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  backoff: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        await new Promise(resolve =>
          setTimeout(resolve, backoff * Math.pow(2, i))
        );
      }
    }
  }

  throw lastError;
}
```

**2. Graceful Degradation** (4 hours)

```typescript
export class OrchestrarWithFallback extends AgentOrchestrator {
  async processUserRequest(message: string): Promise<OrchestratorResponse> {
    try {
      // Try with subagents
      return await super.processUserRequest(message);
    } catch (error) {
      console.error('Subagent orchestration failed:', error);

      // Fallback to direct response
      try {
        const response = await this.mainClient.sendMessage(message);
        return {
          response: response.content,
          subagentsUsed: [],
          metadata: { fallback: true, error: error.message },
        };
      } catch (fallbackError) {
        // Last resort: return error message
        return {
          response: 'I encountered an error processing your request. Please try again.',
          subagentsUsed: [],
          metadata: { error: fallbackError.message },
        };
      }
    }
  }
}
```

**Day 21 Deliverable:**
- ✅ Retry logic for failed requests
- ✅ Graceful degradation when subagents fail
- ✅ User-friendly error messages

---

## Week 4: Polish & Demo Prep

**Goal:** Finalize demo, documentation, prepare for interview

### Day 22-23: Demo Workflows

**Tasks:**

**1. Create Scripted Demo Scenarios** (8 hours)

Create `docs/demo-scripts.md`:

```markdown
# Demo Script 1: Knowledge Base Operations

User: "Find all my notes about React hooks"
→ Knowledge Base Agent searches
→ Shows: list of relevant files

User: "Create a summary of these notes in react-hooks-summary.md"
→ KB Agent reads files
→ Synthesizes summary
→ File System Agent writes new file
→ Shows: summary content

# Demo Script 2: Code Organization + Git

User: "Organize my React components into feature folders"
→ File System Agent analyzes structure
→ Creates folders: features/auth, features/dashboard, etc.
→ Moves components
→ Updates imports

User: "Commit these changes"
→ Git Agent reviews diff
→ Generates message: "refactor: organize components by feature"
→ Creates commit
→ Shows: commit hash and message

# Demo Script 3: Development Workflow

User: "Run the tests"
→ Execution Agent runs npm test
→ Shows: 3 tests failing

User: "Fix the failing tests"
→ Code Quality Agent analyzes failures
→ Identifies issues
→ Fixes code
→ Shows: all tests passing

User: "Commit the fixes"
→ Git Agent commits with message "fix: resolve test failures in auth module"
```

**2. Prepare Test Data** (4 hours)

```bash
# Create demo workspace with sample data
mkdir -p demo-workspace/notes
mkdir -p demo-workspace/src/components

# Add sample markdown notes
cat > demo-workspace/notes/react-hooks-intro.md << EOF
# React Hooks Introduction
...
EOF

# Add sample code files
cat > demo-workspace/src/components/LoginForm.tsx << EOF
export const LoginForm = () => {
  // Sample component
}
EOF

# Initialize git repo
cd demo-workspace
git init
```

**3. Test All Demo Scenarios** (4 hours)

Run through each demo script multiple times to ensure reliability.

**Day 22-23 Deliverable:**
- ✅ 3-5 polished demo workflows
- ✅ Test data prepared
- ✅ All scenarios working reliably

---

### Day 24-25: Documentation

**Tasks:**

**1. Architecture Documentation** (6 hours)

Create `docs/architecture/agentic-system.md`:

```markdown
# Quallaa Agentic Architecture

## Overview
Quallaa uses Claude Agent SDK for multi-agent orchestration...

## Components

### Main Orchestrator
- Analyzes user requests
- Delegates to specialized agents
- Synthesizes results

### Specialized Agents
1. Knowledge Base Agent
2. File System Agent
3. Git Agent
4. Code Quality Agent
5. Execution Agent

### MCP Servers
- Filesystem MCP Server
- Git MCP Server
- Terminal MCP Server

## Data Flow
[Diagram]

## Design Decisions
[Reference to DECISIONS.md]
```

**2. API Documentation** (4 hours)

Document all agent APIs, MCP servers, and integration points.

**3. User Guide** (4 hours)

Create `docs/user-guide.md` with example commands and capabilities.

**Day 24-25 Deliverable:**
- ✅ Architecture documented
- ✅ API reference complete
- ✅ User guide written

---

### Day 26-27: Optimization & Bug Fixes

**Tasks:**

**1. Performance Optimization** (6 hours)

- Reduce unnecessary API calls
- Optimize token usage
- Implement caching where appropriate
- Improve response times

**2. Bug Fixes** (6 hours)

- Fix any issues found during testing
- Handle edge cases
- Improve error messages
- Polish UI/UX

**3. Security Review** (4 hours)

- Verify all guardrails working
- Test dangerous command blocking
- Ensure proper API key handling
- Review file access permissions

**Day 26-27 Deliverable:**
- ✅ Performance optimized
- ✅ Known bugs fixed
- ✅ Security verified

---

### Day 28: Final Prep

**Tasks:**

**1. Create Demo Video** (4 hours)

Record screen capture showing:
- Opening Quallaa
- Running through 3 demo scenarios
- Highlighting subagent coordination
- Showing metrics dashboard

**2. Prepare Talking Points** (2 hours)

Key messages for interview:
- Architecture overview
- Why Claude Agent SDK over LangGraph
- Production safety patterns
- Real-world use cases
- Future roadmap

**3. Final Testing** (4 hours)

- Run all demo scenarios one more time
- Verify everything works
- Have backup plan if something fails
- Practice explaining architecture

**Day 28 Deliverable:**
- ✅ Demo video ready
- ✅ Talking points prepared
- ✅ Fully tested and ready

---

## Testing Strategy

### Unit Tests

```typescript
// Example test for Knowledge Base Agent
describe('KnowledgeBaseAgent', () => {
  it('should search notes and return results', async () => {
    const agent = new KnowledgeBaseAgent(mockClient);
    const result = await agent.execute({
      instruction: 'Find notes about React',
      context: { workspace: '/test' }
    });

    expect(result.success).toBe(true);
    expect(result.result).toContain('React');
  });
});
```

### Integration Tests

```typescript
// Example test for orchestrator
describe('AgentOrchestrator', () => {
  it('should delegate to appropriate subagent', async () => {
    const orchestrator = new AgentOrchestrator(mockClient);
    const response = await orchestrator.processUserRequest(
      'Summarize my React notes'
    );

    expect(response.subagentsUsed).toContain('knowledge_base');
    expect(response.response).toBeTruthy();
  });
});
```

### E2E Tests

```typescript
// Example end-to-end test
describe('E2E: Knowledge Base Workflow', () => {
  it('should complete full workflow', async () => {
    // User searches for notes
    await chatWidget.sendMessage('Find React notes');
    await waitFor(() => expect(lastMessage).toContain('Found 5 notes'));

    // User requests summary
    await chatWidget.sendMessage('Create a summary');
    await waitFor(() => expect(lastMessage).toContain('Created summary'));

    // Verify file was created
    const exists = await fs.pathExists('summary.md');
    expect(exists).toBe(true);
  });
});
```

---

## Documentation Requirements

### Must-Have Documentation

1. **Architecture Overview** (`docs/architecture/agentic-system.md`)
2. **API Reference** (`docs/api/agents.md`, `docs/api/mcp-servers.md`)
3. **User Guide** (`docs/user-guide.md`)
4. **Demo Scripts** (`docs/demo-scripts.md`)
5. **Development Guide** (update `CLAUDE.md`)

### Code Documentation

- JSDoc comments for all public APIs
- Inline comments for complex logic
- README in each package directory

---

## Risk Mitigation

### High-Risk Items

**1. Claude API Rate Limits**
- Risk: Hit rate limits during demo
- Mitigation: Implement caching, local testing mode

**2. MCP Server Stability**
- Risk: MCP servers crash during demo
- Mitigation: Robust error handling, auto-restart

**3. Tool Calling Reliability**
- Risk: Claude doesn't use tools correctly
- Mitigation: Well-designed prompts, examples in system prompt

**4. Demo Environment Issues**
- Risk: Demo workspace in wrong state
- Mitigation: Script to reset demo workspace, have backup

### Medium-Risk Items

**1. Performance Issues**
- Risk: Slow response times
- Mitigation: Optimize prompts, implement streaming

**2. UI Bugs**
- Risk: Chat panel glitches
- Mitigation: Extensive testing, fallback UI

**3. Git Operations Conflicts**
- Risk: Git agent creates conflicts
- Mitigation: Only demo in clean repo state

---

## Success Criteria

### Week 1 Success Criteria
- [ ] Can type in chat and get Claude response
- [ ] Claude can read files via tool calling
- [ ] Claude can write files via tool calling
- [ ] Knowledge Base Agent can search notes
- [ ] No critical bugs

### Week 2 Success Criteria
- [ ] All 5 subagents implemented
- [ ] Orchestrator delegates correctly
- [ ] Can run multi-step workflows
- [ ] Git agent can commit changes
- [ ] Execution agent can run commands safely

### Week 3 Success Criteria
- [ ] Dangerous commands blocked
- [ ] User confirmation dialogs working
- [ ] All inputs validated
- [ ] Metrics dashboard showing data
- [ ] Error handling robust

### Week 4 Success Criteria
- [ ] All demo scenarios working
- [ ] Documentation complete
- [ ] Demo video recorded
- [ ] Interview talking points ready
- [ ] Confident in architecture explanation

### Overall Project Success
- [ ] Can demonstrate end-to-end agentic workflows
- [ ] Multi-agent orchestration clearly visible
- [ ] Production safety patterns implemented
- [ ] Truthful claims in resume/cover letter
- [ ] Ready for technical interview
- [ ] Passionate about the technology

---

## Next Steps After Demo

### Phase 2 Enhancements (Post-Interview)

**If you get the job:**
- Implement vector search with ChromaDB
- Build comprehensive eval harness
- Add advanced observability with LangSmith
- Optimize for web deployment
- Implement team collaboration features

**If you don't get the job:**
- Continue building Quallaa as portfolio project
- Share on Twitter/LinkedIn
- Write blog posts about architecture
- Open source parts of it
- Use for your own knowledge base

---

## Daily Standup Format

**Each day, track progress:**

```markdown
## Day X: [Date]

### Completed
- ✅ Task 1
- ✅ Task 2

### In Progress
- 🔄 Task 3 (60% done)

### Blockers
- ⚠️ Issue with X (need to resolve)

### Next Day Plan
- [ ] Task 4
- [ ] Task 5

### Notes
- Learned: ...
- Challenge: ...
- Idea: ...
```

---

## Resources

### Documentation
- Claude API: https://docs.anthropic.com/
- MCP Spec: https://modelcontextprotocol.io/
- Theia Docs: https://theia-ide.org/docs/

### Examples
- Claude Agent SDK Examples: https://github.com/anthropics/claude-agent-sdk
- MCP Servers: https://github.com/modelcontextprotocol/servers

### Support
- Claude Discord: [link]
- Theia Discussions: https://github.com/eclipse-theia/theia/discussions

---

## Appendix: Package Structure

```
packages/
├── quallaa-agent/                  # Main agent orchestration
│   ├── src/
│   │   ├── node/
│   │   │   ├── claude-client-service.ts
│   │   │   ├── orchestrator.ts
│   │   │   └── subagents/
│   │   │       ├── base-agent.ts
│   │   │       ├── knowledge-base-agent.ts
│   │   │       ├── file-system-agent.ts
│   │   │       ├── git-agent.ts
│   │   │       ├── execution-agent.ts
│   │   │       └── code-quality-agent.ts
│   │   ├── common/
│   │   │   └── types.ts
│   │   └── browser/
│   │       └── agent-ui-contribution.ts
│   └── package.json
│
├── quallaa-mcp-servers/            # MCP tool servers
│   ├── src/
│   │   ├── filesystem/
│   │   │   └── filesystem-server.ts
│   │   ├── git/
│   │   │   └── git-server.ts
│   │   ├── terminal/
│   │   │   └── terminal-server.ts
│   │   └── common/
│   │       └── base-server.ts
│   └── package.json
│
└── quallaa-core/                   # Existing Quallaa core (mode toggle, etc.)
    └── ...

examples/
├── electron/                       # Desktop app
│   ├── src/
│   │   ├── backend/
│   │   │   └── main.ts             # Register agent services
│   │   └── frontend/
│   └── package.json
│
└── browser/                        # Web app
    └── ...
```

---

**End of Implementation Plan**

**Ready to start? Let's begin with Week 1, Day 1: Claude Agent SDK Integration!**
