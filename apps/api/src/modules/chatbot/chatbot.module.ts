import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { LeadsModule } from '../leads/leads.module';
import { UsersModule } from '../users/users.module';
import { OperationalLoggerService } from '../../common/services/operational-logger.service';
import { AiResponseService } from './ai-response.service';
import { ChatbotRepository } from './chatbot.repository';
import { ChatbotRateLimitService } from './chatbot-rate-limit.service';
import { ChatbotSessionsController } from './chatbot-sessions.controller';
import { ChatbotService } from './chatbot.service';
import { KnowledgeBaseController } from './knowledge-base.controller';
import { KnowledgeBaseService } from './knowledge-base.service';
import { KnowledgeSearchService } from './knowledge-search.service';
import { LeadIntentService } from './lead-intent.service';

@Module({
  imports: [AuthModule, UsersModule, LeadsModule],
  controllers: [ChatbotSessionsController, KnowledgeBaseController],
  providers: [
    ChatbotRepository,
    ChatbotService,
    KnowledgeBaseService,
    KnowledgeSearchService,
    AiResponseService,
    LeadIntentService,
    ChatbotRateLimitService,
    OperationalLoggerService,
  ],
  exports: [ChatbotRepository, ChatbotService, KnowledgeBaseService, LeadIntentService],
})
export class ChatbotModule {}
