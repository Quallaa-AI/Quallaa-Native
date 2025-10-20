# Quallaa Product Overview

**Last Updated:** 2025-10-20

---

## Current Goal

**Build an Obsidian + AI Chat experience on Eclipse Theia.**

**What this means:**
- Clean markdown editor (Obsidian-like)
- AI chat panel side-by-side
- Distraction-free writing environment
- AI can read/edit files when asked
- No IDE clutter by default

**What this is NOT:**
- NOT building domain-specific tooling (marketing automation, etc.) yet
- NOT building custom shell layouts or mode toggles yet
- NOT building "no-code" or rigid workflow tools

---

## Vision (Future)

Eventually, Quallaa will be an AI execution environment that gives domain experts access to developer-grade AI capabilities. But we're starting simple: get the markdown + AI chat experience right first.

---

## Why Theia?

Eclipse Theia provides the perfect foundation:
- **Monaco editor** - Best-in-class code/markdown editing
- **Extension system** - Can integrate VS Code extensions
- **Cross-platform** - Desktop (Electron) AND web deployment
- **Open source** - Full control over customization
- **Production-ready** - Used by major companies

---

## Technical Architecture

### Current Implementation

**Built on Eclipse Theia Platform:**
- This is the Theia Platform monorepo (not the IDE template)
- Build targets: Desktop (Electron) and web (browser)
- AI integration: Claude Code (Anthropic's coding agent)

**Key Packages:**
- `examples/electron/` - Desktop application
- `examples/browser/` - Web application
- `packages/docs-view/` - Markdown document browser widget
- `packages/ide-ai-chat-view/` - AI chat interface widget

**Layout Goal:**
- Left panel: Document browser (markdown files)
- Center: Monaco editor (markdown editing)
- Right panel: AI chat
- Minimal IDE chrome

---

## Future Ideas (Archive)

For context on what we've considered and may revisit later, see `docs/archive/`:
- `2025-10-domain-ideas/` - Domain abstraction system, marketing automation, etc.
- `2025-01-mode-toggle/` - Simple/developer mode toggle research

These are parked ideas that may or may not happen. The current focus is: **Obsidian + AI chat.**

---

## Long-Term Vision (Reference Only)

Eventually, Quallaa may evolve into an AI execution environment for domain experts with features like:
- Domain-specific tooling (marketing automation, finance tools, etc.)
- AI-modifiable domain scaffolding
- Real infrastructure orchestration (databases, APIs, services)
- Progressive disclosure between simple and developer modes

**Status:** These are ideas that may or may not happen. Detailed planning documents have been archived in `docs/archive/2025-10-domain-ideas/`.

**Current focus:** Obsidian + AI chat. Get that right first.

---

## Project Status

**Last Updated:** 2025-10-20

**Current State:**
- App has blank screen issue (recent mode toggle code broke it)
- Need to revert experimental code
- Need to focus on simple layout customization

**Next Steps:**
1. Fix blank screen (revert mode toggle code)
2. Research: What's the simplest Theia pattern for custom default layout?
3. Implement: Clean markdown + AI chat layout
4. No hacks, no "MVP shortcuts" - proper architecture

**Key Learning:** Don't fight Theia's architecture. Work with it.
