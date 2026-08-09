'use client'

interface TraderContext {
  todayTradesCount: number
  processScore: number | null
}

interface AIInsightCardProps {
  insight: {
    id: string
    title: string
    content: string
    createdAt: string
    category: string
  } | null
  traderContext?: TraderContext
}

function timeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHr = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHr / 24)

  if (diffMin < 1) return 'Baru saja'
  if (diffMin < 60) return `${diffMin}m lalu`
  if (diffHr < 24) return `${diffHr}j lalu`
  return `${diffDay}h lalu`
}

function getDefaultMessage(ctx?: TraderContext): { title: string; content: string } {
  if (!ctx) {
    return {
      title: 'Selamat Datang di Alpha',
      content: 'Mulai catat trade pertamamu untuk mendapatkan insight personal dari AI Coach.',
    }
  }
  if (ctx.todayTradesCount === 0) {
    return {
      title: 'Hari Ini Belum Ada Trade',
      content: 'Hari ini belum ada trade. Ingat, kualitas lebih penting dari kuantitas. Fokus pada setup yang sudah kamu rencanakan.',
    }
  }
  if (ctx.processScore === null) {
    return {
      title: 'Selamat Datang di Alpha',
      content: 'Selamat datang di Alpha! Catat trade pertamamu untuk mendapatkan insight personal dari AI Coach.',
    }
  }
  if (ctx.processScore <= 40) {
    return {
      title: 'Fokus pada Proses',
      content: 'Process Score-mu masih di bawah 40. Fokus pada disiplin menjalankan trading plan dan mengelola risiko.',
    }
  }
  if (ctx.processScore > 80) {
    return {
      title: 'Konsistensi yang Baik!',
      content: 'Process Score-mu sudah sangat baik! Pertahankan konsistensi dan terus lakukan refleksi.',
    }
  }
  return {
    title: 'Selamat Datang di Alpha',
    content: 'Mulai catat trade pertamamu untuk mendapatkan insight personal dari AI Coach.',
  }
}

export function AIInsightCard({ insight, traderContext }: AIInsightCardProps) {
  const defaultMsg = getDefaultMessage(traderContext)
  const title = insight?.title ?? defaultMsg.title
  const content = insight?.content ?? defaultMsg.content
  const time = insight?.createdAt ? timeAgo(insight.createdAt) : 'Sekarang'

  return (
    <div className="alpha-card p-5 h-full flex flex-col justify-between relative overflow-hidden">
      {/* Gradient left border — more visible (2px) */}
      <div
        className="absolute left-0 top-0 bottom-0 w-0.5"
        style={{
          background: 'linear-gradient(to bottom, #6366F1, #8B5CF6, #A78BFA)',
        }}
      />
      <div className="pl-4">
        <div className="flex items-center gap-3 mb-3">
          {/* AI Avatar — larger with ring/glow and shimmer */}
          <div className="relative flex-shrink-0">
            {/* Outer glow ring */}
            <div
              className="absolute -inset-1 rounded-full opacity-40"
              style={{
                background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #A78BFA 100%)',
                filter: 'blur(4px)',
              }}
            />
            {/* Shimmer animation overlay */}
            <style>{`
              @keyframes ai-shimmer {
                0% { background-position: -200% center; }
                100% { background-position: 200% center; }
              }
              .ai-avatar-shimmer::after {
                content: '';
                position: absolute;
                inset: 0;
                border-radius: 50%;
                background: linear-gradient(
                  90deg,
                  transparent 0%,
                  rgba(255,255,255,0.15) 50%,
                  transparent 100%
                );
                background-size: 200% 100%;
                animation: ai-shimmer 3s ease-in-out infinite;
              }
            `}</style>
            <div
              className="ai-avatar-shimmer relative w-9 h-9 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #6366F1 0%, #A78BFA 100%)',
                animation: 'alpha-subtle-pulse 3s ease-in-out infinite',
              }}
            >
              <svg
                width={16}
                height={16}
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4Z" />
                <path d="M16 14H8a6 6 0 0 0-6 6v2h20v-2a6 6 0 0 0-6-6Z" />
                <path d="M9 18h6" />
              </svg>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold tracking-wide text-[#6366F1]">
              ✦ ALPHA INSIGHT
            </span>
            <span className="text-[10px] text-[#6B7280] -mt-0.5">
              Based on your recent behavior
            </span>
          </div>
        </div>
        <h3 className="alpha-heading-sm mb-1.5">
          {title}
        </h3>
        <p className="alpha-body line-clamp-3">
          {content}
        </p>
      </div>
      <div className="mt-3 pl-4 flex items-center justify-between">
        <span className="alpha-caption">{time}</span>
        <span
          className="alpha-link text-[11px] font-medium"
          style={{ color: '#818CF8' }}
        >
          Read more →
        </span>
      </div>
    </div>
  )
}