import { Injectable, NotFoundException } from '@nestjs/common';
import { ChatMessageRole, ChatSessionStatus, LeadSource } from '@prisma/client';

import { LeadsService } from '../leads/leads.service';
import { AiResponseService } from './ai-response.service';
import { ChatbotRateLimitService } from './chatbot-rate-limit.service';
import { publicMessageMetadata } from './chatbot-safety.util';
import { ChatbotRepository, ChatMessageRecord, ChatSessionRecord } from './chatbot.repository';
import { ChatMessageExchangeResponse } from './dto/chatbot-response.dto';
import { CreateChatSessionDto, SendChatMessageDto } from './dto/chat-session.dto';
import { LeadIntentService } from './lead-intent.service';
import { KnowledgeSearchService } from './knowledge-search.service';

@Injectable()
export class ChatbotService {
  constructor(
    private readonly chatbotRepository: ChatbotRepository,
    private readonly knowledgeSearchService: KnowledgeSearchService,
    private readonly aiResponseService: AiResponseService,
    private readonly leadIntentService: LeadIntentService,
    private readonly chatbotRateLimitService: ChatbotRateLimitService,
    private readonly leadsService: LeadsService,
  ) {}

  async createSession(sessionDto: CreateChatSessionDto, ipAddress?: string, userAgent?: string): Promise<ChatSessionRecord> {
    return this.chatbotRepository.createSession(sessionDto.visitorId, sessionDto.sourcePage, ipAddress, userAgent);
  }

  async sendMessage(sessionId: string, messageDto: SendChatMessageDto, source: string): Promise<ChatMessageExchangeResponse> {
    await this.chatbotRateLimitService.ensureMessageAllowed(messageDto.visitorId, source);
    const session = await this.openSessionForVisitor(sessionId, messageDto.visitorId);
    const userMessage = await this.chatbotRepository.createMessage(session.id, ChatMessageRole.USER, messageDto.content);
    const lead = await this.leadFromMessage(session.id, messageDto.content);
    const assistantMessage = await this.assistantMessageFor(session.id, messageDto.content);
    return { userMessage, assistantMessage: this.publicAssistantMessage(assistantMessage), ...(lead ? { lead } : {}) };
  }

  async messages(sessionId: string, visitorId: string): Promise<{ items: ChatMessageRecord[] }> {
    await this.sessionForVisitor(sessionId, visitorId);
    const messages = await this.chatbotRepository.messagesForSession(sessionId);
    return { items: messages.map((message) => this.publicAssistantMessage(message)) };
  }

  private async assistantMessageFor(sessionId: string, content: string): Promise<ChatMessageRecord> {
    const knowledgeItems = await this.knowledgeSearchService.relevantKnowledgeFor(content);
    const response = this.aiResponseService.answerFor(content, knowledgeItems);
    const intent = this.leadIntentService.intentFor(content);
    const metadata = { ...response.metadata, intent: intent.hasBuyingIntent, missingFields: intent.missingFields };
    return this.chatbotRepository.createMessage(sessionId, ChatMessageRole.ASSISTANT, response.content, metadata);
  }

  private async leadFromMessage(sessionId: string, content: string) {
    const intent = this.leadIntentService.intentFor(content);

    if (!intent.hasBuyingIntent || intent.missingFields.length) {
      return undefined;
    }

    const lead = await this.leadsService.createPublicLead(intent.leadDetails, LeadSource.CHATBOT);
    await this.chatbotRepository.attachLeadToSession(sessionId, lead.id);
    return { id: lead.id, source: lead.source, status: lead.status };
  }

  private async openSessionForVisitor(sessionId: string, visitorId: string): Promise<ChatSessionRecord> {
    const session = await this.sessionForVisitor(sessionId, visitorId);

    if (session.status !== ChatSessionStatus.OPEN) {
      throw new NotFoundException('Chat session is closed');
    }

    return session;
  }

  private async sessionForVisitor(sessionId: string, visitorId: string): Promise<ChatSessionRecord> {
    const session = await this.chatbotRepository.sessionForVisitor(sessionId, visitorId);

    if (!session) {
      throw new NotFoundException('Chat session was not found');
    }

    return session;
  }

  private publicAssistantMessage(message: ChatMessageRecord): ChatMessageRecord {
    return { ...message, metadata: publicMessageMetadata(message.metadata) };
  }
}
