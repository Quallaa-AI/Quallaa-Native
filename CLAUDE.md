# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Context

This repository is **Eclipse Theia** being transformed into **Quallaa**, an AI Environment Management system for domain experts.

### What is Quallaa?

**Quallaa is an AI execution environment that gives domain experts access to developer-grade AI capabilities.**

The core insight: **IDE + Command Line + frontier AI models = the most capable AI execution environment.** While most people are stuck with chat interfaces that waste 67% of AI potential through translation bottlenecks, developers have AI tools that directly execute, modify files, and orchestrate infrastructure.

Quallaa democratizes this power for non-developer domain experts (marketers, financial analysts, consultants, etc.) by providing:
- **Pre-configured environments** with real infrastructure (databases, APIs, email providers, analytics tools)
- **Direct AI execution** - AI doesn't just describe solutions, it executes them in the IDE environment
- **Future-proof architecture** - Anything tokenizable can be orchestrated from a code editor
- **Frontier model integration** - Use Claude, GPT, and other best-in-class models as-is, out-of-the-box

### Why Eclipse Theia?

Theia provides the perfect foundation because:
1. **Extension ecosystem** - Supports VS Code extensions, enabling integration with any tool/service
2. **Frontend-backend architecture** - Can orchestrate infrastructure (databases, APIs) from backend, not just edit text
3. **Cross-platform** - Desktop (Electron) AND web deployment for maximum accessibility
4. **Open source** - Full control over customization and progressive disclosure UX
5. **Production-ready** - Used by major companies; not a toy or prototype

**Important**: This is the Theia Platform monorepo, NOT the Theia IDE template.

### Product Roadmap

**Phase 1 (Current MVP)**: Rebrand Theia to establish Quallaa foundation
- Visual rebrand (name, icons, branding)
- Build targets: Desktop (Electron) AND web (browser)
- AI integration (Claude Code or similar)
- Basic IDE functionality for domain experts who understand "command center" concept

**Phase 2 (Future)**: Domain-specific environment templates
- Marketing environment: Postgres database + email provider + analytics tools + CRM-like functionality
- Finance environment: Data analysis tools + reporting + integrations
- Progressive disclosure of IDE complexity based on user expertise

**Phase 3 (Future)**: Advanced environment management
- Multi-environment orchestration
- Team collaboration features
- Enterprise deployment options

### Target Users

**Primary**: SMB domain experts ("Explorers" - 51% of SMBs experimenting with AI but stuck)
- Have deep domain expertise but no coding skills
- Understand what needs to be done, just can't execute technically
- Willing to learn new paradigms if it gives them 10x productivity
- Currently frustrated with chat-only AI tools that can't actually DO anything

**Not targeting**: Enterprise developers, large IT departments, people who want rigid "no-code" tools

### Philosophy: Environment, Not Workflows

Quallaa provides **execution environments**, not pre-configured AI agents or rigid workflows:
- ✅ Real infrastructure: Postgres databases, email providers, API integrations
- ✅ Frontier models used as-is: Claude, GPT, etc. (no custom training needed)
- ✅ IDE as command center: Orchestrate anything tokenizable
- ❌ Custom-trained AI models (users can add if needed, but not our focus)
- ❌ "AI agents" that are just classification algorithms and decision trees
- ❌ Rigid workflow automation (we provide capability, users define workflows)

**Example**: A marketing environment doesn't include "AI trained on marketing workflows." It includes:
- PostgreSQL database (for customer/campaign data)
- Email provider integration (SendGrid, Mailgun, etc.)
- Analytics API connections (Google Analytics, Mixpanel)
- File templates and schemas
- AI can orchestrate all of this directly when user describes needs

Many users will never edit code directly, but they'll have the **capability** - that's the future-proof "AI-native" approach.

## Key Project Files

- **`TODO.md`** - Detailed 9-phase project plan for the rebrand (2-3 weeks)
- **`Rebranding Eclipse Theia to Quallaa: Fast-Track MVP Guide.md`** - Strategic guide and business context
- **`examples/electron/`** - Desktop application build target (macOS, Windows, Linux)
- **`examples/browser/`** - Web application build target
- **`.vscode/launch.json`** - Pre-configured debug configurations

## Build System Architecture

### Monorepo Structure
- **Lerna + Yarn Workspaces**: Manages 90+ packages in this monorepo
- **Workspace folders**: `packages/`, `dev-packages/`, `examples/`
- **Build orchestration**: Root package.json scripts coordinate cross-package builds

### Platform-Specific Code Organization
Within each package, code is organized by platform:
- `common/` - Platform-agnostic JavaScript (runs everywhere)
- `browser/` - Browser/DOM APIs (frontend)
- `node/` - Node.js APIs (backend)
- `electron-browser/` - Electron renderer process
- `electron-node/` - Electron main process + Node.js
- `electron-main/` - Electron main process only

**Why this matters for Quallaa**: The `node/` backend can orchestrate databases, external APIs, file systems - not just edit text files. This enables true environment management.

### Dependency Injection
Theia uses **InversifyJS** for dependency injection. This is critical for customization:
- Override UI components by rebinding in DI container
- Avoid modifying Theia core files directly when possible
- Use `@injectable()`, `@inject()`, `@postConstruct()` decorators
- Rebind widgets/dialogs in frontend modules for customization

**For Quallaa**: This allows progressive disclosure - rebind complex IDE widgets with simplified interfaces for domain experts.

## Essential Commands

### Initial Setup
```bash
npm install              # Install dependencies, link packages, run postinstall hooks
npm run compile          # Compile all TypeScript packages (required after install)
```

### Building Examples

```bash
# Browser example (web deployment)
npm run build:browser    # Full build: compile + bundle
npm run start:browser    # Run at http://localhost:3000

# Electron example (desktop deployment - primary for MVP)
npm run build:electron   # Full build: compile + bundle
npm run start:electron   # Launch Electron app

# Build all examples (both browser and electron)
npm run build:applications
```

**Note**: Quallaa will support BOTH desktop and web deployment. Desktop provides better native integration; web provides accessibility.

### Development Workflow
```bash
# Watch mode (auto-rebuild on changes)
npm run watch            # Watch all packages (expensive)
npm run watch:electron   # Watch electron example only
npm run watch:browser    # Watch browser example only

# Individual package watch
npx lerna run watch --scope @theia/core

# Watch package + dependencies
npx lerna run watch --scope @theia/navigator --include-filtered-dependencies --parallel

# Rebuild native modules for Electron
cd examples/electron && npm run rebuild

# Rebuild native modules for Browser
cd examples/browser && npm run rebuild
```

### Linting & Testing
```bash
npm run lint             # Lint all TypeScript (slow, only required for CI)
npm run lint:fix         # Auto-fix linting issues

# Tests
npm run test             # Run all tests (Theia + examples)
npm run test:electron    # Test electron example only
npm run test:browser     # Test browser example only
npm run test:theia       # Test Theia packages only
```

### Packaging

```bash
# Electron (desktop)
cd examples/electron
yarn package             # Create DMG (macOS), EXE (Windows), or AppImage (Linux)

# Browser (web) - typically deployed to server, not packaged
cd examples/browser
npm run build:browser    # Creates production bundle in lib/
```

## MVP Rebranding Architecture

### Files Requiring Modification

**Core branding (examples/electron/ and examples/browser/)**:
- `package.json` - Application name, productName, appId, preferences directory
- `electron-builder.yml` (electron only) - Build config, code signing, platform settings
- `resources/icon.icns` (macOS) - Application icon (512x512@2x minimum)
- `resources/icon.ico` (Windows) - Application icon
- `resources/splash.html` - Optional splash screen

**UI Components (packages/)**:
- `packages/core/src/browser/about-dialog.tsx` - About dialog with EPL 2.0 attribution
- `packages/getting-started/src/browser/getting-started-widget.tsx` - Welcome screen
- Config directory: Search for `.theia` references → change to `.quallaa`

### EPL 2.0 Compliance Requirements

**Red Lines - Never Cross**:
- Never remove EPL attribution notices or copyright headers from Theia files
- Never use "Theia" or "Eclipse" trademarks in product name
- Never distribute modified EPL code without source access
- Never modify Theia core when extension points exist

**Required Attributions**:
- About dialog MUST show "Built on Eclipse Theia"
- Include LICENSE-EPL.txt and NOTICE files in distributions
- Link to source code repository (EPL requires source availability)
- Preserve all original copyright headers in modified files

### Recommended Rebrand Approach

1. **Modify examples/electron/ and examples/browser/ package.json first** - Sets application name, config
2. **Create/update electron-builder.yml** - Desktop build settings
3. **Replace visual assets** - Icons for macOS, Windows, Linux
4. **Override UI components** - About Dialog, Getting Started Widget
5. **Global text replacement** - "Theia IDE" → "Quallaa" in user-visible strings only
6. **Keep `@theia/*` package namespace** - Avoid massive refactor for MVP

## Code Signing & Distribution

### macOS (Desktop)

**Prerequisites**:
- Apple Developer Program membership ($99/year)
- Developer ID Application certificate
- App-specific password for notarization

**Environment Variables**:
```bash
export APPLE_IDENTITY="Developer ID Application: Your Name (TEAM_ID)"
export APPLE_ID="your@email.com"
export APPLE_ID_PASSWORD="xxxx-xxxx-xxxx-xxxx"
export APPLE_TEAM_ID="XXXXXXXXXX"
```

**electron-builder Configuration** (examples/electron/electron-builder.yml):
```yaml
appId: com.quallaa.ide
productName: Quallaa
copyright: Copyright © 2025 Your Company

mac:
  identity: ${APPLE_IDENTITY}
  target: dmg
  icon: resources/icon.icns
  category: public.app-category.developer-tools
```

**Packaging Commands**:
```bash
cd examples/electron
yarn clean && yarn compile && yarn bundle && yarn package
```

### Web Deployment (Browser)

Web version deployed to standard web hosting:
1. Build production bundle: `cd examples/browser && npm run build:browser`
2. Deploy `lib/` directory to web server (nginx, Apache, cloud hosting)
3. Configure backend endpoint if using remote backend
4. Set up SSL certificate for HTTPS (required for modern web features)

## Debugging

### VS Code Launch Configurations
Pre-configured in `.vscode/launch.json`:
- **Launch Electron Backend** - Debug desktop backend process
- **Attach to Electron Frontend** - Debug desktop renderer process
- **Launch Browser Backend** - Debug web backend process
- **Launch Browser Frontend** - Debug web frontend

### Debug Workflow (Electron)
1. Open debug view in VS Code
2. Run "Launch Electron Backend" configuration
3. In Electron app: Help → Toggle Electron Developer Tools (frontend debugging)

### Debug Workflow (Browser)
1. Run "Launch Browser Backend" configuration
2. Run "Launch Browser Frontend" configuration (opens browser)
3. Use browser DevTools for frontend debugging

### Debug Single Package
```bash
# Backend
node --inspect-brk=0.0.0.0:9229 examples/electron/lib/backend/main.js

# Plugin host
--debugPluginHost=9339
```

## Architecture Concepts

### Frontend-Backend Split
- **Backend**: Node.js server process (handles file system, git, databases, external APIs)
- **Frontend**: Browser/Electron renderer (UI, Monaco editor)
- **Communication**: JSON-RPC over WebSocket
- **Shared code**: `common/` folders define protocols

**For Quallaa**: Backend can orchestrate infrastructure (Postgres, email providers, APIs), not just file operations. This enables true environment management where AI commands get executed against real services.

### Extension System
- **Contributions**: `CommandContribution`, `MenuContribution`, `WidgetFactory`, etc.
- **Binding**: Use `bind()` and `rebind()` in frontend/backend modules
- **Example**: Override AboutDialog by rebinding in product extension

**For Quallaa**: Extension system enables domain-specific environment templates. Marketing environment = custom extensions for CRM functionality, email integration, analytics.

### VS Code Compatibility
- Theia supports VS Code extensions via plugin system
- Extensions loaded from `plugins/` directory
- `npm run download:plugins` - Downloads VS Code extensions for testing
- Open VSX Registry used for extension distribution (not VS Code Marketplace)

**For Quallaa**: Leverage existing VS Code extensions (Python, data tools, API clients) rather than building from scratch.

## Performance Considerations

- **Startup time target**: Under 10 seconds for MVP (optimization deferred)
- **Extension overhead**: Each bundled extension adds ~0.5-1 second to startup
- **Watch mode cost**: `npm run watch` compiles all packages (use scoped watch for speed)
- **Native modules**: Rebuild required when switching between browser/electron targets
- **Web performance**: Consider bundle size for browser deployment; use code splitting

## Common Pitfalls

1. **Forgetting to rebuild**: After `npm install`, always run `npm run compile`
2. **Native module mismatch**: Switching between browser/electron requires `npm run rebuild:electron` or `npm run rebuild:browser`
3. **Modifying core instead of extending**: Use dependency injection rebinding, not direct edits
4. **Package namespace changes**: Renaming `@theia/*` to `@quallaa/*` is high-risk, defer to post-MVP
5. **Over-engineering**: MVP should embrace technical debt and ship quickly
6. **Browser/Electron feature differences**: Not all Node.js APIs work in browser; some native modules require Electron

## Acceptable Technical Debt for MVP

- Duplicate code (refactor later)
- TODO comments throughout
- Incomplete error handling (display errors, don't crash)
- Basic logging only
- No comprehensive test suites
- Hardcoded values (make configurable in v2)
- Keeping `@theia/*` namespace (avoid massive refactor)
- No progressive disclosure UX yet (Phase 2)
- No domain-specific environment templates yet (Phase 2)

## Project-Specific Workflows

### Typical Rebrand Development Session
```bash
# 1. Start from root
npm install && npm run compile

# 2. Make branding changes in examples/electron/ or examples/browser/

# 3. Watch for changes (choose one)
cd examples/electron && npm run watch
# OR
cd examples/browser && npm run watch

# 4. In separate terminal, run app (choose one)
cd examples/electron && npm run start
# OR
cd examples/browser && npm run start

# 5. Test changes, iterate

# 6. When ready to package
cd examples/electron && npm run clean && yarn package
# OR
cd examples/browser && npm run build:browser
```

### Testing Rebrand Changes
```bash
# Quick test (development build)
cd examples/electron && npm run start
cd examples/browser && npm run start:browser

# Full test (production build)
cd examples/electron && yarn package
# Then install DMG and test on clean system

cd examples/browser && npm run build:browser
# Then deploy to test server
```

## Dependencies & Node Version

- **Node.js**: >= 20 and < 24 (strict requirement)
- **Python**: Required for node-gyp native compilation
- **Lerna**: v7.x - monorepo task orchestration
- **Yarn**: Workspace management (NOT npm workspaces)
- **Electron**: v37.2.1 (for desktop builds)

## MVP Success Criteria

**MVP Cannot Ship Without**:
- Application name is "Quallaa" everywhere users see it
- Icons display correctly (desktop: dock/taskbar/Finder; web: favicon/PWA)
- About dialog shows Quallaa branding + "Built on Eclipse Theia" attribution
- Desktop: DMG/EXE installer works without OS warnings
- Web: Browser version loads and works in modern browsers (Chrome, Firefox, Safari)
- Basic IDE functionality works (open folder, edit, save)
- Settings persist in `~/.quallaa/` directory (desktop) or localStorage (web)
- README with installation instructions
- EPL 2.0 compliance: LICENSE, NOTICE, attributions, source link
- AI integration working (Claude Code or similar)

## Future Architecture Considerations

These are NOT in MVP scope, but inform architecture decisions:

### Progressive Disclosure (Phase 2)
- Approach TBD - no assumptions yet
- May involve: simplified UI modes, domain-specific overlays, gradual feature revelation
- Must maintain full IDE capability underneath (future-proofing)

### Domain-Specific Environments (Phase 2)
- Marketing environment example:
  - Postgres database (pre-configured schemas)
  - Email provider integration (SendGrid, Mailgun)
  - Analytics API connections (Google Analytics, Mixpanel)
  - File templates and project structures
  - NOT custom AI training - use frontier models as-is
- Finance, legal, consulting environments follow similar patterns
- Implemented as Theia extensions + backend services

### Environment Management (Phase 3)
- Multi-environment orchestration
- Team collaboration
- Enterprise deployment
- Environment templates marketplace

## Development Principles for Quallaa

1. **Keep**: Core IDE capabilities, extension system, VS Code compatibility
2. **Modify**: Branding, default UI, configuration defaults
3. **Build new**: Domain environment templates (Phase 2), progressive disclosure (Phase 2)
4. **Don't prematurely optimize**: Ship MVP fast, iterate based on user feedback
5. **Future-proof**: Maintain ability to execute anything tokenizable - don't lock users into simplified UX

## Useful Resources

- **Theia Documentation**: https://theia-ide.org/docs/
- **Developing Guide**: `doc/Developing.md` (comprehensive development reference)
- **Code Organization**: `doc/code-organization.md` (platform folder structure)
- **Testing Guide**: `doc/Testing.md`
- **Migration Guide**: `doc/Migration.md`
- **electron-builder Docs**: https://www.electron.build/
- **EPL 2.0 License**: https://www.eclipse.org/legal/epl-2.0/
- **Theia Extensions**: https://theia-ide.org/docs/composing_applications/
