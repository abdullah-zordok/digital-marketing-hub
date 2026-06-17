import { Injectable } from '@nestjs/common';

import { OperationalLoggerService } from '../../common/services/operational-logger.service';

export interface BackgroundJobRequest {
  jobType: string;
  safePayloadReference: Record<string, unknown>;
}

export interface BackgroundJobRecord extends BackgroundJobRequest {
  id: string;
  status: 'queued';
  attemptCount: number;
}

@Injectable()
export class BackgroundJobService {
  constructor(private readonly operationalLogger: OperationalLoggerService) {}

  async enqueue(jobRequest: BackgroundJobRequest): Promise<BackgroundJobRecord> {
    const job = {
      ...jobRequest,
      id: `${jobRequest.jobType}:${Date.now()}`,
      status: 'queued' as const,
      attemptCount: 0,
    };

    this.operationalLogger.logEvent({
      eventType: 'background_job.queued',
      severity: 'info',
      safeContext: { jobType: job.jobType, jobId: job.id, ...job.safePayloadReference },
    });
    return job;
  }

  logFailure(job: BackgroundJobRecord, failureMessage: string): void {
    this.operationalLogger.logEvent({
      eventType: 'background_job.failed',
      severity: 'error',
      safeContext: {
        jobType: job.jobType,
        jobId: job.id,
        attemptCount: job.attemptCount,
        failureMessage,
      },
    });
  }
}
