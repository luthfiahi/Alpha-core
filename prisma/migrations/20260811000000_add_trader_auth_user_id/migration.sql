-- Link each application trader to exactly one Supabase Auth user.
-- Nullable first so existing trader data remains intact until its owner signs in.
ALTER TABLE "Trader" ADD COLUMN "authUserId" TEXT;

CREATE UNIQUE INDEX "Trader_authUserId_key" ON "Trader"("authUserId");
