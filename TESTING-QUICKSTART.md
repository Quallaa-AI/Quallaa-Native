# Quallaa Testing Quick Start

This guide gets you up and running with the automated test suite for the Quallaa rebrand.

## Prerequisites

- Node.js >= 20
- Yarn package manager
- macOS (for full test suite including icon validation)

## Setup (First Time Only)

### 1. Install Dependencies

From repository root:

```bash
# Install all project dependencies
yarn install

# Compile TypeScript packages
yarn compile
```

### 2. Install Test Dependencies

```bash
cd examples/electron

# Add Playwright test dependencies
yarn add -D @playwright/test @types/node

# Install Playwright browsers
npx playwright install --with-deps
```

### 3. Build the Electron App

```bash
# Still in examples/electron directory
yarn bundle
```

## Running Tests

### Run All Tests

```bash
cd examples/electron
yarn test:e2e
```

Expected output:
```
Running 50+ tests using 1 worker

✓ Application Identity (6 tests) - 12s
✓ UI Components (8 tests) - 18s
✓ Configuration (6 tests) - 10s
✓ EPL Compliance (10 tests) - 8s
✓ Visual Assets (9 tests) - 15s
✓ Text Replacements (9 tests) - 14s
✓ Functional Regression (14 tests) - 22s

Passed: 50+
```

### Run Specific Test Categories

```bash
# Application Identity tests only
yarn test:e2e test/e2e/application-identity.spec.ts

# EPL Compliance tests only (critical for legal compliance)
yarn test:e2e test/compliance/epl-compliance.spec.ts

# UI Component tests
yarn test:e2e test/e2e/ui-components.spec.ts
```

### Interactive Testing (Recommended for Development)

```bash
# Open Playwright UI for interactive debugging
yarn test:e2e:ui
```

This opens a GUI where you can:
- Select tests to run
- Watch tests execute step-by-step
- Inspect DOM and screenshots
- Debug failing tests

### View Test Results

```bash
# Generate and open HTML test report
yarn test:e2e:report
```

## Test Categories Explained

### 🔴 Critical (Must Pass for MVP)

1. **Application Identity** - Verifies Quallaa branding in app name, window title, config
2. **UI Components** - Checks About Dialog, Getting Started, AI Chat branding
3. **EPL 2.0 Compliance** - Ensures legal compliance with Eclipse license

### 🟡 High Priority

4. **Visual Assets** - Validates icons, logos, visual branding
5. **Text Replacements** - Confirms "Theia IDE" → "Quallaa" replacements
6. **Configuration** - Checks .quallaa config directory, settings persistence
7. **Functional Regression** - Ensures IDE features still work

## Understanding Test Results

### ✅ All Tests Pass

```
Passed: 52
Failed: 0
```

**Action**: Ready to proceed! Consider committing changes.

### ⚠️ Some Tests Fail

```
Passed: 48
Failed: 4
```

**Action**:
1. Run `yarn test:e2e:report` to see which tests failed
2. Review screenshots in `test-results/`
3. Fix issues or update tests if changes are intentional

### ❌ Many Tests Fail

**Common Causes**:
- App not built: Run `yarn bundle` first
- Playwright not installed: Run `npx playwright install --with-deps`
- Breaking changes to branding

## Visual Regression Tests

First run creates baseline screenshots. Subsequent runs compare against baselines.

### Update Baselines (After Intentional UI Changes)

```bash
yarn test:e2e:update-snapshots
```

⚠️ Only update baselines after reviewing that UI changes are intentional!

Commit updated baselines to git:
```bash
git add examples/electron/test/**/*-snapshots/
git commit -m "Update visual regression baselines"
```

## Debugging Failing Tests

### Method 1: UI Mode (Recommended)

```bash
yarn test:e2e:ui
```

Click on failing test → Click "Show trace" → Inspect step-by-step

### Method 2: Debug Mode

```bash
yarn test:e2e:debug
```

Tests run with debugger attached. Set breakpoints in test code.

### Method 3: Screenshots & Videos

Check `test-results/` directory after running tests:
- Screenshots of failures
- Videos of test execution
- Trace files for detailed inspection

## CI/CD Integration

Tests run automatically on GitHub Actions for:
- Pushes to `feature/quallaa-rebrand-macos`
- Pushes to `master`
- All pull requests

### View CI Test Results

1. Go to GitHub repo → Actions tab
2. Click on latest workflow run
3. View "Test Quallaa Rebrand" job
4. Download test artifacts for detailed results

## Common Issues & Solutions

### Issue: "Playwright not installed"

```bash
npx playwright install --with-deps
```

### Issue: "Cannot find Electron executable"

**Solution**: Build the app first
```bash
cd examples/electron
yarn bundle
```

### Issue: Tests timeout

**Solution**: Increase timeout in individual test:
```typescript
test.setTimeout(120000); // 2 minutes
```

Or globally in `playwright.config.ts`.

### Issue: Visual regression fails after UI change

**Expected**: UI changed, baselines need update

**Solution**: Review changes, then:
```bash
yarn test:e2e:update-snapshots
```

### Issue: "port already in use"

**Solution**: Close any running Electron instances
```bash
pkill -f "Quallaa"
```

## Test Coverage Summary

| Category | Tests | Critical for MVP |
|----------|-------|-----------------|
| Application Identity | 6 | ✅ YES |
| UI Components | 8 | ✅ YES |
| EPL Compliance | 10 | ✅ YES (Legal) |
| Configuration | 6 | 🟡 HIGH |
| Visual Assets | 9 | 🟡 HIGH |
| Text Replacements | 9 | 🟡 HIGH |
| Functional Regression | 14 | 🟡 HIGH (90%+) |
| **TOTAL** | **50+** | |

## Next Steps

After running tests successfully:

1. ✅ Verify all critical tests pass (Categories 1-3)
2. ✅ Review any failures in high-priority tests
3. ✅ Update visual baselines if UI changes are intentional
4. ✅ Commit test results and updated baselines
5. ✅ Push to GitHub to trigger CI/CD tests
6. ✅ Review CI test results before merging

## Resources

- **Detailed Test Plan**: [TEST-PLAN.md](./TEST-PLAN.md)
- **Test Directory README**: [examples/electron/test/README.md](./examples/electron/test/README.md)
- **Playwright Docs**: https://playwright.dev/
- **Report Issues**: https://github.com/Quallaa-AI/Quallaa-Native/issues

---

**Questions?** Review test code in `examples/electron/test/` or check CI logs in GitHub Actions.

**Last Updated**: 2025-10-05
