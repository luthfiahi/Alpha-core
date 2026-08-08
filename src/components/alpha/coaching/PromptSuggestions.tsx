'use client'

import { Lightbulb, TrendingDown, Brain, Target } from 'lucide-react'
import { cn } from '@/lib/utils'

const SUGGESTION_ICONS = [TrendingDown, Brain, Target]

const DEFAULT_SUGGESTIONS = [
  'Kenapa Process Score-ku turun minggu ini?',
  'Apa pola trading yang sering aku ulang?',
  'Bagaimana cara mengelola emosi saat loss?',
]

export interface PromptSuggestionsProps {
  suggestions?: string[]
  onSelect: (suggestion: string) => void
  visible?: boolean
}

export function PromptSuggestions({
  suggestions = DEFAULT_SUGGESTIONS,
  onSelect,
  visible = true,
}: PromptSuggestionsProps) {
  if (!visible) return null

  return (
    <div className="alpha-animate-fade flex flex-wrap gap-2 mb-3">
      {suggestions.map((suggestion, idx) => {
        const Icon = SUGGESTION_ICONS[idx % SUGGESTION_ICONS.length]
        return (
          <button
            key={idx}
            onClick={() => onSelect(suggestion)}
            className={cn(
              'alpha-press inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full',
              'border text-xs whitespace-nowrap',
              'border-[#232636] text-alpha-text-secondary',
              'hover:border-alpha-primary/30 hover:text-alpha-text-primary',
              'hover:bg-alpha-primary/5',
              'transition-all duration-150'
            )}
          >
            <Icon className="w-3 h-3 flex-shrink-0 opacity-60" />
            {suggestion}
          </button>
        )
      })}
    </div>
  )
}
