import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/trades/[id] — Fetch single trade
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
          updateData[field] = body[field] !== null ? parseFloat(body[field]) : null;
        } else if (["processScore"].includes(field)) {
          updateData[field] = body[field] !== null ? parseInt(body[field], 10) : null;
        } else if (["entryTime", "exitTime"].includes(field)) {
          updateData[field] = body[field] !== null ? new Date(body[field]) : null;
        } else if (field === "tags" && Array.isArray(body[field])) {
          updateData[field] = JSON.stringify(body[field]);
        } else {
          updateData[field] = body[field];
        }
      }
    }

    // Auto-set hasReflected if reflection notes provided
    if (body.reflectionNotes || body.lessonLearned) {
      updateData.hasReflected = true;
    }

    const trade = await db.tradeEntry.update({
      where: { id },
      data: updateData,
    });

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
  try {
    const { id } = await params;
    const existing = await db.tradeEntry.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) {
      return NextResponse.json({ error: "Trade not found" }, { status: 404 });
    }

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
