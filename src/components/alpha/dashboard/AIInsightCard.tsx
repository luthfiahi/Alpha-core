'use client'

interface AIInsightCardProps {
  insight: {
    id: string
    title: string
    content: string
    createdAt: string
    category: string
  } | null
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

export function AIInsightCard({ insight }: AIInsightCardProps) {
  // Default insight when none exists
  const title = insight?.title ?? 'Selamat Datang di Alpha'
  const content =
    insight?.content ??
    'Mulai catat trade pertamamu untuk mendapatkan insight personal dari AI Coach. Proses yang konsisten adalah kunci pertumbuhan.'
  const time = insight?.createdAt ? timeAgo(insight.createdAt) : 'Sekarang'

  return (
    <div className="alpha-card p-5 border-l-[3px] border-l-[#6366F1] h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2.5 mb-3">
          {/* AI Avatar */}
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              background:
                'linear-gradient(135deg, #6366F1 0%, #A78BFA 100%)',
            }}
          >
            <svg
              width={14}
              height={14}
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
          <span className="text-xs font-medium text-[#6366F1]">
            AI Coach Insight
          </span>
        </div>
        <h3 className="text-sm font-semibold text-[#F3F4F6] mb-1.5">
          {title}
        </h3>
        <p className="text-sm text-[#9CA3AF] leading-relaxed line-clamp-3">
          {content}
        </p>
      </div>
      <div className="mt-3">
        <span className="text-xs text-[#6B7280]">{time}</span>
      </div>
    </div>
  )
}
