import { ContentStatus } from '@prisma/client';

import { SeoMetadata } from '../../common/services/seo-metadata.service';

interface ServiceRecord {
  id: string;
  name: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  fullDescription: string | null;
  icon: string | null;
  coverImage: string | null;
  benefits: unknown;
  processSteps: unknown;
  targetAudience: unknown;
  expectedResults: unknown;
  faqs: unknown;
  status: ContentStatus;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ServiceResponse {
  id: string;
  name: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  fullDescription: string | null;
  icon: string | null;
  coverImage: string | null;
  benefits: unknown;
  processSteps: unknown;
  targetAudience: unknown;
  expectedResults: unknown;
  faqs: unknown;
  status: ContentStatus;
  sortOrder: number;
  seo: SeoMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export function serviceResponseFor(service: ServiceRecord, seo: SeoMetadata): ServiceResponse {
  return {
    id: service.id,
    name: service.name,
    title: service.title,
    slug: service.slug,
    shortDescription: service.shortDescription,
    fullDescription: service.fullDescription,
    icon: service.icon,
    coverImage: service.coverImage,
    benefits: service.benefits ?? [],
    processSteps: service.processSteps ?? [],
    targetAudience: service.targetAudience ?? [],
    expectedResults: service.expectedResults ?? [],
    faqs: service.faqs ?? [],
    status: service.status,
    sortOrder: service.sortOrder,
    seo,
    createdAt: service.createdAt,
    updatedAt: service.updatedAt,
  };
}
