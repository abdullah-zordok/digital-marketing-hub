import { ContentStatus, KnowledgeBaseStatus, KnowledgeSourceType, PrismaClient, User, UserRole, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function upsertUser(seedUser: {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}): Promise<User> {
  const passwordHash = await bcrypt.hash(seedUser.password, 12);

  return prisma.user.upsert({
    where: { email: seedUser.email.toLowerCase() },
    update: {
      name: seedUser.name,
      role: seedUser.role,
      status: UserStatus.ACTIVE,
      passwordHash,
    },
    create: {
      email: seedUser.email.toLowerCase(),
      name: seedUser.name,
      role: seedUser.role,
      status: UserStatus.ACTIVE,
      passwordHash,
    },
  });
}

async function upsertService(seedService: {
  name: string;
  title: string;
  slug: string;
  sortOrder: number;
}): Promise<void> {
  await prisma.service.upsert({
    where: { slug: seedService.slug },
    update: {
      ...seedService,
      status: ContentStatus.PUBLISHED,
      shortDescription: `${seedService.title} for growth-focused brands.`,
      fullDescription: `${seedService.title} strategy, execution, and reporting.`,
      seoTitle: seedService.title,
      seoDescription: `${seedService.title} from Digital Marketing Hub.`,
      canonicalUrl: `/services/${seedService.slug}`,
      openGraphImage: `/uploads/${seedService.slug}.webp`,
    },
    create: {
      ...seedService,
      status: ContentStatus.PUBLISHED,
      shortDescription: `${seedService.title} for growth-focused brands.`,
      fullDescription: `${seedService.title} strategy, execution, and reporting.`,
      seoTitle: seedService.title,
      seoDescription: `${seedService.title} from Digital Marketing Hub.`,
      canonicalUrl: `/services/${seedService.slug}`,
      openGraphImage: `/uploads/${seedService.slug}.webp`,
    },
  });
}

async function upsertBlogCategory(name: string, slug: string) {
  return prisma.blogCategory.upsert({
    where: { slug },
    update: { name, description: `${name} insights and playbooks.` },
    create: { name, slug, description: `${name} insights and playbooks.` },
  });
}

async function upsertBlogPost(index: number, authorId: string, categoryId: string): Promise<void> {
  const slug = `marketing-playbook-${index}`;
  const publishedAt = new Date(Date.UTC(2026, 0, index));

  await prisma.blogPost.upsert({
    where: { slug },
    update: blogPostSeedFor(index, authorId, categoryId, publishedAt),
    create: {
      slug,
      ...blogPostSeedFor(index, authorId, categoryId, publishedAt),
    },
  });
}

async function upsertKnowledgeItem(seedKnowledge: {
  title: string;
  slug: string;
  content: string;
  category: string;
  tags: string[];
  sourceType: KnowledgeSourceType;
  status: KnowledgeBaseStatus;
}): Promise<void> {
  await prisma.knowledgeBaseItem.upsert({
    where: { slug: seedKnowledge.slug },
    update: seedKnowledge,
    create: seedKnowledge,
  });
}

function blogPostSeedFor(index: number, authorId: string, categoryId: string, publishedAt: Date) {
  const topic = index % 2 === 0 ? 'seo' : 'paid ads';
  return {
    title: `Marketing Playbook ${index}`,
    excerpt: `Practical ${topic} guidance for campaign planning.`,
    content: `Detailed ${topic} strategy article with channel planning and measurement.`,
    coverImage: `/uploads/marketing-playbook-${index}.webp`,
    authorId,
    categoryId,
    tags: [topic.replace(' ', '-'), 'strategy'],
    status: ContentStatus.PUBLISHED,
    publishedAt,
    seoTitle: `Marketing Playbook ${index}`,
    seoDescription: `Learn ${topic} planning for measurable growth.`,
    canonicalUrl: `/blog/posts/marketing-playbook-${index}`,
    openGraphImage: `/uploads/marketing-playbook-${index}.webp`,
    readingTime: 5 + (index % 4),
    popularityScore: 100 - index,
  };
}

async function seed(): Promise<void> {
  await upsertUser({
    email: process.env.ADMIN_EMAIL ?? 'admin@example.com',
    password: process.env.ADMIN_PASSWORD ?? 'change-me-now',
    name: 'Platform Admin',
    role: UserRole.ADMIN,
  });

  if (process.env.NODE_ENV !== 'production') {
    const editor = await upsertUser({
      email: 'editor@example.com',
      password: process.env.ADMIN_PASSWORD ?? 'change-me-now',
      name: 'Content Editor',
      role: UserRole.EDITOR,
    });
    await upsertUser({
      email: 'viewer@example.com',
      password: process.env.ADMIN_PASSWORD ?? 'change-me-now',
      name: 'Dashboard Viewer',
      role: UserRole.VIEWER,
    });

    await upsertService({ name: 'SEO', title: 'SEO Strategy', slug: 'seo-strategy', sortOrder: 1 });
    await upsertService({ name: 'Paid Ads', title: 'Paid Advertising', slug: 'paid-advertising', sortOrder: 2 });
    await upsertService({ name: 'Content', title: 'Content Marketing', slug: 'content-marketing', sortOrder: 3 });
    await upsertKnowledgeItem({
      title: 'SEO Strategy Consultation',
      slug: 'seo-strategy-consultation',
      content: 'SEO Strategy helps growth-focused brands improve technical health, content planning, and organic visibility through discovery, execution, and reporting.',
      category: 'Services',
      tags: ['seo', 'consultation'],
      sourceType: KnowledgeSourceType.SERVICE,
      status: KnowledgeBaseStatus.ACTIVE,
    });
    await upsertKnowledgeItem({
      title: 'Paid Advertising Draft',
      slug: 'paid-advertising-draft',
      content: 'Draft paid advertising guidance for internal review.',
      category: 'Services',
      tags: ['ads'],
      sourceType: KnowledgeSourceType.SERVICE,
      status: KnowledgeBaseStatus.DRAFT,
    });
    await upsertKnowledgeItem({
      title: 'Archived Content Guidance',
      slug: 'archived-content-guidance',
      content: 'Archived guidance that should not appear in chatbot answers.',
      category: 'Archive',
      tags: ['content'],
      sourceType: KnowledgeSourceType.GENERAL,
      status: KnowledgeBaseStatus.ARCHIVED,
    });

    const seoCategory = await upsertBlogCategory('SEO', 'seo');
    const paidAdsCategory = await upsertBlogCategory('Paid Ads', 'paid-ads');

    for (let index = 1; index <= 20; index += 1) {
      const categoryId = index % 2 === 0 ? seoCategory.id : paidAdsCategory.id;
      await upsertBlogPost(index, editor.id, categoryId);
    }
  }
}

seed()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (seedError) => {
    await prisma.$disconnect();
    throw seedError;
  });
