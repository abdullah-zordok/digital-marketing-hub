import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LeadNotificationStatus } from '@prisma/client';

import { leadNotificationTarget } from './lead-notification.config';
import { LeadRecord, LeadsRepository } from './leads.repository';

@Injectable()
export class LeadNotificationService {
  constructor(
    private readonly configService: ConfigService,
    private readonly leadsRepository: LeadsRepository,
  ) {}

  async notifyNewLead(lead: LeadRecord): Promise<void> {
    const target = leadNotificationTarget(this.configService);
    const payload = this.payloadFor(lead);

    if (!target) {
      const notification = await this.leadsRepository.createNotification(lead.id, 'unconfigured', payload);
      await this.leadsRepository.updateNotification(notification.id, LeadNotificationStatus.SKIPPED, 'Notification target is not configured');
      return;
    }

    const notification = await this.leadsRepository.createNotification(lead.id, target, payload);
    await this.deliverNotification(notification.id, target, payload);
  }

  private async deliverNotification(notificationId: string, target: string, payload: unknown): Promise<void> {
    try {
      const response = await fetch(target, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        await this.leadsRepository.updateNotification(notificationId, LeadNotificationStatus.FAILED, `Webhook returned ${response.status}`);
        return;
      }

      await this.leadsRepository.updateNotification(notificationId, LeadNotificationStatus.SENT);
    } catch (deliveryError) {
      const message = deliveryError instanceof Error ? deliveryError.message : 'Notification delivery failed';
      await this.leadsRepository.updateNotification(notificationId, LeadNotificationStatus.FAILED, message);
    }
  }

  private payloadFor(lead: LeadRecord): Record<string, unknown> {
    return {
      id: lead.id,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      companyName: lead.companyName,
      serviceInterest: lead.serviceInterest,
      budgetRange: lead.budgetRange,
      message: lead.message,
      source: lead.source,
      status: lead.status,
    };
  }
}
