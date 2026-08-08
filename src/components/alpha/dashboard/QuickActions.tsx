'use client'

import { Button } from '@/components/ui/button'
import { Plus, BookOpen, Brain, BarChart3 } from 'lucide-react'
import { useNavigationStore, type AppPage } from '@/stores'
import { useRef } from 'react'

interface ActionItem {
  label: string
  page: AppPage
  icon: React.ReactNode
  variant: 'default' | 'secondary' | 'outline'
}

const actions: ActionItem[] = [
  {
    label: 'Log Trade',
    page: 'journal-new',
    icon: <Plus className="h-4 w-4" />,
    variant: 'default',
  },
  {
    label: 'Buka Journal',
    page: 'journal',
    icon: <BookOpen className="h-4 w-4" />,
    variant: 'secondary',
  },
  {
    label: 'Tanya AI Coach',
    page: 'coaching',
    icon: <Brain className="h-4 w-4" />,
    variant: 'secondary',
  },
  {
    label: 'Lihat Analitik',
    page: 'analytics',
    icon: <BarChart3 className="h-4 w-4" />,
    variant: 'outline',
  },
]

export function QuickActions() {
  const navigate = useNavigationStore((s) => s.navigate)
  const scrollRef = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={scrollRef}
      className="flex gap-3 overflow-x-auto pb-1 scrollbar-none lg:overflow-visible"
      style={{ scrollbarWidth: 'none' }}
    >
      {actions.map((action) => (
        <Button
          key={action.page}
          variant={action.variant}
          onClick={() => navigate(action.page)}
          className="alpha-press flex-shrink-0 gap-2 h-10 px-4 text-sm font-medium whitespace-nowrap transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        >
          {action.icon}
          {action.label}
        </Button>
      ))}
    </div>
  )
}
