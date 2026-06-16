import { ContentStatus } from '@prisma/client';

import { SeoMetadata } from '../../common/services/seo-metadata.service';

export interface BlogCategoryRecord {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface BlogPostRecord {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  coverImage: string | null;
  authorId: string | null;
  categoryId: string | null;
  tags: string[];
  status: ContentStatus;
  publishedAt: Date | null;
  seoTitle: string | null;
  seoDescription: string | null;
  canonicalUrl: string | null;
  openGraphImage: string | null;
  readingTime: number | null;
  popularityScore: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  category?: BlogCategoryRecord | null;
}

export interface BlogCategoryResponse {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface BlogPostResponse {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  coverImage: string | null;
  authorId: string | null;
  category: BlogCategoryResponse | null;
  tags: string[];
  status: ContentStatus;
  publishedAt: Date | null;
  readingTime: number | null;
  seo: SeoMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export function blogCategoryResponseFor(category: BlogCategoryRecord): BlogCategoryResponse {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  };
}

export function blogPostResponseFor(post: BlogPostRecord, seo: SeoMetadata): BlogPostResponse {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    coverImage: post.coverImage,
    authorId: post.authorId,
    category: post.category ? blogCategoryResponseFor(post.category) : null,
    tags: post.tags,
    status: post.status,
    publishedAt: post.publishedAt,
    readingTime: post.readingTime,
    seo,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
  };
}
