import { Module } from '@nestjs/common';

import { OperationalLoggerService } from '../../common/services/operational-logger.service';
import { BackgroundJobService } from './background-job.service';

@Module({
  providers: [BackgroundJobService, OperationalLoggerService],
  exports: [BackgroundJobService],
})
export class JobsModule {}
