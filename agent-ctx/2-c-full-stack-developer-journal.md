# Task 2-c: Journal Module

## Agent: full-stack-developer (Journal)

## What was built:

### API Routes
- `/src/app/api/trades/route.ts` — GET (list with filters/pagination) + POST (create trade)
- `/src/app/api/trades/[id]/route.ts` — GET (single), PUT (update + reflection), DELETE (soft delete)

### Components (src/components/alpha/journal/)
- `types.ts` — TradeItem, TradeFilters, TradesResponse types, utility functions
- `JournalFilters.tsx` — Sticky filter bar: date range, pair, direction chips, result chips, reflection filter, active filter chips with reset
- `TradeTableView.tsx` — Compact table with: date, pair, direction badge, entry/exit prices, P/L (colored), score badge, reflection icon, action dropdown menu
- `TradeCardView.tsx` — Visual cards in responsive grid (1/2/3 cols), with tags and hover effects
- `JournalPage.tsx` — Main journal: header, view toggle (table/card saved in localStorage), filters, trade list, pagination, empty state, delete dialog
- `JournalNewPage.tsx` — New trade form: pair, direction toggle, timeframe, strategy, prices, SL/TP/lot, plan notes, emotion, tags (multi-select chips), screenshot upload (drag&drop + preview), live preview panel
- `JournalDetailPage.tsx` — Detail view: header with pair/direction/status badges, trade data grid, result (P/L/pips/duration), screenshot, process score ring, reflection section (read + edit), timeline
- `index.ts` — Barrel exports

### Integration
- Updated `src/app/page.tsx` to route between journal, journal-new, journal-detail pages using useNavigationStore

## Design System Compliance:
- Dark theme: #0B0D17 bg, #151827 surface, #232636 border
- Primary: #6366F1, Success: #22C55E, Warning: #F59E0B, Error: #EF4444
- font-financial (JetBrains Mono) for all financial numbers
- alpha-card and alpha-card-interactive classes
- rounded-[14px] card border-radius

## Key Technical Decisions:
- React Query for all data fetching (useQuery, useMutation, invalidateQueries)
- react-hook-form + zod for form validation
- Screenshot stored as base64 in screenshotUrl field
- Soft delete via deletedAt timestamp
- Filter state reset pagination via handleFiltersChange callback
- View mode persisted to localStorage
- Process Score ring SVG with CSS animation from globals.css
