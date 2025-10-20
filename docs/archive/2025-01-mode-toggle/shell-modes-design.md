# Simple Mode / Developer Mode Design

**Status:** Design approved (research validated 2025-01-19)
**Research:** [../research/2025-01-theia-shell-customization-research.md](../research/2025-01-theia-shell-customization-research.md)
**Decision:** [../DECISIONS.md#shell-customization-approach](../DECISIONS.md#shell-customization-approach)

---

## Overview

Quallaa provides two UI modes to support progressive disclosure:

**Simple Mode (Default):**
- Markdown editor + docs tree + AI chat
- No menu bar, no visible IDE chrome
- Focus on content creation and AI assistance
- Target: Domain experts, non-technical users

**Developer Mode (Advanced):**
- Full IDE with all panels visible
- Menu bar, terminal, file explorer, git, etc.
- Access to all Theia capabilities
- Target: Power users, developers, troubleshooting

Users can toggle between modes with `Cmd+Shift+D` (macOS) or `Ctrl+Shift+D` (Windows/Linux).

---

## Technical Approach

### Phase 1: Standard API Implementation (MVP)

Validated by research as production-ready. Use Theia's built-in panel control APIs without subclassing.

**Advantages:**
- Simple implementation (1-2 weeks)
- Uses stable, documented APIs
- Easy to maintain across Theia updates
- Proven by Arduino IDE 2.0

**Limitations:**
- Users can drag widgets into collapsed panels
- No enforcement of widget placement
- May need Phase 2 if this becomes a problem

### Phase 2: Custom ApplicationShell (If Needed)

Only implement if user testing shows widget placement is a real issue.

**Advantages:**
- Complete control over widget placement
- Can physically remove panels from layout
- Prevents accidental widget misplacement

**Disadvantages:**
- Complex implementation (2-3 weeks)
- Must adapt when Theia changes ApplicationShell
- Requires deep Theia knowledge

**Decision:** Start with Phase 1, validate with users before considering Phase 2.

---

## API Usage

### Correct Panel Control APIs

**CRITICAL:** Research identified an API error in original proposal.

```typescript
// ✅ CORRECT: Side panels use collapsePanel/expandPanel
this.shell.collapsePanel('left');
this.shell.collapsePanel('right');
this.shell.collapsePanel('bottom');

this.shell.expandPanel('left');

// ✅ CORRECT: Top panel uses hide/show (NOT collapsePanel)
this.shell.topPanel.hide();
this.shell.topPanel.show();

// ❌ WRONG: topPanel does NOT support collapsePanel
this.shell.collapsePanel('top');  // This API does not exist!
```

**Why the difference?** The `topPanel` is a standard Lumino `Panel` widget, not a collapsible side area. It doesn't have the collapse/expand infrastructure that side panels have.

### Required Workarounds

#### 1. Side Panel Width Race Condition

**Problem:** GitHub Issue #14484 - Side panels sometimes expand to very narrow width (unusable).

**Solution:** Set animation duration to 50ms instead of 0ms.

```typescript
// In frontend module or contribution
bind(ApplicationShellOptions).toConstantValue({
    leftPanel: {
        animationDuration: 50  // 50ms instead of default 0
    },
    rightPanel: {
        animationDuration: 50
    }
});
```

#### 2. macOS Native Menu Bar

**Problem:** On macOS with `titleBarStyle: 'native'`, menus appear in OS menu bar (top of screen), not in app window. `topPanel.hide()` has no effect.

**Solution:** Configure Electron with custom title bar.

```typescript
// In Electron window options
{
    titleBarStyle: 'custom',  // NOT 'native'
    // ... other options
}
```

---

## Implementation Pattern

### 1. Mode Manager Contribution

```typescript
import { injectable, inject } from 'inversify';
import { FrontendApplicationContribution, FrontendApplication } from '@theia/core/lib/browser';
import { ApplicationShell } from '@theia/core/lib/browser/shell/application-shell';
import { StorageService } from '@theia/core/lib/browser/storage-service';

@injectable()
export class QuallaaModuleManager implements FrontendApplicationContribution {

    private static MODE_KEY = 'quallaa-ui-mode';

    @inject(ApplicationShell)
    protected readonly shell: ApplicationShell;

    @inject(StorageService)
    protected readonly storage: StorageService;

    /**
     * Called after layout is initialized.
     * This runs AFTER Theia restores saved layout, so we can override it.
     */
    async onDidInitializeLayout(app: FrontendApplication): Promise<void> {
        const mode = await this.storage.getData<string>(
            QuallaaModuleManager.MODE_KEY,
            'simple'  // Default to simple mode
        );
        await this.applyMode(mode);
    }

    /**
     * Toggle between simple and developer mode.
     * Called by toggle command.
     */
    async toggleMode(): Promise<void> {
        const current = await this.storage.getData<string>(
            QuallaaModuleManager.MODE_KEY,
            'simple'
        );
        const newMode = current === 'simple' ? 'developer' : 'simple';
        await this.storage.setData(QuallaaModuleManager.MODE_KEY, newMode);
        await this.applyMode(newMode);
    }

    /**
     * Apply the given mode to the shell.
     */
    private async applyMode(mode: string): Promise<void> {
        if (mode === 'simple') {
            await this.enterSimpleMode();
        } else {
            await this.enterDeveloperMode();
        }
    }

    /**
     * Simple mode: Hide IDE chrome, show only docs tree + editor + AI chat
     */
    private async enterSimpleMode(): Promise<void> {
        // Hide menu bar (MUST use hide(), not collapsePanel)
        this.shell.topPanel.hide();

        // Collapse all side panels
        await this.shell.collapsePanel('left');
        await this.shell.collapsePanel('right');
        await this.shell.collapsePanel('bottom');

        // Show docs tree in left panel
        await this.shell.leftPanelHandler.activate('docs-view');
        await this.shell.expandPanel('left');

        // Show AI chat in right panel
        await this.shell.rightPanelHandler.activate('ide-ai-chat-view');
        await this.shell.expandPanel('right');

        // Main area = editor (automatically shows open files)
    }

    /**
     * Developer mode: Show full IDE
     */
    private async enterDeveloperMode(): Promise<void> {
        // Show menu bar
        this.shell.topPanel.show();

        // Expand left panel (file explorer, search, git)
        await this.shell.expandPanel('left');

        // Expand bottom panel (terminal, problems, output)
        await this.shell.expandPanel('bottom');

        // Let user control right panel (outline, etc.)
        // Don't force-expand it
    }
}
```

### 2. Toggle Command Contribution

```typescript
import { injectable } from 'inversify';
import { CommandContribution, CommandRegistry, Command } from '@theia/core/lib/common';
import { QuallaaModuleManager } from './quallaa-mode-manager';

export namespace QuallaaCommands {
    export const TOGGLE_DEVELOPER_MODE: Command = {
        id: 'quallaa.toggleDeveloperMode',
        label: 'Toggle Developer Mode'
    };
}

@injectable()
export class QuallaaCommandContribution implements CommandContribution {

    @inject(QuallaaModuleManager)
    protected readonly modeManager: QuallaaModuleManager;

    registerCommands(commands: CommandRegistry): void {
        commands.registerCommand(QuallaaCommands.TOGGLE_DEVELOPER_MODE, {
            execute: () => this.modeManager.toggleMode()
        });
    }
}
```

### 3. Keybinding Contribution

```typescript
import { injectable } from 'inversify';
import { KeybindingContribution, KeybindingRegistry } from '@theia/core/lib/browser';
import { QuallaaCommands } from './quallaa-command-contribution';

@injectable()
export class QuallaaKeybindingContribution implements KeybindingContribution {

    registerKeybindings(keybindings: KeybindingRegistry): void {
        keybindings.registerKeybinding({
            command: QuallaaCommands.TOGGLE_DEVELOPER_MODE.id,
            keybinding: 'ctrl+shift+d',  // Windows/Linux
            context: 'true'
        });

        keybindings.registerKeybinding({
            command: QuallaaCommands.TOGGLE_DEVELOPER_MODE.id,
            keybinding: 'cmd+shift+d',   // macOS
            context: 'true'
        });
    }
}
```

### 4. Frontend Module (DI Bindings)

```typescript
import { ContainerModule } from 'inversify';
import {
    FrontendApplicationContribution,
    CommandContribution,
    KeybindingContribution
} from '@theia/core/lib/browser';
import { QuallaaModuleManager } from './quallaa-mode-manager';
import { QuallaaCommandContribution } from './quallaa-command-contribution';
import { QuallaaKeybindingContribution } from './quallaa-keybinding-contribution';

export default new ContainerModule(bind => {
    // Mode manager (singleton)
    bind(QuallaaModuleManager).toSelf().inSingletonScope();
    bind(FrontendApplicationContribution).toService(QuallaaModuleManager);

    // Command contribution
    bind(QuallaaCommandContribution).toSelf().inSingletonScope();
    bind(CommandContribution).toService(QuallaaCommandContribution);

    // Keybinding contribution
    bind(QuallaaKeybindingContribution).toSelf().inSingletonScope();
    bind(KeybindingContribution).toService(QuallaaKeybindingContribution);
});
```

---

## State Management

### Storage Key Strategy

**Mode preference** (separate key - survives layout reset):
```typescript
await this.storage.setData('quallaa-ui-mode', 'simple');
```

**Layout data** (Theia-managed - cleared by "Reset Workbench Layout"):
```typescript
// Theia manages this automatically - don't touch
await this.storage.setData('layout', layoutData);
```

**Why separate keys?** If user triggers "Reset Workbench Layout", we want to preserve their mode preference but reset widget positions.

### Lifecycle Timing

1. **Application starts**
2. **Theia restores saved layout** (if exists)
3. **`onDidInitializeLayout()` fires** ← Our hook
4. **We apply mode settings** (may override restored layout)
5. **Shell attaches to DOM**

This ensures our mode always takes precedence over saved layout.

---

## Known Risks and Mitigations

### Risk 1: Widget Placement

**Problem:** Users can drag widgets into collapsed panels.

**Impact:** Medium - May confuse users if widgets "disappear"

**Mitigation (Phase 1):**
- Accept this limitation for MVP
- Test with real users to see if it's actually a problem
- If problematic → implement Phase 2 (custom ApplicationShell)

**Mitigation (Phase 2 - if needed):**
- Subclass ApplicationShell
- Override `addWidget()` to enforce placement rules
- Physically remove panels from layout in simple mode

### Risk 2: Accessibility

**Problem:** Hiding menu bar violates WCAG 2.1 guidelines for keyboard/screen reader users.

**Impact:** High - Legal/ethical obligation

**Mitigation:**
- Ensure Command Palette (`Cmd+Shift+P`) is discoverable
- Add custom command bar or toolbar with essential commands
- Test with screen readers (NVDA, JAWS, VoiceOver)
- Document keyboard shortcuts for all critical functions
- Consider keeping menu bar visible but simplified in simple mode

### Risk 3: Focus Management

**Problem:** Custom widgets must implement `onActivateRequest()` or focus tracking breaks.

**Impact:** Medium - Wrong tabs can close

**Mitigation:**
- Document requirement for all custom widgets
- Add to widget template/boilerplate
- Test tab closing behavior thoroughly

```typescript
// Required in all custom widgets
protected onActivateRequest(msg: Message): void {
    super.onActivateRequest(msg);
    this.node.focus();  // or focus specific DOM element
}
```

### Risk 4: Theia Version Updates

**Problem:** Monthly Theia releases may break our customizations.

**Impact:** Medium - Ongoing maintenance burden

**Mitigation:**
- Subscribe to Theia release announcements
- Read Migration.md for each version
- Budget time for quarterly compatibility updates
- Pin Theia version in package.json until tested

---

## Testing Strategy

### Manual Testing Checklist

**Simple Mode:**
- [ ] Menu bar hidden on startup
- [ ] Docs tree visible in left panel
- [ ] AI chat visible in right panel
- [ ] Main editor shows markdown files
- [ ] Bottom panel (terminal) hidden
- [ ] No console errors

**Mode Toggle:**
- [ ] `Cmd+Shift+D` switches to developer mode
- [ ] Menu bar appears
- [ ] Left panel shows full explorer
- [ ] Bottom panel (terminal) appears
- [ ] Toggle again returns to simple mode
- [ ] No visual glitches during transition

**Persistence:**
- [ ] Quit app in simple mode → restart → still simple mode
- [ ] Quit app in developer mode → restart → still developer mode
- [ ] Mode preference survives "Reset Workbench Layout" command

**Edge Cases:**
- [ ] Dragging markdown file tab → doesn't break layout
- [ ] Opening non-markdown file → still works
- [ ] Multiple markdown files open → tabs work correctly
- [ ] Closing all files → mode persists

### Automated Testing

Deferred to Phase 3 - Focus on manual validation for MVP.

---

## Performance Considerations

**Panel toggle overhead:** Each collapse/expand triggers shell layout recalculation. Use `requestAnimationFrame` (built into Theia) for smooth transitions.

**Storage access:** StorageService uses localStorage (synchronous). Mode preference is tiny (~10 bytes), no performance concern.

**Widget activation:** Activating widgets in panels triggers widget lifecycle. Minimal overhead for docs tree and AI chat.

**Debouncing:** If users rapidly toggle mode, consider debouncing the command (not required for MVP).

---

## Future Enhancements

**Phase 2 (If widget placement becomes a problem):**
- Custom ApplicationShell subclass
- Widget placement enforcement
- Dynamic layout switching

**Phase 3 (Accessibility & polish):**
- Alternative navigation for hidden menu bar
- Screen reader testing and ARIA improvements
- Visual mode indicator in UI
- First-run tutorial explaining modes
- Keyboard shortcut documentation overlay

**Phase 4 (Advanced features):**
- Per-project mode preference
- Multiple layout presets beyond simple/developer
- Workspace-specific customizations

---

## Implementation Timeline

**Week 1:**
- Create `packages/quallaa-core/` structure
- Implement `QuallaaModuleManager` contribution
- Implement toggle command and keybinding
- Basic testing

**Week 2:**
- Add animation workaround for side panels
- Configure Electron for custom title bar
- Comprehensive testing (all scenarios)
- Bug fixes

**Ready for user testing:** End of Week 2

**Decision point:** Proceed to Phase 2 only if user feedback shows widget placement is a significant problem.

---

## References

- **Research:** [../research/2025-01-theia-shell-customization-research.md](../research/2025-01-theia-shell-customization-research.md)
- **Decision:** [../DECISIONS.md#shell-customization-approach](../DECISIONS.md#shell-customization-approach)
- **Sprint Plan:** [../planning/CURRENT-SPRINT.md](../planning/CURRENT-SPRINT.md)
- **Theia Docs:** https://theia-ide.org/docs/
- **Arduino IDE 2.0:** https://github.com/arduino/arduino-ide (real-world example)
