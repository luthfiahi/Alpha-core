# Task p1c — Add Consistent Hover/Focus States

## Summary
Added smooth, consistent hover and focus states across all interactive elements in the Alpha Trading Coach project. All changes are minimal and targeted.

## Files Modified

### 1. `src/components/alpha/dashboard/QuickActions.tsx`
- Added `transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]` to Button className
- Provides smooth hover scale-up and press scale-down effect

### 2. `src/components/alpha/AppSidebar.tsx`
- NavItemButton inactive state: added `hover:translate-x-0.5` for a subtle shift effect
- NavItemButton focus-visible: changed `focus-visible:ring-ring` → `focus-visible:ring-[#6366F1]` for explicit indigo focus ring matching the brand

### 3. `src/app/globals.css`
- Refined `.alpha-card-interactive` transition to use explicit property transitions (`border-color`, `box-shadow`, `transform`) instead of `all` for better performance
- Added subtle ring shadow on hover: `0 0 0 1px rgba(99,102,241,0.1)` for focus-like appearance
- Slightly reduced border opacity (0.4 → 0.35) and shadow opacity (0.32 → 0.28) for subtlety

### 4. `src/components/alpha/dashboard/RecentTrades.tsx`
- Changed TableRow hover from `hover:bg-white/[0.02]` → `hover:bg-white/[0.04]` for better visibility
- Added `transition-colors duration-150` for smooth transition

### 5. `src/components/alpha/journal/TradeTableView.tsx`
- Changed TableRow hover from `hover:bg-[#1E2030]/60` → `hover:bg-[#1E2030]/80` for more visible feedback
- Added explicit `duration-150` to match RecentTrades

### 6. `src/components/alpha/journal/JournalPage.tsx`
- Empty state CTA: Added `transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]` matching QuickActions
- Error retry button: Added `hover:opacity-90 transition-opacity`

## Lint Status
✅ No new errors (1 pre-existing warning unrelated to changes)
