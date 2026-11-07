# Review rubric

Used by `african-spaces-design-review`. The structure (passes, rated findings, two scores, a regression baseline) is inspired by the public draftbit/mobile-taste-skill review approach; the passes and weights here are written for this app.

## Contents
1. Passes
2. Severity
3. Finding format
4. Design Score math
5. The Trunk Test
6. What a review must never do

---

## 1. Passes (run in order, each yields findings)

| # | Pass | Looks for | Weight |
|---|---|---|---|
| 1 | **Floors** | `DESIGN.md` 5: touch targets, contrast, colour-only signals, semantics, four states, keyboard, safe areas | 30 |
| 2 | **System fit** | Tokens, `AppText`, `rs/rv/rm`, existing components reused, no second pattern (T22, T23) | 20 |
| 3 | **Hierarchy and layout** | One primary action, one title, spacing rhythm, no layout jumps (T9 to T11, T20) | 15 |
| 4 | **States and feedback** | Loading, empty, error with retry, success; slow/offline behaviour | 15 |
| 5 | **Copy and local context** | Plain sentence case, KSh, honest claims, errors that help (T14 to T18) | 10 |
| 6 | **Motion and performance** | Reduced motion, UI-thread animation, list and image hygiene on low-end Android | 10 |

Always read the actual file before judging it. Never rate from filenames or from memory of what a screen "probably" looks like.

## 2. Severity

| Level | Meaning | Examples |
|---|---|---|
| **P0** | Blocks use or breaks trust/safety | Control unreachable with keyboard open; error shown only as red; sensitive data on screen/log; target under 32 dp |
| **P1** | Breaks a hard floor or a core pattern | Target 36 dp without hitSlop; meaningful `text-gray-400`; no empty/error state; missing roles |
| **P2** | Consistency or polish problem | Inline hex; raw `<Text>`; `$` instead of KSh; no placeholder image |
| **P3** | Nice to have | Skeleton instead of spinner; motion polish |

## 3. Finding format

One finding per issue, grouped by severity. Keep each to a few lines.

```
[P1] SaveAndExitButton: 36 dp tall, no hitSlop
Where: src/components/ventureFlowButtons.tsx (SaveAndExitButton)
Rule: DESIGN.md 5.1 (touch target)
Why it matters: thumb misses on small phones; first-time hosts tap this often.
Fix: height rm(44) or add hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}.
Verified by: read the code (not run on device).
```

Always end a finding with how it was verified: **read the code**, **ran grep**, **seen in a screenshot the owner sent**, or **ran on device** (rare). Never claim "on device" unless the owner said so.

## 4. Design Score math

Start each pass at its full weight. Deduct per finding in that pass: P0 −10, P1 −4, P2 −1.5, P3 −0.5, but never below 0 for the pass. Sum the passes for a score out of 100.

| Score | Reading |
|---|---|
| 90 to 100 | Ship it |
| 75 to 89 | Good; fix P1s |
| 60 to 74 | Needs a pass before more features |
| below 60 | Stop and fix foundations |

Report alongside the **AI-slop score** (A to D from `tells.md`). Write both into `DESIGN.md` section 10 (the regression baseline) and the `buildLog.md` changelog entry, so the next review can say whether things got better.

## 5. The Trunk Test (quick sanity check per screen)

Cover everything except what is visible without scrolling and answer, in a few seconds:
1. Where am I? (title)
2. What can I do here? (the primary action)
3. What happens next? (button label or helper sentence)
4. How do I get out? (Back / close)

Any "I cannot tell" is at least a P2 finding on hierarchy.

## 6. What a review must never do

- Never edit files in review mode. Reviews report. Fixes are a separate, opt-in step.
- Never mass-change the app. In fix mode: one component or screen at a time, smallest edit, tell the owner what changed, update `DESIGN.md` section 9 (remove fixed deviations) and `buildLog.md`.
- Never invent findings to look thorough, and never inflate a score. If a scope is clean, say so.
- Never claim contrast numbers you did not compute. Quote the ones in `DESIGN.md` or compute with a real formula and show it.