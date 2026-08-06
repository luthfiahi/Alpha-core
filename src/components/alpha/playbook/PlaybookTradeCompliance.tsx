'use client';

import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Circle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { LinkedTrade } from './types';

interface PlaybookTradeComplianceProps {
  trades: LinkedTrade[];
}

function getComplianceColor(score: number | null) {
  if (score === null) return 'text-[#4B5563]';
  if (score >= 0.8) return 'text-emerald-400';
  if (score >= 0.5) return 'text-amber-400';
  return 'text-red-400';
}

function getComplianceBg(score: number | null) {
  if (score === null) return 'bg-[#4B5563]/10';
  if (score >= 0.8) return 'bg-emerald-400/10';
  if (score >= 0.5) return 'bg-amber-400/10';
  return 'bg-red-400/10';
}

function getComplianceLabel(score: number | null) {
  if (score === null) return 'N/A';
  return `${Math.round(score * 100)}%`;
}

export function PlaybookTradeCompliance({
  trades,
}: PlaybookTradeComplianceProps) {
  if (trades.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="size-12 rounded-xl bg-[#1E2030] border border-[#232636] flex items-center justify-center mb-3">
          <TrendingUp className="size-5 text-[#4B5563]" />
        </div>
        <h4 className="text-sm font-medium text-[#9CA3AF] mb-1">
          Belum ada trade terhubung
        </h4>
        <p className="text-xs text-[#6B7280] max-w-[240px]">
          Hubungkan trade dari journal ke playbook ini untuk melihat kepatuhan.
        </p>
      </div>
    );
  }

  const avgCompliance =
    trades.filter((t) => t.playbookCompliance !== null).length > 0
      ? trades
          .filter((t) => t.playbookCompliance !== null)
          .reduce((acc, t) => acc + (t.playbookCompliance ?? 0), 0) /
        trades.filter((t) => t.playbookCompliance !== null).length
      : null;

  return (
    <div className="space-y-4">
      {/* Summary stats */}
      <div className="flex items-center gap-4">
        <div className="flex-1 bg-[#151827] border border-[#232636] rounded-xl p-3">
          <p className="text-[10px] text-[#6B7280] uppercase tracking-wider mb-1">
            Total Trade
          </p>
          <p className="text-lg font-semibold text-[#F3F4F6]">
            {trades.length}
          </p>
        </div>
        <div className="flex-1 bg-[#151827] border border-[#232636] rounded-xl p-3">
          <p className="text-[10px] text-[#6B7280] uppercase tracking-wider mb-1">
            Rata-rata Compliance
          </p>
          <p
            className={`text-lg font-semibold ${getComplianceColor(avgCompliance)}`}
          >
            {getComplianceLabel(avgCompliance)}
          </p>
        </div>
        <div className="flex-1 bg-[#151827] border border-[#232636] rounded-xl p-3">
          <p className="text-[10px] text-[#6B7280] uppercase tracking-wider mb-1">
            High Compliance
          </p>
          <p className="text-lg font-semibold text-emerald-400">
            {
              trades.filter((t) => (t.playbookCompliance ?? 0) >= 0.8)
                .length
            }
          </p>
        </div>
      </div>

      {/* Trade list */}
      <ScrollArea className="max-h-96">
        <div className="space-y-2">
          {trades.map((trade) => (
            <div
              key={trade.id}
              className="flex items-center gap-3 bg-[#151827] border border-[#232636] rounded-lg px-3 py-2.5 hover:bg-[#1E2030] transition-colors"
            >
              {/* Direction badge */}
              <Badge
                variant="outline"
                className={`text-[10px] px-1.5 py-0 h-5 font-medium shrink-0 ${
                  trade.direction === 'LONG'
                    ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
                    : 'text-red-400 bg-red-400/10 border-red-400/20'
                } border`}
              >
                {trade.direction}
              </Badge>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-[#F3F4F6]">
                    {trade.pair}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-[#6B7280]">
                    Entry: {trade.entryPrice}
                  </span>
                  {trade.exitPrice && (
                    <span className="text-[10px] text-[#6B7280]">
                      Exit: {trade.exitPrice}
                    </span>
                  )}
                </div>
              </div>

              {/* P/L */}
              <div className="text-right shrink-0">
                <p
                  className={`text-xs font-semibold font-mono ${
                    trade.profitLoss >= 0
                      ? 'text-emerald-400'
                      : 'text-red-400'
                  }`}
                >
                  {trade.profitLoss >= 0 ? '+' : ''}
                  {trade.profitLoss.toFixed(2)}
                </p>
              </div>

              {/* Compliance score */}
              <div
                className={`shrink-0 flex items-center gap-1.5 px-2 py-1 rounded-md ${getComplianceBg(trade.playbookCompliance)}`}
              >
                {trade.playbookCompliance !== null &&
                trade.playbookCompliance >= 0.8 ? (
                  <CheckCircle2
                    className={`size-3 ${getComplianceColor(trade.playbookCompliance)}`}
                  />
                ) : (
                  <Circle
                    className={`size-3 ${getComplianceColor(trade.playbookCompliance)}`}
                  />
                )}
                <span
                  className={`text-[11px] font-medium ${getComplianceColor(trade.playbookCompliance)}`}
                >
                  {getComplianceLabel(trade.playbookCompliance)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
