'use client'

import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
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
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={`alpha-animate-fade flex w-full ${
        role === 'AI_COACH' ? 'justify-start' : 'justify-end'
      }`}
    >
      <div
        className={`flex flex-col max-w-[80%] sm:max-w-[70%] ${
          role === 'AI_COACH' ? 'items-start' : 'items-end'
        }`}
      >
        {/* Header: role label + timestamp */}
        <div className={`flex items-center gap-2 mb-1.5 px-1 ${
          role === 'AI_COACH' ? '' : 'flex-row-reverse'
        }`}>
          <span className={
            role === 'AI_COACH'
              ? 'text-[11px] font-medium text-alpha-primary'
              : 'text-[11px] font-medium text-alpha-text-secondary'
          }>
            {role === 'AI_COACH' ? 'Alpha' : 'You'}
          </span>
          <span className="alpha-caption text-[10px]">
            {timeStr}
          </span>
        </div>

        {/* Bubble */}
        <div
          className={
            role === 'AI_COACH'
              ? 'alpha-chat-bubble-ai relative border-l-[4px] rounded-xl rounded-l-sm p-4 text-alpha-text-primary'
              : 'alpha-chat-bubble-user rounded-xl rounded-r-sm p-4 text-alpha-text-primary'
          }
          style={
            role === 'AI_COACH'
              ? { borderLeftColor: 'transparent', borderImage: 'linear-gradient(to bottom, #6366F1, #8B5CF6) 1', borderLeftWidth: '4px' }
              : undefined
          }
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
            <p className="alpha-body leading-relaxed whitespace-pre-wrap">{content}</p>
          )}
        </div>
      </div>
    </motion.div>
  )
}
