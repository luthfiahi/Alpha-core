import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function seedAnalytics() {
  // Get or create trader
  let trader = await db.trader.findFirst()
  if (!trader) {
    trader = await db.trader.create({
      data: { email: 'trader@alpha.local', name: 'Luthfi' },
    })
  }
  console.log(`Using trader: ${trader.id} (${trader.name})`)

  // ========================================
  // 1. Seed 8 WeeklyReviewRecords
  // ========================================
  const weeklyReviewsData = [
    {
      weekStart: '2025-06-09', weekEnd: '2025-06-15',
      summary: 'Minggu pertama cukup baik. Proses trading mulai terbentuk meskipun masih ada beberapa deviasi dari rencana. Perlu fokus pada disiplin stop loss.',
      processScore: 52, ruleCompliance: 60, totalTrades: 8, winRate: 37.5, totalPnL: -120.5,
      biggestMistake: 'Memindahkan stop loss lebih jauh karena tidak mau loss — ini menyebabkan kerugian 2x lebih besar dari rencana awal.',
      recommendation: 'Fokus pada disiplin stop loss minggu depan. Tetapkan SL sebelum entry dan JANGAN pernah pindahkan ke arah yang merugikan.',
      topBehavioralIssue: 'MOVING_STOP_LOSS', playbookUsage: 40,
      emotionBreakdown: JSON.stringify({ calm: 35, anxious: 40, confident: 15, fearful: 10 }),
    },
    {
      weekStart: '2025-06-16', weekEnd: '2025-06-22',
      summary: 'Perbaikan signifikan dalam penggunaan playbook. Masih ada 2 kali revenge trading setelah loss beruntun. Emosi mulai lebih terkontrol.',
      processScore: 58, ruleCompliance: 65, totalTrades: 10, winRate: 45, totalPnL: -45.2,
      biggestMistake: 'Revenge trading setelah 3 loss beruntun di hari Selasa — masuk tanpa checklist dan tanpa konfirmasi setup.',
      recommendation: 'Buat aturan: setelah 2 loss berturut-turut, WAJIB istirahat minimal 1 jam sebelum trade lagi. Gunakan checklist sebelum setiap entry.',
      topBehavioralIssue: 'REVENGE_TRADING', playbookUsage: 55,
      emotionBreakdown: JSON.stringify({ calm: 40, anxious: 30, confident: 20, fearful: 10 }),
    },
    {
      weekStart: '2025-06-23', weekEnd: '2025-06-29',
      summary: 'Minggu terbaik sejauh ini! Proses score naik signifikan. Berhasil mengikuti playbook di 80% trade. Emosi lebih stabil.',
      processScore: 67, ruleCompliance: 78, totalTrades: 7, winRate: 57.1, totalPnL: 85.3,
      biggestMistake: 'Tutup posisi terlalu cepat di trade GBPJPY yang sebenarnya berjalan sesuai rencana — fear of losing profit.',
      recommendation: 'Pertahankan kedisiplinan! Gunakan trailing stop alih-alih menutup manual. Biarkan trade berjalan sesuai rencana.',
      topBehavioralIssue: 'EARLY_CLOSE', playbookUsage: 75,
      emotionBreakdown: JSON.stringify({ calm: 50, anxious: 20, confident: 22, fearful: 8 }),
    },
    {
      weekStart: '2025-06-30', weekEnd: '2025-07-06',
      summary: 'Sedikit penurunan performa karena overconfidence setelah minggu lalu. Trade size terlalu besar di beberapa posisi.',
      processScore: 61, ruleCompliance: 68, totalTrades: 12, winRate: 41.7, totalPnL: -32.8,
      biggestMistake: 'Meningkatkan lot size 2x dari biasanya karena merasa "dalam performa bagus" — melanggar aturan risk management.',
      recommendation: 'Ingat: overconfidence adalah jebakan. Tetap pada risk per trade 1-2% dari equity. Size tetap konsisten.',
      topBehavioralIssue: 'OVERCONFIDENCE', playbookUsage: 65,
      emotionBreakdown: JSON.stringify({ calm: 45, anxious: 15, confident: 32, fearful: 8 }),
    },
    {
      weekStart: '2025-07-07', weekEnd: '2025-07-13',
      summary: 'Kembali ke disiplin yang baik. FOMO berkurang drastis. Proses konsisten meskipun win rate sedikit turun.',
      processScore: 72, ruleCompliance: 82, totalTrades: 9, winRate: 44.4, totalPnL: 55.6,
      biggestMistake: 'Entry FOMO di NFP release tanpa rencana — masuk karena melihat harga bergerak cepat.',
      recommendation: 'Buat kalender ekonomi dan TIDAK trade 30 menit sebelum/sesudah major news. Proses > Hasil.',
      topBehavioralIssue: 'FOMO', playbookUsage: 82,
      emotionBreakdown: JSON.stringify({ calm: 55, anxious: 18, confident: 20, fearful: 7 }),
    },
    {
      weekStart: '2025-07-14', weekEnd: '2025-07-20',
      summary: 'Minggu yang sangat konsisten. Checklist digunakan di setiap trade. Risk management terjaga. Pertahankan!',
      processScore: 78, ruleCompliance: 88, totalTrades: 8, winRate: 62.5, totalPnL: 142.1,
      biggestMistake: 'Tidak ada kesalahan besar minggu ini. Hanya perlu memperbaiki catatan reflection yang masih kurang detail.',
      recommendation: 'Level saat ini sudah sangat baik. Fokus pada detail reflection dan analisis post-trade untuk naik ke level berikutnya.',
      topBehavioralIssue: 'EARLY_CLOSE', playbookUsage: 90,
      emotionBreakdown: JSON.stringify({ calm: 62, anxious: 12, confident: 20, fearful: 6 }),
    },
    {
      weekStart: '2025-07-21', weekEnd: '2025-07-27',
      summary: 'Minggu challenging dengan volatilitas tinggi. Beberapa trade terpengaruh fear saat drawdown. Perlu memperkuat mental.',
      processScore: 69, ruleCompliance: 75, totalTrades: 11, winRate: 45.5, totalPnL: -18.9,
      biggestMistake: 'Fear melanda saat drawdown 3 trade berturut-turut — mulai ragu pada setup dan mengurangi position size terlalu drastis.',
      recommendation: 'Drawdown adalah bagian normal dari trading. Buat drawdown plan: maksimal 5% per minggu, lalu evaluasi ulang.',
      topBehavioralIssue: 'FEAR', playbookUsage: 78,
      emotionBreakdown: JSON.stringify({ calm: 40, anxious: 28, confident: 18, fearful: 14 }),
    },
    {
      weekStart: '2025-07-28', weekEnd: '2025-08-03',
      summary: 'Pemulihan mental yang baik! Kembali mengikuti proses. Process score mendekati 80. Emosi lebih terkendali.',
      processScore: 76, ruleCompliance: 85, totalTrades: 7, winRate: 57.1, totalPnL: 98.4,
      biggestMistake: 'Sedikit kurang sabar menunggu konfirmasi setup sempurna di 2 trade — masuk sedikit terlalu awal.',
      recommendation: 'Perkuat kesabaran dengan menunggu semua checklist tercentang. Kualitas setup > kuantitas trade.',
      topBehavioralIssue: 'FOMO', playbookUsage: 88,
      emotionBreakdown: JSON.stringify({ calm: 58, anxious: 15, confident: 22, fearful: 5 }),
    },
  ]

  for (const wr of weeklyReviewsData) {
    await db.weeklyReviewRecord.upsert({
      where: { id: `${trader.id}-${wr.weekStart}` },
      update: wr,
      create: { id: `${trader.id}-${wr.weekStart}`, traderId: trader.id, ...wr },
    })
  }
  console.log('✅ Seeded 8 WeeklyReviewRecords')

  // ========================================
  // 2. Seed 30 GrowthSnapshots (daily over ~30 days)
  // ========================================
  const growthSnapshots = []
  const baseEmotion = 40
  const baseConsistency = 45
  const baseProcess = 48
  const baseBehavior = 42
  const baseDiscipline = 44
  const baseRisk = 46

  for (let i = 29; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]

    // Gradual improvement with some noise
    const progressFactor = (30 - i) / 30
    const noise = () => (Math.random() - 0.5) * 8

    const emotionScore = Math.min(100, Math.max(0, baseEmotion + progressFactor * 30 + noise()))
    const consistencyScore = Math.min(100, Math.max(0, baseConsistency + progressFactor * 28 + noise()))
    const processScore = Math.min(100, Math.max(0, baseProcess + progressFactor * 32 + noise()))
    const behaviorScore = Math.min(100, Math.max(0, baseBehavior + progressFactor * 35 + noise()))
    const disciplineScore = Math.min(100, Math.max(0, baseDiscipline + progressFactor * 30 + noise()))
    const riskMgmtScore = Math.min(100, Math.max(0, baseRisk + progressFactor * 26 + noise()))

    growthSnapshots.push({
      traderId: trader.id,
      period: 'DAILY',
      periodDate: dateStr,
      emotionScore: Math.round(emotionScore * 10) / 10,
      consistencyScore: Math.round(consistencyScore * 10) / 10,
      processScore: Math.round(processScore * 10) / 10,
      behaviorScore: Math.round(behaviorScore * 10) / 10,
      disciplineScore: Math.round(disciplineScore * 10) / 10,
      riskMgmtScore: Math.round(riskMgmtScore * 10) / 10,
      totalTrades: Math.floor(Math.random() * 3) + 1,
      winRate: Math.round((35 + Math.random() * 30) * 10) / 10,
      behavioralEvents: Math.floor(Math.random() * 2),
      notes: i % 7 === 0 ? 'Catatan mingguan otomatis oleh sistem.' : null,
    })
  }

  // Insert in batch
  for (const gs of growthSnapshots) {
    await db.growthSnapshot.upsert({
      where: { id: `${trader.id}-${gs.periodDate}` },
      update: gs,
      create: { id: `${trader.id}-${gs.periodDate}`, ...gs },
    })
  }
  console.log('✅ Seeded 30 GrowthSnapshots')

  // ========================================
  // 3. Seed 15 BehavioralEvents
  // ========================================
  const behaviorTypes = [
    { type: 'REVENGE_TRADING', analyses: [
      'Terdeteksi pola: setelah loss pada trade EURUSD pukul 14:32, trader langsung membuka posisi baru dalam 3 menit tanpa checklist. Ini menunjukkan reaksi emosional terhadap loss.',
      'Pola revenge trading terdeteksi: 3 trade dibuka dalam 10 menit setelah loss. Tidak ada jeda refleksi antar trade. Risk per trade meningkat dari 1% ke 3%.',
    ]},
    { type: 'FOMO', analyses: [
      'FOMO terdeteksi: Entry tanpa konfirmasi setup saat harga bergerak tajam setelah news NFP. Tidak ada checklist yang terisi sebelum entry.',
      'Trader masuk posisi karena melihat harga bergerak cepat, bukan karena setup terkonfirmasi. Ini pola klasik FOMO yang perlu diwaspadai.',
      'Entry di tengah-tengah pergerakan besar tanpa menunggu pullback. Emosi "tidak mau ketinggalan" terdeteksi dari catatan waktu entry yang sangat cepat.',
    ]},
    { type: 'OVERCONFIDENCE', analyses: [
      'Terdeteksi peningkatan lot size 2x dari rata-rata setelah 3 win berturut-turut. Ini adalah tanda overconfidence yang berbahaya.',
      'Setelah minggu dengan win rate tinggi, trader mulai melewatkan beberapa langkah checklist. "Feeling" mulai menggantikan proses sistematis.',
    ]},
    { type: 'FEAR', analyses: [
      'Fear terdeteksi: position size dikurangi drastis setelah 3 loss berturut-turut. Trader mulai meragukan setup yang sebenarnya valid.',
      'Stop loss diperketat secara berlebihan (5 pips dari entry), menyebabkan trade terhenti oleh noise sebelum bergerak ke arah yang benar.',
    ]},
    { type: 'MOVING_STOP_LOSS', analyses: [
      'Stop loss dipindahkan lebih jauh 3 kali dalam 1 trade. Awalnya -20 pips, dipindahkan ke -35 pips, lalu -50 pips. Kerugian akhir 2.5x dari rencana.',
      'Pola moving stop loss terdeteksi pada 2 dari 4 trade yang loss minggu ini. Ini kebiasaan yang perlu segera diatasi.',
    ]},
    { type: 'EARLY_CLOSE', analyses: [
      'Posisi ditutup terlalu cepat: profit +15 pips padahal target adalah +45 pips. Trade bergerak sesuai rencana sebelum ditutup.',
      'Terdeteksi pola early close pada 4 dari 7 winning trade minggu ini. Potensi profit terbuang rata-rata 60% per trade.',
      'Fear of losing profit menyebabkan trader menutup posisi saat floating profit, bukan saat mencapai target yang sudah ditentukan.',
    ]},
  ]

  const severityLevels: Array<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'> = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
  const behavioralEventsData = [
    { type: 'REVENGE_TRADING', severity: 'HIGH', confidence: 0.92, resolved: true, daysAgo: 45 },
    { type: 'MOVING_STOP_LOSS', severity: 'HIGH', confidence: 0.88, resolved: true, daysAgo: 42 },
    { type: 'FOMO', severity: 'MEDIUM', confidence: 0.75, resolved: true, daysAgo: 38 },
    { type: 'REVENGE_TRADING', severity: 'CRITICAL', confidence: 0.95, resolved: true, daysAgo: 35 },
    { type: 'EARLY_CLOSE', severity: 'MEDIUM', confidence: 0.82, resolved: false, daysAgo: 30 },
    { type: 'OVERCONFIDENCE', severity: 'MEDIUM', confidence: 0.78, resolved: true, daysAgo: 27 },
    { type: 'FEAR', severity: 'HIGH', confidence: 0.85, resolved: false, daysAgo: 22 },
    { type: 'MOVING_STOP_LOSS', severity: 'MEDIUM', confidence: 0.80, resolved: false, daysAgo: 18 },
    { type: 'FOMO', severity: 'HIGH', confidence: 0.87, resolved: false, daysAgo: 15 },
    { type: 'EARLY_CLOSE', severity: 'LOW', confidence: 0.65, resolved: false, daysAgo: 12 },
    { type: 'FEAR', severity: 'MEDIUM', confidence: 0.72, resolved: false, daysAgo: 9 },
    { type: 'OVERCONFIDENCE', severity: 'LOW', confidence: 0.60, resolved: true, daysAgo: 7 },
    { type: 'FOMO', severity: 'MEDIUM', confidence: 0.76, resolved: false, daysAgo: 4 },
    { type: 'EARLY_CLOSE', severity: 'MEDIUM', confidence: 0.79, resolved: false, daysAgo: 2 },
    { type: 'MOVING_STOP_LOSS', severity: 'LOW', confidence: 0.68, resolved: false, daysAgo: 1 },
  ]

  let analysisIdx: Record<string, number> = {}
  for (const bt of behaviorTypes) {
    analysisIdx[bt.type] = 0
  }

  for (const be of behavioralEventsData) {
    const btInfo = behaviorTypes.find(b => b.type === be.type)!
    const aiAnalysis = btInfo.analyses[analysisIdx[be.type] % btInfo.analyses.length]
    analysisIdx[be.type]++

    const createdAt = new Date()
    createdAt.setDate(createdAt.getDate() - be.daysAgo)

    await db.behavioralEvent.create({
      data: {
        traderId: trader.id,
        behaviorType: be.type,
        severity: be.severity,
        confidence: be.confidence,
        aiAnalysis,
        resolved: be.resolved,
        resolvedAt: be.resolved ? new Date(createdAt.getTime() + 2 * 24 * 60 * 60 * 1000) : null,
        evidence: JSON.stringify({ source: 'pattern_engine', detectedAt: createdAt.toISOString() }),
        createdAt,
      },
    })
  }
  console.log('✅ Seeded 15 BehavioralEvents')

  console.log('\n🎉 Analytics seed data complete!')
}

seedAnalytics()
  .catch(console.error)
  .finally(() => db.$disconnect())
