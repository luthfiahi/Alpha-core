'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Dna, Lightbulb, Sparkles, AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { IdentityCard } from './IdentityCard'
import { StrengthsWeaknesses } from './StrengthsWeaknesses'
import { PerformancePatterns } from './PerformancePatterns'
import { AISummary } from './AISummary'

// ========================================
// Types
// ========================================

interface TradingDNAD {
  id: string
  tradingStyle: string | null
  dominantEmotion: string | null
  strengths: string | null
  weaknesses: string | null
  bestSetup: string | null
  bestSession: string | null
  bestRiskReward: string | null
  bestPair: string | null
  worstSetup: string | null
  worstSession: string | null
  totalTradesAnalyzed: number
  analysisPeriod: string | null
  aiSummary: string | null
  updatedAt: string
  createdAt: string
}

// ========================================
// Main Trading DNA Page
// ========================================

export function TradingDNAPage() {
  const [dna, setDna] = useState<TradingDNAD | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [notGenerated, setNotGenerated] = useState(false)
  const [isError, setIsError] = useState(false)

  const strengths: string[] = (() => { try { return dna?.strengths ? JSON.parse(dna.strengths) : [] } catch { return [] } })()
  const weaknesses: string[] = (() => { try { return dna?.weaknesses ? JSON.parse(dna.weaknesses) : [] } catch { return [] } })()

  // Fetch DNA
  const fetchDNA = useCallback(async () => {
    setIsLoading(true)
    setIsError(false)
    try {
      const res = await fetch('/api/trading-dna')
      if (!res.ok) throw new Error('Gagal memuat data DNA')
      const data = await res.json()
      if (data.dna) {
        setDna(data.dna)
        setNotGenerated(false)
      } else {
        setDna(null)
        setNotGenerated(true)
      }
    } catch (err) {
      console.error('Failed to fetch DNA:', err)
      setIsError(true)
      setNotGenerated(false)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDNA()
  }, [fetchDNA])

  // Generate DNA
  const handleGenerate = useCallback(async () => {
    setIsGenerating(true)
    try {
      const res = await fetch('/api/trading-dna', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Gagal generate DNA')
      }
      const data = await res.json()
      if (data.dna) {
        setDna(data.dna)
        setNotGenerated(false)
      }
    } catch (err) {
      console.error('Failed to generate DNA:', err)
    } finally {
      setIsGenerating(false)
    }
  }, [])

  // Action items based on weaknesses
  const actionItems = weaknesses.length > 0
    ? weaknesses.slice(0, 3).map((w, i) => ({
        id: i,
        text: w,
      }))
    : [
        { id: 0, text: 'Generate DNA untuk mendapatkan rekomendasi personal' },
      ]

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-8 alpha-animate-in">
        {/* Header skeleton */}
        <div className="space-y-2">
          <div className="h-8 w-56 animate-pulse rounded-lg bg-[#1E2030]" />
          <div className="h-4 w-72 animate-pulse rounded-md bg-[#1E2030]" />
        </div>
        {/* Hero card skeleton */}
        <div className="h-56 animate-pulse rounded-[14px] bg-[#151827] border border-[#232636]" />
        {/* Strengths/Weaknesses skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="h-48 animate-pulse rounded-[14px] bg-[#151827] border border-[#232636]" />
          <div className="h-48 animate-pulse rounded-[14px] bg-[#151827] border border-[#232636]" />
        </div>
        {/* Behavioral skeleton */}
        <div className="h-64 animate-pulse rounded-[14px] bg-[#151827] border border-[#232636]" />
        {/* AI Summary skeleton */}
        <div className="h-40 animate-pulse rounded-[14px] bg-[#151827] border border-[#232636]" />
      </div>
    )
  }

  return (
    <div className="space-y-8 alpha-animate-in">
      {/* ── Page Header ── */}
      <div className="alpha-animate-in">
        <h1 className="alpha-heading-xl uppercase tracking-[0.15em] text-[#F3F4F6]">
          TRADING DNA
        </h1>
        <p className="mt-1.5 alpha-body text-[#9CA3AF]">
          Your trading identity, based on behavior.
        </p>
      </div>

      {isError ? (
        /* ── Error State ── */
        <div className="flex items-center justify-center min-h-[320px]">
          <div className="flex flex-col items-center gap-4 rounded-[14px] border border-[#232636] bg-[#151827] px-8 py-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F59E0B]/10">
              <AlertTriangle className="size-7 text-[#F59E0B]" />
            </div>
            <div>
              <p className="alpha-heading-sm text-[#F3F4F6]">Gagal memuat Trading DNA</p>
              <p className="mt-1 alpha-caption">Terjadi kesalahan saat memuat data.</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 text-[#9CA3AF] hover:text-[#F3F4F6] hover:bg-[#1E2030] alpha-press"
              onClick={() => fetchDNA()}
            >
              <RefreshCw className="size-3.5 mr-1.5" />
              Coba Lagi
            </Button>
          </div>
        </div>
      ) : notGenerated ? (
        /* ── Empty State ── */
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center justify-center rounded-[14px] border border-[#232636] bg-[#151827] px-6 py-24"
        >
          {/* Hexagonal DNA icon */}
          <div className="relative mb-6">
            <div className="absolute inset-0 rounded-2xl bg-[#6366F1]/20 blur-xl" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6366F1]/20 to-[#8B5CF6]/10 border border-[#6366F1]/20">
              <Sparkles size={32} className="text-[#6366F1]" />
            </div>
          </div>
          <h2 className="mb-2 alpha-heading-lg text-[#F3F4F6]">
            DNA Belum Tersedia
          </h2>
          <p className="mb-8 max-w-md text-center alpha-body text-[#6B7280] leading-relaxed">
            Alpha akan menganalisis seluruh data trading-mu untuk menghasilkan profil Trading DNA yang unik dan personal.
          </p>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="gap-2.5 bg-[#6366F1] text-white hover:bg-[#4F46E5] alpha-press px-6 py-5 text-sm font-medium"
          >
            <Dna size={16} />
            {isGenerating ? 'Menganalisis...' : 'Generate DNA'}
          </Button>
        </motion.div>
      ) : (
        /* ── DNA Content ── */
        <>
          {/* Hero: Identity Card — full width */}
          <div className="alpha-animate-in alpha-stagger-1">
            <IdentityCard
              tradingStyle={dna?.tradingStyle || null}
              dominantEmotion={dna?.dominantEmotion || null}
              totalTradesAnalyzed={dna?.totalTradesAnalyzed || 0}
              analysisPeriod={dna?.analysisPeriod || null}
              isLoading={isLoading}
            />
          </div>

          {/* Strengths / Weaknesses — side by side on desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="alpha-animate-in alpha-stagger-2">
              <StrengthsWeaknesses
                strengths={strengths}
                weaknesses={weaknesses}
                isLoading={isLoading}
              />
            </div>
          </div>

          {/* Behavioral Profile */}
          <div className="alpha-animate-in alpha-stagger-3">
            <PerformancePatterns
              bestSetup={dna?.bestSetup || null}
              bestSession={dna?.bestSession || null}
              bestRiskReward={dna?.bestRiskReward || null}
              bestPair={dna?.bestPair || null}
              worstSetup={dna?.worstSetup || null}
              worstSession={dna?.worstSession || null}
              isLoading={isLoading}
            />
          </div>

          {/* AI Summary */}
          <div className="alpha-animate-in alpha-stagger-4">
            <AISummary
              aiSummary={dna?.aiSummary || null}
              updatedAt={dna?.updatedAt || null}
              isGenerating={isGenerating}
              onRegenerate={handleGenerate}
              isLoading={isLoading}
              totalTrades={dna?.totalTradesAnalyzed || 0}
            />
          </div>

          {/* Action Items — Rekomendasi Alpha */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="alpha-animate-in alpha-stagger-5 rounded-[14px] border border-[#232636] bg-[#151827] p-6"
          >
            <div className="mb-5 flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#F59E0B]/10">
                <Lightbulb size={15} className="text-[#F59E0B]" />
              </div>
              <h3 className="alpha-heading-sm text-[#F3F4F6]">
                Rekomendasi Alpha
              </h3>
            </div>
            <p className="mb-4 alpha-body text-[#6B7280]">
              Berdasarkan DNA-mu, Alpha merekomendasikan:
            </p>
            <div className="space-y-2.5">
              {actionItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3.5 rounded-xl bg-[#0B0D17]/60 px-4 py-3.5 border border-[#232636]/50"
                >
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#F59E0B]/12">
                    <span className="text-[10px] font-bold text-[#F59E0B]">
                      {item.id + 1}
                    </span>
                  </div>
                  <p className="alpha-body text-[#D1D5DB] leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </div>
  )
}