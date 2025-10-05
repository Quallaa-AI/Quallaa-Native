# Quallaa Rebranding Project Plan - macOS MVP

**Goal**: Rebrand Eclipse Theia to Quallaa for macOS desktop distribution
**Timeline**: 2-3 weeks for basic rebrand MVP
**Platform**: macOS only (initial release)

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
- [ ] Verify Apple Developer Program membership is active
- [ ] Obtain Apple Developer code signing certificate
- [ ] Export signing certificate and password for later CI/CD use
- [x] Set up Git branch for rebrand work ✅ (`feature/quallaa-rebrand-macos`)

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

### File Modifications - examples/electron/package.json
- [ ] Change `"name"` field from `"@theia/example-electron"` to `"@quallaa/quallaa"` or chosen name
- [ ] Change `"productName"` from `"Theia Electron Example"` to `"Quallaa"`
- [ ] Update `theia.frontend.config.applicationName` from `"Theia Electron Example"` to `"Quallaa"`
- [ ] Change splash screen path from `"resources/theia-logo.svg"` to `"resources/quallaa-logo.svg"` (or remove splash for MVP)
- [ ] Add user preferences directory config: `"preferences-dir": ".quallaa"` in theia.backend.config
- [ ] Update license field if adding proprietary components (or keep EPL-2.0 for MVP)
- [ ] Save file and verify JSON syntax is valid

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

### electron-builder Configuration
- [ ] **CHECK**: Does `examples/electron/electron-builder.yml` exist? (Search for electron-builder config)
- [ ] If YES: Update `appId` to match chosen identifier (e.g., `com.quallaa.ide`)
- [ ] If YES: Update `productName` to `"Quallaa"`
- [ ] If YES: Update `copyright` notice with current year and company name
- [ ] If YES: Configure macOS-specific settings (category, icon path)
- [ ] If NO: Create `examples/electron/electron-builder.yml` with Quallaa branding
- [ ] If NO: Copy template from Theia IDE repository as reference
- [ ] Configure code signing: Set `mac.identity` to Developer ID or use environment variable
- [ ] Configure macOS build: Set `mac.target` to `dmg` for installer
- [ ] Configure macOS icon: Set `mac.icon` to `resources/icon.icns`
- [ ] Test electron-builder config: Add `"package"` script to examples/electron/package.json
- [ ] Test packaging: Run `cd examples/electron && yarn package` (will fail without signing initially)

---

## Phase 3: UI Component Customization (Week 1 - Days 6-7)

### About Dialog Customization
- [ ] Locate About Dialog component: `packages/core/src/browser/about-dialog.tsx`
- [ ] Read current About Dialog implementation (already reviewed above)
- [ ] **OPTION A - Override via extension**: Create custom About Dialog in new extension
- [ ] **OPTION B - Direct modification**: Edit `about-dialog.tsx` directly (simpler for MVP)
- [ ] If OPTION B: Add copyright notice preserving original Eclipse Foundation copyright
- [ ] If OPTION B: Update dialog title to "About Quallaa"
- [ ] If OPTION B: Add attribution: "Built on Eclipse Theia" in dialog body
- [ ] If OPTION B: Add link to Eclipse Theia project: https://theia-ide.org
- [ ] If OPTION B: Add link to Quallaa source code repository (must provide EPL-licensed source)
- [ ] If OPTION B: Update version display to show Quallaa version
- [ ] Test About Dialog: Open app, trigger "About" from menu, verify branding

### Getting Started Widget Customization
- [ ] Locate Getting Started Widget: `packages/getting-started/src/browser/getting-started-widget.tsx`
- [ ] Read current implementation (already reviewed above)
- [ ] **OPTION A - Override via extension**: Create custom Getting Started widget
- [ ] **OPTION B - Direct modification**: Edit widget directly (simpler for MVP)
- [ ] If OPTION B: Add copyright notice preserving original Eclipse copyright
- [ ] If OPTION B: Update header from "Theia Electron Example Getting Started" to "Quallaa Getting Started"
- [ ] If OPTION B: Update `applicationName` usage (should pull from config automatically)
- [ ] If OPTION B: Customize "News" section: Remove Theia AI announcement or rebrand for Quallaa
- [ ] If OPTION B: Customize "Help" section links:
  - [ ] Update Documentation link to Quallaa docs (or remove if none exist)
  - [ ] Remove or update "VS Code API Compatibility" link
  - [ ] Remove "Building a New Extension" link (Theia-specific)
  - [ ] Remove "Building a New Plugin" link (Theia-specific)
  - [ ] Add "About Quallaa" link or similar
- [ ] If OPTION B: Remove or customize AI features section (if not relevant to MVP)
- [ ] Test Getting Started Widget: Launch app with no workspace, verify custom content

### Environment Variables / Config Directory
- [ ] Search for `.theia` references in codebase: `grep -r "\.theia" packages/`
- [ ] Locate EnvVariablesServer or equivalent that sets config directory
- [ ] Update config directory from `.theia` to `.quallaa`
- [ ] Search for `.theia-blueprint` references (from Theia IDE template)
- [ ] Update any `.theia-blueprint` to `.quallaa`
- [ ] Test: Launch app, make preference change, verify `~/.quallaa` directory is created
- [ ] Test: Verify preferences persist across app restarts

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

## Timeline Summary

**Week 1: Foundation & Core Branding**
- Days 1-2: Setup, legal compliance, environment
- Days 3-5: Package.json changes, assets, electron-builder config
- Days 6-7: About Dialog, Getting Started widget, config directory

**Week 2: Build Pipeline & Testing**
- Days 1-2: Text replacements, UI polish
- Days 3-5: Code signing, packaging, troubleshooting
- Days 6-7: CI/CD (optional) or additional testing

**Week 3: Distribution & Launch**
- Days 1-3: Documentation, compliance verification, distribution setup
- Days 4-5: Testing, beta feedback (optional)
- Days 6-7: Launch preparation, release

**Total: 2-3 weeks for macOS MVP**

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
