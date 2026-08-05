-- ========================================
-- PROJECT ALPHA — Supabase Seed Data
-- AI Trading Coach | Demo Data
-- ========================================
-- BUKA: Supabase Dashboard → SQL Editor → Paste → Run
-- JALANKAN SETELAH supabase-schema.sql
-- ========================================

-- ========================================
-- 1. TRADER
-- ========================================

INSERT INTO "Trader" ("id", "email", "name", "avatar", "timezone", "createdAt", "updatedAt")
VALUES (
    'trader-luthfi-001',
    'luthfi@alpha.dev',
    'Luthfi',
    NULL,
    'Asia/Makassar',
    NOW(),
    NOW()
) ON CONFLICT DO NOTHING;

-- ========================================
-- 2. TRADE ENTRIES (12 trades)
-- ========================================

INSERT INTO "TradeEntry" ("id", "traderId", "pair", "direction", "timeframe", "strategy", "entryPrice", "exitPrice", "stopLoss", "takeProfit", "lotSize", "pipResult", "profitLoss", "currency", "status", "entryTime", "exitTime", "processScore", "planNotes", "reflectionNotes", "emotionBefore", "emotionAfter", "lessonLearned", "hasReflected", "tags", "playbookId", "behavioralTags", "playbookCompliance", "createdAt", "updatedAt")
VALUES
-- Trade 1: Loss - revenge trading
('trade-001', 'trader-luthfi-001', 'EURUSD', 'SHORT', 'H1', 'ICT London', 1.0892, 1.0915, 1.0912, 1.0840, 0.01, -23.0, -23.0, 'USD', 'CLOSED',
 '2025-06-10 08:30:00+00', '2025-06-10 09:45:00+00', 35,
 'Entry sell di area supply setelah bearish OB', 'Tidak sabar menunggu konfirmasi displacement, masuk terlalu awal. Stop loss dipindahkan 2x.', 'Anxious', 'Frustrated',
 'Jangan masuk tanpa konfirmasi displacement candle', true,
 '["revenge", "impulsive"]', NULL, '["revenge_trading"]', 0.3,
 '2025-06-10 08:30:00+00', '2025-06-10 09:45:00+00'),

-- Trade 2: Win - good execution
('trade-002', 'trader-luthfi-001', 'GBPJPY', 'LONG', 'H4', 'ICT London', 191.50, 193.20, 191.00, 193.50, 0.02, 170.0, 340.0, 'USD', 'CLOSED',
 '2025-06-11 13:00:00+00', '2025-06-12 06:00:00+00', 82,
 'Buy di bullish OB H4 setelah MSS + FVG', 'Trade sesuai rencana. Tunggu displacement lalu entry di FVG. Biarkan trade berjalan ke TP.', 'Calm', 'Confident',
 'Proses yang baik menghasilkan hasil yang baik', true,
 '["planned", "patient"]', NULL, NULL, 0.95,
 '2025-06-11 13:00:00+00', '2025-06-12 06:00:00+00'),

-- Trade 3: Small win - early close
('trade-003', 'trader-luthfi-001', 'USDJPY', 'SHORT', 'M15', 'Breakout', 157.80, 157.45, 158.10, 157.10, 0.01, 35.0, 35.0, 'USD', 'CLOSED',
 '2025-06-12 18:00:00+00', '2025-06-12 18:35:00+00', 55,
 'Sell setelah breakout support 157.80', 'Tutup posisi terlalu cepat! Harga masih turun ke 157.10 tapi sudah keluar di 157.45. Takut profit hilang.', 'Confident', 'Regret',
 'Jangan tutup posisi sebelum mencapai target. Gunakan trailing stop.', true,
 '["early_close", "planned"]', NULL, '["early_close"]', 0.6,
 '2025-06-12 18:00:00+00', '2025-06-12 18:35:00+00'),

-- Trade 4: Big loss - moved stop loss
('trade-004', 'trader-luthfi-001', 'EURUSD', 'LONG', 'H1', 'ICT London', 1.0845, 1.0820, 1.0825, 1.0895, 0.03, -25.0, -75.0, 'USD', 'CLOSED',
 '2025-06-13 08:15:00+00', '2025-06-13 11:30:00+00', 20,
 'Buy di FVG bullish H1', 'KESALAHAN BESAR: Stop loss dipindahkan dari 1.0825 ke 1.0810, lalu ke 1.0790. Lot size 3x dari biasanya karena overconfidence setelah win kemarin.', 'Overconfident', 'Angry',
 'JANGAN PERNAH pindahkan stop loss ke arah yang merugikan. Size tetap konsisten.', true,
 '["moving_sl", "overconfidence"]', NULL, '["moving_stop_loss", "overconfidence"]', 0.15,
 '2025-06-13 08:15:00+00', '2025-06-13 11:30:00+00'),

-- Trade 5: Win - textbook ICT
('trade-005', 'trader-luthfi-001', 'GBPUSD', 'LONG', 'H4', 'ICT New York', 1.2720, 1.2790, 1.2690, 1.2800, 0.02, 70.0, 140.0, 'USD', 'CLOSED',
 '2025-06-16 19:00:00+00', '2025-06-17 02:00:00+00', 90,
 'Buy di bullish OB setelah liquidity sweep Asian low', 'Trade sempurna! Semua checklist tercentang. Tunggu sweep, displacement, entry di FVG. TP hampir tercapai.', 'Patient', 'Satisfied',
 'Ikuti proses, hasil akan mengikuti', true,
 '["planned", "textbook"]', NULL, NULL, 1.0,
 '2025-06-16 19:00:00+00', '2025-06-17 02:00:00+00'),

-- Trade 6: Loss - FOMO
('trade-006', 'trader-luthfi-001', 'XAUUSD', 'SHORT', 'M5', 'None', 2345.50, 2355.20, 2350.00, 2330.00, 0.01, -97.0, -97.0, 'USD', 'CLOSED',
 '2025-06-17 12:30:00+00', '2025-06-17 12:55:00+00', 10,
 'Tidak ada plan — masuk karena lihat harga turun cepat', 'FOMO murni. Tidak ada setup, tidak ada checklist, tidak ada plan. Hanya karena harga bergerak tajam saat news NFP.', 'FOMO', 'Panicked',
 'JANGAN trade saat news. Tunggu setup, bukan gerakan harga.', true,
 '["fomo", "no_plan", "news_trade"]', NULL, '["fomo"]', 0.05,
 '2025-06-17 12:30:00+00', '2025-06-17 12:55:00+00'),

-- Trade 7: Win - patience pays off
('trade-007', 'trader-luthfi-001', 'EURUSD', 'SHORT', 'H1', 'ICT London', 1.0878, 1.0835, 1.0898, 1.0830, 0.02, 43.0, 86.0, 'USD', 'CLOSED',
 '2025-06-18 08:00:00+00', '2025-06-18 10:30:00+00', 85,
 'Sell setelah bearish displacement di area POI', 'Menunggu 4 jam untuk konfirmasi setup. Sabar, dan hasilnya bagus. Checklist semua tercentang.', 'Patient', 'Confident',
 'Kesabaran adalah kunci', true,
 '["planned", "patient"]', NULL, NULL, 0.9,
 '2025-06-18 08:00:00+00', '2025-06-18 10:30:00+00'),

-- Trade 8: Win - small
('trade-008', 'trader-luthfi-001', 'AUDUSD', 'LONG', 'H4', 'Breakout', 0.6645, 0.6680, 0.6620, 0.6700, 0.01, 35.0, 35.0, 'USD', 'CLOSED',
 '2025-06-19 22:00:00+00', '2025-06-20 06:00:00+00', 70,
 'Buy setelah breakout retest 0.6645', 'Setup bagus, tapi tutup sedikit sebelum TP. Masih profit. Fokus pada proses yang sudah benar.', 'Calm', 'Content',
 'Proses > Hasil', true,
 '["planned"]', NULL, NULL, 0.85,
 '2025-06-19 22:00:00+00', '2025-06-20 06:00:00+00'),

-- Trade 9: Loss - fear after drawdown
('trade-009', 'trader-luthfi-001', 'GBPJPY', 'SHORT', 'H1', 'ICT London', 193.80, 194.25, 194.00, 193.00, 0.005, -45.0, -22.5, 'USD', 'CLOSED',
 '2025-06-20 08:45:00+00', '2025-06-20 09:10:00+00', 30,
 'Short di bearish OB tapi stop loss terlalu ketat', 'Fear setelah kemarin drawdown. Position size dikurangi drastis (0.005 vs biasa 0.02). Stop loss terlalu ketat, kena noise.', 'Fearful', 'Relieved',
 'Jangan ubah size secara drastis karena emosi. Tetap pada plan.', true,
 '["fear", "small_size"]', NULL, '["fear"]', 0.4,
 '2025-06-20 08:45:00+00', '2025-06-20 09:10:00+00'),

-- Trade 10: Win - best trade
('trade-010', 'trader-luthfi-001', 'XAUUSD', 'LONG', 'H4', 'ICT New York', 2320.00, 2350.00, 2310.00, 2355.00, 0.01, 300.0, 300.0, 'USD', 'CLOSED',
 '2025-06-23 19:00:00+00', '2025-06-24 10:00:00+00', 95,
 'Buy di bullish OB H4 setelah sweep Asian low', 'Trade terbaik minggu ini! Semua checklist tercentang, sabar menunggu, risk management ketat. Biarkan trade berjalan.', 'Patient', 'Excited',
 'Proses yang konsisten menghasilkan trade yang luar biasa', true,
 '["planned", "textbook", "patient"]', NULL, NULL, 1.0,
 '2025-06-23 19:00:00+00', '2025-06-24 10:00:00+00'),

-- Trade 11: Open trade
('trade-011', 'trader-luthfi-001', 'EURUSD', 'LONG', 'H1', 'ICT London', 1.0850, NULL, 1.0830, 1.0900, 0.02, NULL, NULL, 'USD', 'OPEN',
 '2025-07-03 08:00:00+00', NULL, 75,
 'Buy di FVG bullish setelah HH structure', NULL, 'Calm', NULL, NULL, false,
 '["planned"]', NULL, NULL, 0.8,
 '2025-07-03 08:00:00+00', '2025-07-03 08:00:00+00'),

-- Trade 12: Open trade
('trade-012', 'trader-luthfi-001', 'GBPJPY', 'SHORT', 'H4', 'Breakout', 194.50, NULL, 195.00, 193.50, 0.01, NULL, NULL, 'USD', 'OPEN',
 '2025-07-03 14:00:00+00', NULL, 60,
 'Short setelah breakdown support 194.50', NULL, 'Neutral', NULL, NULL, false,
 '["planned", "breakout"]', NULL, NULL, 0.7,
 '2025-07-03 14:00:00+00', '2025-07-03 14:00:00+00');

-- ========================================
-- 3. PLAYBOOKS (3 playbook dengan checklists)
-- ========================================

INSERT INTO "Playbook" ("id", "traderId", "name", "description", "sessionType", "isActive", "sortOrder", "createdAt", "updatedAt")
VALUES
('pb-001', 'trader-luthfi-001', 'ICT London Session', 'Setup ICT untuk sesi London — fokus pada Order Block, FVG, dan displacement pada timeframe H1-H4.', 'LONDON', true, 0, NOW(), NOW()),
('pb-002', 'trader-luthfi-001', 'ICT New York Session', 'Setup ICT untuk sesi New York — fokus pada liquidity sweep dan displacement.', 'NEW_YORK', true, 1, NOW(), NOW()),
('pb-003', 'trader-luthfi-001', 'Breakout & Retest', 'Setup breakout dan retest untuk level support/resistance kunci.', 'CUSTOM', true, 2, NOW(), NOW());

-- Link trades to playbooks
UPDATE "TradeEntry" SET "playbookId" = 'pb-001' WHERE "id" IN ('trade-001', 'trade-002', 'trade-004', 'trade-007', 'trade-009', 'trade-011');
UPDATE "TradeEntry" SET "playbookId" = 'pb-002' WHERE "id" IN ('trade-005', 'trade-010');
UPDATE "TradeEntry" SET "playbookId" = 'pb-003' WHERE "id" IN ('trade-003', 'trade-008', 'trade-012');

-- ========================================
-- 4. PLAYBOOK CHECKLISTS
-- ========================================

INSERT INTO "PlaybookChecklist" ("id", "playbookId", "title", "description", "sortOrder", "createdAt")
VALUES
-- ICT London
('cl-001-1', 'pb-001', 'Trend Structure', 'Konfirmasi struktur tren sebelum entry', 0, NOW()),
('cl-001-2', 'pb-001', 'Order Block', 'Identifikasi zona order block yang valid', 1, NOW()),
('cl-001-3', 'pb-001', 'Fair Value Gap', 'Konfirmasi Fair Value Gap untuk entry', 2, NOW()),
('cl-001-4', 'pb-001', 'Entry Rules', 'Aturan entry yang harus dipenuhi', 3, NOW()),
-- ICT New York
('cl-002-1', 'pb-002', 'Session High/Low', 'Analisis high/low sesi sebelumnya', 0, NOW()),
('cl-002-2', 'pb-002', 'Liquidity Sweep', 'Konfirmasi sweep liquidity sebelum entry', 1, NOW()),
('cl-002-3', 'pb-002', 'Displacement', 'Konfirmasi displacement sebagai trigger entry', 2, NOW()),
-- Breakout
('cl-003-1', 'pb-003', 'Consolidation Zone', 'Identifikasi zona konsolidasi', 0, NOW()),
('cl-003-2', 'pb-003', 'Breakout Confirmation', 'Konfirmasi breakout yang valid', 1, NOW()),
('cl-003-3', 'pb-003', 'Retest Rules', 'Aturan retest untuk entry', 2, NOW());

-- ========================================
-- 5. CHECKLIST ITEMS
-- ========================================

INSERT INTO "PlaybookChecklistItem" ("id", "checklistId", "text", "sortOrder", "createdAt")
VALUES
-- ICT London - Trend Structure
('ci-001-1-1', 'cl-001-1', 'HH/HL structure confirmed on H1+', 0, NOW()),
('ci-001-1-2', 'cl-001-1', 'Market structure bullish (higher highs & higher lows)', 1, NOW()),
('ci-001-1-3', 'cl-001-1', 'Tidak ada break of structure di timeframe yang lebih tinggi', 2, NOW()),
('ci-001-1-4', 'cl-001-1', '50 EMA di atas 200 EMA pada H4', 3, NOW()),
-- ICT London - Order Block
('ci-001-2-1', 'cl-001-2', 'Bearish order block teridentifikasi di area supply', 0, NOW()),
('ci-001-2-2', 'cl-001-2', 'Order block belum di-break (unmitigated)', 1, NOW()),
('ci-001-2-3', 'cl-001-2', 'Zona OB align dengan FVG', 2, NOW()),
('ci-001-2-4', 'cl-001-2', 'Volume candle breaker signifikan', 3, NOW()),
-- ICT London - FVG
('ci-001-3-1', 'cl-001-3', 'FVG teridentifikasi antara candle 1 dan 3', 0, NOW()),
('ci-001-3-2', 'cl-001-3', 'Harga retrace ke area FVG (minimum 50%)', 1, NOW()),
('ci-001-3-3', 'cl-001-3', 'FVG tidak diisi sepenuhnya (displacement masih valid)', 2, NOW()),
('ci-001-3-4', 'cl-001-3', 'Confluence dengan Order Block atau liquidity pool', 3, NOW()),
-- ICT London - Entry Rules
('ci-001-4-1', 'cl-001-4', 'Tunggu konfirmasi candle di zona entry', 0, NOW()),
('ci-001-4-2', 'cl-001-4', 'Risk-to-reward ratio minimal 1:2', 1, NOW()),
('ci-001-4-3', 'cl-001-4', 'Stop loss di bawah/atas OB dengan buffer 5-10 pips', 2, NOW()),
('ci-001-4-4', 'cl-001-4', 'Position size sesuai risk management (max 2% per trade)', 3, NOW()),
('ci-001-4-5', 'cl-001-4', 'Tidak entry saat news high-impact dalam 30 menit', 4, NOW()),
-- ICT New York - Session High/Low
('ci-002-1-1', 'cl-002-1', 'Asian range high/low teridentifikasi', 0, NOW()),
('ci-002-1-2', 'cl-002-1', 'London session high/low marked', 1, NOW()),
('ci-002-1-3', 'cl-002-1', 'Equal highs/lows teridentifikasi sebagai liquidity target', 2, NOW()),
('ci-002-1-4', 'cl-002-1', 'Breaker block teridentifikasi jika level di-break', 3, NOW()),
-- ICT New York - Liquidity Sweep
('ci-002-2-1', 'cl-002-2', 'Sweep of session low/high terkonfirmasi', 0, NOW()),
('ci-002-2-2', 'cl-002-2', 'Displacement candle setelah sweep (full body, minimal wick)', 1, NOW()),
('ci-002-2-3', 'cl-002-2', 'Volume di atas rata-rata saat displacement', 2, NOW()),
('ci-002-2-4', 'cl-002-2', 'Market structure shift (MSS) terkonfirmasi', 3, NOW()),
-- ICT New York - Displacement
('ci-002-3-1', 'cl-002-3', 'Candle displacement > 1.5x ATR(14)', 0, NOW()),
('ci-002-3-2', 'cl-002-3', 'Close candle di luar range sebelumnya', 1, NOW()),
('ci-002-3-3', 'cl-002-3', 'Tidak ada wick shadow yang signifikan', 2, NOW()),
('ci-002-3-4', 'cl-002-3', 'Entry setelah pullback ke FVG/displacement area', 3, NOW()),
-- Breakout - Consolidation
('ci-003-1-1', 'cl-003-1', 'Zona konsolidasi teridentifikasi (min 3 candle sideways)', 0, NOW()),
('ci-003-1-2', 'cl-003-1', 'Volume menurun selama konsolidasi', 1, NOW()),
('ci-003-1-3', 'cl-003-1', 'Support dan resistance level jelas', 2, NOW()),
('ci-003-1-4', 'cl-003-1', 'Multiple timeframe menunjukkan area yang sama', 3, NOW()),
-- Breakout - Confirmation
('ci-003-2-1', 'cl-003-2', 'Candle close di luar zona konsolidasi', 0, NOW()),
('ci-003-2-2', 'cl-003-2', 'Volume breakout > 1.5x rata-rata', 1, NOW()),
('ci-003-2-3', 'cl-003-2', 'Tidak ada immediate false breakout (wick rejection)', 2, NOW()),
('ci-003-2-4', 'cl-003-2', 'Harga berada di atas/below 20 EMA', 3, NOW()),
-- Breakout - Retest
('ci-003-3-1', 'cl-003-3', 'Tunggu retest ke level breakout', 0, NOW()),
('ci-003-3-2', 'cl-003-3', 'Candle konfirmasi di level retest (pin bar / engulfing)', 1, NOW()),
('ci-003-3-3', 'cl-003-3', 'Stop loss di bawah/atas breakout level dengan buffer', 2, NOW()),
('ci-003-3-4', 'cl-003-3', 'Target profit = tinggi zona konsolidasi × 2', 3, NOW()),
('ci-003-3-5', 'cl-003-3', 'Max wait 3 candle setelah breakout untuk retest', 4, NOW());

-- ========================================
-- 6. WEEKLY REVIEW RECORDS (8 weeks)
-- ========================================

INSERT INTO "WeeklyReviewRecord" ("id", "traderId", "weekStart", "weekEnd", "summary", "processScore", "ruleCompliance", "totalTrades", "winRate", "totalPnL", "biggestMistake", "recommendation", "topBehavioralIssue", "playbookUsage", "emotionBreakdown", "createdAt")
VALUES
('wr-1', 'trader-luthfi-001', '2025-06-09', '2025-06-15', 'Minggu pertama cukup baik. Proses trading mulai terbentuk meskipun masih ada beberapa deviasi dari rencana. Perlu fokus pada disiplin stop loss.', 52, 60, 8, 37.5, -120.5,
 'Memindahkan stop loss lebih jauh karena tidak mau loss — ini menyebabkan kerugian 2x lebih besar dari rencana awal.',
 'Fokus pada disiplin stop loss minggu depan. Tetapkan SL sebelum entry dan JANGAN pernah pindahkan ke arah yang merugikan.',
 'MOVING_STOP_LOSS', 40, '{"calm":35,"anxious":40,"confident":15,"fearful":10}', '2025-06-15 23:59:59+00'),

('wr-2', 'trader-luthfi-001', '2025-06-16', '2025-06-22', 'Perbaikan signifikan dalam penggunaan playbook. Masih ada 2 kali revenge trading setelah loss beruntun. Emosi mulai lebih terkontrol.', 58, 65, 10, 45.0, -45.2,
 'Revenge trading setelah 3 loss beruntun di hari Selasa — masuk tanpa checklist dan tanpa konfirmasi setup.',
 'Buat aturan: setelah 2 loss berturut-turut, WAJIB istirahat minimal 1 jam sebelum trade lagi. Gunakan checklist sebelum setiap entry.',
 'REVENGE_TRADING', 55, '{"calm":40,"anxious":30,"confident":20,"fearful":10}', '2025-06-22 23:59:59+00'),

('wr-3', 'trader-luthfi-001', '2025-06-23', '2025-06-29', 'Minggu terbaik sejauh ini! Proses score naik signifikan. Berhasil mengikuti playbook di 80% trade. Emosi lebih stabil.', 67, 78, 7, 57.1, 85.3,
 'Tutup posisi terlalu cepat di trade GBPJPY yang sebenarnya berjalan sesuai rencana — fear of losing profit.',
 'Pertahankan kedisiplinan! Gunakan trailing stop alih-alih menutup manual. Biarkan trade berjalan sesuai rencana.',
 'EARLY_CLOSE', 75, '{"calm":50,"anxious":20,"confident":22,"fearful":8}', '2025-06-29 23:59:59+00'),

('wr-4', 'trader-luthfi-001', '2025-06-30', '2025-07-06', 'Sedikit penurunan performa karena overconfidence setelah minggu lalu. Trade size terlalu besar di beberapa posisi.', 61, 68, 12, 41.7, -32.8,
 'Meningkatkan lot size 2x dari biasanya karena merasa "dalam performa bagus" — melanggar aturan risk management.',
 'Ingat: overconfidence adalah jebakan. Tetap pada risk per trade 1-2% dari equity. Size tetap konsisten.',
 'OVERCONFIDENCE', 65, '{"calm":45,"anxious":15,"confident":32,"fearful":8}', '2025-07-06 23:59:59+00'),

('wr-5', 'trader-luthfi-001', '2025-07-07', '2025-07-13', 'Kembali ke disiplin yang baik. FOMO berkurang drastis. Proses konsisten meskipun win rate sedikit turun.', 72, 82, 9, 44.4, 55.6,
 'Entry FOMO di NFP release tanpa rencana — masuk karena melihat harga bergerak cepat.',
 'Buat kalender ekonomi dan TIDAK trade 30 menit sebelum/sesudah major news. Proses > Hasil.',
 'FOMO', 82, '{"calm":55,"anxious":18,"confident":20,"fearful":7}', '2025-07-13 23:59:59+00'),

('wr-6', 'trader-luthfi-001', '2025-07-14', '2025-07-20', 'Minggu yang sangat konsisten. Checklist digunakan di setiap trade. Risk management terjaga. Pertahankan!', 78, 88, 8, 62.5, 142.1,
 'Tidak ada kesalahan besar minggu ini. Hanya perlu memperbaiki catatan reflection yang masih kurang detail.',
 'Level saat ini sudah sangat baik. Fokus pada detail reflection dan analisis post-trade untuk naik ke level berikutnya.',
 'EARLY_CLOSE', 90, '{"calm":62,"anxious":12,"confident":20,"fearful":6}', '2025-07-20 23:59:59+00'),

('wr-7', 'trader-luthfi-001', '2025-07-21', '2025-07-27', 'Minggu challenging dengan volatilitas tinggi. Beberapa trade terpengaruh fear saat drawdown. Perlu memperkuat mental.', 69, 75, 11, 45.5, -18.9,
 'Fear melanda saat drawdown 3 trade berturut-turut — mulai ragu pada setup dan mengurangi position size terlalu drastis.',
 'Drawdown adalah bagian normal dari trading. Buat drawdown plan: maksimal 5% per minggu, lalu evaluasi ulang.',
 'FEAR', 78, '{"calm":40,"anxious":28,"confident":18,"fearful":14}', '2025-07-27 23:59:59+00'),

('wr-8', 'trader-luthfi-001', '2025-07-28', '2025-08-03', 'Pemulihan mental yang baik! Kembali mengikuti proses. Process score mendekati 80. Emosi lebih terkendali.', 76, 85, 7, 57.1, 98.4,
 'Sedikit kurang sabar menunggu konfirmasi setup sempurna di 2 trade — masuk sedikit terlalu awal.',
 'Perkuat kesabaran dengan menunggu semua checklist tercentang. Kualitas setup > kuantitas trade.',
 'FOMO', 88, '{"calm":58,"anxious":15,"confident":22,"fearful":5}', '2025-08-03 23:59:59+00');

-- ========================================
-- 7. BEHAVIORAL EVENTS (15 events)
-- ========================================

INSERT INTO "BehavioralEvent" ("id", "traderId", "tradeId", "behaviorType", "severity", "confidence", "evidence", "aiAnalysis", "resolved", "resolvedAt", "createdAt")
VALUES
('be-01', 'trader-luthfi-001', 'trade-001', 'REVENGE_TRADING', 'HIGH', 0.87,
 '{"pattern":"Quick re-entry after loss","previousPnL":-45.5,"lotSizeIncrease":"5x"}',
 'Terdeteksi pola revenge trading: setelah loss -45.50, trader kembali entry dengan lot size 5x lebih besar dalam 2 jam.', true, '2025-06-13 08:30:00+00', '2025-06-10 09:00:00+00'),

('be-02', 'trader-luthfi-001', NULL, 'REVENGE_TRADING', 'CRITICAL', 0.95,
 '{"pattern":"3 trades in 10 minutes after loss","riskIncrease":"1% to 3%"}',
 'Pola revenge trading terdeteksi: 3 trade dibuka dalam 10 menit setelah loss. Tidak ada jeda refleksi antar trade.', true, '2025-06-17 10:00:00+00', '2025-06-14 08:00:00+00'),

('be-03', 'trader-luthfi-001', 'trade-004', 'MOVING_STOP_LOSS', 'HIGH', 0.88,
 '{"pattern":"SL moved 3 times","originalSL":1.0825,"finalSL":1.0790,"lossMultiplier":"2.5x"}',
 'Stop loss dipindahkan lebih jauh 3 kali dalam 1 trade. Kerugian akhir 2.5x dari rencana.', true, '2025-06-15 12:00:00+00', '2025-06-13 12:00:00+00'),

('be-04', 'trader-luthfi-001', NULL, 'MOVING_STOP_LOSS', 'MEDIUM', 0.80,
 '{"pattern":"SL moved on 2/4 losing trades"}',
 'Pola moving stop loss terdeteksi pada 2 dari 4 trade yang loss minggu ini.', false, NULL, '2025-07-20 15:00:00+00'),

('be-05', 'trader-luthfi-001', 'trade-006', 'FOMO', 'MEDIUM', 0.72,
 '{"pattern":"Entry during high volatility","noStrategy":true,"noPlanNotes":true}',
 'Terdeteksi kemungkinan FOMO: trade dilakukan tanpa strategy dan plan notes. Entry saat volatilitas tinggi.', true, '2025-06-19 13:00:00+00', '2025-06-17 13:00:00+00'),

('be-06', 'trader-luthfi-001', NULL, 'FOMO', 'HIGH', 0.87,
 '{"pattern":"Entry during NFP release","noConfirmation":true}',
 'FOMO terdeteksi: Entry tanpa konfirmasi setup saat harga bergerak tajam setelah news NFP.', false, NULL, '2025-07-15 12:30:00+00'),

('be-07', 'trader-luthfi-001', NULL, 'FOMO', 'MEDIUM', 0.76,
 '{"pattern":"Entry in middle of large move"}',
 'Entry di tengah-tengah pergerakan besar tanpa menunggu pullback.', false, NULL, '2025-07-30 08:00:00+00'),

('be-08', 'trader-luthfi-001', NULL, 'OVERCONFIDENCE', 'MEDIUM', 0.78,
 '{"pattern":"Increased position after 3 consecutive wins","normalLot":0.02,"increasedLot":0.08}',
 'Setelah minggu dengan win rate tinggi, trader mulai melewatkan beberapa langkah checklist.', true, '2025-06-30 10:00:00+00', '2025-06-27 10:00:00+00'),

('be-09', 'trader-luthfi-001', NULL, 'OVERCONFIDENCE', 'LOW', 0.60,
 '{"pattern":"Skipping checklist steps after good week"}',
 'Overconfidence ringan: setelah 3 win berturut-turut, beberapa langkah checklist dilewati.', true, '2025-07-26 09:00:00+00', '2025-07-23 09:00:00+00'),

('be-10', 'trader-luthfi-001', 'trade-003', 'EARLY_CLOSE', 'MEDIUM', 0.82,
 '{"pattern":"Closed at 30% of target","potentialProfit":120,"actualProfit":36}',
 'Posisi ditutup terlalu cepat: hanya mengambil 30% dari potensi profit.', false, NULL, '2025-06-18 18:35:00+00'),

('be-11', 'trader-luthfi-001', NULL, 'EARLY_CLOSE', 'LOW', 0.65,
 '{"pattern":"Closed 4/7 winning trades early"}',
 'Terdeteksi pola early close pada 4 dari 7 winning trade minggu ini.', false, NULL, '2025-07-26 15:00:00+00'),

('be-12', 'trader-luthfi-001', NULL, 'EARLY_CLOSE', 'MEDIUM', 0.79,
 '{"pattern":"Fear of losing profit","avgProfitTaken":40,"avgPotential":110}',
 'Fear of losing profit menyebabkan trader menutup posisi saat floating profit.', false, NULL, '2025-08-01 11:00:00+00'),

('be-13', 'trader-luthfi-001', 'trade-009', 'FEAR', 'HIGH', 0.85,
 '{"pattern":"Tight stop loss after losses","avgSL":5,"normalSL":15}',
 'Stop loss diperketat secara berlebihan (5 pips dari entry), menyebabkan trade terhenti oleh noise.', false, NULL, '2025-06-22 09:10:00+00'),

('be-14', 'trader-luthfi-001', NULL, 'FEAR', 'MEDIUM', 0.72,
 '{"pattern":"Drastic position size reduction","normalLot":0.02,"reducedLot":0.005}',
 'Fear terdeteksi: position size dikurangi drastis setelah 3 loss berturut-turut.', false, NULL, '2025-07-25 09:00:00+00');

-- ========================================
-- 8. GROWTH SNAPSHOTS (30 daily snapshots)
-- ========================================

INSERT INTO "GrowthSnapshot" ("id", "traderId", "period", "periodDate", "emotionScore", "consistencyScore", "processScore", "behaviorScore", "disciplineScore", "riskMgmtScore", "totalTrades", "winRate", "behavioralEvents", "notes", "createdAt")
VALUES
('gs-01', 'trader-luthfi-001', 'DAILY', '2025-06-05', 38.2, 40.1, 42.5, 35.0, 39.8, 41.2, 2, 30.0, 1, NULL, '2025-06-05 23:59:59+00'),
('gs-02', 'trader-luthfi-001', 'DAILY', '2025-06-06', 42.1, 43.5, 45.3, 38.7, 42.0, 44.5, 3, 33.3, 1, NULL, '2025-06-06 23:59:59+00'),
('gs-03', 'trader-luthfi-001', 'DAILY', '2025-06-07', 35.8, 41.2, 44.0, 40.2, 38.5, 43.0, 1, 0.0, 2, NULL, '2025-06-07 23:59:59+00'),
('gs-04', 'trader-luthfi-001', 'DAILY', '2025-06-08', 44.3, 45.8, 47.2, 42.1, 44.2, 46.1, 2, 50.0, 0, NULL, '2025-06-08 23:59:59+00'),
('gs-05', 'trader-luthfi-001', 'DAILY', '2025-06-09', 41.5, 46.3, 48.7, 43.5, 45.0, 44.8, 3, 33.3, 1, NULL, '2025-06-09 23:59:59+00'),
('gs-06', 'trader-luthfi-001', 'DAILY', '2025-06-10', 39.8, 44.0, 46.5, 41.0, 42.5, 43.2, 2, 50.0, 2, NULL, '2025-06-10 23:59:59+00'),
('gs-07', 'trader-luthfi-001', 'DAILY', '2025-06-11', 47.2, 48.5, 52.3, 45.8, 48.2, 47.5, 2, 50.0, 0, 'Catatan mingguan otomatis oleh sistem.', '2025-06-11 23:59:59+00'),
('gs-08', 'trader-luthfi-001', 'DAILY', '2025-06-12', 45.5, 47.2, 51.0, 44.3, 46.8, 45.5, 3, 33.3, 1, NULL, '2025-06-12 23:59:59+00'),
('gs-09', 'trader-luthfi-001', 'DAILY', '2025-06-13', 38.0, 42.5, 43.8, 38.5, 40.2, 41.0, 2, 0.0, 3, NULL, '2025-06-13 23:59:59+00'),
('gs-10', 'trader-luthfi-001', 'DAILY', '2025-06-14', 50.2, 52.8, 55.5, 49.0, 51.5, 50.2, 2, 50.0, 0, NULL, '2025-06-14 23:59:59+00'),
('gs-11', 'trader-luthfi-001', 'DAILY', '2025-06-15', 48.7, 51.2, 54.0, 47.5, 50.0, 49.8, 3, 33.3, 1, NULL, '2025-06-15 23:59:59+00'),
('gs-12', 'trader-luthfi-001', 'DAILY', '2025-06-16', 52.3, 54.5, 57.2, 50.8, 53.0, 51.5, 2, 50.0, 0, 'Catatan mingguan otomatis oleh sistem.', '2025-06-16 23:59:59+00'),
('gs-13', 'trader-luthfi-001', 'DAILY', '2025-06-17', 44.0, 48.2, 52.5, 46.5, 48.8, 47.2, 3, 33.3, 2, NULL, '2025-06-17 23:59:59+00'),
('gs-14', 'trader-luthfi-001', 'DAILY', '2025-06-18', 55.8, 57.2, 60.5, 54.0, 56.5, 55.0, 2, 50.0, 0, NULL, '2025-06-18 23:59:59+00'),
('gs-15', 'trader-luthfi-001', 'DAILY', '2025-06-19', 53.5, 56.0, 59.2, 52.8, 55.2, 54.5, 2, 50.0, 1, NULL, '2025-06-19 23:59:59+00'),
('gs-16', 'trader-luthfi-001', 'DAILY', '2025-06-20', 48.2, 52.5, 56.0, 50.2, 53.0, 52.0, 3, 33.3, 2, NULL, '2025-06-20 23:59:59+00'),
('gs-17', 'trader-luthfi-001', 'DAILY', '2025-06-21', 56.8, 58.5, 62.0, 55.5, 57.8, 56.5, 2, 50.0, 0, NULL, '2025-06-21 23:59:59+00'),
('gs-18', 'trader-luthfi-001', 'DAILY', '2025-06-22', 55.0, 57.8, 61.5, 54.2, 56.8, 55.8, 1, 100.0, 0, 'Catatan mingguan otomatis oleh sistem.', '2025-06-22 23:59:59+00'),
('gs-19', 'trader-luthfi-001', 'DAILY', '2025-06-23', 58.5, 60.2, 64.0, 57.8, 59.5, 58.2, 2, 50.0, 0, NULL, '2025-06-23 23:59:59+00'),
('gs-20', 'trader-luthfi-001', 'DAILY', '2025-06-24', 62.0, 63.5, 67.5, 61.0, 63.2, 62.5, 2, 50.0, 0, NULL, '2025-06-24 23:59:59+00'),
('gs-21', 'trader-luthfi-001', 'DAILY', '2025-06-25', 59.5, 61.8, 65.2, 58.5, 60.8, 59.5, 3, 33.3, 1, NULL, '2025-06-25 23:59:59+00'),
('gs-22', 'trader-luthfi-001', 'DAILY', '2025-06-26', 60.2, 62.5, 66.0, 59.2, 61.5, 60.0, 2, 50.0, 1, NULL, '2025-06-26 23:59:59+00'),
('gs-23', 'trader-luthfi-001', 'DAILY', '2025-06-27', 63.5, 65.2, 68.5, 62.0, 64.0, 63.5, 2, 50.0, 0, 'Catatan mingguan otomatis oleh sistem.', '2025-06-27 23:59:59+00'),
('gs-24', 'trader-luthfi-001', 'DAILY', '2025-06-28', 61.8, 63.0, 66.5, 60.5, 62.8, 61.5, 3, 33.3, 1, NULL, '2025-06-28 23:59:59+00'),
('gs-25', 'trader-luthfi-001', 'DAILY', '2025-06-29', 64.2, 66.8, 69.5, 63.5, 65.5, 64.0, 2, 50.0, 0, NULL, '2025-06-29 23:59:59+00'),
('gs-26', 'trader-luthfi-001', 'DAILY', '2025-06-30', 62.5, 65.0, 68.0, 62.2, 64.5, 63.0, 2, 50.0, 1, NULL, '2025-06-30 23:59:59+00'),
('gs-27', 'trader-luthfi-001', 'DAILY', '2025-07-01', 65.0, 67.2, 70.5, 64.5, 66.8, 65.5, 3, 33.3, 0, 'Catatan mingguan otomatis oleh sistem.', '2025-07-01 23:59:59+00'),
('gs-28', 'trader-luthfi-001', 'DAILY', '2025-07-02', 67.5, 69.5, 72.8, 66.0, 68.5, 67.0, 2, 50.0, 0, NULL, '2025-07-02 23:59:59+00'),
('gs-29', 'trader-luthfi-001', 'DAILY', '2025-07-03', 68.2, 70.0, 73.5, 67.5, 69.8, 68.0, 2, 50.0, 0, NULL, '2025-07-03 23:59:59+00'),
('gs-30', 'trader-luthfi-001', 'DAILY', '2025-07-04', 66.5, 68.5, 71.5, 65.8, 68.0, 67.5, 1, 100.0, 1, NULL, '2025-07-04 23:59:59+00');

-- ========================================
-- 9. TRADING DNA
-- ========================================

INSERT INTO "TradingDNA" ("id", "traderId", "tradingStyle", "dominantEmotion", "strengths", "weaknesses", "bestSetup", "bestSession", "bestRiskReward", "bestPair", "worstSetup", "worstSession", "totalTradesAnalyzed", "analysisPeriod", "aiSummary", "createdAt", "updatedAt")
VALUES (
    'dna-001', 'trader-luthfi-001',
    'DAY_TRADER',
    'DISCIPLINE',
    '["Sabar menunggu setup ICT London","Risk management sudah konsisten 1-2%","Menggunakan checklist sebelum entry","Refleksi post-trade detail"]',
    '["Early close saat floating profit","FOMO saat news high-impact","Kadang mengubah stop loss","Overconfidence setelah win streak"]',
    'ICT London Session', 'LONDON', '1:2', 'GBPJPY',
    'Breakout tanpa konfirmasi', 'ASIAN',
    12, '2 bulan',
    'Luthfi adalah day trader dengan gaya ICT. Trading DNA menunjukkan profil trader yang disiplin namun masih rentan terhadap early close dan FOMO. Pola terkuat adalah di sesi London dengan setup ICT London, sementara area terlemah adalah trading di sesi Asian tanpa konfirmasi. Tren perkembangan menunjukkan peningkatan di disiplin dan risk management, namun perlu perbaikan di kesabaran menahan posisi hingga target tercapai.',
    NOW(), NOW()
);

-- ========================================
-- 10. GROWTH REPORT (latest)
-- ========================================

INSERT INTO "GrowthReport" ("id", "traderId", "reportType", "periodStart", "periodEnd", "totalTrades", "processScore", "processScoreChange", "winRate", "totalPnL", "ruleCompliance", "playbookUsage", "behaviorsImproved", "behaviorsToImprove", "nextWeekTargets", "aiSummary", "highlight", "generatedAt")
VALUES (
    'gr-001', 'trader-luthfi-001',
    'WEEKLY', '2025-07-28', '2025-08-03',
    7, 76, 7, 57.1, 98.4, 85.0, 88.0,
    '["Tidak lagi revenge trading","Moving stop loss berkurang drastis","Checklist digunakan konsisten"]',
    '["Early close masih terjadi di 2 trade","Perlu lebih sabar menunggu konfirmasi full"]',
    '["Minimal 90% Rule Compliance","Zero revenge trading","Gunakan trailing stop untuk semua trade"]',
    'Minggu yang positif! Process score naik 7 poin ke 76. Revenge trading berhasil dieliminasi. Perbaikan terbesar ada di disiplin checklist dan risk management. Area fokus minggu depan: early close dan kesabaran.',
    'Revenge trading berhasil dieliminasi selama 2 minggu berturut-turut!',
    NOW()
);

-- ========================================
-- DONE! ✅ Semua data demo sudah ter-insert
-- ========================================
