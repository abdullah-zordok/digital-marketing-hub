import { Controller, Get, Param, Query } from '@nestjs/common';

import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { BlogCategoryResponse, BlogPostResponse } from './blog.mapper';
import { BlogCategoriesService } from './blog-categories.service';
import { BlogPostsService } from './blog-posts.service';

@Controller('blog/categories')
export class BlogCategoriesController {
  constructor(
    private readonly blogCategoriesService: BlogCategoriesService,
    private readonly blogPostsService: BlogPostsService,
  ) {}

  @Get()
  async list(): Promise<{ message: string; payload: { items: BlogCategoryResponse[] } }> {
    return { message: 'Blog categories retrieved', payload: await this.blogCategoriesService.publicCategories() };
  }

  @Get(':slug/posts')
  async posts(@Param('slug') slug: string, @Query() query: PaginationQueryDto): Promise<{ message: string; payload: { items: BlogPostResponse[]; meta: unknown } }> {
    return { message: 'Blog category posts retrieved', payload: await this.blogPostsService.publicPostsByCategory(slug, query) };
  }
}
