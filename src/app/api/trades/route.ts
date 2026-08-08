import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// ========================================
// Process Score Calculator
// ========================================

/**
 * Computes a daily process score (0-100) from the trader's recent trades.
 * Creates/updates a ProcessScoreSnapshot for today.
 * Called after trade creation/update (non-blocking).
 */
async function computeAndSaveProcessScore(traderId: string) {
  try {
    const now = new Date()
    const thirtyDaysAgo = new Date(now)
    thirtyDaysAgo.setDate(now.getDate() - 30)

    const recentTrades = await db.tradeEntry.findMany({
      where: { traderId, deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 50,
    })

    if (recentTrades.length === 0) return

    // Calculate sub-scores
    const closedTrades = recentTrades.filter((t) => t.status === "CLOSED")

    // 1. Discipline: % of trades with stopLoss set
    const tradesWithSL = recentTrades.filter((t) => t.stopLoss !== null)
    const discipline = recentTrades.length > 0
      ? Math.round((tradesWithSL.length / recentTrades.length) * 100)
      : 0

    // 2. Consistency: based on strategy usage and playbook compliance
    const tradesWithStrategy = recentTrades.filter((t) => t.strategy !== null)
    const consistency = recentTrades.length > 0
      ? Math.round((tradesWithStrategy.length / recentTrades.length) * 100)
      : 0

    // 3. Reflection: % of closed trades that have been reflected
    const reflectedTrades = recentTrades.filter((t) => t.hasReflected)
    const reflection = closedTrades.length > 0
      ? Math.round((reflectedTrades.length / closedTrades.length) * 100)
      : 0

    // 4. Risk Management: ratio of trades with proper R:R (SL + TP both set)
    const tradesWithRR = recentTrades.filter(
      (t) => t.stopLoss !== null && t.takeProfit !== null
    )
    const riskManagement = recentTrades.length > 0
      ? Math.round((tradesWithRR.length / recentTrades.length) * 100)
      : 0

    // 5. Emotional Control: % of trades with emotion tracked
    const tradesWithEmotion = recentTrades.filter(
      (t) => t.emotionBefore !== null || t.emotionAfter !== null
    )
    const emotionalControl = recentTrades.length > 0
      ? Math.round((tradesWithEmotion.length / recentTrades.length) * 100)
      : 0

    // Weighted average for overall score
    const overallScore = Math.round(
      discipline * 0.25 +
      consistency * 0.2 +
      reflection * 0.25 +
      riskManagement * 0.2 +
      emotionalControl * 0.1
    )

    const today = now.toISOString().split("T")[0]

    // Upsert today's snapshot
    const existing = await db.processScoreSnapshot.findFirst({
      where: {
        traderId,
        period: "DAILY",
        periodDate: today,
      },
    })

    if (existing) {
      await db.processScoreSnapshot.update({
        where: { id: existing.id },
        data: {
          score: overallScore,
          components: JSON.stringify({
            discipline,
            consistency,
            reflection,
            riskManagement,
            emotionalControl,
          }),
        },
      })
    } else {
      await db.processScoreSnapshot.create({
        data: {
          traderId,
          score: overallScore,
          components: JSON.stringify({
            discipline,
            consistency,
            reflection,
            riskManagement,
            emotionalControl,
          }),
          period: "DAILY",
          periodDate: today,
        },
      })
    }
  } catch (err) {
    console.error("Process score calculation failed (non-blocking):", err)
  }
}

// GET /api/trades — List trades with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const pair = searchParams.get("pair");
    const direction = searchParams.get("direction");
    const result = searchParams.get("result");
    const hasReflected = searchParams.get("hasReflected");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      deletedAt: null,
    };

    if (pair) {
      where.pair = { contains: pair, mode: "insensitive" };
    }
    if (direction && direction !== "ALL") {
      where.direction = direction;
    }
    if (result === "PROFIT") {
      where.profitLoss = { gt: 0 };
    } else if (result === "LOSS") {
      where.profitLoss = { lt: 0 };
    }
    if (hasReflected === "true") {
      where.hasReflected = true;
    } else if (hasReflected === "false") {
      where.hasReflected = false;
    }
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        (where.createdAt as Record<string, unknown>).gte = new Date(dateFrom);
      }
      if (dateTo) {
        (where.createdAt as Record<string, unknown>).lte = new Date(dateTo);
      }
    }

    const [trades, total] = await Promise.all([
      db.tradeEntry.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.tradeEntry.count({ where }),
    ]);

    // Get distinct pairs for filter dropdown
    const pairs = await db.tradeEntry.findMany({
      where: { deletedAt: null },
      select: { pair: true },
      distinct: ["pair"],
      orderBy: { pair: "asc" },
    });

    return NextResponse.json({
      trades,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      filters: {
        availablePairs: pairs.map((p) => p.pair),
      },
    });
  } catch (error) {
    console.error("GET /api/trades error:", error);
    return NextResponse.json(
      { error: "Failed to fetch trades" },
      { status: 500 }
    );
  }
}

// POST /api/trades — Create new trade
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      pair,
      direction,
      timeframe,
      strategy,
      entryPrice,
      stopLoss,
      takeProfit,
      lotSize,
      planNotes,
      emotionBefore,
      tags,
      screenshotUrl,
      exitPrice,
      profitLoss,
      pipResult,
      status,
      entryTime,
      exitTime,
      emotionAfter,
      reflectionNotes,
      lessonLearned,
      processScore,
    } = body;

    // Validation
    if (!pair || !direction || entryPrice === undefined) {
      return NextResponse.json(
        { error: "Pair, direction, and entry price are required" },
        { status: 400 }
      );
    }

    if (direction !== "LONG" && direction !== "SHORT") {
      return NextResponse.json(
        { error: "Direction must be LONG or SHORT" },
        { status: 400 }
      );
    }

    // Get or create a default trader (for MVP)
    let trader = await db.trader.findFirst();
    if (!trader) {
      trader = await db.trader.create({
        data: {
          email: "trader@alpha.dev",
          name: "Default Trader",
        },
      });
    }

    const trade = await db.tradeEntry.create({
      data: {
        traderId: trader.id,
        pair: pair.toUpperCase(),
        direction,
        timeframe: timeframe || null,
        strategy: strategy || null,
        entryPrice: parseFloat(entryPrice),
        stopLoss: stopLoss ? parseFloat(stopLoss) : null,
        takeProfit: takeProfit ? parseFloat(takeProfit) : null,
        lotSize: lotSize ? parseFloat(lotSize) : null,
        planNotes: planNotes || null,
        emotionBefore: emotionBefore || null,
        tags: tags ? JSON.stringify(tags) : null,
        screenshotUrl: screenshotUrl || null,
        exitPrice: exitPrice ? parseFloat(exitPrice) : null,
        profitLoss: profitLoss ? parseFloat(profitLoss) : 0,
        pipResult: pipResult ? parseFloat(pipResult) : null,
        status: status || "OPEN",
        entryTime: entryTime ? new Date(entryTime) : new Date(),
        exitTime: exitTime ? new Date(exitTime) : null,
        emotionAfter: emotionAfter || null,
        reflectionNotes: reflectionNotes || null,
        lessonLearned: lessonLearned || null,
        processScore: processScore ?? 0,
        hasReflected: !!(reflectionNotes || lessonLearned),
      },
    });

    // Fire L0 Memory Event (non-blocking)
    db.memoryL0Event.create({
      data: {
        traderId: trader.id,
        eventType: "TradeSaved",
        eventData: JSON.stringify({
          tradeId: trade.id,
          pair: trade.pair,
          direction: trade.direction,
          profitLoss: trade.profitLoss,
          status: trade.status,
          processScore: trade.processScore,
        }),
      },
    }).catch(() => { /* non-blocking */ });

    // Recalculate process score (non-blocking)
    computeAndSaveProcessScore(trader.id).catch(() => { /* non-blocking */ });

    return NextResponse.json({ trade }, { status: 201 });
  } catch (error) {
    console.error("POST /api/trades error:", error);
    return NextResponse.json(
      { error: "Failed to create trade" },
      { status: 500 }
    );
  }
}
