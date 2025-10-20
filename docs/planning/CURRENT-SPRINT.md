# Current Sprint

**Sprint Goal:** Validate and implement simple/developer mode toggle
**Dates:** 2025-01-19 to 2025-01-26
**Status:** Implementation phase

---

## 🔬 Research Tasks

### Theia Shell Customization Research
- **Status:** ✅ Complete (2025-01-19)
- **Goal:** Validate that ApplicationShell panel APIs are the correct approach for toggling between simple mode and developer mode
- **Deliverable:** `docs/research/2025-01-theia-shell-customization-research.md`

**Key Findings:**
1. ✅ Approach validated - Arduino IDE 2.0 uses this pattern in production
2. 🔧 Critical fix: Use `topPanel.hide()` not `collapsePanel('top')`
3. ⚠️ Animation workaround needed: 50ms duration for side panels
4. ⚠️ Widget placement concern: users can drag into collapsed panels (defer to Phase 2)
5. 📋 Recommendation: Start with Phase 1 (simple API), validate with users before Phase 2

**Decision Updated:** [../DECISIONS.md#shell-customization-approach](../DECISIONS.md#shell-customization-approach)

---

## 🛠️ Implementation Tasks

**Status:** 🚀 Ready to start (research validated, approach approved)

Once research validates the approach:

- [ ] Create `packages/quallaa-core/` package structure
  - Frontend module
  - Dependency injection bindings
  - Package.json and tsconfig

- [ ] Implement `QuallaaShellLayoutContribution`
  - `FrontendApplicationContribution` interface
  - `enterSimpleMode()` method (hide panels, show docs tree + AI chat)
  - `enterDeveloperMode()` method (show all panels)
  - `onDidInitializeLayout()` hook to set initial state

- [ ] Implement mode toggle command
  - Register command: `quallaa.toggleDeveloperMode`
  - Store preference in `StorageService`
  - Add keybinding: `Ctrl+Shift+D` (macOS: `Cmd+Shift+D`)
  - Add menu item (optional)

- [ ] Test implementation
  - Simple mode on first launch
  - Toggle to developer mode works
  - Preference persists after app restart
  - No console errors or layout glitches
  - Test in Electron app (macOS)

---

## 📝 Documentation Tasks

- [x] Organize `docs/` directory structure
- [x] Create `docs/README.md` (knowledge base index)
- [x] Create `docs/DECISIONS.md` (architecture decision record)
- [x] Create `docs/planning/CURRENT-SPRINT.md` (this file)
- [ ] Create `docs/research/` directory with placeholder for incoming research
- [ ] Write `docs/architecture/shell-modes-design.md` (after research validates approach)
- [ ] Update `CLAUDE.md` with shell mode implementation guide (after implementation complete)

---

## 🎯 Definition of Done

Sprint is complete when:

**Simple Mode:**
- [ ] User opens Quallaa for first time → sees simple mode
  - Docs tree visible on left (markdown files only)
  - Main editor in center (Monaco)
  - AI chat visible on right
  - Menu bar hidden
  - Bottom panel (terminal/problems) hidden

**Developer Mode Toggle:**
- [ ] User presses `Ctrl+Shift+D` → switches to developer mode
  - Menu bar appears
  - Bottom panel (terminal) appears
  - File explorer, search, git available in left panel
  - All standard IDE functionality accessible

**Persistence:**
- [ ] Mode preference saves to storage
- [ ] Quitting and restarting app preserves mode choice
- [ ] User's widget layout within each mode is preserved

**Quality:**
- [ ] No console errors during mode switching
- [ ] No visual glitches during panel collapse/expand
- [ ] Smooth transitions (no flickering)
- [ ] Works on macOS (primary platform for MVP)

---

## 🚧 Blockers

### Active Blockers:
✅ **None** - Research validation complete, ready to implement

### Resolved Blockers:
1. **Research Validation** ✅ Complete (2025-01-19)
   - Approach validated by research
   - Critical corrections identified
   - Implementation plan approved

### Potential Future Blockers:
- Code signing for macOS (not blocking for local development)
- Windows/Linux testing (deferred to post-MVP)

---

## 📌 Notes

### Technical Decisions Made:
- Using `FrontendApplicationContribution` lifecycle hooks (not custom shell subclass)
- Simple mode = default for all users (no user preference on first launch)
- Developer mode reveals full IDE (not a separate "power user" build)

### Scope Boundaries:
- MVP focuses on Electron app (desktop) only
- Browser deployment validation deferred to later sprint
- No custom theme/styling in this sprint (use default Theia dark theme)
- No progressive disclosure UI hints (e.g., "Try developer mode!") - just the toggle

### Implementation Philosophy:
- Keep it minimal - proof of concept quality
- Use existing widgets (don't build custom ones yet)
- Acceptable to have rough edges (e.g., no animated transitions)
- Focus on functional correctness over polish

---

## 📅 Sprint Timeline

**Day 1 (2025-01-19):**
- [x] Organize docs structure
- [x] Create knowledge base files (README, DECISIONS, CURRENT-SPRINT)
- [ ] Receive research validation
- [ ] Update DECISIONS.md based on research findings

**Day 2-3 (2025-01-20 to 2025-01-21):**
- [ ] Create `packages/quallaa-core/` structure
- [ ] Implement `QuallaaShellLayoutContribution`
- [ ] Test simple mode initialization

**Day 4-5 (2025-01-22 to 2025-01-23):**
- [ ] Implement toggle command
- [ ] Test mode switching
- [ ] Fix any layout bugs

**Day 6-7 (2025-01-24 to 2025-01-26):**
- [ ] Test persistence across restarts
- [ ] Write architecture documentation
- [ ] Update knowledge base with learnings

---

## 🔄 Next Sprint Preview

After this sprint completes, next priorities are:
1. Polish simple mode UI (remove visual clutter, clean up docs tree)
2. Add visual indicator for "developer mode available" (subtle hint)
3. Test on Windows and Linux
4. Begin browser deployment exploration

---

## 📊 Success Metrics

**Qualitative:**
- Can a non-technical user open Quallaa and edit markdown without seeing "IDE"?
- Can a technical user access full IDE when needed?

**Quantitative:**
- Zero console errors during mode switching
- Mode persistence: 100% reliable across restarts
- Simple mode startup: Under 10 seconds (desktop)

---

**Last Updated:** 2025-01-19
**Next Review:** 2025-01-20 (after research results)
