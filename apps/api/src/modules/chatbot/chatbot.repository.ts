import { Injectable } from '@nestjs/common';
import { ChatMessageRole, ChatSessionStatus, KnowledgeBaseStatus, KnowledgeSourceType } from '@prisma/client';

import { offsetFor, PaginatedRecords, paginatedRecords } from '../../common/utils/pagination.util';
import { PrismaService } from '../../database/prisma.service';
import { KnowledgeBaseQueryDto, KnowledgeBaseWriteDto } from './dto/knowledge-base.dto';

interface ChatSessionModel {
  create(query: Record<string, unknown>): Promise<ChatSessionRecord>;
  findFirst(query: Record<string, unknown>): Promise<ChatSessionRecord | null>;
  update(query: Record<string, unknown>): Promise<ChatSessionRecord>;
}

interface ChatMessageModel {
  create(query: Record<string, unknown>): Promise<ChatMessageRecord>;
  findMany(query: Record<string, unknown>): Promise<ChatMessageRecord[]>;
}

interface KnowledgeBaseModel {
  create(query: Record<string, unknown>): Promise<KnowledgeBaseRecord>;
  findFirst(query: Record<string, unknown>): Promise<KnowledgeBaseRecord | null>;
  findMany(query: Record<string, unknown>): Promise<KnowledgeBaseRecord[]>;
  count(query: Record<string, unknown>): Promise<number>;
  update(query: Record<string, unknown>): Promise<KnowledgeBaseRecord>;
}

export interface ChatSessionRecord {
  id: string;
  visitorId: string | null;
  leadId: string | null;
  status: ChatSessionStatus;
  sourcePage: string | null;
  userAgent: string | null;
  ipAddress: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface ChatMessageRecord {
  id: string;
  sessionId: string;
  role: ChatMessageRole;
  content: string;
  metadata: unknown;
  createdAt: Date;
}

export interface KnowledgeBaseRecord {
  id: string;
  title: string;
  slug: string;
  content: string;
  category: string | null;
  tags: string[];
  sourceType: KnowledgeSourceType;
  status: KnowledgeBaseStatus;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

@Injectable()
export class ChatbotRepository {
  private readonly chatSessions: ChatSessionModel;
  private readonly chatMessages: ChatMessageModel;
  private readonly knowledgeBaseItems: KnowledgeBaseModel;

  constructor(prismaService: PrismaService) {
    this.chatSessions = prismaService.chatSession as unknown as ChatSessionModel;
    this.chatMessages = prismaService.chatMessage as unknown as ChatMessageModel;
    this.knowledgeBaseItems = prismaService.knowledgeBaseItem as unknown as KnowledgeBaseModel;
  }

  async createSession(visitorId?: string, sourcePage?: string, ipAddress?: string, userAgent?: string): Promise<ChatSessionRecord> {
    return this.chatSessions.create({ data: { visitorId, sourcePage, ipAddress, userAgent } });
  }

  async sessionForVisitor(sessionId: string, visitorId: string): Promise<ChatSessionRecord | null> {
    return this.chatSessions.findFirst({ where: { id: sessionId, visitorId, deletedAt: null } });
  }

  async attachLeadToSession(sessionId: string, leadId: string): Promise<ChatSessionRecord> {
    return this.chatSessions.update({ where: { id: sessionId }, data: { leadId } });
  }

  async createMessage(sessionId: string, role: ChatMessageRole, content: string, metadata?: unknown): Promise<ChatMessageRecord> {
    return this.chatMessages.create({ data: { sessionId, role, content, metadata } });
  }

  async messagesForSession(sessionId: string): Promise<ChatMessageRecord[]> {
    return this.chatMessages.findMany({ where: { sessionId }, orderBy: { createdAt: 'asc' } });
  }

  async activeKnowledgeItems(): Promise<KnowledgeBaseRecord[]> {
    return this.knowledgeBaseItems.findMany({
      where: { status: KnowledgeBaseStatus.ACTIVE, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async knowledgeItems(query: KnowledgeBaseQueryDto): Promise<PaginatedRecords<KnowledgeBaseRecord>> {
    const where = this.knowledgeWhereFor(query);
    const [items, totalItems] = await Promise.all([
      this.knowledgeBaseItems.findMany({ where, orderBy: { createdAt: 'desc' }, skip: offsetFor(query.page, query.limit), take: query.limit }),
      this.knowledgeBaseItems.count({ where }),
    ]);

    return paginatedRecords(items, query.page, query.limit, totalItems);
  }

  async createKnowledgeItem(slug: string, knowledgeDto: KnowledgeBaseWriteDto): Promise<KnowledgeBaseRecord> {
    return this.knowledgeBaseItems.create({ data: { ...knowledgeDto, slug, tags: knowledgeDto.tags ?? [], status: KnowledgeBaseStatus.DRAFT } });
  }

  async updateKnowledgeItem(id: string, slug: string, knowledgeDto: KnowledgeBaseWriteDto): Promise<KnowledgeBaseRecord> {
    return this.knowledgeBaseItems.update({ where: { id }, data: { ...knowledgeDto, slug, tags: knowledgeDto.tags ?? [] } });
  }

  async knowledgeById(id: string): Promise<KnowledgeBaseRecord | null> {
    return this.knowledgeBaseItems.findFirst({ where: { id, deletedAt: null } });
  }

  async knowledgeBySlug(slug: string, excludedId?: string): Promise<KnowledgeBaseRecord | null> {
    const where = excludedId ? { slug, deletedAt: null, NOT: { id: excludedId } } : { slug, deletedAt: null };
    return this.knowledgeBaseItems.findFirst({ where });
  }

  async changeKnowledgeStatus(id: string, status: KnowledgeBaseStatus): Promise<KnowledgeBaseRecord> {
    return this.knowledgeBaseItems.update({ where: { id }, data: { status } });
  }

  async softDeleteKnowledge(id: string): Promise<KnowledgeBaseRecord> {
    return this.knowledgeBaseItems.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  private knowledgeWhereFor(query: KnowledgeBaseQueryDto): Record<string, unknown> {
    return {
      deletedAt: null,
      ...(query.status ? { status: query.status } : {}),
      ...(query.sourceType ? { sourceType: query.sourceType } : {}),
      ...(query.category ? { category: query.category } : {}),
      ...(query.tag ? { tags: { has: query.tag } } : {}),
      ...(query.search ? { OR: [{ title: { contains: query.search } }, { content: { contains: query.search } }] } : {}),
    };
  }
}
