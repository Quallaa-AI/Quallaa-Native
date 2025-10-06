# Quallaa Electron App Tests

Automated test suite for validating the Quallaa rebrand of Eclipse Theia.

## Quick Start

```bash
# Install test dependencies
yarn add -D @playwright/test @types/node

# Install Playwright browsers
npx playwright install --with-deps

# Run all tests
yarn test:e2e

# Run with UI (for debugging)
yarn test:e2e:ui
```

## Test Structure

- `e2e/` - End-to-end tests for branding, UI components, configuration
- `compliance/` - EPL 2.0 license compliance tests
- `build/` - Build and packaging validation tests
- `performance/` - Performance baseline tests
- `fixtures/` - Shared test fixtures and helpers

## Test Commands

```bash
# Run all tests
yarn test:e2e

# Run in headed mode (see browser)
yarn test:e2e:headed

# Run in UI mode (interactive debugging)
yarn test:e2e:ui

# Run in debug mode (step through tests)
yarn test:e2e:debug

# Update visual regression baselines
yarn test:e2e:update-snapshots

# View HTML test report
yarn test:e2e:report

# Run specific test file
yarn test:e2e test/e2e/application-identity.spec.ts
```

## Test Categories

### Critical Tests (Must Pass for MVP)

1. **Application Identity** (`e2e/application-identity.spec.ts`)
   - Window title, package.json, app ID verification
   - Config directory (.quallaa vs .theia)

2. **UI Components** (`e2e/ui-components.spec.ts`)
   - About Dialog branding and attribution
   - Getting Started Widget customization
   - AI Chat welcome message

3. **EPL 2.0 Compliance** (`compliance/epl-compliance.spec.ts`)
   - LICENSE file presence
   - Attribution in About Dialog
   - Copyright headers in modified files
   - Source code accessibility

### High Priority Tests

4. **Visual Assets** (`e2e/visual-assets.spec.ts`)
   - icon.icns validation
   - Logo file verification
   - Visual regression baselines

5. **Text Replacements** (`e2e/text-replacements.spec.ts`)
   - "Quallaa" vs "Theia IDE" in UI
   - Debug client name
   - Error message branding

6. **Configuration** (`e2e/configuration.spec.ts`)
   - Settings persistence
   - Preferences directory
   - No .theia references

7. **Functional Regression** (`e2e/functional-regression.spec.ts`)
   - Core IDE functionality
   - Command Palette, Quick Open, Settings
   - Editor, Terminal, Search

## Writing Tests

### Basic Test Structure

```typescript
import { test, expect } from '../fixtures/electron-app';

test.describe('My Test Category', () => {
  test('should do something', async ({ page, electronApp }) => {
    // Wait for app to load
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    // Interact with the app
    await page.keyboard.press('Meta+Shift+P');

    // Assert expected behavior
    const title = await page.title();
    expect(title).toContain('Quallaa');
  });
});
```

### Available Fixtures

- `electronApp` - Electron application instance
- `page` - Main window page
- `userDataDir` - Temporary user data directory (auto-cleanup)

### Visual Regression Tests

```typescript
// Take a screenshot for comparison
await expect(page).toHaveScreenshot('my-feature.png', {
  maxDiffPixels: 100,
});
```

First run creates baseline, subsequent runs compare against it.

## CI/CD Integration

Tests run automatically on:
- Push to `feature/quallaa-rebrand-macos`
- Push to `master`
- Pull requests

Results are uploaded as artifacts and commented on PRs.

## Troubleshooting

### App won't start
Ensure app is built first:
```bash
cd examples/electron
yarn bundle
```

### Tests timeout
Increase timeout in `playwright.config.ts` or individual tests:
```typescript
test.setTimeout(120000); // 2 minutes
```

### Visual regression fails
Review changes, then update baselines if intentional:
```bash
yarn test:e2e:update-snapshots
```

### Debugging tips
1. Use `yarn test:e2e:ui` for interactive debugging
2. Use `yarn test:e2e:debug` to step through tests
3. Check `test-results/` for screenshots and videos
4. View HTML report with `yarn test:e2e:report`

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright for Electron](https://playwright.dev/docs/api/class-electron)
- [Main Test Plan](../../../TEST-PLAN.md)

---

For questions or issues, see: https://github.com/Quallaa-AI/Quallaa-Native/issues
