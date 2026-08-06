'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Send,
  History,
  Plus,
  Brain,
  MessageSquare,
  MessageCircle,
  Sparkles,
  ChevronDown,
  X,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
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
import { useTraderStore, useNavigationStore } from '@/stores'
import { toast } from 'sonner'
import { ChatMessage, type ChatMessageProps } from './ChatMessage'
import { PromptSuggestions } from './PromptSuggestions'
import { ScreenshotUploader } from './ScreenshotUploader'
import { ReflectionFlow, REFLECTION_STEPS } from './ReflectionFlow'
import type { ReflectionProgress } from './ReflectionFlow'

// ========================================
// Types
// ========================================

export interface ConversationTurn {
  id: string
  role: 'AI_COACH' | 'USER'
  content: string
  timestamp: Date
}

export interface Session {
  id: string
  title: string
  startedAt: Date
  status: string
  sessionType: 'FREE_CHAT' | 'REFLECTION'
  turns: ConversationTurn[]
  linkedTradeId?: string | null
  reflectionStep?: number | null
  reflectionCompletedSteps?: number[]
}

interface TradeOption {
  id: string
  pair: string
  direction: string
  entryPrice: number
  profitLoss: number
  createdAt: string
  status: string
}

type CoachingMode = 'free_chat' | 'reflection'

const INITIAL_FREE_CHAT_MESSAGE: ConversationTurn = {
  id: 'welcome-free',
  role: 'AI_COACH',
  content:
    'Halo! 👋 Aku **Alpha**, coaching partner-mu untuk trading.\n\nAku di sini bukan untuk memberi sinyal atau instruksi trading — aku di sini untuk membantumu **berefleksi** dan memahami proses tradingmu sendiri.\n\n> *"Alpha will never make trading decisions for you."*\n\nCeritakan, apa yang ingin kamu refleksikan hari ini?',
  timestamp: new Date(),
}

const INITIAL_REFLECTION_MESSAGE: ConversationTurn = {
  id: 'welcome-reflection',
  role: 'AI_COACH',
  content:
    'Mari kita mulai sesi refleksi trade! 🔍\n\nAku akan memandumu melalui **5 langkah refleksi Socratic** untuk membantumu memahami keputusan tradingmu lebih dalam.\n\nPilih trade yang ingin kamu refleksikan dari daftar di atas, atau aku bisa membantu kamu memilih.',
  timestamp: new Date(),
}

// ========================================
// Mode Toggle Component
// ========================================

function ModeToggle({
  mode,
  onModeChange,
}: {
  mode: CoachingMode
  onModeChange: (mode: CoachingMode) => void
}) {
  return (
    <div className="flex items-center bg-alpha-border/40 rounded-lg p-0.5">
      <button
        onClick={() => onModeChange('free_chat')}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200',
          mode === 'free_chat'
            ? 'bg-alpha-surface text-alpha-text-primary shadow-sm'
            : 'text-alpha-text-muted hover:text-alpha-text-secondary'
        )}
      >
        <MessageCircle className="w-3.5 h-3.5" />
        Chat Bebas
      </button>
      <button
        onClick={() => onModeChange('reflection')}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200',
          mode === 'reflection'
            ? 'bg-alpha-surface text-alpha-text-primary shadow-sm'
            : 'text-alpha-text-muted hover:text-alpha-text-secondary'
        )}
      >
        <Sparkles className="w-3.5 h-3.5" />
        Refleksi Trade
      </button>
    </div>
  )
}

// ========================================
// Trade Selector Component
// ========================================

function TradeSelector({
  trades,
  selectedTradeId,
  onSelect,
  onStartReflection,
  disabled,
}: {
  trades: TradeOption[]
  selectedTradeId: string | null
  onSelect: (id: string) => void
  onStartReflection: () => void
  disabled: boolean
}) {
  const [open, setOpen] = useState(false)
  const selectedTrade = trades.find((t) => t.id === selectedTradeId)

  return (
    <div className="space-y-2">
      <p className="text-xs text-alpha-text-muted">
        Pilih trade yang ingin kamu refleksikan:
      </p>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <button
            onClick={() => setOpen(!open)}
            disabled={disabled || trades.length === 0}
            className={cn(
              'w-full flex items-center gap-2 px-3 py-2 rounded-lg border text-xs transition-all duration-150',
              'border-alpha-border bg-alpha-surface',
              'hover:border-alpha-primary/30',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {selectedTrade ? (
              <>
                <span className="font-medium text-alpha-text-primary">
                  {selectedTrade.pair}
                </span>
                <span
                  className={cn(
                    'px-1.5 py-0.5 rounded text-[10px] font-medium',
                    selectedTrade.direction === 'LONG'
                      ? 'bg-green-500/10 text-green-400'
                      : 'bg-red-500/10 text-red-400'
                  )}
                >
                  {selectedTrade.direction}
                </span>
                <span
                  className={cn(
                    'ml-auto font-financial',
                    selectedTrade.profitLoss >= 0
                      ? 'text-green-400'
                      : 'text-red-400'
                  )}
                >
                  {selectedTrade.profitLoss >= 0 ? '+' : ''}
                  {selectedTrade.profitLoss.toFixed(2)}
                </span>
              </>
            ) : (
              <>
                <span className="text-alpha-text-muted">
                  {trades.length === 0
                    ? 'Tidak ada trade tersedia'
                    : 'Pilih trade...'}
                </span>
              </>
            )}
            <ChevronDown
              className={cn(
                'w-3.5 h-3.5 text-alpha-text-muted ml-auto flex-shrink-0 transition-transform duration-200',
                open && 'rotate-180'
              )}
            />
          </button>

          {open && trades.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-alpha-surface border border-alpha-border rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto">
              {trades.map((trade) => (
                <button
                  key={trade.id}
                  onClick={() => {
                    onSelect(trade.id)
                    setOpen(false)
                  }}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2.5 text-xs transition-all duration-100',
                    'hover:bg-alpha-primary/5',
                    trade.id === selectedTradeId && 'bg-alpha-primary/10'
                  )}
                >
                  <span className="font-medium text-alpha-text-primary">
                    {trade.pair}
                  </span>
                  <span
                    className={cn(
                      'px-1.5 py-0.5 rounded text-[10px] font-medium',
                      trade.direction === 'LONG'
                        ? 'bg-green-500/10 text-green-400'
                        : 'bg-red-500/10 text-red-400'
                    )}
                  >
                    {trade.direction}
                  </span>
                  <span
                    className={cn(
                      'font-financial ml-auto',
                      trade.profitLoss >= 0
                        ? 'text-green-400'
                        : 'text-red-400'
                    )}
                  >
                    {trade.profitLoss >= 0 ? '+' : ''}
                    {trade.profitLoss.toFixed(2)}
                  </span>
                  {trade.id === selectedTradeId && (
                    <X className="w-3 h-3 text-alpha-text-muted" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <Button
          size="sm"
          disabled={!selectedTradeId || disabled}
          onClick={onStartReflection}
          className="rounded-lg gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Mulai Refleksi
        </Button>
      </div>
    </div>
  )
}

// ========================================
// Main Component
// ========================================

export function CoachingPage() {
  const [sessions, setSessions] = useState<Session[]>([
    {
      id: 'session-1',
      title: 'Sesi refleksi hari ini',
      startedAt: new Date(),
      status: 'ACTIVE',
      sessionType: 'FREE_CHAT',
      turns: [{ ...INITIAL_FREE_CHAT_MESSAGE }],
    },
  ])
  const [activeSessionId, setActiveSessionId] = useState<string>('session-1')
  const [inputValue, setInputValue] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Reflection mode state
  const [mode, setMode] = useState<CoachingMode>('free_chat')
  const [availableTrades, setAvailableTrades] = useState<TradeOption[]>([])
  const [selectedTradeId, setSelectedTradeId] = useState<string | null>(null)
  const [selectedTradeData, setSelectedTradeData] = useState<TradeOption | null>(null)
  const [tradesLoading, setTradesLoading] = useState(false)

  const chatEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const tradeListRef = useRef<HTMLDivElement>(null)

  const activeSession = useMemo(
    () => sessions.find((s) => s.id === activeSessionId),
    [sessions, activeSessionId]
  )

  // Reflection progress derived from active session
  const reflectionProgress: ReflectionProgress = useMemo(() => {
    if (activeSession?.sessionType !== 'REFLECTION') {
      return { currentStep: 0, totalSteps: 5, completedSteps: [] }
    }
    return {
      currentStep: activeSession.reflectionStep || 1,
      totalSteps: 5,
      completedSteps: activeSession.reflectionCompletedSteps || [],
    }
  }, [activeSession])

  const processScore = useTraderStore((s) => s.processScore)
  const totalTrades = useTraderStore((s) => s.totalTrades)
  const winRate = useTraderStore((s) => s.winRate)
  const traderName = useTraderStore((s) => s.traderName)
  const selectedTradeIdFromNav = useNavigationStore((s) => s.selectedTradeId)
  const navigate = useNavigationStore((s) => s.navigate)

  // Close trade selector dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (tradeListRef.current && !tradeListRef.current.contains(e.target as Node)) {
        // This is handled by the component's own state
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Listen for selectedTradeId changes from navigation (e.g., clicking "Reflect" from dashboard)
  useEffect(() => {
    if (selectedTradeIdFromNav) {
      setMode('reflection')
      setSelectedTradeId(selectedTradeIdFromNav)
      // Fetch trades to get the data
      fetchTrades().then((trades) => {
        const trade = trades.find((t) => t.id === selectedTradeIdFromNav)
        if (trade) {
          setSelectedTradeData(trade)
        }
      })
      // Clear the nav state
      useNavigationStore.getState().selectTrade(null)
    }
  }, [selectedTradeIdFromNav])

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

  // Fetch available trades when switching to reflection mode
  const fetchTrades = useCallback(async (): Promise<TradeOption[]> => {
    setTradesLoading(true)
    try {
      const res = await fetch('/api/trades?limit=20&hasReflected=false')
      if (!res.ok) throw new Error('Failed to fetch trades')
      const data = await res.json()
      setAvailableTrades(data.trades || [])
      return data.trades || []
    } catch {
      toast.error('Gagal memuat daftar trade')
      return []
    } finally {
      setTradesLoading(false)
    }
  }, [])

  // Switch mode
  const handleModeChange = useCallback(
    (newMode: CoachingMode) => {
      if (newMode === mode) return
      setMode(newMode)
      setSelectedTradeId(null)
      setSelectedTradeData(null)

      if (newMode === 'reflection') {
        fetchTrades()
      }

      // If switching modes, find or create appropriate session
      const existingSession = sessions.find(
        (s) =>
          s.sessionType === (newMode === 'reflection' ? 'REFLECTION' : 'FREE_CHAT') &&
          s.status === 'ACTIVE'
      )
      if (existingSession) {
        setActiveSessionId(existingSession.id)
      } else {
        // Create new session for the mode
        const newId = `session-${Date.now()}`
        const isReflection = newMode === 'reflection'
        const newSession: Session = {
          id: newId,
          title: isReflection
            ? 'Refleksi Trade Baru'
            : 'Sesi baru',
          startedAt: new Date(),
          status: 'ACTIVE',
          sessionType: isReflection ? 'REFLECTION' : 'FREE_CHAT',
          turns: [
            {
              ...(isReflection
                ? INITIAL_REFLECTION_MESSAGE
                : INITIAL_FREE_CHAT_MESSAGE),
              id: `welcome-${newId}`,
            },
          ],
          reflectionStep: isReflection ? 1 : null,
          reflectionCompletedSteps: [],
          linkedTradeId: null,
        }
        setSessions((prev) => [newSession, ...prev])
        setActiveSessionId(newId)
      }
    },
    [mode, sessions, fetchTrades]
  )

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

  const createNewSession = useCallback(
    (sessionType: 'FREE_CHAT' | 'REFLECTION' = mode === 'reflection' ? 'REFLECTION' : 'FREE_CHAT') => {
      const newId = `session-${Date.now()}`
      const isReflection = sessionType === 'REFLECTION'
      const newSession: Session = {
        id: newId,
        title: isReflection ? 'Refleksi Trade Baru' : 'Sesi baru',
        startedAt: new Date(),
        status: 'ACTIVE',
        sessionType,
        turns: [
          {
            ...(isReflection
              ? INITIAL_REFLECTION_MESSAGE
              : INITIAL_FREE_CHAT_MESSAGE),
            id: `welcome-${newId}`,
          },
        ],
        reflectionStep: isReflection ? 1 : null,
        reflectionCompletedSteps: [],
        linkedTradeId: null,
      }
      setSessions((prev) => [newSession, ...prev])
      setActiveSessionId(newId)
      setSidebarOpen(false)
    },
    [mode]
  )

  const selectSession = useCallback((sessionId: string) => {
    setActiveSessionId(sessionId)
    setSidebarOpen(false)
  }, [])

  // Start reflection on a specific trade
  const handleStartReflection = useCallback(async () => {
    if (!selectedTradeId || !selectedTradeData) return

    // Create a new reflection session
    const newId = `session-${Date.now()}`
    const newSession: Session = {
      id: newId,
      title: `Refleksi: ${selectedTradeData.pair} ${selectedTradeData.direction}`,
      startedAt: new Date(),
      status: 'ACTIVE',
      sessionType: 'REFLECTION',
      turns: [],
      reflectionStep: 1,
      reflectionCompletedSteps: [],
      linkedTradeId: selectedTradeId,
    }
    setSessions((prev) => [newSession, ...prev])
    setActiveSessionId(newId)

    // Auto-start Step 1: AI asks the first reflection question
    const typingId = `typing-${Date.now()}`
    setSessions((prev) =>
      prev.map((s) =>
        s.id === newId
          ? {
              ...s,
              turns: [
                {
                  id: typingId,
                  role: 'AI_COACH',
                  content: '',
                  timestamp: new Date(),
                },
              ],
            }
          : s
      )
    )
    setIsStreaming(true)

    try {
      const response = await fetch('/api/coaching', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [],
          traderContext: processScore
            ? { processScore, totalTrades, winRate, traderName }
            : undefined,
          mode: 'REFLECTION',
          reflectionStep: 1,
          tradeData: selectedTradeData,
        }),
      })

      if (!response.ok) throw new Error(`API error: ${response.status}`)
      if (!response.body) throw new Error('No response body')

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        fullContent += chunk

        setSessions((prev) =>
          prev.map((s) =>
            s.id === newId
              ? {
                  ...s,
                  turns: s.turns.map((t) =>
                    t.id === typingId ? { ...t, content: fullContent } : t
                  ),
                }
              : s
          )
        )
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'AbortError') {
        toast.error('Gagal memulai sesi refleksi.')
        setSessions((prev) =>
          prev.map((s) =>
            s.id === newId
              ? { ...s, turns: s.turns.filter((t) => t.id !== typingId) }
              : s
          )
        )
      }
    } finally {
      setIsStreaming(false)
    }
  }, [selectedTradeId, selectedTradeData, processScore, totalTrades, winRate, traderName])

  // Core send message (works for both free chat and reflection)
  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isStreaming) return

      const session = sessions.find((s) => s.id === activeSessionId)
      if (!session) return

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
        ...(session.turns || []).map((t) => ({
          role: t.role === 'AI_COACH' ? 'assistant' : 'user',
          content: t.content,
        })),
        { role: 'user', content: text.trim() },
      ].filter((m) => m.content.length > 0)

      try {
        abortControllerRef.current = new AbortController()

        // Build request body based on session type
        const requestBody: Record<string, unknown> = {
          messages: allMessages,
          traderContext: processScore
            ? { processScore, totalTrades, winRate, traderName }
            : undefined,
        }

        if (session.sessionType === 'REFLECTION') {
          requestBody.mode = 'REFLECTION'
          requestBody.reflectionStep = session.reflectionStep || 1
          if (session.linkedTradeId && selectedTradeData) {
            requestBody.tradeData = selectedTradeData
          }
        }

        const response = await fetch('/api/coaching', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
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

        // If in REFLECTION mode, advance step after AI responds
        if (session.sessionType === 'REFLECTION' && session.reflectionStep) {
          const nextStep = session.reflectionStep + 1
          setSessions((prev) =>
            prev.map((s) =>
              s.id === activeSessionId
                ? {
                    ...s,
                    reflectionStep: nextStep > 5 ? 6 : nextStep,
                    reflectionCompletedSteps: [
                      ...(s.reflectionCompletedSteps || []),
                      session.reflectionStep,
                    ],
                    // Mark session completed after step 5
                    status: nextStep > 5 ? 'COMPLETED' : s.status,
                  }
                : s
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
    [activeSession, activeSessionId, isStreaming, processScore, totalTrades, winRate, traderName, selectedTradeData, updateSessionTurns, sessions]
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

  const isReflectionActive =
    activeSession?.sessionType === 'REFLECTION' &&
    activeSession.status !== 'COMPLETED'
  const isReflectionCompleted = activeSession?.status === 'COMPLETED'

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
          {/* Mode Toggle */}
          <ModeToggle mode={mode} onModeChange={handleModeChange} />

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

              <div className="mt-3 px-4 flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 rounded-lg justify-start gap-1.5 text-xs"
                  onClick={() => createNewSession('FREE_CHAT')}
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  Chat Baru
                </Button>
                <Button
                  size="sm"
                  className="flex-1 rounded-lg justify-start gap-1.5 text-xs"
                  onClick={() => {
                    createNewSession('REFLECTION')
                    handleModeChange('reflection')
                  }}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Refleksi Baru
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
                        {session.sessionType === 'REFLECTION' ? (
                          <Sparkles
                            className={cn(
                              'w-4 h-4 mt-0.5 flex-shrink-0',
                              session.id === activeSessionId
                                ? 'text-alpha-primary'
                                : 'text-alpha-text-muted'
                            )}
                          />
                        ) : (
                          <MessageSquare
                            className={cn(
                              'w-4 h-4 mt-0.5 flex-shrink-0',
                              session.id === activeSessionId
                                ? 'text-alpha-primary'
                                : 'text-alpha-text-muted'
                            )}
                          />
                        )}
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
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <p className="text-[11px] text-alpha-text-muted">
                              {formatRelativeTime(session.startedAt)}
                            </p>
                            <span className="text-alpha-border">·</span>
                            <p className="text-[11px] text-alpha-text-muted">
                              {session.turns.length} pesan
                            </p>
                            {session.sessionType === 'REFLECTION' && (
                              <>
                                <span className="text-alpha-border">·</span>
                                <span className="text-[10px] text-alpha-primary">
                                  {session.status === 'COMPLETED'
                                    ? '✓ Selesai'
                                    : `Langkah ${session.reflectionStep || 1}/5`}
                                </span>
                              </>
                            )}
                          </div>
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

      {/* Reflection Step Progress Bar — shown when in active reflection */}
      {isReflectionActive && (
        <div className="flex-shrink-0 px-4 sm:px-6 py-3 border-b border-alpha-border bg-alpha-surface/50">
          <ReflectionFlow progress={reflectionProgress} />
        </div>
      )}

      {/* Reflection Completed Banner */}
      {isReflectionCompleted && activeSession && (
        <div className="flex-shrink-0 px-4 sm:px-6 py-3 border-b border-alpha-border bg-green-500/5">
          <div className="max-w-3xl mx-auto flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
              <svg
                className="w-4 h-4 text-green-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-green-400">
                Refleksi Selesai!
              </p>
              <p className="text-[11px] text-alpha-text-muted">
                Refleksi trade telah tersimpan. Kamu bisa melihat hasilnya di detail trade.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="rounded-lg text-xs border-alpha-border"
              onClick={() => handleModeChange('reflection')}
            >
              Refleksi Lagi
            </Button>
          </div>
        </div>
      )}

      {/* Trade Selector — shown when in reflection mode and no active reflection session */}
      {mode === 'reflection' && !isReflectionActive && !isReflectionCompleted && (
        <div className="flex-shrink-0 px-4 sm:px-6 py-4 border-b border-alpha-border bg-alpha-surface/30">
          <div className="max-w-3xl mx-auto">
            <TradeSelector
              trades={availableTrades}
              selectedTradeId={selectedTradeId}
              onSelect={(id) => {
                setSelectedTradeId(id)
                const trade = availableTrades.find((t) => t.id === id)
                if (trade) setSelectedTradeData(trade)
              }}
              onStartReflection={handleStartReflection}
              disabled={isStreaming || tradesLoading}
            />
          </div>
        </div>
      )}

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
          {/* Prompt Suggestions — only in free chat mode */}
          {mode === 'free_chat' && (
            <PromptSuggestions
              visible={inputValue.trim().length === 0 && !isStreaming}
              onSelect={handleSuggestionSelect}
            />
          )}

          {/* Reflection hint */}
          {isReflectionActive && inputValue.trim().length === 0 && !isStreaming && (
            <div className="mb-2 px-1">
              <p className="text-[11px] text-alpha-text-muted">
                💡 Jawab pertanyaan refleksi dari Alpha untuk melanjutkan ke langkah berikutnya
              </p>
            </div>
          )}

          {/* Input Bar */}
          <div className="flex items-end gap-2">
            {/* Hide screenshot uploader in reflection mode */}
            {mode === 'free_chat' && (
              <ScreenshotUploader
                onAnalyze={handleScreenshotAnalyze}
                compact
              />
            )}

            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  isReflectionActive
                    ? 'Ceritakan pengalaman tradingmu...'
                    : 'Tanya sesuatu tentang trading kamu...'
                }
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
