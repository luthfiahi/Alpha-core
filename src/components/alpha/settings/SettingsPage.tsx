'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import {
  User,
  Clock,
  Bell,
  AlertTriangle,
  Info,
  Save,
  Trash2,
  Loader2,
} from 'lucide-react'
import { useTraderStore } from '@/stores'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

// ── Constants ──────────────────────────────────────────

const TIMEFRAMES = ['M1', 'M5', 'M15', 'M30', 'H1', 'H4', 'D1', 'W1']
const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'IDR']
const TRADING_STYLES = ['Scalper', 'Day Trader', 'Swing Trader', 'Position Trader']

const TIMEZONES = [
  { value: 'Asia/Makassar', label: 'Asia/Makassar (WITA)' },
  { value: 'Asia/Jakarta', label: 'Asia/Jakarta (WIB)' },
  { value: 'Asia/Jayapura', label: 'Asia/Jayapura (WIT)' },
  { value: 'Asia/Singapore', label: 'Asia/Singapore' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo' },
  { value: 'Asia/Hong_Kong', label: 'Asia/Hong Kong' },
  { value: 'Europe/London', label: 'Europe/London' },
  { value: 'America/New_York', label: 'America/New York' },
]

// ── Helpers ────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

// ── Component ──────────────────────────────────────────

export function SettingsPage() {
  const { traderName, traderEmail, setTrader } = useTraderStore()

  // Profile state
  const [name, setName] = useState(traderName ?? '')
  const [timezone, setTimezone] = useState('Asia/Makassar')

  // Trading preferences state — load from localStorage on mount
  const [timeframe, setTimeframe] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('alpha:trading-prefs') || '{}')
      return saved.timeframe || 'H1'
    } catch { return 'H1' }
  })
  const [currency, setCurrency] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('alpha:trading-prefs') || '{}')
      return saved.currency || 'USD'
    } catch { return 'USD' }
  })
  const [lotSize, setLotSize] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('alpha:trading-prefs') || '{}')
      return saved.lotSize || '0.1'
    } catch { return '0.1' }
  })
  const [tradingStyle, setTradingStyle] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('alpha:trading-prefs') || '{}')
      return saved.tradingStyle || 'Day Trader'
    } catch { return 'Day Trader' }
  })

  // Notifications state — load from localStorage on mount
  const [weeklyReview, setWeeklyReview] = useState(() => {
    try { const v = localStorage.getItem('alpha:notif:weekly-review'); return v === null ? true : v === 'true' } catch { return true }
  })
  const [behavioralAlert, setBehavioralAlert] = useState(() => {
    try { const v = localStorage.getItem('alpha:notif:behavioral-alert'); return v === null ? true : v === 'true' } catch { return true }
  })
  const [growthReport, setGrowthReport] = useState(() => {
    try { const v = localStorage.getItem('alpha:notif:growth-report'); return v === null ? true : v === 'true' } catch { return true }
  })

  // Loading states
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPrefs, setSavingPrefs] = useState(false)
  const [resetting, setResetting] = useState(false)

  // Handlers
  const handleSaveProfile = async () => {
    setSavingProfile(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'profile',
          data: { name, timezone },
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error || 'Gagal menyimpan profil')
        return
      }
      // Update Zustand store with new name
      if (json.trader && traderName !== json.trader.name) {
        setTrader({
          id: json.trader.id,
          name: json.trader.name ?? '',
          email: json.trader.email,
          processScore: 0,
          totalTrades: 0,
          winRate: 0,
        })
      }
      toast.success('Profil berhasil disimpan')
    } catch {
      toast.error('Gagal menyimpan profil')
    } finally {
      setSavingProfile(false)
    }
  }

  const handleSaveTradingPrefs = async () => {
    setSavingPrefs(true)
    try {
      // Store preferences in localStorage as client-side fallback
      localStorage.setItem(
        'alpha:trading-prefs',
        JSON.stringify({ timeframe, currency, lotSize, tradingStyle })
      )
      toast.success('Preferensi trading berhasil disimpan')
    } catch {
      toast.error('Gagal menyimpan preferensi')
    } finally {
      setSavingPrefs(false)
    }
  }

  const handleResetAll = async () => {
    setResetting(true)
    try {
      const res = await fetch('/api/settings/reset', {
        method: 'DELETE',
      })
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error || 'Gagal mereset data')
        return
      }
      toast.success(
        `${json.totalDeleted ?? 0} data berhasil dihapus`
      )
    } catch {
      toast.error('Gagal mereset data')
    } finally {
      setResetting(false)
    }
  }

  const initials = getInitials(name || 'U')

  return (
    <ScrollArea className="h-full">
      <div className="alpha-animate-in p-6 lg:p-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Page Header */}
          <div>
            <h1 className="text-xl font-bold text-[#F3F4F6]">Pengaturan</h1>
            <p className="alpha-caption mt-1">
              Kelola profil, preferensi trading, dan notifikasi
            </p>
          </div>

          {/* ─────────── 1. Profile Section ─────────── */}
          <section className="alpha-card alpha-animate-in alpha-stagger-1 p-6">
            <div className="flex items-center gap-2.5 mb-5">
              <User className="w-4.5 h-4.5 text-[#6366F1]" />
              <h2 className="alpha-heading-sm text-[#F3F4F6]">
                Profil
              </h2>
            </div>

            <div className="space-y-5">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 text-lg">
                  <AvatarImage src={undefined} alt={name} />
                  <AvatarFallback className="bg-[#6366F1]/20 text-[#6366F1] font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-[#F3F4F6]">
                    {name || 'Trader'}
                  </p>
                  <p className="alpha-caption">
                    {traderEmail || '—'}
                  </p>
                </div>
              </div>

              <Separator className="bg-[#232636]" />

              {/* Name */}
              <div className="space-y-2">
                <Label
                  htmlFor="settings-name"
                  className="alpha-label"
                >
                  Nama
                </Label>
                <Input
                  id="settings-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Masukkan nama kamu"
                  className="alpha-focus-ring bg-[#1E2030] border-[#232636] text-[#F3F4F6] placeholder:text-[#6B7280] focus-visible:border-[#6366F1] focus-visible:ring-[#6366F1]/30 h-9"
                />
              </div>

              {/* Email (read-only) */}
              <div className="space-y-2">
                <Label
                  htmlFor="settings-email"
                  className="alpha-label"
                >
                  Email
                </Label>
                <div className="flex items-center gap-2.5">
                  <Input
                    id="settings-email"
                    value={traderEmail ?? ''}
                    readOnly
                    className="bg-[#1E2030] border-[#232636] text-[#9CA3AF] cursor-not-allowed h-9"
                  />
                  <Badge
                    variant="secondary"
                    className="bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30 text-xs whitespace-nowrap shrink-0"
                  >
                    Verified
                  </Badge>
                </div>
              </div>

              {/* Timezone */}
              <div className="space-y-2">
                <Label className="alpha-label">
                  Zona Waktu
                </Label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger className="alpha-focus-ring w-full bg-[#1E2030] border-[#232636] text-[#F3F4F6] h-9">
                    <SelectValue placeholder="Pilih zona waktu" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#151827] border-[#232636]">
                    {TIMEZONES.map((tz) => (
                      <SelectItem
                        key={tz.value}
                        value={tz.value}
                        className="text-[#F3F4F6] focus:bg-[#1E2030] focus:text-[#F3F4F6]"
                      >
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-1">
                <Button
                  onClick={handleSaveProfile}
                  disabled={savingProfile}
                  className="alpha-press bg-[#6366F1] hover:bg-[#818CF8] text-white h-9 px-4 text-sm font-medium"
                >
                  {savingProfile ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  {savingProfile ? 'Menyimpan...' : 'Simpan Profil'}
                </Button>
              </div>
            </div>
          </section>

          {/* ─────────── 2. Trading Preferences ─────────── */}
          <section className="alpha-card alpha-animate-in alpha-stagger-2 p-6">
            <div className="flex items-center gap-2.5 mb-5">
              <Clock className="w-4.5 h-4.5 text-[#6366F1]" />
              <h2 className="alpha-heading-sm text-[#F3F4F6]">
                Preferensi Trading
              </h2>
            </div>

            <div className="space-y-5">
              {/* Default Timeframe */}
              <div className="space-y-2">
                <Label className="alpha-label">
                  Timeframe Default
                </Label>
                <Select value={timeframe} onValueChange={setTimeframe}>
                  <SelectTrigger className="alpha-focus-ring w-full bg-[#1E2030] border-[#232636] text-[#F3F4F6] h-9">
                    <SelectValue placeholder="Pilih timeframe" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#151827] border-[#232636]">
                    {TIMEFRAMES.map((tf) => (
                      <SelectItem
                        key={tf}
                        value={tf}
                        className="text-[#F3F4F6] focus:bg-[#1E2030] focus:text-[#F3F4F6]"
                      >
                        {tf}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Default Currency */}
              <div className="space-y-2">
                <Label className="alpha-label">
                  Mata Uang Default
                </Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger className="alpha-focus-ring w-full bg-[#1E2030] border-[#232636] text-[#F3F4F6] h-9">
                    <SelectValue placeholder="Pilih mata uang" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#151827] border-[#232636]">
                    {CURRENCIES.map((c) => (
                      <SelectItem
                        key={c}
                        value={c}
                        className="text-[#F3F4F6] focus:bg-[#1E2030] focus:text-[#F3F4F6]"
                      >
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Default Lot Size */}
              <div className="space-y-2">
                <Label
                  htmlFor="settings-lot"
                  className="alpha-label"
                >
                  Lot Size Default
                </Label>
                <Input
                  id="settings-lot"
                  type="number"
                  step={0.01}
                  min={0.01}
                  value={lotSize}
                  onChange={(e) => setLotSize(e.target.value)}
                  placeholder="0.1"
                  className="alpha-focus-ring bg-[#1E2030] border-[#232636] text-[#F3F4F6] placeholder:text-[#6B7280] focus-visible:border-[#6366F1] focus-visible:ring-[#6366F1]/30 h-9 font-financial"
                />
              </div>

              {/* Trading Style */}
              <div className="space-y-2">
                <Label className="alpha-label">
                  Gaya Trading
                </Label>
                <Select value={tradingStyle} onValueChange={setTradingStyle}>
                  <SelectTrigger className="alpha-focus-ring w-full bg-[#1E2030] border-[#232636] text-[#F3F4F6] h-9">
                    <SelectValue placeholder="Pilih gaya trading" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#151827] border-[#232636]">
                    {TRADING_STYLES.map((style) => (
                      <SelectItem
                        key={style}
                        value={style}
                        className="text-[#F3F4F6] focus:bg-[#1E2030] focus:text-[#F3F4F6]"
                      >
                        {style}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-1">
                <Button
                  onClick={handleSaveTradingPrefs}
                  disabled={savingPrefs}
                  className="alpha-press bg-[#6366F1] hover:bg-[#818CF8] text-white h-9 px-4 text-sm font-medium"
                >
                  {savingPrefs ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  {savingPrefs ? 'Menyimpan...' : 'Simpan Preferensi'}
                </Button>
              </div>
            </div>
          </section>

          {/* ─────────── 3. Notifications ─────────── */}
          <section className="alpha-card alpha-animate-in alpha-stagger-3 p-6">
            <div className="flex items-center gap-2.5 mb-5">
              <Bell className="w-4.5 h-4.5 text-[#6366F1]" />
              <h2 className="alpha-heading-sm text-[#F3F4F6]">
                Notifikasi
              </h2>
            </div>

            <div className="space-y-1">
              {/* Weekly Review Reminder */}
              <div className="flex items-center justify-between py-3">
                <div className="space-y-0.5 pr-4">
                  <p className="text-sm font-medium text-[#F3F4F6]">
                    Pengingat Review Mingguan
                  </p>
                  <p className="alpha-caption">
                    Dapatkan pengingat untuk menyelesaikan review mingguan
                  </p>
                </div>
                <Switch
                  checked={weeklyReview}
                  onCheckedChange={(v) => { setWeeklyReview(v); localStorage.setItem('alpha:notif:weekly-review', String(v)) }}
                  className="shrink-0"
                />
              </div>

              <Separator className="bg-[#232636]" />

              {/* Behavioral Alert */}
              <div className="flex items-center justify-between py-3">
                <div className="space-y-0.5 pr-4">
                  <p className="text-sm font-medium text-[#F3F4F6]">
                    Peringatan Perilaku
                  </p>
                  <p className="alpha-caption">
                    Notifikasi ketika terdeteksi pola perilaku yang perlu diperhatikan
                  </p>
                </div>
                <Switch
                  checked={behavioralAlert}
                  onCheckedChange={(v) => { setBehavioralAlert(v); localStorage.setItem('alpha:notif:behavioral-alert', String(v)) }}
                  className="shrink-0"
                />
              </div>

              <Separator className="bg-[#232636]" />

              {/* Growth Report Ready */}
              <div className="flex items-center justify-between py-3">
                <div className="space-y-0.5 pr-4">
                  <p className="text-sm font-medium text-[#F3F4F6]">
                    Laporan Pertumbuhan Siap
                  </p>
                  <p className="alpha-caption">
                    Dapatkan notifikasi ketika laporan pertumbuhan baru tersedia
                  </p>
                </div>
                <Switch
                  checked={growthReport}
                  onCheckedChange={(v) => { setGrowthReport(v); localStorage.setItem('alpha:notif:growth-report', String(v)) }}
                  className="shrink-0"
                />
              </div>
            </div>
          </section>

          {/* ─────────── 4. Danger Zone ─────────── */}
          <section className="alpha-card alpha-animate-in alpha-stagger-4 p-6 border-[#EF4444]/30">
            <div className="flex items-center gap-2.5 mb-4">
              <AlertTriangle className="w-4.5 h-4.5 text-[#EF4444]" />
              <h2 className="alpha-heading-sm text-[#EF4444]">
                Zona Berbahaya
              </h2>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-[#F3F4F6]">
                  Reset Semua Data
                </p>
                <p className="alpha-caption mt-0.5">
                  Hapus semua data trading, playbook, dan coaching. Tindakan ini
                  tidak bisa dibatalkan.
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="alpha-press shrink-0 h-9 px-4 text-sm font-medium"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Reset Data
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-[#151827] border-[#232636]">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-[#F3F4F6]">
                      Apakah kamu yakin?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-[#9CA3AF]">
                      Tindakan ini akan menghapus semua data trading, playbook,
                      dan coaching secara permanen. Tindakan ini tidak bisa
                      dibatalkan.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-[#1E2030] border-[#232636] text-[#9CA3AF] hover:bg-[#232636] hover:text-[#F3F4F6]">
                      Batal
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleResetAll}
                      disabled={resetting}
                      className="bg-[#EF4444] hover:bg-[#EF4444]/90 text-white"
                    >
                      {resetting ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                      ) : null}
                      {resetting ? 'Menghapus...' : 'Ya, Hapus Semua'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </section>

          {/* ─────────── 5. App Info ─────────── */}
          <section className="alpha-animate-in alpha-stagger-5 text-center py-6">
            <div className="flex items-center justify-center gap-2 mb-1.5">
              <Info className="w-3.5 h-3.5 text-[#6B7280]" />
              <p className="text-sm font-semibold text-[#9CA3AF]">
                Project Alpha
              </p>
            </div>
            <p className="alpha-caption">v0.2.1</p>
            <p className="alpha-caption mt-1.5">
              Dibuat dengan ❤️ untuk trader Indonesia
            </p>
          </section>
        </div>
      </div>
    </ScrollArea>
  )
}