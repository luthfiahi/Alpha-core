'use client';

import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale/id';
import { MoreHorizontal, Trash2, Eye, CheckCircle2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import type { TradeItem } from './types';
import { getScoreBgColor, formatPnL } from './types';

interface TradeTableViewProps {
  trades: TradeItem[];
  onSelectTrade: (id: string) => void;
  onDeleteTrade: (id: string) => void;
}

export function TradeTableView({ trades, onSelectTrade, onDeleteTrade }: TradeTableViewProps) {
  if (trades.length === 0) return null;

  return (
    <div className="rounded-[14px] border border-[#232636] bg-[#151827] overflow-hidden alpha-card">
      <div className="max-h-[600px] overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-[#232636] hover:bg-transparent">
              <TableHead className="text-[#6B7280] text-[11px] font-medium h-9 pl-4 pr-0 w-1"></TableHead>
              <TableHead className="text-[#6B7280] text-[11px] font-medium h-9 px-3 uppercase tracking-wider">Pair</TableHead>
              <TableHead className="text-[#6B7280] text-[11px] font-medium h-9 uppercase tracking-wider">Date</TableHead>
              <TableHead className="text-[#6B7280] text-[11px] font-medium h-9 uppercase tracking-wider">Direction</TableHead>
              <TableHead className="text-[#6B7280] text-[11px] font-medium h-9 text-right uppercase tracking-wider">Entry</TableHead>
              <TableHead className="text-[#6B7280] text-[11px] font-medium h-9 text-right uppercase tracking-wider">P/L</TableHead>
              <TableHead className="text-[#6B7280] text-[11px] font-medium h-9 text-center uppercase tracking-wider">Process</TableHead>
              <TableHead className="text-[#6B7280] text-[11px] font-medium h-9 text-center uppercase tracking-wider">Reflection</TableHead>
              <TableHead className="text-[#6B7280] text-[11px] font-medium h-9 w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trades.map((trade) => {
              const pnlPositive = trade.profitLoss >= 0;

              return (
                <TableRow
                  key={trade.id}
                  className="border-[#232636]/60 cursor-pointer hover:bg-[#6366F1]/5 transition-all duration-150 alpha-row-hover"
                  onClick={() => onSelectTrade(trade.id)}
                >
                  {/* Left color bar */}
                  <TableCell className="pl-4 pr-0 w-1 p-0">
                    <div
                      className={`w-1 rounded-full my-1.5 ${
                        pnlPositive ? 'bg-[#22C55E]/50' : 'bg-[#EF4444]/50'
                      }`}
                    />
                  </TableCell>

                  {/* Pair */}
                  <TableCell className="px-3 py-3">
                    <span className="font-financial text-sm font-semibold text-[#F3F4F6]">
                      {trade.pair}
                    </span>
                  </TableCell>

                  {/* Date */}
                  <TableCell className="py-3">
                    <span className="text-xs text-[#9CA3AF]">
                      {trade.entryTime
                        ? format(new Date(trade.entryTime), 'd MMM', { locale: idLocale })
                        : '—'}
                    </span>
                  </TableCell>

                  {/* Direction Badge */}
                  <TableCell className="py-3">
                    <span
                      className={
                        `inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-semibold ` +
                        (trade.direction === 'LONG'
                          ? 'bg-[#22C55E]/15 text-[#22C55E]'
                          : 'bg-[#EF4444]/15 text-[#EF4444]')
                      }
                    >
                      {trade.direction}
                    </span>
                  </TableCell>

                  {/* Entry Price */}
                  <TableCell className="py-3 text-right">
                    <span className="font-financial text-sm text-[#9CA3AF]">
                      {(trade.entryPrice ?? 0).toFixed(Number(trade.entryPrice) >= 100 ? 3 : 5)}
                    </span>
                  </TableCell>

                  {/* P/L */}
                  <TableCell className="py-3 text-right">
                    <span
                      className={
                        `font-financial text-sm font-semibold ` +
                        (pnlPositive ? 'text-[#22C55E]' : 'text-[#EF4444]')
                      }
                    >
                      {formatPnL(trade.profitLoss)}
                    </span>
                  </TableCell>

                  {/* Process Score */}
                  <TableCell className="py-3 text-center">
                    {trade.processScore !== null && trade.processScore !== undefined ? (
                      <span
                        className={
                          `inline-flex items-center justify-center rounded-lg px-2 py-0.5 text-xs font-bold ring-1 ring-inset ` +
                          getScoreBgColor(trade.processScore)
                        }
                      >
                        {trade.processScore}
                      </span>
                    ) : (
                      <span className="text-[#4B5563] text-xs">—</span>
                    )}
                  </TableCell>

                  {/* Reflection Status Badge */}
                  <TableCell className="py-3 text-center">
                    {trade.hasReflected ? (
                      <span className="inline-flex items-center gap-1 rounded-lg bg-[#22C55E]/15 px-2 py-0.5 text-[11px] font-medium text-[#22C55E]">
                        <CheckCircle2 className="size-3" />
                        Reflected
                      </span>
                    ) : trade.reflectionNotes ? (
                      <span className="inline-flex items-center rounded-lg bg-[#F59E0B]/15 px-2 py-0.5 text-[11px] font-medium text-[#F59E0B]">
                        Pending
                      </span>
                    ) : (
                      <span className="text-[#4B5563] text-xs">—</span>
                    )}
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="py-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 hover:bg-[#1E2030]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="size-4 text-[#6B7280]" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        className="bg-[#151827] border-[#232636] w-40"
                        align="end"
                      >
                        <DropdownMenuItem
                          className="text-xs text-[#F3F4F6] focus:bg-[#1E2030] focus:text-[#F3F4F6] alpha-link"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectTrade(trade.id);
                          }}
                        >
                          <Eye className="size-3.5 mr-2" />
                          View Detail
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-xs text-[#EF4444] focus:bg-[#EF4444]/10 focus:text-[#EF4444]"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteTrade(trade.id);
                          }}
                        >
                          <Trash2 className="size-3.5 mr-2" />
                          Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}