import { BackgroundJobService } from '../../../src/modules/jobs/background-job.service';

describe('BackgroundJobService', () => {
  it('enqueues jobs with safe references and emits an operational event', async () => {
    const operationalLogger = { logEvent: jest.fn() };
    const service = new BackgroundJobService(operationalLogger as never);

    const job = await service.enqueue({
      jobType: 'lead_notification',
      safePayloadReference: { leadId: 'lead-1' },
    });

    expect(job).toMatchObject({
      jobType: 'lead_notification',
      status: 'queued',
      attemptCount: 0,
      safePayloadReference: { leadId: 'lead-1' },
    });
    expect(operationalLogger.logEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'background_job.queued',
        severity: 'info',
      }),
    );
  });

  it('logs job failure without raw payload data', () => {
    const operationalLogger = { logEvent: jest.fn() };
    const service = new BackgroundJobService(operationalLogger as never);

    service.logFailure(
      {
        id: 'job-1',
        jobType: 'lead_notification',
        status: 'queued',
        attemptCount: 2,
        safePayloadReference: { leadId: 'lead-1' },
      },
      'Webhook returned 500',
    );

    expect(operationalLogger.logEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'background_job.failed',
        severity: 'error',
      }),
    );
  });
});
