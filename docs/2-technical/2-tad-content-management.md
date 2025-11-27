## Content Management Architecture

### Overview

The Content Management Architecture provides a flexible, type-safe system for managing various content types across the platform. This section covers Epics 2B.4 (Content Management System) and 3B.2 (Landing Page Builder).

**Key Principles**:
- **Type-Safe Content**: Zod schemas for runtime validation
- **Version Control**: Track content changes with full history
- **Multi-tenant**: Organisation-scoped content isolation
- **Draft/Published Workflow**: Separate draft and published states
- **Migration-Ready**: Structured approach for legacy content import

### Content Structure and Types

#### Content Type Registry

```typescript
// packages/content/src/types.ts

import { z } from 'zod';

/**
 * Base content schema - all content types extend this
 */
export const BaseContentSchema = z.object({
  id: z.string().uuid(),
  organisationId: z.string().uuid(),
  type: z.string(),
  title: z.string().min(1).max(255),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  status: z.enum(['draft', 'published', 'archived']),
  publishedAt: z.date().nullable(),
  createdBy: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
  metadata: z.record(z.unknown()).optional(),
});

export type BaseContent = z.infer<typeof BaseContentSchema>;

/**
 * Landing Page Content
 */
export const LandingPageSchema = BaseContentSchema.extend({
  type: z.literal('landing-page'),
  data: z.object({
    seo: z.object({
      metaTitle: z.string().max(60),
      metaDescription: z.string().max(160),
      ogImage: z.string().url().optional(),
      noIndex: z.boolean().default(false),
    }),
    hero: z.object({
      headline: z.string().max(100),
      subheadline: z.string().max(200),
      ctaText: z.string().max(50),
      ctaUrl: z.string().url(),
      backgroundImage: z.string().url().optional(),
      backgroundVideo: z.string().url().optional(),
    }),
    sections: z.array(z.object({
      id: z.string().uuid(),
      type: z.enum(['features', 'testimonials', 'pricing', 'faq', 'cta', 'custom']),
      order: z.number().int().min(0),
      data: z.record(z.unknown()),
    })),
    theme: z.object({
      primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
      secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
      font: z.enum(['inter', 'roboto', 'playfair', 'montserrat']),
    }),
  }),
});

export type LandingPage = z.infer<typeof LandingPageSchema>;

/**
 * Blog Post Content
 */
export const BlogPostSchema = BaseContentSchema.extend({
  type: z.literal('blog-post'),
  data: z.object({
    seo: z.object({
      metaTitle: z.string().max(60),
      metaDescription: z.string().max(160),
      ogImage: z.string().url().optional(),
      canonicalUrl: z.string().url().optional(),
    }),
    author: z.object({
      id: z.string().uuid(),
      name: z.string(),
      avatar: z.string().url().optional(),
      bio: z.string().max(200).optional(),
    }),
    coverImage: z.string().url(),
    excerpt: z.string().max(300),
    body: z.string(), // Markdown or JSON (from rich text editor)
    bodyFormat: z.enum(['markdown', 'json']),
    tags: z.array(z.string()).max(10),
    category: z.string(),
    readingTime: z.number().int().min(1), // Minutes
    featured: z.boolean().default(false),
  }),
});

export type BlogPost = z.infer<typeof BlogPostSchema>;

/**
 * Documentation Page Content
 */
export const DocPageSchema = BaseContentSchema.extend({
  type: z.literal('doc-page'),
  data: z.object({
    category: z.string(),
    order: z.number().int().min(0),
    body: z.string(), // Markdown
    tableOfContents: z.array(z.object({
      id: z.string(),
      title: z.string(),
      level: z.number().int().min(1).max(6),
    })).optional(),
    relatedPages: z.array(z.string().uuid()).optional(),
    lastReviewedBy: z.string().uuid().optional(),
    lastReviewedAt: z.date().optional(),
  }),
});

export type DocPage = z.infer<typeof DocPageSchema>;

/**
 * Product Template Content
 */
export const ProductTemplateSchema = BaseContentSchema.extend({
  type: z.literal('product-template'),
  data: z.object({
    category: z.string(),
    industry: z.array(z.string()),
    thumbnail: z.string().url(),
    previewUrl: z.string().url().optional(),
    description: z.string().max(500),
    features: z.array(z.string()),
    sections: z.array(z.object({
      id: z.string().uuid(),
      type: z.string(),
      order: z.number().int().min(0),
      data: z.record(z.unknown()),
    })),
    tags: z.array(z.string()).max(10),
    usageCount: z.number().int().min(0).default(0),
  }),
});

export type ProductTemplate = z.infer<typeof ProductTemplateSchema>;

/**
 * Union type for all content types
 */
export type Content = LandingPage | BlogPost | DocPage | ProductTemplate;

/**
 * Content type discriminator
 */
export const ContentSchema = z.discriminatedUnion('type', [
  LandingPageSchema,
  BlogPostSchema,
  DocPageSchema,
  ProductTemplateSchema,
]);
```

#### Content Version History

```typescript
// packages/content/src/version.ts

export const ContentVersionSchema = z.object({
  id: z.string().uuid(),
  contentId: z.string().uuid(),
  version: z.number().int().min(1),
  data: z.record(z.unknown()), // Snapshot of content data
  createdBy: z.string().uuid(),
  createdAt: z.date(),
  changeDescription: z.string().max(500).optional(),
  restoredFrom: z.string().uuid().optional(), // If this version was restored from another
});

export type ContentVersion = z.infer<typeof ContentVersionSchema>;
```

### Database Schema

```typescript
// packages/database/src/schema/content.ts

import { pgTable, uuid, text, timestamp, jsonb, integer, boolean, index, pgEnum } from 'drizzle-orm/pg-core';
import { users, organisations } from './core';

export const contentStatusEnum = pgEnum('content_status', ['draft', 'published', 'archived']);

export const content = pgTable('content', {
  id: uuid('id').primaryKey().defaultRandom(),
  organisationId: uuid('organisation_id').references(() => organisations.id).notNull(),
  type: text('type').notNull(), // 'landing-page', 'blog-post', 'doc-page', 'product-template'
  title: text('title').notNull(),
  slug: text('slug').notNull(),
  status: contentStatusEnum('status').notNull().default('draft'),
  data: jsonb('data').notNull(), // Type-specific content data
  publishedAt: timestamp('published_at'),
  createdBy: uuid('created_by').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  metadata: jsonb('metadata'), // Custom metadata for extensions
}, (table) => ({
  orgIdIdx: index('content_org_id_idx').on(table.organisationId),
  typeIdx: index('content_type_idx').on(table.type),
  slugIdx: index('content_slug_idx').on(table.organisationId, table.slug),
  statusIdx: index('content_status_idx').on(table.status),
}));

export const contentVersions = pgTable('content_versions', {
  id: uuid('id').primaryKey().defaultRandom(),
  contentId: uuid('content_id').references(() => content.id, { onDelete: 'cascade' }).notNull(),
  version: integer('version').notNull(),
  data: jsonb('data').notNull(), // Snapshot of content.data at this version
  createdBy: uuid('created_by').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  changeDescription: text('change_description'),
  restoredFrom: uuid('restored_from').references(() => contentVersions.id),
}, (table) => ({
  contentIdIdx: index('content_versions_content_id_idx').on(table.contentId),
  versionIdx: index('content_versions_version_idx').on(table.contentId, table.version),
}));

export const contentCollaborators = pgTable('content_collaborators', {
  id: uuid('id').primaryKey().defaultRandom(),
  contentId: uuid('content_id').references(() => content.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  role: text('role').notNull(), // 'editor', 'viewer'
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  contentUserIdx: index('content_collaborators_content_user_idx').on(table.contentId, table.userId),
}));
```

### Content API Specification

#### Content Service

```typescript
// packages/content/src/service.ts

import { db } from '@repo/database';
import { content, contentVersions } from '@repo/database/schema';
import { eq, and, desc } from 'drizzle-orm';
import { ContentSchema, type Content } from './types';
import { Logger } from '@repo/logger';

const logger = new Logger('content-service');

export class ContentService {
  /**
   * Create new content
   */
  async create(input: {
    organisationId: string;
    type: Content['type'];
    title: string;
    slug: string;
    data: unknown;
    createdBy: string;
  }): Promise<Content> {
    // Validate content data against schema
    const validated = ContentSchema.parse({
      ...input,
      status: 'draft',
      publishedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Check for slug uniqueness within org
    const existing = await db
      .select()
      .from(content)
      .where(and(
        eq(content.organisationId, input.organisationId),
        eq(content.slug, input.slug)
      ))
      .limit(1);

    if (existing.length > 0) {
      throw new Error('Content with this slug already exists');
    }

    // Insert content
    const [created] = await db
      .insert(content)
      .values({
        organisationId: input.organisationId,
        type: input.type,
        title: input.title,
        slug: input.slug,
        data: input.data as any,
        status: 'draft',
        createdBy: input.createdBy,
      })
      .returning();

    // Create initial version
    await this.createVersion({
      contentId: created.id,
      data: input.data,
      createdBy: input.createdBy,
      changeDescription: 'Initial version',
    });

    logger.info('Content created', {
      data: { contentId: created.id, type: input.type, orgId: input.organisationId }
    });

    return ContentSchema.parse(created);
  }

  /**
   * Update content
   */
  async update(input: {
    id: string;
    organisationId: string;
    title?: string;
    slug?: string;
    data?: unknown;
    status?: 'draft' | 'published' | 'archived';
    updatedBy: string;
    changeDescription?: string;
  }): Promise<Content> {
    // Get existing content
    const [existing] = await db
      .select()
      .from(content)
      .where(and(
        eq(content.id, input.id),
        eq(content.organisationId, input.organisationId)
      ))
      .limit(1);

    if (!existing) {
      throw new Error('Content not found');
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (input.title !== undefined) updateData.title = input.title;
    if (input.slug !== undefined) updateData.slug = input.slug;
    if (input.data !== undefined) updateData.data = input.data;
    if (input.status !== undefined) {
      updateData.status = input.status;
      if (input.status === 'published' && !existing.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }

    // Update content
    const [updated] = await db
      .update(content)
      .set(updateData)
      .where(eq(content.id, input.id))
      .returning();

    // Create new version if data changed
    if (input.data !== undefined) {
      await this.createVersion({
        contentId: input.id,
        data: input.data,
        createdBy: input.updatedBy,
        changeDescription: input.changeDescription,
      });
    }

    logger.info('Content updated', {
      data: { contentId: input.id, status: input.status }
    });

    return ContentSchema.parse(updated);
  }

  /**
   * Get content by ID
   */
  async getById(id: string, organisationId: string): Promise<Content | null> {
    const [result] = await db
      .select()
      .from(content)
      .where(and(
        eq(content.id, id),
        eq(content.organisationId, organisationId)
      ))
      .limit(1);

    return result ? ContentSchema.parse(result) : null;
  }

  /**
   * Get content by slug
   */
  async getBySlug(slug: string, organisationId: string): Promise<Content | null> {
    const [result] = await db
      .select()
      .from(content)
      .where(and(
        eq(content.slug, slug),
        eq(content.organisationId, organisationId)
      ))
      .limit(1);

    return result ? ContentSchema.parse(result) : null;
  }

  /**
   * List content by type
   */
  async list(input: {
    organisationId: string;
    type?: Content['type'];
    status?: 'draft' | 'published' | 'archived';
    limit?: number;
    offset?: number;
  }): Promise<{ items: Content[]; total: number }> {
    const conditions = [eq(content.organisationId, input.organisationId)];

    if (input.type) {
      conditions.push(eq(content.type, input.type));
    }

    if (input.status) {
      conditions.push(eq(content.status, input.status));
    }

    const items = await db
      .select()
      .from(content)
      .where(and(...conditions))
      .orderBy(desc(content.updatedAt))
      .limit(input.limit || 50)
      .offset(input.offset || 0);

    const [{ count }] = await db
      .select({ count: count() })
      .from(content)
      .where(and(...conditions));

    return {
      items: items.map(item => ContentSchema.parse(item)),
      total: Number(count),
    };
  }

  /**
   * Publish content
   */
  async publish(id: string, organisationId: string, publishedBy: string): Promise<Content> {
    return this.update({
      id,
      organisationId,
      status: 'published',
      updatedBy: publishedBy,
      changeDescription: 'Published',
    });
  }

  /**
   * Archive content
   */
  async archive(id: string, organisationId: string, archivedBy: string): Promise<Content> {
    return this.update({
      id,
      organisationId,
      status: 'archived',
      updatedBy: archivedBy,
      changeDescription: 'Archived',
    });
  }

  /**
   * Delete content (hard delete)
   */
  async delete(id: string, organisationId: string): Promise<void> {
    await db
      .delete(content)
      .where(and(
        eq(content.id, id),
        eq(content.organisationId, organisationId)
      ));

    logger.info('Content deleted', {
      data: { contentId: id, orgId: organisationId }
    });
  }

  /**
   * Create content version
   */
  private async createVersion(input: {
    contentId: string;
    data: unknown;
    createdBy: string;
    changeDescription?: string;
    restoredFrom?: string;
  }): Promise<void> {
    // Get current max version
    const [maxVersion] = await db
      .select({ max: max(contentVersions.version) })
      .from(contentVersions)
      .where(eq(contentVersions.contentId, input.contentId));

    const nextVersion = (maxVersion?.max || 0) + 1;

    await db
      .insert(contentVersions)
      .values({
        contentId: input.contentId,
        version: nextVersion,
        data: input.data as any,
        createdBy: input.createdBy,
        changeDescription: input.changeDescription,
        restoredFrom: input.restoredFrom,
      });
  }

  /**
   * Get content version history
   */
  async getVersionHistory(contentId: string, organisationId: string): Promise<ContentVersion[]> {
    // Verify content belongs to org
    const [contentRecord] = await db
      .select()
      .from(content)
      .where(and(
        eq(content.id, contentId),
        eq(content.organisationId, organisationId)
      ))
      .limit(1);

    if (!contentRecord) {
      throw new Error('Content not found');
    }

    const versions = await db
      .select()
      .from(contentVersions)
      .where(eq(contentVersions.contentId, contentId))
      .orderBy(desc(contentVersions.version));

    return versions.map(v => ContentVersionSchema.parse(v));
  }

  /**
   * Restore content to previous version
   */
  async restoreVersion(input: {
    contentId: string;
    organisationId: string;
    versionId: string;
    restoredBy: string;
  }): Promise<Content> {
    // Get version to restore
    const [version] = await db
      .select()
      .from(contentVersions)
      .where(and(
        eq(contentVersions.id, input.versionId),
        eq(contentVersions.contentId, input.contentId)
      ))
      .limit(1);

    if (!version) {
      throw new Error('Version not found');
    }

    // Update content with version data
    const updated = await this.update({
      id: input.contentId,
      organisationId: input.organisationId,
      data: version.data,
      updatedBy: input.restoredBy,
      changeDescription: `Restored from version ${version.version}`,
    });

    logger.info('Content restored', {
      data: { contentId: input.contentId, fromVersion: version.version }
    });

    return updated;
  }
}
```

#### Content API Routes

```typescript
// apps/api/src/routes/content.ts

import { NextRequest, NextResponse } from 'next/server';
import { ContentService } from '@repo/content/service';
import { errorHandler } from '@repo/api/middleware/error-handler';
import { requireAuth, requireRole } from '@repo/api/middleware/auth';

const contentService = new ContentService();

/**
 * POST /api/v1/content
 * Create new content
 */
export async function POST(request: NextRequest) {
  return errorHandler(request, async (req) => {
    const user = await requireAuth(req);
    const { organisationId, type, title, slug, data } = await req.json();

    const content = await contentService.create({
      organisationId,
      type,
      title,
      slug,
      data,
      createdBy: user.id,
    });

    return NextResponse.json({ success: true, data: content }, { status: 201 });
  });
}

/**
 * GET /api/v1/content
 * List content
 */
export async function GET(request: NextRequest) {
  return errorHandler(request, async (req) => {
    const user = await requireAuth(req);
    const { searchParams } = new URL(req.url);

    const organisationId = searchParams.get('organisationId')!;
    const type = searchParams.get('type') as any;
    const status = searchParams.get('status') as any;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const result = await contentService.list({
      organisationId,
      type,
      status,
      limit,
      offset,
    });

    return NextResponse.json({ success: true, data: result });
  });
}

/**
 * GET /api/v1/content/:id
 * Get content by ID
 */
export async function getContentById(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return errorHandler(request, async (req) => {
    const user = await requireAuth(req);
    const { searchParams } = new URL(req.url);
    const organisationId = searchParams.get('organisationId')!;

    const content = await contentService.getById(params.id, organisationId);

    if (!content) {
      return NextResponse.json(
        { success: false, error: { message: 'Content not found', code: 'NOT_FOUND' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: content });
  });
}

/**
 * PATCH /api/v1/content/:id
 * Update content
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return errorHandler(request, async (req) => {
    const user = await requireAuth(req);
    const body = await req.json();

    const content = await contentService.update({
      id: params.id,
      organisationId: body.organisationId,
      title: body.title,
      slug: body.slug,
      data: body.data,
      status: body.status,
      updatedBy: user.id,
      changeDescription: body.changeDescription,
    });

    return NextResponse.json({ success: true, data: content });
  });
}

/**
 * POST /api/v1/content/:id/publish
 * Publish content
 */
export async function publishContent(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return errorHandler(request, async (req) => {
    const user = await requireAuth(req);
    const { organisationId } = await req.json();

    const content = await contentService.publish(params.id, organisationId, user.id);

    return NextResponse.json({ success: true, data: content });
  });
}

/**
 * GET /api/v1/content/:id/versions
 * Get content version history
 */
export async function getVersionHistory(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return errorHandler(request, async (req) => {
    const user = await requireAuth(req);
    const { searchParams } = new URL(req.url);
    const organisationId = searchParams.get('organisationId')!;

    const versions = await contentService.getVersionHistory(params.id, organisationId);

    return NextResponse.json({ success: true, data: versions });
  });
}

/**
 * POST /api/v1/content/:id/restore/:versionId
 * Restore content to previous version
 */
export async function restoreVersion(
  request: NextRequest,
  { params }: { params: { id: string; versionId: string } }
) {
  return errorHandler(request, async (req) => {
    const user = await requireAuth(req);
    const { organisationId } = await req.json();

    const content = await contentService.restoreVersion({
      contentId: params.id,
      organisationId,
      versionId: params.versionId,
      restoredBy: user.id,
    });

    return NextResponse.json({ success: true, data: content });
  });
}
```

### Migration Strategy

#### Legacy Content Import

```typescript
// packages/content/src/migration/importer.ts

import { ContentService } from '../service';
import { Logger } from '@repo/logger';
import { z } from 'zod';

const logger = new Logger('content-importer');

/**
 * Legacy content format (from old system)
 */
const LegacyContentSchema = z.object({
  id: z.number(),
  title: z.string(),
  slug: z.string(),
  content_type: z.string(),
  body: z.string(),
  meta: z.record(z.unknown()).optional(),
  created_at: z.string(),
  updated_at: z.string(),
  published: z.boolean(),
});

type LegacyContent = z.infer<typeof LegacyContentSchema>;

export class ContentImporter {
  constructor(private contentService: ContentService) {}

  /**
   * Import legacy landing pages
   */
  async importLandingPages(input: {
    organisationId: string;
    legacyData: unknown[];
    createdBy: string;
  }): Promise<{ imported: number; failed: number; errors: string[] }> {
    let imported = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const item of input.legacyData) {
      try {
        const legacy = LegacyContentSchema.parse(item);

        // Transform legacy format to new format
        const transformed = this.transformLegacyLandingPage(legacy);

        await this.contentService.create({
          organisationId: input.organisationId,
          type: 'landing-page',
          title: transformed.title,
          slug: transformed.slug,
          data: transformed.data,
          createdBy: input.createdBy,
        });

        imported++;
        logger.info('Imported legacy landing page', {
          data: { legacyId: legacy.id, slug: legacy.slug }
        });
      } catch (error) {
        failed++;
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        errors.push(`Failed to import item ${JSON.stringify(item)}: ${errorMsg}`);
        logger.error('Failed to import legacy content', error as Error, {
          data: { item }
        });
      }
    }

    logger.info('Legacy import completed', {
      data: { imported, failed, total: input.legacyData.length }
    });

    return { imported, failed, errors };
  }

  /**
   * Transform legacy landing page to new format
   */
  private transformLegacyLandingPage(legacy: LegacyContent): {
    title: string;
    slug: string;
    data: any;
  } {
    // Parse legacy meta data
    const meta = legacy.meta || {};

    return {
      title: legacy.title,
      slug: legacy.slug,
      data: {
        seo: {
          metaTitle: meta.seo_title || legacy.title,
          metaDescription: meta.seo_description || '',
          ogImage: meta.og_image,
          noIndex: false,
        },
        hero: {
          headline: meta.hero_headline || legacy.title,
          subheadline: meta.hero_subheadline || '',
          ctaText: meta.hero_cta_text || 'Get Started',
          ctaUrl: meta.hero_cta_url || '#',
          backgroundImage: meta.hero_bg_image,
        },
        sections: this.parseLegacySections(legacy.body),
        theme: {
          primaryColor: meta.primary_color || '#3B82F6',
          secondaryColor: meta.secondary_color || '#10B981',
          font: meta.font || 'inter',
        },
      },
    };
  }

  /**
   * Parse legacy HTML/JSON sections
   */
  private parseLegacySections(body: string): any[] {
    // Implementation depends on legacy format
    // This is a simplified example
    try {
      const parsed = JSON.parse(body);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      // If not JSON, treat as markdown/HTML
      return [{
        id: crypto.randomUUID(),
        type: 'custom',
        order: 0,
        data: { html: body },
      }];
    }
  }

  /**
   * Import blog posts
   */
  async importBlogPosts(input: {
    organisationId: string;
    legacyData: unknown[];
    createdBy: string;
  }): Promise<{ imported: number; failed: number; errors: string[] }> {
    let imported = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const item of input.legacyData) {
      try {
        const legacy = LegacyContentSchema.parse(item);

        await this.contentService.create({
          organisationId: input.organisationId,
          type: 'blog-post',
          title: legacy.title,
          slug: legacy.slug,
          data: {
            seo: {
              metaTitle: legacy.meta?.seo_title || legacy.title,
              metaDescription: legacy.meta?.seo_description || '',
            },
            author: {
              id: input.createdBy,
              name: legacy.meta?.author_name || 'Unknown',
            },
            coverImage: legacy.meta?.cover_image || '',
            excerpt: legacy.meta?.excerpt || '',
            body: legacy.body,
            bodyFormat: 'markdown',
            tags: legacy.meta?.tags || [],
            category: legacy.meta?.category || 'Uncategorized',
            readingTime: this.calculateReadingTime(legacy.body),
            featured: false,
          },
          createdBy: input.createdBy,
        });

        imported++;
      } catch (error) {
        failed++;
        errors.push(`Failed to import blog post: ${error}`);
      }
    }

    return { imported, failed, errors };
  }

  /**
   * Calculate reading time in minutes
   */
  private calculateReadingTime(text: string): number {
    const wordsPerMinute = 200;
    const wordCount = text.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  }
}
```

#### Migration CLI Tool

```bash
# scripts/migrate-content.ts

import { ContentImporter } from '@repo/content/migration/importer';
import { ContentService } from '@repo/content/service';
import fs from 'fs';

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (command === 'import-landing-pages') {
    const organisationId = args[1];
    const filePath = args[2];
    const userId = args[3];

    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const importer = new ContentImporter(new ContentService());

    const result = await importer.importLandingPages({
      organisationId,
      legacyData: data,
      createdBy: userId,
    });

    console.log(`Import completed: ${result.imported} imported, ${result.failed} failed`);
    if (result.errors.length > 0) {
      console.error('Errors:', result.errors);
    }
  } else {
    console.log('Usage: pnpm migrate-content import-landing-pages <org-id> <file-path> <user-id>');
  }
}

main();
```

### Content Management Checklist

**Development Phase**:
- [ ] Content types defined with Zod schemas
- [ ] Database schema migrated
- [ ] Content service implemented with version control
- [ ] API routes implemented with auth middleware
- [ ] Migration tool tested with sample data

**Pre-Production**:
- [ ] Content validation working correctly
- [ ] Version history tracking verified
- [ ] Slug uniqueness enforced per organisation
- [ ] Draft/published workflow tested
- [ ] Migration strategy validated with real data

**Production**:
- [ ] Legacy content imported successfully
- [ ] Content API performance monitored
- [ ] Content search indexed (if using search)
- [ ] Backup strategy in place for content data
- [ ] Content collaborators feature tested

---

