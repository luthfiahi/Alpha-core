import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireTrader } from "@/lib/api-auth";

// GET /api/playbooks/[id] — Get single playbook with full checklist data
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { trader, error: authError } = await requireTrader()
  if (authError) return authError
  if (!trader) return NextResponse.json({ error: "Trader not found" }, { status: 404 })

  try {
    const { id } = await params;
    const playbook = await db.playbook.findFirst({
      where: { id, traderId: trader.id },
      include: {
        checklists: {
          orderBy: { sortOrder: "asc" },
          include: {
            items: {
              orderBy: { sortOrder: "asc" },
            },
          },
        },
        trades: {
          where: { deletedAt: null },
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    });

    if (!playbook) {
      return NextResponse.json(
        { error: "Playbook not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ playbook });
  } catch (error) {
    console.error("GET /api/playbooks/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch playbook" },
      { status: 500 }
    );
  }
}

// PUT /api/playbooks/[id] — Update playbook
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { trader, error: authError } = await requireTrader()
  if (authError) return authError
  if (!trader) return NextResponse.json({ error: "Trader not found" }, { status: 404 })

  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, sessionType, isActive, sortOrder } = body;

    const existing = await db.playbook.findFirst({ where: { id, traderId: trader.id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Playbook not found" },
        { status: 404 }
      );
    }

    const playbook = await db.playbook.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(sessionType !== undefined && { sessionType: sessionType || null }),
        ...(isActive !== undefined && { isActive }),
        ...(sortOrder !== undefined && { sortOrder }),
      },
    });

    return NextResponse.json({ playbook });
  } catch (error) {
    console.error("PUT /api/playbooks/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update playbook" },
      { status: 500 }
    );
  }
}

// DELETE /api/playbooks/[id] — Delete playbook (cascades to checklists/items)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { trader, error: authError } = await requireTrader()
  if (authError) return authError
  if (!trader) return NextResponse.json({ error: "Trader not found" }, { status: 404 })

  try {
    const { id } = await params;
    const existing = await db.playbook.findFirst({ where: { id, traderId: trader.id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Playbook not found" },
        { status: 404 }
      );
    }

    // Unlink trades that reference this playbook
    await db.tradeEntry.updateMany({
      where: { playbookId: id, traderId: trader.id },
      data: { playbookId: null },
    });

    await db.playbook.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/playbooks/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete playbook" },
      { status: 500 }
    );
  }
}
