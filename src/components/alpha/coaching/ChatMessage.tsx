'use client'

import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import { Brain } from 'lucide-react'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'

export interface ChatMessageProps {
  role: 'AI_COACH' | 'USER'
  content: string
  timestamp: Date | string
  isTyping?: boolean
}

export function ChatMessage({ role, content, timestamp, isTyping }: ChatMessageProps) {
  const ts = typeof timestamp === 'string' ? new Date(timestamp) : timestamp
  const timeStr = format(ts, 'HH:mm', { locale: localeId })

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className={`flex w-full gap-3 ${
        role === 'AI_COACH' ? 'justify-start' : 'justify-end'
      }`}
    >
      {role === 'AI_COACH' && (
        <div className="flex-shrink-0 mt-1">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
            }}
          >
            <Brain className="w-3.5 h-3.5 text-white" />
          </div>
        </div>
      )}

      <div
        className={`flex flex-col max-w-[80%] sm:max-w-[70%] ${
          role === 'AI_COACH' ? 'items-start' : 'items-end'
        }`}
      >
        <div
          className={`px-4 py-3 ${
            role === 'AI_COACH'
              ? 'alpha-chat-bubble-ai text-alpha-text-primary'
              : 'alpha-chat-bubble-user text-alpha-text-primary'
          }`}
        >
          {isTyping ? (
            <div className="flex items-center gap-1.5 py-1 px-1">
              <span className="typing-dot w-2 h-2 rounded-full bg-alpha-text-secondary inline-block" />
              <span className="typing-dot w-2 h-2 rounded-full bg-alpha-text-secondary inline-block" />
              <span className="typing-dot w-2 h-2 rounded-full bg-alpha-text-secondary inline-block" />
            </div>
          ) : role === 'AI_COACH' ? (
            <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-headings:text-alpha-text-primary prose-strong:text-alpha-text-primary prose-code:text-alpha-primary prose-pre:bg-alpha-surface prose-a:text-alpha-primary">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          ) : (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
          )}
        </div>

        <span className="text-[11px] text-alpha-text-muted mt-1.5 px-1">
          {timeStr}
        </span>
      </div>
    </motion.div>
  )
}
