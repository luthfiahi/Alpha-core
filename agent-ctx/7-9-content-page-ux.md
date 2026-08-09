# Task 7-9: Content Page UX Polish

## Changes Summary

### 1. AppLayout.tsx
- Changed `<main>` to `<div role="main">` to avoid nested `<main>` elements (root layout already has `<main>`)
- Added `pb-12` to the scrollable content div for bottom padding
- `journal-detail` label already existed in `pageLabels` map — confirmed present
- Removed `alpha-animate-fade` class from MobileHeader (was re-animating on every React re-render). Replaced with static `opacity: 1` via inline style

### 2. AppSidebar.tsx
- Changed AI Coach nav item `badge: true` to `badge: false` to remove the misleading always-visible ping notification dot

### 3. TradingDNAPage.tsx
- Removed `grid grid-cols-1 lg:grid-cols-2 gap-6` wrapper around `StrengthsWeaknesses` (was wasting half the desktop space with a single child). Now just `<div className="alpha-animate-in alpha-stagger-2">`
- Added `Loader2` icon with `animate-spin` class on the "Generate DNA" button when `isGenerating` is true
- Added `toast.error('Gagal generate DNA')` in the catch block of `handleGenerate` (imported `toast` from `sonner`)
- Removed redundant `isLoading={isLoading}` prop from `IdentityCard`, `StrengthsWeaknesses`, `PerformancePatterns`, and `AISummary` in the content branch (isLoading is always false there)

### 4. AnalyticsPage.tsx
- Extracted the duplicated TabsTrigger className into a `TAB_TRIGGER_CLASS` constant at module level
- Added proper skeleton loading state to `MetricsRow`: when `!ready`, renders skeleton blocks matching the metric card layout (icon placeholder + label/value lines) instead of bare "—" dashes
- Added `pb-8` bottom padding to the page container

### 5. PlaybookPage.tsx
- Changed detail loading skeleton from card grid (`LoadingSkeleton`) to a single-column form/detail skeleton (title bar, description block, content block, checklist block)
- Merged `handleOpen`, `handleEdit`, `handleCreated` into a single `handleSelect` function
- Fixed language inconsistency: translated English empty-state strings to Indonesian:
  - "No matching playbooks" → "Tidak ada playbook yang cocok"
  - "No playbooks yet" → "Belum ada playbook"
  - "Try adjusting your filters or search query." → "Coba ubah filter atau kata pencarian."
  - "Create your first playbook..." → "Buat playbook pertamamu untuk mulai mendokumentasikan setup trading."
- Changed "Reset Filter" button text to "Atur Ulang"

## Lint Results
All 5 modified files pass lint with zero errors/warnings. The 2 pre-existing issues (WelcomeHero.tsx parse error, JournalNewPage.tsx incompatible-library warning) are unrelated to this task.