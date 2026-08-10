import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireTrader } from "@/lib/api-auth";

// DELETE /api/settings/reset — Reset only the authenticated trader's data.
export async function DELETE() {
  const { trader, error: authError } = await requireTrader();
  if (authError || !trader) return authError;

  try {
    const traderId = trader.id;

    const results = await db.$transaction([
      // Child records without a direct traderId must be scoped through their parent.
      db.conversationTurn.deleteMany({
        where: { coachingSession: { traderId } },
      }),
      db.coachingSession.deleteMany({ where: { traderId } }),
      db.tradeEntry.deleteMany({ where: { traderId } }),
      db.playbookChecklistItem.deleteMany({
        where: { checklist: { playbook: { traderId } } },
      }),
      db.playbookChecklist.deleteMany({
        where: { playbook: { traderId } },
      }),
      db.playbook.deleteMany({ where: { traderId } }),
      db.behavioralEvent.deleteMany({ where: { traderId } }),
      db.growthSnapshot.deleteMany({ where: { traderId } }),
      db.patternFinding.deleteMany({ where: { traderId } }),
      db.reflectionGapRecord.deleteMany({ where: { traderId } }),
      db.insightCard.deleteMany({ where: { traderId } }),
      db.processScoreSnapshot.deleteMany({ where: { traderId } }),
      db.weeklyReviewRecord.deleteMany({ where: { traderId } }),
      db.tradingDNA.deleteMany({ where: { traderId } }),
      db.growthReport.deleteMany({ where: { traderId } }),
      db.memoryL0Event.deleteMany({ where: { traderId } }),
      db.memoryL1Summary.deleteMany({ where: { traderId } }),
      db.memoryL2Digest.deleteMany({ where: { traderId } }),
      db.traderReadinessScore.deleteMany({ where: { traderId } }),
      db.eventLog.deleteMany({ where: { traderId } }),
    ]);

    const labels = [
      "conversationTurns",
      "coachingSessions",
      "tradeEntries",
      "playbookChecklistItems",
      "playbookChecklists",
      "playbooks",
      "behavioralEvents",
      "growthSnapshots",
      "patternFindings",
      "reflectionGapRecords",
      "insightCards",
      "processScoreSnapshots",
      "weeklyReviewRecords",
      "tradingDNA",
      "growthReports",
      "memoryL0Events",
      "memoryL1Summaries",
      "memoryL2Digests",
      "traderReadinessScores",
      "eventLogs",
    ] as const;

    const details = Object.fromEntries(
      labels.map((label, index) => [label, results[index].count]),
    );
    const totalDeleted = results.reduce((sum, result) => sum + result.count, 0);

    return NextResponse.json({
      success: true,
      message: "Your trading data has been reset successfully.",
      totalDeleted,
      details,
    });
  } catch (error) {
    console.error("DELETE /api/settings/reset error:", error);
    return NextResponse.json(
      { error: "Failed to reset data." },
      { status: 500 },
    );
  }
}
