import { SeoMetadataService } from '../../../src/common/services/seo-metadata.service';

describe('SEO metadata fallback', () => {
  const seoMetadataService = new SeoMetadataService();

  it('prefers explicit metadata when present', () => {
    expect(
      seoMetadataService.metadataFor({
        title: 'Visible title',
        description: 'Visible description',
        canonicalPath: '/services/seo',
        image: '/uploads/cover.webp',
        seoTitle: 'SEO title',
        seoDescription: 'SEO description',
        canonicalUrl: 'https://example.com/seo',
        openGraphImage: 'https://example.com/og.webp',
      }),
    ).toEqual({
      title: 'SEO title',
      description: 'SEO description',
      canonicalUrl: 'https://example.com/seo',
      openGraphImage: 'https://example.com/og.webp',
    });
  });

  it('falls back to visible public fields', () => {
    process.env.APP_BASE_URL = 'https://hub.example.com';

    expect(
      seoMetadataService.metadataFor({
        title: 'Content Marketing',
        description: null,
        canonicalPath: '/services/content',
        image: '/uploads/content.webp',
      }),
    ).toEqual({
      title: 'Content Marketing',
      description: 'Content Marketing',
      canonicalUrl: 'https://hub.example.com/services/content',
      openGraphImage: '/uploads/content.webp',
    });
  });
});
