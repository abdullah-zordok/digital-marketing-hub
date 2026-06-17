import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { TrafficLimited } from '../../common/guards/traffic-limit.guard';
import { PublicLeadCreateDto } from './dto/leads.dto';
import { LeadsService } from './leads.service';
import { LeadRecord } from './leads.repository';

@Controller('leads')
@ApiTags('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  @TrafficLimited('lead')
  @ApiOperation({ summary: 'Create a public lead' })
  async create(@Body() leadDto: PublicLeadCreateDto): Promise<{ message: string; payload: LeadRecord }> {
    return { message: 'Lead created', payload: await this.leadsService.createPublicLead(leadDto) };
  }
}
