# Progressive Disclosure Strategy Update

**Date:** 2025-10-14
**Status:** Planning documents updated

## Summary of Changes

Based on user feedback, we have **removed** the following concepts from all planning documents:

### Removed Concepts

1. **Expertise Detection** - No automatic detection of user skill level
2. **Gamification** - No achievement systems, progress indicators, or game-like elements
3. **Adaptive UI Based on Behavior** - No automatic UI changes based on usage patterns

### Updated Approach

**Core Principle:** User explicitly chooses their project template and experiences a domain-specific interface by default (similar to Mailchimp/HubSpot), not a traditional IDE.

## New Progressive Disclosure Strategy

### Default Experience

```
┌─────────────────────────────────────────────────────────────┐
│ Home | Campaigns | Audience | Analytics | Docs              │
├───────────────────────────────────┬─────────────────────────┤
│                                   │                         │
│  Domain-Specific Dashboard        │  Claude Code Chat       │
│  - Active campaigns               │  (Always visible)       │
│  - Segment overview               │  "Create campaign for   │
│  - Recent activity                │   trial users..."       │
│                                   │                         │
│                                   │  [Type message...]      │
│                                   │                         │
└───────────────────────────────────┴─────────────────────────┘

(IDE panels hidden by default)
```

### Key Features

1. **Domain-Specific Navigation Tabs**
   - Home, Campaigns, Audience, Analytics, **Docs**
   - Replaces traditional IDE file explorer/sidebar

2. **Claude Code Chat Panel**
   - Always visible (side-by-side with domain content)
   - Primary interaction method for non-technical users

3. **IDE Panels Hidden by Default**
   - Explorer, Search, Source Control hidden
   - Terminal accessible but not prominent (Cmd+` to reveal)
   - "View → Show IDE Panels" command to reveal all IDE features
   - Keyboard shortcuts always work (Cmd+Shift+E, etc.)

4. **Knowledge Base Tab (Critical Differentiator)**
   - Obsidian-style markdown editor
   - Users document strategy, rules, workflows
   - AI reads these docs for context when executing commands
   - Wiki-style `[[links]]` between notes (future enhancement)
   - Bridges business thinking with technical execution

## Why This Approach

### Advantages Over Original Plan

- **No complexity** - Simple, explicit choice (domain UI or IDE panels)
- **No tracking** - No need to monitor user behavior
- **No surprises** - UI doesn't change unexpectedly
- **Professional** - Feels like business tool, not learning game

### Key Differentiation

**vs. HubSpot/Mailchimp:**
- They don't have knowledge base for context
- They don't have AI that reads your strategy docs
- They don't have Claude Code chat integration

**vs. Cursor/GitHub Copilot:**
- We're not targeting developers
- Domain-first UI, not IDE-first
- Business workflows, not coding workflows

## Implementation Implications

### Phase 2 (Marketing Domain MVP)

**Must implement:**
1. Custom shell layout contribution (hide IDE panels)
2. Domain navigation widget (Home, Campaigns, Audience, Analytics, Docs)
3. Knowledge Base widget (Docs tab)
4. "Show IDE Panels" command
5. Claude Code chat panel integration

**Do NOT implement:**
- User profiling or behavior tracking
- Adaptive UI logic
- Gamification systems
- Expertise level detection
- Achievement or progress indicators

### Architecture

```typescript
// Simple shell layout - no user profiling needed
@injectable()
export class MarketingShellLayout implements ApplicationShellLayoutMigration {
  async onWillInflateLayout(layout: ApplicationShellLayoutVersion): Promise<void> {
    // Hide IDE panels
    layout.leftPanel = { visible: false };
    layout.bottomPanel = { visible: false };

    // Show domain navigation
    layout.topPanel = {
      visible: true,
      widgets: ['marketing-navigation'] // Home | Campaigns | Audience | Analytics | Docs
    };

    // Main area: Domain content + Claude Code chat
    layout.mainPanel = {
      widgets: [
        { id: 'marketing-dashboard', area: 'main', ratio: 0.6 },
        { id: 'claude-code-chat', area: 'right', ratio: 0.4 }
      ]
    };
  }
}

// Simple command to reveal IDE - no conditions, no tracking
@injectable()
export class ShowIDEPanelsCommand implements Command {
  static readonly ID = 'quallaa.show-ide-panels';

  execute(): void {
    this.shell.leftPanel.show();
    this.shell.bottomPanel.show();
  }
}
```

## Documents Updated

1. **CLAUDE.md**
   - Updated Phase 2 description
   - Rewrote "Progressive Disclosure" section
   - Added knowledge base as core feature
   - Removed references to expertise detection

2. **docs/planning/marketing-environment-mvp.md**
   - Updated architecture diagram
   - Added Docs tab to navigation
   - Renamed Phase 10 to "Knowledge Base & IDE Toggle"
   - Added Claude Code chat to default layout
   - Updated Core Philosophy section

3. **docs/planning/Application Layer Architecture...md**
   - Updated Section 6: Progressive Disclosure UI Architecture
   - Replaced adaptive UI code with domain-specific shell layout
   - Added Knowledge Base widget example
   - Updated Phase 3 roadmap (removed user level inference)
   - Updated architecture decision summary
   - Added note explaining difference from original research

## Next Steps

1. ✅ Planning documents updated (completed)
2. Begin Phase 1 implementation (project template system)
3. Phase 2: Implement custom shell layout with domain navigation
4. Phase 10: Implement knowledge base widget

## Success Criteria

Users should:
- See domain-specific interface immediately (no IDE chrome)
- Have Claude Code chat always available
- Be able to document strategy in markdown (Docs tab)
- Access IDE features when needed (explicit toggle)
- Never experience automatic UI changes or gamification

---

**Note:** This approach is simpler, more professional, and easier to implement than the original adaptive UI concept.
