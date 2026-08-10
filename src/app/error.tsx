'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[ROUTE ERROR BOUNDARY]', error)
  }, [error])

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-[#0B0D17] p-6">
      <div className="flex flex-col items-center gap-4 max-w-md text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/15 ring-1 ring-red-500/25">
          <AlertTriangle className="h-8 w-8 text-red-400" />
        </div>
        <h2 className="text-lg font-semibold text-[#F3F4F6]">
          Terjadi Kesalahan
        </h2>
        <p className="text-sm text-[#9CA3AF] leading-relaxed">
          {error.message || 'Halaman mengalami error yang tidak terduga.'}
        </p>
        {error.digest && (
          <p className="text-xs text-[#4B5563]">
            Error ID: {error.digest}
          </p>
        )}
        <div className="w-full rounded-lg bg-[#151827] border border-[#232636] p-3 mt-2">
          <p className="text-[10px] text-[#4B5563] font-mono break-all">
            {error.stack?.split('\n').slice(0, 3).join('\n') || 'No stack trace'}
          </p>
        </div>
        <button
          onClick={reset}
          className="mt-2 h-11 rounded-lg bg-[#6366F1] px-6 text-sm font-semibold text-white hover:bg-[#5558E6] transition-colors inline-flex items-center gap-2"
        >
          <RefreshCw size={16} />
          Coba Lagi
        </button>
      </div>
    </div>
  )
}
