'use client';

import { format } from 'date-fns';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { TradeItem } from './types';
import { formatPnL, parseTags } from './types';

interface TradeCardViewProps {
  trades: TradeItem[];
  onSelectTrade: (id: string) => void;
}

export function TradeCardView({ trades, onSelectTrade }: TradeCardViewProps) {
  if (trades.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {trades.map((trade) => {
        const pnlPositive = trade.profitLoss >= 0;
        const dateStr = trade.entryTime
          ? format(new Date(trade.entryTime), 'dd MMM yyyy')
          : format(new Date(trade.createdAt), 'dd MMM yyyy');
        const tags = parseTags(trade.tags);

        return (
          <button
            key={trade.id}
            type="button"
            onClick={() => onSelectTrade(trade.id)}
            className="alpha-card-interactive p-4 text-left cursor-pointer w-full"
          >
            {/* Header: Pair + Direction + Reflection */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <span className="font-financial text-lg font-bold text-[#F3F4F6]">
                  {trade.pair}
                </span>
                <span
                  className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${
                    trade.direction === 'LONG'
                      ? 'bg-[#22C55E]/15 text-[#22C55E]'
                      : 'bg-[#EF4444]/15 text-[#EF4444]'
                  }`}
                >
                  {trade.direction}
                </span>
              </div>
              {trade.hasReflected ? (
                <CheckCircle2 className="size-4 text-[#22C55E] shrink-0" />
              ) : (
                <AlertTriangle className="size-4 text-[#F59E0B] shrink-0" />
              )}
            </div>

            {/* Prices */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <p className="text-[10px] text-[#6B7280] uppercase tracking-wider mb-0.5">Entry</p>
                <p className="font-financial text-sm text-[#9CA3AF]">
                  {(trade.entryPrice ?? 0).toFixed(Number(trade.entryPrice) >= 100 ? 3 : 5)}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-[#6B7280] uppercase tracking-wider mb-0.5">Exit</p>
                <p className="font-financial text-sm text-[#9CA3AF]">
                  {trade.exitPrice !== null
                    ? (trade.exitPrice ?? 0).toFixed(Number(trade.exitPrice) >= 100 ? 3 : 5)
                    : '—'}
                </p>
              </div>
            </div>

            {/* P/L + Date */}
            <div className="flex items-end justify-between pt-3 border-t border-[#232636]">
              <span
                className={`font-financial text-base font-bold ${
                  pnlPositive ? 'text-[#22C55E]' : 'text-[#EF4444]'
                }`}
              >
                {formatPnL(trade.profitLoss)}
              </span>
              <span className="text-xs text-[#6B7280]">{dateStr}</span>
            </div>

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-[#6366F1]/10 border border-[#6366F1]/20 px-2 py-0.5 text-[10px] text-[#818CF8]"
                  >
                    {tag}
                  </span>
                ))}
                {tags.length > 3 && (
                  <span className="text-[10px] text-[#6B7280] self-center">
                    +{tags.length - 3}
                  </span>
                )}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
