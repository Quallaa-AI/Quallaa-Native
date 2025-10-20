# Architecture Decisions

This document tracks significant architectural and design decisions for the Quallaa project.

## Format

Each decision includes:
- **Date:** When decided
- **Context:** Why we faced this choice
- **Decision:** What we chose
- **Rationale:** Why this option
- **Consequences:** Trade-offs accepted
- **Status:** ⏳ Pending | ✅ Active | ❌ Superseded | 🗄️ Deprecated

---

## [2025-01-19] Shell Customization Approach

**Context:**
Need to toggle between "simple mode" (minimal UI for markdown editing) and "developer mode" (full IDE). Three main options considered:
1. Use ApplicationShell panel APIs (collapse/expand)
2. Create custom ApplicationShell subclass
3. Build separate app that embeds Theia components

**Decision:**
Use ApplicationShell panel APIs (Option 1) - programmatically control panel visibility using:
- `shell.collapsePanel('left' | 'right' | 'bottom')`
- `shell.expandPanel('left' | 'right' | 'bottom')`
- `shell.topPanel.hide()` / `shell.topPanel.show()`
- Implement via `FrontendApplicationContribution` lifecycle hooks

**Rationale:**
- Lowest risk approach - uses official Theia extension points
- No forking or subclassing of core Theia components
- Easier to maintain across Theia version updates
- Proven pattern in Theia architecture (panel handlers designed for this)
- Clean separation of concerns (our code is a contribution, not a modification)

**Consequences:**
- ✅ Clean, maintainable implementation
- ✅ Works seamlessly with Theia's layout persistence system
- ✅ Can leverage Theia updates without merge conflicts
- ✅ Easy to debug (standard Theia APIs)
- ❌ Limited to Theia's panel structure (can't radically redesign shell)
- ❌ May have constraints on widget placement/behavior
- ❌ Users could potentially break layout by manually moving widgets

**Research:** [research/2025-01-theia-shell-customization-research.md](research/2025-01-theia-shell-customization-research.md)

**Status:** ✅ Active (validated with corrections - 2025-01-19)

**Key Research Findings:**
- ✅ Approach validated by Arduino IDE 2.0 (production-proven)
- 🔧 Critical correction: Use `topPanel.hide()` not `collapsePanel('top')`
- ⚠️ Need animation duration workaround (50ms) for side panel width race condition
- ⚠️ Widget placement issue: users can drag widgets into collapsed panels
- 🚨 Accessibility concerns: menu bar hiding needs mitigation
- 📋 Recommended phased approach: Start with simple API (Phase 1), defer custom ApplicationShell to Phase 2

**Implementation Plan:**
- Phase 1 (MVP): Standard APIs with corrections (1-2 weeks) ← START HERE
- Phase 2 (If needed): Custom ApplicationShell for widget placement enforcement (2-3 weeks)
- Phase 3 (Production): Accessibility improvements (1-2 weeks)

---

## [2025-01-15] Knowledge Base Implementation: Markdown-Only, No Wiki Links (MVP)

**Context:**
Users need a place to store context/notes that AI can reference. Full Obsidian clone with graph views, backlinks, and [[wiki-style links]] would be significant scope creep. Need to ship fast.

**Decision:**
Ship markdown editor + docs tree view only for MVP. Features included:
- Markdown-only file tree (already implemented in `/packages/docs-view/`)
- Monaco editor for .md files (standard Theia editor)
- Markdown preview (existing Theia preview package)
- AI chat can reference these docs

Features deferred to Phase 2+:
- No [[wiki links]] or backlinks
- No graph view
- No tag system
- No templates or quick capture

**Rationale:**
- Core value proposition is "AI + editable context", not knowledge management graph
- Can add wiki features later if users actually demand them
- Theia already has production-ready markdown preview
- Docs tree widget already built and tested
- Faster time to market = faster user feedback

**Consequences:**
- ✅ Ships in weeks instead of months
- ✅ Lower complexity = fewer bugs
- ✅ Can validate core value prop (AI + context) quickly
- ✅ Easy to add wiki features later (non-breaking)
- ❌ Users coming from Obsidian may miss [[links]]
- ❌ Need to educate users this is "context for AI" not "second brain"
- ❌ May need to add wiki links in Phase 2 if users demand it

**Status:** ✅ Active

---

## [2025-01-10] EPL 2.0 Compliance: Attribution in About Dialog

**Context:**
Eclipse Theia is licensed under EPL 2.0 (Eclipse Public License). Quallaa is a derivative work. Need to comply with license requirements for attribution and source availability.

**Decision:**
Maintain EPL 2.0 compliance by:
- Keep "Built on Eclipse Theia" in About Dialog
- Include LICENSE-EPL.txt and NOTICE files in distributions
- Preserve copyright headers in modified Theia files
- Link to source code repository (GitHub)
- Never use "Theia" or "Eclipse" trademarks in product name

**Rationale:**
- Legal requirement (not optional)
- Ethical obligation to open source project
- Builds trust with users (transparency about foundation)
- Avoids legal risk

**Consequences:**
- ✅ Legally compliant
- ✅ Good open source citizenship
- ✅ Can accept contributions from Theia community
- ❌ Must acknowledge Theia in user-facing UI
- ❌ Must maintain source code repository publicly

**Status:** ✅ Active

---

## [2025-01-08] Desktop-First Development (Electron Priority)

**Context:**
Quallaa targets both desktop (Electron) and web (browser) deployment. Need to decide which to prioritize for MVP.

**Decision:**
Prioritize desktop (Electron) build for MVP. Web (browser) deployment is supported but secondary.

**Rationale:**
- Desktop provides better native OS integration (file system, notifications)
- Easier to distribute (DMG/EXE) than web deployment infrastructure
- Target users (SMB domain experts) expect desktop apps
- Web deployment can be added later without major refactoring

**Consequences:**
- ✅ Faster MVP (don't need to set up web hosting)
- ✅ Better user experience (native menus, shortcuts)
- ✅ Offline capability built-in
- ❌ Requires code signing and notarization (macOS)
- ❌ Larger download size vs web app
- ❌ Must support multiple OS platforms

**Status:** ✅ Active

---

## [2024-12-15] Monorepo Structure: Keep Theia Packages Separate

**Context:**
Should we merge Quallaa-specific code into existing `@theia/*` packages or create separate `@quallaa/*` packages?

**Decision:**
Create separate packages for Quallaa-specific code:
- `packages/quallaa-core/` - Shell layout, core customizations
- `packages/docs-view/` - Markdown-only file tree (already implemented)
- Keep `@theia/*` namespace intact for upstream packages

**Rationale:**
- Clean separation between Theia platform and Quallaa product
- Easier to update Theia dependencies (no merge conflicts)
- Clear ownership (what's ours vs what's Theia's)
- Avoids confusion with official Theia packages

**Consequences:**
- ✅ Clean architecture
- ✅ Easy Theia upgrades
- ✅ Clear mental model for contributors
- ❌ Additional package management overhead
- ❌ More complex dependency graph

**Status:** ✅ Active

---

## Template for New Decisions

**Context:**
[Why did this question come up? What problem are we solving?]

**Decision:**
[What did we choose?]

**Rationale:**
[Why this option over alternatives?]

**Consequences:**
[Trade-offs, risks, benefits]

**Status:** [⏳ Pending | ✅ Active | ❌ Superseded | 🗄️ Deprecated]

---

## How to Add a New Decision

1. Copy the template above
2. Fill in all sections (don't skip consequences!)
3. Add date in [YYYY-MM-DD] format
4. Update `docs/README.md` to reference the new decision in "Latest Decisions"
5. Commit with message: `docs: Add architecture decision for [topic]`

## Superseding a Decision

When a decision is no longer valid:
1. Change status to ❌ Superseded
2. Add note: "Superseded by [link to new decision]"
3. Keep the original decision (don't delete - it's historical context)
