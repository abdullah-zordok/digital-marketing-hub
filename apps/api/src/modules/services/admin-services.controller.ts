import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';

import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ServiceQueryDto, ServiceReorderDto } from './dto/service-query.dto';
import { ServiceWriteDto } from './dto/service-write.dto';
import { ServiceResponse } from './services.mapper';
import { ServicesService } from './services.service';

@Controller('admin/services')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.EDITOR)
export class AdminServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  async list(@Query() query: ServiceQueryDto): Promise<{ message: string; payload: { items: ServiceResponse[]; meta: unknown } }> {
    return { message: 'Services retrieved', payload: await this.servicesService.adminServices(query) };
  }

  @Post()
  async create(@Body() serviceWriteDto: ServiceWriteDto): Promise<{ message: string; payload: ServiceResponse }> {
    return { message: 'Service created', payload: await this.servicesService.createService(serviceWriteDto) };
  }

  @Patch('reorder')
  async reorder(@Body() serviceReorderDto: ServiceReorderDto): Promise<{ message: string; payload: { reordered: true } }> {
    return { message: 'Services reordered', payload: await this.servicesService.reorderServices(serviceReorderDto) };
  }

  @Get(':id')
  async read(@Param('id') id: string): Promise<{ message: string; payload: ServiceResponse }> {
    return { message: 'Service retrieved', payload: await this.servicesService.adminService(id) };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() serviceWriteDto: ServiceWriteDto): Promise<{ message: string; payload: ServiceResponse }> {
    return { message: 'Service updated', payload: await this.servicesService.updateService(id, serviceWriteDto) };
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<{ message: string; payload: { deleted: true } }> {
    return { message: 'Service deleted', payload: await this.servicesService.deleteService(id) };
  }

  @Patch(':id/publish')
  async publish(@Param('id') id: string): Promise<{ message: string; payload: ServiceResponse }> {
    return { message: 'Service published', payload: await this.servicesService.publishService(id) };
  }

  @Patch(':id/unpublish')
  async unpublish(@Param('id') id: string): Promise<{ message: string; payload: ServiceResponse }> {
    return { message: 'Service unpublished', payload: await this.servicesService.unpublishService(id) };
  }
}
