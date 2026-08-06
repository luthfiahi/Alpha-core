import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// POST /api/playbooks/[id]/checklists/[checklistId]/items — Add item to checklist
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; checklistId: string }> }
) {
  try {
    const { checklistId } = await params;
    const body = await request.json();
    const { text } = body;

    if (!text?.trim()) {
      return NextResponse.json(
        { error: "Item text wajib diisi" },
        { status: 400 }
      );
    }

    const checklist = await db.playbookChecklist.findUnique({
      where: { id: checklistId },
    });
    if (!checklist) {
      return NextResponse.json(
        { error: "Checklist not found" },
        { status: 404 }
      );
    }

    // Get max sortOrder
    const maxOrder = await db.playbookChecklistItem.findFirst({
      where: { checklistId },
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });

    const item = await db.playbookChecklistItem.create({
      data: {
        checklistId,
        text: text.trim(),
        sortOrder: (maxOrder?.sortOrder ?? -1) + 1,
      },
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    console.error(
      "POST /api/playbooks/[id]/checklists/[checklistId]/items error:",
      error
    );
    return NextResponse.json(
      { error: "Failed to create checklist item" },
      { status: 500 }
    );
  }
}

// PUT /api/playbooks/[id]/checklists/[checklistId]/items — Update item or reorder
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; checklistId: string }> }
) {
  try {
    const { checklistId } = await params;
    const body = await request.json();
    const { itemId, text, orders } = body;

    // Bulk reorder
    if (orders && Array.isArray(orders)) {
      await Promise.all(
        orders.map(
          (o: { id: string; sortOrder: number }) =>
            db.playbookChecklistItem.update({
              where: { id: o.id },
              data: { sortOrder: o.sortOrder },
            })
        )
      );
      return NextResponse.json({ success: true });
    }

    // Single item update
    if (!itemId) {
      return NextResponse.json(
        { error: "itemId is required" },
        { status: 400 }
      );
    }

    const item = await db.playbookChecklistItem.findFirst({
      where: { id: itemId, checklistId },
    });
    if (!item) {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      );
    }

    const updated = await db.playbookChecklistItem.update({
      where: { id: itemId },
      data: {
        ...(text !== undefined && { text: text.trim() }),
      },
    });

    return NextResponse.json({ item: updated });
  } catch (error) {
    console.error(
      "PUT /api/playbooks/[id]/checklists/[checklistId]/items error:",
      error
    );
    return NextResponse.json(
      { error: "Failed to update checklist item" },
      { status: 500 }
    );
  }
}

// DELETE /api/playbooks/[id]/checklists/[checklistId]/items — Delete item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; checklistId: string }> }
) {
  try {
    const { checklistId } = await params;
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("itemId");

    if (!itemId) {
      return NextResponse.json(
        { error: "itemId query param is required" },
        { status: 400 }
      );
    }

    const item = await db.playbookChecklistItem.findFirst({
      where: { id: itemId, checklistId },
    });
    if (!item) {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      );
    }

    await db.playbookChecklistItem.delete({ where: { id: itemId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(
      "DELETE /api/playbooks/[id]/checklists/[checklistId]/items error:",
      error
    );
    return NextResponse.json(
      { error: "Failed to delete checklist item" },
      { status: 500 }
    );
  }
}
