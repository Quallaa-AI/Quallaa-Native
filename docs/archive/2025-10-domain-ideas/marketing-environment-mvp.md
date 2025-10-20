# Marketing Environment MVP - Project Plan

## Vision

Create a **marketing command center** that gives non-technical marketing managers access to developer-grade AI capabilities. Users should see a domain-specific interface (Home, Campaigns, Audience, etc.) rather than a traditional IDE, while still having full IDE power underneath for progressive disclosure.

## Core Philosophy

- **Domain-specific UI layer** on top of IDE foundation, not just another IDE sidebar tab
- **Real infrastructure** (PostgreSQL, Resend API) managed automatically, not just file editing
- **Wizard-driven setup** for non-technical users getting API keys for the first time
- **Files as source of truth** - both visual UI and Claude Code work with same data
- **Knowledge base integration** - Obsidian-style docs for context management
- **Domain UI by default** - IDE features accessible but not prominent

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│  Domain Navigation (Top Layer)                              │
│  [Home] [Campaigns] [Audience] [Analytics] [Docs] ...      │
├───────────────────────────────────┬─────────────────────────┤
│                                   │                         │
│  Domain-Specific Widgets          │  Claude Code Chat       │
│  - Campaign Manager                │  (Always visible)       │
│  - Email Editor                    │  "Create campaign for   │
│  - Audience Segment Manager        │   trial users..."       │
│  - Analytics Dashboard             │                         │
│  - Knowledge Base (Docs tab)       │  [Type message...]      │
│                                    │                         │
├───────────────────────────────────┴─────────────────────────┤
│  IDE Tools (Bottom - Hidden by default)        │
│  Terminal | Problems | Output | Debug Console   │
└─────────────────────────────────────────────────┘

┌──────────────┐  ┌──────────────────────────────┐
│  IDE Sidebar │  │  Backend Services            │
│  (minimized) │  │  - PostgreSQL Manager        │
│  Explorer    │  │  - Resend API Client         │
│  Search      │  │  - JSON-RPC Endpoints        │
│  Source Ctrl │  │  - Claude Code Integration   │
└──────────────┘  └──────────────────────────────┘
```

---

## Project Template Structure

### What Gets Created

When user selects **File → New → Marketing Environment**, scaffold:

```
my-marketing-project/
├── .quallaa/
│   ├── project-type.json           # { "type": "marketing", "version": "1.0" }
│   ├── services.json               # API keys, DB connection (encrypted)
│   └── database/
│       ├── schema.sql               # Pre-configured tables
│       └── seed-data.sql            # Sample data (optional)
│
├── campaigns/
│   ├── README.md                    # What campaigns are, examples
│   └── .gitkeep
│
├── emails/
│   ├── templates/
│   │   └── welcome.email.tsx        # Sample react-email template
│   └── README.md
│
├── segments/
│   ├── trial-users.segment.json     # Audience segment definition
│   └── README.md
│
├── automations/
│   ├── welcome-series.automation.json
│   └── README.md
│
└── README.md                        # Project overview, getting started
```

---

## Implementation Phases

### **Phase 1: Foundation (Week 1)**

**Goal:** Project template system + basic scaffolding

**Tasks:**
1. [ ] Create project template definition format
2. [ ] Implement "New Project" wizard command
3. [ ] Build multi-step wizard UI component
4. [ ] Scaffold directory structure
5. [ ] Detect project type on workspace open
6. [ ] Store project metadata in `.quallaa/project-type.json`

**Deliverables:**
- User can create new marketing project via wizard
- Project structure is scaffolded with README files
- Theia detects marketing project type on open

---

### **Phase 2: Configuration Wizards (Week 1-2)**

**Goal:** Dead-simple service configuration for non-technical users

**Tasks:**
1. [ ] Build wizard framework (multi-step, validation, progress)
2. [ ] Resend API wizard:
   - Step 1: "What is Resend?" (educational)
   - Step 2: "Get your API key" (link + screenshot)
   - Step 3: Paste key, test connection
   - Step 4: Configure sender email/domain
3. [ ] Database setup wizard:
   - Option A: Local PostgreSQL (Docker)
   - Option B: Cloud connection string
   - Create schema automatically
4. [ ] Credential storage (OS keychain, not plaintext)

**Deliverables:**
- Non-technical user can set up Resend in 2 minutes
- Database is configured and running
- Credentials stored securely

---

### **Phase 3: Domain Navigation Shell (Week 2)**

**Goal:** Custom top navigation that replaces traditional IDE chrome

**Tasks:**
1. [ ] Study Theia shell/layout contribution system
2. [ ] Create custom shell layout for marketing projects
3. [ ] Build top navigation widget:
   - Home, Campaigns, Audience, Analytics, **Docs** tabs
   - Conditional rendering based on project type
4. [ ] Implement navigation state management
5. [ ] Hide IDE panels by default (Explorer, Search, Source Control)
6. [ ] Claude Code chat panel visible by default (side-by-side)
7. [ ] Keep terminal accessible but hidden (Cmd+` to reveal)

**Deliverables:**
- Marketing projects show domain navigation + chat
- Clicking tabs switches main area view
- IDE features accessible via keyboard shortcuts
- "View → Show IDE Panels" command to reveal traditional IDE

---

### **Phase 4: Backend Infrastructure (Week 2-3)**

**Goal:** Real services that frontend and Claude Code can call

**Tasks:**
1. [ ] Theia backend extension for marketing services
2. [ ] PostgreSQL management service:
   - Start/stop Docker container
   - Run migrations
   - Connection pooling
3. [ ] Resend API integration:
   - Send email method
   - Template rendering (react-email → HTML)
   - Error handling
4. [ ] JSON-RPC endpoints:
   - `/services/marketing/campaigns`
   - `/services/marketing/emails`
   - `/services/marketing/segments`
5. [ ] Database schema:
   - `contacts` table
   - `campaigns` table
   - `emails` table
   - `segments` table
   - `automation_runs` table

**Deliverables:**
- Backend services running and accessible
- Frontend can call services via JSON-RPC
- Claude Code can execute marketing operations

---

### **Phase 5: Core Widgets (Week 3-4)**

**Goal:** Essential domain-specific UI widgets

**A. Home Dashboard Widget**
- Welcome message
- Quick stats (total contacts, campaigns, recent sends)
- Getting started checklist
- Recent activity feed

**B. Campaign Manager Widget**
- List of campaigns (from database)
- Create/edit/delete campaign
- Campaign details view
- Launch campaign action

**C. Email Editor Widget**
- Visual mode: Component palette, canvas, properties
- Code mode: Monaco editor for `.email.tsx`
- Preview mode: Rendered HTML
- Send test email button
- Props/personalization editor

**D. Audience/Segment Manager Widget**
- List of segments
- Visual query builder (no SQL required)
- Preview contacts in segment
- Import/export contacts

**Tasks:**
1. [ ] Build widget base classes
2. [ ] Implement each widget
3. [ ] Connect widgets to backend services
4. [ ] Add loading/error states
5. [ ] Implement responsive layouts

**Deliverables:**
- User can manage campaigns visually
- Email editor works in visual and code mode
- Audience segments can be created without SQL
- All widgets connected to real backend

---

### **Phase 6: Email Template System (Week 4)**

**Goal:** react-email integration with visual editing

**Tasks:**
1. [ ] `.email.tsx` file format specification
2. [ ] Template scaffolding command
3. [ ] Visual editor component palette:
   - Text, Heading, Button, Image, Divider
   - Layout containers
   - Drag-and-drop (future, start with forms)
4. [ ] Props/variables system:
   - Define typed props (name, companyName, etc.)
   - Visual editor for prop values
   - Preview with sample data
5. [ ] Template rendering (TSX → HTML via react-email)
6. [ ] Template library (pre-built templates)

**Deliverables:**
- Users can create email templates visually
- Templates are `.email.tsx` files (editable in code)
- Templates render to HTML for sending via Resend

---

### **Phase 7: Campaign Execution (Week 4-5)**

**Goal:** Actually send emails to real people

**Tasks:**
1. [ ] Campaign creation flow:
   - Select segment (audience)
   - Select email template
   - Set schedule (immediate or future)
   - Review and confirm
2. [ ] Email sending queue:
   - Batch processing
   - Rate limiting (respect Resend limits)
   - Retry logic
3. [ ] Campaign tracking:
   - Sent count
   - Delivery status
   - Opens/clicks (if using Resend tracking)
4. [ ] Campaign history view

**Deliverables:**
- Users can launch real email campaigns
- Emails sent via Resend API
- Campaign status visible in UI

---

### **Phase 8: Analytics (Week 5)**

**Goal:** Basic metrics and reporting

**Tasks:**
1. [ ] Analytics widget with charts:
   - Total contacts over time
   - Campaign performance
   - Email opens/clicks (if tracked)
   - Segment sizes
2. [ ] Query database for metrics
3. [ ] Simple chart library integration
4. [ ] Export reports (CSV)

**Deliverables:**
- Dashboard shows key metrics
- Users can see campaign performance

---

### **Phase 9: Claude Code Integration (Week 5-6)**

**Goal:** AI can execute marketing operations, not just describe them

**Tasks:**
1. [ ] Document backend services for Claude Code
2. [ ] Create Claude Code command examples:
   - "Create a welcome campaign for trial users"
   - "Send test email to me"
   - "Show me contacts who haven't opened in 30 days"
3. [ ] Test AI workflow end-to-end
4. [ ] Add AI-friendly error messages
5. [ ] Create "AI Assistant" widget (optional)

**Deliverables:**
- Claude Code can create campaigns, send emails, query segments
- AI understands marketing context and available operations
- Non-technical users can use natural language to execute tasks

---

### **Phase 10: Knowledge Base & IDE Toggle (Week 6)**

**Goal:** Context management system + IDE access for power users

**Tasks:**
1. [ ] Knowledge Base widget (Docs tab)
   - Markdown editor (Monaco in markdown mode)
   - File list for workspace .md files
   - Search across all markdown files
   - Basic wiki-style navigation
2. [ ] "Show IDE Panels" command
   - Menu item: View → Show IDE Panels
   - Keyboard shortcut (Cmd+Shift+I or similar)
   - Reveals Explorer, Terminal, Source Control
3. [ ] Documentation
   - Guide: "Using the Knowledge Base for AI Context"
   - Keyboard shortcuts reference
   - Power user features guide

**Deliverables:**
- Users can document strategy in markdown docs
- AI reads docs for context (integrated with Claude Code)
- IDE features accessible via explicit toggle
- No expertise detection, no gamification, no adaptive behavior

---

## Technical Decisions

### Database: PostgreSQL

**Why:**
- Industry standard for this use case
- Powerful query capabilities for segments
- Good Docker support for local development
- Easy migration to cloud (RDS, Supabase, etc.)

**Schema Preview:**
```sql
CREATE TABLE contacts (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE campaigns (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  template_path TEXT,
  segment_id UUID,
  status TEXT, -- draft, scheduled, sending, sent
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE emails_sent (
  id UUID PRIMARY KEY,
  campaign_id UUID REFERENCES campaigns(id),
  contact_id UUID REFERENCES contacts(id),
  sent_at TIMESTAMPTZ,
  status TEXT -- sent, delivered, opened, clicked, bounced
);
```

---

### Email Templates: react-email

**Why:**
- Native Resend format (no conversion needed)
- React components (familiar to developers)
- Type-safe props
- Version controllable (files in git)
- Works with AI code generation

**Example Template:**
```tsx
import { Html, Button, Text } from '@react-email/components';

interface WelcomeEmailProps {
  name: string;
  companyName: string;
}

export default function WelcomeEmail({ name, companyName }: WelcomeEmailProps) {
  return (
    <Html>
      <Text>Hi {name},</Text>
      <Text>Welcome to {companyName}!</Text>
      <Button href="https://example.com/get-started">Get Started</Button>
    </Html>
  );
}
```

---

### Frontend-Backend Communication: JSON-RPC

**Why:**
- Already used by Theia
- Type-safe with TypeScript
- Works over WebSocket (real-time updates)
- Easy to document for Claude Code

**Example Service:**
```typescript
// Backend
@injectable()
export class MarketingCampaignService {
  async createCampaign(params: CreateCampaignParams): Promise<Campaign> {
    // Insert into database
    // Return campaign object
  }
}

// Frontend
const campaign = await this.campaignService.createCampaign({
  name: 'Welcome Series',
  templatePath: 'emails/templates/welcome.email.tsx',
  segmentId: 'uuid-here'
});
```

---

## Success Criteria for MVP

### Must Have:
- [ ] User can create marketing project via wizard
- [ ] User can configure Resend API (with help)
- [ ] User can create email template (visual or code)
- [ ] User can create audience segment (visual query builder)
- [ ] User can launch campaign that sends real emails
- [ ] User sees domain navigation (Home, Campaigns, Audience)
- [ ] Claude Code can create campaigns and send emails
- [ ] IDE tools accessible but not prominent

### Nice to Have (defer if needed):
- [ ] Analytics dashboard with charts
- [ ] Automation workflows
- [ ] Template library
- [ ] Import contacts from CSV
- [ ] Email preview in multiple clients

### Out of Scope for MVP:
- Advanced automation (multi-step workflows)
- A/B testing
- SMS integration
- Forms
- Website integration
- Multiple project templates (finance, legal, etc.)

---

## File Structure After MVP

```
packages/
├── marketing-environment/                    # New package
│   ├── src/
│   │   ├── browser/
│   │   │   ├── marketing-shell-layout.ts    # Custom shell layout
│   │   │   ├── navigation/
│   │   │   │   └── domain-navigation-widget.tsx
│   │   │   ├── widgets/
│   │   │   │   ├── home-dashboard-widget.tsx
│   │   │   │   ├── campaign-manager-widget.tsx
│   │   │   │   ├── email-editor-widget.tsx
│   │   │   │   └── audience-manager-widget.tsx
│   │   │   ├── wizards/
│   │   │   │   ├── project-wizard.tsx
│   │   │   │   ├── resend-wizard.tsx
│   │   │   │   └── database-wizard.tsx
│   │   │   └── marketing-frontend-module.ts
│   │   ├── node/
│   │   │   ├── services/
│   │   │   │   ├── database-manager.ts
│   │   │   │   ├── resend-client.ts
│   │   │   │   ├── campaign-service.ts
│   │   │   │   └── segment-service.ts
│   │   │   └── marketing-backend-module.ts
│   │   └── common/
│   │       ├── protocol.ts
│   │       └── types.ts
│   └── package.json
│
└── marketing-templates/                      # New package
    ├── project-templates/
    │   └── marketing-basic/
    │       ├── template.json
    │       └── files/
    │           ├── .quallaa/
    │           ├── campaigns/
    │           ├── emails/
    │           └── README.md
    └── package.json
```

---

## Development Workflow

### Week 1: Foundation + Configuration
- Build project template system
- Create scaffolding wizard
- Implement Resend configuration wizard
- Test with real Resend account

### Week 2: Shell + Backend
- Custom shell layout for marketing projects
- Domain navigation widget
- Backend services (database, Resend API)
- JSON-RPC endpoints

### Week 3-4: Core Widgets
- Home dashboard
- Campaign manager
- Email editor (visual + code)
- Audience manager

### Week 4-5: Campaign Execution
- Email sending integration
- Campaign tracking
- Basic analytics

### Week 5-6: Claude Code + Polish
- AI integration
- Progressive disclosure
- Documentation
- Testing with non-technical users

---

## Risk Mitigation

### Risk: Non-technical users confused by setup
**Mitigation:** Extensive wizard with screenshots, videos, tooltips

### Risk: Database management too complex
**Mitigation:** Docker makes it one-click, cloud option for simpler cases

### Risk: Visual email editor too hard to build
**Mitigation:** Start with code editor + preview, add visual later

### Risk: Theia shell customization harder than expected
**Mitigation:** Study Navigator/Explorer packages first, timebox investigation

### Risk: Claude Code can't call backend services effectively
**Mitigation:** Document services clearly, test early, provide examples

---

## Future Enhancements (Post-MVP)

- **Additional Templates:** Finance, Legal, Consulting environments
- **Advanced Automations:** Multi-step workflows, triggers, conditions
- **A/B Testing:** Split test email campaigns
- **SMS Integration:** Twilio support
- **Forms:** Lead capture forms
- **Website Integration:** Embed forms, tracking pixels
- **Team Collaboration:** Multi-user, permissions
- **Template Marketplace:** Share/sell campaign templates
- **Deeper Analytics:** Funnel analysis, cohort reports
- **CRM Features:** Contact timeline, notes, deals

---

## Notes

- Keep MVP scope tight - better to ship working system than half-built features
- Test with real non-technical users early (Week 3-4)
- Document everything for Claude Code consumption
- Prioritize "it just works" over configurability
- Build for extension - other environment types coming
