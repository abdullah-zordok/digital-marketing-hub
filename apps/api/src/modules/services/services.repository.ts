import { Injectable } from '@nestjs/common';
import { ContentStatus } from '@prisma/client';

import { offsetFor, PaginatedRecords, paginatedRecords } from '../../common/utils/pagination.util';
import { PrismaService } from '../../database/prisma.service';
import { ServiceReorderItemDto } from './dto/service-query.dto';
import { ServiceWriteDto } from './dto/service-write.dto';

interface ServiceModel {
  findFirst(query: Record<string, unknown>): Promise<ServiceRecord | null>;
  findMany(query: Record<string, unknown>): Promise<ServiceRecord[]>;
  count(query: Record<string, unknown>): Promise<number>;
  create(query: Record<string, unknown>): Promise<ServiceRecord>;
  update(query: Record<string, unknown>): Promise<ServiceRecord>;
  updateMany(query: Record<string, unknown>): Promise<{ count: number }>;
}

export interface ServiceRecord {
  id: string;
  name: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  fullDescription: string | null;
  icon: string | null;
  coverImage: string | null;
  benefits: unknown;
  processSteps: unknown;
  targetAudience: unknown;
  expectedResults: unknown;
  faqs: unknown;
  status: ContentStatus;
  sortOrder: number;
  seoTitle: string | null;
  seoDescription: string | null;
  canonicalUrl: string | null;
  openGraphImage: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

@Injectable()
export class ServicesRepository {
  private readonly services: ServiceModel;

  constructor(prismaService: PrismaService) {
    this.services = prismaService.service as unknown as ServiceModel;
  }

  async adminServices(page: number, limit: number, status?: ContentStatus): Promise<PaginatedRecords<ServiceRecord>> {
    const where = status ? { deletedAt: null, status } : { deletedAt: null };
    const [items, totalItems] = await Promise.all([
      this.services.findMany({
        where,
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        skip: offsetFor(page, limit),
        take: limit,
      }),
      this.services.count({ where }),
    ]);

    return paginatedRecords(items, page, limit, totalItems);
  }

  async publicServices(page: number, limit: number): Promise<PaginatedRecords<ServiceRecord>> {
    const where = this.publicWhereClause();
    const [items, totalItems] = await Promise.all([
      this.services.findMany({
        where,
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        skip: offsetFor(page, limit),
        take: limit,
      }),
      this.services.count({ where }),
    ]);

    return paginatedRecords(items, page, limit, totalItems);
  }

  async createService(slug: string, serviceWriteDto: ServiceWriteDto): Promise<ServiceRecord> {
    return this.services.create({
      data: { ...serviceWriteDto, slug, status: ContentStatus.DRAFT },
    });
  }

  async updateService(id: string, slug: string, serviceWriteDto: ServiceWriteDto): Promise<ServiceRecord> {
    return this.services.update({
      where: { id },
      data: { ...serviceWriteDto, slug },
    });
  }

  async serviceById(id: string): Promise<ServiceRecord | null> {
    return this.services.findFirst({ where: { id, deletedAt: null } });
  }

  async publicServiceBySlug(slug: string): Promise<ServiceRecord | null> {
    return this.services.findFirst({ where: { ...this.publicWhereClause(), slug } });
  }

  async serviceBySlug(slug: string, excludedId?: string): Promise<ServiceRecord | null> {
    const where = excludedId ? { slug, deletedAt: null, NOT: { id: excludedId } } : { slug, deletedAt: null };
    return this.services.findFirst({ where });
  }

  async changeStatus(id: string, status: ContentStatus): Promise<ServiceRecord> {
    return this.services.update({ where: { id }, data: { status } });
  }

  async softDelete(id: string): Promise<ServiceRecord> {
    return this.services.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  async reorderServices(items: ServiceReorderItemDto[]): Promise<void> {
    await Promise.all(
      items.map((serviceOrder) =>
        this.services.update({ where: { id: serviceOrder.id }, data: { sortOrder: serviceOrder.sortOrder } }),
      ),
    );
  }

  async reorderableCount(ids: string[]): Promise<number> {
    return this.services.count({ where: { id: { in: ids }, deletedAt: null } });
  }

  private publicWhereClause(): Record<string, unknown> {
    return { status: ContentStatus.PUBLISHED, deletedAt: null };
  }
}
