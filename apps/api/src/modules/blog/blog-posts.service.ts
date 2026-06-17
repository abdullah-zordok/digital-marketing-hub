import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ContentStatus } from '@prisma/client';

import { CacheKeyService } from '../../common/services/cache-key.service';
import { SeoMetadataService } from '../../common/services/seo-metadata.service';
import { ensureNotArchived, ensurePublishableContent, publishedAtFor } from '../../common/utils/content-status.util';
import { ensureValidSlug, normalizedSlug, normalizedTags } from '../../common/utils/slug.util';
import { BlogPostRecord, BlogPostResponse, blogPostResponseFor } from './blog.mapper';
import { BlogRepository } from './blog.repository';
import { BlogDiscoveryQueryDto } from './dto/blog-discovery-query.dto';
import { BlogPostWriteDto } from './dto/blog-post.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CacheService } from '../../database/cache.service';

@Injectable()
export class BlogPostsService {
  constructor(
    private readonly blogRepository: BlogRepository,
    private readonly seoMetadataService: SeoMetadataService,
    private readonly cacheKeyService: CacheKeyService,
    private readonly cacheService: CacheService,
    private readonly configService: ConfigService,
  ) {}

  async adminPosts(query: PaginationQueryDto & { status?: ContentStatus }): Promise<{ items: BlogPostResponse[]; meta: unknown }> {
    const postsPage = await this.blogRepository.adminPosts(query.page, query.limit, query.status);
    return { items: postsPage.items.map((post) => this.responseFor(post)), meta: postsPage.meta };
  }

  async publicPosts(query: BlogDiscoveryQueryDto): Promise<{ items: BlogPostResponse[]; meta: unknown }> {
    return this.cachedPublicResponse(this.cacheKeyService.publicBlogPosts({ ...query }), async () => {
      const postsPage = await this.blogRepository.publicPosts(query);
      return { items: postsPage.items.map((post) => this.responseFor(post)), meta: postsPage.meta };
    });
  }

  async publicPostsByCategory(slug: string, query: PaginationQueryDto): Promise<{ items: BlogPostResponse[]; meta: unknown }> {
    const categorySlug = normalizedSlug(slug);
    return this.cachedPublicResponse(this.cacheKeyService.publicBlogCategoryPosts(categorySlug, { ...query }), async () => {
      const postsPage = await this.blogRepository.publicPostsByCategory(categorySlug, query.page, query.limit);
      return { items: postsPage.items.map((post) => this.responseFor(post)), meta: postsPage.meta };
    });
  }

  async publicPost(slug: string): Promise<BlogPostResponse> {
    const postSlug = normalizedSlug(slug);
    return this.cachedPublicResponse(this.cacheKeyService.publicBlogPost(postSlug), async () => {
      const post = await this.blogRepository.publicPostBySlug(postSlug);
      return this.responseFor(this.requiredPost(post));
    });
  }

  async adminPost(id: string): Promise<BlogPostResponse> {
    return this.responseFor(this.requiredPost(await this.blogRepository.postById(id)));
  }

  async createPost(postWriteDto: BlogPostWriteDto): Promise<BlogPostResponse> {
    const slug = await this.availableSlugFor(postWriteDto.slug);
    const tags = normalizedTags(postWriteDto.tags);
    const post = await this.blogRepository.createPost(slug, tags, postWriteDto);
    await this.invalidatePublicCache();
    return this.responseFor(post);
  }

  async updatePost(id: string, postWriteDto: BlogPostWriteDto): Promise<BlogPostResponse> {
    const currentPost = this.requiredPost(await this.blogRepository.postById(id));
    ensureNotArchived(currentPost.status);
    const slug = await this.availableSlugFor(postWriteDto.slug, id);
    const tags = normalizedTags(postWriteDto.tags);
    const post = await this.blogRepository.updatePost(id, slug, tags, postWriteDto);
    await this.invalidatePublicCache();
    return this.responseFor(post);
  }

  async publishPost(id: string): Promise<BlogPostResponse> {
    const currentPost = this.requiredPost(await this.blogRepository.postById(id));
    ensurePublishableContent(Boolean(currentPost.title && (currentPost.content || currentPost.excerpt)));
    const publishedAt = publishedAtFor(currentPost.publishedAt);
    const post = await this.blogRepository.changePostStatus(id, ContentStatus.PUBLISHED, publishedAt);
    await this.invalidatePublicCache();
    return this.responseFor(post);
  }

  async unpublishPost(id: string): Promise<BlogPostResponse> {
    this.requiredPost(await this.blogRepository.postById(id));
    const post = await this.blogRepository.changePostStatus(id, ContentStatus.DRAFT, null);
    await this.invalidatePublicCache();
    return this.responseFor(post);
  }

  async deletePost(id: string): Promise<{ deleted: true }> {
    this.requiredPost(await this.blogRepository.postById(id));
    await this.blogRepository.deletePost(id);
    await this.invalidatePublicCache();
    return { deleted: true };
  }

  private async cachedPublicResponse<TPublicResponse>(cacheKey: string, responseFactory: () => Promise<TPublicResponse>): Promise<TPublicResponse> {
    const cachedResponse = await this.cacheService.getJson<TPublicResponse>(cacheKey);
    if (cachedResponse) {
      return cachedResponse;
    }

    const publicResponse = await responseFactory();
    await this.cacheService.setJson(cacheKey, publicResponse, this.publicContentTtlSeconds());
    return publicResponse;
  }

  private async invalidatePublicCache(): Promise<void> {
    await this.cacheService.deleteByPrefix('public:blog:');
  }

  private publicContentTtlSeconds(): number {
    return Number(this.configService.get('PUBLIC_CONTENT_CACHE_TTL_SECONDS') ?? 300);
  }

  private async availableSlugFor(slug: string, excludedId?: string): Promise<string> {
    const postSlug = normalizedSlug(slug);
    ensureValidSlug(postSlug);

    if (await this.blogRepository.postBySlug(postSlug, excludedId)) {
      throw new ConflictException('Blog post slug is already in use');
    }

    return postSlug;
  }

  private requiredPost(post: BlogPostRecord | null): BlogPostRecord {
    if (!post) {
      throw new NotFoundException('Blog post was not found');
    }

    return post;
  }

  private responseFor(post: BlogPostRecord): BlogPostResponse {
    const seo = this.seoMetadataService.metadataFor({
      title: post.title,
      description: post.excerpt ?? post.content,
      canonicalPath: `/blog/posts/${post.slug}`,
      image: post.coverImage,
      seoTitle: post.seoTitle,
      seoDescription: post.seoDescription,
      canonicalUrl: post.canonicalUrl,
      openGraphImage: post.openGraphImage,
    });

    return blogPostResponseFor(post, seo);
  }
}
