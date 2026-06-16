import { BadRequestException } from '@nestjs/common';
import { ContentStatus } from '@prisma/client';

export function publishedAtFor(currentPublishedAt: Date | null | undefined): Date {
  return currentPublishedAt ?? new Date();
}

export function ensurePublishableContent(hasVisibleBody: boolean): void {
  if (!hasVisibleBody) {
    throw new BadRequestException('Published content requires visible page content');
  }
}

export function ensureNotArchived(status: ContentStatus): void {
  if (status === ContentStatus.ARCHIVED) {
    throw new BadRequestException('Archived content cannot be changed through this action');
  }
}
