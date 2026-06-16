import { Injectable } from '@nestjs/common';

export interface SeoSource {
  title: string;
  description?: string | null;
  canonicalPath: string;
  image?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  canonicalUrl?: string | null;
  openGraphImage?: string | null;
}

export interface SeoMetadata {
  title: string;
  description: string;
  canonicalUrl: string | null;
  openGraphImage: string | null;
}

@Injectable()
export class SeoMetadataService {
  metadataFor(source: SeoSource): SeoMetadata {
    return {
      title: source.seoTitle?.trim() || source.title,
      description: source.seoDescription?.trim() || source.description?.trim() || source.title,
      canonicalUrl: source.canonicalUrl?.trim() || this.absoluteUrlFor(source.canonicalPath),
      openGraphImage: source.openGraphImage?.trim() || source.image || null,
    };
  }

  private absoluteUrlFor(path: string): string {
    const appBaseUrl = process.env.APP_BASE_URL ?? 'http://localhost:3000';
    return `${appBaseUrl.replace(/\/$/, '')}${path}`;
  }
}
