<br/>
<div id="quallaa-logo" align="center">
    <br />
    <img src="./logo/QuallaaLogo.svg" alt="Quallaa Logo" width="300"/>
    <h3>AI Environment Management for Domain Experts</h3>
</div>

<div id="badges" align="center">

[![License](https://img.shields.io/badge/License-EPL%202.0-blue.svg)](LICENSE-EPL)
[![Built on Eclipse Theia](https://img.shields.io/badge/Built%20on-Eclipse%20Theia-blue.svg)](https://github.com/eclipse-theia/theia)

**Quallaa** is an AI execution environment that gives domain experts access to developer-grade AI capabilities without requiring coding skills.

</div>

---

## What is Quallaa?

Most people are stuck with chat interfaces that waste 67% of AI potential through translation bottlenecks. Developers, however, have AI tools that **directly execute**—modifying files, orchestrating infrastructure, and getting real work done.

**Quallaa democratizes this power.**

We provide pre-configured environments where domain experts (marketers, financial analysts, consultants, etc.) can command AI to execute tasks directly, with real infrastructure:
- **PostgreSQL databases** for data management
- **Email provider integrations** (SendGrid, Mailgun, etc.)
- **API connections** to analytics, CRM, and business tools
- **File systems and templates** for project organization
- **Frontier AI models** (Claude, GPT) that orchestrate everything

The core insight: **IDE + Command Line + frontier AI models = the most capable AI execution environment.**

---

## Why Quallaa?

### For Domain Experts
- ✅ **Direct AI execution** - AI doesn't just describe solutions, it builds them
- ✅ **Real infrastructure** - Databases, APIs, email providers, not toy examples
- ✅ **Future-proof** - Anything tokenizable can be orchestrated from this environment
- ✅ **No custom training needed** - Uses best-in-class frontier models as-is

### For Teams
- 🚀 **Solo productivity** - One expert with Quallaa outperforms traditional teams
- 🔧 **Zero organizational friction** - No committees, no approvals, direct execution
- 📈 **Unlimited leverage** - Domain expertise + AI = unstoppable combination

---

## Project Status

**Current Phase**: MVP - Rebranding Eclipse Theia foundation

Quallaa is built on [Eclipse Theia](https://github.com/eclipse-theia/theia), an extensible framework for building full-fledged IDEs. We're establishing the foundation for AI environment management.

### Roadmap

**Phase 1 (Current)**: Foundation
- ✅ Rebrand Eclipse Theia to Quallaa
- ✅ Desktop (Electron) and web (browser) builds
- 🚧 AI integration (Claude Code/similar)
- 🚧 Basic IDE functionality for domain experts

**Phase 2 (Upcoming)**: Domain Environments
- Domain-specific environment templates (Marketing, Finance, Legal, etc.)
- Progressive disclosure of IDE complexity
- Pre-configured infrastructure per domain

**Phase 3 (Future)**: Advanced Features
- Multi-environment orchestration
- Team collaboration
- Enterprise deployment

---

## Quick Start

### Prerequisites
- **Node.js** >= 20 and < 24
- **Python** (for native module compilation)
- **Yarn** package manager

### Installation

```bash
# Clone repository
git clone https://github.com/your-org/Quallaa-Native.git
cd Quallaa-Native

# Install dependencies
npm install

# Compile TypeScript
npm run compile
```

### Running Quallaa

**Desktop (recommended for MVP)**:
```bash
cd examples/electron
npm run start
```

**Web browser**:
```bash
cd examples/browser
npm run start:browser
# Open http://localhost:3000
```

### Building Distribution

**Desktop application** (DMG/EXE/AppImage):
```bash
cd examples/electron
yarn package
```

**Web deployment**:
```bash
cd examples/browser
npm run build:browser
# Deploy lib/ directory to web server
```

---

## Documentation

### Project Documentation
- **[CLAUDE.md](CLAUDE.md)** - Comprehensive guide for AI-assisted development
- **[Planning Docs](docs/planning/)** - Project roadmap, TODO, rebrand guide, MVP plans
- **[Deployment Guides](docs/deployment/)** - Quick start and Theia Cloud deployment

### Development Guides
- **[doc/Developing.md](doc/Developing.md)** - Development guide (Theia platform)
- **[doc/Testing.md](doc/Testing.md)** - Testing guide
- **[doc/code-organization.md](doc/code-organization.md)** - Code structure and organization

---

## Architecture

Quallaa inherits Eclipse Theia's powerful architecture:

### Frontend-Backend Split
- **Backend**: Node.js server (orchestrates databases, APIs, file systems)
- **Frontend**: Browser/Electron renderer (UI, editor)
- **Communication**: JSON-RPC over WebSocket

This architecture enables **true environment management**—AI can command the backend to execute against real infrastructure, not just edit text files.

### Extension System
- Supports VS Code extensions (100,000+ available)
- Custom Theia extensions for domain-specific capabilities
- Dependency injection for progressive disclosure and customization

### Philosophy: Environment, Not Workflows

Quallaa provides **execution environments**, not rigid pre-configured workflows:
- ✅ Real infrastructure (databases, email, APIs)
- ✅ Frontier models used as-is (no custom training)
- ✅ IDE as command center (orchestrate anything tokenizable)
- ❌ "AI agents" that are just decision trees
- ❌ Rigid workflow automation
- ❌ Custom-trained models (users can add, but not our focus)

**Example**: A marketing environment doesn't include "AI trained on marketing workflows." It includes:
- PostgreSQL database (customer/campaign data)
- Email provider integration
- Analytics API connections
- File templates and schemas
- **AI orchestrates all of this when you describe what you need**

---

## Target Users

**Primary**: SMB domain experts
- Deep domain expertise, no coding skills
- Understand what needs to be done, can't execute technically
- Willing to learn new paradigms for 10x productivity
- Frustrated with chat-only AI tools that can't actually DO anything

**Not targeting**: Enterprise developers, large IT departments, people wanting rigid "no-code" tools

---

## Contributing

We welcome contributions! However, please note:

1. **This is a work in progress** - MVP rebranding phase
2. **Theia foundation** - Much of the codebase is Eclipse Theia
3. **EPL 2.0 License** - All contributions must comply

### Development Workflow

```bash
# Watch for changes (auto-rebuild)
npm run watch

# Run tests
npm run test

# Lint code
npm run lint:fix
```

See [CONTRIBUTING.md](CONTRIBUTING.md) and [doc/Developing.md](doc/Developing.md) for details.

---

## License

Quallaa is licensed under the Eclipse Public License 2.0:
- [Eclipse Public License 2.0](LICENSE-EPL)
- [一 (Secondary) GNU General Public License, version 2 with the GNU Classpath Exception](LICENSE-GPL-2.0-ONLY-CLASSPATH-EXCEPTION)

### Attribution

Quallaa is built on [Eclipse Theia](https://github.com/eclipse-theia/theia). "Theia" is a trademark of the Eclipse Foundation.

We comply with EPL 2.0 requirements:
- ✅ Source code available in this repository
- ✅ Attribution to Eclipse Theia in About dialog
- ✅ LICENSE and NOTICE files included
- ✅ Original copyright headers preserved

---

## Trademark

"Quallaa" is a trademark. "Theia" and "Eclipse" are trademarks of the Eclipse Foundation.

---

## Support & Community

- **Issues**: [GitHub Issues](https://github.com/your-org/Quallaa-Native/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/Quallaa-Native/discussions)
- **Email**: support@quallaa.com (coming soon)

---

## Why "Quallaa"?

Quality + Llama (the AI model family) = **Quallaa**

We're building quality AI environments that give you unlimited leverage.

---

<div align="center">
<sub>Built with ❤️ on Eclipse Theia</sub>
</div>
