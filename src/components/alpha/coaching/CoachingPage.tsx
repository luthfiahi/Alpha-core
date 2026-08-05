'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Send,
  History,
  Plus,
  Brain,
  MessageSquare,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from '@/components/ui/sheet'
import { useTraderStore } from '@/stores'
import { toast } from 'sonner'
import { ChatMessage, type ChatMessageProps } from './ChatMessage'
import { PromptSuggestions } from './PromptSuggestions'
import { ScreenshotUploader } from './ScreenshotUploader'

interface ConversationTurn {
  id: string
  role: 'AI_COACH' | 'USER'
  content: string
  timestamp: Date
}

interface Session {
  id: string
  title: string
  startedAt: Date
  status: string
  turns: ConversationTurn[]
}

const INITIAL_AI_MESSAGE: ConversationTurn = {
  id: 'welcome',
  role: 'AI_COACH',
  content:
    'Halo! 👋 Aku **Alpha**, coaching partner-mu untuk trading.\n\nAku di sini bukan untuk memberi sinyal atau instruksi trading — aku di sini untuk membantumu **berefleksi** dan memahami proses tradingmu sendiri.\n\n> *"Alpha will never make trading decisions for you."*\n\nCeritakan, apa yang ingin kamu refleksikan hari ini?',
  timestamp: new Date(),
}

export function CoachingPage() {
  const [sessions, setSessions] = useState<Session[]>([
    {
      id: 'session-1',
      title: 'Sesi refleksi hari ini',
      startedAt: new Date(),
      status: 'ACTIVE',
      turns: [INITIAL_AI_MESSAGE],
    },
  ])
  const [activeSessionId, setActiveSessionId] = useState<string>('session-1')
  const [inputValue, setInputValue] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const chatEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const activeSession = useMemo(
    () => sessions.find((s) => s.id === activeSessionId),
    [sessions, activeSessionId]
  )

  const processScore = useTraderStore((s) => s.processScore)
  const totalTrades = useTraderStore((s) => s.totalTrades)
  const winRate = useTraderStore((s) => s.winRate)
  const traderName = useTraderStore((s) => s.traderName)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeSession?.turns.length])

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = Math.min(textarea.scrollHeight, 160) + 'px'
    }
  }, [inputValue])

  const updateSessionTurns = useCallback(
    (sessionId: string, updater: (turns: ConversationTurn[]) => ConversationTurn[]) => {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId ? { ...s, turns: updater(s.turns) } : s
        )
      )
    },
    []
  )

  const createNewSession = useCallback(() => {
    const newId = `session-${Date.now()}`
    const newSession: Session = {
      id: newId,
      title: 'Sesi baru',
      startedAt: new Date(),
      status: 'ACTIVE',
      turns: [{ ...INITIAL_AI_MESSAGE, id: `welcome-${newId}` }],
    }
    setSessions((prev) => [newSession, ...prev])
    setActiveSessionId(newId)
    setSidebarOpen(false)
  }, [])

  const selectSession = useCallback((sessionId: string) => {
    setActiveSessionId(sessionId)
    setSidebarOpen(false)
  }, [])

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isStreaming) return

      const userMessage: ConversationTurn = {
        id: `msg-${Date.now()}`,
        role: 'USER',
        content: text.trim(),
        timestamp: new Date(),
      }

      // Add user message
      updateSessionTurns(activeSessionId, (turns) => [...turns, userMessage])
      setInputValue('')

      // Add typing indicator
      const typingId = `typing-${Date.now()}`
      updateSessionTurns(activeSessionId, (turns) => [
        ...turns,
        { id: typingId, role: 'AI_COACH', content: '', timestamp: new Date() },
      ])
      setIsStreaming(true)

      // Build conversation history for API
      const allMessages = [
        ...(activeSession?.turns || []).map((t) => ({
          role: t.role === 'AI_COACH' ? 'assistant' : 'user',
          content: t.content,
        })),
        { role: 'user', content: text.trim() },
      ].filter((m) => m.content.length > 0)

      try {
        abortControllerRef.current = new AbortController()

        const response = await fetch('/api/coaching', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: allMessages,
            traderContext: processScore
              ? { processScore, totalTrades, winRate, traderName }
              : undefined,
          }),
          signal: abortControllerRef.current.signal,
        })

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }

        if (!response.body) {
          throw new Error('No response body')
        }

        // Read streaming response
        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let fullContent = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          fullContent += chunk

          // Update the typing message with accumulated content
          updateSessionTurns(activeSessionId, (turns) =>
            turns.map((t) =>
              t.id === typingId
                ? { ...t, content: fullContent }
                : t
            )
          )
        }

        // Update session title from first user message
        setSessions((prev) =>
          prev.map((s) =>
            s.id === activeSessionId && s.title === 'Sesi baru'
              ? {
                  ...s,
                  title: text.trim().slice(0, 50) + (text.length > 50 ? '...' : ''),
                }
              : s
          )
        )
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') return
        toast.error('Gagal terhubung ke AI Coach. Silakan coba lagi.')
        // Remove typing indicator
        updateSessionTurns(activeSessionId, (turns) =>
          turns.filter((t) => t.id !== typingId)
        )
      } finally {
        setIsStreaming(false)
        abortControllerRef.current = null
      }
    },
    [activeSession, activeSessionId, isStreaming, processScore, totalTrades, winRate, traderName, updateSessionTurns]
  )

  const handleScreenshotAnalyze = useCallback(
    async (base64: string, mimeType: string) => {
      const userMessage: ConversationTurn = {
        id: `msg-${Date.now()}`,
        role: 'USER',
        content: '📸 Saya mengirim screenshot chart untuk dianalisis...',
        timestamp: new Date(),
      }

      updateSessionTurns(activeSessionId, (turns) => [...turns, userMessage])

      const typingId = `typing-${Date.now()}`
      updateSessionTurns(activeSessionId, (turns) => [
        ...turns,
        { id: typingId, role: 'AI_COACH', content: '', timestamp: new Date() },
      ])
      setIsStreaming(true)

      try {
        const analyzeRes = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64, mimeType }),
        })

        if (!analyzeRes.ok) throw new Error('Analysis failed')
        const analysisData = await analyzeRes.json()

        // Now ask the coach about the analysis
        const coachPrompt = `Saya baru saja mengupload screenshot chart trading dan AI mendeteksi data berikut:
${JSON.stringify(analysisData, null, 2)}

Bantu saya merefleksikan trade ini berdasarkan data yang terdeteksi dari chart.`

        const allMessages = [
          ...(activeSession?.turns || []).map((t) => ({
            role: t.role === 'AI_COACH' ? 'assistant' : 'user',
            content: t.content,
          })),
          { role: 'user', content: coachPrompt },
        ].filter((m) => m.content.length > 0)

        const response = await fetch('/api/coaching', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: allMessages }),
        })

        if (!response.body) throw new Error('No response body')

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let fullContent = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value, { stream: true })
          fullContent += chunk

          updateSessionTurns(activeSessionId, (turns) =>
            turns.map((t) =>
              t.id === typingId ? { ...t, content: fullContent } : t
            )
          )
        }
      } catch {
        toast.error('Gagal menganalisis screenshot. Coba lagi.')
        updateSessionTurns(activeSessionId, (turns) =>
          turns.filter((t) => t.id !== typingId)
        )
      } finally {
        setIsStreaming(false)
      }
    },
    [activeSession, activeSessionId, updateSessionTurns]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        sendMessage(inputValue)
      }
    },
    [inputValue, sendMessage]
  )

  const handleSuggestionSelect = useCallback(
    (suggestion: string) => {
      sendMessage(suggestion)
    },
    [sendMessage]
  )

  const formatRelativeTime = useCallback((date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Baru saja'
    if (diffMins < 60) return `${diffMins} menit lalu`
    if (diffHours < 24) return `${diffHours} jam lalu`
    if (diffDays < 7) return `${diffDays} hari lalu`
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
  }, [])

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-alpha-border flex-shrink-0">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
            }}
          >
            <Brain className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-alpha-text-primary">
              AI Coach
            </h1>
            <p className="text-[11px] text-alpha-text-muted">
              Alpha Trading Coach
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Alpha Promise badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-alpha-primary/10 border border-alpha-primary/20">
            <div className="w-1.5 h-1.5 rounded-full bg-alpha-success animate-pulse" />
            <span className="text-[10px] font-medium text-alpha-primary">
              Alpha Promise
            </span>
          </div>

          {/* Session History */}
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-alpha-text-muted hover:text-alpha-text-primary hover:bg-alpha-surface rounded-lg"
              >
                <History className="w-4 h-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 sm:max-w-sm bg-alpha-surface border-alpha-border p-0">
              <SheetHeader className="p-4 pb-0">
                <SheetTitle className="text-sm text-alpha-text-primary">
                  Riwayat Sesi Coaching
                </SheetTitle>
                <SheetDescription className="text-xs text-alpha-text-muted">
                  {sessions.length} sesi coaching
                </SheetDescription>
              </SheetHeader>

              <div className="mt-3 px-4">
                <Button
                  size="sm"
                  className="w-full rounded-lg justify-start gap-2"
                  onClick={createNewSession}
                >
                  <Plus className="w-4 h-4" />
                  Sesi Baru
                </Button>
              </div>

              <ScrollArea className="flex-1 mt-4 px-2">
                <div className="space-y-1 pb-4">
                  {sessions.map((session) => (
                    <button
                      key={session.id}
                      onClick={() => selectSession(session.id)}
                      className={cn(
                        'w-full text-left px-3 py-3 rounded-lg transition-all duration-150',
                        session.id === activeSessionId
                          ? 'bg-alpha-primary/10 border border-alpha-primary/20'
                          : 'hover:bg-alpha-border/50 border border-transparent'
                      )}
                    >
                      <div className="flex items-start gap-2.5">
                        <MessageSquare
                          className={cn(
                            'w-4 h-4 mt-0.5 flex-shrink-0',
                            session.id === activeSessionId
                              ? 'text-alpha-primary'
                              : 'text-alpha-text-muted'
                          )}
                        />
                        <div className="flex-1 min-w-0">
                          <p
                            className={cn(
                              'text-sm truncate',
                              session.id === activeSessionId
                                ? 'text-alpha-text-primary font-medium'
                                : 'text-alpha-text-secondary'
                            )}
                          >
                            {session.title}
                          </p>
                          <p className="text-[11px] text-alpha-text-muted mt-0.5">
                            {formatRelativeTime(session.startedAt)} ·{' '}
                            {session.turns.length} pesan
                          </p>
                        </div>
                        {session.id === activeSessionId && (
                          <div className="w-1.5 h-1.5 rounded-full bg-alpha-primary mt-2 flex-shrink-0" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="px-4 sm:px-6 py-6 space-y-6 max-w-3xl mx-auto">
            {activeSession?.turns.map((turn) => (
              <ChatMessage
                key={turn.id}
                role={turn.role}
                content={turn.content}
                timestamp={turn.timestamp}
                isTyping={
                  turn.content === '' && turn.role === 'AI_COACH' && isStreaming
                }
              />
            ))}
            <div ref={chatEndRef} className="h-1" />
          </div>
        </ScrollArea>
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 border-t border-alpha-border bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3">
          {/* Prompt Suggestions */}
          <PromptSuggestions
            visible={inputValue.trim().length === 0 && !isStreaming}
            onSelect={handleSuggestionSelect}
          />

          {/* Screenshot preview handled inline within ScreenshotUploader compact mode */}

          {/* Input Bar */}
          <div className="flex items-end gap-2">
            <ScreenshotUploader
              onAnalyze={handleScreenshotAnalyze}
              compact
            />

            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Tanya sesuatu tentang trading kamu..."
                rows={1}
                disabled={isStreaming}
                className={cn(
                  'w-full resize-none rounded-xl border border-alpha-border bg-alpha-surface px-4 py-2.5',
                  'text-sm text-alpha-text-primary placeholder:text-alpha-text-muted',
                  'focus:outline-none focus:ring-2 focus:ring-alpha-primary/30 focus:border-alpha-primary/50',
                  'transition-all duration-150',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  'max-h-40'
                )}
              />
            </div>

            <Button
              size="icon"
              className="h-10 w-10 rounded-xl flex-shrink-0"
              disabled={!inputValue.trim() || isStreaming}
              onClick={() => sendMessage(inputValue)}
              aria-label="Kirim pesan"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center justify-between mt-2 px-1">
            <p className="text-[10px] text-alpha-text-muted">
              Shift+Enter untuk baris baru
            </p>
            <p className="text-[10px] text-alpha-text-muted">
              AI adalah coach, bukan signal provider
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
