import { BadRequestException } from '@nestjs/common';

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function normalizedSlug(slug: string): string {
  return slug.trim().toLowerCase();
}

export function ensureValidSlug(slug: string): void {
  if (!SLUG_PATTERN.test(slug)) {
    throw new BadRequestException('Slug must use lowercase letters, numbers, and hyphens');
  }
}

export function normalizedTags(tags: string[] | undefined): string[] {
  const uniqueTags = new Set((tags ?? []).map((tag) => tag.trim().toLowerCase()).filter(Boolean));
  return [...uniqueTags].sort();
}
