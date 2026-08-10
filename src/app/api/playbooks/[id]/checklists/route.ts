import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireTrader } from "@/lib/api-auth";

// POST /api/playbooks/[id]/checklists — Add a checklist
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: playbookId } = await params;
    const body = await request.json();
    const { title, description, items } = body;

    const { trader, error: authError } = await requireTrader();
    if (authError) return authError;
    if (!trader) return NextResponse.json({ error: "Trader not found" }, { status: 404 });

    if (!title?.trim()) {
      return NextResponse.json(
        { error: "Judul checklist wajib diisi" },
        { status: 400 }
      );
    }

    const playbook = await db.playbook.findFirst({ where: { id: playbookId, traderId: trader.id } });
    if (!playbook) {
      return NextResponse.json(
        { error: "Playbook not found" },
        { status: 404 }
      );
    }

    // Get max sortOrder for checklists in this playbook
    const maxOrder = await db.playbookChecklist.findFirst({
      where: { playbookId },
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });

    const checklist = await db.playbookChecklist.create({
      data: {
        playbookId,
        title: title.trim(),
        description: description?.trim() || null,
        sortOrder: (maxOrder?.sortOrder ?? -1) + 1,
        ...(items && items.length > 0
          ? {
              items: {
                create: items.map((text: string, idx: number) => ({
                  text: text.trim(),
                  sortOrder: idx,
                })),
              },
            }
          : {}),
      },
      include: { items: { orderBy: { sortOrder: "asc" } } },
    });

    return NextResponse.json({ checklist }, { status: 201 });
  } catch (error) {
    console.error("POST /api/playbooks/[id]/checklists error:", error);
    return NextResponse.json(
      { error: "Failed to create checklist" },
      { status: 500 }
    );
  }
}

// PUT /api/playbooks/[id]/checklists — Update checklist order
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: playbookId } = await params;
    const body = await request.json();
    const { orders } = body; // [{id: "...", sortOrder: 0}, ...]

    const { trader, error: authError } = await requireTrader();
    if (authError) return authError;
    if (!trader) return NextResponse.json({ error: "Trader not found" }, { status: 404 });

    const ownedPlaybook = await db.playbook.findFirst({ where: { id: playbookId, traderId: trader.id } });
    if (!ownedPlaybook) return NextResponse.json({ error: "Playbook not found" }, { status: 404 });

    if (!Array.isArray(orders)) {
      return NextResponse.json(
        { error: "orders array is required" },
        { status: 400 }
      );
    }

    await Promise.all(
      orders.map(
        (item: { id: string; sortOrder: number }) =>
          db.playbookChecklist.update({
            where: { id: item.id },
            data: { sortOrder: item.sortOrder },
          })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT /api/playbooks/[id]/checklists error:", error);
    return NextResponse.json(
      { error: "Failed to update checklist order" },
      { status: 500 }
    );
  }
}

// DELETE /api/playbooks/[id]/checklists — Not used for single delete; see [checklistId] items route
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: playbookId } = await params;
    const { searchParams } = new URL(request.url);
    const checklistId = searchParams.get("checklistId");

    const { trader, error: authError } = await requireTrader();
    if (authError) return authError;
    if (!trader) return NextResponse.json({ error: "Trader not found" }, { status: 404 });

    const ownedPlaybook = await db.playbook.findFirst({ where: { id: playbookId, traderId: trader.id } });
    if (!ownedPlaybook) return NextResponse.json({ error: "Playbook not found" }, { status: 404 });

    if (!checklistId) {
      return NextResponse.json(
        { error: "checklistId query param is required" },
        { status: 400 }
      );
    }

    const checklist = await db.playbookChecklist.findFirst({
      where: { id: checklistId, playbookId },
    });
    if (!checklist) {
      return NextResponse.json(
        { error: "Checklist not found" },
        { status: 404 }
      );
    }

    await db.playbookChecklist.delete({ where: { id: checklistId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/playbooks/[id]/checklists error:", error);
    return NextResponse.json(
      { error: "Failed to delete checklist" },
      { status: 500 }
    );
  }
}
