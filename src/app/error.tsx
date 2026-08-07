'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body className="bg-[#0B0D17]">
        <div className="flex min-h-screen w-full flex-col items-center justify-center p-6">
          <div className="flex flex-col items-center gap-4 max-w-md text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/15 ring-1 ring-red-500/25">
              <span className="text-3xl">⚠️</span>
            </div>
            <h2 className="text-lg font-semibold text-[#F3F4F6]">
              Terjadi Kesalahan Aplikasi
            </h2>
            <p className="text-sm text-[#9CA3AF] leading-relaxed">
              {error.message || 'Something went wrong'}
            </p>
            {error.digest && (
              <p className="text-xs text-[#4B5563]">
                Error ID: {error.digest}
              </p>
            )}
            <button
              onClick={reset}
              className="mt-2 h-11 rounded-lg bg-[#6366F1] px-6 text-sm font-semibold text-white hover:bg-[#5558E6] transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
