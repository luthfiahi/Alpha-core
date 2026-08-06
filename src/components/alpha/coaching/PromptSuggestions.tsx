'use client'

import { useRef } from 'react'
import { Lightbulb } from 'lucide-react'
import { cn } from '@/lib/utils'

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
  const scrollRef = useRef<HTMLDivElement>(null)

  if (!visible) return null

  return (
    <div className="flex items-center gap-2 mb-3">
      <Lightbulb className="w-3.5 h-3.5 text-alpha-text-muted flex-shrink-0" />
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto pb-1 scrollbar-none"
      >
        {suggestions.map((suggestion, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(suggestion)}
            className={cn(
              'flex-shrink-0 px-3 py-1.5 text-xs rounded-full',
              'border border-alpha-border text-alpha-text-secondary',
              'hover:border-alpha-primary/40 hover:text-alpha-text-primary',
              'hover:bg-alpha-primary/5 transition-all duration-150',
              'whitespace-nowrap'
            )}
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  )
}
