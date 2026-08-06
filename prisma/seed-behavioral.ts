import { db } from '../src/lib/db.js'


async function seedBehavioralEvents() {
  // Find or create default trader
  let trader = await db.trader.findFirst()
  if (!trader) {
    trader = await db.trader.create({
      data: {
        email: 'trader@alpha.local',
        name: 'Luthfi',
      },
    })
  }

  // Find some trades to link events to
  const trades = await db.tradeEntry.findMany({
    where: { traderId: trader.id, deletedAt: null },
    orderBy: { createdAt: 'desc' },
    take: 10,
  })

  // Seed behavioral events
  const eventsData = [
    {
      traderId: trader.id,
      tradeId: trades[0]?.id || null,
      behaviorType: 'REVENGE_TRADING',
      severity: 'HIGH',
      confidence: 0.87,
      evidence: JSON.stringify({
        pattern: 'Quick re-entry after loss with increased lot size',
        previousLotSize: 0.01,
        newLotSize: 0.05,
        timeBetweenTrades: '2 hours',
        previousPnL: -45.50,
      }),
      aiAnalysis:
        'Terdeteksi pola revenge trading: setelah loss -45.50, trader kembali entry dengan lot size 5x lebih besar dalam 2 jam. Ini menunjukkan reaksi emosional terhadap loss.',
    },
    {
      traderId: trader.id,
      tradeId: trades[1]?.id || null,
      behaviorType: 'FOMO',
      severity: 'MEDIUM',
      confidence: 0.72,
      evidence: JSON.stringify({
        pattern: 'Entry during high volatility without clear setup',
        volatilityIndicator: 'high_spread',
        noStrategy: true,
        noPlanNotes: true,
        chasingPrice: true,
      }),
      aiAnalysis:
        'Terdeteksi kemungkinan FOMO: trade dilakukan tanpa strategy dan plan notes. Entry saat volatilitas tinggi, mengindikasikan fear of missing out.',
    },
    {
      traderId: trader.id,
      tradeId: trades[2]?.id || null,
      behaviorType: 'EARLY_CLOSE',
      severity: 'MEDIUM',
      confidence: 0.78,
      evidence: JSON.stringify({
        pattern: 'Closed profitable trade at 30% of target profit',
        potentialProfit: 120,
        actualProfit: 36,
        percentOfTarget: 30,
        exitBeforeTP: true,
      }),
      aiAnalysis:
        'Trade ditutup terlalu cepat: hanya mengambil 30% dari potensi profit (36 dari 120). Ini menunjukkan ketidaknyamanan terhadap profit yang sedang berjalan.',
    },
    {
      traderId: trader.id,
      tradeId: trades[3]?.id || null,
      behaviorType: 'OVERCONFIDENCE',
      severity: 'LOW',
      confidence: 0.65,
      evidence: JSON.stringify({
        pattern: 'Increased position size after 3 consecutive wins',
        consecutiveWins: 3,
        normalLotSize: 0.02,
        increasedLotSize: 0.08,
      }),
      aiAnalysis:
        'Setelah 3 kemenangan berturut-turut, trader meningkatkan lot size dari 0.02 ke 0.08. Meskipun belum menimbulkan masalah, ini adalah tanda awal overconfidence.',
    },
    {
      traderId: trader.id,
      tradeId: trades[4]?.id || null,
      behaviorType: 'FEAR',
      severity: 'MEDIUM',
      confidence: 0.81,
      evidence: JSON.stringify({
        pattern: 'Very tight stop loss with multiple early profitable exits',
        stopLossDistance: 5,
        averageStopLossDistance: 15,
        earlyExitCount: 3,
      }),
      aiAnalysis:
        'Terdeteksi pola fear-based trading: stop loss ditempatkan sangat dekat (5 pips vs rata-rata 15 pips). Terdapat 3 early exit pada trade yang sedang profit.',
    },
    {
      traderId: trader.id,
      tradeId: trades[5]?.id || null,
      behaviorType: 'MOVING_STOP_LOSS',
      severity: 'CRITICAL',
      confidence: 0.91,
      evidence: JSON.stringify({
        pattern: 'Stop loss moved further from entry during losing trade',
        originalSL: 1.0850,
        modifiedSL: 1.0880,
        slWidened: true,
        widenedBy: 30,
        tradeResult: -85,
      }),
      aiAnalysis:
        'Stop loss dipindahkan lebih jauh dari entry selama trade sedang loss (dari 1.0850 ke 1.0880). Ini adalah perilaku berisiko tinggi yang mengakibatkan loss -85.',
    },
  ]

  // Clear existing seed events (optional — comment out to keep existing)
  const existingEvents = await db.behavioralEvent.findMany({
    where: { traderId: trader.id },
  })
  if (existingEvents.length > 0) {
    await db.behavioralEvent.deleteMany({ where: { traderId: trader.id } })
    console.log(`Cleared ${existingEvents.length} existing behavioral events`)
  }

  // Create behavioral events
  for (const eventData of eventsData) {
    await db.behavioralEvent.create({ data: eventData })
  }

  console.log(`✅ Seeded ${eventsData.length} behavioral events for trader: ${trader.name}`)

  // Print summary
  const created = await db.behavioralEvent.findMany({
    where: { traderId: trader.id },
    orderBy: { createdAt: 'desc' },
  })
  console.log('\nBehavioral Events Summary:')
  for (const event of created) {
    console.log(
      `  • ${event.behaviorType} (${event.severity}) — confidence: ${(event.confidence * 100).toFixed(0)}%`
    )
  }
}

async function main() {
  try {
    await seedBehavioralEvents()
  } catch (error) {
    console.error('Seed error:', error)
    process.exit(1)
  } finally {
    await db.$disconnect()
  }
}

main()
