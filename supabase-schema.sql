-- ========================================
-- PROJECT ALPHA -- Supabase Schema
-- AI Trading Coach | PostgreSQL
-- ========================================
-- BUKA: Supabase Dashboard -> SQL Editor -> Paste -> Run
-- ========================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ========================================
-- IDENTITY DOMAIN
-- ========================================

CREATE TABLE IF NOT EXISTS "Trader" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "avatar" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Makassar',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX "Trader_email_key" ON "Trader"("email");

CREATE TABLE IF NOT EXISTS "TraderReadinessScore" (
    "id" TEXT NOT NULL,
    "traderId" TEXT NOT NULL,
    "hasStrategy" BOOLEAN NOT NULL DEFAULT false,
    "consistentTrading" BOOLEAN NOT NULL DEFAULT false,
    "willingToReflect" BOOLEAN NOT NULL DEFAULT false,
    "willingToLearn" BOOLEAN NOT NULL DEFAULT false,
    "willingToRecord" BOOLEAN NOT NULL DEFAULT false,
    "totalScore" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- TRADING DOMAIN
-- ========================================

CREATE TABLE IF NOT EXISTS "TradeEntry" (
    "id" TEXT NOT NULL,
    "traderId" TEXT NOT NULL,
    "pair" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "timeframe" TEXT,
    "strategy" TEXT,
    "entryPrice" DOUBLE PRECISION NOT NULL,
    "exitPrice" DOUBLE PRECISION,
    "stopLoss" DOUBLE PRECISION,
    "takeProfit" DOUBLE PRECISION,
    "lotSize" DOUBLE PRECISION,
    "pipResult" DOUBLE PRECISION,
    "profitLoss" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "entryTime" TIMESTAMP(3),
    "exitTime" TIMESTAMP(3),
    "screenshotUrl" TEXT,
    "processScore" INTEGER DEFAULT 0,
    "planNotes" TEXT,
    "reflectionNotes" TEXT,
    "emotionBefore" TEXT,
    "emotionAfter" TEXT,
    "lessonLearned" TEXT,
    "hasReflected" BOOLEAN NOT NULL DEFAULT false,
    "tags" TEXT,
    "playbookId" TEXT,
    "behavioralTags" TEXT,
    "playbookCompliance" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3)
);

-- ========================================
-- COACHING DOMAIN
-- ========================================

CREATE TABLE IF NOT EXISTS "CoachingSession" (
    "id" TEXT NOT NULL,
    "traderId" TEXT NOT NULL,
    "sessionType" TEXT NOT NULL DEFAULT 'REFLECTION',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "title" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "traderRating" INTEGER,
    "reflectionStep" TEXT,
    "reflectionProgress" TEXT,
    "linkedTradeId" TEXT
);

CREATE TABLE IF NOT EXISTS "ConversationTurn" (
    "id" TEXT NOT NULL,
    "coachingSessionId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "templateUsed" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- MEMORY DOMAIN
-- ========================================

CREATE TABLE IF NOT EXISTS "MemoryL0Event" (
    "id" TEXT NOT NULL,
    "traderId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "eventData" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "MemoryL1Summary" (
    "id" TEXT NOT NULL,
    "traderId" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "periodEnd" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX "MemoryL1Summary_traderId_key" ON "MemoryL1Summary"("traderId");

CREATE TABLE IF NOT EXISTS "MemoryL2Digest" (
    "id" TEXT NOT NULL,
    "traderId" TEXT NOT NULL,
    "personaType" TEXT,
    "dominantPatterns" TEXT,
    "readinessTrend" TEXT,
    "psychologicalNotes" TEXT,
    "tradingStyle" TEXT,
    "dominantEmotions" TEXT,
    "strengths" TEXT,
    "weaknesses" TEXT,
    "bestSetup" TEXT,
    "bestSession" TEXT,
    "bestRiskReward" TEXT,
    "totalTradesAnalyzed" INTEGER NOT NULL DEFAULT 0,
    "analysisPeriod" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX "MemoryL2Digest_traderId_key" ON "MemoryL2Digest"("traderId");

-- ========================================
-- PLAYBOOK DOMAIN
-- ========================================

CREATE TABLE IF NOT EXISTS "Playbook" (
    "id" TEXT NOT NULL,
    "traderId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sessionType" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "PlaybookChecklist" (
    "id" TEXT NOT NULL,
    "playbookId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "PlaybookChecklistItem" (
    "id" TEXT NOT NULL,
    "checklistId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- BEHAVIORAL ENGINE DOMAIN
-- ========================================

CREATE TABLE IF NOT EXISTS "BehavioralEvent" (
    "id" TEXT NOT NULL,
    "traderId" TEXT NOT NULL,
    "tradeId" TEXT,
    "behaviorType" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'MEDIUM',
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "evidence" TEXT NOT NULL,
    "aiAnalysis" TEXT,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- GROWTH TIMELINE DOMAIN
-- ========================================

CREATE TABLE IF NOT EXISTS "GrowthSnapshot" (
    "id" TEXT NOT NULL,
    "traderId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "periodDate" TEXT NOT NULL,
    "emotionScore" DOUBLE PRECISION,
    "consistencyScore" DOUBLE PRECISION,
    "processScore" DOUBLE PRECISION,
    "behaviorScore" DOUBLE PRECISION,
    "disciplineScore" DOUBLE PRECISION,
    "riskMgmtScore" DOUBLE PRECISION,
    "totalTrades" INTEGER NOT NULL DEFAULT 0,
    "winRate" DOUBLE PRECISION,
    "behavioralEvents" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- PATTERN & INSIGHT DOMAIN
-- ========================================

CREATE TABLE IF NOT EXISTS "PatternRegistry" (
    "id" TEXT NOT NULL,
    "patternType" TEXT NOT NULL,
    "detectionRule" TEXT NOT NULL,
    "minimumData" INTEGER NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 1,
    "reflectionTemplate" TEXT,
    "notificationRule" TEXT,
    "status" TEXT NOT NULL DEFAULT 'EXPERIMENTAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX "PatternRegistry_patternType_key" ON "PatternRegistry"("patternType");

CREATE TABLE IF NOT EXISTS "PatternFinding" (
    "id" TEXT NOT NULL,
    "traderId" TEXT NOT NULL,
    "patternId" TEXT NOT NULL,
    "confidenceScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "evidence" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "ReflectionGapRecord" (
    "id" TEXT NOT NULL,
    "traderId" TEXT NOT NULL,
    "tradeId" TEXT,
    "patternFindingId" TEXT,
    "gapType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "plan" TEXT,
    "execution" TEXT,
    "gapAnalysis" TEXT,
    "impact" TEXT,
    "recommendation" TEXT,
    "behaviorTag" TEXT,
    "severity" TEXT NOT NULL DEFAULT 'MEDIUM',
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "InsightCard" (
    "id" TEXT NOT NULL,
    "traderId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "sourceRef" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- ANALYTICS DOMAIN
-- ========================================

CREATE TABLE IF NOT EXISTS "ProcessScoreSnapshot" (
    "id" TEXT NOT NULL,
    "traderId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "components" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "periodDate" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "WeeklyReviewRecord" (
    "id" TEXT NOT NULL,
    "traderId" TEXT NOT NULL,
    "weekStart" TEXT NOT NULL,
    "weekEnd" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "highlights" TEXT,
    "areasToImprove" TEXT,
    "processScoreChange" DOUBLE PRECISION,
    "totalTrades" INTEGER NOT NULL DEFAULT 0,
    "winRate" DOUBLE PRECISION,
    "totalPnL" DOUBLE PRECISION,
    "processScore" INTEGER DEFAULT 0,
    "ruleCompliance" DOUBLE PRECISION,
    "biggestMistake" TEXT,
    "recommendation" TEXT,
    "topBehavioralIssue" TEXT,
    "playbookUsage" DOUBLE PRECISION,
    "emotionBreakdown" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- TRADING DNA DOMAIN
-- ========================================

CREATE TABLE IF NOT EXISTS "TradingDNA" (
    "id" TEXT NOT NULL,
    "traderId" TEXT NOT NULL,
    "tradingStyle" TEXT,
    "dominantEmotion" TEXT,
    "strengths" TEXT,
    "weaknesses" TEXT,
    "bestSetup" TEXT,
    "bestSession" TEXT,
    "bestRiskReward" TEXT,
    "bestPair" TEXT,
    "worstSetup" TEXT,
    "worstSession" TEXT,
    "totalTradesAnalyzed" INTEGER NOT NULL DEFAULT 0,
    "analysisPeriod" TEXT,
    "aiSummary" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX "TradingDNA_traderId_key" ON "TradingDNA"("traderId");

-- ========================================
-- GROWTH REPORT DOMAIN
-- ========================================

CREATE TABLE IF NOT EXISTS "GrowthReport" (
    "id" TEXT NOT NULL,
    "traderId" TEXT NOT NULL,
    "reportType" TEXT NOT NULL,
    "periodStart" TEXT NOT NULL,
    "periodEnd" TEXT NOT NULL,
    "totalTrades" INTEGER NOT NULL DEFAULT 0,
    "processScore" INTEGER DEFAULT 0,
    "processScoreChange" INTEGER,
    "winRate" DOUBLE PRECISION,
    "totalPnL" DOUBLE PRECISION,
    "ruleCompliance" DOUBLE PRECISION,
    "playbookUsage" DOUBLE PRECISION,
    "behaviorsImproved" TEXT,
    "behaviorsToImprove" TEXT,
    "nextWeekTargets" TEXT,
    "aiSummary" TEXT,
    "highlight" TEXT,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- PLATFORM / INFRA DOMAIN
-- ========================================

CREATE TABLE IF NOT EXISTS "PromptTemplateRegistry" (
    "id" TEXT NOT NULL,
    "templateKey" TEXT NOT NULL,
    "templateName" TEXT NOT NULL,
    "description" TEXT,
    "systemPrompt" TEXT NOT NULL,
    "templateBody" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "modelPreference" TEXT NOT NULL DEFAULT 'gpt-4o-mini',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX "PromptTemplateRegistry_templateKey_key" ON "PromptTemplateRegistry"("templateKey");

CREATE TABLE IF NOT EXISTS "EventLog" (
    "id" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "correlationId" TEXT,
    "traderId" TEXT,
    "ownerId" TEXT,
    "payload" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3)
);

-- ========================================
-- PRIMARY KEYS
-- ========================================

ALTER TABLE "Trader" ADD PRIMARY KEY ("id");
ALTER TABLE "TraderReadinessScore" ADD PRIMARY KEY ("id");
ALTER TABLE "TradeEntry" ADD PRIMARY KEY ("id");
ALTER TABLE "CoachingSession" ADD PRIMARY KEY ("id");
ALTER TABLE "ConversationTurn" ADD PRIMARY KEY ("id");
ALTER TABLE "MemoryL0Event" ADD PRIMARY KEY ("id");
ALTER TABLE "MemoryL1Summary" ADD PRIMARY KEY ("id");
ALTER TABLE "MemoryL2Digest" ADD PRIMARY KEY ("id");
ALTER TABLE "Playbook" ADD PRIMARY KEY ("id");
ALTER TABLE "PlaybookChecklist" ADD PRIMARY KEY ("id");
ALTER TABLE "PlaybookChecklistItem" ADD PRIMARY KEY ("id");
ALTER TABLE "BehavioralEvent" ADD PRIMARY KEY ("id");
ALTER TABLE "GrowthSnapshot" ADD PRIMARY KEY ("id");
ALTER TABLE "PatternRegistry" ADD PRIMARY KEY ("id");
ALTER TABLE "PatternFinding" ADD PRIMARY KEY ("id");
ALTER TABLE "ReflectionGapRecord" ADD PRIMARY KEY ("id");
ALTER TABLE "InsightCard" ADD PRIMARY KEY ("id");
ALTER TABLE "ProcessScoreSnapshot" ADD PRIMARY KEY ("id");
ALTER TABLE "WeeklyReviewRecord" ADD PRIMARY KEY ("id");
ALTER TABLE "TradingDNA" ADD PRIMARY KEY ("id");
ALTER TABLE "GrowthReport" ADD PRIMARY KEY ("id");
ALTER TABLE "PromptTemplateRegistry" ADD PRIMARY KEY ("id");
ALTER TABLE "EventLog" ADD PRIMARY KEY ("id");

-- ========================================
-- Prisma migration tracking table
-- ========================================

CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
    "id"                      SERIAL PRIMARY KEY,
    "checksum"                TEXT   NOT NULL,
    "finished_at"             TIMESTAMPTZ,
    "migration_name"          TEXT   NOT NULL,
    "logs"                    TEXT,
    "rolled_back_at"          TIMESTAMPTZ,
    "started_at"              TIMESTAMPTZ NOT NULL DEFAULT now(),
    "applied_steps_count"     INTEGER NOT NULL DEFAULT 0
);

-- ========================================
-- DONE! [OK]
-- ========================================
