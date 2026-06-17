import { CacheKeyService } from '../../../src/common/services/cache-key.service';

describe('CacheKeyService', () => {
  it('builds stable keys for equivalent query objects', () => {
    const service = new CacheKeyService();

    expect(service.publicServices({ page: 1, limit: 10 })).toBe(
      service.publicServices({ limit: 10, page: 1 }),
    );
  });

  it('distinguishes query values that affect public content', () => {
    const service = new CacheKeyService();

    expect(service.publicBlogPosts({ page: 1, tag: 'seo' })).not.toBe(
      service.publicBlogPosts({ page: 1, tag: 'ads' }),
    );
  });
});
