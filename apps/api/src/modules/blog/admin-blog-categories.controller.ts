import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';

import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { BlogCategoryResponse } from './blog.mapper';
import { BlogCategoriesService } from './blog-categories.service';
import { BlogCategoryWriteDto } from './dto/blog-category.dto';

@Controller('admin/blog/categories')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.EDITOR)
export class AdminBlogCategoriesController {
  constructor(private readonly blogCategoriesService: BlogCategoriesService) {}

  @Get()
  async list(): Promise<{ message: string; payload: { items: BlogCategoryResponse[] } }> {
    return { message: 'Blog categories retrieved', payload: await this.blogCategoriesService.adminCategories() };
  }

  @Post()
  async create(@Body() categoryWriteDto: BlogCategoryWriteDto): Promise<{ message: string; payload: BlogCategoryResponse }> {
    return { message: 'Blog category created', payload: await this.blogCategoriesService.createCategory(categoryWriteDto) };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() categoryWriteDto: BlogCategoryWriteDto): Promise<{ message: string; payload: BlogCategoryResponse }> {
    return { message: 'Blog category updated', payload: await this.blogCategoriesService.updateCategory(id, categoryWriteDto) };
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<{ message: string; payload: { deleted: true } }> {
    return { message: 'Blog category deleted', payload: await this.blogCategoriesService.deleteCategory(id) };
  }
}
