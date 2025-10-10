# Quallaa Product Overview

## "In the right environment, a seed can grow into a beautiful tree." - Jeff Toffoli, Chief Human in the Loop, Quallaa

## Executive Summary

**Quallaa is an AI execution environment that gives domain experts access to developer-grade AI capabilities.**

While most people are limited to chat interfaces that waste 67% of AI potential through translation bottlenecks, developers have AI tools that directly execute code, modify files, and orchestrate infrastructure. Quallaa democratizes this power for non-developer domain experts (marketers, financial analysts, consultants, etc.) by providing a complete execution environment rather than just a chat interface.

**Core Value Proposition:** IDE + Command Line + frontier AI models = the most capable AI execution environment for domain experts.

---

## The Problem: The AI Capability Gap

### Current State

**Developers have full AI power:**
- AI tools that directly execute, modify files, orchestrate infrastructure
- Command line access for automation
- Integration with real services (databases, APIs, cloud platforms)
- Zero translation bottleneck - AI does the work directly

**Non-developers are stuck with chat:**
- AI describes solutions but can't execute them
- Users must manually translate AI suggestions into actions
- 67% of AI potential lost in the translation bottleneck
- No access to real infrastructure or automation

### The Market Opportunity

**51% of SMBs are experimenting with AI but stuck:**
- Have deep domain expertise but no coding skills
- Understand what needs to be done, just can't execute technically
- Willing to learn new paradigms if it gives them 10x productivity
- Currently frustrated with chat-only AI tools that can't actually DO anything

**Not targeting:** Enterprise developers, large IT departments, people who want rigid "no-code" tools

---

## The Solution: AI Execution Environments

### Core Concept

Quallaa provides **execution environments**, not just chat interfaces or pre-configured workflows:

- **Real infrastructure:** PostgreSQL databases, email providers, API integrations
- **Frontier AI models used as-is:** Claude, GPT, etc. (no custom training needed)
- **IDE as command center:** Orchestrate anything tokenizable
- **Progressive disclosure:** IDE complexity hidden by default but fully accessible

### Key Architecture: Domain Layer Over IDE Foundation

```
┌────────────────────────────────────────────┐
│  Domain Navigation (What users see first)  │
│  [Home] [Campaigns] [Audience] [Analytics] │  ← Marketing Environment
├────────────────────────────────────────────┤
│  IDE Foundation (Available but hidden)     │
│  Explorer | Terminal | Source Control      │  ← Full power underneath
└────────────────────────────────────────────┘
```

Users see a **marketing automation platform** or **financial analysis tool**, not an IDE. But the full IDE capability exists underneath for power users and future needs.

### The Three-Way Relationship: Infrastructure, UI, AI

**Architectural Principle:** Infrastructure is the source of truth. Visual UI and AI both orchestrate the same databases, files, APIs, and services.

```
┌──────────────────────────────────────────────────────────┐
│  User Interaction Layer                                  │
│                                                           │
│  ┌─────────────────┐        ┌──────────────────┐        │
│  │  Visual UI      │        │  Claude Code AI  │        │
│  │  - Drag & drop  │        │  - Natural lang  │        │
│  │  - Form inputs  │        │  - Commands      │        │
│  │  - Wizards      │        │  - Automation    │        │
│  └────────┬────────┘        └────────┬─────────┘        │
│           │                          │                   │
│           ├──────────────────────────┤                   │
│           │                          │                   │
│           ▼                          ▼                   │
│  ┌─────────────────────────────────────────────────┐    │
│  │  Domain Infrastructure (Source of Truth)        │    │
│  │                                                  │    │
│  │  Databases:                                      │    │
│  │  - PostgreSQL (customers, campaigns, segments)  │    │
│  │  - Redis (cache, sessions)                      │    │
│  │                                                  │    │
│  │  APIs/Services:                                  │    │
│  │  - Resend/SendGrid (email delivery)             │    │
│  │  - Google Analytics (tracking)                  │    │
│  │  - Stripe (payments)                            │    │
│  │                                                  │    │
│  │  File Systems:                                   │    │
│  │  - Email templates (.email.tsx)                 │    │
│  │  - Configuration (.quallaa/)                    │    │
│  │                                                  │    │
│  │  Runtime:                                        │    │
│  │  - Background jobs, webhooks, queues            │    │
│  └─────────────────────────────────────────────────┘    │
│                                                          │
│  Both UI and AI orchestrate the same infrastructure     │
└──────────────────────────────────────────────────────────┘
```

**Example Workflows:**

**Workflow 1: Database Operations**
- **Visual UI:** User drags customer into "Trial Users" segment
  - Infrastructure: PostgreSQL `INSERT INTO segments...`
- **AI:** "Show me customers who haven't opened emails in 30 days"
  - Infrastructure: AI executes PostgreSQL query, displays results
- **Code mode:** Power user writes SQL query directly
  - Infrastructure: Same PostgreSQL database

**Workflow 2: API Integration**
- **Visual UI:** User clicks "Send Test Campaign"
  - Infrastructure: Backend calls Resend API, updates database
- **AI:** "Send welcome campaign to trial users segment"
  - Infrastructure: AI queries database + calls Resend API
- **Result:** Batch email sent, analytics recorded

**Workflow 3: Hybrid (Files + Database)**
- **Visual UI:** User edits email template visually
  - Infrastructure: Saves to `templates/welcome.email.tsx`
- **AI:** "Create campaign using welcome template for segment X"
  - Infrastructure: Reads file + queries database + schedules background job

**Why This Matters:**
- **No artificial boundaries** - AI orchestrates databases, APIs, files, jobs
- **CRM-like functionality** without building CRM - it's PostgreSQL + widgets
- **Version control** - Git tracks files, database migrations tracked separately
- **Future-proof** - AI executes against real infrastructure, not just text
- **Unlimited extensibility** - AI can add database tables, API integrations, file types

---

## Technology Foundation: Why Eclipse Theia?

Quallaa is built on **Eclipse Theia**, an open-source IDE platform that provides the perfect foundation:

1. **Extension ecosystem** - Supports VS Code extensions, enabling integration with any tool/service
2. **Frontend-backend architecture** - Can orchestrate infrastructure (databases, APIs) from backend, not just edit text
3. **Cross-platform** - Desktop (Electron) AND web deployment for maximum accessibility
4. **Open source** - Full control over customization and progressive disclosure UX
5. **Production-ready** - Used by major companies; not a toy or prototype

**Why NOT VS Code?**
- VS Code is an IDE product, Theia is an IDE platform
- We need to customize the entire user experience, not just add extensions
- Need backend that can manage databases, APIs, infrastructure
- Need to support both desktop and web deployment

**Legal/Licensing:**
- Eclipse Theia is licensed under EPL 2.0 (Eclipse Public License)
- Allows commercial use, modification, and redistribution
- Must maintain attribution ("Built on Eclipse Theia")
- Must provide source code access (open source requirement)

---

## Product Roadmap

### Phase 1: Foundation (Current - MVP)

**Objective:** Rebrand Theia to establish Quallaa foundation

**Deliverables:**
- Visual rebrand (name, icons, branding)
- Build targets: Desktop (Electron) AND web (browser)
- AI integration (Claude Code)
- Basic IDE functionality for early adopters who understand "command center" concept

**Timeline:** 2-3 weeks (currently in progress)

**Success Criteria:**
- Application name is "Quallaa" everywhere users see it
- Desktop installers work without OS warnings (code signing)
- Web version loads and works in modern browsers
- Basic IDE functionality works (open folder, edit, save)
- Settings persist in `~/.quallaa/` directory
- EPL 2.0 compliance maintained

### Phase 2: First Domain Environment (In Development)

**Objective:** Create first domain-specific environment (Marketing)

**What is a Domain Environment?**

A complete, pre-configured project template with:
1. **Custom Shell Layout** - Domain-specific navigation replaces traditional IDE chrome
2. **Backend Infrastructure** - PostgreSQL database, API integrations managed by Theia backend
3. **Project Template** - Scaffolded directory structure, schemas, sample data
4. **Configuration Wizards** - Step-by-step setup for API keys, database connection
5. **Domain Widgets** - Visual editors, dashboards, managers tailored to the domain
6. **AI Integration** - Claude Code can call backend services to execute domain operations

**Marketing Environment Example:**

User creates "New Marketing Environment" →

**Wizard guides through:**
- Resend API key setup (with screenshots, validation)
- Database configuration (local Docker or cloud)
- Sample campaign import (optional)

**Creates project:**
```
my-marketing-project/
├── .quallaa/
│   ├── project-type.json        # Identifies as marketing project
│   ├── services.json             # API keys (encrypted)
│   └── database/schema.sql       # Pre-configured tables
├── campaigns/
├── emails/templates/
└── segments/
```

**Opens with custom UI:**
- **Top:** [Home] [Campaigns] [Audience] [Analytics] tabs
- **Main:** Campaign manager, email editor, segment builder
- **Hidden:** File explorer, terminal (Cmd+B to show for power users)

**AI can execute:**
- "Create welcome campaign for trial users" → Calls backend service
- "Send test email to me" → Calls Resend API via backend
- "Show contacts inactive 30 days" → Queries PostgreSQL via backend

**Timeline:** 6 weeks after Phase 1

**Deliverables:**
- Marketing environment template
- Email template editor (React Email integration)
- Campaign manager widget
- Audience segmentation interface
- PostgreSQL database management
- Resend API integration
- Setup wizards for non-technical users

### Domain Evolution Through AI Modification

**Critical Concept:** Users don't just USE the marketing environment - they EVOLVE it through AI commands.

**The marketing domain is a starting template, not a finished product.**

**Starting Point:**
- Base campaign builder
- Email template editor
- Customer database schema
- Resend API integration

**User Customization via AI:**

**Example 1:** User commands "I need priority levels on campaigns"
- AI modifies database schema → Adds `priority` column
- AI updates React components → Adds priority dropdown to Campaign Builder
- AI updates TypeScript interfaces → Adds `priority` field to Campaign type
- Result: Priority functionality that didn't exist in template

**Example 2:** User commands "Track webinar campaigns with registration counts"
- AI creates new database tables → `webinar_campaigns`, `webinar_registrations`
- AI creates new widget → `WebinarCampaignBuilder.tsx`
- AI adds backend service → `WebinarService.ts` with registration tracking
- AI registers new AI tools → `create_webinar_campaign`, `get_registrations`
- Result: Complete webinar functionality fully integrated with existing system

**Example 3:** User commands "Integrate with Stripe to track customer revenue"
- AI adds Stripe API integration → Backend service with API calls
- AI extends database schema → Adds `revenue` and `stripe_customer_id` fields
- AI updates audience segmentation → Can now segment by revenue
- AI creates revenue dashboard widget → Visual analytics
- Result: Revenue tracking integrated across the entire marketing domain

**The Result:**
- Sarah's marketing domain ≠ Bob's marketing domain
- Each evolves uniquely based on business needs
- No two instances are exactly alike
- Users can build features we never imagined

**Why This Is Different:**

| Approach | Customization | Ceiling |
|----------|---------------|---------|
| **No-code tools** (Webflow, Bubble) | Configure settings, combine pre-built blocks | Hit ceiling when you need something not provided |
| **SaaS products** (HubSpot, Marketo) | Request features, wait for roadmap | Product team decides what gets built |
| **Quallaa** | AI modifies domain code via natural language | No ceiling - full programming capability |

Users focus on outcomes ("I need webinar tracking"), AI handles implementation (database schema, UI components, business logic, API integration).

This is only possible because:
- ✅ **IDE foundation** - Full programming environment (not limited sandbox)
- ✅ **AI execution** - AI modifies code, not just describes how to do it
- ✅ **Domain scaffolding** - Template provides 80% foundation
- ✅ **Infrastructure orchestration** - AI can add databases, APIs, background jobs

See `docs/architecture/domain-abstraction-principles.md` for complete architectural details on how domains support AI modifiability.

### Phase 3: Additional Domains & Enterprise Features (Future)

**Additional Environment Types:**
- **Finance:** Spreadsheet-like interface + reporting + data pipelines
- **Legal:** Document management + contract templates + clause library
- **Consulting:** Project tracking + deliverable templates + client portal

**Enterprise Features:**
- Multi-environment orchestration
- Team collaboration features
- Enterprise deployment options
- Environment templates marketplace

---

## Competitive Differentiation

### What Quallaa Is NOT

❌ **Custom-trained AI models** - We use frontier models (Claude, GPT) as-is
❌ **"AI agents"** - We don't build classification algorithms or decision trees
❌ **Rigid workflow automation** - We provide capability, users define workflows
❌ **No-code tool** - We provide progressive disclosure, not skill ceiling
❌ **Chat-only interface** - AI can execute directly, not just describe

### What Quallaa IS

✅ **Execution environment** - Real infrastructure, not simulated workflows
✅ **Future-proof architecture** - Anything tokenizable can be orchestrated
✅ **Progressive disclosure** - Simple by default, powerful when needed
✅ **File-based source of truth** - UI, AI, and code work with same files
✅ **Cross-platform** - Desktop AND web deployment

### Philosophy: Environment, Not Workflows

Many competitors provide "AI agents trained on marketing workflows" or "pre-built automation templates."

Quallaa provides:
- PostgreSQL database (for customer/campaign data)
- Email provider integration (SendGrid, Mailgun, Resend)
- Analytics API connections (Google Analytics, Mixpanel)
- File templates and schemas
- AI that can orchestrate all of this directly when user describes needs

**The difference:** Users define their own workflows using natural language + AI execution, rather than being constrained by pre-configured templates.

---

## Technical Architecture Summary

### Frontend-Backend Split

- **Backend:** Node.js server process
  - Handles file system, git, databases, external APIs
  - Can orchestrate real infrastructure (Postgres, email providers)
  - Enables true environment management, not just file editing

- **Frontend:** Browser/Electron renderer
  - UI (Monaco editor, custom widgets)
  - Communicates with backend via JSON-RPC over WebSocket

- **Shared code:** `common/` folders define protocols

### Key Technologies

- **Eclipse Theia** - IDE platform foundation
- **Electron** - Desktop application framework
- **Monaco Editor** - VS Code's text editor
- **InversifyJS** - Dependency injection (enables customization)
- **PostgreSQL** - Database for domain environments
- **React Email** - Email template system (marketing environment)
- **Resend API** - Email sending service (marketing environment)

### Deployment Models

1. **Desktop (Electron):**
   - macOS DMG
   - Windows EXE
   - Linux AppImage
   - Full native integration (file system, OS APIs)

2. **Web (Browser):**
   - Deployed to standard web hosting
   - Requires backend server deployment
   - Cross-platform access via browser
   - Limited native integration

**MVP focuses on Desktop first** (better native integration), but maintains web compatibility for future expansion.

---

## Target Market & Go-to-Market

### Primary Target: SMB Domain Experts ("Explorers")

**Characteristics:**
- 51% of SMBs experimenting with AI but stuck with chat interfaces
- Deep domain expertise but no coding skills
- Understand what needs to be done, can't execute technically
- Willing to learn new paradigms for 10x productivity
- Frustrated with AI tools that can't actually DO anything

**Use Cases by Domain:**

**Marketing:**
- Email campaign management
- Audience segmentation
- A/B testing automation
- Analytics integration
- CRM-like functionality

**Finance:**
- Financial reporting
- Data analysis and visualization
- Budget modeling
- Pipeline management

**Consulting:**
- Client project tracking
- Deliverable templating
- Time tracking and billing
- Proposal generation

### Pricing Strategy (TBD)

**Potential Models:**
- Per-user subscription (SaaS model for web version)
- One-time license (desktop version)
- Freemium (basic IDE free, domain environments paid)
- Usage-based (AI execution costs passed through)

---

## Success Metrics

### Phase 1 (MVP) Metrics
- Successful installation on all platforms (macOS, Windows, Linux, Web)
- Basic IDE operations work (open, edit, save)
- AI integration functional
- Zero critical bugs in core workflows

### Phase 2 (Marketing Environment) Metrics
- Non-technical users can complete setup wizard
- Users can create and send email campaigns
- Database operations work reliably
- API integrations (Resend, analytics) functional
- User feedback: "This is easier than [competitor]"

### Long-term Business Metrics
- Monthly Active Users (MAU)
- Retention rate (30-day, 90-day)
- Time to first value (TTFV)
- Net Promoter Score (NPS)
- Revenue per customer
- Expansion to additional domains

---

## Risks & Mitigation

### Technical Risks

**Risk:** Theia platform limitations
**Mitigation:** Deep evaluation completed; platform meets all requirements

**Risk:** AI model dependencies (Claude, GPT availability/pricing)
**Mitigation:** Platform-agnostic design; can swap AI providers

**Risk:** Desktop code signing complexity
**Mitigation:** Environment variables + electron-builder automation

**Risk:** Performance issues (startup time, memory usage)
**Mitigation:** Acceptable for MVP; optimization in Phase 3

### Market Risks

**Risk:** Users don't understand "execution environment" concept
**Mitigation:** Progressive disclosure; start with familiar domain UI

**Risk:** Learning curve too steep for non-technical users
**Mitigation:** Setup wizards, templates, guided workflows

**Risk:** Competition from established tools (Zapier, Make, etc.)
**Mitigation:** Differentiate on AI execution capability, not workflow automation

### Business Risks

**Risk:** EPL 2.0 compliance violations
**Mitigation:** Clear attribution, legal review, NOTICE files

**Risk:** Slow adoption due to unfamiliar paradigm
**Mitigation:** Focus on early adopters ("Explorers"), gather feedback

---

## Open Questions for Product Team

1. **Pricing model:** Subscription vs. one-time license vs. freemium?
2. **First domain priority:** Should marketing be first, or different domain?
3. **Distribution:** Desktop-first or web-first? Both simultaneously?
4. **AI provider strategy:** Exclusive Claude partnership or multi-provider?
5. **Enterprise features:** How soon do we need team collaboration, SSO, etc.?
6. **Branding:** "Quallaa" final or placeholder? Tagline/positioning?
7. **Support model:** Community-supported (Discord) or paid support tiers?

---

## Next Steps

### For Product Team Review

1. **Validate core concept:** Does "AI execution environment" resonate?
2. **Confirm target market:** Are SMB domain experts the right focus?
3. **Review roadmap:** Phase 1 → 2 → 3 sequencing make sense?
4. **Assess competitive position:** Differentiation strong enough?
5. **Business model alignment:** Pricing/distribution strategy questions

### After Product Team Alignment

1. Complete Phase 1 rebrand (2-3 weeks)
2. User research: Interview target users (marketers, analysts, consultants)
3. Refine Phase 2 marketing environment based on feedback
4. Begin Phase 2 development (6 weeks)
5. Beta testing with early adopters

---

## Contact & Resources

**Project Repository:** [GitHub link - internal]
**Documentation:** `/docs/planning/` directory
**Key Planning Docs:**
- `rebrand-guide.md` - Strategic guide and business context
- `todo.md` - Detailed 9-phase rebrand plan
- `marketing-environment-mvp.md` - Complete Phase 2 implementation plan

**Technical Foundation:**
- Eclipse Theia: https://theia-ide.org/
- EPL 2.0 License: https://www.eclipse.org/legal/epl-2.0/

---

*Document Version: 1.0*
*Last Updated: 2025-10-09*
*Prepared for: External Product Team Review*
