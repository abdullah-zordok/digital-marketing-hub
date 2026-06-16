import { LeadIntentService } from '../../../src/modules/chatbot/lead-intent.service';

describe('LeadIntentService', () => {
  const service = new LeadIntentService();

  it('detects complete buying intent from contact and service details', () => {
    const intent = service.intentFor('I need SEO help. Email me at client@example.com');

    expect(intent.hasBuyingIntent).toBe(true);
    expect(intent.missingFields).toEqual([]);
    expect(intent.leadDetails.email).toBe('client@example.com');
    expect(intent.leadDetails.serviceInterest).toBe('SEO Strategy');
  });

  it('asks for missing contact details when intent is incomplete', () => {
    const intent = service.intentFor('Can I book a consultation for marketing?');

    expect(intent.hasBuyingIntent).toBe(true);
    expect(intent.missingFields).toContain('contact channel');
  });
});
