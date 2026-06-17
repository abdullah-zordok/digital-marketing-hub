import { ConflictException } from '@nestjs/common';
import { ContentStatus } from '@prisma/client';

import { ConfigService } from '@nestjs/config';

import { CacheKeyService } from '../../../src/common/services/cache-key.service';
import { SeoMetadataService } from '../../../src/common/services/seo-metadata.service';
import { BlogPostsService } from '../../../src/modules/blog/blog-posts.service';
import { BlogRepository } from '../../../src/modules/blog/blog.repository';
import { InMemoryPrismaService } from '../../support/in-memory-prisma.service';

describe('blog post workflow', () => {
  let blogPostsService: BlogPostsService;

  beforeEach(() => {
    const prismaService = new InMemoryPrismaService();
    blogPostsService = new BlogPostsService(
      new BlogRepository(prismaService as never),
      new SeoMetadataService(),
      new CacheKeyService(),
      cacheServiceMock(),
      new ConfigService({ PUBLIC_CONTENT_CACHE_TTL_SECONDS: 300 }),
    );
  });

  it('normalizes tags and prevents duplicate slugs', async () => {
    const post = await blogPostsService.createPost({
      title: 'SEO Playbook',
      slug: 'seo-playbook',
      content: 'SEO content',
      tags: ['SEO', 'strategy', 'seo'],
    });

    expect(post.tags).toEqual(['seo', 'strategy']);
    await expect(
      blogPostsService.createPost({ title: 'Duplicate', slug: 'seo-playbook', content: 'Copy' }),
    ).rejects.toThrow(ConflictException);
  });

  it('publishes and unpublishes posts', async () => {
    const post = await blogPostsService.createPost({
      title: 'SEO Playbook',
      slug: 'seo-playbook',
      excerpt: 'SEO excerpt',
    });

    expect((await blogPostsService.publishPost(post.id)).status).toBe(ContentStatus.PUBLISHED);
    await expect(blogPostsService.publicPost('seo-playbook')).resolves.toMatchObject({
      slug: 'seo-playbook',
    });
    expect((await blogPostsService.unpublishPost(post.id)).status).toBe(ContentStatus.DRAFT);
  });
});

function cacheServiceMock(): any {
  return {
    getJson: jest.fn(async () => null),
    setJson: jest.fn(async () => undefined),
    deleteByPrefix: jest.fn(async () => undefined),
  };
}
