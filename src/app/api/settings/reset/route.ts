import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/api-auth";

// DELETE /api/settings/reset — Reset all trader data (keeps Trader itself)
export async function DELETE() {
  try {
    const { error: authError } = await getAuthUser();
    if (authError) return authError;

    // Collect delete counts
    const counts: Record<string, number> = {};

    // Delete in dependency order (child tables first)

    // 1. ConversationTurns (child of CoachingSession)
    counts.conversationTurns = await db.conversationTurn.count();
    await db.conversationTurn.deleteMany();

    // 2. CoachingSessions
    counts.coachingSessions = await db.coachingSession.count();
    await db.coachingSession.deleteMany();

    // 3. TradeEntries
    counts.tradeEntries = await db.tradeEntry.count();
    await db.tradeEntry.deleteMany();

    // 4. PlaybookChecklistItems (child of PlaybookChecklist)
    counts.playbookChecklistItems = await db.playbookChecklistItem.count();
    await db.playbookChecklistItem.deleteMany();

    // 5. PlaybookChecklists (child of Playbook)
    counts.playbookChecklists = await db.playbookChecklist.count();
    await db.playbookChecklist.deleteMany();

    // 6. Playbooks
    counts.playbooks = await db.playbook.count();
    await db.playbook.deleteMany();

    // 7. BehavioralEvents
    counts.behavioralEvents = await db.behavioralEvent.count();
    await db.behavioralEvent.deleteMany();

    // 8. GrowthSnapshots
    counts.growthSnapshots = await db.growthSnapshot.count();
    await db.growthSnapshot.deleteMany();

    // 9. PatternFindings
    counts.patternFindings = await db.patternFinding.count();
    await db.patternFinding.deleteMany();

    // 10. PatternRegistry
    counts.patternRegistry = await db.patternRegistry.count();
    await db.patternRegistry.deleteMany();

    // 11. ReflectionGapRecords
    counts.reflectionGapRecords = await db.reflectionGapRecord.count();
    await db.reflectionGapRecord.deleteMany();

    // 12. InsightCards
    counts.insightCards = await db.insightCard.count();
    await db.insightCard.deleteMany();

    // 13. ProcessScoreSnapshots
    counts.processScoreSnapshots = await db.processScoreSnapshot.count();
    await db.processScoreSnapshot.deleteMany();

    // 14. WeeklyReviewRecords
    counts.weeklyReviewRecords = await db.weeklyReviewRecord.count();
    await db.weeklyReviewRecord.deleteMany();

    // 15. TradingDNA
    counts.tradingDNA = await db.tradingDNA.count();
    await db.tradingDNA.deleteMany();

    // 16. GrowthReports
    counts.growthReports = await db.growthReport.count();
    await db.growthReport.deleteMany();

    // 17. MemoryL0Events
    counts.memoryL0Events = await db.memoryL0Event.count();
    await db.memoryL0Event.deleteMany();

    // 18. MemoryL1Summaries
    counts.memoryL1Summaries = await db.memoryL1Summary.count();
    await db.memoryL1Summary.deleteMany();

    // 19. MemoryL2Digests
    counts.memoryL2Digests = await db.memoryL2Digest.count();
    await db.memoryL2Digest.deleteMany();

    // 20. TraderReadinessScores
    counts.traderReadinessScores = await db.traderReadinessScore.count();
    await db.traderReadinessScore.deleteMany();

    // 21. EventLog (platform-level, may have no traderId)
    counts.eventLogs = await db.eventLog.count();
    await db.eventLog.deleteMany();

    // 22. PromptTemplateRegistry
    counts.promptTemplates = await db.promptTemplateRegistry.count();
    await db.promptTemplateRegistry.deleteMany();

    // Calculate total
    const totalDeleted = Object.values(counts).reduce((sum, n) => sum + n, 0);

    return NextResponse.json({
      success: true,
      message: "All data has been reset successfully.",
      totalDeleted,
      details: counts,
    });
  } catch (error) {
    console.error("DELETE /api/settings/reset error:", error);
    return NextResponse.json(
      { error: "Failed to reset data." },
      { status: 500 }
    );
  }
}
