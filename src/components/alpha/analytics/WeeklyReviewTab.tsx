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
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'

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
        <span className="text-[9px] text-[#6B7280] mt-0.5">Score</span>
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
                  {payload[0].payload.name}: {Math.round(payload[0].value)}%
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

  const fetchCurrent = useCallback(async () => {
    try {
      const res = await fetch('/api/analytics/weekly-review/current')
      const json = await res.json()
      setCurrentData(json)
    } catch (err) {
      console.error('Failed to fetch current review:', err)
    }
  }, [])

  const fetchReviews = useCallback(async () => {
    try {
      const res = await fetch('/api/analytics/weekly-review')
      const json = await res.json()
      setReviews(json.reviews || [])
    } catch (err) {
      console.error('Failed to fetch reviews:', err)
    }
  }, [])

  useEffect(() => {
    Promise.all([fetchCurrent(), fetchReviews()]).finally(() => setLoading(false))
  }, [fetchCurrent, fetchReviews])

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
    <div className="space-y-6">
      {/* Generate button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-[#F3F4F6]">Review Mingguan</h3>
          <p className="text-xs text-[#6B7280] mt-0.5">
            {currentData?.weekRange
              ? formatWeekRange(currentData.weekRange.start, currentData.weekRange.end)
              : '—'}
          </p>
        </div>
        <Button
          onClick={handleGenerate}
          disabled={generating || !!review}
          className="gap-2 bg-indigo-600 hover:bg-indigo-500 text-white"
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
                  <p className="text-[10px] text-[#6B7280] uppercase tracking-wider">Total Trade</p>
                  <p className="font-financial text-lg font-semibold text-[#F3F4F6]">{review.totalTrades}</p>
                </div>
                <div className="text-center md:text-left">
                  <p className="text-[10px] text-[#6B7280] uppercase tracking-wider">Win Rate</p>
                  <p className="font-financial text-lg font-semibold text-[#F3F4F6]">{review.winRate ?? 0}%</p>
                </div>
                <div className="text-center md:text-left">
                  <p className="text-[10px] text-[#6B7280] uppercase tracking-wider">Rule Compliance</p>
                  <p className="font-financial text-lg font-semibold text-[#F3F4F6]">{Math.round(review.ruleCompliance ?? 0)}%</p>
                </div>
                <div className="text-center md:text-left">
                  <p className="text-[10px] text-[#6B7280] uppercase tracking-wider">Playbook Usage</p>
                  <p className="font-financial text-lg font-semibold text-[#F3F4F6]">{Math.round(review.playbookUsage ?? 0)}%</p>
                </div>
              </div>
            </div>

            {/* Right: Summary + P/L */}
            <div className="flex-1 space-y-4 min-w-0">
              <div>
                <h4 className="text-sm font-medium text-[#F3F4F6] mb-1">Ringkasan</h4>
                <p className="text-sm text-[#9CA3AF] leading-relaxed">{review.summary}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="px-3 py-1.5 rounded-lg bg-[#10121E] border border-[#232636]">
                  <span className="text-[10px] text-[#6B7280]">P/L Minggu Ini</span>
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
          <p className="text-sm text-[#6B7280]">Belum ada review minggu ini</p>
          <p className="text-xs text-[#4B5563] mt-1">Klik &quot;Generate Review&quot; untuk membuat review AI</p>
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
                <h4 className="text-sm font-semibold text-amber-400">Kesalahan Terbesar</h4>
              </div>
              <p className="text-sm text-[#9CA3AF] leading-relaxed">{review.biggestMistake}</p>
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
                <h4 className="text-sm font-semibold text-indigo-400">Rekomendasi AI</h4>
              </div>
              <p className="text-sm text-[#9CA3AF] leading-relaxed">{review.recommendation}</p>
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
                <h4 className="text-sm font-semibold text-[#F3F4F6]">Isu Perilaku Teratas</h4>
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
              <h4 className="text-sm font-semibold text-[#F3F4F6]">Distribusi Emosi</h4>
            </div>
            <EmotionBarChart data={emotionData} />
          </motion.div>
        </div>
      )}

      {/* Previous weeks */}
      <div className="bg-[#151827] border border-[#232636] rounded-[14px] p-6">
        <h4 className="text-sm font-semibold text-[#F3F4F6] mb-4 flex items-center gap-2">
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
                    <p className="text-[10px] text-[#6B7280] mt-0.5">
                      {formatWeekRange(r.weekStart, r.weekEnd)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-xs text-[#6B7280]">{r.totalTrades} trade</p>
                      <p className={`text-xs font-financial font-medium ${(r.totalPnL ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        ${(r.totalPnL ?? 0).toFixed(0)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-[#6B7280]">WR</p>
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
    </div>
  )
}
