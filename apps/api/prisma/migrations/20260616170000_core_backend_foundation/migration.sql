CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'EDITOR', 'VIEWER');
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'DISABLED');
CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
CREATE TYPE "KnowledgeBaseStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');
CREATE TYPE "KnowledgeSourceType" AS ENUM ('SERVICE', 'FAQ', 'POLICY', 'GENERAL', 'BLOG');
CREATE TYPE "LeadSource" AS ENUM ('CHATBOT', 'CONTACT_FORM', 'SERVICE_PAGE', 'BLOG_PAGE', 'MANUAL');
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL_SENT', 'WON', 'LOST');
CREATE TYPE "ChatSessionStatus" AS ENUM ('OPEN', 'CLOSED');
CREATE TYPE "ChatMessageRole" AS ENUM ('USER', 'ASSISTANT', 'SYSTEM', 'TOOL');

CREATE TABLE "User" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "email" TEXT NOT NULL,
  "name" TEXT,
  "passwordHash" TEXT NOT NULL,
  "role" "UserRole" NOT NULL,
  "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
  "tokenVersion" INTEGER NOT NULL DEFAULT 0,
  "lastLoginAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Service" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "name" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "shortDescription" TEXT,
  "fullDescription" TEXT,
  "icon" TEXT,
  "coverImage" TEXT,
  "benefits" JSONB,
  "processSteps" JSONB,
  "targetAudience" JSONB,
  "expectedResults" JSONB,
  "faqs" JSONB,
  "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "seoTitle" TEXT,
  "seoDescription" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BlogCategory" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "BlogCategory_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BlogPost" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "excerpt" TEXT,
  "content" TEXT,
  "coverImage" TEXT,
  "authorId" UUID,
  "categoryId" UUID,
  "tags" TEXT[],
  "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
  "publishedAt" TIMESTAMP(3),
  "seoTitle" TEXT,
  "seoDescription" TEXT,
  "readingTime" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "BlogPost_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Lead" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "name" TEXT,
  "email" TEXT,
  "phone" TEXT,
  "companyName" TEXT,
  "serviceInterest" TEXT,
  "budgetRange" TEXT,
  "message" TEXT,
  "source" "LeadSource" NOT NULL,
  "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
  "assignedTo" UUID,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ChatSession" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "visitorId" TEXT,
  "leadId" UUID,
  "status" "ChatSessionStatus" NOT NULL DEFAULT 'OPEN',
  "sourcePage" TEXT,
  "userAgent" TEXT,
  "ipAddress" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "ChatSession_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ChatMessage" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "sessionId" UUID NOT NULL,
  "role" "ChatMessageRole" NOT NULL,
  "content" TEXT NOT NULL,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "KnowledgeBaseItem" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "category" TEXT,
  "tags" TEXT[],
  "sourceType" "KnowledgeSourceType" NOT NULL,
  "status" "KnowledgeBaseStatus" NOT NULL DEFAULT 'DRAFT',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "KnowledgeBaseItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SiteSetting" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "key" TEXT NOT NULL,
  "value" JSONB NOT NULL,
  "isPublic" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "SiteSetting_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "UploadedFile" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "filename" TEXT NOT NULL,
  "originalName" TEXT NOT NULL,
  "storageDriver" TEXT NOT NULL,
  "storagePath" TEXT NOT NULL,
  "publicUrl" TEXT,
  "mimeType" TEXT NOT NULL,
  "sizeBytes" INTEGER NOT NULL,
  "purpose" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "UploadedFile_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Service_slug_key" ON "Service"("slug");
CREATE UNIQUE INDEX "BlogCategory_slug_key" ON "BlogCategory"("slug");
CREATE UNIQUE INDEX "BlogPost_slug_key" ON "BlogPost"("slug");
CREATE UNIQUE INDEX "KnowledgeBaseItem_slug_key" ON "KnowledgeBaseItem"("slug");
CREATE UNIQUE INDEX "SiteSetting_key_key" ON "SiteSetting"("key");

CREATE INDEX "User_role_idx" ON "User"("role");
CREATE INDEX "User_status_idx" ON "User"("status");
CREATE INDEX "User_deletedAt_idx" ON "User"("deletedAt");
CREATE INDEX "Service_status_idx" ON "Service"("status");
CREATE INDEX "Service_sortOrder_idx" ON "Service"("sortOrder");
CREATE INDEX "Service_createdAt_idx" ON "Service"("createdAt");
CREATE INDEX "Service_deletedAt_idx" ON "Service"("deletedAt");
CREATE INDEX "BlogCategory_deletedAt_idx" ON "BlogCategory"("deletedAt");
CREATE INDEX "BlogPost_status_idx" ON "BlogPost"("status");
CREATE INDEX "BlogPost_publishedAt_idx" ON "BlogPost"("publishedAt");
CREATE INDEX "BlogPost_createdAt_idx" ON "BlogPost"("createdAt");
CREATE INDEX "BlogPost_categoryId_idx" ON "BlogPost"("categoryId");
CREATE INDEX "BlogPost_authorId_idx" ON "BlogPost"("authorId");
CREATE INDEX "BlogPost_deletedAt_idx" ON "BlogPost"("deletedAt");
CREATE INDEX "Lead_source_idx" ON "Lead"("source");
CREATE INDEX "Lead_status_idx" ON "Lead"("status");
CREATE INDEX "Lead_createdAt_idx" ON "Lead"("createdAt");
CREATE INDEX "Lead_assignedTo_idx" ON "Lead"("assignedTo");
CREATE INDEX "Lead_deletedAt_idx" ON "Lead"("deletedAt");
CREATE INDEX "ChatSession_visitorId_idx" ON "ChatSession"("visitorId");
CREATE INDEX "ChatSession_leadId_idx" ON "ChatSession"("leadId");
CREATE INDEX "ChatSession_status_idx" ON "ChatSession"("status");
CREATE INDEX "ChatSession_createdAt_idx" ON "ChatSession"("createdAt");
CREATE INDEX "ChatSession_deletedAt_idx" ON "ChatSession"("deletedAt");
CREATE INDEX "ChatMessage_sessionId_idx" ON "ChatMessage"("sessionId");
CREATE INDEX "ChatMessage_role_idx" ON "ChatMessage"("role");
CREATE INDEX "ChatMessage_createdAt_idx" ON "ChatMessage"("createdAt");
CREATE INDEX "KnowledgeBaseItem_category_idx" ON "KnowledgeBaseItem"("category");
CREATE INDEX "KnowledgeBaseItem_sourceType_idx" ON "KnowledgeBaseItem"("sourceType");
CREATE INDEX "KnowledgeBaseItem_status_idx" ON "KnowledgeBaseItem"("status");
CREATE INDEX "KnowledgeBaseItem_createdAt_idx" ON "KnowledgeBaseItem"("createdAt");
CREATE INDEX "KnowledgeBaseItem_deletedAt_idx" ON "KnowledgeBaseItem"("deletedAt");
CREATE INDEX "SiteSetting_isPublic_idx" ON "SiteSetting"("isPublic");
CREATE INDEX "SiteSetting_deletedAt_idx" ON "SiteSetting"("deletedAt");
CREATE INDEX "UploadedFile_mimeType_idx" ON "UploadedFile"("mimeType");
CREATE INDEX "UploadedFile_purpose_idx" ON "UploadedFile"("purpose");
CREATE INDEX "UploadedFile_createdAt_idx" ON "UploadedFile"("createdAt");
CREATE INDEX "UploadedFile_deletedAt_idx" ON "UploadedFile"("deletedAt");

ALTER TABLE "BlogPost" ADD CONSTRAINT "BlogPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "BlogPost" ADD CONSTRAINT "BlogPost_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "BlogCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ChatSession" ADD CONSTRAINT "ChatSession_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ChatSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
