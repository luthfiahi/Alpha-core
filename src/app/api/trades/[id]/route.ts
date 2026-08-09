import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/api-auth";
import { computeAndSaveProcessScore } from "@/lib/ai/process-score";

// GET /api/trades/[id] — Fetch single trade
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error: authError } = await getAuthUser()
  if (authError) return authError

  try {
    const { id } = await params;
    const trade = await db.tradeEntry.findUnique({
      where: { id },
    });

    if (!trade || trade.deletedAt) {
      return NextResponse.json({ error: "Trade not found" }, { status: 404 });
    }

    return NextResponse.json({ trade });
  } catch (error) {
    console.error("GET /api/trades/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch trade" },
      { status: 500 }
    );
  }
}

// PUT /api/trades/[id] — Update trade
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error: authError } = await getAuthUser()
  if (authError) return authError

  try {
    const { id } = await params;
    const body = await request.json();

    // Check trade exists and not deleted
    const existing = await db.tradeEntry.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) {
      return NextResponse.json({ error: "Trade not found" }, { status: 404 });
    }

    // Build update data
    const updateData: Record<string, unknown> = { updatedAt: new Date() };

    const updatableFields = [
      "pair",
      "direction",
      "timeframe",
      "strategy",
      "entryPrice",
      "exitPrice",
      "stopLoss",
      "takeProfit",
      "lotSize",
      "pipResult",
      "profitLoss",
      "status",
      "entryTime",
      "exitTime",
      "screenshotUrl",
      "processScore",
      "planNotes",
      "emotionBefore",
      "emotionAfter",
      "reflectionNotes",
      "lessonLearned",
      "tags",
    ];

    for (const field of updatableFields) {
      if (body[field] !== undefined) {
        if (["entryPrice", "exitPrice", "stopLoss", "takeProfit", "lotSize", "pipResult", "profitLoss"].includes(field)) {
          if (body[field] !== null) {
            const parsed = parseFloat(body[field])
            if (Number.isNaN(parsed) || !Number.isFinite(parsed)) {
              return NextResponse.json(
                { error: field + ' must be a valid number' },
                { status: 400 }
              )
            }
            updateData[field] = parsed
          } else {
            updateData[field] = null
          }
        } else if (["processScore"].includes(field)) {
          if (body[field] !== null) {
            const parsed = parseInt(body[field], 10)
            if (Number.isNaN(parsed)) {
              return NextResponse.json(
                { error: field + ' must be a valid number' },
                { status: 400 }
              )
            }
            updateData[field] = parsed
          } else {
            updateData[field] = null
          }
        } else if (["entryTime", "exitTime"].includes(field)) {
          if (body[field] !== null) {
            const date = new Date(body[field])
            if (isNaN(date.getTime())) {
              return NextResponse.json(
                { error: field + ' must be a valid date' },
                { status: 400 }
              )
            }
            updateData[field] = date
          } else {
            updateData[field] = null
          }
        } else if (field === "tags" && Array.isArray(body[field])) {
          updateData[field] = JSON.stringify(body[field]);
        } else {
          updateData[field] = body[field];
        }
      }
    }

    // Always set hasReflected based on reflection content
    updateData.hasReflected = !!(body.reflectionNotes || body.lessonLearned);

    const trade = await db.tradeEntry.update({
      where: { id },
      data: updateData,
    });

    // Recalculate process score (non-blocking)
    computeAndSaveProcessScore(trade.traderId).catch(console.error);

    return NextResponse.json({ trade });
  } catch (error) {
    console.error("PUT /api/trades/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update trade" },
      { status: 500 }
    );
  }
}

// DELETE /api/trades/[id] — Soft delete trade
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error: authError } = await getAuthUser()
  if (authError) return authError

  try {
    const { id } = await params;
    const existing = await db.tradeEntry.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) {
      return NextResponse.json({ error: "Trade not found" }, { status: 404 });
    }

    // Clean up related records before soft-deleting trade
    await db.reflectionGapRecord.deleteMany({
      where: { tradeId: id },
    });
    await db.behavioralEvent.deleteMany({
      where: { tradeId: id },
    });

    await db.tradeEntry.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/trades/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete trade" },
      { status: 500 }
    );
  }
}
