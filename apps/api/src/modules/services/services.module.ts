import { Module } from '@nestjs/common';

import { SeoMetadataService } from '../../common/services/seo-metadata.service';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { AdminServicesController } from './admin-services.controller';
import { ServicesController } from './services.controller';
import { ServicesRepository } from './services.repository';
import { ServicesService } from './services.service';

@Module({
  imports: [AuthModule, UsersModule],
  controllers: [AdminServicesController, ServicesController],
  providers: [ServicesRepository, ServicesService, SeoMetadataService],
  exports: [ServicesService],
})
export class ServicesModule {}
