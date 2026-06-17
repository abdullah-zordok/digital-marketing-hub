import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { CacheKeyService } from '../../common/services/cache-key.service';
import { ensureValidSlug, normalizedSlug } from '../../common/utils/slug.util';
import { CacheService } from '../../database/cache.service';
import { BlogCategoryResponse, BlogCategoryRecord, blogCategoryResponseFor } from './blog.mapper';
import { BlogRepository } from './blog.repository';
import { BlogCategoryWriteDto } from './dto/blog-category.dto';

@Injectable()
export class BlogCategoriesService {
  constructor(
    private readonly blogRepository: BlogRepository,
    private readonly cacheKeyService: CacheKeyService,
    private readonly cacheService: CacheService,
    private readonly configService: ConfigService,
  ) {}

  async adminCategories(): Promise<{ items: BlogCategoryResponse[] }> {
    const categories = await this.blogRepository.adminCategories();
    return { items: categories.map(blogCategoryResponseFor) };
  }

  async publicCategories(): Promise<{ items: BlogCategoryResponse[] }> {
    const cacheKey = this.cacheKeyService.publicBlogCategories();
    const cachedCategories = await this.cacheService.getJson<{ items: BlogCategoryResponse[] }>(cacheKey);
    if (cachedCategories) {
      return cachedCategories;
    }

    const categories = await this.blogRepository.publicCategories();
    const publicCategories = { items: categories.map(blogCategoryResponseFor) };
    await this.cacheService.setJson(cacheKey, publicCategories, this.publicContentTtlSeconds());
    return publicCategories;
  }

  async createCategory(categoryWriteDto: BlogCategoryWriteDto): Promise<BlogCategoryResponse> {
    const slug = await this.availableSlugFor(categoryWriteDto.slug);
    const category = await this.blogRepository.createCategory(slug, categoryWriteDto);
    await this.invalidatePublicCache();
    return blogCategoryResponseFor(category);
  }

  async updateCategory(id: string, categoryWriteDto: BlogCategoryWriteDto): Promise<BlogCategoryResponse> {
    this.requiredCategory(await this.blogRepository.categoryById(id));
    const slug = await this.availableSlugFor(categoryWriteDto.slug, id);
    const category = await this.blogRepository.updateCategory(id, slug, categoryWriteDto);
    await this.invalidatePublicCache();
    return blogCategoryResponseFor(category);
  }

  async deleteCategory(id: string): Promise<{ deleted: true }> {
    this.requiredCategory(await this.blogRepository.categoryById(id));

    if ((await this.blogRepository.publishedPostCountForCategory(id)) > 0) {
      throw new BadRequestException('Category with published posts cannot be deleted');
    }

    await this.blogRepository.deleteCategory(id);
    await this.invalidatePublicCache();
    return { deleted: true };
  }

  private async invalidatePublicCache(): Promise<void> {
    await this.cacheService.deleteByPrefix('public:blog:');
  }

  private publicContentTtlSeconds(): number {
    return Number(this.configService.get('PUBLIC_CONTENT_CACHE_TTL_SECONDS') ?? 300);
  }

  private async availableSlugFor(slug: string, excludedId?: string): Promise<string> {
    const categorySlug = normalizedSlug(slug);
    ensureValidSlug(categorySlug);

    if (await this.blogRepository.categoryBySlug(categorySlug, excludedId)) {
      throw new ConflictException('Blog category slug is already in use');
    }

    return categorySlug;
  }

  private requiredCategory(category: BlogCategoryRecord | null): BlogCategoryRecord {
    if (!category) {
      throw new NotFoundException('Blog category was not found');
    }

    return category;
  }
}
