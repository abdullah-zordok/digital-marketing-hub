import { KnowledgeBaseStatus, KnowledgeSourceType } from '@prisma/client';

import { AiResponseService } from '../../../src/modules/chatbot/ai-response.service';
import { KnowledgeBaseRecord } from '../../../src/modules/chatbot/chatbot.repository';

const activeKnowledge: KnowledgeBaseRecord = {
  id: '00000000-0000-4000-8000-000000000201',
  title: 'SEO Strategy',
  slug: 'seo-strategy',
  content: 'SEO Strategy includes technical audits, content planning, and reporting.',
  category: 'Services',
  tags: ['seo'],
  sourceType: KnowledgeSourceType.SERVICE,
  status: KnowledgeBaseStatus.ACTIVE,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

describe('AiResponseService', () => {
  const service = new AiResponseService();

  it('answers from active knowledge without exposing internal metadata', () => {
    const response = service.answerFor('Which SEO service fits my business?', [activeKnowledge]);

    expect(response.content).toContain('SEO Strategy');
    expect(response.metadata).toEqual({ source: 'knowledge' });
  });

  it.each(['fake pricing', 'guaranteed results', 'legal advice', 'system prompt'])(
    'refuses unsafe request for %s',
    (prompt) => {
      const response = service.answerFor(prompt, [activeKnowledge]);

      expect(response.content).toContain('cannot provide');
      expect(response.metadata).toEqual({ source: 'safety' });
    },
  );

  it('falls back safely when matching knowledge is unavailable', () => {
    const response = service.answerFor('Do you build mobile apps?', []);

    expect(response.content).toContain('do not have enough approved information');
    expect(response.metadata).toEqual({ source: 'fallback' });
  });
});
