import { KnowledgeBaseStatus, KnowledgeSourceType, LeadSource } from '@prisma/client';

import { knowledgeBaseItemRecord, leadRecord } from './in-memory-prisma.service';

export function activeSeoKnowledge() {
  return knowledgeBaseItemRecord({
    title: 'SEO Strategy',
    slug: 'seo-strategy',
    content: 'SEO Strategy helps businesses improve organic visibility through technical audits, content planning, and reporting.',
    tags: ['seo', 'strategy'],
    sourceType: KnowledgeSourceType.SERVICE,
    status: KnowledgeBaseStatus.ACTIVE,
  });
}

export function archivedAdsKnowledge() {
  return knowledgeBaseItemRecord({
    title: 'Archived Ads Guidance',
    slug: 'archived-ads-guidance',
    content: 'Archived advertising guidance.',
    tags: ['ads'],
    sourceType: KnowledgeSourceType.GENERAL,
    status: KnowledgeBaseStatus.ARCHIVED,
  });
}

export function contactFormLead() {
  return leadRecord({
    email: 'lead@example.com',
    serviceInterest: 'SEO Strategy',
    source: LeadSource.CONTACT_FORM,
  });
}
