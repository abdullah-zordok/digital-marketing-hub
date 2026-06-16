import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ContentStatus, UserRole } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { BlogPostResponse } from './blog.mapper';
import { BlogPostsService } from './blog-posts.service';
import { BlogPostWriteDto } from './dto/blog-post.dto';

class AdminBlogPostQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus;
}

@Controller('admin/blog/posts')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.EDITOR)
export class AdminBlogPostsController {
  constructor(private readonly blogPostsService: BlogPostsService) {}

  @Get()
  async list(@Query() query: AdminBlogPostQueryDto): Promise<{ message: string; payload: { items: BlogPostResponse[]; meta: unknown } }> {
    return { message: 'Blog posts retrieved', payload: await this.blogPostsService.adminPosts(query) };
  }

  @Post()
  async create(@Body() postWriteDto: BlogPostWriteDto): Promise<{ message: string; payload: BlogPostResponse }> {
    return { message: 'Blog post created', payload: await this.blogPostsService.createPost(postWriteDto) };
  }

  @Get(':id')
  async read(@Param('id') id: string): Promise<{ message: string; payload: BlogPostResponse }> {
    return { message: 'Blog post retrieved', payload: await this.blogPostsService.adminPost(id) };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() postWriteDto: BlogPostWriteDto): Promise<{ message: string; payload: BlogPostResponse }> {
    return { message: 'Blog post updated', payload: await this.blogPostsService.updatePost(id, postWriteDto) };
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<{ message: string; payload: { deleted: true } }> {
    return { message: 'Blog post deleted', payload: await this.blogPostsService.deletePost(id) };
  }

  @Patch(':id/publish')
  async publish(@Param('id') id: string): Promise<{ message: string; payload: BlogPostResponse }> {
    return { message: 'Blog post published', payload: await this.blogPostsService.publishPost(id) };
  }

  @Patch(':id/unpublish')
  async unpublish(@Param('id') id: string): Promise<{ message: string; payload: BlogPostResponse }> {
    return { message: 'Blog post unpublished', payload: await this.blogPostsService.unpublishPost(id) };
  }
}
