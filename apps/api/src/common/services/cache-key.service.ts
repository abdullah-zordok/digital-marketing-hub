import { createHash } from 'node:crypto';

import { Injectable } from '@nestjs/common';

@Injectable()
export class CacheKeyService {
  publicServices(query: Record<string, unknown>): string {
    return `public:services:list:${this.queryHash(query)}`;
  }

  publicService(slug: string): string {
    return `public:services:slug:${slug}`;
  }

  publicBlogPosts(query: Record<string, unknown>): string {
    return `public:blog:posts:${this.queryHash(query)}`;
  }

  publicBlogPost(slug: string): string {
    return `public:blog:post:${slug}`;
  }

  publicBlogCategoryPosts(slug: string, query: Record<string, unknown>): string {
    return `public:blog:category:${slug}:${this.queryHash(query)}`;
  }

  publicBlogCategories(): string {
    return 'public:blog:categories';
  }

  private queryHash(query: Record<string, unknown>): string {
    const sortedEntries = Object.entries(query).sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey));
    return createHash('sha256').update(JSON.stringify(sortedEntries)).digest('hex').slice(0, 16);
  }
}
