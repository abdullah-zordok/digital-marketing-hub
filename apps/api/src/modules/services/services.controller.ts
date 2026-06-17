import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { PublicServiceQueryDto } from './dto/public-service-query.dto';
import { ServiceResponse } from './services.mapper';
import { ServicesService } from './services.service';

@Controller('services')
@ApiTags('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  @ApiOperation({ summary: 'List published services' })
  async list(@Query() query: PublicServiceQueryDto): Promise<{ message: string; payload: { items: ServiceResponse[]; meta: unknown } }> {
    return { message: 'Published services retrieved', payload: await this.servicesService.publicServices(query) };
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Read a published service by slug' })
  async read(@Param('slug') slug: string): Promise<{ message: string; payload: ServiceResponse }> {
    return { message: 'Published service retrieved', payload: await this.servicesService.publicService(slug) };
  }
}
