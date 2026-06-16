import { Injectable } from '@nestjs/common';
import { ContentStatus } from '@prisma/client';

import { offsetFor, PaginatedRecords, paginatedRecords } from '../../common/utils/pagination.util';
import { PrismaService } from '../../database/prisma.service';
import { BlogCategoryWriteDto } from './dto/blog-category.dto';
import { BlogDiscoveryQueryDto, BlogSortOption } from './dto/blog-discovery-query.dto';
import { BlogPostWriteDto } from './dto/blog-post.dto';
import { BlogCategoryRecord, BlogPostRecord } from './blog.mapper';

interface BlogCategoryModel {
  findFirst(query: Record<string, unknown>): Promise<BlogCategoryRecord | null>;
  findMany(query: Record<string, unknown>): Promise<BlogCategoryRecord[]>;
  count(query: Record<string, unknown>): Promise<number>;
  create(query: Record<string, unknown>): Promise<BlogCategoryRecord>;
  update(query: Record<string, unknown>): Promise<BlogCategoryRecord>;
}

interface BlogPostModel {
  findFirst(query: Record<string, unknown>): Promise<BlogPostRecord | null>;
  findMany(query: Record<string, unknown>): Promise<BlogPostRecord[]>;
  count(query: Record<string, unknown>): Promise<number>;
  create(query: Record<string, unknown>): Promise<BlogPostRecord>;
  update(query: Record<string, unknown>): Promise<BlogPostRecord>;
}

@Injectable()
export class BlogRepository {
  private readonly categories: BlogCategoryModel;
  private readonly posts: BlogPostModel;

  constructor(prismaService: PrismaService) {
    this.categories = prismaService.blogCategory as unknown as BlogCategoryModel;
    this.posts = prismaService.blogPost as unknown as BlogPostModel;
  }

  async createCategory(slug: string, categoryWriteDto: BlogCategoryWriteDto): Promise<BlogCategoryRecord> {
    return this.categories.create({ data: { ...categoryWriteDto, slug } });
  }

  async updateCategory(id: string, slug: string, categoryWriteDto: BlogCategoryWriteDto): Promise<BlogCategoryRecord> {
    return this.categories.update({ where: { id }, data: { ...categoryWriteDto, slug } });
  }

  async categoryById(id: string): Promise<BlogCategoryRecord | null> {
    return this.categories.findFirst({ where: { id, deletedAt: null } });
  }

  async categoryBySlug(slug: string, excludedId?: string): Promise<BlogCategoryRecord | null> {
    const where = excludedId ? { slug, deletedAt: null, NOT: { id: excludedId } } : { slug, deletedAt: null };
    return this.categories.findFirst({ where });
  }

  async adminCategories(): Promise<BlogCategoryRecord[]> {
    return this.categories.findMany({ where: { deletedAt: null }, orderBy: { name: 'asc' } });
  }

  async publicCategories(): Promise<BlogCategoryRecord[]> {
    return this.categories.findMany({
      where: { deletedAt: null, posts: { some: this.publicPostWhereClause() } },
      orderBy: { name: 'asc' },
    });
  }

  async deleteCategory(id: string): Promise<BlogCategoryRecord> {
    return this.categories.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  async publishedPostCountForCategory(id: string): Promise<number> {
    return this.posts.count({ where: { ...this.publicPostWhereClause(), categoryId: id } });
  }

  async createPost(slug: string, tags: string[], postWriteDto: BlogPostWriteDto): Promise<BlogPostRecord> {
    return this.posts.create({
      data: { ...postWriteDto, slug, tags, status: ContentStatus.DRAFT },
      include: { category: true },
    });
  }

  async updatePost(id: string, slug: string, tags: string[], postWriteDto: BlogPostWriteDto): Promise<BlogPostRecord> {
    return this.posts.update({ where: { id }, data: { ...postWriteDto, slug, tags }, include: { category: true } });
  }

  async postById(id: string): Promise<BlogPostRecord | null> {
    return this.posts.findFirst({ where: { id, deletedAt: null }, include: { category: true } });
  }

  async postBySlug(slug: string, excludedId?: string): Promise<BlogPostRecord | null> {
    const where = excludedId ? { slug, deletedAt: null, NOT: { id: excludedId } } : { slug, deletedAt: null };
    return this.posts.findFirst({ where, include: { category: true } });
  }

  async publicPostBySlug(slug: string): Promise<BlogPostRecord | null> {
    return this.posts.findFirst({
      where: { ...this.publicPostWhereClause(), slug },
      include: { category: true },
    });
  }

  async adminPosts(page: number, limit: number, status?: ContentStatus): Promise<PaginatedRecords<BlogPostRecord>> {
    const where = status ? { deletedAt: null, status } : { deletedAt: null };
    return this.postPageFor(where, page, limit, [{ createdAt: 'desc' }]);
  }

  async publicPosts(query: BlogDiscoveryQueryDto): Promise<PaginatedRecords<BlogPostRecord>> {
    return this.postPageFor(
      this.discoveryWhereClause(query),
      query.page,
      query.limit,
      this.orderByFor(query.sort),
    );
  }

  async publicPostsByCategory(slug: string, page: number, limit: number): Promise<PaginatedRecords<BlogPostRecord>> {
    const where = { ...this.publicPostWhereClause(), category: { slug, deletedAt: null } };
    return this.postPageFor(where, page, limit, this.orderByFor(BlogSortOption.NEWEST));
  }

  async changePostStatus(id: string, status: ContentStatus, publishedAt?: Date | null): Promise<BlogPostRecord> {
    return this.posts.update({ where: { id }, data: { status, publishedAt }, include: { category: true } });
  }

  async deletePost(id: string): Promise<BlogPostRecord> {
    return this.posts.update({ where: { id }, data: { deletedAt: new Date() }, include: { category: true } });
  }

  private async postPageFor(
    where: Record<string, unknown>,
    page: number,
    limit: number,
    orderBy: Record<string, string>[],
  ): Promise<PaginatedRecords<BlogPostRecord>> {
    const [items, totalItems] = await Promise.all([
      this.posts.findMany({
        where,
        orderBy,
        include: { category: true },
        skip: offsetFor(page, limit),
        take: limit,
      }),
      this.posts.count({ where }),
    ]);

    return paginatedRecords(items, page, limit, totalItems);
  }

  private discoveryWhereClause(query: BlogDiscoveryQueryDto): Record<string, unknown> {
    const where: Record<string, unknown> = this.publicPostWhereClause();

    if (query.search) {
      where.OR = this.searchClausesFor(query.search);
    }

    if (query.category) {
      where.category = { slug: query.category, deletedAt: null };
    }

    if (query.tag) {
      where.tags = { has: query.tag.trim().toLowerCase() };
    }

    return where;
  }

  private searchClausesFor(search: string): Record<string, unknown>[] {
    const contains = search.trim();
    return [
      { title: { contains, mode: 'insensitive' } },
      { excerpt: { contains, mode: 'insensitive' } },
      { content: { contains, mode: 'insensitive' } },
      { tags: { has: contains.toLowerCase() } },
    ];
  }

  private orderByFor(sort: BlogSortOption): Record<string, string>[] {
    if (sort === BlogSortOption.OLDEST) {
      return [{ publishedAt: 'asc' }, { createdAt: 'asc' }];
    }

    if (sort === BlogSortOption.POPULAR) {
      return [{ popularityScore: 'desc' }, { publishedAt: 'desc' }];
    }

    return [{ publishedAt: 'desc' }, { createdAt: 'desc' }];
  }

  private publicPostWhereClause(): Record<string, unknown> {
    return { status: ContentStatus.PUBLISHED, deletedAt: null };
  }
}
