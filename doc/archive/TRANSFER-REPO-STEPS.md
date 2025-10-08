# Repository Transfer Instructions

## Transfer to Quallaa-AI Organization

### Step 1: Transfer on GitHub (Web Interface)

1. Go to: https://github.com/jefftoffoli/Quallaa-Native/settings
2. Scroll to **"Danger Zone"** section at the bottom
3. Click **"Transfer ownership"**
4. Enter new owner: `Quallaa-AI`
5. Optionally rename repository to: `quallaa-desktop` or keep as `Quallaa-Native`
6. Type the repository name to confirm
7. Click **"I understand, transfer this repository"**

### Step 2: Update Local Git Remote

After transfer is complete, run these commands:

```bash
# Remove old remote
git remote remove origin

# Add new organization remote
git remote add origin https://github.com/Quallaa-AI/Quallaa-Native.git

# Verify remotes are correct
git remote -v

# Push your branch to the new remote
git push -u origin feature/quallaa-rebrand-macos
```

### Step 3: Make Repository Private (Important!)

1. Go to: https://github.com/Quallaa-AI/Quallaa-Native/settings
2. Scroll to **"Danger Zone"**
3. Click **"Change repository visibility"**
4. Select **"Make private"**
5. Type repository name to confirm
6. Click **"I understand, make this repository private"**

### Step 4: Configure Repository Settings

1. **Branch Protection** (Optional but recommended):
   - Settings → Branches → Add rule
   - Branch name pattern: `master`
   - Enable: "Require pull request reviews before merging"

2. **Team Access**:
   - Settings → Manage access
   - Add team members with appropriate roles

## Why This Structure?

### Current Setup (After Transfer)
- **Private repo**: `Quallaa-AI/Quallaa-Native`
  - Contains Theia platform + Quallaa modifications
  - Private during development
  - Will be split before commercial launch

### Future Setup (Before Commercial Launch)

**Public Repo** (EPL 2.0 Compliance):
- `Quallaa-AI/quallaa-theia-core` (public)
- Contains only modified Theia platform files
- Open source, EPL 2.0 licensed
- Provides source access as required by EPL

**Private Repo** (Proprietary):
- `Quallaa-AI/quallaa-desktop` (private)
- Your proprietary extensions
- UI customizations
- AI integrations
- Domain-specific features
- Commercial license

## EPL 2.0 Compliance Strategy

### What Stays Open Source (EPL 2.0)
- Modified Theia core files
- Modified Theia extension files
- Any file that originated from Eclipse Theia

### What Can Be Proprietary
- New extensions in separate files
- Custom UI components (separate files)
- AI integrations (separate modules)
- Domain-specific tools
- Compiled binary (DMG installer)

### Key Principle
**File-level copyleft**: Only modified Theia *files* must remain EPL 2.0.
Your new files can be proprietary.

## Timeline

- **Now - MVP**: Private repo, rapid development
- **Before Public Beta**: Split repos, EPL compliance setup
- **Commercial Launch**: Public EPL repo + Private proprietary repo

## Notes

- Keep LICENSE-EPL in the public repo
- Add LICENSE-COMMERCIAL.txt to proprietary repo
- Document which packages are EPL vs proprietary
- "Built on Eclipse Theia" attribution in About dialog (required)
