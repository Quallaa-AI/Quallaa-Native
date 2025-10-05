# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Context

This repository is **Eclipse Theia** being rebranded to **Quallaa** for macOS desktop distribution. The goal is a minimal viable rebrand focusing on user-visible branding changes while maintaining the underlying Theia platform architecture.

**Important**: This is the Theia Platform monorepo, NOT the Theia IDE template. The rebranding work focuses on the `examples/electron/` application as the primary build target.

## Key Project Files

- **`TODO.md`** - Detailed 9-phase project plan for the rebrand (2-3 weeks, macOS-only)
- **`Rebranding Eclipse Theia to Quallaa: Fast-Track MVP Guide.md`** - Strategic guide and business context
- **`examples/electron/`** - Primary build target for Quallaa desktop application
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

### Dependency Injection
Theia uses **InversifyJS** for dependency injection. This is critical for rebranding:
- Override UI components by rebinding in DI container
- Avoid modifying Theia core files directly when possible
- Use `@injectable()`, `@inject()`, `@postConstruct()` decorators
- Rebind widgets/dialogs in frontend modules for customization

## Essential Commands

### Initial Setup
```bash
npm install              # Install dependencies, link packages, run postinstall hooks
npm run compile          # Compile all TypeScript packages (required after install)
```

### Building Examples
```bash
# Browser example
npm run build:browser    # Full build: compile + bundle
npm run start:browser    # Run at http://localhost:3000

# Electron example (primary for Quallaa)
npm run build:electron   # Full build: compile + bundle
npm run start:electron   # Launch Electron app

# Build all examples
npm run build:applications
```

### Development Workflow
```bash
# Watch mode (auto-rebuild on changes)
npm run watch            # Watch all packages (expensive)
npm run watch:electron   # Watch electron example only

# Individual package watch
npx lerna run watch --scope @theia/core

# Watch package + dependencies
npx lerna run watch --scope @theia/navigator --include-filtered-dependencies --parallel

# Rebuild native modules for Electron
cd examples/electron && npm run rebuild
```

### Linting & Testing
```bash
npm run lint             # Lint all TypeScript (slow, only required for CI)
npm run lint:fix         # Auto-fix linting issues

# Tests
npm run test             # Run all tests (Theia + examples)
npm run test:electron    # Test electron example only
npm run test:theia       # Test Theia packages only
```

### Electron Packaging (for Quallaa rebrand)
```bash
cd examples/electron
yarn package             # Create DMG installer (requires code signing setup)
```

## Rebranding Architecture

### Files Requiring Modification

**Core branding (examples/electron/)**:
- `package.json` - Application name, productName, appId, preferences directory
- `electron-builder.yml` - Build config, code signing, macOS settings (may need to create)
- `resources/icon.icns` - macOS application icon (512x512@2x minimum)
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

1. **Modify examples/electron/ package.json first** - Sets application name, config
2. **Create/update electron-builder.yml** - macOS build settings
3. **Replace visual assets** - icon.icns for macOS
4. **Override UI components** - About Dialog, Getting Started Widget
5. **Global text replacement** - "Theia IDE" → "Quallaa" in user-visible strings only
6. **Keep `@theia/*` package namespace** - Avoid massive refactor for MVP

## Code Signing & Distribution (macOS)

### Prerequisites
- Apple Developer Program membership ($99/year)
- Developer ID Application certificate
- App-specific password for notarization

### Environment Variables
```bash
export APPLE_IDENTITY="Developer ID Application: Your Name (TEAM_ID)"
export APPLE_ID="your@email.com"
export APPLE_ID_PASSWORD="xxxx-xxxx-xxxx-xxxx"
export APPLE_TEAM_ID="XXXXXXXXXX"
```

### electron-builder Configuration
Configure in `examples/electron/electron-builder.yml`:
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

### Packaging Commands
```bash
cd examples/electron
yarn clean && yarn compile && yarn bundle && yarn package
```

## Debugging

### VS Code Launch Configurations
Pre-configured in `.vscode/launch.json`:
- **Launch Electron Backend** - Debug backend process
- **Attach to Electron Frontend** - Debug renderer process
- **Launch Browser Backend** - Debug browser example backend
- **Launch Browser Frontend** - Debug browser example frontend

### Debug Workflow (Electron)
1. Open debug view in VS Code
2. Run "Launch Electron Backend" configuration
3. In Electron app: Help → Toggle Electron Developer Tools (frontend debugging)

### Debug Single Package
```bash
# Backend
node --inspect-brk=0.0.0.0:9229 examples/electron/lib/backend/main.js

# Plugin host
--debugPluginHost=9339
```

## Architecture Concepts

### Frontend-Backend Split
- **Backend**: Node.js server process (handles file system, git, etc.)
- **Frontend**: Browser/Electron renderer (UI, Monaco editor)
- **Communication**: JSON-RPC over WebSocket
- **Shared code**: `common/` folders define protocols

### Extension System
- **Contributions**: `CommandContribution`, `MenuContribution`, `WidgetFactory`, etc.
- **Binding**: Use `bind()` and `rebind()` in frontend/backend modules
- **Example**: Override AboutDialog by rebinding in product extension

### VS Code Compatibility
- Theia supports VS Code extensions via plugin system
- Extensions loaded from `plugins/` directory
- `npm run download:plugins` - Downloads VS Code extensions for testing
- Open VSX Registry used for extension distribution (not VS Code Marketplace)

## Performance Considerations

- **Startup time target**: Under 10 seconds for MVP (optimization deferred)
- **Extension overhead**: Each bundled extension adds ~0.5-1 second to startup
- **Watch mode cost**: `npm run watch` compiles all packages (use scoped watch for speed)
- **Native modules**: Rebuild required when switching between browser/electron targets

## Common Pitfalls

1. **Forgetting to rebuild**: After `npm install`, always run `npm run compile`
2. **Native module mismatch**: Switching between browser/electron requires `npm run rebuild:electron` or `npm run rebuild:browser`
3. **Modifying core instead of extending**: Use dependency injection rebinding, not direct edits
4. **Package namespace changes**: Renaming `@theia/*` to `@quallaa/*` is high-risk, defer to post-MVP
5. **Over-engineering**: MVP should embrace technical debt and ship quickly

## Acceptable Technical Debt for MVP

- Duplicate code (refactor later)
- TODO comments throughout
- Incomplete error handling (display errors, don't crash)
- Basic logging only
- No comprehensive test suites
- Hardcoded values (make configurable in v2)
- Keeping `@theia/*` namespace (avoid massive refactor)

## Project-Specific Workflows

### Typical Rebrand Development Session
```bash
# 1. Start from root
npm install && npm run compile

# 2. Make branding changes in examples/electron/

# 3. Watch for changes
cd examples/electron
npm run watch

# 4. In separate terminal, run app
cd examples/electron
npm run start

# 5. Test changes, iterate

# 6. When ready to package
npm run clean && yarn package
```

### Testing Rebrand Changes
```bash
# Quick test (development build)
cd examples/electron && npm run start

# Full test (production build)
cd examples/electron && yarn package
# Then install DMG and test on clean system
```

## Dependencies & Node Version

- **Node.js**: >= 20 and < 24 (strict requirement)
- **Python**: Required for node-gyp native compilation
- **Lerna**: v7.x - monorepo task orchestration
- **Yarn**: Workspace management (NOT npm workspaces)
- **Electron**: v37.2.1 (as of current package.json)

## Success Criteria (from TODO.md)

**MVP Cannot Ship Without**:
- Application name is "Quallaa" everywhere users see it
- macOS icon displays correctly (dock, app switcher, Finder)
- About dialog shows Quallaa branding + "Built on Eclipse Theia" attribution
- DMG installer works without macOS Gatekeeper warnings
- Basic IDE functionality works (open folder, edit, save)
- Settings persist in `~/.quallaa/` directory
- README with installation instructions
- EPL 2.0 compliance: LICENSE, NOTICE, attributions, source link

## Useful Resources

- **Theia Documentation**: https://theia-ide.org/docs/
- **Developing Guide**: `doc/Developing.md` (comprehensive development reference)
- **Code Organization**: `doc/code-organization.md` (platform folder structure)
- **Testing Guide**: `doc/Testing.md`
- **Migration Guide**: `doc/Migration.md`
- **electron-builder Docs**: https://www.electron.build/
- **EPL 2.0 License**: https://www.eclipse.org/legal/epl-2.0/
