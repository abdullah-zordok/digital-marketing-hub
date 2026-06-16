import { ConflictException } from '@nestjs/common';
import { KnowledgeBaseStatus } from '@prisma/client';

import { KnowledgeBaseService } from '../../../src/modules/chatbot/knowledge-base.service';
import { knowledgeBaseItemRecord } from '../../support/in-memory-prisma.service';

describe('KnowledgeBaseService', () => {
  it('activates non-empty draft knowledge', async () => {
    const draftKnowledge = knowledgeBaseItemRecord({ status: KnowledgeBaseStatus.DRAFT });
    const repository = {
      knowledgeById: async () => draftKnowledge,
      changeKnowledgeStatus: async () => ({ ...draftKnowledge, status: KnowledgeBaseStatus.ACTIVE }),
    };
    const service = new KnowledgeBaseService(repository as never);

    await expect(service.activate(draftKnowledge.id)).resolves.toMatchObject({ status: KnowledgeBaseStatus.ACTIVE });
  });

  it('rejects duplicate knowledge slugs', async () => {
    const existingKnowledge = knowledgeBaseItemRecord({ slug: 'seo-strategy' });
    const repository = {
      knowledgeBySlug: async () => existingKnowledge,
    };
    const service = new KnowledgeBaseService(repository as never);

    await expect(
      service.create({
        title: 'SEO',
        slug: 'seo-strategy',
        content: 'SEO guidance',
        sourceType: existingKnowledge.sourceType,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
