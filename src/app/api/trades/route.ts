import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

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

    return NextResponse.json({ trade }, { status: 201 });
  } catch (error) {
    console.error("POST /api/trades error:", error);
    return NextResponse.json(
      { error: "Failed to create trade" },
      { status: 500 }
    );
  }
}
