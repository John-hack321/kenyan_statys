---
name: african-spaces-design-review
description: Audit the design, accessibility and UX consistency of existing African Spaces screens and components and report rated findings with a Design Score and an AI-slop score. Use this skill whenever the user asks to review, audit, critique, check, grade, "what's wrong with" or "is this good" for any screen, component, flow or the whole app UI, when they share a screenshot and ask what to improve, when they ask about accessibility, touch targets, contrast, consistency or "does this look AI-made", and before a release. Reports only; it changes code only when the user explicitly asks for fixes.
---

# African Spaces design review (audit)

You audit. You do **not** edit code in review mode. The standard is `DESIGN.md` (tokens, hard floors, local context, known deviations) plus the shared references. Be honest: do not invent findings to look thorough and do not inflate scores.

Everything in `AGENTS.md` still applies, especially: say what you did not run or verify.

## Step 1: Scope

Ask for scope only if it is not clear. Good scopes: one screen, one flow (host wizard, verification), the feed, or "whole app" (then work flow by flow, never all at once). Default if the owner just says "review": the host wizard, then the home feed.

## Step 2: Gather evidence

1. Read `DESIGN.md` fully, especially sections 5 (floors), 9 (known deviations) and 10 (last review).
2. Read every file in scope **completely**. Do not judge from filenames.
3. Run the grep checklist in `.claude/skills/_shared/references/tells.md` if you have a shell on the repo. If you only have pasted files or screenshots, say so and review what you can see.
4. If the owner sent a screenshot, review what is visible and say what you cannot tell from an image (touch target size, scroll behaviour, motion, TalkBack).

## Step 3: Run the passes

Use `.claude/skills/_shared/references/review-rubric.md` for the six passes, severities, finding format, scoring and the Trunk Test. Use `.claude/skills/_shared/references/platform-rules.md` for the standards behind each floor, and `tells.md` for the AI-slop list.

Do not re-report a deviation already listed in `DESIGN.md` section 9 as "new". Mark it **known (DESIGN.md 9 #n)** and only add detail if you found more instances.

## Step 4: Report (in chat, this shape)

1. **Verdict in two sentences.** What is strong, what is the biggest risk.
2. **Scores:** Design Score /100 (with the six pass subtotals) and AI-slop score A to D with the T-numbers.
3. **Findings** grouped P0, P1, P2, P3, each in the finding format (Where, Rule, Why, Fix, Verified by).
4. **What I could not check** (device behaviour, screen reader, small screens, font scale, dark mode, slow network). Be specific.
5. **Suggested order of fixes** (at most five, smallest and highest value first).
6. **Offer:** "Want me to fix the P0/P1s one component at a time?"

Keep it scannable. No filler praise. If a scope is clean, say it is clean.

## Step 5: Record the baseline (only after the owner has seen the report)

- Add a row to `DESIGN.md` section 10 (date, scope, Design Score, AI-slop score, one-line note).
- Add a `buildLog.md` changelog entry (top) summarising the review and listing the findings the owner chose to fix or defer. Say which AI ran it.

Deliver these two edits as files with exact paths, per `AGENTS.md`, or as exact paste-in blocks if the file is not on disk.

## Fix mode (opt-in only)

When the owner says "fix them":
- One component or screen at a time, smallest edit that resolves the finding. No drive-by refactors, no mass search-and-replace across the app.
- Keep project patterns (`AppText`, `rs/rv/rm`, `COLORS`, existing components). Do not introduce `Pressable`, new colours, or new libraries as a "fix".
- After each fix: say what changed, how to check it, and what was not run.
- Remove the fixed row from `DESIGN.md` section 9 and log the change in `buildLog.md`.
- Anything needing a design decision (new token, dial change, navigation change) goes back to the owner first.

## Things this skill must never do

- Edit files during a review.
- Claim a contrast ratio, target size or device behaviour it did not compute or see.
- Treat a known deviation as a surprise, or treat a deliberate project decision (`DESIGN.md` section 7) as a bug. If a decision looks wrong, raise it as a question, not a finding.
- Touch database, SQL, RLS or Edge Functions. Design reviews stop at the UI.