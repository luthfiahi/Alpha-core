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
import { ArrowRight, FileText } from 'lucide-react'
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
            <Skeleton className="h-4 w-12 bg-[#232636] ml-auto" />
          </TableCell>
        </TableRow>
      ))}
    </>
  )
}

export function RecentTrades({ trades, isLoading }: RecentTradesProps) {
  const navigate = useNavigationStore((s) => s.navigate)

  return (
    <div className="alpha-card p-0 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#232636]">
        <h3 className="text-sm font-semibold text-[#F3F4F6]">Recent Trades</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('journal')}
          className="text-xs text-[#6366F1] hover:text-[#818CF8] hover:bg-transparent gap-1 h-auto p-0"
        >
          View All
          <ArrowRight className="h-3 w-3" />
        </Button>
      </div>

      {/* Table */}
      <div className="max-h-96 overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-[#232636] hover:bg-transparent">
              <TableHead className="text-xs text-[#6B7280] font-medium h-9">
                Pair
              </TableHead>
              <TableHead className="text-xs text-[#6B7280] font-medium h-9">
                Dir
              </TableHead>
              <TableHead className="text-xs text-[#6B7280] font-medium h-9 text-right">
                Entry
              </TableHead>
              <TableHead className="text-xs text-[#6B7280] font-medium h-9 text-right hidden md:table-cell">
                Date
              </TableHead>
              <TableHead className="text-xs text-[#6B7280] font-medium h-9 text-right">
                P/L
              </TableHead>
              <TableHead className="text-xs text-[#6B7280] font-medium h-9 text-right">
                Time
              </TableHead>
              <TableHead className="text-xs text-[#6B7280] font-medium h-9 hidden sm:table-cell">
                Status
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <SkeletonRows />
            ) : trades.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-auto py-8"
                >
                  <div className="flex flex-col items-center gap-2">
                    <FileText className="h-6 w-6 text-[#6B7280]" />
                    <p className="text-sm font-medium text-[#9CA3AF]">
                      Belum ada trade tercatat
                    </p>
                    <p className="text-xs text-[#6B7280]">
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
                      Log Trade Pertama
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              trades.map((trade) => (
                <TableRow
                  key={trade.id}
                  className="border-b border-[#232636]/50 hover:bg-white/[0.04] cursor-pointer transition-colors duration-150"
                  onClick={() => {
                    useNavigationStore.getState().selectTrade(trade.id)
                    navigate('journal-detail')
                  }}
                >
                  <TableCell className="text-sm font-medium text-[#F3F4F6] py-3">
                    {trade.pair}
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
                  <TableCell className="text-right py-3 hidden md:table-cell">
                    <span className="text-xs text-[#6B7280]">
                      {formatDate(trade.entryTime ?? trade.createdAt)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right py-3">
                    <span
                      className={`font-financial text-sm font-medium ${
                        trade.profitLoss >= 0
                          ? 'text-[#22C55E]'
                          : 'text-[#EF4444]'
                      }`}
                    >
                      {formatPnL(trade.profitLoss)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right py-3">
                    <span className="text-xs text-[#6B7280]">
                      {formatTime(trade.entryTime ?? trade.createdAt)}
                    </span>
                  </TableCell>
                  <TableCell className="py-3 hidden sm:table-cell">
                    {getStatusBadge(trade.status)}
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
