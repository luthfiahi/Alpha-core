# Task p1a — full-stack-developer

## Summary
P1 UX improvement: Better empty states for two dashboard components.

## Files Changed
1. `src/components/alpha/dashboard/ProcessScoreCard.tsx` — Null-score empty state with dashed ring, "—", Indonesian messaging
2. `src/components/alpha/dashboard/WeeklyProgress.tsx` — Empty data array shows centered icon + message

## Key Decisions
- Used early-return pattern for ProcessScoreCard null state to avoid conditional rendering complexity in the ring SVG
- Kept motion.circle import (used in the hasData branch) — no unused import warning
- ReflectionGapSummary skipped per task instructions

## Lint
0 errors, 1 pre-existing warning (unrelated JournalNewPage.tsx)
