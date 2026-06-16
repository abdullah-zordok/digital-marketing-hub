const UNSAFE_PATTERNS = [
  /internal (prompt|instruction|system)/i,
  /system prompt/i,
  /guarantee(d)? (results|ranking|sales|revenue)/i,
  /fake (price|pricing|quote)/i,
  /legal advice/i,
  /financial advice/i,
  /secret|credential|api key/i,
];

const BLOCKED_RESPONSE =
  'I cannot provide unsupported guarantees, private instructions, legal advice, financial advice, or invented pricing. I can explain our services and help collect details for a consultation.';

const FALLBACK_RESPONSE =
  'I do not have enough approved information to answer that confidently. Share your question and contact details, and our team can follow up with accurate guidance.';

export function unsafeChatbotRequest(content: string): boolean {
  return UNSAFE_PATTERNS.some((pattern) => pattern.test(content));
}

export function safeAssistantReply(content: string): string {
  return unsafeChatbotRequest(content) ? BLOCKED_RESPONSE : content;
}

export function unsafeRequestReply(): string {
  return BLOCKED_RESPONSE;
}

export function fallbackAssistantReply(): string {
  return FALLBACK_RESPONSE;
}

export function publicMessageMetadata(metadata: unknown): unknown {
  if (!metadata || typeof metadata !== 'object') {
    return metadata ?? null;
  }

  const publicMetadata = metadata as Record<string, unknown>;
  return {
    intent: publicMetadata.intent,
    missingFields: publicMetadata.missingFields,
    source: publicMetadata.source,
  };
}
