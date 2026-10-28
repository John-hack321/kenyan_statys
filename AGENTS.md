# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

---

# Project Context

**Claude users**: Also see CLAUDE.md for Claude-specific instructions.

---

**READ buildLog.md FIRST** before making any changes to this project.

The buildLog.md file contains:
- What the app is and what we're building
- How it's built (stack, architecture, conventions)
- Current status and known issues
- Database schema information
- Roadmap

## MANDATORY: Update buildLog.md for all significant changes

When you make changes that affect:
- **Architecture** (how components connect, data flow, auth flow, etc.)
- **Data** (database schema, store shapes, API contracts)
- **Design** (UI patterns, styling approach, component structure)
- **Behaviour** (user flows, feature logic, auth logic, etc.)
- **Any compromises or workarounds** you implement

You MUST update buildLog.md in the same session:

1. Add a new entry at the **TOP** of the "Changelog" section (newest first)
2. If your change makes another section in buildLog.md incorrect, fix that section too
3. Do not only append — fix outdated information
4. Mark anything you did not verify as **(unverified)**

## Before starting work

1. Read buildLog.md completely
2. Check the Changelog for recent changes
3. Review the "Architecture" section if touching data/flow
4. Review the "Conventions" section before writing code
5. Check "Known issues" to avoid introducing new problems

## File name

The file is `buildLog.md` (lowercase 'L'), not `BUILD_LOG.md`.
