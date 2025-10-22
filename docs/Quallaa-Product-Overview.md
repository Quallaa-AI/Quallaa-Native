# Quallaa Product Overview

**Last Updated:** 2025-10-20

---

## Current Goal

**Build a dual-mode knowledge base + natural language development environment on Eclipse Theia.**

**Default Mode (90% of usage):**
- Clean markdown editor interface (Obsidian-like)
- AI chat panel side-by-side
- Distraction-free environment - hides IDE complexity
- AI can read/edit files and execute against real infrastructure
- Simple, streamlined experience for non-developers

**Developer Mode:**
- Full IDE exposed when needed
- Complete Theia functionality accessible
- Developers can toggle to this mode OR use their preferred external IDE
- Progressive disclosure of complexity

**Key Principle:** We're not stripping IDE features—we're creating a simple default experience that makes the power accessible to domain experts while keeping full developer capabilities available.

**What this is NOT:**
- NOT removing IDE functionality
- NOT a dumbed-down version of Theia
- NOT building "no-code" or rigid workflow tools
- NOT just a chat interface - it's an execution environment

---

## Vision

Quallaa is an AI execution environment that gives domain experts access to developer-grade AI capabilities without requiring coding skills.

**The Core Insight:** IDE + Command Line + Frontier AI models = the most capable AI execution environment.

**Why This Matters:**
- Most people are stuck with chat interfaces that can only describe solutions
- Developers have AI tools that **directly execute** - modifying files, orchestrating infrastructure, getting real work done
- Quallaa democratizes this power for domain experts

**Current Focus:** Get the foundation right - dual-mode interface with clean default experience and full IDE available.

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

**Reference:** `docs/research/2025-01-theia-shell-customization-research.md` - Research validating ApplicationShell API approach for layout customization

---

## Future Ideas (Archive)

For context on what we've considered and may revisit later, see `docs/archive/`:
- `2025-10-domain-ideas/` - Domain abstraction system, marketing automation, etc.
- `2025-01-mode-toggle/` - Simple/developer mode toggle research

These are parked ideas that may or may not happen. The current focus is: **Obsidian + AI chat.**

---

## Future Enhancements (Reference Only)

Once the dual-mode foundation is solid, potential enhancements include:
- Domain-specific environment templates (marketing, finance, legal, etc.)
- Pre-configured infrastructure per domain (databases, email providers, API connections)
- AI-modifiable domain scaffolding
- Team collaboration features
- Enterprise deployment options

**Status:** These are ideas that may or may not happen. Detailed planning documents have been archived in `docs/archive/2025-10-domain-ideas/`.

**Current focus:** Get the dual-mode KB + development environment foundation right first.

---

## Project Status

**Last Updated:** 2025-10-22

**Current State - Foundation Complete (95%):**
- ✅ Dual-mode architecture fully implemented and working
- ✅ Clean Obsidian-like knowledge mode UI achieved
- ✅ Mode toggle functional (Cmd+Shift+M)
- ✅ First-launch defaults to knowledge mode
- ✅ CSS-based UI hiding (reliable, no timing issues)
- ✅ Proper Theia lifecycle hooks and architecture
- ✅ Auto-build process for CSS assets

**What's Working:**
- **Knowledge Mode:** Ultra-clean interface with hidden icon ribbon and status bar
- **Developer Mode:** Full IDE with all panels and chrome visible
- **Layout:** Docs tree (left) + Editor (center) + AI Chat (right)
- **Mode Persistence:** User preference saved across sessions
- **Build Process:** Automated CSS copying during compilation

**Next Steps (5% remaining):**
1. Populate docs tree with actual markdown file navigation
2. Wire up AI chat functionality
3. Fine-tune file tree styling to match Obsidian exactly
4. Add keyboard shortcut hints for new users
5. Consider collapsible panels for chat

**Key Learnings Applied:**
- ✅ Worked with Theia's architecture, not against it
- ✅ Used CSS for UI manipulation (reliable cross-timing)
- ✅ Proper dependency injection and lifecycle management
- ✅ First-launch detection for intelligent defaults
