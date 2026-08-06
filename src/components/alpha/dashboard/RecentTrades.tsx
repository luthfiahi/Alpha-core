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
}

interface RecentTradesProps {
  trades: TradeRow[]
  isLoading: boolean
}

function formatPrice(price: number): string {
  return price.toFixed(price >= 100 ? 2 : 4)
}

function formatPnL(val: number): string {
  const sign = val >= 0 ? '+' : ''
  return `${sign}$${val.toFixed(2)}`
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
              <TableHead className="text-xs text-[#6B7280] font-medium h-9 text-right">
                P/L
              </TableHead>
              <TableHead className="text-xs text-[#6B7280] font-medium h-9 text-right">
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
                  colSpan={5}
                  className="h-24 text-center text-sm text-[#6B7280]"
                >
                  Belum ada trade.
                </TableCell>
              </TableRow>
            ) : (
              trades.map((trade) => (
                <TableRow
                  key={trade.id}
                  className="border-b border-[#232636]/50 hover:bg-white/[0.02] cursor-pointer"
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
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
