# Quallaa Rebrand - Automated Testing Plan

This document describes the automated testing strategy for validating the Quallaa rebrand of Eclipse Theia.

## Overview

The test suite ensures that all branding changes are correctly implemented and that the rebrand maintains:
- Correct Quallaa branding throughout the UI
- EPL 2.0 compliance with proper attribution
- Functional parity with the original Eclipse Theia platform
- Visual consistency with Quallaa brand assets

## Test Structure

Tests are organized in `examples/electron/test/` with the following structure:

```
test/
├── playwright.config.ts           # Playwright configuration
├── fixtures/
│   └── electron-app.ts            # Test fixtures for Electron app
├── e2e/                           # End-to-end tests
│   ├── application-identity.spec.ts
│   ├── ui-components.spec.ts
│   ├── configuration.spec.ts
│   ├── visual-assets.spec.ts
│   ├── text-replacements.spec.ts
│   └── functional-regression.spec.ts
├── compliance/                    # EPL 2.0 compliance tests
│   └── epl-compliance.spec.ts
├── build/                         # Build and packaging tests
└── performance/                   # Performance baseline tests
```

## Test Categories

### Category A: Application Identity Tests
**File**: `test/e2e/application-identity.spec.ts`

**Purpose**: Verify correct application branding at the system level

**Tests**:
- ✅ Window title contains "Quallaa"
- ✅ package.json has correct name, productName, applicationName
- ✅ electron-builder.yml has correct appId and productName
- ✅ Application uses .quallaa config directory
- ✅ No user-visible "Theia IDE" branding

**Critical for MVP**: YES

---

### Category B: Visual Asset Tests
**File**: `test/e2e/visual-assets.spec.ts`

**Purpose**: Verify all visual assets are correctly branded

**Tests**:
- ✅ icon.icns exists and is valid
- ✅ icon.icns contains all required sizes (16x16 to 512x512@2x)
- ✅ quallaa-logo.svg exists
- ✅ theia-logo.svg has been removed
- ✅ electron-builder.yml references correct icon
- ✅ Visual regression screenshots (baseline capture)

**Critical for MVP**: HIGH

---

### Category C: UI Component Branding Tests
**File**: `test/e2e/ui-components.spec.ts`

**Purpose**: Verify custom UI components display correct branding

**Tests**:
- ✅ About Dialog displays "Quallaa" branding
- ✅ About Dialog shows "Built on Eclipse Theia" attribution
- ✅ About Dialog has EPL 2.0 license information
- ✅ About Dialog links to Quallaa source code
- ✅ Getting Started Widget shows Quallaa welcome message
- ✅ Getting Started Widget has Quallaa-specific links
- ✅ AI Chat displays "Ask the Quallaa AI"
- ✅ Screenshot regression tests for all components

**Critical for MVP**: YES

---

### Category D: Text Replacement Tests
**File**: `test/e2e/text-replacements.spec.ts`

**Purpose**: Verify user-visible text has been updated

**Tests**:
- ✅ AI Chat welcome: "Ask the Quallaa AI" (not "Theia IDE AI")
- ✅ Debug client name: "Quallaa"
- ✅ Window title contains "Quallaa" not "Theia"
- ✅ No "Theia IDE" in error messages
- ✅ No "Theia IDE" in notifications
- ✅ Menu items reference Quallaa
- ✅ Status bar doesn't show "Theia IDE"

**Critical for MVP**: HIGH

---

### Category E: Configuration & Persistence Tests
**File**: `test/e2e/configuration.spec.ts`

**Purpose**: Verify configuration directory and settings persistence

**Tests**:
- ✅ package.json specifies .quallaa preferences directory
- ✅ App creates .quallaa directory (not .theia)
- ✅ Settings UI doesn't show .theia paths
- ✅ Settings persist correctly
- ✅ No .theia references in user-visible config paths

**Critical for MVP**: HIGH

---

### Category G: EPL 2.0 Compliance Tests
**File**: `test/compliance/epl-compliance.spec.ts`

**Purpose**: Ensure EPL 2.0 license compliance

**Tests**:
- ✅ LICENSE file exists in repository
- ✅ NOTICE file exists (recommended)
- ✅ About Dialog displays "Built on Eclipse Theia"
- ✅ About Dialog links to theia-ide.org
- ✅ About Dialog displays EPL 2.0 license
- ✅ About Dialog links to Quallaa source code
- ✅ About Dialog accessible within 3 clicks
- ✅ All Quallaa branding files have EPL 2.0 headers
- ✅ package.json specifies EPL-2.0 license
- ✅ Product name doesn't violate Eclipse trademarks

**Critical for MVP**: YES (Legal requirement)

---

### Category H: Functional Regression Tests
**File**: `test/e2e/functional-regression.spec.ts`

**Purpose**: Ensure core IDE functionality still works

**Tests**:
- ✅ Application launches successfully
- ✅ Main window renders correctly
- ✅ Command Palette opens
- ✅ Quick Open works
- ✅ Settings/Preferences opens
- ✅ Editor basic functionality
- ✅ File Explorer opens
- ✅ Terminal opens
- ✅ Search functionality works
- ✅ Keyboard shortcuts work
- ✅ Monaco editor loads
- ✅ Window closes gracefully

**Critical for MVP**: HIGH (90%+ pass rate)

---

## Running Tests

### Prerequisites

```bash
cd examples/electron
yarn add -D @playwright/test @types/node
npx playwright install --with-deps
```

### Run All Tests

```bash
cd examples/electron
yarn test:e2e
```

### Run Specific Category

```bash
# Application Identity tests only
yarn test:e2e test/e2e/application-identity.spec.ts

# EPL Compliance tests only
yarn test:e2e test/compliance/epl-compliance.spec.ts
```

### Run in UI Mode (for debugging)

```bash
yarn test:e2e:ui
```

### Run in Headed Mode (see browser)

```bash
yarn test:e2e:headed
```

### Run in Debug Mode

```bash
yarn test:e2e:debug
```

### Update Visual Regression Baselines

```bash
# First run creates baselines
# Subsequent runs compare against baselines
# To update baselines:
yarn test:e2e:update-snapshots
```

### View Test Report

```bash
yarn test:e2e:report
```

---

## CI/CD Integration

Tests run automatically on:
- ✅ Push to `feature/quallaa-rebrand-macos` branch
- ✅ Push to `master` branch
- ✅ Pull requests to above branches

### GitHub Actions Workflows

**File**: `.github/workflows/test-rebrand.yml`

**Jobs**:
1. **test-rebrand** (macOS runner)
   - Installs dependencies
   - Compiles packages
   - Builds Electron app
   - Runs Playwright E2E tests
   - Uploads test results and reports
   - Comments results on PR

2. **test-compliance** (Ubuntu runner)
   - Checks LICENSE file exists
   - Verifies EPL 2.0 headers in all Quallaa files
   - Validates package.json license field

3. **test-branding** (Ubuntu runner)
   - Checks no Theia logos remain
   - Verifies Quallaa assets exist
   - Validates package.json branding
   - Validates electron-builder.yml config

### Test Results

Test results are uploaded as artifacts:
- `test-results/` - Raw test output, screenshots, videos
- `test-results/html/` - HTML test report
- `test-results/junit.xml` - JUnit XML for CI integration

---

## Success Criteria

### MVP Cannot Ship Without:
- ✅ 100% pass rate on Category A (Application Identity)
- ✅ 100% pass rate on Category C (UI Components)
- ✅ 100% pass rate on Category G (EPL Compliance)
- ✅ 90%+ pass rate on Category E (Configuration)
- ✅ 90%+ pass rate on Category H (Functional Regression)

### Nice to Have:
- Visual regression baselines captured
- Performance metrics tracked
- Automated DMG testing

---

## Test Maintenance

### Adding New Tests

1. Create new `.spec.ts` file in appropriate category folder
2. Import test fixture: `import { test, expect } from '../fixtures/electron-app';`
3. Write tests using Playwright API
4. Run locally to verify
5. Commit and push - CI will run automatically

### Updating Visual Baselines

When UI changes are intentional:
```bash
yarn test:e2e:update-snapshots
```
Commit updated baseline images to git.

### Debugging Failing Tests

1. Run in UI mode: `yarn test:e2e:ui`
2. Or run in debug mode: `yarn test:e2e:debug`
3. Check `test-results/` for screenshots and videos
4. View HTML report: `yarn test:e2e:report`

---

## Known Limitations

1. **Electron-specific**: Tests require Electron environment
2. **macOS-focused**: Some tests (icon validation) are macOS-specific
3. **UI-dependent**: Tests rely on Theia's DOM structure
4. **No DMG testing**: Packaged DMG testing requires manual verification
5. **Settings persistence**: Full persistence testing requires app restart

---

## Future Enhancements

### Phase 2 Improvements:
- Add performance benchmarking tests
- Add memory leak detection
- Add accessibility (a11y) tests
- Add cross-platform tests (Windows, Linux)
- Add DMG installer automated testing
- Add code coverage reporting

### Web Version:
- Adapt tests for browser-based deployment
- Add responsive design tests
- Add cross-browser compatibility tests

---

## Troubleshooting

### Tests fail to start Electron app

**Solution**: Ensure app is built first
```bash
cd examples/electron
yarn bundle
```

### Playwright browser not found

**Solution**: Install Playwright browsers
```bash
npx playwright install --with-deps
```

### Visual regression tests fail

**Cause**: Baseline images don't exist or UI changed

**Solution**: Review changes, then update baselines if intentional
```bash
yarn test:e2e:update-snapshots
```

### Tests timeout

**Cause**: App takes too long to start

**Solution**: Increase timeout in `playwright.config.ts`:
```typescript
timeout: 120 * 1000, // 2 minutes
```

---

## Contact

For questions about testing:
- Review test code in `examples/electron/test/`
- Check CI logs in GitHub Actions
- Report issues at https://github.com/Quallaa-AI/Quallaa-Native/issues

---

**Last Updated**: 2025-10-05
**Test Suite Version**: 1.0.0
**Quallaa Version**: 1.65.0
