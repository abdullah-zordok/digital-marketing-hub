import { BadRequestException } from '@nestjs/common';

import { PublicLeadCreateDto } from './dto/leads.dto';

export function ensureLeadHasFollowUpDetails(leadDto: PublicLeadCreateDto): void {
  const hasContactChannel = Boolean(leadDto.email || leadDto.phone);
  const hasInterest = Boolean(leadDto.serviceInterest || leadDto.message);

  if (!hasContactChannel || !hasInterest) {
    throw new BadRequestException('Lead requires a contact channel and service interest or message');
  }
}
