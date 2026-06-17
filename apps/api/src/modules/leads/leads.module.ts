import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { JobsModule } from '../jobs/jobs.module';
import { OperationalLoggerService } from '../../common/services/operational-logger.service';
import { AdminLeadsController } from './admin-leads.controller';
import { LeadNotificationService } from './lead-notification.service';
import { LeadsController } from './leads.controller';
import { LeadsRepository } from './leads.repository';
import { LeadsService } from './leads.service';

@Module({
  imports: [AuthModule, UsersModule, JobsModule],
  controllers: [LeadsController, AdminLeadsController],
  providers: [LeadsRepository, LeadsService, LeadNotificationService, OperationalLoggerService],
  exports: [LeadsService, LeadsRepository, LeadNotificationService],
})
export class LeadsModule {}
