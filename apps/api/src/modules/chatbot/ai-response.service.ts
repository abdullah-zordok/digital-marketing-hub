import { Injectable } from '@nestjs/common';

import { fallbackAssistantReply, safeAssistantReply, unsafeChatbotRequest, unsafeRequestReply } from './chatbot-safety.util';
import { KnowledgeBaseRecord } from './chatbot.repository';

@Injectable()
export class AiResponseService {
  answerFor(question: string, knowledgeItems: KnowledgeBaseRecord[]): { content: string; metadata: Record<string, unknown> } {
    if (unsafeChatbotRequest(question)) {
      return { content: unsafeRequestReply(), metadata: { source: 'safety' } };
    }

    if (!knowledgeItems.length) {
      return { content: fallbackAssistantReply(), metadata: { source: 'fallback' } };
    }

    const answer = this.knowledgeAnswerFor(question, knowledgeItems);
    return { content: safeAssistantReply(answer), metadata: { source: 'knowledge' } };
  }

  private knowledgeAnswerFor(question: string, knowledgeItems: KnowledgeBaseRecord[]): string {
    const titles = knowledgeItems.map((knowledge) => knowledge.title).join(', ');
    const summary = knowledgeItems.map((knowledge) => knowledge.content).join(' ');
    return `Based on our approved knowledge about ${titles}, ${summary} For your question "${question}", the best next step is to share your goals so we can recommend the right service path.`;
  }
}
