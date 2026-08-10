import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireTrader } from "@/lib/api-auth";

// GET /api/playbooks — List all playbooks with checklist count and trade count
export async function GET() {
  const { trader, error: authError } = await requireTrader()
  if (authError) return authError
  if (!trader) return NextResponse.json({ error: "Trader not found" }, { status: 404 })

  try {
    if (!trader) {
      return NextResponse.json({ playbooks: [] });
    }

    const playbooks = await db.playbook.findMany({
      where: { traderId: trader.id },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      include: {
        _count: {
          select: {
            checklists: true,
            trades: true,
          },
        },
      },
    });

    return NextResponse.json({ playbooks });
  } catch (error) {
    console.error("GET /api/playbooks error:", error);
    return NextResponse.json(
      { error: "Failed to fetch playbooks" },
      { status: 500 }
    );
  }
}

// POST /api/playbooks — Create a new playbook
export async function POST(request: NextRequest) {
  const { trader, error: authError } = await requireTrader()
  if (authError) return authError
  if (!trader) return NextResponse.json({ error: "Trader not found" }, { status: 404 })

  try {
    const body = await request.json();
    const { name, description, sessionType } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Nama playbook wajib diisi" },
        { status: 400 }
      );
    }

    if (!trader) {
      return NextResponse.json(
        { error: "Trader not found" },
        { status: 404 }
      );
    }

    // Get max sortOrder
    const maxOrder = await db.playbook.findFirst({
      where: { traderId: trader.id },
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });

    const playbook = await db.playbook.create({
      data: {
        traderId: trader.id,
        name: name.trim(),
        description: description?.trim() || null,
        sessionType: sessionType || null,
        sortOrder: (maxOrder?.sortOrder ?? -1) + 1,
      },
    });

    return NextResponse.json({ playbook }, { status: 201 });
  } catch (error) {
    console.error("POST /api/playbooks error:", error);
    return NextResponse.json(
      { error: "Failed to create playbook" },
      { status: 500 }
    );
  }
}
