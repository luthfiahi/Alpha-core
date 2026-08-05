import { create } from "zustand";

// ========================================
// Navigation Store
// Client-side routing for single-page app
// ========================================

export type AppPage =
  | "dashboard"
  | "journal"
  | "journal-new"
  | "journal-detail"
  | "coaching"
  | "analytics"
  | "playbook"
  | "trading-dna"
  | "settings";

interface NavigationState {
  currentPage: AppPage;
  sidebarCollapsed: boolean;
  selectedTradeId: string | null;

  // Actions
  navigate: (page: AppPage) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  selectTrade: (id: string | null) => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  currentPage: "dashboard",
  sidebarCollapsed: false,
  selectedTradeId: null,

  navigate: (page) => set({ currentPage: page }),
  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  selectTrade: (id) => set({ selectedTradeId: id }),
}));

// ========================================
// Trader Store
// ========================================

interface TraderState {
  traderId: string | null;
  traderName: string | null;
  traderEmail: string | null;
  processScore: number | null;
  totalTrades: number;
  winRate: number;

  setTrader: (data: {
    id: string;
    name: string;
    email: string;
    processScore: number;
    totalTrades: number;
    winRate: number;
  }) => void;
  updateProcessScore: (score: number) => void;
  incrementTrades: () => void;
}

export const useTraderStore = create<TraderState>((set) => ({
  traderId: null,
  traderName: null,
  traderEmail: null,
  processScore: null,
  totalTrades: 0,
  winRate: 0,

  setTrader: (data) =>
    set({
      traderId: data.id,
      traderName: data.name,
      traderEmail: data.email,
      processScore: data.processScore,
      totalTrades: data.totalTrades,
      winRate: data.winRate,
    }),
  updateProcessScore: (score) => set({ processScore: score }),
  incrementTrades: () =>
    set((state) => ({ totalTrades: state.totalTrades + 1 })),
}));
