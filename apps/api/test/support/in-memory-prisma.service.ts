import {
  BlogCategory,
  BlogPost,
  ChatMessage,
  ChatMessageRole,
  ChatSession,
  ChatSessionStatus,
  ContentStatus,
  KnowledgeBaseItem,
  KnowledgeBaseStatus,
  KnowledgeSourceType,
  Lead,
  LeadNotification,
  LeadNotificationStatus,
  LeadSource,
  LeadStatus,
  Service,
  UploadedFile,
  User,
  UserRole,
  UserStatus,
} from '@prisma/client';
import { randomUUID } from 'node:crypto';

export class InMemoryPrismaService {
  readonly user = {
    findFirst: async (query: { where: Partial<User> }): Promise<User | null> =>
      this.findFirstUser(query.where),
    update: async (query: {
      where: { id: string };
      data: Partial<User> & { tokenVersion?: { increment: number } };
    }): Promise<User> => this.updateUser(query.where.id, query.data),
  };

  readonly service = {
    findFirst: async (query: { where: Record<string, unknown> }): Promise<Service | null> =>
      this.findFirstRecord(this.servicesById, query.where),
    findMany: async (query: Record<string, unknown>): Promise<Service[]> =>
      this.findManyRecords(this.servicesById, query) as Service[],
    count: async (query: { where: Record<string, unknown> }): Promise<number> =>
      this.findManyRecords(this.servicesById, query).length,
    create: async (query: { data: Partial<Service> }): Promise<Service> =>
      this.createService(query.data),
    update: async (query: { where: { id: string }; data: Partial<Service> }): Promise<Service> =>
      this.updateRecord(this.servicesById, query.where.id, query.data),
  };

  readonly blogCategory = {
    findFirst: async (query: { where: Record<string, unknown> }): Promise<BlogCategory | null> =>
      this.findFirstRecord(this.blogCategoriesById, query.where),
    findMany: async (query: Record<string, unknown>): Promise<BlogCategory[]> =>
      this.findManyCategories(query),
    count: async (query: { where: Record<string, unknown> }): Promise<number> =>
      this.findManyCategories(query).length,
    create: async (query: { data: Partial<BlogCategory> }): Promise<BlogCategory> =>
      this.createBlogCategory(query.data),
    update: async (query: { where: { id: string }; data: Partial<BlogCategory> }): Promise<BlogCategory> =>
      this.updateRecord(this.blogCategoriesById, query.where.id, query.data),
  };

  readonly blogPost = {
    findFirst: async (query: { where: Record<string, unknown> }): Promise<BlogPost | null> =>
      this.findFirstPost(query.where),
    findMany: async (query: Record<string, unknown>): Promise<BlogPost[]> =>
      this.findManyPosts(query),
    count: async (query: { where: Record<string, unknown> }): Promise<number> =>
      this.findManyPosts(query).length,
    create: async (query: { data: Partial<BlogPost> }): Promise<BlogPost> =>
      this.createBlogPost(query.data),
    update: async (query: { where: { id: string }; data: Partial<BlogPost> }): Promise<BlogPost> =>
      this.updateRecord(this.blogPostsById, query.where.id, query.data),
  };

  readonly uploadedFile = {
    create: async (query: { data: Partial<UploadedFile> }): Promise<UploadedFile> =>
      this.createUploadedFile(query.data),
  };

  readonly chatSession = {
    create: async (query: { data: Partial<ChatSession> }): Promise<ChatSession> =>
      this.createChatSession(query.data),
    findFirst: async (query: { where: Record<string, unknown> }): Promise<ChatSession | null> =>
      this.findFirstRecord(this.chatSessionsById, query.where),
    count: async (query: { where: Record<string, unknown> }): Promise<number> =>
      this.findManyRecords(this.chatSessionsById, query).length,
    update: async (query: { where: { id: string }; data: Partial<ChatSession> }): Promise<ChatSession> =>
      this.updateRecord(this.chatSessionsById, query.where.id, query.data),
  };

  readonly chatMessage = {
    create: async (query: { data: Partial<ChatMessage> }): Promise<ChatMessage> =>
      this.createChatMessage(query.data),
    findMany: async (query: Record<string, unknown>): Promise<ChatMessage[]> =>
      this.findManyRecords(this.chatMessagesById, query) as ChatMessage[],
    count: async (query?: { where: Record<string, unknown> }): Promise<number> =>
      this.findManyRecords(this.chatMessagesById, query ?? {}).length,
  };

  readonly knowledgeBaseItem = {
    create: async (query: { data: Partial<KnowledgeBaseItem> }): Promise<KnowledgeBaseItem> =>
      this.createKnowledgeBaseItem(query.data),
    findFirst: async (query: { where: Record<string, unknown> }): Promise<KnowledgeBaseItem | null> =>
      this.findFirstRecord(this.knowledgeBaseItemsById, query.where),
    findMany: async (query: Record<string, unknown>): Promise<KnowledgeBaseItem[]> =>
      this.findManyRecords(this.knowledgeBaseItemsById, query) as KnowledgeBaseItem[],
    count: async (query: { where: Record<string, unknown> }): Promise<number> =>
      this.findManyRecords(this.knowledgeBaseItemsById, query).length,
    update: async (query: { where: { id: string }; data: Partial<KnowledgeBaseItem> }): Promise<KnowledgeBaseItem> =>
      this.updateRecord(this.knowledgeBaseItemsById, query.where.id, query.data),
  };

  readonly lead = {
    create: async (query: { data: Partial<Lead> }): Promise<Lead> =>
      this.createLead(query.data),
    findFirst: async (query: { where: Record<string, unknown>; include?: Record<string, unknown> }): Promise<Lead | null> =>
      this.leadWithIncludes(this.findFirstRecord(this.leadsById, query.where), query.include),
    findMany: async (query: Record<string, unknown>): Promise<Lead[]> =>
      (this.findManyRecords(this.leadsById, query) as Lead[]).map((lead) => this.leadWithNotifications(lead, query.include as Record<string, unknown>)),
    count: async (query: { where: Record<string, unknown> }): Promise<number> =>
      this.findManyRecords(this.leadsById, query).length,
    update: async (query: { where: { id: string }; data: Partial<Lead>; include?: Record<string, unknown> }): Promise<Lead> =>
      this.leadWithNotifications(this.updateRecord(this.leadsById, query.where.id, query.data), query.include),
  };

  readonly leadNotification = {
    create: async (query: { data: Partial<LeadNotification> }): Promise<LeadNotification> =>
      this.createLeadNotification(query.data),
    update: async (query: { where: { id: string }; data: Partial<LeadNotification> }): Promise<LeadNotification> =>
      this.updateRecord(this.leadNotificationsById, query.where.id, query.data),
  };

  private readonly usersByEmail = new Map<string, User>();
  private readonly servicesById = new Map<string, Service>();
  private readonly blogCategoriesById = new Map<string, BlogCategory>();
  private readonly blogPostsById = new Map<string, BlogPost>();
  private readonly uploadedFilesById = new Map<string, UploadedFile>();
  private readonly chatSessionsById = new Map<string, ChatSession>();
  private readonly chatMessagesById = new Map<string, ChatMessage>();
  private readonly knowledgeBaseItemsById = new Map<string, KnowledgeBaseItem>();
  private readonly leadsById = new Map<string, Lead>();
  private readonly leadNotificationsById = new Map<string, LeadNotification>();

  addUser(user: User): void {
    this.usersByEmail.set(user.email.toLowerCase(), user);
  }

  addService(service: Service): void {
    this.servicesById.set(service.id, service);
  }

  addBlogCategory(category: BlogCategory): void {
    this.blogCategoriesById.set(category.id, category);
  }

  addBlogPost(post: BlogPost): void {
    this.blogPostsById.set(post.id, post);
  }

  addKnowledgeBaseItem(knowledgeBaseItem: KnowledgeBaseItem): void {
    this.knowledgeBaseItemsById.set(knowledgeBaseItem.id, knowledgeBaseItem);
  }

  addChatSession(chatSession: ChatSession): void {
    this.chatSessionsById.set(chatSession.id, chatSession);
  }

  addChatMessage(chatMessage: ChatMessage): void {
    this.chatMessagesById.set(chatMessage.id, chatMessage);
  }

  addLead(lead: Lead): void {
    this.leadsById.set(lead.id, lead);
  }

  async databaseIsReady(): Promise<boolean> {
    return true;
  }

  private findFirstUser(where: Partial<User>): User | null {
    return (
      [...this.usersByEmail.values()].find((candidate) =>
        this.userMatchesWhere(candidate, where),
      ) ?? null
    );
  }

  private updateUser(userId: string, data: Partial<User> & { tokenVersion?: { increment: number } }): User {
    const user = [...this.usersByEmail.values()].find((candidate) => candidate.id === userId);

    if (!user) {
      throw new Error(`User ${userId} was not found`);
    }

    if (data.lastLoginAt !== undefined) {
      user.lastLoginAt = data.lastLoginAt;
    }

    if (data.tokenVersion) {
      user.tokenVersion += data.tokenVersion.increment;
    }

    return user;
  }

  private userMatchesWhere(user: User, where: Partial<User>): boolean {
    return Object.entries(where).every(([field, expectedValue]) => {
      const userValue = user[field as keyof User];
      return userValue === expectedValue;
    });
  }

  private createService(serviceFields: Partial<Service>): Service {
    const service = serviceRecord({ ...serviceFields, id: serviceFields.id ?? randomUUID() });
    this.servicesById.set(service.id, service);
    return service;
  }

  private createBlogCategory(categoryFields: Partial<BlogCategory>): BlogCategory {
    const category = blogCategoryRecord({ ...categoryFields, id: categoryFields.id ?? randomUUID() });
    this.blogCategoriesById.set(category.id, category);
    return category;
  }

  private createBlogPost(postFields: Partial<BlogPost>): BlogPost {
    const post = blogPostRecord({ ...postFields, id: postFields.id ?? randomUUID() });
    this.blogPostsById.set(post.id, post);
    return this.postWithCategory(post) as BlogPost;
  }

  private createUploadedFile(uploadFields: Partial<UploadedFile>): UploadedFile {
    const uploadedFile = uploadedFileRecord({ ...uploadFields, id: uploadFields.id ?? randomUUID() });
    this.uploadedFilesById.set(uploadedFile.id, uploadedFile);
    return uploadedFile;
  }

  private createChatSession(sessionFields: Partial<ChatSession>): ChatSession {
    const chatSession = chatSessionRecord({ ...sessionFields, id: sessionFields.id ?? randomUUID() });
    this.chatSessionsById.set(chatSession.id, chatSession);
    return chatSession;
  }

  private createChatMessage(messageFields: Partial<ChatMessage>): ChatMessage {
    const chatMessage = chatMessageRecord({ ...messageFields, id: messageFields.id ?? randomUUID() });
    this.chatMessagesById.set(chatMessage.id, chatMessage);
    return chatMessage;
  }

  private createKnowledgeBaseItem(knowledgeFields: Partial<KnowledgeBaseItem>): KnowledgeBaseItem {
    const knowledgeBaseItem = knowledgeBaseItemRecord({ ...knowledgeFields, id: knowledgeFields.id ?? randomUUID() });
    this.knowledgeBaseItemsById.set(knowledgeBaseItem.id, knowledgeBaseItem);
    return knowledgeBaseItem;
  }

  private createLead(leadFields: Partial<Lead>): Lead {
    const lead = leadRecord({ ...leadFields, id: leadFields.id ?? randomUUID() });
    this.leadsById.set(lead.id, lead);
    return lead;
  }

  private createLeadNotification(notificationFields: Partial<LeadNotification>): LeadNotification {
    const notification = leadNotificationRecord({ ...notificationFields, id: notificationFields.id ?? randomUUID() });
    this.leadNotificationsById.set(notification.id, notification);
    return notification;
  }

  private updateRecord<TRecord extends { id: string; updatedAt: Date }>(
    recordsById: Map<string, TRecord>,
    id: string,
    recordFields: Partial<TRecord>,
  ): TRecord {
    const record = recordsById.get(id);

    if (!record) {
      throw new Error(`Record ${id} was not found`);
    }

    Object.assign(record, recordFields, { updatedAt: new Date() });
    return this.postWithCategory(record) as TRecord;
  }

  private findFirstRecord<TRecord extends object>(
    recordsById: Map<string, TRecord>,
    where: Record<string, unknown>,
  ): TRecord | null {
    return this.findManyRecords(recordsById, { where })[0] ?? null;
  }

  private findManyRecords<TRecord extends object>(
    recordsById: Map<string, TRecord>,
    query: Record<string, unknown> = {},
  ): TRecord[] {
    const where = (query.where as Record<string, unknown>) ?? {};
    const records = [...recordsById.values()].filter((record) => this.recordMatchesWhere(record, where));
    return this.applyWindow(this.applyOrdering(records, query.orderBy), query);
  }

  private findManyCategories(query: Record<string, unknown>): BlogCategory[] {
    const categories = this.findManyRecords(this.blogCategoriesById, query) as BlogCategory[];
    return categories.filter((category) => this.categoryMatchesPostsClause(category, query));
  }

  private findFirstPost(where: Record<string, unknown>): BlogPost | null {
    return this.findManyPosts({ where })[0] ?? null;
  }

  private findManyPosts(query: Record<string, unknown>): BlogPost[] {
    return (this.findManyRecords(this.blogPostsById, query) as BlogPost[]).map((post) =>
      this.postWithCategory(post),
    ) as BlogPost[];
  }

  private recordMatchesWhere(record: object, where: Record<string, unknown>): boolean {
    return Object.entries(where).every(([field, expected]) => this.fieldMatches(record, field, expected));
  }

  private fieldMatches(record: object, field: string, expected: unknown): boolean {
    if (field === 'NOT') {
      return !this.recordMatchesWhere(record, expected as Record<string, unknown>);
    }

    if (field === 'OR') {
      return (expected as Record<string, unknown>[]).some((clause) => this.recordMatchesWhere(record, clause));
    }

    if (field === 'category') {
      return this.categoryClauseMatches(record as BlogPost, expected as Record<string, unknown>);
    }

    if (field === 'tags') {
      return this.tagsClauseMatches((record as BlogPost | KnowledgeBaseItem).tags, expected as Record<string, unknown>);
    }

    const recordField = record[field as keyof typeof record];
    return this.scalarMatches(recordField, expected);
  }

  private scalarMatches(recordField: unknown, expected: unknown): boolean {
    if (expected && typeof expected === 'object' && 'in' in expected) {
      return (expected as { in: unknown[] }).in.includes(recordField);
    }

    if (expected && typeof expected === 'object' && 'contains' in expected) {
      const contains = String((expected as { contains: string }).contains).toLowerCase();
      return String(recordField ?? '').toLowerCase().includes(contains);
    }

    return recordField === expected;
  }

  private tagsClauseMatches(tags: string[], clause: Record<string, unknown>): boolean {
    return typeof clause.has === 'string' ? tags.includes(clause.has) : true;
  }

  private categoryClauseMatches(post: BlogPost, clause: Record<string, unknown>): boolean {
    const category = post.categoryId ? this.blogCategoriesById.get(post.categoryId) : null;
    return Boolean(category && this.recordMatchesWhere(category, clause));
  }

  private categoryMatchesPostsClause(category: BlogCategory, query: Record<string, unknown>): boolean {
    const where = (query.where as Record<string, unknown>) ?? {};
    const postsClause = (where.posts as { some?: Record<string, unknown> } | undefined)?.some;

    if (!postsClause) {
      return true;
    }

    return [...this.blogPostsById.values()].some((post) =>
      post.categoryId === category.id && this.recordMatchesWhere(post, postsClause),
    );
  }

  private postWithCategory(record: object): object {
    if (!('categoryId' in record)) {
      return record;
    }

    const post = record as BlogPost & { category?: BlogCategory | null };
    post.category = post.categoryId ? this.blogCategoriesById.get(post.categoryId) ?? null : null;
    return post;
  }

  private leadWithIncludes(lead: Lead | null, include?: Record<string, unknown>): Lead | null {
    if (!lead || !include?.notifications) {
      return lead;
    }

    return this.leadWithNotifications(lead, include);
  }

  private leadWithNotifications(lead: Lead, include?: Record<string, unknown>): Lead {
    if (!include?.notifications) {
      return lead;
    }

    return { ...lead, notifications: [...this.leadNotificationsById.values()].filter((notification) => notification.leadId === lead.id) } as Lead;
  }

  private applyOrdering<TRecord extends object>(records: TRecord[], orderBy: unknown): TRecord[] {
    const orderRules = Array.isArray(orderBy) ? orderBy : orderBy ? [orderBy] : [];
    const sortedRecords = [...records];

    sortedRecords.sort((leftRecord, rightRecord) => this.compareRecords(leftRecord, rightRecord, orderRules));
    return sortedRecords;
  }

  private compareRecords(leftRecord: object, rightRecord: object, orderRules: unknown[]): number {
    for (const orderRule of orderRules as Record<string, 'asc' | 'desc'>[]) {
      const [field, direction] = Object.entries(orderRule)[0];
      const comparison = this.compareScalar(
        leftRecord[field as keyof typeof leftRecord],
        rightRecord[field as keyof typeof rightRecord],
      );

      if (comparison !== 0) {
        return direction === 'desc' ? -comparison : comparison;
      }
    }

    return 0;
  }

  private compareScalar(leftScalar: unknown, rightScalar: unknown): number {
    const leftComparable = leftScalar instanceof Date ? leftScalar.getTime() : leftScalar ?? 0;
    const rightComparable = rightScalar instanceof Date ? rightScalar.getTime() : rightScalar ?? 0;
    return leftComparable > rightComparable ? 1 : leftComparable < rightComparable ? -1 : 0;
  }

  private applyWindow<TRecord>(records: TRecord[], query: Record<string, unknown>): TRecord[] {
    const skip = Number(query.skip ?? 0);
    const take = query.take === undefined ? records.length : Number(query.take);
    return records.slice(skip, skip + take);
  }
}

export function testUser(
  id: string,
  email: string,
  role: UserRole,
  passwordHash: string,
): User {
  const now = new Date();

  return {
    id,
    email,
    name: email.split('@')[0],
    passwordHash,
    role,
    status: UserStatus.ACTIVE,
    tokenVersion: 0,
    lastLoginAt: null,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };
}

export function serviceRecord(serviceFields: Partial<Service>): Service {
  const now = new Date();

  return {
    id: serviceFields.id ?? randomUUID(),
    name: serviceFields.name ?? 'SEO',
    title: serviceFields.title ?? 'SEO Strategy',
    slug: serviceFields.slug ?? 'seo-strategy',
    shortDescription: serviceFields.shortDescription ?? 'SEO growth support',
    fullDescription: serviceFields.fullDescription ?? 'SEO planning and execution',
    icon: serviceFields.icon ?? null,
    coverImage: serviceFields.coverImage ?? null,
    benefits: serviceFields.benefits ?? [],
    processSteps: serviceFields.processSteps ?? [],
    targetAudience: serviceFields.targetAudience ?? [],
    expectedResults: serviceFields.expectedResults ?? [],
    faqs: serviceFields.faqs ?? [],
    status: serviceFields.status ?? ContentStatus.DRAFT,
    sortOrder: serviceFields.sortOrder ?? 0,
    seoTitle: serviceFields.seoTitle ?? null,
    seoDescription: serviceFields.seoDescription ?? null,
    canonicalUrl: serviceFields.canonicalUrl ?? null,
    openGraphImage: serviceFields.openGraphImage ?? null,
    createdAt: serviceFields.createdAt ?? now,
    updatedAt: serviceFields.updatedAt ?? now,
    deletedAt: serviceFields.deletedAt ?? null,
  };
}

export function blogCategoryRecord(categoryFields: Partial<BlogCategory>): BlogCategory {
  const now = new Date();

  return {
    id: categoryFields.id ?? randomUUID(),
    name: categoryFields.name ?? 'SEO',
    slug: categoryFields.slug ?? 'seo',
    description: categoryFields.description ?? 'SEO articles',
    createdAt: categoryFields.createdAt ?? now,
    updatedAt: categoryFields.updatedAt ?? now,
    deletedAt: categoryFields.deletedAt ?? null,
  };
}

export function blogPostRecord(postFields: Partial<BlogPost>): BlogPost {
  const now = new Date();

  return {
    id: postFields.id ?? randomUUID(),
    title: postFields.title ?? 'SEO Playbook',
    slug: postFields.slug ?? 'seo-playbook',
    excerpt: postFields.excerpt ?? 'SEO article excerpt',
    content: postFields.content ?? 'SEO article body',
    coverImage: postFields.coverImage ?? null,
    authorId: postFields.authorId ?? null,
    categoryId: postFields.categoryId ?? null,
    tags: postFields.tags ?? ['seo'],
    status: postFields.status ?? ContentStatus.DRAFT,
    publishedAt: postFields.publishedAt ?? null,
    seoTitle: postFields.seoTitle ?? null,
    seoDescription: postFields.seoDescription ?? null,
    canonicalUrl: postFields.canonicalUrl ?? null,
    openGraphImage: postFields.openGraphImage ?? null,
    readingTime: postFields.readingTime ?? null,
    popularityScore: postFields.popularityScore ?? 0,
    createdAt: postFields.createdAt ?? now,
    updatedAt: postFields.updatedAt ?? now,
    deletedAt: postFields.deletedAt ?? null,
  };
}

export function uploadedFileRecord(uploadFields: Partial<UploadedFile>): UploadedFile {
  const now = new Date();

  return {
    id: uploadFields.id ?? randomUUID(),
    filename: uploadFields.filename ?? 'image.webp',
    originalName: uploadFields.originalName ?? 'image.webp',
    storageDriver: uploadFields.storageDriver ?? 'local',
    storagePath: uploadFields.storagePath ?? 'uploads/image.webp',
    publicUrl: uploadFields.publicUrl ?? '/uploads/image.webp',
    mimeType: uploadFields.mimeType ?? 'image/webp',
    sizeBytes: uploadFields.sizeBytes ?? 128,
    purpose: uploadFields.purpose ?? 'CONTENT_IMAGE',
    createdAt: uploadFields.createdAt ?? now,
    updatedAt: uploadFields.updatedAt ?? now,
    deletedAt: uploadFields.deletedAt ?? null,
  };
}

export function chatSessionRecord(sessionFields: Partial<ChatSession>): ChatSession {
  const now = new Date();

  return {
    id: sessionFields.id ?? randomUUID(),
    visitorId: sessionFields.visitorId ?? null,
    leadId: sessionFields.leadId ?? null,
    status: sessionFields.status ?? ChatSessionStatus.OPEN,
    sourcePage: sessionFields.sourcePage ?? null,
    userAgent: sessionFields.userAgent ?? null,
    ipAddress: sessionFields.ipAddress ?? null,
    createdAt: sessionFields.createdAt ?? now,
    updatedAt: sessionFields.updatedAt ?? now,
    deletedAt: sessionFields.deletedAt ?? null,
  };
}

export function chatMessageRecord(messageFields: Partial<ChatMessage>): ChatMessage {
  const now = new Date();

  return {
    id: messageFields.id ?? randomUUID(),
    sessionId: messageFields.sessionId ?? randomUUID(),
    role: messageFields.role ?? ChatMessageRole.USER,
    content: messageFields.content ?? 'I need help with SEO.',
    metadata: messageFields.metadata ?? null,
    createdAt: messageFields.createdAt ?? now,
  };
}

export function knowledgeBaseItemRecord(knowledgeFields: Partial<KnowledgeBaseItem>): KnowledgeBaseItem {
  const now = new Date();

  return {
    id: knowledgeFields.id ?? randomUUID(),
    title: knowledgeFields.title ?? 'SEO Strategy',
    slug: knowledgeFields.slug ?? 'seo-strategy',
    content: knowledgeFields.content ?? 'SEO strategy includes technical, content, and reporting work.',
    category: knowledgeFields.category ?? 'Services',
    tags: knowledgeFields.tags ?? ['seo'],
    sourceType: knowledgeFields.sourceType ?? KnowledgeSourceType.SERVICE,
    status: knowledgeFields.status ?? KnowledgeBaseStatus.DRAFT,
    createdAt: knowledgeFields.createdAt ?? now,
    updatedAt: knowledgeFields.updatedAt ?? now,
    deletedAt: knowledgeFields.deletedAt ?? null,
  };
}

export function leadRecord(leadFields: Partial<Lead>): Lead {
  const now = new Date();

  return {
    id: leadFields.id ?? randomUUID(),
    name: leadFields.name ?? 'Dana Client',
    email: leadFields.email ?? 'client@example.com',
    phone: leadFields.phone ?? null,
    companyName: leadFields.companyName ?? 'Client Co',
    serviceInterest: leadFields.serviceInterest ?? 'SEO Strategy',
    budgetRange: leadFields.budgetRange ?? null,
    message: leadFields.message ?? 'I need SEO help.',
    source: leadFields.source ?? LeadSource.CONTACT_FORM,
    status: leadFields.status ?? LeadStatus.NEW,
    assignedTo: leadFields.assignedTo ?? null,
    createdAt: leadFields.createdAt ?? now,
    updatedAt: leadFields.updatedAt ?? now,
    deletedAt: leadFields.deletedAt ?? null,
  };
}

export function leadNotificationRecord(notificationFields: Partial<LeadNotification>): LeadNotification {
  const now = new Date();

  return {
    id: notificationFields.id ?? randomUUID(),
    leadId: notificationFields.leadId ?? randomUUID(),
    target: notificationFields.target ?? 'unconfigured',
    status: notificationFields.status ?? LeadNotificationStatus.PENDING,
    payload: notificationFields.payload ?? {},
    errorMessage: notificationFields.errorMessage ?? null,
    attemptedAt: notificationFields.attemptedAt ?? null,
    createdAt: notificationFields.createdAt ?? now,
    updatedAt: notificationFields.updatedAt ?? now,
  };
}
