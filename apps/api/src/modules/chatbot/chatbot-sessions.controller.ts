import { Body, Controller, Get, Headers, Ip, Param, Post, Query } from '@nestjs/common';

import { ChatbotService } from './chatbot.service';
import { ChatSessionRecord } from './chatbot.repository';
import { ChatMessageExchangeResponse } from './dto/chatbot-response.dto';
import { ChatMessagesQueryDto, CreateChatSessionDto, SendChatMessageDto } from './dto/chat-session.dto';

@Controller('chatbot/sessions')
export class ChatbotSessionsController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post()
  async create(
    @Body() sessionDto: CreateChatSessionDto,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent?: string,
  ): Promise<{ message: string; payload: ChatSessionRecord }> {
    return { message: 'Chat session created', payload: await this.chatbotService.createSession(sessionDto, ipAddress, userAgent) };
  }

  @Post(':sessionId/messages')
  async sendMessage(
    @Param('sessionId') sessionId: string,
    @Body() messageDto: SendChatMessageDto,
    @Ip() sourceAddress: string,
  ): Promise<{ message: string; payload: ChatMessageExchangeResponse }> {
    return { message: 'Chat message saved', payload: await this.chatbotService.sendMessage(sessionId, messageDto, sourceAddress) };
  }

  @Get(':sessionId/messages')
  async messages(
    @Param('sessionId') sessionId: string,
    @Query() query: ChatMessagesQueryDto,
  ): Promise<{ message: string; payload: { items: unknown[] } }> {
    return { message: 'Chat messages retrieved', payload: await this.chatbotService.messages(sessionId, query.visitorId) };
  }
}
