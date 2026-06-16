import { Injectable } from '@nestjs/common';

import { ChatbotRepository, KnowledgeBaseRecord } from './chatbot.repository';

@Injectable()
export class KnowledgeSearchService {
  constructor(private readonly chatbotRepository: ChatbotRepository) {}

  async relevantKnowledgeFor(question: string): Promise<KnowledgeBaseRecord[]> {
    const searchTerms = this.searchTermsFor(question);
    const activeKnowledge = await this.chatbotRepository.activeKnowledgeItems();
    return activeKnowledge.filter((knowledge) => this.knowledgeMatchesTerms(knowledge, searchTerms)).slice(0, 3);
  }

  private searchTermsFor(question: string): string[] {
    return question
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((term) => term.length > 2);
  }

  private knowledgeMatchesTerms(knowledge: KnowledgeBaseRecord, terms: string[]): boolean {
    const searchableText = [knowledge.title, knowledge.content, knowledge.category, ...knowledge.tags]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return terms.some((term) => searchableText.includes(term));
  }
}
