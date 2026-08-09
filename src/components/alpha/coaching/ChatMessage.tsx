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

  // Vary animation per message
  const animOffset = role === 'AI_COACH' ? 6 : -4
  const animDelay = 0.05

  return (
    <motion.div
      initial={{ opacity: 0, y: animOffset }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1], delay: animDelay }}
      className={`alpha-animate-fade flex w-full ${
        role === 'AI_COACH' ? 'justify-start' : 'justify-end'
      }`}
    >
      <div
        className={`flex gap-2.5 max-w-[80%] sm:max-w-[70%] ${
          role === 'AI_COACH' ? 'flex-row' : 'flex-row-reverse'
        }`}
      >
        {/* Avatar */}
        {role === 'AI_COACH' ? (
          <div
            className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-5"
            style={{
              background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
            }}
          >
            <span className="text-[10px] font-bold text-white leading-none">α</span>
          </div>
        ) : (
          <div
            className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-5 bg-[#232636]"
          >
            <span className="text-[10px] font-semibold text-[#9CA3AF] leading-none">U</span>
          </div>
        )}

        <div
          className={`flex flex-col flex-1 min-w-0 ${
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
                ? 'alpha-chat-bubble-ai relative rounded-xl rounded-l-sm p-4 text-alpha-text-primary'
                : 'alpha-chat-bubble-user rounded-xl rounded-r-sm p-4 text-alpha-text-primary'
            }
            style={
              role === 'AI_COACH'
                ? { borderLeft: '3px solid transparent', borderImage: 'linear-gradient(to bottom, #6366F1, #8B5CF6) 1' }
                : undefined
            }
          >
            {isTyping ? (
              <div className="flex flex-col items-start py-1 px-1">
                <div className="flex items-center gap-2">
                  <span className="typing-dot w-2.5 h-2.5 rounded-full bg-[#818CF8] inline-block" />
                  <span className="typing-dot w-2.5 h-2.5 rounded-full bg-[#818CF8] inline-block" style={{ animationDelay: '0.15s' }} />
                  <span className="typing-dot w-2.5 h-2.5 rounded-full bg-[#818CF8] inline-block" style={{ animationDelay: '0.3s' }} />
                </div>
                <span className="text-[10px] text-[#6B7280] mt-1.5">Alpha sedang berpikir...</span>
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
      </div>
    </motion.div>
  )
}