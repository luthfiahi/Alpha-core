'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, formatDistanceToNow, differenceInMinutes } from 'date-fns';
import { toast } from 'sonner';
import {
  X,
  Pencil,
  Trash2,
  Save,
  Calendar,
  Clock,
  TrendingUp,
  Target,
  ShieldAlert,
  ArrowDownToLine,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  BrainCircuit,
  Lightbulb,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useNavigationStore } from '@/stores';
import type { TradeItem } from './types';
import {
  getScoreColor,
  getScoreBgColor,
  formatPnL,
  parseTags,
} from './types';

function ScoreRing({ score, size = 80 }: { score: number | null; size?: number }) {
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const displayScore = Number(score) || 0;
  const offset = circumference - (displayScore / 100) * circumference;

  const color =
    displayScore >= 80
      ? '#22C55E'
      : displayScore >= 60
      ? '#F59E0B'
      : displayScore >= 40
      ? '#F97316'
      : '#EF4444';

  return (
    <div className='relative inline-flex items-center justify-center' style={{ width: size, height: size }}>
      <svg width={size} height={size} className='process-score-ring'>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill='none'
          stroke='#232636'
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill='none'
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap='round'
        />
      </svg>
      <div className='absolute inset-0 flex flex-col items-center justify-center'>
        <span className='font-financial text-lg font-bold' style={{ color }}>
          {displayScore}
        </span>
        <span className='alpha-caption'>Score</span>
      </div>
    </div>
  );
}

function TimelineItem({
  icon: Icon,
  label,
  time,
  color = '#6B7280',
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  label: string;
  time: string;
  color?: string;
}) {
  return (
    <div className='flex items-start gap-3'>
      <div className='mt-1'>
        <div
          className='size-6 rounded-full flex items-center justify-center'
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon className='size-3' style={{ color }} />
        </div>
      </div>
      <div className='flex-1 min-w-0'>
        <p className='alpha-body font-medium'>{label}</p>
        <p className='alpha-caption'>{time}</p>
      </div>
    </div>
  );
}

export function JournalDetailPage() {
  const selectedTradeId = useNavigationStore((s) => s.selectedTradeId);
  const selectTrade = useNavigationStore((s) => s.selectTrade);
  const navigate = useNavigationStore((s) => s.navigate);
  const queryClient = useQueryClient();

  // Edit form state — null means not editing, object holds draft values
  const [editForm, setEditForm] = useState<{ notes: string; lesson: string; emotion: string } | null>(null);
  const isEditingReflection = editForm !== null;

  const { data, isLoading, isError, refetch } = useQuery<{ trade: TradeItem }>({
    queryKey: ['trade', selectedTradeId],
    queryFn: () =>
      fetch(`/api/trades/${selectedTradeId}`).then((r) => {
        if (!r.ok) throw new Error('Trade not found');
        return r.json();
      }),
    enabled: !!selectedTradeId,
  });

  const trade = data?.trade;

  const updateMutation = useMutation({
    mutationFn: async (updateData: Record<string, unknown>) => {
      const res = await fetch(`/api/trades/${selectedTradeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      if (!res.ok) {
        let errMsg = 'Gagal mengupdate';
        try {
          const err = await res.json();
          errMsg = err.error || errMsg;
        } catch {
          // Response body was not valid JSON
        }
        throw new Error(errMsg);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trades'] });
      queryClient.invalidateQueries({ queryKey: ['trade', selectedTradeId] });
      toast.success('Berhasil disimpan!');
      setEditForm(null);
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/trades/${selectedTradeId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Gagal menghapus');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trades'] });
      toast.success('Trade berhasil dihapus');
      selectTrade(null);
      navigate('journal');
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSaveReflection = () => {
    if (!editForm) return;
    updateMutation.mutate({
      reflectionNotes: editForm.notes,
      lessonLearned: editForm.lesson,
      emotionAfter: editForm.emotion || null,
    });
  };

  const handleStartEdit = () => {
    setEditForm({
      notes: trade?.reflectionNotes || '',
      lesson: trade?.lessonLearned || '',
      emotion: trade?.emotionAfter || '',
    });
  };

  const handleCancelEdit = () => {
    setEditForm(null);
  };

  const handleClose = () => {
    selectTrade(null);
    navigate('journal');
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-[60vh]'>
        <div className='space-y-4 w-full max-w-lg'>
          <Skeleton className='h-8 w-64 alpha-skeleton' />\n          <Skeleton className='h-4 w-40 alpha-skeleton' />
          <Skeleton className='h-48 alpha-skeleton rounded-[14px]' />
          <Skeleton className='h-24 alpha-skeleton rounded-[14px]' />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className='flex items-center justify-center h-[60vh]'>
        <div className='flex flex-col items-center gap-3 rounded-xl border border-[#1E2030] bg-[#0B0D17] px-6 py-10 text-center'>
          <AlertTriangle className='size-8 text-[#F59E0B]' />
          <p className='text-sm text-[#F3F4F6]'>Gagal memuat detail trade</p>
          <Button
            variant='ghost'
            size='sm'
            className='alpha-press text-[#9CA3AF] hover:text-[#F3F4F6]'
            onClick={() => refetch()}
          >
            <RefreshCw className='size-3.5 mr-1.5' />
            Coba Lagi
          </Button>
        </div>
      </div>
    );
  }

  if (!trade) {
    return (
      <div className='flex items-center justify-center h-[60vh]'>
        <div className='text-center'>
          <p className='text-[#6B7280]'>Trade tidak ditemukan</p>
          <Button variant='ghost' className='alpha-press mt-3 text-[#9CA3AF]' onClick={handleClose}>
            Kembali ke Journal
          </Button>
        </div>
      </div>
    );
  }

  const pnlPositive = Number(trade.profitLoss) >= 0;
  const tags = parseTags(trade.tags);
  const duration =
    trade.entryTime && trade.exitTime
      ? formatDistanceToNow(new Date(trade.exitTime), { addSuffix: false })
      : trade.entryTime
      ? formatDistanceToNow(new Date(trade.entryTime), { addSuffix: false })
      : '—';

  const entryDate = trade.entryTime
    ? format(new Date(trade.entryTime), 'dd MMM yyyy, HH:mm')
    : format(new Date(trade.createdAt), 'dd MMM yyyy, HH:mm');

  return (
    <div className='alpha-animate-in flex items-start justify-center min-h-screen p-4 md:p-8'>
      <div className='w-full max-w-2xl space-y-6'>
        {/* Header */}
        <div className='flex items-start justify-between'>
          <div className='flex items-center gap-3'>
            <Button
              variant='ghost'
              size='icon'
              className='alpha-press size-9 hover:bg-[#1E2030]'
              onClick={handleClose}
            >
              <X className='size-4 text-[#9CA3AF]' />
            </Button>
            <div className='flex items-center gap-2.5'>
              <span className='alpha-heading-lg font-financial text-2xl font-bold text-[#F3F4F6]'>
                {trade.pair}
              </span>
              <span
                className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold ${
                  trade.direction === 'LONG'
                    ? 'bg-[#22C55E]/15 text-[#22C55E] ring-1 ring-[#22C55E]/30'
                    : 'bg-[#EF4444]/15 text-[#EF4444] ring-1 ring-[#EF4444]/30'
                }`}
              >
                {trade.direction}
              </span>
              <span
                className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
                  trade.status === 'CLOSED'
                    ? 'bg-[#6B7280]/15 text-[#9CA3AF]'
                    : 'bg-[#6366F1]/15 text-[#818CF8]'
                }`}
              >
                {trade.status}
              </span>
            </div>
          </div>

          <div className='flex items-center gap-1'>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant='ghost'
                  size='icon'
                  className='alpha-press size-8 hover:bg-[#EF4444]/10 hover:text-[#EF4444]'
                >
                  <Trash2 className='size-4' />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className='bg-[#151827] border-[#232636]'>
                <AlertDialogHeader>
                  <AlertDialogTitle className='text-[#F3F4F6]'>
                    Hapus trade ini?
                  </AlertDialogTitle>
                  <AlertDialogDescription className='text-[#9CA3AF]'>
                    Trade {trade.pair} akan dihapus secara permanen. Tindakan ini tidak
                    bisa dibatalkan.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className='bg-[#1E2030] border-[#232636] text-[#9CA3AF] hover:text-[#F3F4F6]'>
                    Batal
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => deleteMutation.mutate()}
                    className='bg-[#EF4444] hover:bg-[#EF4444]/90 text-white'
                  >
                    Hapus
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Trade Data Card */}
        <div className='alpha-card alpha-animate-in alpha-stagger-1 p-5'>
          <h3 className='alpha-heading-sm uppercase tracking-wider mb-4'>
            Data Trade
          </h3>
          <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
            <DataItem
              icon={ArrowDownToLine}
              label='Entry'
              value={(Number(trade.entryPrice) || 0).toFixed((Number(trade.entryPrice) || 0) >= 100 ? 3 : 5)}
              mono
            />
            <DataItem
              icon={TrendingUp}
              label='Exit'
              value={trade.exitPrice ? Number(trade.exitPrice).toFixed(Number(trade.exitPrice) >= 100 ? 3 : 5) : '—'}
              mono
            />
            <DataItem
              icon={ShieldAlert}
              label='Stop Loss'
              value={trade.stopLoss ? Number(trade.stopLoss).toFixed(Number(trade.stopLoss) >= 100 ? 3 : 5) : '—'}
              mono
            />
            <DataItem
              icon={Target}
              label='Take Profit'
              value={trade.takeProfit ? Number(trade.takeProfit).toFixed(Number(trade.takeProfit) >= 100 ? 3 : 5) : '—'}
              mono
            />
            <DataItem label='Lot Size' value={trade.lotSize?.toString() || '—'} mono />
            <DataItem label='Timeframe' value={trade.timeframe || '—'} />
            <DataItem label='Strategy' value={trade.strategy || '—'} />
            <DataItem
              icon={Calendar}
              label='Entry Time'
              value={entryDate}
            />
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className='flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-[#232636]'>
              {tags.map((tag) => (
                <span
                  key={tag}
                  className='rounded-full bg-[#6366F1]/10 border border-[#6366F1]/20 px-2.5 py-0.5 text-xs text-[#818CF8]'
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Result Card */}
        <div className='alpha-card alpha-animate-in alpha-stagger-2 p-5'>
          <h3 className='alpha-heading-sm uppercase tracking-wider mb-4'>
            Hasil
          </h3>
          <div className='flex items-center gap-6'>
            <div className='text-center'>
              <p className='alpha-caption mb-1'>P/L</p>
              <span
                className={`font-financial text-4xl font-bold tracking-tight ${
                  pnlPositive ? 'text-[#22C55E]' : 'text-[#EF4444]'
                }`}
              >
                {formatPnL(trade.profitLoss)}
              </span>
              <p className='alpha-caption mt-1 text-[#9CA3AF]'>{trade.currency}</p>
            </div>
            <Separator orientation='vertical' className='h-12 bg-[#232636]' />
            <div className='text-center'>
              <p className='alpha-caption mb-1'>Pips</p>
              <span
                className={`font-financial text-lg font-semibold ${
                  trade.pipResult && trade.pipResult >= 0
                    ? 'text-[#22C55E]'
                    : 'text-[#EF4444]'
                }`}
              >
                {trade.pipResult !== null && trade.pipResult !== undefined
                  ? `${trade.pipResult >= 0 ? '+' : ''}${Number(trade.pipResult).toFixed(1)}`
                  : '—'}
              </span>
            </div>
            <Separator orientation='vertical' className='h-12 bg-[#232636]' />
            <div className='text-center'>
              <p className='alpha-caption mb-1'>Durasi</p>
              <span className='alpha-body text-[#F3F4F6]'>{duration}</span>
            </div>
          </div>
        </div>

        {/* Screenshot */}
        {trade.screenshotUrl && (
          <div className='alpha-card alpha-animate-in alpha-stagger-3 p-5'>
            <h3 className='alpha-heading-sm uppercase tracking-wider mb-3'>
              <ImageIcon className='size-3.5 inline mr-1.5' />
              Screenshot
            </h3>
            <img
              src={trade.screenshotUrl}
              alt='Trade screenshot'
              className='w-full max-h-64 object-contain rounded-lg border border-[#232636]'
            />
          </div>
        )}

        {/* Process Score */}
        <div className='alpha-card alpha-animate-in alpha-stagger-4 p-5'>
          <div className='flex items-center justify-between'>
            <div>
              <h3 className='alpha-heading-sm uppercase tracking-wider mb-1'>
                Process Score
              </h3>
              <p className='alpha-caption'>
                {trade.processScore !== null && trade.processScore !== undefined
                  ? trade.processScore >= 80
                    ? 'Excellent — trade process sangat terstruktur'
                    : trade.processScore >= 60
                    ? 'Good — ada ruang perbaikan kecil'
                    : trade.processScore >= 40
                    ? 'Fair — perlu perbaikan signifikan'
                    : 'Poor — proses perlu dievaluasi ulang'
                  : 'Belum dinilai'}
              </p>
            </div>
            <ScoreRing score={trade.processScore} size={72} />
          </div>
        </div>

        {/* Reflection Section — visually distinct */}
        <div className='alpha-card alpha-animate-in alpha-stagger-5 p-5 space-y-4 border-l-2 border-l-[#6366F1]/40'>
          <div className='flex items-center justify-between'>
            <h3 className='alpha-heading-sm uppercase tracking-wider'>
              <BrainCircuit className='size-3.5 inline mr-1.5' />
              Refleksi
            </h3>
            {trade.hasReflected ? (
              <span className='inline-flex items-center gap-1 text-xs text-[#22C55E]'>
                <CheckCircle2 className='size-3' />
                Sudah Refleksi
              </span>
            ) : (
              <span className='inline-flex items-center gap-1 text-xs text-[#F59E0B]'>
                <AlertTriangle className='size-3' />
                Belum Refleksi
              </span>
            )}
          </div>

          {/* Plan Notes (read-only) */}
          {trade.planNotes && (
            <div>
              <p className='alpha-label mb-1'>Rencana Trade</p>
              <div className='bg-[#0B0D17] rounded-lg p-3 alpha-body text-[#9CA3AF] whitespace-pre-wrap'>
                {trade.planNotes}
              </div>
            </div>
          )}

          {/* Emotion Before */}
          {trade.emotionBefore && (
            <div className='flex items-center gap-2'>
              <span className='alpha-caption'>Emosi sebelum:</span>
              <span className='alpha-body'>{trade.emotionBefore}</span>
            </div>
          )}

          <Separator className='bg-[#232636]' />

          {isEditingReflection && editForm ? (
            <div className='space-y-4'>
              <div>
                <label className='alpha-label block mb-1.5'>Emosi Setelah Trade</label>
                <input
                  value={editForm.emotion}
                  onChange={(e) => setEditForm({ ...editForm, emotion: e.target.value })}
                  placeholder='Tenang, Disesalkan, Bangga...'
                  className='alpha-focus-ring w-full bg-[#0B0D17] border border-[#232636] rounded-lg px-3 py-2 text-sm text-[#F3F4F6] placeholder:text-[#6B7280] focus:outline-none focus:border-[#6366F1]/40'
                />
              </div>
              <div>
                <label className='alpha-label block mb-1.5'>Catatan Refleksi</label>
                <Textarea
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  placeholder='Apa yang kamu pelajari dari trade ini?'
                  rows={4}
                  className='alpha-focus-ring bg-[#0B0D17] border-[#232636] text-sm placeholder:text-[#6B7280] resize-none'
                />
              </div>
              <div>
                <label className='alpha-label block mb-1.5'>
                  <Lightbulb className='size-3 inline mr-1 text-[#F59E0B]' />
                  Lesson Learned
                </label>
                <Textarea
                  value={editForm.lesson}
                  onChange={(e) => setEditForm({ ...editForm, lesson: e.target.value })}
                  placeholder='Apa pelajaran utama dari trade ini?'
                  rows={3}
                  className='alpha-focus-ring bg-[#0B0D17] border-[#232636] text-sm placeholder:text-[#6B7280] resize-none'
                />
              </div>
              <div className='flex items-center gap-2 pt-1'>
                <Button
                  onClick={handleSaveReflection}
                  disabled={updateMutation.isPending}
                  size='sm'
                  className='alpha-press bg-[#6366F1] hover:bg-[#818CF8] text-white'
                >
                  {updateMutation.isPending ? (
                    <span className='inline-flex items-center gap-2'>
                      <span className='size-3 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                      Menyimpan...
                    </span>
                  ) : (
                    <>
                      <Save className='size-3.5' />
                      Simpan Reflection
                    </>
                  )}
                </Button>
                <Button
                  variant='ghost'
                  size='sm'
                  className='alpha-press text-[#9CA3AF]'
                  onClick={handleCancelEdit}
                >
                  Batal
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Existing Reflection (read-only) */}
              {(trade.reflectionNotes || trade.lessonLearned) && (
                <div className='space-y-3'>
                  {trade.emotionAfter && (
                    <div className='flex items-center gap-2'>
                      <span className='alpha-caption'>Emosi setelah:</span>
                      <span className='alpha-body'>{trade.emotionAfter}</span>
                    </div>
                  )}
                  {trade.reflectionNotes && (
                    <div>
                      <p className='alpha-label mb-1'>Refleksi</p>
                      <div className='bg-[#0B0D17] rounded-lg p-3 alpha-body text-[#9CA3AF] whitespace-pre-wrap'>
                        {trade.reflectionNotes}
                      </div>
                    </div>
                  )}
                  {trade.lessonLearned && (
                    <div>
                      <p className='alpha-label mb-1'>
                        <Lightbulb className='size-3 inline mr-1 text-[#F59E0B]' />
                        Lesson Learned
                      </p>
                      <div className='bg-[#0B0D17] rounded-lg p-3 alpha-body text-[#9CA3AF] whitespace-pre-wrap'>
                        {trade.lessonLearned}
                      </div>
                    </div>
                  )}
                </div>
              )}
              <Button
                variant='outline'
                size='sm'
                className='alpha-press border-[#232636] text-[#9CA3AF] hover:text-[#F3F4F6]'
                onClick={handleStartEdit}
              >
                <Pencil className='size-3.5' />
                {trade.hasReflected ? 'Edit Reflection' : 'Tulis Reflection'}
              </Button>
            </>
          )}
        </div>

        {/* Timeline */}
        <div className='alpha-card alpha-animate-in alpha-stagger-6 p-5'>
          <h3 className='alpha-heading-sm uppercase tracking-wider mb-4'>
            Timeline
          </h3>
          <div className='space-y-4'>
            <TimelineItem
              icon={ArrowDownToLine}
              label='Trade dibuat'
              time={format(new Date(trade.createdAt), 'dd MMM yyyy, HH:mm')}
              color='#6366F1'
            />
            {trade.entryTime && (
              <TimelineItem
                icon={Clock}
                label='Entry dieksekusi'
                time={format(new Date(trade.entryTime), 'dd MMM yyyy, HH:mm')}
                color='#22C55E'
              />
            )}
            {trade.exitTime && (
              <TimelineItem
                icon={TrendingUp}
                label='Trade ditutup'
                time={format(new Date(trade.exitTime), 'dd MMM yyyy, HH:mm')}
                color={pnlPositive ? '#22C55E' : '#EF4444'}
              />
            )}
            {trade.hasReflected && (
              <TimelineItem
                icon={BrainCircuit}
                label='Refleksi ditulis'
                time={format(new Date(trade.updatedAt), 'dd MMM yyyy, HH:mm')}
                color='#F59E0B'
              />
            )}
          </div>
        </div>

        {/* Bottom spacing */}
        <div className='h-8' />
      </div>
    </div>
  );
}

function DataItem({
  icon: Icon,
  label,
  value,
  mono = false,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <p className='alpha-caption mb-0.5 flex items-center gap-1'>
        {Icon && <Icon className='size-2.5' />}
        {label}
      </p>
      <p className={`text-sm text-[#F3F4F6] ${mono ? 'font-financial' : ''}`}>{value}</p>
    </div>
  );
}
