'use client'

import { Plus, BookOpen, Brain, BarChart3, PenLine } from 'lucide-react'
import { useNavigationStore, type AppPage } from '@/stores'

interface ActionItem {
  label: string
  page: AppPage
  icon: React.ReactNode
  primary: boolean
  description: string
  ariaLabel: string
}

const actions: ActionItem[] = [
  {
    label: 'Log Trade',
    page: 'journal-new',
    icon: <Plus className="h-5 w-5" />,
    primary: true,
    description: 'Catat transaksi baru',
    ariaLabel: 'Log Trade — Catat transaksi baru',
  },
  {
    label: 'Buka Journal',
    page: 'journal',
    icon: <BookOpen className="h-4 w-4" />,
    primary: false,
    description: 'Lihat riwayat trade',
    ariaLabel: 'Buka Journal — Lihat riwayat trade',
  },
  {
    label: 'Tanya AI Coach',
    page: 'coaching',
    icon: <Brain className="h-4 w-4" />,
    primary: false,
    description: 'Konsultasi dengan AI',
    ariaLabel: 'Tanya AI Coach — Konsultasi dengan AI',
  },
  {
    label: 'Lihat Analitik',
    page: 'analytics',
    icon: <BarChart3 className="h-4 w-4" />,
    primary: false,
    description: 'Analisis performa',
    ariaLabel: 'Lihat Analitik — Analisis performa',
  },
]

const reflectionAction: ActionItem = {
  label: 'Start Reflection',
  page: 'journal',
  icon: <PenLine className="h-4 w-4" />,
  primary: false,
  description: 'Refleksi trade',
  ariaLabel: 'Start Reflection — Refleksi trade yang belum di-refleksi',
}

interface QuickActionsProps {
  unreflectedCount?: number
}

export function QuickActions({ unreflectedCount }: QuickActionsProps) {
  const navigate = useNavigationStore((s) => s.navigate)

  const allActions = unreflectedCount !== undefined && unreflectedCount > 0
    ? [...actions, reflectionAction]
    : actions

  return (
    <div className="alpha-card p-4 sm:p-5">
      <div className="mb-3 flex items-center gap-2">
        <span className="alpha-label" style={{ color: '#6B7280' }}>QUICK ACTIONS</span>
        <span className="w-8 h-px bg-[#232636]" />
      </div>
      <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-1 scrollbar-none" style={{ scrollbarWidth: 'none' }}>
        {allActions.map((action) => (
          <button
            key={action.page + action.label}
            onClick={() => navigate(action.page)}
            aria-label={action.ariaLabel}
            className={
              action.primary
                ? 'alpha-press alpha-hover-lift flex-shrink-0 flex items-center gap-3 rounded-xl px-5 py-3 text-left transition-all duration-200'
                : 'alpha-press alpha-hover-lift flex-shrink-0 flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all duration-200'
            }
            style={
              action.primary
                ? {
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(99,102,241,0.08) 100%)',
                    border: '1px solid rgba(99,102,241,0.3)',
                    boxShadow: '0 0 20px rgba(99,102,241,0.15)',
                  }
                : {
                    backgroundColor: 'rgba(255,255,255,0.02)',
                    border: '1px solid #232636',
                  }
            }
          >
            <div
              className="flex h-9 w-9 items-center justify-center rounded-lg shrink-0"
              style={
                action.primary
                  ? { backgroundColor: 'rgba(99,102,241,0.25)' }
                  : { backgroundColor: 'rgba(255,255,255,0.04)' }
              }
            >
              <span style={{ color: action.primary ? '#818CF8' : '#9CA3AF' }}>
                {action.icon}
              </span>
            </div>
            <div className="min-w-0">
              <span
                className="text-sm font-semibold block whitespace-nowrap"
                style={{ color: action.primary ? '#F3F4F6' : '#9CA3AF' }}
              >
                {action.label}
              </span>
              <span className="text-[11px] block whitespace-nowrap" style={{ color: '#6B7280' }}>
                {action.description}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
