import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ContentStatus } from '@prisma/client';

import { CacheKeyService } from '../../common/services/cache-key.service';
import { SeoMetadataService } from '../../common/services/seo-metadata.service';
import { ensureNotArchived, ensurePublishableContent } from '../../common/utils/content-status.util';
import { ensureValidSlug, normalizedSlug } from '../../common/utils/slug.util';
import { PublicServiceQueryDto } from './dto/public-service-query.dto';
import { ServiceQueryDto, ServiceReorderDto } from './dto/service-query.dto';
import { ServiceWriteDto } from './dto/service-write.dto';
import { ServiceResponse, serviceResponseFor } from './services.mapper';
import { ServiceRecord, ServicesRepository } from './services.repository';
import { CacheService } from '../../database/cache.service';

@Injectable()
export class ServicesService {
  constructor(
    private readonly servicesRepository: ServicesRepository,
    private readonly seoMetadataService: SeoMetadataService,
    private readonly cacheKeyService: CacheKeyService,
    private readonly cacheService: CacheService,
    private readonly configService: ConfigService,
  ) {}

  async publicServices(query: PublicServiceQueryDto): Promise<{ items: ServiceResponse[]; meta: unknown }> {
    return this.cachedPublicResponse(this.cacheKeyService.publicServices({ ...query }), async () => {
      const servicesPage = await this.servicesRepository.publicServices(query.page, query.limit);
      return {
        items: servicesPage.items.map((service) => this.publicResponseFor(service)),
        meta: servicesPage.meta,
      };
    });
  }

  async publicService(slug: string): Promise<ServiceResponse> {
    const serviceSlug = normalizedSlug(slug);
    return this.cachedPublicResponse(this.cacheKeyService.publicService(serviceSlug), async () => {
      const service = await this.servicesRepository.publicServiceBySlug(serviceSlug);
      return this.publicResponseFor(this.requiredService(service));
    });
  }

  async adminServices(query: ServiceQueryDto): Promise<{ items: ServiceResponse[]; meta: unknown }> {
    const servicesPage = await this.servicesRepository.adminServices(query.page, query.limit, query.status);
    return {
      items: servicesPage.items.map((service) => this.adminResponseFor(service)),
      meta: servicesPage.meta,
    };
  }

  async adminService(id: string): Promise<ServiceResponse> {
    return this.adminResponseFor(this.requiredService(await this.servicesRepository.serviceById(id)));
  }

  async createService(serviceWriteDto: ServiceWriteDto): Promise<ServiceResponse> {
    const slug = await this.availableSlugFor(serviceWriteDto.slug);
    const service = await this.servicesRepository.createService(slug, serviceWriteDto);
    await this.invalidatePublicCache();
    return this.adminResponseFor(service);
  }

  async updateService(id: string, serviceWriteDto: ServiceWriteDto): Promise<ServiceResponse> {
    const currentService = this.requiredService(await this.servicesRepository.serviceById(id));
    ensureNotArchived(currentService.status);
    const slug = await this.availableSlugFor(serviceWriteDto.slug, id);
    const service = await this.servicesRepository.updateService(id, slug, serviceWriteDto);
    await this.invalidatePublicCache();
    return this.adminResponseFor(service);
  }

  async publishService(id: string): Promise<ServiceResponse> {
    const currentService = this.requiredService(await this.servicesRepository.serviceById(id));
    ensurePublishableContent(Boolean(currentService.title && (currentService.fullDescription || currentService.shortDescription)));
    const service = await this.servicesRepository.changeStatus(id, ContentStatus.PUBLISHED);
    await this.invalidatePublicCache();
    return this.adminResponseFor(service);
  }

  async unpublishService(id: string): Promise<ServiceResponse> {
    this.requiredService(await this.servicesRepository.serviceById(id));
    const service = await this.servicesRepository.changeStatus(id, ContentStatus.DRAFT);
    await this.invalidatePublicCache();
    return this.adminResponseFor(service);
  }

  async deleteService(id: string): Promise<{ deleted: true }> {
    this.requiredService(await this.servicesRepository.serviceById(id));
    await this.servicesRepository.softDelete(id);
    await this.invalidatePublicCache();
    return { deleted: true };
  }

  async reorderServices(serviceReorderDto: ServiceReorderDto): Promise<{ reordered: true }> {
    await this.ensureReorderableSet(serviceReorderDto);
    await this.servicesRepository.reorderServices(serviceReorderDto.items);
    await this.invalidatePublicCache();
    return { reordered: true };
  }

  private async cachedPublicResponse<TPublicResponse>(cacheKey: string, responseFactory: () => Promise<TPublicResponse>): Promise<TPublicResponse> {
    const cachedResponse = await this.cacheService.getJson<TPublicResponse>(cacheKey);
    if (cachedResponse) {
      return cachedResponse;
    }

    const publicResponse = await responseFactory();
    await this.cacheService.setJson(cacheKey, publicResponse, this.publicContentTtlSeconds());
    return publicResponse;
  }

  private async invalidatePublicCache(): Promise<void> {
    await this.cacheService.deleteByPrefix('public:services:');
  }

  private publicContentTtlSeconds(): number {
    return Number(this.configService.get('PUBLIC_CONTENT_CACHE_TTL_SECONDS') ?? 300);
  }

  private async availableSlugFor(slug: string, excludedId?: string): Promise<string> {
    const serviceSlug = normalizedSlug(slug);
    ensureValidSlug(serviceSlug);

    if (await this.servicesRepository.serviceBySlug(serviceSlug, excludedId)) {
      throw new ConflictException('Service slug is already in use');
    }

    return serviceSlug;
  }

  private async ensureReorderableSet(serviceReorderDto: ServiceReorderDto): Promise<void> {
    const ids = serviceReorderDto.items.map((serviceOrder) => serviceOrder.id);
    const uniqueIds = new Set(ids);

    if (ids.length !== uniqueIds.size) {
      throw new BadRequestException('Service reorder request contains duplicate services');
    }

    if ((await this.servicesRepository.reorderableCount(ids)) !== ids.length) {
      throw new BadRequestException('Service reorder request contains unavailable services');
    }
  }

  private requiredService(service: ServiceRecord | null): ServiceRecord {
    if (!service) {
      throw new NotFoundException('Service was not found');
    }

    return service;
  }

  private adminResponseFor(service: ServiceRecord): ServiceResponse {
    return this.responseFor(service, `/services/${service.slug}`);
  }

  private publicResponseFor(service: ServiceRecord): ServiceResponse {
    return this.responseFor(service, `/services/${service.slug}`);
  }

  private responseFor(service: ServiceRecord, canonicalPath: string): ServiceResponse {
    const seo = this.seoMetadataService.metadataFor({
      title: service.title,
      description: service.shortDescription ?? service.fullDescription,
      canonicalPath,
      image: service.coverImage,
      seoTitle: service.seoTitle,
      seoDescription: service.seoDescription,
      canonicalUrl: service.canonicalUrl,
      openGraphImage: service.openGraphImage,
    });

    return serviceResponseFor(service, seo);
  }
}
