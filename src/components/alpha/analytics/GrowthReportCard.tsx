'use client'

import { motion } from 'framer-motion'
import {
  FileText,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Target,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Minus,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

// ========================================
// Types
// ========================================
export interface GrowthReportData {
  id: string
  reportType: string
  periodStart: string
  periodEnd: string
  totalTrades: number
  processScore: number | null
  processScoreChange: number | null
  winRate: number | null
  totalPnL: number | null
  ruleCompliance: number | null
  playbookUsage: number | null
  behaviorsImproved: string | null
  behaviorsToImprove: string | null
  nextWeekTargets: string | null
  aiSummary: string | null
  highlight: string | null
  generatedAt: string
}

// ========================================
// Helpers
// ========================================
function parseJSONList(raw: string | null): string[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function formatPeriodDate(dateStr: string): string {
  try {
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
  } catch {
    return dateStr
  }
}

function formatFullDate(isoStr: string): string {
  try {
    const d = new Date(isoStr)
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return isoStr
  }
}

function ScoreChangeIndicator({ change }: { change: number | null }) {
  if (change === null || change === undefined) return null
  if (change > 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-emerald-400 text-xs font-financial font-medium">
        <ArrowUp className="w-3 h-3" />
        +{change}
      </span>
    )
  }
  if (change < 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-red-400 text-xs font-financial font-medium">
        <ArrowDown className="w-3 h-3" />
        {change}
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-0.5 text-[#6B7280] text-xs font-financial font-medium">
      <Minus className="w-3 h-3" />
      0
    </span>
  )
}

// ========================================
// Main GrowthReportCard
// ========================================
export function GrowthReportCard({ report }: { report: GrowthReportData }) {
  const behaviorsImproved = parseJSONList(report.behaviorsImproved)
  const behaviorsToImprove = parseJSONList(report.behaviorsToImprove)
  const nextTargets = parseJSONList(report.nextWeekTargets)

  const isMonthly = report.reportType === 'MONTHLY'
  const typeLabel = isMonthly ? 'Laporan Bulanan' : 'Laporan Mingguan'
  const typeVariant = isMonthly ? 'secondary' as const : 'default' as const
  const periodText = `${formatPeriodDate(report.periodStart)} — ${formatPeriodDate(report.periodEnd)}`

  return (
    <motion.div
      className="alpha-animate-in bg-[#151827] border border-[#232636] rounded-[14px] overflow-hidden"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Gradient top border */}
      <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500" />

      <div className="p-6 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <FileText className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="alpha-heading-sm text-[#F3F4F6]">{typeLabel}</h3>
                <Badge variant={typeVariant} className="alpha-badge-interactive text-[10px] px-2 py-0.5">
                  {typeLabel}
                </Badge>
              </div>
              <p className="alpha-caption mt-0.5">{periodText}</p>
            </div>
          </div>
          {report.highlight && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 max-w-[260px]">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <p className="alpha-caption text-amber-300 font-medium leading-tight line-clamp-2">
                {report.highlight}
              </p>
            </div>
          )}
        </div>

        {/* Highlight on mobile */}
        {report.highlight && (
          <div className="sm:hidden flex items-start gap-1.5 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="alpha-caption text-amber-300 font-medium leading-tight">
              {report.highlight}
            </p>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-[#10121E] border border-[#232636] rounded-lg p-3">
            <p className="alpha-caption uppercase tracking-wider">Trade</p>
            <p className="font-financial text-lg font-semibold text-[#F3F4F6] mt-0.5">
              {report.totalTrades}
            </p>
          </div>
          <div className="bg-[#10121E] border border-[#232636] rounded-lg p-3">
            <p className="alpha-caption uppercase tracking-wider">Score</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <p className="font-financial text-lg font-semibold text-[#F3F4F6]">
                {report.processScore ?? 0}
              </p>
              <ScoreChangeIndicator change={report.processScoreChange} />
            </div>
          </div>
          <div className="bg-[#10121E] border border-[#232636] rounded-lg p-3">
            <p className="alpha-caption uppercase tracking-wider">Win Rate</p>
            <p className="font-financial text-lg font-semibold text-[#F3F4F6] mt-0.5">
              {report.winRate ?? 0}%
            </p>
          </div>
          <div className="bg-[#10121E] border border-[#232636] rounded-lg p-3">
            <p className="alpha-caption uppercase tracking-wider">P/L</p>
            <p className={`font-financial text-lg font-semibold mt-0.5 ${(report.totalPnL ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              ${(report.totalPnL ?? 0).toFixed(0)}
            </p>
          </div>
        </div>

        {/* Compliance bars */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="alpha-caption uppercase tracking-wider">Rule Compliance</span>
                <span className="text-xs font-financial font-medium text-[#F3F4F6]">
                  {Math.round(report.ruleCompliance ?? 0)}%
                </span>
              </div>
              <div className="h-1.5 bg-[#232636] rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-indigo-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${report.ruleCompliance ?? 0}%` }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="alpha-caption uppercase tracking-wider">Playbook Usage</span>
                <span className="text-xs font-financial font-medium text-[#F3F4F6]">
                  {Math.round(report.playbookUsage ?? 0)}%
                </span>
              </div>
              <div className="h-1.5 bg-[#232636] rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-emerald-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${report.playbookUsage ?? 0}%` }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                />
              </div>
            </div>
          </div>
        </div>

        <Separator className="bg-[#232636]" />

        {/* Behaviors Improved */}
        {behaviorsImproved.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <h4 className="alpha-heading-xs text-emerald-400 uppercase tracking-wider">
                Perilaku yang Membaik
              </h4>
            </div>
            <div className="space-y-1.5">
              {behaviorsImproved.map((item, i) => (
                <div key={i} className="flex items-start gap-2.5 pl-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500/60 mt-0.5 flex-shrink-0" />
                  <p className="alpha-body leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Behaviors To Improve */}
        {behaviorsToImprove.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h4 className="alpha-heading-xs text-amber-400 uppercase tracking-wider">
                Masih Perlu Diperbaiki
              </h4>
            </div>
            <div className="space-y-1.5">
              {behaviorsToImprove.map((item, i) => (
                <div key={i} className="flex items-start gap-2.5 pl-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400/60 mt-2 flex-shrink-0" />
                  <p className="alpha-body leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Next Period Targets */}
        {nextTargets.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <Target className="w-4 h-4 text-indigo-400" />
              <h4 className="alpha-heading-xs text-indigo-400 uppercase tracking-wider">
                Target {isMonthly ? 'Bulan' : 'Minggu'} Depan
              </h4>
            </div>
            <div className="space-y-1.5">
              {nextTargets.map((item, i) => (
                <div key={i} className="flex items-start gap-2.5 pl-1">
                  <ArrowUp className="w-3.5 h-3.5 text-indigo-500/60 mt-0.5 flex-shrink-0" />
                  <p className="alpha-body leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Summary */}
        {report.aiSummary && (
          <>
            <Separator className="bg-[#232636]" />
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <h4 className="alpha-heading-xs text-purple-400 uppercase tracking-wider">
                  AI Summary
                </h4>
              </div>
              <p className="alpha-body text-[#D1D5DB] leading-relaxed pl-1">
                &ldquo;{report.aiSummary}&rdquo;
              </p>
            </div>
          </>
        )}

        {/* Footer timestamp */}
        <div className="flex items-center gap-1.5 pt-1">
          <TrendingUp className="w-3 h-3 text-[#4B5563]" />
          <p className="alpha-caption text-[#4B5563]">
            Digenerate: {formatFullDate(report.generatedAt)}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

// ========================================
// Compact Report Item (for history list)
// ========================================
export function GrowthReportHistoryItem({ report, isExpanded, onToggle }: {
  report: GrowthReportData
  isExpanded: boolean
  onToggle: () => void
}) {
  const behaviorsImproved = parseJSONList(report.behaviorsImproved)
  const behaviorsToImprove = parseJSONList(report.behaviorsToImprove)
  const nextTargets = parseJSONList(report.nextWeekTargets)
  const isMonthly = report.reportType === 'MONTHLY'

  const scoreColor = (report.processScore ?? 0) <= 40
    ? '#EF4444'
    : (report.processScore ?? 0) <= 60
      ? '#F59E0B'
      : (report.processScore ?? 0) <= 80
        ? '#6366F1'
        : '#22C55E'

  return (
    <div className="bg-[#151827] border border-[#232636] rounded-xl overflow-hidden transition-colors hover:bg-[#1a1d2e]">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 p-4 text-left"
      >
        {/* Score badge */}
        <div
          className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: scoreColor + '15' }}
        >
          <span
            className="font-financial text-sm font-bold"
            style={{ color: scoreColor }}
          >
            {report.processScore ?? 0}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-[#F3F4F6] font-medium">
              {formatPeriodDate(report.periodStart)} — {formatPeriodDate(report.periodEnd)}
            </span>
            <Badge
              variant={isMonthly ? 'secondary' : 'outline'}
              className="alpha-badge-interactive text-[10px] px-2 py-0 h-5"
            >
              {isMonthly ? 'Bulanan' : 'Mingguan'}
            </Badge>
          </div>
          <p className="alpha-caption mt-0.5 truncate">
            {report.highlight || report.aiSummary || 'Laporan pertumbuhan'}
          </p>
        </div>

        {/* Right side stats */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="text-right hidden sm:block">
            <p className="alpha-caption">Trade</p>
            <p className="text-xs font-financial font-medium text-[#F3F4F6]">{report.totalTrades}</p>
          </div>
          <div className="text-right hidden sm:block">
            <p className="alpha-caption">P/L</p>
            <p className={`text-xs font-financial font-medium ${(report.totalPnL ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              ${(report.totalPnL ?? 0).toFixed(0)}
            </p>
          </div>
          <ScoreChangeIndicator change={report.processScoreChange} />
          <svg
            className={`w-4 h-4 text-[#6B7280] transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <motion.div
          className="px-4 pb-4 border-t border-[#232636]"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.2 }}
        >
          <div className="pt-4 space-y-3">
            {/* Stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="text-center p-2 bg-[#10121E] rounded-lg">
                <p className="alpha-caption">Score</p>
                <p className="font-financial text-sm font-semibold text-[#F3F4F6]">{report.processScore ?? 0}</p>
              </div>
              <div className="text-center p-2 bg-[#10121E] rounded-lg">
                <p className="alpha-caption">Win Rate</p>
                <p className="font-financial text-sm font-semibold text-[#F3F4F6]">{report.winRate ?? 0}%</p>
              </div>
              <div className="text-center p-2 bg-[#10121E] rounded-lg">
                <p className="alpha-caption">Compliance</p>
                <p className="font-financial text-sm font-semibold text-[#F3F4F6]">{Math.round(report.ruleCompliance ?? 0)}%</p>
              </div>
              <div className="text-center p-2 bg-[#10121E] rounded-lg">
                <p className="alpha-caption">Playbook</p>
                <p className="font-financial text-sm font-semibold text-[#F3F4F6]">{Math.round(report.playbookUsage ?? 0)}%</p>
              </div>
            </div>

            {/* Improved behaviors */}
            {behaviorsImproved.length > 0 && (
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="alpha-caption text-emerald-400 font-medium mb-0.5">Membaik:</p>
                  <p className="text-xs text-[#9CA3AF]">{behaviorsImproved.join(' • ')}</p>
                </div>
              </div>
            )}

            {/* To improve */}
            {behaviorsToImprove.length > 0 && (
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="alpha-caption text-amber-400 font-medium mb-0.5">Perlu diperbaiki:</p>
                  <p className="text-xs text-[#9CA3AF]">{behaviorsToImprove.join(' • ')}</p>
                </div>
              </div>
            )}

            {/* Targets */}
            {nextTargets.length > 0 && (
              <div className="flex items-start gap-2">
                <Target className="w-3.5 h-3.5 text-indigo-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="alpha-caption text-indigo-400 font-medium mb-0.5">Target:</p>
                  <p className="text-xs text-[#9CA3AF]">{nextTargets.join(' • ')}</p>
                </div>
              </div>
            )}

            {/* AI Summary */}
            {report.aiSummary && (
              <div className="bg-[#10121E] border border-[#232636] rounded-lg p-3">
                <p className="text-xs text-[#9CA3AF] leading-relaxed italic">
                  &ldquo;{report.aiSummary}&rdquo;
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  )
}
