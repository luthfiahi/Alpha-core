'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Plus,
  LayoutList,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useNavigationStore } from '@/stores';
import { JournalFilters } from './JournalFilters';
import { TradeTableView } from './TradeTableView';
import { TradeCardView } from './TradeCardView';
import type { TradeFilters as TradeFiltersType, TradesResponse } from './types';
import { DEFAULT_FILTERS, getDateRange } from './types';

const PAGE_SIZE = 15;

function EmptyState({ onNavigate }: { onNavigate: () => void }) {
  return (
    <div className='flex flex-col items-center justify-center py-24 text-center'>
      <div className='size-20 rounded-2xl flex items-center justify-center mb-5 relative overflow-hidden'>
        <div className='absolute inset-0 animate-pulse' style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15))' }} />
        <BookOpen className='size-9 text-[#818CF8] relative z-10' />
      </div>
      <h3 className='text-base font-semibold text-[#F3F4F6] mb-1.5'>No trades yet</h3>
      <p className='alpha-caption max-w-xs text-[#9CA3AF]'>
        Belum ada trade yang dicatat. Mulai catat trade pertamamu untuk membangun disiplin dan jejak refleksi.
      </p>
      <Button
        onClick={onNavigate}
        className='mt-6 bg-[#6366F1] hover:bg-[#818CF8] text-white font-medium alpha-press'
      >
        <Plus className='size-4 mr-1.5' />
        Log Trade
      </Button>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className='space-y-4'>
      {/* Filter bar skeleton */}
      <div className='flex gap-2'>
        <Skeleton className='h-8 w-[120px] bg-[#151827] rounded-lg' />
        <Skeleton className='h-8 w-[120px] bg-[#151827] rounded-lg' />
        <Skeleton className='h-8 w-[200px] bg-[#151827] rounded-lg' />
      </div>
      {/* Table skeleton */}
      <div className='alpha-card overflow-hidden'>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className='flex items-center gap-4 px-4 py-3 border-b border-[#232636]/60'
          >
            <Skeleton className='h-4 w-20 bg-[#1E2030]' />
            <Skeleton className='h-5 w-14 bg-[#1E2030] rounded-md' />
            <Skeleton className='h-4 w-20 bg-[#1E2030]' />
            <Skeleton className='h-4 w-16 bg-[#1E2030] ml-auto' />
            <Skeleton className='h-5 w-8 bg-[#1E2030] rounded-md' />
            <Skeleton className='h-5 w-20 bg-[#1E2030] rounded-md' />
            <Skeleton className='h-4 w-8 bg-[#1E2030] rounded' />
          </div>
        ))}
      </div>
    </div>
  );
}

export function JournalPage() {
  const navigate = useNavigationStore((s) => s.navigate);
  const selectTrade = useNavigationStore((s) => s.selectTrade);
  const queryClient = useQueryClient();

  // View mode (persisted in localStorage)
  const [viewMode, setViewMode] = useState<'table' | 'card'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('alpha-journal-view') as 'table' | 'card') || 'table';
    }
    return 'table';
  });

  // Filters
  const [filters, setFilters] = useState<TradeFiltersType>({ ...DEFAULT_FILTERS });

  // Pagination
  const [page, setPage] = useState(1);

  // Handle filter change — also reset page
  const handleFiltersChange = useCallback((newFilters: TradeFiltersType) => {
    setFilters(newFilters);
    setPage(1);
  }, []);

  // Delete dialog
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Persist view mode
  useEffect(() => {
    localStorage.setItem('alpha-journal-view', viewMode);
  }, [viewMode]);

  // Build query params
  const queryParams = useMemo(() => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: PAGE_SIZE.toString(),
    });
    if (filters.pair !== 'ALL') params.set('pair', filters.pair);
    if (filters.direction !== 'ALL') params.set('direction', filters.direction);
    if (filters.result !== 'ALL') params.set('result', filters.result);
    if (filters.hasReflected !== 'ALL') params.set('hasReflected', filters.hasReflected);
    const { dateFrom, dateTo } = getDateRange(filters.dateRange);
    if (dateFrom) params.set('dateFrom', dateFrom);
    if (dateTo) params.set('dateTo', dateTo);
    return params.toString();
  }, [filters, page]);

  // Fetch trades
  const { data, isLoading, isError } = useQuery<TradesResponse>({
    queryKey: ['trades', queryParams],
    queryFn: async () => {
      const res = await fetch(`/api/trades?${queryParams}`);
      if (!res.ok) throw new Error('Gagal memuat data trade');
      return res.json();
    },
  });

  const trades = data?.trades || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 0;
  const availablePairs = data?.filters?.availablePairs || [];

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/trades/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal menghapus');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trades'] });
      toast.success('Trade berhasil dihapus');
      setDeleteId(null);
    },
    onError: () => toast.error('Gagal menghapus trade'),
  });

  const handleSelectTrade = useCallback(
    (id: string) => {
      selectTrade(id);
      navigate('journal-detail');
    },
    [selectTrade, navigate]
  );

  const handleDeleteTrade = useCallback((id: string) => {
    setDeleteId(id);
  }, []);

  // Filtered trades count
  const filteredCount = total;

  // Pagination info
  const startItem = (page - 1) * PAGE_SIZE + 1;
  const endItem = Math.min(page * PAGE_SIZE, total);

  return (
    <div className='space-y-5 alpha-animate-in pb-8'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
        <div>
          <div className='flex items-baseline gap-3'>
            <h1 className='alpha-heading-xl uppercase tracking-wider text-[#F3F4F6]'>JOURNAL</h1>
            <span className='alpha-caption text-[#6B7280]'>
              {isLoading ? '…' : `${total} trades`}
            </span>
          </div>
          <p className='alpha-caption text-[#9CA3AF] mt-0.5'>Catat, refleksi, dan tingkatkan proses tradingmu</p>
        </div>
        <div className='flex items-center gap-2'>
          {/* View Toggle */}
          <div className='flex items-center bg-[#151827] border border-[#232636] rounded-lg p-0.5'>
            <button
              type='button'
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition-all duration-150 alpha-press ${
                viewMode === 'table'
                  ? 'bg-[#6366F1]/20 text-[#818CF8] shadow-sm shadow-[#6366F1]/10'
                  : 'text-[#6B7280] hover:text-[#9CA3AF]'
              }`}
            >
              <LayoutList className='size-4' />
            </button>
            <button
              type='button'
              onClick={() => setViewMode('card')}
              className={`p-1.5 rounded-md transition-all duration-150 alpha-press ${
                viewMode === 'card'
                  ? 'bg-[#6366F1]/20 text-[#818CF8] shadow-sm shadow-[#6366F1]/10'
                  : 'text-[#6B7280] hover:text-[#9CA3AF]'
              }`}
            >
              <LayoutGrid className='size-4' />
            </button>
          </div>

          <Button
            onClick={() => navigate('journal-new')}
            className='bg-[#6366F1] hover:bg-[#818CF8] text-white font-medium alpha-press'
          >
            <Plus className='size-4 mr-1.5' />
            New Entry
          </Button>
        </div>
      </div>

      {/* Filters — Sticky */}
      {!isLoading && (total > 0 || Object.entries(filters).some(([k, v]) => v !== DEFAULT_FILTERS[k as keyof TradeFiltersType])) && (
        <div className='alpha-card p-3 sticky top-0 z-10 backdrop-blur-sm'>
          <JournalFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            availablePairs={availablePairs}
          />
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : isError ? (
        <div className='alpha-card p-8 text-center'>
          <AlertTriangle className='size-8 text-[#F59E0B] mx-auto mb-3' />
          <p className='text-sm text-[#F3F4F6]'>Gagal memuat data trade</p>
          <Button
            variant='ghost'
            size='sm'
            className='mt-2 text-[#9CA3AF] hover:text-[#F3F4F6] transition-colors alpha-press'
            onClick={() => queryClient.invalidateQueries({ queryKey: ['trades'] })}
          >
            Coba Lagi
          </Button>
        </div>
      ) : trades.length === 0 ? (
        <EmptyState onNavigate={() => navigate('journal-new')} />
      ) : (
        <>
          {/* Performance Summary Row */}
          <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
            <div className='alpha-stat-card'>
              <p className='alpha-label text-[#9CA3AF]'>Total Trades</p>
              <p className='font-financial text-lg font-semibold text-[#F3F4F6] mt-0.5'>{data?.total ?? trades.length}</p>
            </div>
            <div className='alpha-stat-card'>
              <p className='alpha-label text-[#9CA3AF]'>Win Rate <span className='text-[#6B7280] normal-case'>(halaman ini)</span></p>
              <p className='font-financial text-lg font-semibold text-[#F3F4F6] mt-0.5'>
                {trades.length > 0 ? (trades.filter((t) => t.profitLoss >= 0).length / trades.length * 100).toFixed(0) + '%' : '—'}
              </p>
            </div>
            <div className='alpha-stat-card'>
              <p className='alpha-label text-[#9CA3AF]'>Cumulative P/L <span className='text-[#6B7280] normal-case'>(halaman ini)</span></p>
              <p className={'font-financial text-lg font-semibold mt-0.5 ' + (trades.reduce((sum, t) => sum + (t.profitLoss ?? 0), 0) >= 0 ? 'text-[#22C55E]' : 'text-[#EF4444]')}>
                {trades.length > 0 ? (trades.reduce((sum, t) => sum + (t.profitLoss ?? 0), 0) >= 0 ? '+' : '') + trades.reduce((sum, t) => sum + (t.profitLoss ?? 0), 0).toFixed(2) : '—'}
              </p>
            </div>
            <div className='alpha-stat-card'>
              <p className='alpha-label text-[#9CA3AF]'>Avg Process Score <span className='text-[#6B7280] normal-case'>(halaman ini)</span></p>
              <p className='font-financial text-lg font-semibold text-[#F3F4F6] mt-0.5'>
                {(() => {
                  const scored = trades.filter((t) => t.processScore !== null && t.processScore !== undefined)
                  return scored.length > 0 ? (scored.reduce((sum, t) => sum + (t.processScore ?? 0), 0) / scored.length).toFixed(1) : '—'
                })()}
              </p>
            </div>
          </div>

          {/* Trade Count Summary */}
          <div className='flex items-center justify-between'>
            <p className='alpha-caption'>
              Menampilkan {startItem}–{endItem} dari {filteredCount} trade
            </p>
          </div>

          {/* Trade List */}
          {viewMode === 'table' ? (
            <TradeTableView
              trades={trades}
              onSelectTrade={handleSelectTrade}
              onDeleteTrade={handleDeleteTrade}
            />
          ) : (
            <TradeCardView
              trades={trades}
              onSelectTrade={handleSelectTrade}
            />
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className='flex items-center justify-between pt-2'>
              <p className='alpha-caption'>
                Halaman {page} dari {totalPages}
              </p>
              <div className='flex items-center gap-1'>
                <Button
                  variant='ghost'
                  size='icon'
                  className='size-8 hover:bg-[#1E2030] alpha-press rounded-lg'
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className='size-4 text-[#9CA3AF]' />
                </Button>
                {/* Page numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      type='button'
                      onClick={() => setPage(pageNum)}
                      className={`size-8 rounded-lg text-xs font-medium transition-all duration-150 alpha-press ${
                        page === pageNum
                          ? 'bg-[#6366F1]/20 text-[#818CF8] shadow-sm shadow-[#6366F1]/10'
                          : 'text-[#9CA3AF] hover:bg-[#1E2030]'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <Button
                  variant='ghost'
                  size='icon'
                  className='size-8 hover:bg-[#1E2030] alpha-press rounded-lg'
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  <ChevronRight className='size-4 text-[#9CA3AF]' />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className='bg-[#151827] border-[#232636]'>
          <AlertDialogHeader>
            <AlertDialogTitle className='text-[#F3F4F6]'>Hapus trade ini?</AlertDialogTitle>
            <AlertDialogDescription className='text-[#9CA3AF]'>
              Trade ini akan dihapus secara permanen. Tindakan ini tidak bisa dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className='bg-[#1E2030] border-[#232636] text-[#9CA3AF] hover:text-[#F3F4F6]'>
              Batal
            </AlertDialogCancel>
            <Button
              onClick={() => {
                if (deleteId) deleteMutation.mutate(deleteId)
              }}
              disabled={deleteMutation.isPending}
              className='bg-red-500 hover:bg-red-600 text-white alpha-press'
            >
              {deleteMutation.isPending ? (
                <Loader2 className='size-3.5 mr-1.5 animate-spin' />
              ) : null}
              Hapus
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
