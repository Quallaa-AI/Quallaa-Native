# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **Quallaa**, built on the Eclipse Theia platform.

**What is Quallaa?** A knowledge base + natural language development environment.

**Current Goal:** Build a dual-mode interface:
- **Default mode** (90% usage): Clean KB/note-taking + AI chat interface (Obsidian-like, hides IDE complexity)
- **Developer mode**: Full IDE exposed when needed (or developers can use their preferred external IDE)

**Key Principle:** The full IDE functionality is retained and accessible. We're not stripping features—we're creating a simple default experience that progressively discloses complexity.

**For project vision and strategy**, see: `docs/Quallaa-Product-Overview.md`

**For architecture decisions**, see: `docs/DECISIONS.md`

**This document** focuses on: How to work with the Theia codebase (build, debug, customize, deploy).

---

## What is Theia?

Eclipse Theia is an open-source IDE platform (not an IDE product). Key characteristics:

- **Frontend-backend architecture** - Node.js backend + browser/Electron frontend
- **Extension system** - Supports VS Code extensions
- **Cross-platform** - Desktop (Electron) AND web (browser) deployment
- **Dependency injection** - InversifyJS for customization
- **Production-ready** - Used by Arduino IDE, Gitpod, and other commercial products

**Important**: This repository is the **Theia Platform monorepo**, NOT the Theia IDE template.

---

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

### Dependency Injection

Theia uses **InversifyJS** for dependency injection:
- Override UI components by rebinding in DI container
- Avoid modifying Theia core files directly when possible
- Use `@injectable()`, `@inject()`, `@postConstruct()` decorators
- Rebind widgets/dialogs in frontend modules for customization

---

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

# Electron example (desktop deployment)
npm run build:electron   # Full build: compile + bundle
npm run start:electron   # Launch Electron app

# Build all examples (both browser and electron)
npm run build:applications
```

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

---

## Quallaa Customization

### Key Configuration Files

**Application configuration (examples/electron/ and examples/browser/)**:
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

### Customization Approach

1. **Configure application settings** - Modify package.json files in examples/electron/ and examples/browser/
2. **Set up build configuration** - Update electron-builder.yml for desktop builds
3. **Customize visual assets** - Provide Quallaa icons for macOS, Windows, Linux
4. **Extend UI components** - Override About Dialog, Getting Started Widget through Theia's extension system
5. **Update user-facing strings** - "Theia IDE" → "Quallaa" in visible UI only
6. **Keep `@theia/*` package namespace** - Maintain compatibility with upstream Theia

---

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

---

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

---

## Architecture Concepts

### Frontend-Backend Split

- **Backend**: Node.js server process (handles file system, git, databases, external APIs)
- **Frontend**: Browser/Electron renderer (UI, Monaco editor)
- **Communication**: JSON-RPC over WebSocket
- **Shared code**: `common/` folders define protocols

### Extension System

- **Contributions**: `CommandContribution`, `MenuContribution`, `WidgetFactory`, etc.
- **Binding**: Use `bind()` and `rebind()` in frontend/backend modules
- **Example**: Override AboutDialog by rebinding in product extension

### Shell Layout Customization

**How Theia Shell Works:**
- `ApplicationShell` manages layout areas (top, left, right, main, bottom)
- Widgets register with specific areas
- Default layout shows file explorer on left, editor in main area

**Customization Approach:**
- Use `FrontendApplicationContribution` lifecycle hooks
- `onDidInitializeLayout()` runs after Theia restores layout
- Use `shell.collapsePanel()` / `shell.expandPanel()` for side panels (left, right, bottom)
- Use `shell.topPanel.hide()` / `shell.topPanel.show()` for menu bar

**Reference:** See `docs/research/2025-01-theia-shell-customization-research.md` for detailed validation of ApplicationShell APIs.

### VS Code Compatibility

- Theia supports VS Code extensions via plugin system
- Extensions loaded from `plugins/` directory
- `npm run download:plugins` - Downloads VS Code extensions for testing
- Open VSX Registry used for extension distribution (not VS Code Marketplace)

---

## Performance Considerations

- **Startup time target**: Under 10 seconds (optimization deferred)
- **Extension overhead**: Each bundled extension adds ~0.5-1 second to startup
- **Watch mode cost**: `npm run watch` compiles all packages (use scoped watch for speed)
- **Native modules**: Rebuild required when switching between browser/electron targets
- **Web performance**: Consider bundle size for browser deployment; use code splitting

---

## Common Pitfalls

1. **Forgetting to rebuild**: After `npm install`, always run `npm run compile`
2. **Native module mismatch**: Switching between browser/electron requires `npm run rebuild:electron` or `npm run rebuild:browser`
3. **Modifying core instead of extending**: Use dependency injection rebinding, not direct edits
4. **Package namespace changes**: Renaming `@theia/*` to `@quallaa/*` is high-risk, avoid
5. **Browser/Electron feature differences**: Not all Node.js APIs work in browser; some native modules require Electron
6. **Fighting Theia's architecture**: Work with the extension system, not against it

---

## Project-Specific Workflows

### Typical Development Session

```bash
# 1. Start from root
npm install && npm run compile

# 2. Make changes in examples/electron/ or examples/browser/

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

### Testing Changes

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

---

## Dependencies & Node Version

- **Node.js**: >= 20 and < 24 (strict requirement)
- **Python**: Required for node-gyp native compilation
- **Lerna**: v7.x - monorepo task orchestration
- **Yarn**: Workspace management (NOT npm workspaces)
- **Electron**: v37.2.1 (for desktop builds)

---

## Current Development Goal

**Goal:** Build a dual-mode knowledge base + development environment

**Default Mode (90% usage):**
- Clean markdown editor interface (Obsidian-like)
- AI chat panel side-by-side
- Distraction-free layout - hides IDE complexity
- AI can read/edit files and execute against real infrastructure

**Developer Mode:**
- Full IDE exposed when needed (toggle or external IDE)
- Complete Theia functionality accessible
- Progressive disclosure of complexity

**Success Criteria:**
- Simple, streamlined default experience
- Full IDE available but not overwhelming
- AI can execute (not just chat) - file system, databases, APIs
- No blank screen errors
- Proper architecture (no hacks or workarounds)

**See:** `docs/Quallaa-Product-Overview.md` for complete project vision

---

## Development Principles

1. **Work with Theia's architecture, not against it**
2. **Use extension points before modifying core**
3. **Maintain EPL 2.0 compliance** (attribution, source access)
4. **Keep `@theia/*` package namespace** (avoid massive refactors)
5. **Test in both Electron and browser** (maintain cross-platform compatibility)
6. **Document architecture decisions** (update docs/DECISIONS.md)

---

## Useful Resources

- **Theia Documentation**: https://theia-ide.org/docs/
- **Developing Guide**: `doc/Developing.md` (comprehensive development reference)
- **Code Organization**: `doc/code-organization.md` (platform folder structure)
- **Testing Guide**: `doc/Testing.md`
- **Migration Guide**: `doc/Migration.md`
- **electron-builder Docs**: https://www.electron.build/
- **EPL 2.0 License**: https://www.eclipse.org/legal/epl-2.0/
- **Theia Extensions**: https://theia-ide.org/docs/composing_applications/
