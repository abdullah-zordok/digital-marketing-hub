import { ChatMessageRole, ChatSessionStatus, LeadSource, LeadStatus } from '@prisma/client';

export interface ChatSessionResponse {
  id: string;
  visitorId: string | null;
  leadId: string | null;
  status: ChatSessionStatus;
  sourcePage: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessageResponse {
  id: string;
  sessionId: string;
  role: ChatMessageRole;
  content: string;
  metadata: unknown;
  createdAt: Date;
}

export interface ChatLeadResponse {
  id: string;
  source: LeadSource;
  status: LeadStatus;
}

export interface ChatMessageExchangeResponse {
  userMessage: ChatMessageResponse;
  assistantMessage: ChatMessageResponse;
  lead?: ChatLeadResponse;
}
