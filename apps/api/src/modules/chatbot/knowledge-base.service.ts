import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { KnowledgeBaseStatus } from '@prisma/client';

import { ensureValidSlug, normalizedSlug } from '../../common/utils/slug.util';
import { ChatbotRepository, KnowledgeBaseRecord } from './chatbot.repository';
import { KnowledgeBaseQueryDto, KnowledgeBaseWriteDto } from './dto/knowledge-base.dto';

@Injectable()
export class KnowledgeBaseService {
  constructor(private readonly chatbotRepository: ChatbotRepository) {}

  async list(query: KnowledgeBaseQueryDto): Promise<{ items: KnowledgeBaseRecord[]; meta: unknown }> {
    const knowledgePage = await this.chatbotRepository.knowledgeItems(query);
    return { items: knowledgePage.items, meta: knowledgePage.meta };
  }

  async read(id: string): Promise<KnowledgeBaseRecord> {
    return this.requiredKnowledge(await this.chatbotRepository.knowledgeById(id));
  }

  async create(knowledgeDto: KnowledgeBaseWriteDto): Promise<KnowledgeBaseRecord> {
    const slug = await this.availableSlugFor(knowledgeDto.slug);
    return this.chatbotRepository.createKnowledgeItem(slug, knowledgeDto);
  }

  async update(id: string, knowledgeDto: KnowledgeBaseWriteDto): Promise<KnowledgeBaseRecord> {
    this.requiredKnowledge(await this.chatbotRepository.knowledgeById(id));
    const slug = await this.availableSlugFor(knowledgeDto.slug, id);
    return this.chatbotRepository.updateKnowledgeItem(id, slug, knowledgeDto);
  }

  async activate(id: string): Promise<KnowledgeBaseRecord> {
    const knowledge = this.requiredKnowledge(await this.chatbotRepository.knowledgeById(id));

    if (!knowledge.content.trim()) {
      throw new BadRequestException('Knowledge content is required before activation');
    }

    return this.chatbotRepository.changeKnowledgeStatus(id, KnowledgeBaseStatus.ACTIVE);
  }

  async archive(id: string): Promise<KnowledgeBaseRecord> {
    this.requiredKnowledge(await this.chatbotRepository.knowledgeById(id));
    return this.chatbotRepository.changeKnowledgeStatus(id, KnowledgeBaseStatus.ARCHIVED);
  }

  async delete(id: string): Promise<{ deleted: true }> {
    this.requiredKnowledge(await this.chatbotRepository.knowledgeById(id));
    await this.chatbotRepository.softDeleteKnowledge(id);
    return { deleted: true };
  }

  private async availableSlugFor(slug: string, excludedId?: string): Promise<string> {
    const knowledgeSlug = normalizedSlug(slug);
    ensureValidSlug(knowledgeSlug);

    if (await this.chatbotRepository.knowledgeBySlug(knowledgeSlug, excludedId)) {
      throw new ConflictException('Knowledge slug is already in use');
    }

    return knowledgeSlug;
  }

  private requiredKnowledge(knowledge: KnowledgeBaseRecord | null): KnowledgeBaseRecord {
    if (!knowledge) {
      throw new NotFoundException('Knowledge item was not found');
    }

    return knowledge;
  }
}
