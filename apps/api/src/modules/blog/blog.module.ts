import { Module } from '@nestjs/common';

import { SeoMetadataService } from '../../common/services/seo-metadata.service';
import { CacheKeyService } from '../../common/services/cache-key.service';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { AdminBlogCategoriesController } from './admin-blog-categories.controller';
import { AdminBlogPostsController } from './admin-blog-posts.controller';
import { BlogCategoriesController } from './blog-categories.controller';
import { BlogCategoriesService } from './blog-categories.service';
import { BlogPostsController } from './blog-posts.controller';
import { BlogPostsService } from './blog-posts.service';
import { BlogRepository } from './blog.repository';

@Module({
  imports: [AuthModule, UsersModule],
  controllers: [
    AdminBlogCategoriesController,
    AdminBlogPostsController,
    BlogCategoriesController,
    BlogPostsController,
  ],
  providers: [BlogRepository, BlogCategoriesService, BlogPostsService, SeoMetadataService, CacheKeyService],
  exports: [BlogCategoriesService, BlogPostsService],
})
export class BlogModule {}
