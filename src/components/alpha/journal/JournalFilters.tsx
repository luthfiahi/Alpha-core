'use client';

import { X, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  { value: '7d', label: '7 Hari' },
  { value: '30d', label: '30 Hari' },
  { value: '90d', label: '90 Hari' },
  { value: 'all', label: 'Semua' },
];

const DIRECTION_OPTIONS = [
  { value: 'ALL', label: 'Semua' },
  { value: 'LONG', label: 'Long' },
  { value: 'SHORT', label: 'Short' },
];

const RESULT_OPTIONS = [
  { value: 'ALL', label: 'Semua' },
  { value: 'PROFIT', label: 'Profit' },
  { value: 'LOSS', label: 'Loss' },
];

const REFLECTION_OPTIONS = [
  { value: 'ALL', label: 'Semua' },
  { value: 'true', label: 'Sudah Refleksi' },
  { value: 'false', label: 'Belum Refleksi' },
];

function Chip({
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
      className={`
        inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium
        transition-all duration-150 border alpha-press alpha-badge-interactive
        ${
          active
            ? `${colorClass || 'bg-[#6366F1]/15 border-[#6366F1]/40 text-[#818CF8]'}`
            : 'bg-transparent border-[#232636] text-[#9CA3AF] hover:border-[#9CA3AF]/40 hover:text-[#F3F4F6]'
        }
      `}
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
    <span className="inline-flex items-center gap-1 rounded-full bg-[#6366F1]/10 border border-[#6366F1]/25 px-2.5 py-1 text-xs text-[#818CF8] alpha-badge-interactive">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="hover:text-[#F3F4F6] transition-colors alpha-press"
      >
        <X className="size-3" />
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
    <div className="space-y-3 alpha-animate-in-fast">
      {/* Filter Controls */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Date Range */}
        <div className="space-y-1">
          <span className="alpha-caption">Periode</span>
          <Select
            value={filters.dateRange}
            onValueChange={(v) => updateFilter('dateRange', v)}
          >
            <SelectTrigger className="w-[130px] h-8 text-xs bg-[#151827] border-[#232636] alpha-focus-ring">
              <SelectValue placeholder="Periode" />
            </SelectTrigger>
            <SelectContent className="bg-[#151827] border-[#232636]">
              {DATE_RANGE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="text-xs">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Pair Filter */}
        <div className="space-y-1">
          <span className="alpha-caption">Pair</span>
          <Select
            value={filters.pair}
            onValueChange={(v) => updateFilter('pair', v)}
          >
            <SelectTrigger className="w-[130px] h-8 text-xs bg-[#151827] border-[#232636] alpha-focus-ring">
              <SelectValue placeholder="Pair" />
            </SelectTrigger>
            <SelectContent className="bg-[#151827] border-[#232636]">
              <SelectItem value="ALL" className="text-xs">
                Semua Pair
              </SelectItem>
              {availablePairs.map((pair) => (
                <SelectItem key={pair} value={pair} className="text-xs font-financial">
                  {pair}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Direction Chips */}
        <div className="flex items-center gap-1.5">
          <span className="alpha-caption mr-1">Arah</span>
          {DIRECTION_OPTIONS.map((opt) => (
            <Chip
              key={opt.value}
              active={filters.direction === opt.value}
              onClick={() => updateFilter('direction', opt.value)}
              colorClass={
                opt.value === 'LONG'
                  ? 'bg-[#22C55E]/15 border-[#22C55E]/40 text-[#22C55E]'
                  : opt.value === 'SHORT'
                  ? 'bg-[#EF4444]/15 border-[#EF4444]/40 text-[#EF4444]'
                  : undefined
              }
            >
              {opt.label}
            </Chip>
          ))}
        </div>

        {/* Result Chips */}
        <div className="flex items-center gap-1.5">
          <span className="alpha-caption mr-1">Hasil</span>
          {RESULT_OPTIONS.map((opt) => (
            <Chip
              key={opt.value}
              active={filters.result === opt.value}
              onClick={() => updateFilter('result', opt.value)}
              colorClass={
                opt.value === 'PROFIT'
                  ? 'bg-[#22C55E]/15 border-[#22C55E]/40 text-[#22C55E]'
                  : opt.value === 'LOSS'
                  ? 'bg-[#EF4444]/15 border-[#EF4444]/40 text-[#EF4444]'
                  : undefined
              }
            >
              {opt.label}
            </Chip>
          ))}
        </div>

        {/* Reflection Filter */}
        <div className="space-y-1">
          <span className="alpha-caption">Refleksi</span>
          <Select
            value={filters.hasReflected}
            onValueChange={(v) => updateFilter('hasReflected', v)}
          >
            <SelectTrigger className="w-[150px] h-8 text-xs bg-[#151827] border-[#232636] alpha-focus-ring">
              <SelectValue placeholder="Refleksi" />
            </SelectTrigger>
            <SelectContent className="bg-[#151827] border-[#232636]">
              {REFLECTION_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="text-xs">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Filters */}
      {activeCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="alpha-caption">Filter aktif:</span>
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
              label={filters.result === 'PROFIT' ? 'Profit' : 'Loss'}
              onRemove={() => updateFilter('result', 'ALL')}
            />
          )}
          {filters.hasReflected !== 'ALL' && (
            <ActiveFilterChip
              label={filters.hasReflected === 'true' ? 'Sudah Refleksi' : 'Belum Refleksi'}
              onRemove={() => updateFilter('hasReflected', 'ALL')}
            />
          )}
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex items-center gap-1 alpha-caption text-[#9CA3AF] hover:text-[#F3F4F6] transition-colors ml-1 alpha-press"
          >
            <RotateCcw className="size-3" />
            Reset
          </button>
        </div>
      )}
    </div>
  );
}
