import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { BlogPostResponse } from './blog.mapper';
import { BlogPostsService } from './blog-posts.service';
import { BlogDiscoveryQueryDto } from './dto/blog-discovery-query.dto';

@Controller('blog/posts')
@ApiTags('blog')
export class BlogPostsController {
  constructor(private readonly blogPostsService: BlogPostsService) {}

  @Get()
  @ApiOperation({ summary: 'List published blog posts' })
  async list(@Query() query: BlogDiscoveryQueryDto): Promise<{ message: string; payload: { items: BlogPostResponse[]; meta: unknown } }> {
    return { message: 'Published blog posts retrieved', payload: await this.blogPostsService.publicPosts(query) };
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Read a published blog post by slug' })
  async read(@Param('slug') slug: string): Promise<{ message: string; payload: BlogPostResponse }> {
    return { message: 'Published blog post retrieved', payload: await this.blogPostsService.publicPost(slug) };
  }
}
