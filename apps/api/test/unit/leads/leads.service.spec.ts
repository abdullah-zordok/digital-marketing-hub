import { BadRequestException } from '@nestjs/common';
import { LeadSource, LeadStatus } from '@prisma/client';

import { LeadsService } from '../../../src/modules/leads/leads.service';
import { LeadRecord } from '../../../src/modules/leads/leads.repository';

describe('LeadsService', () => {
  it('creates public leads with NEW status and requested source', async () => {
    const lead: LeadRecord = {
      id: '00000000-0000-4000-8000-000000000301',
      name: null,
      email: 'lead@example.com',
      phone: null,
      companyName: null,
      serviceInterest: 'SEO Strategy',
      budgetRange: null,
      message: null,
      source: LeadSource.CHATBOT,
      status: LeadStatus.NEW,
      assignedTo: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };
    const repository = { createLead: async () => lead };
    const notifications = { notifyNewLead: async () => undefined };
    const service = new LeadsService(repository as never, notifications as never, operationalLoggerMock() as never);

    await expect(service.createPublicLead({ email: 'lead@example.com', serviceInterest: 'SEO Strategy' }, LeadSource.CHATBOT)).resolves.toMatchObject({
      source: LeadSource.CHATBOT,
      status: LeadStatus.NEW,
    });
  });

  it('rejects public leads without a contact channel', async () => {
    const service = new LeadsService({} as never, {} as never, operationalLoggerMock() as never);

    await expect(service.createPublicLead({ serviceInterest: 'SEO Strategy' })).rejects.toBeInstanceOf(BadRequestException);
  });
});

function operationalLoggerMock(): { logEvent: jest.Mock } {
  return { logEvent: jest.fn() };
}
