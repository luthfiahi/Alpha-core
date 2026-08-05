export interface TradeItem {
  id: string;
  traderId: string;
  pair: string;
  direction: "LONG" | "SHORT";
  timeframe: string | null;
  strategy: string | null;
  entryPrice: number;
  exitPrice: number | null;
  stopLoss: number | null;
  takeProfit: number | null;
  lotSize: number | null;
  pipResult: number | null;
  profitLoss: number;
  currency: string;
  status: string;
  entryTime: string | null;
  exitTime: string | null;
  screenshotUrl: string | null;
  processScore: number | null;
  planNotes: string | null;
  reflectionNotes: string | null;
  emotionBefore: string | null;
  emotionAfter: string | null;
  lessonLearned: string | null;
  hasReflected: boolean;
  tags: string | null; // JSON string
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface TradeFilters {
  dateRange: string;
  pair: string;
  direction: string;
  result: string;
  hasReflected: string;
}

export interface TradesResponse {
  trades: TradeItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  filters: {
    availablePairs: string[];
  };
}

export const DEFAULT_FILTERS: TradeFilters = {
  dateRange: "all",
  pair: "ALL",
  direction: "ALL",
  result: "ALL",
  hasReflected: "ALL",
};

export function getScoreColor(score: number | null | undefined): string {
  if (score === null || score === undefined) return "text-[#6B7280]";
  if (score >= 80) return "text-[#22C55E]";
  if (score >= 60) return "text-[#F59E0B]";
  if (score >= 40) return "text-[#F97316]";
  return "text-[#EF4444]";
}

export function getScoreBgColor(score: number | null | undefined): string {
  if (score === null || score === undefined) return "bg-[#6B7280]/15 text-[#6B7280]";
  if (score >= 80) return "bg-[#22C55E]/15 text-[#22C55E]";
  if (score >= 60) return "bg-[#F59E0B]/15 text-[#F59E0B]";
  if (score >= 40) return "bg-[#F97316]/15 text-[#F97316]";
  return "bg-[#EF4444]/15 text-[#EF4444]";
}

export function formatPnL(value: number): string {
  const prefix = value >= 0 ? "+" : "";
  return `${prefix}${value.toFixed(2)}`;
}

export function parseTags(tagsStr: string | null): string[] {
  if (!tagsStr) return [];
  try {
    const parsed = JSON.parse(tagsStr);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getDateRange(range: string): { dateFrom?: string; dateTo?: string } {
  const now = new Date();
  switch (range) {
    case "7d": {
      const from = new Date(now);
      from.setDate(from.getDate() - 7);
      return { dateFrom: from.toISOString() };
    }
    case "30d": {
      const from = new Date(now);
      from.setDate(from.getDate() - 30);
      return { dateFrom: from.toISOString() };
    }
    case "90d": {
      const from = new Date(now);
      from.setDate(from.getDate() - 90);
      return { dateFrom: from.toISOString() };
    }
    default:
      return {};
  }
}
