import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ContentStatus } from '@prisma/client';

import { SeoMetadataService } from '../../common/services/seo-metadata.service';
import { ensureNotArchived, ensurePublishableContent, publishedAtFor } from '../../common/utils/content-status.util';
import { ensureValidSlug, normalizedSlug, normalizedTags } from '../../common/utils/slug.util';
import { BlogPostRecord, BlogPostResponse, blogPostResponseFor } from './blog.mapper';
import { BlogRepository } from './blog.repository';
import { BlogDiscoveryQueryDto } from './dto/blog-discovery-query.dto';
import { BlogPostWriteDto } from './dto/blog-post.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@Injectable()
export class BlogPostsService {
  constructor(
    private readonly blogRepository: BlogRepository,
    private readonly seoMetadataService: SeoMetadataService,
  ) {}

  async adminPosts(query: PaginationQueryDto & { status?: ContentStatus }): Promise<{ items: BlogPostResponse[]; meta: unknown }> {
    const postsPage = await this.blogRepository.adminPosts(query.page, query.limit, query.status);
    return { items: postsPage.items.map((post) => this.responseFor(post)), meta: postsPage.meta };
  }

  async publicPosts(query: BlogDiscoveryQueryDto): Promise<{ items: BlogPostResponse[]; meta: unknown }> {
    const postsPage = await this.blogRepository.publicPosts(query);
    return { items: postsPage.items.map((post) => this.responseFor(post)), meta: postsPage.meta };
  }

  async publicPostsByCategory(slug: string, query: PaginationQueryDto): Promise<{ items: BlogPostResponse[]; meta: unknown }> {
    const postsPage = await this.blogRepository.publicPostsByCategory(normalizedSlug(slug), query.page, query.limit);
    return { items: postsPage.items.map((post) => this.responseFor(post)), meta: postsPage.meta };
  }

  async publicPost(slug: string): Promise<BlogPostResponse> {
    const post = await this.blogRepository.publicPostBySlug(normalizedSlug(slug));
    return this.responseFor(this.requiredPost(post));
  }

  async adminPost(id: string): Promise<BlogPostResponse> {
    return this.responseFor(this.requiredPost(await this.blogRepository.postById(id)));
  }

  async createPost(postWriteDto: BlogPostWriteDto): Promise<BlogPostResponse> {
    const slug = await this.availableSlugFor(postWriteDto.slug);
    const tags = normalizedTags(postWriteDto.tags);
    return this.responseFor(await this.blogRepository.createPost(slug, tags, postWriteDto));
  }

  async updatePost(id: string, postWriteDto: BlogPostWriteDto): Promise<BlogPostResponse> {
    const currentPost = this.requiredPost(await this.blogRepository.postById(id));
    ensureNotArchived(currentPost.status);
    const slug = await this.availableSlugFor(postWriteDto.slug, id);
    const tags = normalizedTags(postWriteDto.tags);
    return this.responseFor(await this.blogRepository.updatePost(id, slug, tags, postWriteDto));
  }

  async publishPost(id: string): Promise<BlogPostResponse> {
    const post = this.requiredPost(await this.blogRepository.postById(id));
    ensurePublishableContent(Boolean(post.title && (post.content || post.excerpt)));
    const publishedAt = publishedAtFor(post.publishedAt);
    return this.responseFor(await this.blogRepository.changePostStatus(id, ContentStatus.PUBLISHED, publishedAt));
  }

  async unpublishPost(id: string): Promise<BlogPostResponse> {
    this.requiredPost(await this.blogRepository.postById(id));
    return this.responseFor(await this.blogRepository.changePostStatus(id, ContentStatus.DRAFT, null));
  }

  async deletePost(id: string): Promise<{ deleted: true }> {
    this.requiredPost(await this.blogRepository.postById(id));
    await this.blogRepository.deletePost(id);
    return { deleted: true };
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
