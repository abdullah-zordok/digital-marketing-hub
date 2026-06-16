CREATE TYPE "LeadNotificationStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'SKIPPED');

CREATE TABLE "LeadNotification" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "leadId" UUID NOT NULL,
  "target" TEXT NOT NULL,
  "status" "LeadNotificationStatus" NOT NULL DEFAULT 'PENDING',
  "payload" JSONB NOT NULL,
  "errorMessage" TEXT,
  "attemptedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "LeadNotification_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "LeadNotification_leadId_idx" ON "LeadNotification"("leadId");
CREATE INDEX "LeadNotification_status_idx" ON "LeadNotification"("status");
CREATE INDEX "LeadNotification_attemptedAt_idx" ON "LeadNotification"("attemptedAt");
CREATE INDEX "LeadNotification_createdAt_idx" ON "LeadNotification"("createdAt");

ALTER TABLE "LeadNotification"
  ADD CONSTRAINT "LeadNotification_leadId_fkey"
  FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
