# Quallaa Rebranding Project Plan - Desktop + Web Hybrid Strategy

**Goal**: Rebrand Eclipse Theia to Quallaa for desktop (macOS/Windows/Linux) and web distribution
**Timeline**: 3-4 weeks for hybrid MVP
**Current Status**: Phase 1 & 2 complete, packaging successful, ready for Phase 3
**Platforms**:
- **Desktop**: macOS (primary), Windows/Linux (future)
- **Web**: Browser-based SaaS deployment
**Strategy**: Dual deployment model for maximum market reach

---

## Phase 1: Project Setup & Foundation (Week 1 - Days 1-2)

### Day 1: Repository & Environment Setup ✅ COMPLETE
- [x] Verify current repository is the Theia platform (NOT Theia IDE template) ✅
- [x] Confirm Node.js version >= 20 installed ✅ (v23.9.0)
- [x] Confirm Yarn installed and configured ✅ (v1.22.22)
- [x] Run `yarn install` to install all dependencies ✅ (2,488 packages)
- [x] Run `yarn build` to verify initial build works ✅ (55.6s compile time)
- [x] Test run the electron example: `cd examples/electron && yarn start` ✅
- [x] Document current build time and startup time (baseline metrics) ✅ (BASELINE-METRICS.md created)
- [x] Transfer repository to Quallaa-AI organization ✅
- [x] Make repository private ✅
- [x] Created .env.example for code signing credentials ✅
- [x] Set up Git branch for rebrand work ✅ (`feature/quallaa-rebrand-macos`)

### Apple Developer Code Signing Setup ✅ COMPLETE
- [x] Verify Apple Developer Program membership is active (or enroll at $99/year) ✅
- [x] Create Developer ID Application certificate (for distribution outside App Store) ✅
- [x] Generate Certificate Signing Request (CSR) via Keychain Access ✅
- [x] Download and install certificate in Keychain ✅
- [x] Create app-specific password at appleid.apple.com ✅
- [x] Set up environment variables in `.env` file: ✅
  - [x] APPLE_IDENTITY (from: `security find-identity -v -p codesigning`) ✅
  - [x] APPLE_ID (your Apple ID email) ✅
  - [x] APPLE_ID_PASSWORD (app-specific password) ✅
  - [x] APPLE_TEAM_ID (from developer.apple.com/account) ✅
- [x] Test code signing: `cd examples/electron && yarn package` ✅
- [x] Created notarization script: `examples/electron/scripts/notarize.js` ✅
- [x] Successfully built signed DMG: `Quallaa-1.65.0-arm64.dmg` (216 MB) ✅
- [x] Verified code signing with Developer ID Application certificate ✅

### Day 2: Legal & Compliance Foundation
- [ ] Review EPL 2.0 license requirements (file in repo as `docs/EPL-2.0-COMPLIANCE.md`)
- [ ] Verify existing LICENSE files are present in repository
- [ ] Verify existing NOTICE files are present in repository
- [ ] Document plan for "Built on Eclipse Theia" attribution in About dialog
- [ ] Create compliance checklist for distribution (ensure LICENSE-EPL.txt, NOTICE, source repo link)
- [ ] Add note: NO trademark filing, NO legal review, NO LLC registration for MVP
- [ ] Defer: Privacy Policy, Terms of Service, EULA (post-MVP)

---

## Phase 2: Core Branding Changes (Week 1 - Days 3-5)

### Branding Decisions Required (Complete BEFORE making changes)
- [x] **DECISION**: Confirm final application name: "Quallaa" ✅
- [x] **DECISION**: Choose company identifier for `build.appId` (e.g., `com.quallaa.ide`) - PENDING USER INPUT
- [x] **DECISION**: Choose package namespace: Keep `@theia/*` for MVP ✅
- [x] **DECISION**: Confirm copyright holder name for new files - "Quallaa AI" (PENDING USER CONFIRMATION)
- [x] **DECISION**: Design icon - COMPLETE ✅ (logo/QuallaaLogo.png exists)

### File Modifications - examples/electron/package.json ✅ COMPLETE
- [x] Change `"name"` field from `"@theia/example-electron"` to `"@quallaa/quallaa"` ✅
- [x] Change `"productName"` from `"Theia Electron Example"` to `"Quallaa"` ✅
- [x] Update `theia.frontend.config.applicationName` from `"Theia Electron Example"` to `"Quallaa"` ✅
- [x] Removed splash screen reference (theia-logo.svg) ✅
- [x] Add user preferences directory config: `"preferences-dir": ".quallaa"` ✅
- [x] Added `"package"` script for electron-builder ✅
- [x] License kept as EPL-2.0 for MVP ✅

### File Modifications - Root package.json
- [ ] Update root `package.json` name from `"@theia/monorepo"` to `"@quallaa/monorepo"` (optional, affects internal builds only)
- [ ] Document whether to rename all package namespaces now or defer to post-MVP
- [ ] If renaming packages: Create script to find/replace `@theia/` → `@quallaa/` across all package.json files
- [ ] If renaming packages: Update all import statements in TypeScript files
- [ ] **RECOMMENDATION**: Keep `@theia/*` namespace for MVP to avoid massive refactor

### Visual Assets - examples/electron/resources/ ✅ COMPLETE
- [x] Create macOS icon file: `icon.icns` ✅ (28KB, all sizes 16x16 to 512x512@2x)
- [x] Generated from existing logo using macOS sips/iconutil ✅
- [ ] Replace or remove splash screen: Update or delete `resources/theia-logo.svg`
- [ ] Create new splash HTML if desired: `resources/splash.html` (optional for MVP)
- [ ] Test icon appears correctly in macOS dock and app switcher (after package build)
- [ ] Test splash screen displays on launch (if implemented)

### electron-builder Configuration ✅ COMPLETE
- [x] Created `examples/electron/electron-builder.yml` ✅
- [x] Set `appId`: `com.quallaa.ide` ✅
- [x] Set `productName`: `Quallaa` ✅
- [x] Set `copyright`: `© 2025 Quallaa AI` ✅
- [x] Configured macOS-specific settings (category: developer-tools, icon path) ✅
- [x] Configured macOS build target: `dmg` ✅
- [x] Configured macOS icon: `resources/icon.icns` ✅
- [x] Created `resources/entitlements.mac.plist` for macOS security ✅
- [x] Configured code signing (uses environment variables) ✅
- [x] Configured notarization (afterSign script placeholder) ✅
- [x] Installed electron-builder dependency ✅
- [x] Test packaging: Run `cd examples/electron && yarn package` ✅
- [x] Successfully created Quallaa-1.65.0-arm64.dmg (216 MB) ✅
- [x] Code signing verified with Developer ID Application certificate ✅
- [ ] Test DMG installation on clean macOS system (verify Gatekeeper behavior)

---

## Phase 3: UI Component Customization (Week 1 - Days 6-7) ✅ COMPLETE

### Branding Extension Package Created ✅
- [x] **CHOSE OPTION A** - Override via extension (more maintainable for long-term product)
- [x] Created `packages/quallaa-branding/` extension package
- [x] Added package.json with @quallaa/branding namespace
- [x] Added tsconfig.json with proper references to @theia/core and @theia/getting-started
- [x] Created dependency injection module: `quallaa-branding-frontend-module.ts`
- [x] Added as dependency to `examples/electron/package.json`

### About Dialog Customization ✅
- [x] Located About Dialog component: `packages/core/src/browser/about-dialog.tsx`
- [x] Created custom `QuallaaAboutDialog` extending `AboutDialog`
- [x] Added Quallaa branding in header
- [x] Added "Built on Eclipse Theia" attribution with link to https://theia-ide.org
- [x] Added link to Quallaa source code repository (EPL compliance)
- [x] Added copyright: "© 2025 Quallaa AI. Licensed under EPL 2.0"
- [x] Rebound AboutDialog to QuallaaAboutDialog in DI container
- [ ] Test About Dialog: Open app, trigger "About" from menu, verify branding (pending build)

### Getting Started Widget Customization ✅
- [x] Located Getting Started Widget: `packages/getting-started/src/browser/getting-started-widget.tsx`
- [x] Created custom `QuallaaGettingStartedWidget` extending `GettingStartedWidget`
- [x] Overrode `renderNews()` with Quallaa welcome message
- [x] Overrode `renderHelp()` with Quallaa-specific links:
  - [x] Link to report issues at GitHub
  - [x] Link to "About Eclipse Theia"
  - [x] Added "Built on Eclipse Theia" attribution text
- [x] Rebound GettingStartedWidget to QuallaaGettingStartedWidget in DI container
- [ ] Test Getting Started Widget: Launch app with no workspace, verify custom content (pending build)

### Environment Variables / Config Directory ✅
- [x] Config directory already set to `.quallaa` in `examples/electron/package.json:20`
- [x] Searched for `.theia` references - found 112 files (mostly CSS/styling, not config-related)
- [x] Searched for `.theia-blueprint` references - none found (as expected, we're using platform not IDE template)
- [ ] Test: Launch app, make preference change, verify `~/.quallaa` directory is created (pending build)
- [ ] Test: Verify preferences persist across app restarts (pending build)

### Architecture Notes ✅
**Key decision: Used Option A (extension-based override) because:**
- This rebrand IS the MVP and product foundation (not a throwaway prototype)
- Clean separation between Theia core and Quallaa customizations
- Easier to pull upstream Theia updates without merge conflicts
- Better EPL 2.0 compliance (clear distinction between EPL code and proprietary branding)
- More maintainable long-term - all branding logic in one isolated package

---

## Phase 4: Text Replacements & Polish (Week 2 - Days 1-2)

### Global Text Replacements
- [ ] **IMPORTANT**: Create backup branch before mass find/replace
- [ ] Search all user-visible strings for "Theia IDE": `grep -r "Theia IDE" packages/`
- [ ] Replace "Theia IDE" → "Quallaa" in user-visible strings (UI components, menus, dialogs)
- [ ] Search for "Theia Blueprint": `grep -r "Theia Blueprint" packages/`
- [ ] Replace "Theia Blueprint" → "Quallaa" (if any references exist)
- [ ] Search for "Theia Electron Example": Should be updated by package.json changes
- [ ] **DO NOT** replace "Theia" in code comments, internal variable names, or file names
- [ ] **DO NOT** replace "Eclipse Theia" in attribution notices or copyright headers
- [ ] Review window title: Ensure it shows "Quallaa" not "Theia"
- [ ] Review application menu (macOS menu bar): Ensure "About Quallaa", "Quit Quallaa", etc.
- [ ] Test application thoroughly after replacements

### Package Namespace Migration (Optional - Can Defer)
- [ ] **DECISION**: Rename packages from `@theia/*` to `@quallaa/*` now or post-MVP?
- [ ] If NOW: Create automated script for find/replace across all package.json files
- [ ] If NOW: Update all TypeScript imports from `@theia/*` to `@quallaa/*`
- [ ] If NOW: Run full rebuild: `yarn install && yarn build`
- [ ] If NOW: Fix any build errors from namespace changes
- [ ] If NOW: Update all documentation references
- [ ] **RECOMMENDATION**: Defer to post-MVP to reduce risk and scope

---

## Phase 5: Build Pipeline & Code Signing (Week 2 - Days 3-5)

### Local Build Testing
- [ ] Navigate to electron example: `cd examples/electron`
- [ ] Clean previous builds: `yarn clean`
- [ ] Install dependencies: `yarn install`
- [ ] Rebuild native modules for Electron: `yarn rebuild`
- [ ] Compile TypeScript: `yarn compile`
- [ ] Bundle application: `yarn bundle`
- [ ] Test development build: `yarn start`
- [ ] Verify all branding changes visible in running application
- [ ] Test basic functionality: Open folder, create file, edit file, save
- [ ] Measure startup time (target: under 10 seconds for MVP)
- [ ] Document any errors or warnings in build output

### Code Signing Setup
- [ ] Locate Apple Developer certificate in Keychain Access
- [ ] Note certificate name exactly (e.g., "Developer ID Application: Your Name (TEAM_ID)")
- [ ] Export certificate as .p12 file with password
- [ ] Store certificate password securely (will need for CI/CD)
- [ ] Create environment variable: `APPLE_IDENTITY` with certificate name
- [ ] Update electron-builder.yml to use identity:
  ```yaml
  mac:
    identity: ${APPLE_IDENTITY}
  ```
- [ ] Configure notarization credentials (Apple ID and app-specific password required)
- [ ] Create app-specific password at appleid.apple.com
- [ ] Set environment variables for notarization:
  - [ ] `APPLE_ID`: Your Apple ID email
  - [ ] `APPLE_ID_PASSWORD`: App-specific password
  - [ ] `APPLE_TEAM_ID`: Your team ID from Developer account
- [ ] Update electron-builder.yml with notarization config:
  ```yaml
  afterSign: "scripts/notarize.js"
  ```
- [ ] Create notarization script (if needed) or use electron-builder built-in notarization

### Packaging Script Setup
- [ ] Add packaging script to `examples/electron/package.json`:
  ```json
  "package": "electron-builder --mac"
  ```
- [ ] Create build script that includes full pipeline:
  ```json
  "dist": "yarn clean && yarn compile && yarn bundle && yarn package"
  ```
- [ ] Document required environment variables in README or build docs
- [ ] Create `.env.example` file with placeholder values:
  ```
  APPLE_IDENTITY="Developer ID Application: Your Name (TEAM_ID)"
  APPLE_ID="your@email.com"
  APPLE_ID_PASSWORD="xxxx-xxxx-xxxx-xxxx"
  APPLE_TEAM_ID="XXXXXXXXXX"
  ```

### First Packaging Attempt
- [ ] Run packaging: `cd examples/electron && yarn package`
- [ ] **EXPECT**: May fail on first attempt due to signing/notarization issues
- [ ] Troubleshoot error messages (common issues):
  - [ ] Missing certificate: Re-check Keychain Access, ensure certificate valid
  - [ ] Wrong identity name: Copy exact name from Keychain Access
  - [ ] Notarization failure: Verify Apple ID credentials correct
  - [ ] Timeout during notarization: Increase timeout in config (can take 5-10 minutes)
- [ ] If successful: Locate DMG file in `examples/electron/dist/`
- [ ] Test DMG installer:
  - [ ] Mount DMG file
  - [ ] Drag Quallaa.app to Applications folder
  - [ ] Eject DMG
  - [ ] Launch from Applications
  - [ ] Verify no macOS Gatekeeper warnings (proves code signing works)

### Build Output Validation
- [ ] Verify DMG contains correctly branded app (name, icon)
- [ ] Verify app bundle name: `Quallaa.app` not `Theia.app`
- [ ] Verify app icon displays correctly in Finder
- [ ] Right-click app → Get Info → Verify code signature present
- [ ] Check bundle identifier matches chosen appId
- [ ] Test on clean macOS system (or different user account):
  - [ ] Download DMG from shared location
  - [ ] Install without developer tools
  - [ ] Verify launches without security warnings
  - [ ] Verify basic functionality works

---

## Phase 6: GitHub Actions CI/CD (Week 2 - Days 6-7 - OPTIONAL for MVP)

**NOTE**: This phase can be deferred to post-MVP. Manual builds are sufficient for initial testing.

### CI/CD Setup (Optional)
- [ ] **DECISION**: Set up automated builds now or defer to post-MVP?
- [ ] If NOW: Create `.github/workflows/build.yml`
- [ ] If NOW: Configure macOS runner (runs-on: macos-latest)
- [ ] If NOW: Add build steps: install dependencies, compile, bundle, package
- [ ] If NOW: Configure repository secrets:
  - [ ] `MAC_CERTS`: Base64-encoded .p12 certificate
  - [ ] `MAC_CERTS_PASSWORD`: Certificate password
  - [ ] `APPLE_ID`: Apple ID email
  - [ ] `APPLE_ID_PASSWORD`: App-specific password
  - [ ] `APPLE_TEAM_ID`: Team ID
- [ ] If NOW: Add certificate import step to workflow
- [ ] If NOW: Add code signing and notarization steps
- [ ] If NOW: Upload DMG as build artifact
- [ ] If NOW: Test workflow with push to feature branch
- [ ] If NOW: Fix any CI/CD failures (common: certificate issues, timeouts)
- [ ] **RECOMMENDATION**: Defer to post-MVP unless team has CI/CD expertise

### Release Automation (Optional)
- [ ] If setting up CI/CD: Configure release workflow on git tag
- [ ] Create GitHub Release automatically with DMG attached
- [ ] Add release notes template
- [ ] Test release process with beta tag (e.g., v0.1.0-beta.1)

---

## Phase 7: Documentation & Distribution Prep (Week 3)

### Minimal Documentation
- [ ] Create `README.md` for Quallaa project (separate from Theia README)
- [ ] Document installation instructions:
  - [ ] Download DMG from [location]
  - [ ] Open DMG
  - [ ] Drag Quallaa to Applications
  - [ ] Launch from Applications
- [ ] Document system requirements:
  - [ ] macOS 11.0 (Big Sur) or later
  - [ ] 4GB RAM minimum, 8GB recommended
  - [ ] 500MB disk space
- [ ] Document known limitations for MVP:
  - [ ] macOS only (Windows/Linux coming later)
  - [ ] No auto-update yet
  - [ ] No extension marketplace
  - [ ] [Add any other MVP limitations]
- [ ] Add support contact: Email or GitHub Issues link
- [ ] Create CHANGELOG.md with initial v0.1.0 entry

### EPL 2.0 Compliance Documentation
- [ ] Ensure LICENSE-EPL.txt file exists in repository root
- [ ] Ensure NOTICE file exists listing all open source components
- [ ] Create or update ATTRIBUTIONS.md:
  - [ ] "Built on Eclipse Theia - https://theia-ide.org"
  - [ ] List major dependencies and licenses
  - [ ] Link to full source code repository
- [ ] Verify About Dialog includes "Built on Eclipse Theia" text
- [ ] Verify About Dialog or Help menu links to source repository
- [ ] Test 15-minute compliance test:
  - [ ] Can user find license information? (Check)
  - [ ] Can user access source code for EPL components? (Check)
  - [ ] Can user verify attributions? (Check)

### Distribution Hosting Setup
- [ ] **DECISION**: Where to host DMG files for download?
  - [ ] Option A: GitHub Releases (free, easy)
  - [ ] Option B: AWS S3 + CloudFront (more control)
  - [ ] Option C: Simple web hosting
- [ ] If GitHub Releases:
  - [ ] Create first release: v0.1.0-beta.1
  - [ ] Upload DMG file as release asset
  - [ ] Write release notes
  - [ ] Mark as pre-release
- [ ] If S3:
  - [ ] Create S3 bucket
  - [ ] Configure public read access for DMG files
  - [ ] Upload DMG
  - [ ] Generate public URL
  - [ ] Optional: Set up CloudFront for CDN
- [ ] Test download link works from different network
- [ ] Document download URL in README

---

## Phase 8: Testing & Validation (Week 3)

### Functional Testing Checklist
- [ ] Fresh install test (clean macOS user or VM):
  - [ ] Download DMG
  - [ ] Install application
  - [ ] Launch for first time
  - [ ] No Gatekeeper warnings (code signing valid)
  - [ ] No errors in Console.app
- [ ] Basic functionality tests:
  - [ ] Open folder via File menu
  - [ ] Open folder via Welcome screen
  - [ ] Create new file
  - [ ] Edit file with syntax highlighting
  - [ ] Save file
  - [ ] Search in file (Cmd+F)
  - [ ] Search in workspace (Cmd+Shift+F)
  - [ ] Open terminal
  - [ ] Run command in terminal
- [ ] Extensions tests:
  - [ ] Open Extensions view
  - [ ] Search for extension (if Open VSX configured)
  - [ ] Install extension
  - [ ] Verify extension works
  - [ ] Disable/Enable extension
  - [ ] Uninstall extension
- [ ] Settings tests:
  - [ ] Open Settings (Cmd+,)
  - [ ] Change theme
  - [ ] Change font size
  - [ ] Modify keybinding
  - [ ] Verify settings persist after restart
  - [ ] Verify settings stored in `~/.quallaa/`
- [ ] Performance tests:
  - [ ] Measure startup time (target: under 10 seconds)
  - [ ] Measure memory usage (Activity Monitor)
  - [ ] Open large file (10MB+)
  - [ ] Open large folder (1000+ files)
  - [ ] Document baseline performance metrics

### Branding Verification Checklist
- [ ] Application name shows "Quallaa" everywhere:
  - [ ] macOS menu bar (top left)
  - [ ] Application name in menu (About Quallaa, Quit Quallaa, etc.)
  - [ ] Dock icon tooltip
  - [ ] Activity Monitor
  - [ ] Window title
  - [ ] About dialog
  - [ ] Welcome screen
- [ ] Icon appears correctly:
  - [ ] Finder (Applications folder)
  - [ ] Dock
  - [ ] Cmd+Tab app switcher
  - [ ] Spotlight search results
- [ ] No "Theia" branding visible in UI:
  - [ ] Check all menu items
  - [ ] Check all dialog titles
  - [ ] Check preferences UI
  - [ ] Check error messages
  - [ ] Check notification messages
- [ ] Attribution present:
  - [ ] "Built on Eclipse Theia" in About dialog
  - [ ] Link to Theia project
  - [ ] Link to source code

### Beta Testing Preparation
- [ ] **DECISION**: Recruit 3-5 beta testers?
- [ ] If YES: Identify beta testers (friends, colleagues, target users)
- [ ] If YES: Create beta testing guide:
  - [ ] How to install
  - [ ] What to test
  - [ ] How to report issues
- [ ] If YES: Set up issue tracking (GitHub Issues)
- [ ] If YES: Create feedback form or survey
- [ ] If YES: Distribute DMG to beta testers
- [ ] If YES: Schedule check-in calls or collect async feedback
- [ ] If YES: Iterate only on critical/blocking issues (scope discipline!)

---

## Phase 9: Launch Preparation (Week 3 - End)

### Pre-Launch Checklist
- [ ] All core branding changes complete
- [ ] About dialog shows Quallaa branding + Eclipse Theia attribution
- [ ] Welcome screen shows Quallaa branding
- [ ] macOS build packages successfully
- [ ] Code signing works (no Gatekeeper warnings)
- [ ] DMG installer tested on clean macOS system
- [ ] Basic functionality verified working
- [ ] Settings persist in `~/.quallaa/` directory
- [ ] README.md complete with installation instructions
- [ ] LICENSE-EPL.txt and NOTICE files present
- [ ] Known limitations documented
- [ ] Support contact documented
- [ ] Download URL publicly accessible

### Launch Day Tasks
- [ ] Create official v0.1.0 release (remove beta tag)
- [ ] Upload final DMG to distribution hosting
- [ ] Update README with final download link
- [ ] Announce to beta testers (if applicable)
- [ ] Post on relevant communities (if desired):
  - [ ] Internal company channels
  - [ ] Reddit r/programming (if public)
  - [ ] Hacker News Show HN (if public)
  - [ ] Twitter/X announcement
- [ ] Monitor for issues/feedback in first 48 hours
- [ ] Prepare to iterate on critical bugs only

### Post-Launch Immediate Tasks
- [ ] Set up issue tracking workflow (GitHub Issues)
- [ ] Create templates for bug reports and feature requests
- [ ] Triage incoming issues by severity
- [ ] Create hotfix branch for critical bugs
- [ ] Plan v0.2.0 iteration based on feedback

---

## Deferred to Post-MVP (Do NOT do these for initial release)

### Legal & Business (Deferred)
- [ ] ~~Register LLC or business entity~~ (defer until revenue/distribution scale)
- [ ] ~~File trademark application for "Quallaa"~~ (defer 3-6 months)
- [ ] ~~Hire open source attorney for EPL 2.0 audit~~ (defer unless distributing at scale)
- [ ] ~~Create Privacy Policy~~ (only needed if collecting data)
- [ ] ~~Create Terms of Service~~ (only needed if monetizing)
- [ ] ~~Create EULA~~ (basic EPL 2.0 compliance sufficient for MVP)

### Features (Deferred)
- [ ] ~~Auto-update mechanism~~ (manual downloads OK for MVP)
- [ ] ~~Extension marketplace~~ (use Open VSX or manual extension install)
- [ ] ~~Custom Theia extensions beyond branding~~ (use existing functionality)
- [ ] ~~Advanced AI integration~~ (out of scope for rebrand)
- [ ] ~~Remote development support~~ (defer to v2)
- [ ] ~~Collaborative editing~~ (defer to v2)
- [ ] ~~Custom language support~~ (use existing VS Code extensions)

### Polish (Deferred)
- [ ] ~~Professional icon design~~ (placeholder icon OK for MVP)
- [ ] ~~Custom splash screen animation~~ (static splash or none OK)
- [ ] ~~Advanced theming~~ (default Theia themes OK)
- [ ] ~~Comprehensive error handling~~ (basic error display OK)
- [ ] ~~Detailed analytics~~ (basic usage tracking optional)
- [ ] ~~Internationalization~~ (English only for MVP)
- [ ] ~~Accessibility improvements beyond Theia defaults~~ (defer to v2)
- [ ] ~~Performance optimization~~ (under 10 seconds startup is acceptable)

### Documentation (Deferred)
- [ ] ~~Comprehensive user manual~~ (README + known issues sufficient)
- [ ] ~~Video tutorials~~ (defer until user base exists)
- [ ] ~~Developer documentation~~ (defer until accepting contributions)
- [ ] ~~Marketing website~~ (simple landing page sufficient)

### Infrastructure (Deferred)
- [ ] ~~Windows build support~~ (macOS only for MVP)
- [ ] ~~Linux build support~~ (macOS only for MVP)
- [ ] ~~CI/CD for all platforms~~ (manual builds OK initially)
- [ ] ~~Automated testing suite~~ (manual testing sufficient for MVP)
- [ ] ~~Performance monitoring~~ (defer to post-MVP)
- [ ] ~~Crash reporting system~~ (manual bug reports OK)

---

## Phase 10: Web Deployment (Week 4 - Parallel Track)

**Goal**: Deploy browser-based version of Quallaa for SaaS offering

### Branding - examples/browser/package.json
- [ ] Change `"name"` field from `"@theia/example-browser"` to `"@quallaa/quallaa-web"`
- [ ] Update `theia.frontend.config.applicationName` to `"Quallaa"`
- [ ] Add user preferences directory config: `"preferences-dir": ".quallaa"`
- [ ] Keep same branding consistency as desktop version

### Web-Specific Configuration
- [ ] Configure server hostname and port settings
- [ ] Set up HTTPS/SSL certificates (Let's Encrypt or cloud provider)
- [ ] Configure CORS and security headers
- [ ] Set up WebSocket connection settings
- [ ] Configure file upload/download limits
- [ ] Add authentication/authorization (if needed for SaaS)

### Deployment Options (Choose One or Multiple)

#### Option A: Docker Containerization
- [ ] Create Dockerfile for browser example
- [ ] Configure Node.js base image (node:20)
- [ ] Add build and bundle steps to Dockerfile
- [ ] Expose port 3000 (or configured port)
- [ ] Test local Docker build: `docker build -t quallaa-web .`
- [ ] Test local Docker run: `docker run -p 3000:3000 quallaa-web`
- [ ] Create docker-compose.yml for multi-container setup (if needed)
- [ ] Push to Docker Hub or private registry

#### Option B: Cloud Platform Deployment
- [ ] **AWS**:
  - [ ] Deploy to EC2 instance or Elastic Beanstalk
  - [ ] Configure Application Load Balancer
  - [ ] Set up Auto Scaling group
  - [ ] Configure CloudFront CDN
  - [ ] Set up Route 53 for DNS
- [ ] **Google Cloud**:
  - [ ] Deploy to Cloud Run or App Engine
  - [ ] Configure load balancing
  - [ ] Set up Cloud CDN
  - [ ] Configure Cloud DNS
- [ ] **Azure**:
  - [ ] Deploy to App Service or Container Instances
  - [ ] Configure Front Door or Application Gateway
  - [ ] Set up Azure CDN
- [ ] **DigitalOcean/Railway/Render**:
  - [ ] Simple deployment from GitHub
  - [ ] Automatic HTTPS
  - [ ] Environment variable configuration

#### Option C: Kubernetes Deployment
- [ ] Create Kubernetes manifests (deployment, service, ingress)
- [ ] Configure horizontal pod autoscaling
- [ ] Set up persistent volume claims (if needed)
- [ ] Configure nginx ingress controller
- [ ] Set up cert-manager for automatic SSL
- [ ] Deploy to GKE, EKS, or AKS

### Domain and SSL
- [ ] Register domain: quallaa.io, app.quallaa.com, or similar
- [ ] Configure DNS A/CNAME records
- [ ] Set up SSL certificate (Let's Encrypt via certbot or cloud provider)
- [ ] Configure SSL/TLS for WebSocket connections
- [ ] Test HTTPS access

### Web-Specific Features
- [ ] Configure session management and persistence
- [ ] Set up user workspace isolation (if multi-tenant)
- [ ] Configure file storage backend (local, S3, Azure Blob, etc.)
- [ ] Set up monitoring and logging (CloudWatch, Stackdriver, etc.)
- [ ] Configure backup strategy for user data
- [ ] Set up rate limiting and DDoS protection

### Testing Web Deployment
- [ ] Test from different browsers (Chrome, Firefox, Safari, Edge)
- [ ] Test WebSocket connection stability
- [ ] Test file operations (create, edit, save, delete)
- [ ] Test terminal functionality in browser
- [ ] Test extension/plugin loading
- [ ] Load testing (simulate multiple concurrent users)
- [ ] Test on mobile browsers (responsive design)

### Web vs Desktop Feature Parity
- [ ] Document differences between web and desktop versions
- [ ] Identify desktop-only features (if any)
- [ ] Identify web-only features (if any)
- [ ] Ensure core functionality works in both

### Monetization Strategy (Web SaaS)
- [ ] **DECISION**: Free tier limits (storage, compute, users)
- [ ] **DECISION**: Paid tier pricing ($19-49/month recommended)
- [ ] **DECISION**: Enterprise tier (custom pricing)
- [ ] Set up payment integration (Stripe, Paddle, etc.)
- [ ] Create user account management system
- [ ] Implement usage tracking and billing
- [ ] Add upgrade/downgrade flows

### Web Deployment Compliance
- [ ] Same EPL 2.0 requirements apply
- [ ] Add "Built on Eclipse Theia" to web About dialog
- [ ] Link to public source repository (EPL compliance)
- [ ] Create Terms of Service for web app
- [ ] Create Privacy Policy (required for web service)
- [ ] Add cookie consent (if applicable to region)
- [ ] GDPR compliance (if serving EU users)

### Performance Optimization (Web)
- [ ] Enable gzip/brotli compression
- [ ] Configure CDN for static assets
- [ ] Optimize bundle size (code splitting, lazy loading)
- [ ] Configure browser caching headers
- [ ] Monitor Time to First Byte (TTFB)
- [ ] Monitor Time to Interactive (TTI)
- [ ] Target: < 3 seconds initial load time

### Hybrid Strategy Integration
- [ ] Ensure branding consistency between desktop and web
- [ ] Create unified documentation (covers both deployment modes)
- [ ] Plan data sync between desktop and web (future feature)
- [ ] Cross-promote: mention web version in desktop app, vice versa
- [ ] Consider unified licensing (desktop + web bundle)

### Build Commands for Web Version
```bash
# Development
npm run build:browser
npm run start:browser

# Production build
cd examples/browser
npm run build
PORT=3000 node lib/backend/main.js

# Docker
docker build -t quallaa-web -f Dockerfile.browser .
docker run -p 3000:3000 -e NODE_ENV=production quallaa-web
```

---

## Risk Mitigation & Red Lines

### Red Lines (Never Cross These)
- [ ] ❌ NEVER remove EPL attribution notices or copyright headers from Theia code
- [ ] ❌ NEVER use "Theia" or "Eclipse" trademarks in product name or primary branding
- [ ] ❌ NEVER distribute modified EPL code without providing source access
- [ ] ❌ NEVER modify Theia core files when extension points exist (use dependency injection)
- [ ] ❌ NEVER commit certificates or secrets to Git repository

### Common Pitfalls to Avoid
- [ ] ⚠️ Scope creep: Stick to rebrand only, no new features for MVP
- [ ] ⚠️ Perfectionism: Ship "embarrassingly simple" MVP, iterate based on feedback
- [ ] ⚠️ Over-engineering: Use Theia's existing systems, don't rebuild
- [ ] ⚠️ Performance rabbit holes: Acceptable startup time is under 10 seconds, not 3 seconds
- [ ] ⚠️ Certificate/signing issues: Budget 1-2 days for troubleshooting code signing
- [ ] ⚠️ Package namespace migration: High risk, low reward for MVP - defer if possible

### Acceptable Technical Debt for MVP
- [ ] ✅ Duplicate code that will be refactored later
- [ ] ✅ TODO comments throughout codebase
- [ ] ✅ Incomplete error handling (show errors, don't crash)
- [ ] ✅ Basic logging only, no comprehensive telemetry
- [ ] ✅ No comprehensive test suites (smoke tests only)
- [ ] ✅ Hardcoded values made configurable in v2
- [ ] ✅ Quick-fix solutions over elegant architecture
- [ ] ✅ Keeping `@theia/*` package namespace (avoid massive refactor)

---

## Success Criteria for MVP

### Must Have (MVP Cannot Ship Without These)
- [ ] Application name is "Quallaa" everywhere users see it
- [ ] macOS icon displays correctly in all contexts
- [ ] About dialog shows Quallaa branding + "Built on Eclipse Theia" attribution
- [ ] DMG installer works on clean macOS system without Gatekeeper warnings
- [ ] Basic IDE functionality works: open folder, edit files, save
- [ ] Settings persist in `~/.quallaa/` directory
- [ ] README with installation instructions exists
- [ ] EPL 2.0 compliance: LICENSE, NOTICE, attributions, source code link

### Nice to Have (Can Ship Without, Add in v0.2)
- [ ] Custom Getting Started content (can use Theia default for MVP)
- [ ] Auto-update mechanism (manual downloads OK)
- [ ] CI/CD automated builds (manual builds OK)
- [ ] Beta tester feedback incorporated
- [ ] Performance optimization (functional is enough)
- [ ] Custom splash screen (can skip for MVP)

### Metrics to Track
- [ ] Build time: Document baseline, track improvements
- [ ] Startup time: Target under 10 seconds
- [ ] DMG file size: Document baseline
- [ ] Memory usage: Document baseline via Activity Monitor
- [ ] Time to first successful package: Track for learning

---

## Timeline Summary - Desktop + Web Hybrid

**Week 1: Foundation & Core Branding (Desktop Focus)**
- Days 1-2: Setup, legal compliance, environment ✅ COMPLETE
- Days 3-5: Package.json changes, assets, electron-builder config ✅ COMPLETE
- Days 6-7: About Dialog, Getting Started widget, config directory

**Week 2: Desktop Build Pipeline & Testing**
- Days 1-2: Text replacements, UI polish
- Days 3-5: Code signing, packaging, troubleshooting
- Days 6-7: CI/CD (optional) or additional testing

**Week 3: Desktop Distribution & Launch**
- Days 1-3: Documentation, compliance verification, distribution setup
- Days 4-5: Testing, beta feedback (optional)
- Days 6-7: Desktop MVP launch preparation

**Week 4: Web Deployment (Can Run in Parallel)**
- Days 1-2: Rebrand browser example, web-specific config
- Days 3-4: Choose deployment platform, set up infrastructure
- Days 5-6: Deploy to staging, test in production-like environment
- Day 7: Web MVP launch or continue testing

**Total Timeline:**
- Desktop MVP: 2-3 weeks
- Web MVP: +1 week (can overlap with desktop work)
- **Both platforms: 3-4 weeks total**

---

## Notes & Resources

### Key Files to Modify
1. `examples/electron/package.json` - Application name, product name, config
2. `examples/electron/electron-builder.yml` - Build configuration (may need to create)
3. `examples/electron/resources/icon.icns` - macOS icon
4. `packages/core/src/browser/about-dialog.tsx` - About dialog branding
5. `packages/getting-started/src/browser/getting-started-widget.tsx` - Welcome screen
6. Various config files for `.theia` → `.quallaa` directory change

### Build Commands Reference
```bash
# Full development build
yarn install
yarn build

# Electron example specific
cd examples/electron
yarn clean
yarn compile
yarn bundle
yarn start

# Packaging (add this script first)
yarn package  # or yarn dist for full pipeline
```

### Environment Variables for Code Signing
```bash
export APPLE_IDENTITY="Developer ID Application: Your Name (TEAM_ID)"
export APPLE_ID="your@email.com"
export APPLE_ID_PASSWORD="xxxx-xxxx-xxxx-xxxx"
export APPLE_TEAM_ID="XXXXXXXXXX"
```

### Useful Links
- Eclipse Theia Docs: https://theia-ide.org/docs/
- Theia Platform Repo: https://github.com/eclipse-theia/theia
- Theia IDE Template Repo: https://github.com/eclipse-theia/theia-ide
- EPL 2.0 License: https://www.eclipse.org/legal/epl-2.0/
- electron-builder Docs: https://www.electron.build/
- Apple Developer: https://developer.apple.com/
- Code Signing Guide: https://www.electron.build/code-signing

---

**Last Updated**: 2025-10-05
**Project**: Quallaa Rebranding MVP
**Platform**: macOS only
**Timeline**: 2-3 weeks
