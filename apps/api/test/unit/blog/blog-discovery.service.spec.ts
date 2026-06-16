import { ContentStatus } from '@prisma/client';

import { SeoMetadataService } from '../../../src/common/services/seo-metadata.service';
import { BlogPostsService } from '../../../src/modules/blog/blog-posts.service';
import { BlogRepository } from '../../../src/modules/blog/blog.repository';
import { BlogSortOption } from '../../../src/modules/blog/dto/blog-discovery-query.dto';
import {
  blogCategoryRecord,
  blogPostRecord,
  InMemoryPrismaService,
} from '../../support/in-memory-prisma.service';

describe('blog discovery workflow', () => {
  it('filters published posts by category, tag, search, and popularity', async () => {
    const prismaService = new InMemoryPrismaService();
    const blogPostsService = new BlogPostsService(
      new BlogRepository(prismaService as never),
      new SeoMetadataService(),
    );

    prismaService.addBlogCategory(blogCategoryRecord({ id: '20000000-0000-4000-8000-000000000001', slug: 'seo' }));
    prismaService.addBlogPost(blogPostRecord({ title: 'SEO Guide', slug: 'seo-guide', categoryId: '20000000-0000-4000-8000-000000000001', tags: ['seo'], status: ContentStatus.PUBLISHED, popularityScore: 10 }));
    prismaService.addBlogPost(blogPostRecord({ title: 'Draft SEO', slug: 'draft-seo', tags: ['seo'], status: ContentStatus.DRAFT, popularityScore: 99 }));

    const postsPage = await blogPostsService.publicPosts({
      page: 1,
      limit: 10,
      category: 'seo',
      tag: 'seo',
      search: 'SEO',
      sort: BlogSortOption.POPULAR,
    });

    expect(postsPage.items).toHaveLength(1);
    expect(postsPage.items[0]).toMatchObject({ slug: 'seo-guide' });
  });
});
