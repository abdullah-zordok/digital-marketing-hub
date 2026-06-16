import { Injectable } from '@nestjs/common';
import { LeadNotificationStatus, LeadSource, LeadStatus } from '@prisma/client';

import { offsetFor, PaginatedRecords, paginatedRecords } from '../../common/utils/pagination.util';
import { PrismaService } from '../../database/prisma.service';
import { AdminLeadQueryDto, AdminLeadUpdateDto, PublicLeadCreateDto } from './dto/leads.dto';

interface LeadModel {
  create(query: Record<string, unknown>): Promise<LeadRecord>;
  findFirst(query: Record<string, unknown>): Promise<LeadRecord | null>;
  findMany(query: Record<string, unknown>): Promise<LeadRecord[]>;
  count(query: Record<string, unknown>): Promise<number>;
  update(query: Record<string, unknown>): Promise<LeadRecord>;
}

interface LeadNotificationModel {
  create(query: Record<string, unknown>): Promise<LeadNotificationRecord>;
  update(query: Record<string, unknown>): Promise<LeadNotificationRecord>;
}

export interface LeadRecord {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  companyName: string | null;
  serviceInterest: string | null;
  budgetRange: string | null;
  message: string | null;
  source: LeadSource;
  status: LeadStatus;
  assignedTo: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  notifications?: LeadNotificationRecord[];
}

export interface LeadNotificationRecord {
  id: string;
  leadId: string;
  target: string;
  status: LeadNotificationStatus;
  payload: unknown;
  errorMessage: string | null;
  attemptedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class LeadsRepository {
  private readonly leads: LeadModel;
  private readonly notifications: LeadNotificationModel;

  constructor(prismaService: PrismaService) {
    this.leads = prismaService.lead as unknown as LeadModel;
    this.notifications = prismaService.leadNotification as unknown as LeadNotificationModel;
  }

  async createLead(leadDto: PublicLeadCreateDto, source: LeadSource): Promise<LeadRecord> {
    return this.leads.create({ data: { ...leadDto, source, status: LeadStatus.NEW } });
  }

  async adminLeads(query: AdminLeadQueryDto): Promise<PaginatedRecords<LeadRecord>> {
    const where = { deletedAt: null, ...(query.status ? { status: query.status } : {}), ...(query.source ? { source: query.source } : {}) };
    const [items, totalItems] = await Promise.all([
      this.leads.findMany({ where, include: { notifications: true }, orderBy: { createdAt: 'desc' }, skip: offsetFor(query.page, query.limit), take: query.limit }),
      this.leads.count({ where }),
    ]);

    return paginatedRecords(items, query.page, query.limit, totalItems);
  }

  async leadById(id: string): Promise<LeadRecord | null> {
    return this.leads.findFirst({ where: { id, deletedAt: null }, include: { notifications: true } });
  }

  async updateLead(id: string, leadDto: AdminLeadUpdateDto): Promise<LeadRecord> {
    return this.leads.update({ where: { id }, data: leadDto, include: { notifications: true } });
  }

  async updateLeadStatus(id: string, status: LeadStatus): Promise<LeadRecord> {
    return this.leads.update({ where: { id }, data: { status }, include: { notifications: true } });
  }

  async softDelete(id: string): Promise<LeadRecord> {
    return this.leads.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  async createNotification(leadId: string, target: string, payload: unknown): Promise<LeadNotificationRecord> {
    return this.notifications.create({ data: { leadId, target, payload, status: LeadNotificationStatus.PENDING } });
  }

  async updateNotification(id: string, status: LeadNotificationStatus, errorMessage?: string): Promise<LeadNotificationRecord> {
    return this.notifications.update({ where: { id }, data: { status, errorMessage, attemptedAt: new Date() } });
  }
}
