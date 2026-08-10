import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-[#0B0D17] p-6">
      <div className="flex flex-col items-center gap-4 max-w-md text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#6366F1]/15 ring-1 ring-[#6366F1]/25">
          <span className="text-2xl font-bold text-[#818CF8]">404</span>
        </div>
        <h2 className="text-lg font-semibold text-[#F3F4F6]">
          Halaman Tidak Ditemukan
        </h2>
        <p className="text-sm text-[#9CA3AF] leading-relaxed">
          Halaman yang kamu cari tidak ada atau sudah dipindahkan.
        </p>
        <Link
          href="/"
          className="mt-2 h-11 rounded-lg bg-[#6366F1] px-6 text-sm font-semibold text-white hover:bg-[#5558E6] transition-colors inline-flex items-center"
        >
          Kembali ke Dashboard
        </Link>
      </div>
    </div>
  )
}
