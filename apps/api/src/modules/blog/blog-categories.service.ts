import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';

import { ensureValidSlug, normalizedSlug } from '../../common/utils/slug.util';
import { BlogCategoryResponse, BlogCategoryRecord, blogCategoryResponseFor } from './blog.mapper';
import { BlogRepository } from './blog.repository';
import { BlogCategoryWriteDto } from './dto/blog-category.dto';

@Injectable()
export class BlogCategoriesService {
  constructor(private readonly blogRepository: BlogRepository) {}

  async adminCategories(): Promise<{ items: BlogCategoryResponse[] }> {
    const categories = await this.blogRepository.adminCategories();
    return { items: categories.map(blogCategoryResponseFor) };
  }

  async publicCategories(): Promise<{ items: BlogCategoryResponse[] }> {
    const categories = await this.blogRepository.publicCategories();
    return { items: categories.map(blogCategoryResponseFor) };
  }

  async createCategory(categoryWriteDto: BlogCategoryWriteDto): Promise<BlogCategoryResponse> {
    const slug = await this.availableSlugFor(categoryWriteDto.slug);
    return blogCategoryResponseFor(await this.blogRepository.createCategory(slug, categoryWriteDto));
  }

  async updateCategory(id: string, categoryWriteDto: BlogCategoryWriteDto): Promise<BlogCategoryResponse> {
    this.requiredCategory(await this.blogRepository.categoryById(id));
    const slug = await this.availableSlugFor(categoryWriteDto.slug, id);
    return blogCategoryResponseFor(await this.blogRepository.updateCategory(id, slug, categoryWriteDto));
  }

  async deleteCategory(id: string): Promise<{ deleted: true }> {
    this.requiredCategory(await this.blogRepository.categoryById(id));

    if ((await this.blogRepository.publishedPostCountForCategory(id)) > 0) {
      throw new BadRequestException('Category with published posts cannot be deleted');
    }

    await this.blogRepository.deleteCategory(id);
    return { deleted: true };
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
