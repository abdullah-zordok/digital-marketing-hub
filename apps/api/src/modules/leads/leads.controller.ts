import { Body, Controller, Post } from '@nestjs/common';

import { PublicLeadCreateDto } from './dto/leads.dto';
import { LeadsService } from './leads.service';
import { LeadRecord } from './leads.repository';

@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  async create(@Body() leadDto: PublicLeadCreateDto): Promise<{ message: string; payload: LeadRecord }> {
    return { message: 'Lead created', payload: await this.leadsService.createPublicLead(leadDto) };
  }
}
