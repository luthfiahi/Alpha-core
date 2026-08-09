'use client'

import { TrendingDown, Brain, Target, Lightbulb } from 'lucide-react'
import { cn } from '@/lib/utils'

const SUGGESTION_ICONS = [TrendingDown, Brain, Target]
const SUGGESTION_EMOJIS = ['📉', '🧠', '🎯']

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
        const emoji = SUGGESTION_EMOJIS[idx % SUGGESTION_EMOJIS.length]
        return (
          <button
            key={idx}
            onClick={() => onSelect(suggestion)}
            className={cn(
              'alpha-press inline-flex items-center gap-1.5 pl-1 pr-3 py-1.5 rounded-lg',
              'border text-xs whitespace-nowrap',
              'border-[#232636] text-alpha-text-secondary',
              'hover:border-[#6366F1]/30 hover:text-alpha-text-primary',
              'hover:bg-[#6366F1]/5 hover:shadow-[0_0_12px_rgba(99,102,241,0.08)]',
              'transition-all duration-150',
              'border-l-2 border-l-[#6366F1]/40'
            )}
          >
            <span className="text-[11px] w-5 h-5 flex items-center justify-center flex-shrink-0 rounded bg-[#6366F1]/10">
              <Icon className="w-2.5 h-2.5 text-[#818CF8]" />
            </span>
            {suggestion}
          </button>
        )
      })}
    </div>
  )
}
