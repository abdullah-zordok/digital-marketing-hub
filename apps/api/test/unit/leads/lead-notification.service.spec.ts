import { ConfigService } from '@nestjs/config';
import { LeadNotificationStatus, LeadSource, LeadStatus } from '@prisma/client';

import { LeadNotificationService } from '../../../src/modules/leads/lead-notification.service';
import { LeadRecord } from '../../../src/modules/leads/leads.repository';

const lead: LeadRecord = {
  id: '00000000-0000-4000-8000-000000000401',
  name: 'Dana Client',
  email: 'lead@example.com',
  phone: null,
  companyName: 'Client Co',
  serviceInterest: 'SEO Strategy',
  budgetRange: null,
  message: 'Need SEO help',
  source: LeadSource.CONTACT_FORM,
  status: LeadStatus.NEW,
  assignedTo: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

describe('LeadNotificationService', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('records skipped notification when target is not configured', async () => {
    const updates: LeadNotificationStatus[] = [];
    const repository = {
      createNotification: async () => ({ id: 'notification-1' }),
      updateNotification: async (_id: string, status: LeadNotificationStatus) => updates.push(status),
    };
    const service = new LeadNotificationService(new ConfigService({}), repository as never);

    await service.notifyNewLead(lead);

    expect(updates).toEqual([LeadNotificationStatus.SKIPPED]);
  });

  it.each([
    [true, LeadNotificationStatus.SENT],
    [false, LeadNotificationStatus.FAILED],
  ])('records webhook delivery state when response ok is %s', async (ok, expectedStatus) => {
    const updates: LeadNotificationStatus[] = [];
    global.fetch = async () => ({ ok, status: ok ? 200 : 500 }) as Response;
    const repository = {
      createNotification: async () => ({ id: 'notification-1' }),
      updateNotification: async (_id: string, status: LeadNotificationStatus) => updates.push(status),
    };
    const service = new LeadNotificationService(
      new ConfigService({ LEAD_NOTIFICATION_WEBHOOK_URL: 'https://workflow.example/webhook' }),
      repository as never,
    );

    await service.notifyNewLead(lead);

    expect(updates).toEqual([expectedStatus]);
  });
});
