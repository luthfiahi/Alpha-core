'use client';

import { X, RotateCcw } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { TradeFilters } from './types';
import { DEFAULT_FILTERS } from './types';

interface JournalFiltersProps {
  filters: TradeFilters;
  onFiltersChange: (filters: TradeFilters) => void;
  availablePairs: string[];
}

const DATE_RANGE_OPTIONS = [
  { value: '7d', label: '7d' },
  { value: '30d', label: '30d' },
  { value: '90d', label: '90d' },
  { value: 'all', label: 'All' },
];

const DIRECTION_OPTIONS = [
  { value: 'ALL', label: 'All' },
  { value: 'LONG', label: 'Long' },
  { value: 'SHORT', label: 'Short' },
];

const RESULT_OPTIONS = [
  { value: 'ALL', label: 'All' },
  { value: 'PROFIT', label: 'Win' },
  { value: 'LOSS', label: 'Loss' },
];

const REFLECTION_OPTIONS = [
  { value: 'ALL', label: 'All' },
  { value: 'true', label: 'Reflected' },
  { value: 'false', label: 'Unreflected' },
];

function ToggleButton({
  children,
  active,
  onClick,
  colorClass,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  colorClass?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        `inline-flex items-center rounded-lg px-2.5 py-1.5 text-xs font-medium
        transition-all duration-150 border alpha-press ` +
        (active
          ? colorClass || 'bg-[#6366F1]/15 border-[#6366F1]/30 text-[#818CF8]'
          : 'bg-transparent border-[#232636] text-[#6B7280] hover:border-[#6B7280]/50 hover:text-[#9CA3AF]')
      }
    >
      {children}
    </button>
  );
}

function ActiveFilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#6366F1]/10 border border-[#6366F1]/25 px-2 py-1 text-xs text-[#818CF8]">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="hover:text-[#F3F4F6] transition-colors duration-150 alpha-press w-4 h-4 rounded-full hover:bg-[#6366F1]/20 flex items-center justify-center"
      >
        <X className="size-2.5" />
      </button>
    </span>
  );
}

function getActiveFilterCount(filters: TradeFilters): number {
  let count = 0;
  if (filters.dateRange !== 'all') count++;
  if (filters.pair !== 'ALL') count++;
  if (filters.direction !== 'ALL') count++;
  if (filters.result !== 'ALL') count++;
  if (filters.hasReflected !== 'ALL') count++;
  return count;
}

export function JournalFilters({
  filters,
  onFiltersChange,
  availablePairs,
}: JournalFiltersProps) {
  const activeCount = getActiveFilterCount(filters);

  const updateFilter = <K extends keyof TradeFilters>(key: K, value: TradeFilters[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const resetFilters = () => {
    onFiltersChange({ ...DEFAULT_FILTERS });
  };

  return (
    <div className="space-y-2.5 alpha-animate-in-fast">
      {/* Filter label */}
      <div className="flex items-center gap-2">
        <span className="alpha-label text-[#9CA3AF] uppercase tracking-wider text-[10px]">Filter</span>
        <div className="flex-1 h-px bg-[#232636]" />
      </div>
      {/* Filter Controls — compact single row, scrollable on mobile */}
      <div className="flex flex-wrap items-center gap-2 overflow-x-auto scrollbar-none">
        {/* Date Range */}
        <Select
          value={filters.dateRange}
          onValueChange={(v) => updateFilter('dateRange', v)}
        >
          <SelectTrigger className="w-[100px] h-8 text-xs bg-[#151827] border-[#232636] rounded-lg alpha-focus-ring hover:border-[#6366F1]/30 hover:shadow-[0_0_8px_rgba(99,102,241,0.08)] transition-all duration-150">
            <SelectValue placeholder="Period" />
          </SelectTrigger>
          <SelectContent className="bg-[#151827] border-[#232636]">
            {DATE_RANGE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value} className="text-xs">
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Pair Filter */}
        <Select
          value={filters.pair}
          onValueChange={(v) => updateFilter('pair', v)}
        >
          <SelectTrigger className="w-[130px] h-8 text-xs bg-[#151827] border-[#232636] rounded-lg alpha-focus-ring hover:border-[#6366F1]/30 hover:shadow-[0_0_8px_rgba(99,102,241,0.08)] transition-all duration-150">
            <SelectValue placeholder="Pair" />
          </SelectTrigger>
          <SelectContent className="bg-[#151827] border-[#232636]">
            <SelectItem value="ALL" className="text-xs">
              All Pairs
            </SelectItem>
            {availablePairs.map((pair) => (
              <SelectItem key={pair} value={pair} className="text-xs font-financial">
                {pair}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Separator */}
        <div className="w-px h-5 bg-[#232636] hidden sm:block" />

        {/* Direction Toggles */}
        {DIRECTION_OPTIONS.map((opt) => (
          <ToggleButton
            key={opt.value}
            active={filters.direction === opt.value}
            onClick={() => updateFilter('direction', opt.value)}
            colorClass={
              opt.value === 'LONG'
                ? 'bg-[#22C55E]/15 border-[#22C55E]/30 text-[#22C55E]'
                : opt.value === 'SHORT'
                ? 'bg-[#EF4444]/15 border-[#EF4444]/30 text-[#EF4444]'
                : undefined
            }
          >
            {opt.label}
          </ToggleButton>
        ))}

        {/* Separator */}
        <div className="w-px h-5 bg-[#232636] hidden sm:block" />

        {/* Result Toggles */}
        {RESULT_OPTIONS.map((opt) => (
          <ToggleButton
            key={opt.value}
            active={filters.result === opt.value}
            onClick={() => updateFilter('result', opt.value)}
            colorClass={
              opt.value === 'PROFIT'
                ? 'bg-[#22C55E]/15 border-[#22C55E]/30 text-[#22C55E]'
                : opt.value === 'LOSS'
                ? 'bg-[#EF4444]/15 border-[#EF4444]/30 text-[#EF4444]'
                : undefined
            }
          >
            {opt.label}
          </ToggleButton>
        ))}

        {/* Separator */}
        <div className="w-px h-5 bg-[#232636] hidden sm:block" />

        {/* Reflection Toggles */}
        {REFLECTION_OPTIONS.map((opt) => (
          <ToggleButton
            key={opt.value}
            active={filters.hasReflected === opt.value}
            onClick={() => updateFilter('hasReflected', opt.value)}
            colorClass={
              opt.value === 'true'
                ? 'bg-[#22C55E]/15 border-[#22C55E]/30 text-[#22C55E]'
                : opt.value === 'false'
                ? 'bg-[#F59E0B]/15 border-[#F59E0B]/30 text-[#F59E0B]'
                : undefined
            }
          >
            {opt.label}
          </ToggleButton>
        ))}
      </div>

      {/* Active Filters */}
      {activeCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="alpha-caption text-[#6B7280]">Active:</span>
          {filters.dateRange !== 'all' && (
            <ActiveFilterChip
              label={DATE_RANGE_OPTIONS.find((o) => o.value === filters.dateRange)?.label || filters.dateRange}
              onRemove={() => updateFilter('dateRange', 'all')}
            />
          )}
          {filters.pair !== 'ALL' && (
            <ActiveFilterChip label={filters.pair} onRemove={() => updateFilter('pair', 'ALL')} />
          )}
          {filters.direction !== 'ALL' && (
            <ActiveFilterChip
              label={filters.direction}
              onRemove={() => updateFilter('direction', 'ALL')}
            />
          )}
          {filters.result !== 'ALL' && (
            <ActiveFilterChip
              label={filters.result === 'PROFIT' ? 'Win' : 'Loss'}
              onRemove={() => updateFilter('result', 'ALL')}
            />
          )}
          {filters.hasReflected !== 'ALL' && (
            <ActiveFilterChip
              label={filters.hasReflected === 'true' ? 'Reflected' : 'Unreflected'}
              onRemove={() => updateFilter('hasReflected', 'ALL')}
            />
          )}
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex items-center gap-1 text-xs text-[#6B7280] hover:text-[#9CA3AF] transition-colors duration-150 ml-1 alpha-press"
          >
            <RotateCcw className="size-3" />
            Reset
          </button>
        </div>
      )}
    </div>
  );
}
