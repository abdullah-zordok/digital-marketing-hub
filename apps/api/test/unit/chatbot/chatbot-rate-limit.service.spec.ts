import { ConfigService } from '@nestjs/config';

import { ChatbotRateLimitService } from '../../../src/modules/chatbot/chatbot-rate-limit.service';

describe('ChatbotRateLimitService', () => {
  it('allows normal visitor usage and rejects excessive messages', async () => {
    const configService = new ConfigService({
      CHATBOT_VISITOR_LIMIT: 2,
      CHATBOT_VISITOR_WINDOW_SECONDS: 60,
      CHATBOT_SOURCE_LIMIT: 10,
      CHATBOT_SOURCE_WINDOW_SECONDS: 60,
    });
    const service = new ChatbotRateLimitService(configService, {} as never);

    await expect(service.ensureMessageAllowed('visitor-1', '127.0.0.1')).resolves.toBeUndefined();
    await expect(service.ensureMessageAllowed('visitor-1', '127.0.0.1')).resolves.toBeUndefined();
    await expect(service.ensureMessageAllowed('visitor-1', '127.0.0.1')).rejects.toThrow('Too many chatbot messages');
  });
});
