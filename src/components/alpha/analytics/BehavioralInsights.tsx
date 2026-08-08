'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  CheckCircle2,
  Circle,
  AlertOctagon,
  AlertTriangle,
  Filter,
  Loader2,
  Brain,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'

// ========================================
// Types
// ========================================
interface BehavioralEvent {
  id: string
  behaviorType: string
  severity: string
  confidence: number
  aiAnalysis: string | null
  resolved: boolean
  createdAt: string
}

interface DistributionItem {
  behaviorType: string
  _count: { id: number }
}

interface SeverityDistItem {
  severity: string
  _count: { id: number }
}

interface BehavioralData {
  events: BehavioralEvent[]
  distribution: DistributionItem[]
  severityDistribution: SeverityDistItem[]
  unresolvedCount: number
}

// ========================================
// Constants
// ========================================
const BEHAVIOR_COLORS: Record<string, string> = {
  REVENGE_TRADING: '#EF4444',
  FOMO: '#F59E0B',
  OVERCONFIDENCE: '#A855F7',
  FEAR: '#3B82F6',
  MOVING_STOP_LOSS: '#F97316',
  EARLY_CLOSE: '#EAB308',
}

const BEHAVIOR_LABELS: Record<string, string> = {
  REVENGE_TRADING: 'Revenge Trading',
  FOMO: 'FOMO',
  OVERCONFIDENCE: 'Overconfidence',
  FEAR: 'Fear',
  MOVING_STOP_LOSS: 'Moving Stop Loss',
  EARLY_CLOSE: 'Early Close',
}

const SEVERITY_COLORS: Record<string, string> = {
  LOW: '#22C55E',
  MEDIUM: '#F59E0B',
  HIGH: '#F97316',
  CRITICAL: '#EF4444',
}

const SEVERITY_LABELS: Record<string, string> = {
  LOW: 'Rendah',
  MEDIUM: 'Sedang',
  HIGH: 'Tinggi',
  CRITICAL: 'Kritis',
}

const BEHAVIOR_TYPES = Object.keys(BEHAVIOR_LABELS)
const SEVERITY_LEVELS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']

// ========================================
// Component
// ========================================
export function BehavioralInsights() {
  const [data, setData] = useState<BehavioralData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [severityFilter, setSeverityFilter] = useState<string>('')
  const [resolvedFilter, setResolvedFilter] = useState<string>('')
  const [resolvingId, setResolvingId] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      setError(null)
      const params = new URLSearchParams()
      if (typeFilter) params.set('type', typeFilter)
      if (severityFilter) params.set('severity', severityFilter)
      if (resolvedFilter) params.set('resolved', resolvedFilter)
      params.set('limit', '50')

      const res = await fetch(`/api/analytics/behavioral?${params.toString()}`)
      const json = await res.json()
      setData(json)
    } catch (err) {
      console.error('Failed to fetch behavioral data:', err)
      setError('Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }, [typeFilter, severityFilter, resolvedFilter])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleResolve = async (id: string) => {
    setResolvingId(id)
    try {
      await fetch(`/api/analytics/behavioral/${id}`, { method: 'PUT' })
      await fetchData()
    } catch (err) {
      console.error('Failed to resolve event:', err)
    } finally {
      setResolvingId(null)
    }
  }

  const pieData = (data?.distribution || []).map((d) => ({
    name: BEHAVIOR_LABELS[d.behaviorType] || d.behaviorType,
    value: d._count.id,
    color: BEHAVIOR_COLORS[d.behaviorType] || '#6B7280',
    type: d.behaviorType,
  }))

  const activeFilters = [typeFilter, severityFilter, resolvedFilter].filter(Boolean).length

  const clearFilters = () => {
    setTypeFilter('')
    setSeverityFilter('')
    setResolvedFilter('')
  }

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr)
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return dateStr
    }
  }

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
              onClick={fetchData}
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
        <Skeleton className="h-[300px] rounded-[14px]" />
        <Skeleton className="h-[400px] rounded-[14px]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with unresolved count */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="alpha-heading-sm text-[#F3F4F6]">Insight Perilaku</h3>
          <p className="alpha-caption mt-0.5">
            {data?.unresolvedCount ?? 0} event belum diselesaikan
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#151827] border border-[#232636] rounded-[14px] p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-3.5 h-3.5 text-[#6B7280]" />
          <span className="alpha-label text-[#9CA3AF]">Filter</span>
          {activeFilters > 0 && (
            <button
              onClick={clearFilters}
              className="ml-auto alpha-caption text-indigo-400 hover:text-indigo-300"
            >
              Hapus semua
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Type filter */}
          <div className="flex flex-wrap gap-1">
            {BEHAVIOR_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(typeFilter === type ? '' : type)}
                className="alpha-badge-interactive alpha-press px-2.5 py-1 rounded-full text-[10px] font-medium border transition-all"
                style={
                  typeFilter === type
                    ? {
                        borderColor: BEHAVIOR_COLORS[type] + '50',
                        backgroundColor: BEHAVIOR_COLORS[type] + '15',
                        color: BEHAVIOR_COLORS[type],
                      }
                    : {
                        borderColor: '#232636',
                        color: '#6B7280',
                      }
                }
              >
                {BEHAVIOR_LABELS[type]}
              </button>
            ))}
          </div>

          {/* Severity filter */}
          <div className="w-px h-6 bg-[#232636] mx-1 hidden sm:block" />
          <div className="flex gap-1">
            {SEVERITY_LEVELS.map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(severityFilter === sev ? '' : sev)}
                className="alpha-badge-interactive alpha-press px-2.5 py-1 rounded-full text-[10px] font-medium border transition-all"
                style={
                  severityFilter === sev
                    ? {
                        borderColor: SEVERITY_COLORS[sev] + '50',
                        backgroundColor: SEVERITY_COLORS[sev] + '15',
                        color: SEVERITY_COLORS[sev],
                      }
                    : {
                        borderColor: '#232636',
                        color: '#6B7280',
                      }
                }
              >
                {SEVERITY_LABELS[sev]}
              </button>
            ))}
          </div>

          {/* Resolved filter */}
          <div className="w-px h-6 bg-[#232636] mx-1 hidden sm:block" />
          <div className="flex gap-1">
            <button
              onClick={() => setResolvedFilter(resolvedFilter === 'false' ? '' : 'false')}
              className={`alpha-badge-interactive alpha-press px-2.5 py-1 rounded-full text-[10px] font-medium border transition-all ${
                resolvedFilter === 'false'
                  ? 'border-red-500/50 bg-red-500/15 text-red-400'
                  : 'border-[#232636] text-[#6B7280]'
              }`}
            >
              Belum
            </button>
            <button
              onClick={() => setResolvedFilter(resolvedFilter === 'true' ? '' : 'true')}
              className={`alpha-badge-interactive alpha-press px-2.5 py-1 rounded-full text-[10px] font-medium border transition-all ${
                resolvedFilter === 'true'
                  ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-400'
                  : 'border-[#232636] text-[#6B7280]'
              }`}
            >
              Selesai
            </button>
          </div>
        </div>
      </div>

      {/* Distribution + Event Feed Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie Chart */}
        <div className="bg-[#151827] border border-[#232636] rounded-[14px] p-5">
          <h4 className="alpha-heading-sm text-[#F3F4F6] mb-4">Distribusi Tipe Perilaku</h4>
          {pieData.length > 0 ? (
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null
                      const item = payload[0].payload as { name: string; value: number; color: string }
                      return (
                        <div className="bg-[#151827] border border-[#232636] rounded-lg px-3 py-2">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="text-xs text-[#F3F4F6]">{item.name}</span>
                          </div>
                          <p className="alpha-caption mt-0.5">{item.value} event</p>
                        </div>
                      )
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[220px] flex items-center justify-center">
              <p className="alpha-body text-[#6B7280]">Belum ada data</p>
            </div>
          )}
          {/* Legend */}
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-2">
            {pieData.map((d) => (
              <div key={d.type} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                <span className="alpha-caption text-[#9CA3AF] truncate">{d.name}</span>
                <span className="alpha-caption text-[#6B7280] ml-auto">{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Event Feed */}
        <div className="lg:col-span-2 alpha-animate-in bg-[#151827] border border-[#232636] rounded-[14px] p-5">
          <h4 className="alpha-heading-sm text-[#F3F4F6] mb-4">Timeline Event</h4>
          <ScrollArea className="max-h-[400px] overflow-y-auto">
            <div className="space-y-3 pr-2">
              {data?.events && data.events.length > 0 ? (
                data.events.map((event) => (
                  <div
                    key={event.id}
                    className={`p-4 rounded-lg border transition-colors alpha-row-hover ${
                      event.resolved
                        ? 'bg-[#10121E] border-[#232636] opacity-60'
                        : 'bg-[#10121E] border-[#232636] hover:bg-[#1E2030]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Behavior type badge */}
                        <Badge
                          className="alpha-badge-interactive text-[10px] px-2 py-0.5 rounded-full border-0 font-medium"
                          style={{
                            backgroundColor: (BEHAVIOR_COLORS[event.behaviorType] || '#6B7280') + '20',
                            color: BEHAVIOR_COLORS[event.behaviorType] || '#6B7280',
                          }}
                        >
                          {BEHAVIOR_LABELS[event.behaviorType] || event.behaviorType}
                        </Badge>
                        {/* Severity badge */}
                        <Badge
                          className="alpha-badge-interactive text-[10px] px-2 py-0.5 rounded-full border-0 font-medium"
                          style={{
                            backgroundColor: (SEVERITY_COLORS[event.severity] || '#6B7280') + '20',
                            color: SEVERITY_COLORS[event.severity] || '#6B7280',
                          }}
                        >
                          {SEVERITY_LABELS[event.severity] || event.severity}
                        </Badge>
                        {event.resolved && (
                          <span className="flex items-center gap-1 alpha-caption text-emerald-400">
                            <CheckCircle2 className="w-3 h-3" />
                            Selesai
                          </span>
                        )}
                      </div>
                      <span className="alpha-caption flex-shrink-0">
                        {formatDate(event.createdAt)}
                      </span>
                    </div>

                    {/* AI Analysis */}
                    {event.aiAnalysis && (
                      <div className="flex items-start gap-2 mt-2">
                        <Brain className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-[#9CA3AF] leading-relaxed">{event.aiAnalysis}</p>
                      </div>
                    )}

                    {/* Confidence + Resolve */}
                    <div className="flex items-center justify-between mt-3">
                      <span className="alpha-caption">
                        Confidence: {Math.round(event.confidence * 100)}%
                      </span>
                      {!event.resolved && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2.5 text-[10px] text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 alpha-press"
                          onClick={() => handleResolve(event.id)}
                          disabled={resolvingId === event.id}
                        >
                          {resolvingId === event.id ? (
                            <Loader2 className="w-3 h-3 animate-spin mr-1" />
                          ) : (
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                          )}
                          Tandai Selesai
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center">
                  <AlertOctagon className="w-8 h-8 text-[#232636] mx-auto mb-2" />
                  <p className="alpha-body text-[#6B7280]">Tidak ada event ditemukan</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}
