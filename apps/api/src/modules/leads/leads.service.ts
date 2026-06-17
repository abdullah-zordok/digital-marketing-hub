import { Injectable, NotFoundException } from '@nestjs/common';
import { LeadSource } from '@prisma/client';

import { ensureLeadHasFollowUpDetails } from './lead-validation.util';
import { AdminLeadQueryDto, AdminLeadUpdateDto, LeadStatusDto, PublicLeadCreateDto } from './dto/leads.dto';
import { LeadNotificationService } from './lead-notification.service';
import { LeadRecord, LeadsRepository } from './leads.repository';
import { OperationalLoggerService } from '../../common/services/operational-logger.service';

@Injectable()
export class LeadsService {
  constructor(
    private readonly leadsRepository: LeadsRepository,
    private readonly leadNotificationService: LeadNotificationService,
    private readonly operationalLogger: OperationalLoggerService,
  ) {}

  async createPublicLead(leadDto: PublicLeadCreateDto, source: LeadSource = LeadSource.CONTACT_FORM): Promise<LeadRecord> {
    ensureLeadHasFollowUpDetails(leadDto);
    const lead = await this.leadsRepository.createLead(leadDto, source);
    this.operationalLogger.logEvent({
      eventType: 'lead.created',
      severity: 'info',
      safeContext: { leadId: lead.id, source: lead.source },
    });
    await this.leadNotificationService.notifyNewLead(lead);
    return lead;
  }

  async adminLeads(query: AdminLeadQueryDto): Promise<{ items: LeadRecord[]; meta: unknown }> {
    const leadsPage = await this.leadsRepository.adminLeads(query);
    return { items: leadsPage.items, meta: leadsPage.meta };
  }

  async adminLead(id: string): Promise<LeadRecord> {
    return this.requiredLead(await this.leadsRepository.leadById(id));
  }

  async updateLead(id: string, leadDto: AdminLeadUpdateDto): Promise<LeadRecord> {
    this.requiredLead(await this.leadsRepository.leadById(id));
    return this.leadsRepository.updateLead(id, leadDto);
  }

  async updateStatus(id: string, statusDto: LeadStatusDto): Promise<LeadRecord> {
    this.requiredLead(await this.leadsRepository.leadById(id));
    return this.leadsRepository.updateLeadStatus(id, statusDto.status);
  }

  async deleteLead(id: string): Promise<{ deleted: true }> {
    this.requiredLead(await this.leadsRepository.leadById(id));
    await this.leadsRepository.softDelete(id);
    return { deleted: true };
  }

  private requiredLead(lead: LeadRecord | null): LeadRecord {
    if (!lead) {
      throw new NotFoundException('Lead was not found');
    }

    return lead;
  }
}
