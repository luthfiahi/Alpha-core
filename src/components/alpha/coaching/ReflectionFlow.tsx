'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  Search,
  ClipboardCheck,
  ShieldAlert,
  Heart,
  Rocket,
} from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export interface ReflectionStep {
  id: number
  key: string
  title: string
  description: string
  icon: React.ElementType
}

export const REFLECTION_STEPS: ReflectionStep[] = [
  {
    id: 1,
    key: 'entry_analysis',
    title: 'Analisis Entry',
    description: 'Mengapa kamu masuk trade ini?',
    icon: Search,
  },
  {
    id: 2,
    key: 'plan_evaluation',
    title: 'Evaluasi Rencana',
    description: 'Apakah sesuai dengan setup plan?',
    icon: ClipboardCheck,
  },
  {
    id: 3,
    key: 'behavioral_check',
    title: 'Cek Perilaku',
    description: 'Ada yang hampir melanggar aturan?',
    icon: ShieldAlert,
  },
  {
    id: 4,
    key: 'emotion_assessment',
    title: 'Penilaian Emosi',
    description: 'Apa yang kamu rasakan selama trade?',
    icon: Heart,
  },
  {
    id: 5,
    key: 'growth_commitment',
    title: 'Komitmen Tumbuh',
    description: 'Apa yang akan kamu lakukan berbeda?',
    icon: Rocket,
  },
]

export interface ReflectionProgress {
  currentStep: number
  totalSteps: number
  completedSteps: number[]
}

interface ReflectionFlowProps {
  progress: ReflectionProgress
  className?: string
}

export function ReflectionFlow({ progress, className }: ReflectionFlowProps) {
  const { currentStep, totalSteps, completedSteps } = progress

  return (
    <TooltipProvider delayDuration={300}>
      <div className={cn('alpha-animate-in w-full', className)}>
        {/* Step indicators with progress bar */}
        <div className="flex items-center justify-center">
          {REFLECTION_STEPS.map((step, index) => {
            const isCompleted = completedSteps.includes(step.id)
            const isCurrent = step.id === currentStep
            const isFuture = step.id > currentStep && !isCompleted
            const Icon = step.icon

            return (
              <div key={step.id} className="flex items-center">
                {/* Step circle */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex flex-col items-center">
                      <motion.div
                        className={cn(
                          'alpha-press relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer',
                          isCompleted && 'bg-[#22C55E] shadow-lg shadow-[#22C55E]/30',
                          isCurrent &&
                            'bg-[#6366F1]/20 border-2 border-[#6366F1]',
                          isCurrent && !isCompleted &&
                            'shadow-lg shadow-[#6366F1]/20',
                          isFuture && 'bg-[#232636]/50 border-2 border-[#232636]/60'
                        )}
                        animate={
                          isCurrent && !isCompleted
                            ? {
                                boxShadow: [
                                  '0 0 0 0 rgba(99, 102, 241, 0.4)',
                                  '0 0 0 8px rgba(99, 102, 241, 0)',
                                ],
                              }
                            : {}
                        }
                        transition={
                          isCurrent
                            ? { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
                            : {}
                        }
                      >
                        {isCompleted ? (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                          >
                            <svg
                              className="w-5 h-5 text-white"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </motion.div>
                        ) : (
                          <Icon
                            className={cn(
                              'w-4 h-4',
                              isCurrent && 'text-[#6366F1]',
                              isFuture && 'text-[#6B7280]'
                            )}
                          />
                        )}

                        {/* Step number badge */}
                        <span
                          className={cn(
                            'absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center',
                            isCompleted && 'bg-[#16A34A] text-white',
                            isCurrent &&
                              'bg-[#6366F1] text-white',
                            isFuture && 'bg-[#232636] text-[#6B7280]'
                          )}
                        >
                          {step.id}
                        </span>
                      </motion.div>

                      {/* Step label */}
                      <span
                        className={cn(
                          'alpha-caption mt-2 whitespace-nowrap hidden sm:block',
                          isCompleted && 'text-[#22C55E]',
                          isCurrent && 'text-[#6366F1]',
                          isFuture && 'text-[#6B7280]'
                        )}
                      >
                        {step.title}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent
                    side="bottom"
                    className="bg-[#151827] border-[#232636] text-[#F3F4F6] text-xs"
                  >
                    <div className="text-center">
                      <p className="font-medium">{step.title}</p>
                      <p className="alpha-caption">{step.description}</p>
                      <p className="alpha-caption mt-0.5">
                        Langkah {step.id} dari {totalSteps}
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>

                {/* Connector line — progress bar style */}
                {index < REFLECTION_STEPS.length - 1 && (
                  <div className="flex-shrink-0 mx-1 sm:mx-2 w-8 sm:w-12">
                    <div className="relative h-1 rounded-full bg-[#232636]/50 overflow-hidden">
                      <motion.div
                        className={cn(
                          'absolute inset-y-0 left-0 rounded-full transition-all duration-500',
                          isCompleted ? 'bg-[#22C55E] w-full' : 'bg-[#6366F1] w-1/3'
                        )}
                      />
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Progress label */}
        <div className="flex items-center justify-center mt-1 sm:mt-2">
          <span className="alpha-caption">
            Refleksi Trade — Langkah{' '}
            <span className="text-[#6366F1] font-semibold">{currentStep}</span>/{' '}
            {totalSteps}
          </span>
        </div>
      </div>
    </TooltipProvider>
  )
}