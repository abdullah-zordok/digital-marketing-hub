ALTER TABLE "Service" ADD COLUMN "canonicalUrl" TEXT;
ALTER TABLE "Service" ADD COLUMN "openGraphImage" TEXT;

ALTER TABLE "BlogPost" ADD COLUMN "canonicalUrl" TEXT;
ALTER TABLE "BlogPost" ADD COLUMN "openGraphImage" TEXT;
ALTER TABLE "BlogPost" ADD COLUMN "popularityScore" INTEGER NOT NULL DEFAULT 0;

UPDATE "UploadedFile"
SET "publicUrl" = COALESCE("publicUrl", '')
WHERE "publicUrl" IS NULL;

UPDATE "UploadedFile"
SET "purpose" = COALESCE("purpose", 'CONTENT_IMAGE')
WHERE "purpose" IS NULL;

ALTER TABLE "UploadedFile" ALTER COLUMN "publicUrl" SET NOT NULL;
ALTER TABLE "UploadedFile" ALTER COLUMN "purpose" SET NOT NULL;

CREATE INDEX "BlogPost_popularityScore_idx" ON "BlogPost"("popularityScore");
