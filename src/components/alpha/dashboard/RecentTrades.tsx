'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowRight } from 'lucide-react'
import { useNavigationStore } from '@/stores'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale/id'

export interface TradeRow {
  id: string
  pair: string
  direction: string
  entryPrice: number
  profitLoss: number
  entryTime: string | null
  createdAt: string
  status: string
  [key: string]: unknown
}

interface RecentTradesProps {
  trades: TradeRow[]
  isLoading: boolean
}

function formatPrice(price: number): string {
  return Number(price).toFixed(Number(price) >= 100 ? 2 : 4)
}

function formatPnL(val: number): string {
  const sign = val >= 0 ? '+' : ''
  return `${sign}$${Number(val).toFixed(2)}`
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr)
    return format(date, 'd MMM', { locale: localeId })
  } catch {
    return '—'
  }
}

function getStatusBadge(status: string) {
  const s = status?.toUpperCase() ?? ''
  if (s === 'CLOSED') {
    return (
      <Badge
        variant="secondary"
        className="bg-[rgba(34,197,94,0.15)] text-[#22C55E] hover:bg-[rgba(34,197,94,0.2)] border-0 text-[10px] font-semibold px-2 py-0.5"
      >
        {s}
      </Badge>
    )
  }
  if (s === 'OPEN') {
    return (
      <Badge
        variant="secondary"
        className="bg-[rgba(245,158,11,0.15)] text-[#F59E0B] hover:bg-[rgba(245,158,11,0.2)] border-0 text-[10px] font-semibold px-2 py-0.5"
      >
        {s}
      </Badge>
    )
  }
  return (
    <Badge
      variant="secondary"
      className="bg-[rgba(107,114,128,0.15)] text-[#6B7280] hover:bg-[rgba(107,114,128,0.2)] border-0 text-[10px] font-semibold px-2 py-0.5"
    >
      {s || '—'}
    </Badge>
  )
}

function formatTime(dateStr: string | null): string {
  if (!dateStr) return '—'
  try {
    const date = new Date(dateStr)
    return format(date, 'HH:mm', { locale: localeId })
  } catch {
    return '—'
  }
}

function isSignificantPnL(val: number): boolean {
  return Math.abs(val) >= 50
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell>
            <Skeleton className="h-4 w-16 bg-[#232636]" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-14 bg-[#232636]" />
          </TableCell>
          <TableCell className="text-right">
            <Skeleton className="h-4 w-20 bg-[#232636] ml-auto" />
          </TableCell>
          <TableCell className="text-right">
            <Skeleton className="h-4 w-16 bg-[#232636] ml-auto" />
          </TableCell>
          <TableCell className="text-right">
            <Skeleton className="h-5 w-12 bg-[#232636] ml-auto" />
          </TableCell>
        </TableRow>
      ))}
    </>
  )
}

export function RecentTrades({ trades, isLoading }: RecentTradesProps) {
  const navigate = useNavigationStore((s) => s.navigate)
  const displayCount = Math.min(trades.length, 5)

  return (
    <div className="alpha-card p-0 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#232636]">
        <div>
          <h3 className="alpha-heading-sm">Recent Trades</h3>
          <p className="alpha-caption mt-0.5">{displayCount} transaksi terakhir</p>
        </div>
        {trades.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('journal')}
            className="alpha-link text-xs gap-1 h-auto p-0 hover:bg-transparent"
          >
            View all ({trades.length})
            <ArrowRight className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Table — table-fixed prevents content-driven column expansion */}
      <div className="max-h-96 overflow-y-auto overflow-x-hidden">
        <Table>
          <style>{`
            [data-slot="table"] {
              table-layout: fixed;
              width: 100%;
            }
          `}</style>
          <TableHeader>
            <TableRow className="border-b border-[#232636] hover:bg-transparent">
              <TableHead className="alpha-caption font-medium h-9 pl-5" style={{ width: '25%' }}>
                Pair
              </TableHead>
              <TableHead className="alpha-caption font-medium h-9" style={{ width: '16%' }}>
                Dir
              </TableHead>
              <TableHead className="alpha-caption font-medium h-9 text-right" style={{ width: '18%' }}>
                Entry
              </TableHead>
              <TableHead className="alpha-caption font-medium h-9 text-right" style={{ width: '16%' }}>
                P/L
              </TableHead>
              <TableHead className="alpha-caption font-medium h-9 text-right" style={{ width: '12%' }}>
                Status
              </TableHead>
              {/* Hidden columns: Date and Time */}
              <TableHead className="alpha-caption font-medium h-9 text-right hidden lg:table-cell" style={{ width: '8%' }}>
                Date
              </TableHead>
              <TableHead className="alpha-caption font-medium h-9 text-right hidden lg:table-cell" style={{ width: '5%' }}>
                Time
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <SkeletonRows />
            ) : trades.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-auto py-12"
                >
                  <div className="flex flex-col items-center gap-3">
                    {/* CSS illustration: abstract chart shape */}
                    <svg width="64" height="48" viewBox="0 0 64 48" fill="none" className="opacity-30">
                      <rect x="8" y="32" width="4" height="12" rx="2" fill="#6B7280" />
                      <rect x="18" y="24" width="4" height="20" rx="2" fill="#6B7280" />
                      <rect x="28" y="16" width="4" height="28" rx="2" fill="#6B7280" />
                      <rect x="38" y="20" width="4" height="24" rx="2" fill="#6B7280" />
                      <rect x="48" y="8" width="4" height="36" rx="2" fill="#6B7280" />
                      <circle cx="30" cy="18" r="10" stroke="#6366F1" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.5" />
                      <path d="M12 28 L20 20 L30 14 L40 18 L50 10" stroke="#6366F1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />
                    </svg>
                    <p className="text-sm font-medium text-[#9CA3AF]">
                      Belum ada trade tercatat
                    </p>
                    <p className="alpha-caption text-center max-w-[220px]">
                      Mulai catat trade pertamamu untuk melacak performa
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate('journal-new')
                      }}
                      className="mt-1 border-[#2A2D3E] text-[#9CA3AF] hover:bg-[#1E2030] hover:text-white text-xs h-8 gap-1.5"
                    >
                      <ArrowRight className="h-3 w-3" />
                      + Log Trade
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              trades.map((trade) => (
                <TableRow
                  key={trade.id}
                  className="border-b border-[#232636]/50 cursor-pointer transition-colors duration-150 hover:bg-[rgba(255,255,255,0.02)]"
                  onClick={() => {
                    useNavigationStore.getState().selectTrade(trade.id)
                    navigate('journal-detail')
                  }}
                >
                  {/* Pair cell with color border-left */}
                  <TableCell
                    className="text-sm font-medium text-[#F3F4F6] py-3 pl-5 overflow-hidden"
                    style={{
                      borderLeft: `3px solid ${trade.profitLoss >= 0
                        ? (trade.profitLoss === 0 ? 'rgba(34,197,94,0.3)' : 'rgba(34,197,94,0.7)')
                        : 'rgba(239,68,68,0.7)'
                      }`,
                    }}
                  >
                    <span className="truncate block">{trade.pair}</span>
                    {/* Show process score badge if available */}
                    {typeof trade.processScore === 'number' && (
                      <span
                        className="ml-2 text-[10px] font-financial font-medium px-1.5 py-0.5 rounded-full"
                        style={{
                          color: trade.processScore > 60 ? '#22C55E' : trade.processScore > 40 ? '#F59E0B' : '#EF4444',
                          backgroundColor: trade.processScore > 60 ? 'rgba(34,197,94,0.1)' : trade.processScore > 40 ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                        }}
                      >
                        PS {trade.processScore}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="py-3">
                    <Badge
                      variant="secondary"
                      className={
                        trade.direction === 'LONG'
                          ? 'bg-[rgba(34,197,94,0.15)] text-[#22C55E] hover:bg-[rgba(34,197,94,0.2)] border-0 text-[11px] font-semibold px-2 py-0.5'
                          : 'bg-[rgba(239,68,68,0.15)] text-[#EF4444] hover:bg-[rgba(239,68,68,0.2)] border-0 text-[11px] font-semibold px-2 py-0.5'
                      }
                    >
                      {trade.direction}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right py-3">
                    <span className="font-financial text-sm text-[#9CA3AF]">
                      {formatPrice(trade.entryPrice)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right py-3">
                    <span
                      className={`font-financial text-sm ${
                        isSignificantPnL(trade.profitLoss) ? 'font-bold' : 'font-medium'
                      } ${
                        trade.profitLoss >= 0
                          ? 'text-[#22C55E]'
                          : 'text-[#EF4444]'
                      }`}
                      style={
                        isSignificantPnL(trade.profitLoss)
                          ? { textShadow: trade.profitLoss >= 0 ? '0 0 8px rgba(34,197,94,0.3)' : '0 0 8px rgba(239,68,68,0.3)' }
                          : undefined
                      }
                    >
                      {formatPnL(trade.profitLoss)}
                    </span>
                  </TableCell>
                  <TableCell className="py-3">
                    {getStatusBadge(trade.status)}
                  </TableCell>
                  {/* Hidden on smaller screens */}
                  <TableCell className="text-right py-3 hidden lg:table-cell">
                    <span className="alpha-caption">
                      {formatDate(trade.entryTime ?? trade.createdAt)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right py-3 hidden lg:table-cell">
                    <span className="alpha-caption">
                      {formatTime(trade.entryTime ?? trade.createdAt)}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}