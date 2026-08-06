import { db } from '../src/lib/db.js';

const SEED_DATA = [
  {
    name: 'ICT London Session',
    description: 'Setup ICT untuk sesi London — fokus pada Order Block, FVG, dan displacement pada timeframe H1-H4.',
    sessionType: 'LONDON',
    sortOrder: 0,
    checklists: [
      {
        title: 'Trend Structure',
        description: 'Konfirmasi struktur tren sebelum entry',
        sortOrder: 0,
        items: [
          'HH/HL structure confirmed on H1+',
          'Market structure bullish (higher highs & higher lows)',
          'Tidak ada break of structure di timeframe yang lebih tinggi',
          '50 EMA di atas 200 EMA pada H4',
        ],
      },
      {
        title: 'Order Block',
        description: 'Identifikasi zona order block yang valid',
        sortOrder: 1,
        items: [
          'Bearish order block teridentifikasi di area supply',
          'Order block belum di-break (unmitigated)',
          'Zona OB align dengan FVG',
          'Volume candle breaker signifikan',
        ],
      },
      {
        title: 'Fair Value Gap',
        description: 'Konfirmasi Fair Value Gap untuk entry',
        sortOrder: 2,
        items: [
          'FVG teridentifikasi antara candle 1 dan 3',
          'Harga retrace ke area FVG (minimum 50%)',
          'FVG tidak diisi sepenuhnya (displacement masih valid)',
          'Confluence dengan Order Block atau liquidity pool',
        ],
      },
      {
        title: 'Entry Rules',
        description: 'Aturan entry yang harus dipenuhi',
        sortOrder: 3,
        items: [
          'Tunggu konfirmasi candle di zona entry',
          'Risk-to-reward ratio minimal 1:2',
          'Stop loss di bawah/atas OB dengan buffer 5-10 pips',
          'Position size sesuai risk management (max 2% per trade)',
          'Tidak entry saat news high-impact dalam 30 menit',
        ],
      },
    ],
  },
  {
    name: 'ICT New York Session',
    description: 'Setup ICT untuk sesi New York — fokus pada liquidity sweep dan displacement.',
    sessionType: 'NEW_YORK',
    sortOrder: 1,
    checklists: [
      {
        title: 'Session High/Low',
        description: 'Analisis high/low sesi sebelumnya',
        sortOrder: 0,
        items: [
          'Asian range high/low teridentifikasi',
          'London session high/low marked',
          'Equal highs/lows teridentifikasi sebagai liquidity target',
          'Breaker block teridentifikasi jika level di-break',
        ],
      },
      {
        title: 'Liquidity Sweep',
        description: 'Konfirmasi sweep liquidity sebelum entry',
        sortOrder: 1,
        items: [
          'Sweep of session low/high terkonfirmasi',
          'Displacement candle setelah sweep (full body, minimal wick)',
          'Volume di atas rata-rata saat displacement',
          'Market structure shift (MSS) terkonfirmasi',
        ],
      },
      {
        title: 'Displacement',
        description: 'Konfirmasi displacement sebagai trigger entry',
        sortOrder: 2,
        items: [
          'Candle displacement > 1.5x ATR(14)',
          'Close candle di luar range sebelumnya',
          'Tidak ada wick shadow yang signifikan',
          'Entry setelah pullback ke FVG/displacement area',
        ],
      },
    ],
  },
  {
    name: 'Breakout & Retest',
    description: 'Setup breakout dan retest untuk level support/resistance kunci.',
    sessionType: 'CUSTOM',
    sortOrder: 2,
    checklists: [
      {
        title: 'Consolidation Zone',
        description: 'Identifikasi zona konsolidasi',
        sortOrder: 0,
        items: [
          'Zona konsolidasi teridentifikasi (min 3 candle sideways)',
          'Volume menurun selama konsolidasi',
          'Support dan resistance level jelas',
          'Multiple timeframe menunjukkan area yang sama',
        ],
      },
      {
        title: 'Breakout Confirmation',
        description: 'Konfirmasi breakout yang valid',
        sortOrder: 1,
        items: [
          'Candle close di luar zona konsolidasi',
          'Volume breakout > 1.5x rata-rata',
          'Tidak ada immediate false breakout (wick rejection)',
          'Harga berada di atas/below 20 EMA',
        ],
      },
      {
        title: 'Retest Rules',
        description: 'Aturan retest untuk entry',
        sortOrder: 2,
        items: [
          'Tunggu retest ke level breakout',
          'Candle konfirmasi di level retest (pin bar / engulfing)',
          'Stop loss di bawah/atas breakout level dengan buffer',
          'Target profit = tinggi zona konsolidasi × 2',
          'Max wait 3 candle setelah breakout untuk retest',
        ],
      },
    ],
  },
];

async function seed() {
  console.log('🌱 Seeding playbooks...');

  // Ensure a trader exists
  let trader = await db.trader.findFirst();
  if (!trader) {
    trader = await db.trader.create({
      data: { email: 'trader@alpha.dev', name: 'Default Trader' },
    });
    console.log('  ✅ Created default trader');
  }

  for (const pb of SEED_DATA) {
    const playbook = await db.playbook.create({
      data: {
        traderId: trader.id,
        name: pb.name,
        description: pb.description,
        sessionType: pb.sessionType,
        sortOrder: pb.sortOrder,
        checklists: {
          create: pb.checklists.map((cl) => ({
            title: cl.title,
            description: cl.description,
            sortOrder: cl.sortOrder,
            items: {
              create: cl.items.map((text, idx) => ({
                text,
                sortOrder: idx,
              })),
            },
          })),
        },
      },
    });
    console.log(`  ✅ Created: ${playbook.name}`);
  }

  console.log('🎉 Playbook seeding complete!');
}

seed()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
