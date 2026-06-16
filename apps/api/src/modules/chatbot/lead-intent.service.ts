import { Injectable } from '@nestjs/common';

import { LeadDetails, LeadIntentResult } from './dto/lead-intent.dto';

const BUYING_INTENT_PATTERN = /quote|consultation|book|proposal|pricing|price|contact|call|help with|need (seo|ads|marketing|content)/i;
const EMAIL_PATTERN = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
const PHONE_PATTERN = /(?:\+?\d[\d\s().-]{7,}\d)/;

@Injectable()
export class LeadIntentService {
  intentFor(message: string): LeadIntentResult {
    const leadDetails = this.leadDetailsFor(message);
    const hasBuyingIntent = BUYING_INTENT_PATTERN.test(message) || Boolean(leadDetails.email || leadDetails.phone);
    return {
      hasBuyingIntent,
      missingFields: hasBuyingIntent ? this.missingFieldsFor(leadDetails) : [],
      leadDetails,
    };
  }

  private leadDetailsFor(message: string): LeadDetails {
    return {
      email: message.match(EMAIL_PATTERN)?.[0],
      phone: message.match(PHONE_PATTERN)?.[0]?.trim(),
      serviceInterest: this.serviceInterestFor(message),
      message,
    };
  }

  private serviceInterestFor(message: string): string | undefined {
    const normalizedMessage = message.toLowerCase();

    if (normalizedMessage.includes('seo')) return 'SEO Strategy';
    if (normalizedMessage.includes('ads') || normalizedMessage.includes('advertising')) return 'Paid Advertising';
    if (normalizedMessage.includes('content')) return 'Content Marketing';
    if (normalizedMessage.includes('marketing')) return 'Digital Marketing';

    return undefined;
  }

  private missingFieldsFor(leadDetails: LeadDetails): string[] {
    const missingFields: string[] = [];

    if (!leadDetails.email && !leadDetails.phone) missingFields.push('contact channel');
    if (!leadDetails.serviceInterest) missingFields.push('service interest');

    return missingFields;
  }
}
