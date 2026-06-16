import { ChatMessageRole, ChatSessionStatus } from '@prisma/client';

import { ChatbotService } from '../../../src/modules/chatbot/chatbot.service';
import { chatMessageRecord, chatSessionRecord } from '../../support/in-memory-prisma.service';

describe('ChatbotService', () => {
  it('returns session messages in repository order with public metadata', async () => {
    const session = chatSessionRecord({ visitorId: 'visitor-1', status: ChatSessionStatus.OPEN });
    const messages = [
      chatMessageRecord({ sessionId: session.id, role: ChatMessageRole.USER, content: 'Hello' }),
      chatMessageRecord({ sessionId: session.id, role: ChatMessageRole.ASSISTANT, content: 'Hi', metadata: { prompt: 'hidden', source: 'fallback' } }),
    ];
    const repository = {
      sessionForVisitor: async () => session,
      messagesForSession: async () => messages,
    };
    const service = new ChatbotService(repository as never, {} as never, {} as never, {} as never, {} as never, {} as never);

    await expect(service.messages(session.id, 'visitor-1')).resolves.toEqual({
      items: [messages[0], { ...messages[1], metadata: { intent: undefined, missingFields: undefined, source: 'fallback' } }],
    });
  });
});
