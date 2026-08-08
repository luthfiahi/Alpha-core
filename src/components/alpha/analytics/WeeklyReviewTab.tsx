'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from 'recharts'
import {
  Sparkles,
  AlertTriangle,
  Lightbulb,
  BarChart3,
  TrendingUp,
  CheckCircle2,
  Calendar,
  Loader2,
  RefreshCw,
  FileText,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  GrowthReportCard,
  GrowthReportHistoryItem,
  type GrowthReportData,
} from './GrowthReportCard'

// ========================================
// Types
// ========================================
interface CurrentReviewData {
  current: WeeklyReview | null
  previous: WeeklyReview | null
  hasTrades: boolean
  weekRange: { start: string; end: string }
  emotionBreakdown: Record<string, number>
}

interface WeeklyReview {
  id: string
  weekStart: string
  weekEnd: string
  summary: string
  processScore: number | null
  ruleCompliance: number | null
  totalTrades: number
  winRate: number | null
  totalPnL: number | null
  biggestMistake: string | null
  recommendation: string | null
  topBehavioralIssue: string | null
  playbookUsage: number | null
  emotionBreakdown: string | null
}

// ========================================
// Helpers
// ========================================
function getScoreColor(score: number): string {
  if (score <= 40) return '#EF4444'
  if (score <= 60) return '#F59E0B'
  if (score <= 80) return '#6366F1'
  return '#22C55E'
}

function formatWeekRange(start: string, end: string): string {
  try {
    const s = new Date(start + 'T00:00:00')
    const e = new Date(end + 'T00:00:00')
    const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }
    return `${s.toLocaleDateString('id-ID', opts)} — ${e.toLocaleDateString('id-ID', opts)}`
  } catch {
    return `${start} — ${end}`
  }
}

const EMOTION_COLORS: Record<string, string> = {
  calm: '#22C55E',
  anxious: '#F59E0B',
  confident: '#6366F1',
  fearful: '#EF4444',
}

const EMOTION_LABELS: Record<string, string> = {
  calm: 'Tenang',
  anxious: 'Cemas',
  confident: 'Percaya Diri',
  fearful: 'Takut',
}

// ========================================
// Process Ring (inline mini ring)
// ========================================
function MiniProcessRing({ score }: { score: number }) {
  const color = getScoreColor(score)
  const radius = 36
  const circumference = 2 * Math.PI * radius
  const progress = score / 100
  const strokeDashoffset = circumference * (1 - progress)

  return (
    <div className="relative flex-shrink-0" style={{ width: 96, height: 96 }}>
      <svg width={96} height={96} viewBox="0 0 96 96">
        <circle cx={48} cy={48} r={radius} fill="none" stroke="#232636" strokeWidth={6} />
        <motion.circle
          cx={48}
          cy={48}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1], delay: 0.2 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-financial text-xl font-bold leading-none" style={{ color }}>
          {score}
        </span>
        <span className="alpha-caption mt-0.5">Score</span>
      </div>
    </div>
  )
}

// ========================================
// Emotion Bar Chart
// ========================================
function EmotionBarChart({ data }: { data: Record<string, number> }) {
  const chartData = Object.entries(data).map(([key, value]) => ({
    name: EMOTION_LABELS[key] || key,
    value,
    color: EMOTION_COLORS[key] || '#6B7280',
  }))

  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#232636" horizontal={false} />
        <XAxis
          type="number"
          domain={[0, 100]}
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 10, fill: '#6B7280' }}
          ticks={[0, 25, 50, 75, 100]}
        />
        <YAxis
          type="category"
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: '#9CA3AF' }}
          width={90}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null
            return (
              <div className="bg-[#151827] border border-[#232636] rounded-lg px-3 py-2">
                <p className="text-xs text-[#F3F4F6] font-medium">
                  {payload[0].payload.name}: {Math.round(Number(payload[0].value) || 0)}%
                </p>
              </div>
            )
          }}
        />
        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
          {chartData.map((entry, index) => (
            <Cell key={index} fill={entry.color} fillOpacity={0.8} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

// ========================================
// Main Component
// ========================================
export function WeeklyReviewTab() {
  const [currentData, setCurrentData] = useState<CurrentReviewData | null>(null)
  const [reviews, setReviews] = useState<WeeklyReview[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Growth Report state
  const [latestReport, setLatestReport] = useState<GrowthReportData | null>(null)
  const [reportHistory, setReportHistory] = useState<GrowthReportData[]>([])
  const [reportLoading, setReportLoading] = useState(true)
  const [reportGenerating, setReportGenerating] = useState(false)
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null)
  const [historyOpen, setHistoryOpen] = useState(false)

  const fetchCurrent = useCallback(async () => {
    try {
      setError(null)
      const res = await fetch('/api/analytics/weekly-review/current')
      const json = await res.json()
      setCurrentData(json)
    } catch (err) {
      console.error('Failed to fetch current review:', err)
      setError('Gagal memuat data')
    }
  }, [])

  const fetchReviews = useCallback(async () => {
    try {
      const res = await fetch('/api/analytics/weekly-review')
      const json = await res.json()
      setReviews(json.reviews || [])
    } catch (err) {
      console.error('Failed to fetch reviews:', err)
      setError('Gagal memuat data')
    }
  }, [])

  // Growth Report fetchers
  const fetchReports = useCallback(async () => {
    try {
      const res = await fetch('/api/growth-report?limit=20')
      const json = await res.json()
      const reports: GrowthReportData[] = json.reports || []
      setLatestReport(reports.length > 0 ? reports[0] : null)
      setReportHistory(reports.slice(1))
    } catch (err) {
      console.error('Failed to fetch growth reports:', err)
    }
  }, [])

  const handleGenerateReport = async (type: 'WEEKLY' | 'MONTHLY') => {
    setReportGenerating(true)
    try {
      const res = await fetch('/api/growth-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportType: type }),
      })
      const json = await res.json()
      if (json.report) {
        await fetchReports()
      }
    } catch (err) {
      console.error('Failed to generate growth report:', err)
    } finally {
      setReportGenerating(false)
    }
  }

  useEffect(() => {
    Promise.all([fetchCurrent(), fetchReviews()]).finally(() => setLoading(false))
  }, [fetchCurrent, fetchReviews])

  useEffect(() => {
    fetchReports().finally(() => setReportLoading(false))
  }, [fetchReports])

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const res = await fetch('/api/analytics/weekly-review', { method: 'POST' })
      const json = await res.json()
      if (json.review) {
        await fetchCurrent()
        await fetchReviews()
      }
    } catch (err) {
      console.error('Failed to generate review:', err)
    } finally {
      setGenerating(false)
    }
  }

  const review = currentData?.current
  const emotionData = currentData?.emotionBreakdown || { calm: 50, anxious: 25, confident: 20, fearful: 5 }

  const handleRetry = useCallback(() => {
    setError(null)
    setLoading(true)
    Promise.all([fetchCurrent(), fetchReviews()]).finally(() => setLoading(false))
  }, [fetchCurrent, fetchReviews])

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Card className="rounded-xl border-[#1E2030] bg-[#151827] shadow-none py-0 gap-0">
          <CardContent className="flex flex-col items-center justify-center py-8 px-6">
            <AlertTriangle className="w-8 h-8 text-amber-400 mb-3" />
            <p className="alpha-body mb-4">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              className="gap-2 border-[#232636] hover:bg-[#1E2030] text-[#9CA3AF] hover:text-[#F3F4F6] alpha-press"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Coba Lagi
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[200px] rounded-[14px]" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-[180px] rounded-[14px]" />
          <Skeleton className="h-[180px] rounded-[14px]" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 alpha-animate-in">
      {/* Generate button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="alpha-heading-sm text-[#F3F4F6]">Review Mingguan</h3>
          <p className="alpha-caption mt-0.5">
            {currentData?.weekRange
              ? formatWeekRange(currentData.weekRange.start, currentData.weekRange.end)
              : '—'}
          </p>
        </div>
        <Button
          onClick={handleGenerate}
          disabled={generating || !!review}
          className="gap-2 bg-indigo-600 hover:bg-indigo-500 text-white alpha-press"
          size="sm"
        >
          {generating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          {review ? 'Sudah Ada Review' : 'Generate Review'}
        </Button>
      </div>

      {/* Current week summary */}
      {review ? (
        <motion.div
          className="bg-[#151827] border border-[#232636] rounded-[14px] p-6"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left: Process Ring + Stats */}
            <div className="flex flex-row md:flex-col items-center md:items-start gap-6 md:gap-4 md:min-w-[160px]">
              <MiniProcessRing score={review.processScore ?? 0} />
              <div className="grid grid-cols-2 gap-3 md:grid-cols-1">
                <div className="text-center md:text-left">
                  <p className="alpha-caption uppercase tracking-wider">Total Trade</p>
                  <p className="font-financial text-lg font-semibold text-[#F3F4F6]">{review.totalTrades}</p>
                </div>
                <div className="text-center md:text-left">
                  <p className="alpha-caption uppercase tracking-wider">Win Rate</p>
                  <p className="font-financial text-lg font-semibold text-[#F3F4F6]">{review.winRate ?? 0}%</p>
                </div>
                <div className="text-center md:text-left">
                  <p className="alpha-caption uppercase tracking-wider">Rule Compliance</p>
                  <p className="font-financial text-lg font-semibold text-[#F3F4F6]">{Math.round(review.ruleCompliance ?? 0)}%</p>
                </div>
                <div className="text-center md:text-left">
                  <p className="alpha-caption uppercase tracking-wider">Playbook Usage</p>
                  <p className="font-financial text-lg font-semibold text-[#F3F4F6]">{Math.round(review.playbookUsage ?? 0)}%</p>
                </div>
              </div>
            </div>

            {/* Right: Summary + P/L */}
            <div className="flex-1 space-y-4 min-w-0">
              <div>
                <h4 className="alpha-heading-sm text-[#F3F4F6] mb-1">Ringkasan</h4>
                <p className="alpha-body leading-relaxed">{review.summary}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="px-3 py-1.5 rounded-lg bg-[#10121E] border border-[#232636]">
                  <span className="alpha-caption">P/L Minggu Ini</span>
                  <p className={`font-financial text-sm font-semibold ${(review.totalPnL ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    ${(review.totalPnL ?? 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="bg-[#151827] border border-[#232636] rounded-[14px] p-8 text-center">
          <Calendar className="w-10 h-10 text-[#232636] mx-auto mb-3" />
          <p className="alpha-body text-[#6B7280]">Belum ada review minggu ini</p>
          <p className="alpha-caption mt-1">Klik &quot;Generate Review&quot; untuk membuat review AI</p>
        </div>
      )}

      {/* Bottom cards grid */}
      {review && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Biggest Mistake */}
          {review.biggestMistake && (
            <motion.div
              className="bg-[#151827] border border-amber-500/20 rounded-[14px] p-5"
              style={{ borderLeftWidth: 3, borderLeftColor: '#F59E0B' }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h4 className="alpha-heading-sm text-amber-400">Kesalahan Terbesar</h4>
              </div>
              <p className="alpha-body leading-relaxed">{review.biggestMistake}</p>
            </motion.div>
          )}

          {/* AI Recommendation */}
          {review.recommendation && (
            <motion.div
              className="bg-[#151827] border border-indigo-500/20 rounded-[14px] p-5"
              style={{ borderLeftWidth: 3, borderLeftColor: '#6366F1' }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-4 h-4 text-indigo-400" />
                <h4 className="alpha-heading-sm text-indigo-400">Rekomendasi AI</h4>
              </div>
              <p className="alpha-body leading-relaxed">{review.recommendation}</p>
            </motion.div>
          )}

          {/* Top Behavioral Issue */}
          {review.topBehavioralIssue && (
            <motion.div
              className="bg-[#151827] border border-[#232636] rounded-[14px] p-5"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-[#EC4899]" />
                <h4 className="alpha-heading-sm text-[#F3F4F6]">Isu Perilaku Teratas</h4>
              </div>
              <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-pink-500/15 text-pink-400 border border-pink-500/30">
                {review.topBehavioralIssue.replace(/_/g, ' ')}
              </span>
            </motion.div>
          )}

          {/* Emotion Breakdown */}
          <motion.div
            className="bg-[#151827] border border-[#232636] rounded-[14px] p-5"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="w-4 h-4 text-[#14B8A6]" />
              <h4 className="alpha-heading-sm text-[#F3F4F6]">Distribusi Emosi</h4>
            </div>
            <EmotionBarChart data={emotionData} />
          </motion.div>
        </div>
      )}

      {/* Previous weeks */}
      <div className="bg-[#151827] border border-[#232636] rounded-[14px] p-6">
        <h4 className="alpha-heading-sm text-[#F3F4F6] mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#6B7280]" />
          Minggu-Minggu Sebelumnya
        </h4>
        <ScrollArea className="max-h-[280px] overflow-y-auto">
          <div className="space-y-3 pr-2">
            {reviews
              .filter((r) => r.id !== review?.id)
              .slice(0, 10)
              .map((r) => (
                <div
                  key={r.id}
                  className="flex items-center gap-4 p-3 rounded-lg bg-[#10121E] border border-[#232636] hover:bg-[#1E2030] transition-colors"
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: getScoreColor(r.processScore ?? 0) + '15' }}
                  >
                    <span
                      className="font-financial text-sm font-bold"
                      style={{ color: getScoreColor(r.processScore ?? 0) }}
                    >
                      {r.processScore ?? 0}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[#F3F4F6] font-medium truncate">{r.summary}</p>
                    <p className="alpha-caption mt-0.5">
                      {formatWeekRange(r.weekStart, r.weekEnd)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      <p className="alpha-caption">{r.totalTrades} trade</p>
                      <p className={`text-xs font-financial font-medium ${(r.totalPnL ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        ${(r.totalPnL ?? 0).toFixed(0)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="alpha-caption">WR</p>
                      <p className="text-xs font-financial font-medium text-[#F3F4F6]">
                        {r.winRate ?? 0}%
                      </p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </ScrollArea>
      </div>

      {/* ====== AI GROWTH REPORT SECTION ====== */}
      <div className="space-y-4">
        {/* Section Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500/20 to-emerald-500/20 border border-indigo-500/20 flex items-center justify-center">
              <FileText className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h3 className="alpha-heading-sm text-[#F3F4F6]">Laporan Pertumbuhan AI</h3>
              <p className="alpha-caption mt-0.5">Analisis komprehensif perkembangan trading kamu</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => handleGenerateReport('MONTHLY')}
              disabled={reportGenerating}
              variant="outline"
              size="sm"
              className="gap-2 border-[#232636] hover:bg-[#1E2030] text-[#9CA3AF] hover:text-[#F3F4F6] alpha-press"
            >
              {reportGenerating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">Bulanan</span>
            </Button>
            <Button
              onClick={() => handleGenerateReport('WEEKLY')}
              disabled={reportGenerating}
              className="gap-2 bg-indigo-600 hover:bg-indigo-500 text-white alpha-press"
              size="sm"
            >
              {reportGenerating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">Generate Laporan</span>
              <span className="sm:hidden">Generate</span>
            </Button>
          </div>
        </div>

        {/* Latest Report */}
        {reportLoading ? (
          <Skeleton className="h-[400px] rounded-[14px]" />
        ) : reportGenerating ? (
          <div className="bg-[#151827] border border-[#232636] rounded-[14px] p-12 text-center">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <Loader2 className="w-16 h-16 text-indigo-400 animate-spin" />
              <Sparkles className="w-5 h-5 text-amber-400 absolute top-0 right-0" />
            </div>
            <h4 className="alpha-heading-sm text-[#F3F4F6] mb-1">Menganalisis Periode Ini...</h4>
            <p className="alpha-caption max-w-xs mx-auto">
              AI sedang menganalisis trade, perilaku, dan compliance untuk menghasilkan laporan pertumbuhan
            </p>
          </div>
        ) : latestReport ? (
          <GrowthReportCard report={latestReport} />
        ) : (
          <div className="bg-[#151827] border border-[#232636] rounded-[14px] p-8 text-center">
            <div className="w-12 h-12 rounded-xl bg-[#10121E] border border-[#232636] flex items-center justify-center mx-auto mb-3">
              <FileText className="w-6 h-6 text-[#4B5563]" />
            </div>
            <p className="alpha-body text-[#6B7280] mb-1">Belum ada laporan pertumbuhan</p>
            <p className="alpha-caption">
              Klik &quot;Generate Laporan&quot; untuk membuat laporan AI pertama kamu
            </p>
          </div>
        )}

        {/* Report History (Collapsible) */}
        {reportHistory.length > 0 && (
          <div className="bg-[#151827] border border-[#232636] rounded-[14px] overflow-hidden">
            <button
              onClick={() => setHistoryOpen(!historyOpen)}
              className="w-full flex items-center justify-between p-4 hover:bg-[#1a1d2e] transition-colors"
            >
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#6B7280]" />
                <h4 className="alpha-heading-sm text-[#F3F4F6]">Riwayat Laporan</h4>
                <Badge variant="secondary" className="text-[10px] px-2 py-0 h-5">
                  {reportHistory.length}
                </Badge>
              </div>
              {historyOpen ? (
                <ChevronDown className="w-4 h-4 text-[#6B7280] transition-transform" />
              ) : (
                <ChevronRight className="w-4 h-4 text-[#6B7280] transition-transform" />
              )}
            </button>

            {historyOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.2 }}
              >
                <ScrollArea className="max-h-[400px] overflow-y-auto">
                  <div className="px-4 pb-4 space-y-2">
                    {reportHistory.map((r) => (
                      <GrowthReportHistoryItem
                        key={r.id}
                        report={r}
                        isExpanded={expandedHistoryId === r.id}
                        onToggle={() =>
                          setExpandedHistoryId(expandedHistoryId === r.id ? null : r.id)
                        }
                      />
                    ))}
                  </div>
                </ScrollArea>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
