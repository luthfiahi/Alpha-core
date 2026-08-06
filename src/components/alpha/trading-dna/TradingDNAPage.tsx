'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Dna, Lightbulb, Sparkles } from 'lucide-react'
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

  const strengths: string[] = dna?.strengths ? JSON.parse(dna.strengths) : []
  const weaknesses: string[] = dna?.weaknesses ? JSON.parse(dna.weaknesses) : []

  // Fetch DNA
  const fetchDNA = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/trading-dna')
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6]">
            <Dna size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#F3F4F6]">
              🧬 Trading DNA
            </h1>
            <p className="text-sm text-[#6B7280]">
              Profil identitas trading-mu
            </p>
          </div>
        </div>
      </motion.div>

      {notGenerated && !isLoading ? (
        /* Empty State */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-col items-center justify-center rounded-[14px] border border-[#232636] bg-[#151827] px-6 py-20"
        >
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#6366F1]/10">
            <Sparkles size={28} className="text-[#6366F1]" />
          </div>
          <h2 className="mb-2 text-lg font-semibold text-[#F3F4F6]">
            DNA Belum Tersedia
          </h2>
          <p className="mb-6 max-w-sm text-center text-sm text-[#6B7280]">
            Alpha akan menganalisis seluruh data trading-mu untuk menghasilkan profil Trading DNA yang unik.
          </p>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="gap-2 bg-[#6366F1] text-white hover:bg-[#4F46E5]"
          >
            <Dna size={16} />
            {isGenerating ? 'Menganalisis...' : 'Generate DNA'}
          </Button>
        </motion.div>
      ) : (
        /* DNA Content */
        <>
          {/* Top Row: Identity + Strengths/Weaknesses */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <IdentityCard
              tradingStyle={dna?.tradingStyle || null}
              dominantEmotion={dna?.dominantEmotion || null}
              totalTradesAnalyzed={dna?.totalTradesAnalyzed || 0}
              analysisPeriod={dna?.analysisPeriod || null}
              isLoading={isLoading}
            />
            <StrengthsWeaknesses
              strengths={strengths}
              weaknesses={weaknesses}
              isLoading={isLoading}
            />
          </div>

          {/* Middle: Performance Patterns */}
          <PerformancePatterns
            bestSetup={dna?.bestSetup || null}
            bestSession={dna?.bestSession || null}
            bestRiskReward={dna?.bestRiskReward || null}
            bestPair={dna?.bestPair || null}
            worstSetup={dna?.worstSetup || null}
            worstSession={dna?.worstSession || null}
            isLoading={isLoading}
          />

          {/* AI Summary */}
          <AISummary
            aiSummary={dna?.aiSummary || null}
            updatedAt={dna?.updatedAt || null}
            isGenerating={isGenerating}
            onRegenerate={handleGenerate}
            isLoading={isLoading}
          />

          {/* Action Items */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="rounded-[14px] border border-[#232636] bg-[#151827] p-6"
          >
            <div className="mb-4 flex items-center gap-2">
              <Lightbulb size={18} className="text-amber-400" />
              <h3 className="text-sm font-semibold text-[#F3F4F6]">
                Rekomendasi Alpha
              </h3>
            </div>
            <p className="mb-4 text-xs text-[#6B7280]">
              Berdasarkan DNA-mu, Alpha merekomendasikan:
            </p>
            <div className="space-y-2">
              {actionItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 rounded-lg bg-[#10121E] px-4 py-3"
                >
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/15">
                    <span className="text-xs font-bold text-amber-500">
                      {item.id + 1}
                    </span>
                  </div>
                  <p className="text-sm text-[#D1D5DB]">{item.text}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </div>
  )
}
