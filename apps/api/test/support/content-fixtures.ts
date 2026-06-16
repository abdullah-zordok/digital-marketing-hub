import { ContentStatus } from '@prisma/client';

import { blogCategoryRecord, blogPostRecord, serviceRecord } from './in-memory-prisma.service';

export function publishedService(slug = 'seo-strategy') {
  return serviceRecord({
    id: `10000000-0000-4000-8000-${slug === 'seo-strategy' ? '000000000001' : '000000000002'}`,
    slug,
    title: slug === 'seo-strategy' ? 'SEO Strategy' : 'Paid Advertising',
    status: ContentStatus.PUBLISHED,
    sortOrder: slug === 'seo-strategy' ? 1 : 2,
  });
}

export function publishedCategory() {
  return blogCategoryRecord({
    id: '20000000-0000-4000-8000-000000000001',
    name: 'SEO',
    slug: 'seo',
  });
}

export function publishedBlogPost(index = 1) {
  return blogPostRecord({
    id: `30000000-0000-4000-8000-${String(index).padStart(12, '0')}`,
    title: `SEO Playbook ${index}`,
    slug: `seo-playbook-${index}`,
    categoryId: '20000000-0000-4000-8000-000000000001',
    tags: ['seo', 'strategy'],
    status: ContentStatus.PUBLISHED,
    publishedAt: new Date(Date.UTC(2026, 0, index)),
    popularityScore: 100 - index,
  });
}
