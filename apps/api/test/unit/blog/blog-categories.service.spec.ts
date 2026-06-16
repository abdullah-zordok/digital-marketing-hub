import { BadRequestException, ConflictException } from '@nestjs/common';
import { ContentStatus } from '@prisma/client';

import { BlogCategoriesService } from '../../../src/modules/blog/blog-categories.service';
import { BlogRepository } from '../../../src/modules/blog/blog.repository';
import {
  blogCategoryRecord,
  blogPostRecord,
  InMemoryPrismaService,
} from '../../support/in-memory-prisma.service';

describe('blog category workflow', () => {
  let prismaService: InMemoryPrismaService;
  let blogCategoriesService: BlogCategoriesService;

  beforeEach(() => {
    prismaService = new InMemoryPrismaService();
    blogCategoriesService = new BlogCategoriesService(new BlogRepository(prismaService as never));
  });

  it('creates categories and rejects duplicate slugs', async () => {
    await blogCategoriesService.createCategory({ name: 'SEO', slug: 'seo' });

    await expect(blogCategoriesService.createCategory({ name: 'SEO Duplicate', slug: 'seo' })).rejects.toThrow(
      ConflictException,
    );
  });

  it('blocks deletion when published posts use the category', async () => {
    prismaService.addBlogCategory(blogCategoryRecord({ id: '20000000-0000-4000-8000-000000000001' }));
    prismaService.addBlogPost(
      blogPostRecord({
        categoryId: '20000000-0000-4000-8000-000000000001',
        status: ContentStatus.PUBLISHED,
      }),
    );

    await expect(blogCategoriesService.deleteCategory('20000000-0000-4000-8000-000000000001')).rejects.toThrow(
      BadRequestException,
    );
  });
});
