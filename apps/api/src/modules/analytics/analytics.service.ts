import { Injectable } from '@nestjs/common';
import { ContentStatus, LeadStatus } from '@prisma/client';

import { PrismaService } from '../../database/prisma.service';
import { AnalyticsOverviewDto } from './dto/analytics-overview.dto';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prismaService: PrismaService) {}

  async overview(): Promise<AnalyticsOverviewDto> {
    const [
      totalLeads,
      newLeads,
      qualifiedLeads,
      totalBlogPosts,
      publishedBlogPosts,
      totalServices,
      publishedServices,
      totalChatbotSessions,
      totalChatbotMessages,
    ] = await Promise.all([
      this.count(this.prismaService.lead),
      this.count(this.prismaService.lead, { status: LeadStatus.NEW }),
      this.count(this.prismaService.lead, { status: LeadStatus.QUALIFIED }),
      this.count(this.prismaService.blogPost, { deletedAt: null }),
      this.count(this.prismaService.blogPost, { deletedAt: null, status: ContentStatus.PUBLISHED }),
      this.count(this.prismaService.service, { deletedAt: null }),
      this.count(this.prismaService.service, { deletedAt: null, status: ContentStatus.PUBLISHED }),
      this.count(this.prismaService.chatSession, { deletedAt: null }),
      this.count(this.prismaService.chatMessage),
    ]);

    return {
      totalLeads,
      newLeads,
      qualifiedLeads,
      totalBlogPosts,
      publishedBlogPosts,
      totalServices,
      publishedServices,
      totalChatbotSessions,
      totalChatbotMessages,
      generatedAt: new Date().toISOString(),
    };
  }

  private async count(model: { count(query?: { where?: Record<string, unknown> }): Promise<number> }, where?: Record<string, unknown>): Promise<number> {
    return model.count(where ? { where } : undefined);
  }
}
