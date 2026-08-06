import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Allowed timezone values (matches frontend TIMEZONES list)
const ALLOWED_TIMEZONES = [
  "Asia/Makassar",
  "Asia/Jakarta",
  "Asia/Jayapura",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Asia/Hong_Kong",
  "Europe/London",
  "America/New_York",
] as const;

type SettingsType = "profile" | "preferences" | "notifications";

interface ProfileData {
  name?: string;
  timezone?: string;
}

interface SettingsPayload {
  type: SettingsType;
  data: ProfileData;
}

// PUT /api/settings — Unified settings endpoint
export async function PUT(request: NextRequest) {
  try {
    const body: SettingsPayload = await request.json();
    const { type, data } = body;

    if (!type || !["profile", "preferences", "notifications"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid type. Must be 'profile', 'preferences', or 'notifications'." },
        { status: 400 }
      );
    }

    // ── Profile: update Trader name & timezone ──
    if (type === "profile") {
      const { name, timezone } = data as ProfileData;

      // Validate name
      if (name !== undefined) {
        const trimmed = name.trim();
        if (trimmed.length === 0) {
          return NextResponse.json(
            { error: "Name cannot be empty." },
            { status: 400 }
          );
        }
        if (trimmed.length > 50) {
          return NextResponse.json(
            { error: "Name must be 50 characters or fewer." },
            { status: 400 }
          );
        }
      }

      // Validate timezone
      if (timezone !== undefined) {
        if (!ALLOWED_TIMEZONES.includes(timezone as (typeof ALLOWED_TIMEZONES)[number])) {
          return NextResponse.json(
            { error: `Invalid timezone. Allowed: ${ALLOWED_TIMEZONES.join(", ")}` },
            { status: 400 }
          );
        }
      }

      // Find the trader
      const trader = await db.trader.findFirst();
      if (!trader) {
        return NextResponse.json(
          { error: "No trader profile found." },
          { status: 404 }
        );
      }

      // Build update payload (only include provided fields)
      const updateData: { name?: string; timezone?: string } = {};
      if (name !== undefined) {
        updateData.name = name.trim();
      }
      if (timezone !== undefined) {
        updateData.timezone = timezone;
      }

      const updated = await db.trader.update({
        where: { id: trader.id },
        data: updateData,
      });

      return NextResponse.json({
        success: true,
        trader: {
          id: updated.id,
          name: updated.name,
          email: updated.email,
          timezone: updated.timezone,
          avatar: updated.avatar,
        },
      });
    }

    // ── Preferences: client-side only for now ──
    if (type === "preferences") {
      return NextResponse.json({
        success: true,
        message: "Preferences are stored client-side.",
      });
    }

    // ── Notifications: client-side only for now ──
    if (type === "notifications") {
      return NextResponse.json({
        success: true,
        message: "Notification preferences are stored client-side.",
      });
    }
  } catch (error) {
    console.error("PUT /api/settings error:", error);
    return NextResponse.json(
      { error: "Failed to update settings." },
      { status: 500 }
    );
  }
}
