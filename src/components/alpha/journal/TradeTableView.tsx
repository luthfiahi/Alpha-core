'use client';

import { format } from 'date-fns';
import { CheckCircle2, AlertTriangle, MoreHorizontal, Pencil, Trash2, Eye } from 'lucide-react';
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
    <div className="max-h-[600px] overflow-y-auto rounded-[14px] border border-[#232636] bg-[#151827]">
      <Table>
        <TableHeader>
          <TableRow className="border-[#232636] hover:bg-transparent">
            <TableHead className="text-[#6B7280] text-xs font-medium h-10 px-4">Tanggal</TableHead>
            <TableHead className="text-[#6B7280] text-xs font-medium h-10">Pair</TableHead>
            <TableHead className="text-[#6B7280] text-xs font-medium h-10">Dir</TableHead>
            <TableHead className="text-[#6B7280] text-xs font-medium h-10 text-right">Entry</TableHead>
            <TableHead className="text-[#6B7280] text-xs font-medium h-10 text-right">Exit</TableHead>
            <TableHead className="text-[#6B7280] text-xs font-medium h-10 text-right">P/L</TableHead>
            <TableHead className="text-[#6B7280] text-xs font-medium h-10 text-center">Score</TableHead>
            <TableHead className="text-[#6B7280] text-xs font-medium h-10 text-center">Refleksi</TableHead>
            <TableHead className="text-[#6B7280] text-xs font-medium h-10 w-10"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trades.map((trade) => {
            const pnlPositive = trade.profitLoss >= 0;
            const dateStr = trade.entryTime
              ? format(new Date(trade.entryTime), 'dd MMM yyyy')
              : format(new Date(trade.createdAt), 'dd MMM yyyy');

            return (
              <TableRow
                key={trade.id}
                className="border-[#232636]/60 cursor-pointer hover:bg-[#1E2030]/80 transition-colors duration-150"
                onClick={() => onSelectTrade(trade.id)}
              >
                {/* Date */}
                <TableCell className="px-4 py-3 text-xs text-[#9CA3AF]">
                  {dateStr}
                </TableCell>

                {/* Pair */}
                <TableCell className="py-3">
                  <span className="font-financial text-sm font-semibold text-[#F3F4F6]">
                    {trade.pair}
                  </span>
                </TableCell>

                {/* Direction Badge */}
                <TableCell className="py-3">
                  <span
                    className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${
                      trade.direction === 'LONG'
                        ? 'bg-[#22C55E]/15 text-[#22C55E]'
                        : 'bg-[#EF4444]/15 text-[#EF4444]'
                    }`}
                  >
                    {trade.direction}
                  </span>
                </TableCell>

                {/* Entry Price */}
                <TableCell className="py-3 text-right">
                  <span className="font-financial text-xs text-[#9CA3AF]">
                    {(trade.entryPrice ?? 0).toFixed(Number(trade.entryPrice) >= 100 ? 3 : 5)}
                  </span>
                </TableCell>

                {/* Exit Price */}
                <TableCell className="py-3 text-right">
                  <span className="font-financial text-xs text-[#9CA3AF]">
                    {trade.exitPrice !== null
                      ? (trade.exitPrice ?? 0).toFixed(Number(trade.exitPrice) >= 100 ? 3 : 5)
                      : '—'}
                  </span>
                </TableCell>

                {/* P/L */}
                <TableCell className="py-3 text-right">
                  <span
                    className={`font-financial text-sm font-semibold ${
                      pnlPositive ? 'text-[#22C55E]' : 'text-[#EF4444]'
                    }`}
                  >
                    {formatPnL(trade.profitLoss)}
                  </span>
                </TableCell>

                {/* Process Score */}
                <TableCell className="py-3 text-center">
                  {trade.processScore !== null && trade.processScore !== undefined ? (
                    <span
                      className={`inline-flex items-center justify-center rounded-md px-2 py-0.5 text-xs font-semibold ${getScoreBgColor(
                        trade.processScore
                      )}`}
                    >
                      {trade.processScore}
                    </span>
                  ) : (
                    <span className="text-[#6B7280] text-xs">—</span>
                  )}
                </TableCell>

                {/* Reflection Status */}
                <TableCell className="py-3 text-center">
                  {trade.hasReflected ? (
                    <CheckCircle2 className="size-4 text-[#22C55E] mx-auto" />
                  ) : (
                    <AlertTriangle className="size-4 text-[#F59E0B] mx-auto" />
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
                        <MoreHorizontal className="size-4 text-[#9CA3AF]" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="bg-[#151827] border-[#232636] w-40"
                      align="end"
                    >
                      <DropdownMenuItem
                        className="text-xs text-[#F3F4F6] focus:bg-[#1E2030] focus:text-[#F3F4F6]"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectTrade(trade.id);
                        }}
                      >
                        <Eye className="size-3.5 mr-2" />
                        Lihat Detail
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-xs text-[#F3F4F6] focus:bg-[#1E2030] focus:text-[#F3F4F6]"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectTrade(trade.id);
                        }}
                      >
                        <Pencil className="size-3.5 mr-2" />
                        Edit
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
  );
}
