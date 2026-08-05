export type SessionType = 'LONDON' | 'NEW_YORK' | 'ASIAN' | 'CUSTOM' | null;

export interface PlaybookListItem {
  id: string;
  name: string;
  description: string | null;
  sessionType: SessionType;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  _count: {
    checklists: number;
    trades: number;
  };
}

export interface PlaybookChecklistItem {
  id: string;
  text: string;
  sortOrder: number;
  createdAt: string;
}

export interface PlaybookChecklist {
  id: string;
  playbookId: string;
  title: string;
  description: string | null;
  sortOrder: number;
  createdAt: string;
  items: PlaybookChecklistItem[];
}

export interface LinkedTrade {
  id: string;
  pair: string;
  direction: string;
  entryPrice: number;
  exitPrice: number | null;
  profitLoss: number;
  playbookCompliance: number | null;
  processScore: number | null;
  createdAt: string;
}

export interface PlaybookDetail {
  id: string;
  name: string;
  description: string | null;
  sessionType: SessionType;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  checklists: PlaybookChecklist[];
  trades: LinkedTrade[];
}

export const SESSION_TYPE_CONFIG: Record<string, { label: string; color: string; bgColor: string; borderColor: string }> = {
  LONDON: { label: 'London', color: 'text-emerald-400', bgColor: 'bg-emerald-400/10', borderColor: 'border-emerald-400/20' },
  NEW_YORK: { label: 'New York', color: 'text-blue-400', bgColor: 'bg-blue-400/10', borderColor: 'border-blue-400/20' },
  ASIAN: { label: 'Asian', color: 'text-amber-400', bgColor: 'bg-amber-400/10', borderColor: 'border-amber-400/20' },
  CUSTOM: { label: 'Custom', color: 'text-gray-400', bgColor: 'bg-gray-400/10', borderColor: 'border-gray-400/20' },
};

export const SESSION_TYPE_OPTIONS = [
  { value: 'LONDON', label: 'London' },
  { value: 'NEW_YORK', label: 'New York' },
  { value: 'ASIAN', label: 'Asian' },
  { value: 'CUSTOM', label: 'Custom' },
];
