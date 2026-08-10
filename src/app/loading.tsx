export default function Loading() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#0B0D17]">
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] animate-pulse">
          <span className="text-lg font-bold text-white">A</span>
        </div>
        <p className="text-sm text-[#6B7280]">Memuat...</p>
      </div>
    </div>
  )
}
