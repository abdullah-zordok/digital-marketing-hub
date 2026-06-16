import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ContentStatus } from '@prisma/client';

import { SeoMetadataService } from '../../common/services/seo-metadata.service';
import { ensureNotArchived, ensurePublishableContent } from '../../common/utils/content-status.util';
import { ensureValidSlug, normalizedSlug } from '../../common/utils/slug.util';
import { PublicServiceQueryDto } from './dto/public-service-query.dto';
import { ServiceQueryDto, ServiceReorderDto } from './dto/service-query.dto';
import { ServiceWriteDto } from './dto/service-write.dto';
import { ServiceResponse, serviceResponseFor } from './services.mapper';
import { ServiceRecord, ServicesRepository } from './services.repository';

@Injectable()
export class ServicesService {
  constructor(
    private readonly servicesRepository: ServicesRepository,
    private readonly seoMetadataService: SeoMetadataService,
  ) {}

  async publicServices(query: PublicServiceQueryDto): Promise<{ items: ServiceResponse[]; meta: unknown }> {
    const servicesPage = await this.servicesRepository.publicServices(query.page, query.limit);
    return {
      items: servicesPage.items.map((service) => this.publicResponseFor(service)),
      meta: servicesPage.meta,
    };
  }

  async publicService(slug: string): Promise<ServiceResponse> {
    const service = await this.servicesRepository.publicServiceBySlug(normalizedSlug(slug));
    return this.publicResponseFor(this.requiredService(service));
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
    return this.adminResponseFor(await this.servicesRepository.createService(slug, serviceWriteDto));
  }

  async updateService(id: string, serviceWriteDto: ServiceWriteDto): Promise<ServiceResponse> {
    const currentService = this.requiredService(await this.servicesRepository.serviceById(id));
    ensureNotArchived(currentService.status);
    const slug = await this.availableSlugFor(serviceWriteDto.slug, id);
    return this.adminResponseFor(await this.servicesRepository.updateService(id, slug, serviceWriteDto));
  }

  async publishService(id: string): Promise<ServiceResponse> {
    const service = this.requiredService(await this.servicesRepository.serviceById(id));
    ensurePublishableContent(Boolean(service.title && (service.fullDescription || service.shortDescription)));
    return this.adminResponseFor(await this.servicesRepository.changeStatus(id, ContentStatus.PUBLISHED));
  }

  async unpublishService(id: string): Promise<ServiceResponse> {
    this.requiredService(await this.servicesRepository.serviceById(id));
    return this.adminResponseFor(await this.servicesRepository.changeStatus(id, ContentStatus.DRAFT));
  }

  async deleteService(id: string): Promise<{ deleted: true }> {
    this.requiredService(await this.servicesRepository.serviceById(id));
    await this.servicesRepository.softDelete(id);
    return { deleted: true };
  }

  async reorderServices(serviceReorderDto: ServiceReorderDto): Promise<{ reordered: true }> {
    await this.ensureReorderableSet(serviceReorderDto);
    await this.servicesRepository.reorderServices(serviceReorderDto.items);
    return { reordered: true };
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
