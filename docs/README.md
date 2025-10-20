# Quallaa Project Knowledge Base

**Last Updated:** 2025-01-19
**Current Phase:** Phase 1 - Foundation Development
**Active Focus:** Simple Mode / Developer Mode Toggle

---

## 🎯 What We're Building Right Now

**Goal:** Markdown editor + AI chat with progressive disclosure
**Metaphor:** Obsidian-like simplicity + full IDE when needed

**Current Sprint:** [See planning/CURRENT-SPRINT.md](planning/CURRENT-SPRINT.md)
- Research: Validate Theia shell customization approach
- Implement: Simple mode shell layout
- Implement: Developer mode toggle command
- Test: Mode persistence between sessions

---

## 📋 Latest Decisions

**2025-01-19:** Using Theia ApplicationShell APIs (not custom shell subclass)
- Decision: [DECISIONS.md#shell-customization-approach](DECISIONS.md#shell-customization-approach)
- Research: [research/2025-01-theia-shell-customization-research.md](research/2025-01-theia-shell-customization-research.md) *(complete - validated)*
- Status: Approved - implementing Phase 1 (standard APIs)

**2025-01-15:** Docs-only view for knowledge base (no wiki links yet)
- Markdown editor + docs tree only
- No [[wiki links]], no graph view (Phase 2+)

---

## 🗺️ Key Documents by Purpose

**Understanding the Product:**
- [Quallaa-Product-Overview.md](Quallaa-Product-Overview.md) - Vision, market, strategy
- [architecture/domain-abstraction-principles.md](architecture/domain-abstraction-principles.md) - Core technical philosophy

**Current Implementation:**
- [planning/CURRENT-SPRINT.md](planning/CURRENT-SPRINT.md) - What we're coding this week
- [architecture/shell-modes-design.md](architecture/shell-modes-design.md) - Simple/Developer mode technical spec *(to be created)*

**Backlog & Future Work:**
- [planning/todo.md](planning/todo.md) - Future work queue
- [planning/marketing-environment-mvp.md](planning/marketing-environment-mvp.md) - Phase 2 plan (6-week implementation)

**Build & Deploy:**
- [deployment/quick-start.md](deployment/quick-start.md) - Quick deployment guide
- [deployment/theia-cloud.md](deployment/theia-cloud.md) - Theia Cloud deployment

**Theia Development:**
- [../CLAUDE.md](../CLAUDE.md) - Comprehensive guide for working with Theia codebase
- [../doc/](../doc/) - Theia platform documentation (Developing.md, Testing.md, etc.)

---

## 🚫 What We're NOT Doing Yet

- Domain-specific templates (Phase 2)
- Wiki-style [[links]] (Phase 2+)
- Marketing environment (Phase 2)
- Custom AI agents (not planned)

See [archive/](archive/) for abandoned ideas (directory will be created when needed).

---

## 📖 How to Use This Knowledge Base

**For Claude Code:**
1. Read this README first (current state)
2. Check CURRENT-SPRINT.md for active tasks
3. Review DECISIONS.md for architectural choices
4. Reference architecture/ docs for implementation details
5. See ../CLAUDE.md for Theia-specific guidance

**For Humans:**
- Start with Quallaa-Product-Overview.md (the "why")
- Check CURRENT-SPRINT.md (what's happening now)
- See ../CLAUDE.md for Theia development workflow
- Review DECISIONS.md for context on technical choices

---

## 📁 Directory Structure

```
docs/
├── README.md                      # This file - knowledge base index
├── DECISIONS.md                   # Architecture decision record (ADR)
├── Quallaa-Product-Overview.md    # Product vision & strategy
│
├── research/                      # Research & validation documents
│   └── 2025-01-theia-shell-customization-research.md
│
├── architecture/                  # How things work/should work
│   ├── domain-abstraction-principles.md
│   └── shell-modes-design.md      (to be created)
│
├── planning/                      # What we're building
│   ├── CURRENT-SPRINT.md          # Active tasks this week/sprint
│   ├── todo.md                    # Future work backlog
│   └── marketing-environment-mvp.md
│
└── deployment/                    # How to run/ship
    ├── quick-start.md
    └── theia-cloud.md
```

---

## 🔄 Keeping This Current

**Update this README when:**
- Starting a new sprint (update "What We're Building Right Now")
- Making an architecture decision (add to "Latest Decisions")
- Completing a major milestone (update "Current Phase")
- Changing project direction (update focus areas)

**Frequency:** Review and update at least weekly during active development.
