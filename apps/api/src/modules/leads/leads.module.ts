import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { AdminLeadsController } from './admin-leads.controller';
import { LeadNotificationService } from './lead-notification.service';
import { LeadsController } from './leads.controller';
import { LeadsRepository } from './leads.repository';
import { LeadsService } from './leads.service';

@Module({
  imports: [AuthModule, UsersModule],
  controllers: [LeadsController, AdminLeadsController],
  providers: [LeadsRepository, LeadsService, LeadNotificationService],
  exports: [LeadsService, LeadsRepository, LeadNotificationService],
})
export class LeadsModule {}
