import { Body, Controller, Delete, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';

import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AdminLeadQueryDto, AdminLeadUpdateDto, LeadStatusDto } from './dto/leads.dto';
import { LeadRecord } from './leads.repository';
import { LeadsService } from './leads.service';

@Controller('admin/leads')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminLeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Get()
  async list(@Query() query: AdminLeadQueryDto): Promise<{ message: string; payload: { items: LeadRecord[]; meta: unknown } }> {
    return { message: 'Leads retrieved', payload: await this.leadsService.adminLeads(query) };
  }

  @Get(':id')
  async read(@Param('id') id: string): Promise<{ message: string; payload: LeadRecord }> {
    return { message: 'Lead retrieved', payload: await this.leadsService.adminLead(id) };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() leadDto: AdminLeadUpdateDto): Promise<{ message: string; payload: LeadRecord }> {
    return { message: 'Lead updated', payload: await this.leadsService.updateLead(id, leadDto) };
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body() statusDto: LeadStatusDto): Promise<{ message: string; payload: LeadRecord }> {
    return { message: 'Lead status updated', payload: await this.leadsService.updateStatus(id, statusDto) };
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<{ message: string; payload: { deleted: true } }> {
    return { message: 'Lead deleted', payload: await this.leadsService.deleteLead(id) };
  }
}
