# Task 2-b: Fix Error States in Analytics Components

## Changes Made

### 1. GrowthTimeline.tsx
- Added `error` state (`useState<string | null>(null)`)
- Added imports: `AlertTriangle`, `RefreshCw` from lucide-react; `Button` from ui/button; `Card`, `CardContent` from ui/card
- In `fetchData`: added `setError(null)` at start of try, `setError('Gagal memuat data')` in catch
- Added error UI block before main return: centered Card with `min-h-[200px]`, AlertTriangle icon, "Gagal memuat data" message, "Coba Lagi" button calling `fetchData(period)`

### 2. WeeklyReviewTab.tsx
- Added `error` state (`useState<string | null>(null)`)
- Added imports: `Card`, `CardContent` from ui/card
- In `fetchCurrent`: added `setError(null)` at start of try, `setError('Gagal memuat data')` in catch (line ~214)
- In `fetchReviews`: added `setError('Gagal memuat data')` in catch (line ~226)
- Created `handleRetry` callback that resets error, sets loading, and re-fetches both current + reviews
- Added error UI block before loading skeleton: same pattern as GrowthTimeline

### 3. BehavioralInsights.tsx
- Added `error` state (`useState<string | null>(null)`)
- Added imports: `AlertTriangle`, `RefreshCw` from lucide-react; `Card`, `CardContent` from ui/card
- In `fetchData`: added `setError(null)` at start of try, `setError('Gagal memuat data')` in catch (line ~116)
- Added error UI block before loading skeleton: same pattern, button calls `fetchData` directly

### 4. ScoreCard.tsx
- Removed `const displayScore = score ?? 0`
- Score display now checks `score !== null && score !== undefined`: shows score value when present, shows "—" when null/undefined
- Color also degrades to `#4B5563` (muted gray) when score is null/undefined

## Design Consistency
All error cards use the same pattern:\n- Outer wrapper: `flex items-center justify-center min-h-[200px]`
- Card: `rounded-xl border-[#1E2030] bg-[#151827] shadow-none py-0 gap-0`
- CardContent: `flex flex-col items-center justify-center py-8 px-6`
- AlertTriangle icon in amber-400
- Message text in `#9CA3AF`
- "Coba Lagi" button with outline variant, `#232636` border, dark hover

## Verification
- ESLint: 0 errors (1 pre-existing warning in unrelated file)
- Dev server: no compilation errors
