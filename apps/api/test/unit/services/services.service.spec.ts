import { ConflictException } from '@nestjs/common';
import { ContentStatus } from '@prisma/client';

import { ConfigService } from '@nestjs/config';

import { CacheKeyService } from '../../../src/common/services/cache-key.service';
import { SeoMetadataService } from '../../../src/common/services/seo-metadata.service';
import { ServicesRepository } from '../../../src/modules/services/services.repository';
import { ServicesService } from '../../../src/modules/services/services.service';
import { InMemoryPrismaService, serviceRecord } from '../../support/in-memory-prisma.service';

describe('services domain workflow', () => {
  let prismaService: InMemoryPrismaService;
  let servicesService: ServicesService;

  beforeEach(() => {
    prismaService = new InMemoryPrismaService();
    servicesService = new ServicesService(
      new ServicesRepository(prismaService as never),
      new SeoMetadataService(),
      new CacheKeyService(),
      cacheServiceMock(),
      new ConfigService({ PUBLIC_CONTENT_CACHE_TTL_SECONDS: 300 }),
    );
  });

  it('creates drafts and prevents duplicate slugs', async () => {
    await servicesService.createService({
      name: 'SEO',
      title: 'SEO Strategy',
      slug: 'seo-strategy',
      fullDescription: 'SEO planning',
    });

    await expect(
      servicesService.createService({
        name: 'SEO duplicate',
        title: 'SEO Duplicate',
        slug: 'seo-strategy',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('publishes, hides unpublished content, and reorders services', async () => {
    const service = await servicesService.createService({
      name: 'SEO',
      title: 'SEO Strategy',
      slug: 'seo-strategy',
      fullDescription: 'SEO planning',
    });
    prismaService.addService(serviceRecord({ id: '10000000-0000-4000-8000-000000000002', slug: 'ads', title: 'Ads', status: ContentStatus.PUBLISHED }));

    await servicesService.publishService(service.id);
    expect(await servicesService.publicService('seo-strategy')).toMatchObject({ status: ContentStatus.PUBLISHED });

    await servicesService.unpublishService(service.id);
    await expect(servicesService.publicService('seo-strategy')).rejects.toThrow('Service was not found');

    await servicesService.reorderServices({
      items: [
        { id: service.id, sortOrder: 2 },
        { id: '10000000-0000-4000-8000-000000000002', sortOrder: 1 },
      ],
    });

    expect((await servicesService.adminService(service.id)).sortOrder).toBe(2);
  });
});

function cacheServiceMock(): any {
  return {
    getJson: jest.fn(async () => null),
    setJson: jest.fn(async () => undefined),
    deleteByPrefix: jest.fn(async () => undefined),
  };
}
