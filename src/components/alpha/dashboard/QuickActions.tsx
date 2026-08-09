'use client'

import { Plus, BookOpen, Brain, BarChart3 } from 'lucide-react'
import { useNavigationStore, type AppPage } from '@/stores'
import { useRef } from 'react'

interface ActionItem {
  label: string
  page: AppPage
  icon: React.ReactNode
  primary: boolean
  description: string
}

const actions: ActionItem[] = [
  {
    label: 'Log Trade',
    page: 'journal-new',
    icon: <Plus className="h-5 w-5" />,
    primary: true,
    description: 'Catat transaksi baru',
  },
  {
    label: 'Buka Journal',
    page: 'journal',
    icon: <BookOpen className="h-4 w-4" />,
    primary: false,
    description: 'Lihat riwayat trade',
  },
  {
    label: 'Tanya AI Coach',
    page: 'coaching',
    icon: <Brain className="h-4 w-4" />,
    primary: false,
    description: 'Konsultasi dengan AI',
  },
  {
    label: 'Lihat Analitik',
    page: 'analytics',
    icon: <BarChart3 className="h-4 w-4" />,
    primary: false,
    description: 'Analisis performa',
  },
]

export function QuickActions() {
  const navigate = useNavigationStore((s) => s.navigate)
  const scrollRef = useRef<HTMLDivElement>(null)

  return (
    <div className="alpha-card p-5">
      <div className="mb-3">
        <span className="alpha-label" style={{ color: '#6B7280' }}>QUICK ACTIONS</span>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-1 scrollbar-none lg:overflow-visible"
        style={{ scrollbarWidth: 'none' }}
      >
        {actions.map((action) => (
          <button
            key={action.page}
            onClick={() => navigate(action.page)}
            className={
              action.primary
                ? 'alpha-press flex-shrink-0 flex flex-col items-center gap-2 rounded-xl px-6 py-4 text-center transition-all duration-200 hover:-translate-y-[2px] active:translate-y-0 min-w-[110px]'
                : 'alpha-press flex-shrink-0 flex flex-col items-center gap-2 rounded-xl px-5 py-4 text-center transition-all duration-200 hover:-translate-y-[2px] active:translate-y-0 min-w-[110px]'
            }
            style={
              action.primary
                ? {
                    backgroundColor: 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(99,102,241,0.08) 100%)',
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
              className="flex h-10 w-10 items-center justify-center rounded-lg"
              style={
                action.primary
                  ? { backgroundColor: 'rgba(99,102,241,0.2)' }
                  : { backgroundColor: 'rgba(255,255,255,0.04)' }
              }
            >
              <span style={{ color: action.primary ? '#818CF8' : '#9CA3AF' }}>
                {action.icon}
              </span>
            </div>
            <span
              className="text-sm font-semibold whitespace-nowrap"
              style={{ color: action.primary ? '#F3F4F6' : '#9CA3AF' }}
            >
              {action.label}
            </span>
            <span className="text-[11px] whitespace-nowrap" style={{ color: '#6B7280' }}>
              {action.description}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}