## Security Architecture

### Authentication Flow

1. User initiates login via Clerk
2. Clerk handles OAuth/magic link/password flow
3. Clerk issues JWT token
4. Token stored in httpOnly, secure cookie
5. Middleware validates token on each request
6. User context injected into request

### Authorization Model

#### Roles

| Role | Description | Access Level |
|------|-------------|--------------|
| **Internal** | Company employees | Full access to all features |
| **Product-Seller** | Organisation admin | Full access within their org |
| **Agency-Seller** | Limited admin | Read + limited write in their org |
| **Client** | End user | Read + limited actions in their org |

#### Permission Matrix

| Resource | Internal | Product-Seller | Agency-Seller | Client |
|----------|----------|----------------|---------------|--------|
| Users | CRUD | CRUD (own org) | Read (own org) | Read (self) |
| Organisations | CRUD | Update (own) | Read (own) | Read (own) |
| Content | CRUD | CRUD (own org) | Create, Read (own org) | Read (own org) |
| Analytics | Read All | Read (own org) | Read (own org) | None |

### Data Protection

#### Encryption

- **In Transit**: TLS 1.3 (enforced by Vercel)
- **At Rest**: Database-level encryption (Neon/Supabase)
- **Sensitive Fields**: Additional application-level encryption for PII

#### Row-Level Security (RLS)

```sql
-- Example RLS policy
CREATE POLICY org_isolation ON content
  USING (organisation_id = current_setting('app.current_org_id')::uuid);
```

All queries automatically filtered by organisation context.

### Compliance Requirements

#### GDPR Compliance

- [ ] Cookie consent banner
- [ ] Data export functionality (user profile + content)
- [ ] Right to deletion (cascade delete with 30-day grace period)
- [ ] Privacy policy
- [ ] Data processing agreements with vendors

#### CCPA Compliance

- [ ] "Do Not Sell My Personal Information" link
- [ ] Data disclosure upon request
- [ ] Opt-out of data sale (analytics tracking)

### Compliance Implementation Architecture

#### Right to Deletion (GDPR Article 17 & CCPA)

**Database Schema Extension:**

```sql
-- Add soft delete columns to all tables
users
  - deleted_at (timestamp, nullable)
  - deletion_scheduled_at (timestamp, nullable)
  - deletion_reason (text, nullable)

organisations
  - deleted_at (timestamp, nullable)
  - deletion_scheduled_at (timestamp, nullable)
  - deletion_initiated_by (uuid, fk → users)

-- Deletion audit log
deletion_requests
  - id (uuid, pk)
  - entity_type (enum: user, organisation)
  - entity_id (uuid)
  - requested_by (uuid, fk → users)
  - requested_at (timestamp)
  - scheduled_deletion_date (timestamp)
  - completed_at (timestamp, nullable)
  - status (enum: pending, completed, cancelled)
  - data_snapshot (jsonb)  -- For recovery during grace period
```

**Deletion Flow Implementation:**

```
User/Admin Initiates Deletion
    ↓
1. Create deletion_request record
    ↓
2. Set deletion_scheduled_at = now() + 30 days
    ↓
3. Set deleted_at = now() (soft delete)
    ↓
4. Send confirmation email with cancellation link
    ↓
5. Hide data from UI (filter WHERE deleted_at IS NULL)
    ↓
6. Store data snapshot in deletion_requests.data_snapshot
    ↓
[30-day grace period]
    ↓
7. Daily cron job checks deletion_scheduled_at
    ↓
8. If grace period expired AND not cancelled:
    ↓
9. Execute cascade hard delete:
   - DELETE FROM user_organisations WHERE user_id = ?
   - DELETE FROM content WHERE created_by = ?
   - DELETE FROM analytics_events WHERE user_id = ?
   - DELETE FROM deletion_requests WHERE entity_id = ?
   - DELETE FROM users WHERE id = ?
    ↓
10. Log completion in deletion_requests (completed_at)
    ↓
11. Send deletion confirmation email
```

**Cascade Deletion Strategy:**

Organization deletion cascades in this order:
1. Mark organisation as deleted (soft delete)
2. Cascade delete all user_organisations memberships
3. Cascade delete all content owned by organisation
4. Cascade delete all analytics_events for organisation
5. After 30 days: hard delete in reverse dependency order

User deletion cascades:
1. Mark user as deleted (soft delete)
2. Nullify created_by references (set to NULL or system user)
3. Remove user from user_organisations
4. Anonymize analytics_events (keep for aggregates, remove PII)
5. After 30 days: hard delete user record

**Recovery During Grace Period:**

```typescript
// API endpoint: POST /api/users/:id/cancel-deletion
async function cancelDeletion(userId: string) {
  await db.transaction(async (tx) => {
    // Restore from snapshot
    const request = await tx.query.deletion_requests.findFirst({
      where: eq(deletion_requests.entity_id, userId),
      orderBy: desc(deletion_requests.requested_at)
    });

    // Clear soft delete flags
    await tx.update(users)
      .set({
        deleted_at: null,
        deletion_scheduled_at: null
      })
      .where(eq(users.id, userId));

    // Mark request as cancelled
    await tx.update(deletion_requests)
      .set({ status: 'cancelled' })
      .where(eq(deletion_requests.id, request.id));
  });
}
```

**Cron Job Implementation:**

```typescript
// Vercel Cron: /api/cron/process-deletions (daily at 2 AM UTC)
export async function processDeletions() {
  const now = new Date();

  // Find deletion requests past grace period
  const expiredRequests = await db.query.deletion_requests.findMany({
    where: and(
      eq(deletion_requests.status, 'pending'),
      lte(deletion_requests.scheduled_deletion_date, now)
    )
  });

  for (const request of expiredRequests) {
    await executeHardDelete(request.entity_type, request.entity_id);
    await markDeletionComplete(request.id);
    await sendDeletionConfirmationEmail(request.entity_id);
  }
}
```

#### Data Export Functionality (GDPR Article 15 & Article 20)

**Export Service Architecture:**

```typescript
// Package: @repo/data-export

interface ExportOptions {
  userId: string;
  organisationId?: string;
  format: 'json' | 'csv' | 'pdf';
  includeAnalytics: boolean;
}

interface ExportResult {
  downloadUrl: string;
  expiresAt: Date;
  fileSize: number;
  format: string;
}
```

**Export Data Structure:**

```json
{
  "export_metadata": {
    "generated_at": "2025-11-24T12:00:00Z",
    "user_id": "uuid",
    "format": "json",
    "version": "1.0"
  },
  "user_profile": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "created_at": "2025-01-01T00:00:00Z"
  },
  "organisations": [
    {
      "id": "uuid",
      "name": "Org Name",
      "role": "product-seller",
      "joined_at": "2025-01-01T00:00:00Z"
    }
  ],
  "content_created": [
    {
      "id": "uuid",
      "type": "transformation_framework",
      "title": "Framework Title",
      "created_at": "2025-01-15T00:00:00Z",
      "data": { /* full content */ }
    }
  ],
  "analytics_events": [
    {
      "event_name": "content_created",
      "timestamp": "2025-01-15T10:30:00Z",
      "properties": { /* event data */ }
    }
  ]
}
```

**Export Generation Implementation:**

```typescript
// API endpoint: POST /api/users/:id/export
async function generateExport(userId: string, options: ExportOptions) {
  // 1. Fetch all user data
  const userData = await fetchUserData(userId, options.organisationId);

  // 2. Generate export based on format
  let fileBuffer: Buffer;
  let mimeType: string;

  switch (options.format) {
    case 'json':
      fileBuffer = Buffer.from(JSON.stringify(userData, null, 2));
      mimeType = 'application/json';
      break;

    case 'csv':
      fileBuffer = await convertToCSV(userData);
      mimeType = 'text/csv';
      break;

    case 'pdf':
      fileBuffer = await generatePDF(userData);  // Use @react-pdf/renderer
      mimeType = 'application/pdf';
      break;
  }

  // 3. Upload to temporary storage (Vercel Blob)
  const blob = await put(
    `exports/${userId}-${Date.now()}.${options.format}`,
    fileBuffer,
    {
      access: 'public',
      addRandomSuffix: true,
      contentType: mimeType
    }
  );

  // 4. Set expiration (7 days)
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  // 5. Log export request
  await db.insert(export_requests).values({
    user_id: userId,
    format: options.format,
    file_url: blob.url,
    expires_at: expiresAt,
    created_at: new Date()
  });

  // 6. Send email with download link
  await sendExportReadyEmail(userId, blob.url, expiresAt);

  return {
    downloadUrl: blob.url,
    expiresAt,
    fileSize: fileBuffer.length,
    format: options.format
  };
}
```

**Export Request Tracking:**

```sql
export_requests
  - id (uuid, pk)
  - user_id (uuid, fk → users)
  - organisation_id (uuid, fk → organisations, nullable)
  - format (enum: json, csv, pdf)
  - file_url (text)
  - file_size (bigint)
  - expires_at (timestamp)
  - created_at (timestamp)
  - downloaded_at (timestamp, nullable)
```

#### Consent Management System

**Cookie Consent Architecture:**

```sql
user_consents
  - id (uuid, pk)
  - user_id (uuid, fk → users, nullable)  -- Null for anonymous
  - session_id (text)
  - consent_type (enum: essential, analytics, marketing)
  - granted (boolean)
  - granted_at (timestamp)
  - expires_at (timestamp, nullable)
  - ip_address (inet)
  - user_agent (text)
  - consent_version (text)  -- Version of privacy policy
```

**Consent Flow Implementation:**

```typescript
// Client-side consent banner
interface ConsentPreferences {
  essential: boolean;      // Always true (required for functionality)
  analytics: boolean;      // PostHog, Vercel Analytics
  marketing: boolean;      // Google Analytics 4
}

// API endpoint: POST /api/consent
async function recordConsent(preferences: ConsentPreferences) {
  await db.insert(user_consents).values([
    {
      user_id: currentUserId || null,
      session_id: sessionId,
      consent_type: 'essential',
      granted: true,
      granted_at: new Date(),
      consent_version: '1.0'
    },
    {
      user_id: currentUserId || null,
      session_id: sessionId,
      consent_type: 'analytics',
      granted: preferences.analytics,
      granted_at: new Date(),
      consent_version: '1.0'
    },
    {
      user_id: currentUserId || null,
      session_id: sessionId,
      consent_type: 'marketing',
      granted: preferences.marketing,
      granted_at: new Date(),
      consent_version: '1.0'
    }
  ]);

  // Initialize analytics based on consent
  if (preferences.analytics) {
    initializePostHog();
  }
  if (preferences.marketing) {
    initializeGA4();
  }
}
```

**Consent Banner Component:**

```typescript
// packages/ui/src/components/consent-banner.tsx
export function ConsentBanner() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg p-4">
      <h3>Cookie Preferences</h3>
      <p>We use cookies to improve your experience...</p>
      <div className="flex gap-4 mt-4">
        <button onClick={acceptAll}>Accept All</button>
        <button onClick={acceptEssential}>Essential Only</button>
        <button onClick={openCustomize}>Customize</button>
      </div>
    </div>
  );
}
```

**Consent Checking Middleware:**

```typescript
// packages/middleware/src/consent-check.ts
export function checkConsent(req: Request, consentType: ConsentType) {
  const consent = getConsentFromCookie(req);
  return consent[consentType] === true;
}

// Usage in analytics
if (checkConsent(req, 'analytics')) {
  posthog.capture('page_view', properties);
}
```

#### Data Processing Agreements (DPA)

**Vendor DPA Tracking:**

```sql
vendor_agreements
  - id (uuid, pk)
  - vendor_name (text)  -- e.g., "Clerk", "Vercel", "PostHog"
  - service_type (text)
  - dpa_signed (boolean)
  - dpa_signed_date (date, nullable)
  - dpa_document_url (text, nullable)
  - gdpr_compliant (boolean)
  - ccpa_compliant (boolean)
  - data_residency (text[])  -- e.g., ["US", "EU"]
  - last_reviewed (date)
  - next_review_date (date)
```

**DPA Documentation:**

Location: `/docs/legal/dpa/`
- `clerk-dpa.pdf` - Clerk Data Processing Agreement
- `vercel-dpa.pdf` - Vercel Data Processing Agreement
- `posthog-dpa.pdf` - PostHog Data Processing Agreement
- `neon-dpa.pdf` - Neon Database Data Processing Agreement

**Client DPA Template:**

```markdown
# Data Processing Agreement

This DPA is incorporated into the Terms of Service between MK3 and Client.

## Data Processing Details

**Data Controller:** Client Organisation
**Data Processor:** MK3

**Personal Data Categories:**
- User identity data (name, email)
- Authentication data
- Usage analytics
- Content created by users

**Processing Purposes:**
- Transformation framework management
- User authentication and authorization
- Analytics and reporting
- Service improvement

**Sub-processors:**
- Clerk (Authentication)
- Vercel (Hosting)
- Neon/Supabase (Database)
- PostHog (Analytics)

**Data Retention:**
- Active data: Retained while subscription active
- Deleted data: 30-day grace period, then permanent deletion
- Analytics: 12 months retention for PII-linked data

**Data Subject Rights:**
- Right to access (data export)
- Right to deletion (self-service)
- Right to rectification (profile settings)
- Right to portability (export in JSON/CSV)
```

#### CCPA "Do Not Sell" Implementation

**Opt-Out Mechanism:**

```sql
user_privacy_preferences
  - id (uuid, pk)
  - user_id (uuid, fk → users)
  - do_not_sell (boolean, default: false)
  - do_not_track (boolean, default: false)
  - marketing_opt_out (boolean, default: false)
  - updated_at (timestamp)
```

**API Implementation:**

```typescript
// API endpoint: POST /api/users/:id/privacy-preferences
async function updatePrivacyPreferences(userId: string, preferences: PrivacyPreferences) {
  await db.update(user_privacy_preferences)
    .set({
      do_not_sell: preferences.doNotSell,
      do_not_track: preferences.doNotTrack,
      marketing_opt_out: preferences.marketingOptOut,
      updated_at: new Date()
    })
    .where(eq(user_privacy_preferences.user_id, userId));

  // If do_not_sell is true, disable third-party analytics
  if (preferences.doNotSell) {
    await disableThirdPartyTracking(userId);
  }
}
```

**Footer Link:**

```html
<!-- Required for CCPA compliance -->
<footer>
  <a href="/privacy/do-not-sell">Do Not Sell My Personal Information</a>
</footer>
```

#### Compliance Monitoring

**Automated Compliance Checks:**

```typescript
// Vercel Cron: /api/cron/compliance-check (weekly)
async function runComplianceChecks() {
  const checks = [
    checkDeletionRequests(),      // Verify 30-day grace period honored
    checkExportExpiration(),       // Clean up expired exports
    checkConsentRecords(),         // Verify consent tracking
    checkVendorDPAs(),            // Alert on expiring DPAs
    checkDataRetention()          // Enforce retention policies
  ];

  const results = await Promise.all(checks);

  if (results.some(r => r.status === 'failed')) {
    await sendComplianceAlert(results);
  }
}
```

**Compliance Dashboard:**

Location: `/dashboards/compliance` (internal only)

Metrics tracked:
- Deletion requests pending/completed
- Average deletion completion time
- Export requests generated
- Consent grant/deny rates by type
- Vendor DPA status
- Data retention compliance

### Audit Logging Architecture

#### Audit Log Schema

**Database Schema:**

```sql
audit_logs
  - id (uuid, pk)
  - timestamp (timestamp, default: now())
  - user_id (uuid, fk → users, nullable)
  - organisation_id (uuid, fk → organisations, nullable)
  - action (text)  -- e.g., "user.created", "content.updated", "org.deleted"
  - resource_type (text)  -- e.g., "user", "content", "organisation"
  - resource_id (uuid)
  - old_values (jsonb, nullable)  -- State before change
  - new_values (jsonb, nullable)  -- State after change
  - ip_address (inet, nullable)
  - user_agent (text, nullable)
  - request_id (text, nullable)  -- For request tracing
  - severity (enum: info, warning, critical)
  - metadata (jsonb, nullable)  -- Additional context

-- Indexes for performance
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_audit_logs_org_id ON audit_logs(organisation_id) WHERE organisation_id IS NOT NULL;
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);

-- Partitioning by month for efficient retention management
-- Implement time-based partitioning for easier archive/deletion
```

#### Actions to Audit

**Critical Operations (Always Logged):**

| Category | Actions | Severity |
|----------|---------|----------|
| **Authentication** | `auth.login`, `auth.logout`, `auth.failed_login`, `auth.password_reset`, `auth.mfa_enabled`, `auth.mfa_disabled` | Critical |
| **User Management** | `user.created`, `user.updated`, `user.deleted`, `user.role_changed`, `user.invited`, `user.suspended` | Critical |
| **Organization** | `org.created`, `org.updated`, `org.deleted`, `org.member_added`, `org.member_removed`, `org.settings_changed` | Critical |
| **Permissions** | `permission.granted`, `permission.revoked`, `role.assigned`, `role.removed` | Critical |
| **Data Deletion** | `deletion.requested`, `deletion.cancelled`, `deletion.completed`, `deletion.grace_period_expired` | Critical |
| **Data Export** | `export.requested`, `export.generated`, `export.downloaded` | Warning |
| **Content** | `content.created`, `content.updated`, `content.deleted`, `content.published`, `content.unpublished` | Info |
| **Compliance** | `consent.granted`, `consent.revoked`, `privacy.do_not_sell_enabled`, `privacy.preferences_updated` | Warning |
| **Settings** | `settings.updated`, `integration.enabled`, `integration.disabled`, `api_key.created`, `api_key.revoked` | Warning |

#### Audit Logging Implementation

**Middleware-Based Logging:**

```typescript
// packages/observability/src/audit-logger.ts

export interface AuditLogEntry {
  action: string;
  resourceType: string;
  resourceId: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  severity: 'info' | 'warning' | 'critical';
  metadata?: Record<string, any>;
}

export class AuditLogger {
  async log(entry: AuditLogEntry, context: RequestContext) {
    const logEntry = {
      timestamp: new Date(),
      user_id: context.userId,
      organisation_id: context.organisationId,
      action: entry.action,
      resource_type: entry.resourceType,
      resource_id: entry.resourceId,
      old_values: entry.oldValues,
      new_values: entry.newValues,
      ip_address: context.ipAddress,
      user_agent: context.userAgent,
      request_id: context.requestId,
      severity: entry.severity,
      metadata: entry.metadata
    };

    // Write to database
    await db.insert(audit_logs).values(logEntry);

    // For critical events, also send to real-time monitoring
    if (entry.severity === 'critical') {
      await this.sendToMonitoring(logEntry);
    }
  }

  private async sendToMonitoring(entry: any) {
    // Send to Sentry for critical events
    Sentry.captureMessage(`Audit: ${entry.action}`, {
      level: 'info',
      contexts: {
        audit: entry
      }
    });
  }
}
```

**API Middleware Integration:**

```typescript
// apps/api/src/middleware/audit.ts

export function auditMiddleware() {
  return async (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    const originalJson = res.json.bind(res);

    // Capture the response for audit logging
    res.json = function(body: any) {
      const duration = Date.now() - startTime;

      // Determine if this request should be audited
      if (shouldAudit(req.method, req.path, res.statusCode)) {
        const auditEntry: AuditLogEntry = {
          action: inferAction(req.method, req.path),
          resourceType: inferResourceType(req.path),
          resourceId: extractResourceId(req.params),
          oldValues: req.body?._oldValues,  // Set by controller
          newValues: body?.data,
          severity: inferSeverity(req.path, req.method),
          metadata: {
            method: req.method,
            path: req.path,
            status: res.statusCode,
            duration
          }
        };

        // Async logging (non-blocking)
        auditLogger.log(auditEntry, getRequestContext(req))
          .catch(err => console.error('Audit logging failed:', err));
      }

      return originalJson(body);
    };

    next();
  };
}

function shouldAudit(method: string, path: string, status: number): boolean {
  // Don't audit GET requests (read operations)
  if (method === 'GET') return false;

  // Don't audit health checks
  if (path.includes('/health')) return false;

  // Only audit successful mutations
  if (status >= 200 && status < 300) return true;

  // Also audit failed critical operations
  if (status >= 400 && isCriticalPath(path)) return true;

  return false;
}
```

**Drizzle ORM Hook:**

```typescript
// packages/database/src/audit-hook.ts

export function withAudit<T extends AnyTable>(
  table: T,
  operation: 'insert' | 'update' | 'delete'
) {
  return {
    async execute(data: any, context: RequestContext) {
      // For updates and deletes, fetch old values first
      let oldValues: any = null;
      if (operation === 'update' || operation === 'delete') {
        oldValues = await db.select().from(table).where(eq(table.id, data.id));
      }

      // Execute the actual operation
      const result = await db[operation](table).values(data);

      // Log the audit trail
      await auditLogger.log({
        action: `${table._.name}.${operation}`,
        resourceType: table._.name,
        resourceId: data.id || result[0].id,
        oldValues: operation === 'update' || operation === 'delete' ? oldValues : undefined,
        newValues: operation === 'insert' || operation === 'update' ? data : undefined,
        severity: determineSeverity(table._.name, operation)
      }, context);

      return result;
    }
  };
}

// Usage in controllers
const user = await withAudit(users, 'update').execute({
  id: userId,
  name: 'New Name'
}, context);
```

#### Sensitive Data Handling

**Field Redaction:**

```typescript
// packages/observability/src/redaction.ts

const SENSITIVE_FIELDS = [
  'password',
  'password_hash',
  'api_key',
  'api_secret',
  'token',
  'credit_card',
  'ssn',
  'bank_account'
];

export function redactSensitiveData(data: any): any {
  if (!data || typeof data !== 'object') return data;

  const redacted = { ...data };

  for (const key of Object.keys(redacted)) {
    // Check if field name contains sensitive keywords
    if (SENSITIVE_FIELDS.some(field => key.toLowerCase().includes(field))) {
      redacted[key] = '[REDACTED]';
    }
    // Recursively redact nested objects
    else if (typeof redacted[key] === 'object') {
      redacted[key] = redactSensitiveData(redacted[key]);
    }
  }

  return redacted;
}

// Apply redaction before logging
const sanitizedOldValues = redactSensitiveData(oldValues);
const sanitizedNewValues = redactSensitiveData(newValues);
```

#### Retention Policy

**Retention Strategy:**

```typescript
// Retention periods by severity
const RETENTION_POLICIES = {
  critical: 730,  // 2 years for critical events
  warning: 365,   // 1 year for warnings
  info: 90        // 90 days for info (PRD requirement minimum)
};

// Vercel Cron: /api/cron/audit-cleanup (daily at 3 AM UTC)
export async function cleanupAuditLogs() {
  const now = new Date();

  for (const [severity, retentionDays] of Object.entries(RETENTION_POLICIES)) {
    const cutoffDate = new Date(now.getTime() - retentionDays * 24 * 60 * 60 * 1000);

    // Archive to cold storage before deletion (optional)
    const logsToArchive = await db.select()
      .from(audit_logs)
      .where(and(
        eq(audit_logs.severity, severity),
        lt(audit_logs.timestamp, cutoffDate)
      ))
      .limit(10000);  // Process in batches

    if (logsToArchive.length > 0) {
      // Archive to S3/Vercel Blob for long-term storage
      await archiveToS3(logsToArchive, severity, cutoffDate);

      // Delete from active database
      await db.delete(audit_logs)
        .where(and(
          eq(audit_logs.severity, severity),
          lt(audit_logs.timestamp, cutoffDate)
        ));

      console.log(`Archived and deleted ${logsToArchive.length} ${severity} audit logs`);
    }
  }
}

async function archiveToS3(logs: AuditLog[], severity: string, date: Date) {
  const filename = `audit-logs/${severity}/${date.toISOString().split('T')[0]}.jsonl`;
  const content = logs.map(log => JSON.stringify(log)).join('\n');

  await put(filename, content, {
    access: 'private',
    contentType: 'application/x-ndjson'
  });
}
```

#### Query and Reporting

**Audit Log Queries:**

```typescript
// packages/database/src/audit-queries.ts

export const auditQueries = {
  // Get user activity log
  async getUserActivity(userId: string, limit = 100) {
    return await db.select()
      .from(audit_logs)
      .where(eq(audit_logs.user_id, userId))
      .orderBy(desc(audit_logs.timestamp))
      .limit(limit);
  },

  // Get organization audit trail
  async getOrgAuditTrail(orgId: string, startDate: Date, endDate: Date) {
    return await db.select()
      .from(audit_logs)
      .where(and(
        eq(audit_logs.organisation_id, orgId),
        gte(audit_logs.timestamp, startDate),
        lte(audit_logs.timestamp, endDate)
      ))
      .orderBy(desc(audit_logs.timestamp));
  },

  // Get resource history (all changes to a specific resource)
  async getResourceHistory(resourceType: string, resourceId: string) {
    return await db.select()
      .from(audit_logs)
      .where(and(
        eq(audit_logs.resource_type, resourceType),
        eq(audit_logs.resource_id, resourceId)
      ))
      .orderBy(desc(audit_logs.timestamp));
  },

  // Get critical events
  async getCriticalEvents(since: Date) {
    return await db.select()
      .from(audit_logs)
      .where(and(
        eq(audit_logs.severity, 'critical'),
        gte(audit_logs.timestamp, since)
      ))
      .orderBy(desc(audit_logs.timestamp));
  },

  // Security anomaly detection
  async detectAnomalies(userId: string, timeWindow: number = 3600) {
    // Detect unusual activity patterns
    const recentActions = await db.select()
      .from(audit_logs)
      .where(and(
        eq(audit_logs.user_id, userId),
        gte(audit_logs.timestamp, new Date(Date.now() - timeWindow * 1000))
      ));

    // Check for suspicious patterns
    const failedLogins = recentActions.filter(a => a.action === 'auth.failed_login');
    const deletions = recentActions.filter(a => a.action.includes('deleted'));

    return {
      suspiciousActivity: failedLogins.length > 5 || deletions.length > 10,
      failedLoginCount: failedLogins.length,
      deletionCount: deletions.length,
      actions: recentActions
    };
  }
};
```

**Audit Dashboard API:**

```typescript
// apps/api/src/routes/audit.ts

router.get('/api/v1/audit/logs', requireRole('internal'), async (req, res) => {
  const { userId, orgId, action, startDate, endDate, page = 1, limit = 50 } = req.query;

  const filters = [];
  if (userId) filters.push(eq(audit_logs.user_id, userId));
  if (orgId) filters.push(eq(audit_logs.organisation_id, orgId));
  if (action) filters.push(eq(audit_logs.action, action));
  if (startDate) filters.push(gte(audit_logs.timestamp, new Date(startDate)));
  if (endDate) filters.push(lte(audit_logs.timestamp, new Date(endDate)));

  const logs = await db.select()
    .from(audit_logs)
    .where(filters.length > 0 ? and(...filters) : undefined)
    .orderBy(desc(audit_logs.timestamp))
    .limit(limit)
    .offset((page - 1) * limit);

  const total = await db.select({ count: count() })
    .from(audit_logs)
    .where(filters.length > 0 ? and(...filters) : undefined);

  res.json({
    success: true,
    data: logs,
    meta: {
      page,
      limit,
      total: total[0].count
    }
  });
});

// Export audit logs for compliance
router.post('/api/v1/audit/export', requireRole('internal'), async (req, res) => {
  const { orgId, startDate, endDate, format = 'csv' } = req.body;

  const logs = await auditQueries.getOrgAuditTrail(
    orgId,
    new Date(startDate),
    new Date(endDate)
  );

  // Generate export file
  const exportData = format === 'csv'
    ? generateCSV(logs)
    : JSON.stringify(logs, null, 2);

  res.setHeader('Content-Type', format === 'csv' ? 'text/csv' : 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="audit-log-${orgId}-${Date.now()}.${format}"`);
  res.send(exportData);
});
```

#### Real-Time Monitoring

**Critical Event Alerts:**

```typescript
// packages/observability/src/audit-alerts.ts

export async function monitorCriticalEvents() {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

  // Check for suspicious patterns
  const criticalEvents = await db.select()
    .from(audit_logs)
    .where(and(
      eq(audit_logs.severity, 'critical'),
      gte(audit_logs.timestamp, fiveMinutesAgo)
    ));

  // Alert conditions
  const alerts = [];

  // Multiple failed logins
  const failedLogins = criticalEvents.filter(e => e.action === 'auth.failed_login');
  const loginsByUser = groupBy(failedLogins, 'user_id');
  for (const [userId, events] of Object.entries(loginsByUser)) {
    if (events.length >= 5) {
      alerts.push({
        type: 'BRUTE_FORCE_ATTEMPT',
        severity: 'high',
        userId,
        count: events.length
      });
    }
  }

  // Mass deletions
  const deletions = criticalEvents.filter(e => e.action.includes('deleted'));
  if (deletions.length > 20) {
    alerts.push({
      type: 'MASS_DELETION',
      severity: 'critical',
      count: deletions.length
    });
  }

  // Permission escalations
  const permChanges = criticalEvents.filter(e =>
    e.action.includes('permission') || e.action.includes('role')
  );
  if (permChanges.length > 10) {
    alerts.push({
      type: 'PERMISSION_CHANGES',
      severity: 'medium',
      count: permChanges.length
    });
  }

  // Send alerts
  for (const alert of alerts) {
    await sendAlert(alert);
  }
}

async function sendAlert(alert: any) {
  // Send to Slack
  await fetch(process.env.SLACK_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: `🚨 Security Alert: ${alert.type}`,
      attachments: [{
        color: alert.severity === 'critical' ? 'danger' : 'warning',
        fields: Object.entries(alert).map(([key, value]) => ({
          title: key,
          value: String(value),
          short: true
        }))
      }]
    })
  });

  // Log to Sentry
  Sentry.captureMessage(`Security Alert: ${alert.type}`, {
    level: alert.severity === 'critical' ? 'error' : 'warning',
    contexts: { alert }
  });
}
```

#### Compliance Reporting

**Audit Trail Export for Compliance:**

```typescript
// Generate compliance-ready audit report
export async function generateComplianceReport(
  orgId: string,
  startDate: Date,
  endDate: Date
) {
  const logs = await auditQueries.getOrgAuditTrail(orgId, startDate, endDate);

  const report = {
    organization: orgId,
    period: {
      start: startDate.toISOString(),
      end: endDate.toISOString()
    },
    summary: {
      total_events: logs.length,
      critical_events: logs.filter(l => l.severity === 'critical').length,
      unique_users: new Set(logs.map(l => l.user_id)).size,
      actions_by_type: countBy(logs, 'action')
    },
    events: logs.map(log => ({
      timestamp: log.timestamp,
      user: log.user_id,
      action: log.action,
      resource: `${log.resource_type}:${log.resource_id}`,
      severity: log.severity,
      ip_address: log.ip_address
    }))
  };

  return report;
}
```

### Rate Limiting Architecture

**Rate Limit Strategy:**

Per PRD Section 5.2 requirements:
- 100 requests/minute per user
- 1,000 requests/minute per organization
- API-level enforcement via middleware

#### Rate Limiting Implementation

**Database Schema:**

```sql
rate_limit_buckets
  - id (uuid, pk)
  - key (text, unique)  -- Format: "user:{userId}" or "org:{orgId}"
  - count (integer)
  - window_start (timestamp)
  - expires_at (timestamp)

CREATE INDEX idx_rate_limit_key ON rate_limit_buckets(key);
CREATE INDEX idx_rate_limit_expires ON rate_limit_buckets(expires_at);
```

**Middleware Implementation:**

```typescript
// packages/middleware/src/rate-limiter.ts

interface RateLimitConfig {
  userLimit: number;      // 100 requests/minute per user
  orgLimit: number;       // 1000 requests/minute per org
  windowMs: number;       // 60000ms (1 minute)
}

const RATE_LIMIT_CONFIG: RateLimitConfig = {
  userLimit: 100,
  orgLimit: 1000,
  windowMs: 60 * 1000  // 1 minute
};

export async function rateLimitMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userId = req.user?.id;
  const orgId = req.organization?.id;

  if (!userId) {
    // Anonymous requests - apply IP-based rate limiting
    return next();
  }

  // Check user rate limit
  const userLimitKey = `user:${userId}`;
  const userAllowed = await checkRateLimit(
    userLimitKey,
    RATE_LIMIT_CONFIG.userLimit,
    RATE_LIMIT_CONFIG.windowMs
  );

  if (!userAllowed) {
    return res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'User rate limit exceeded (100 requests/minute)',
        retryAfter: await getRetryAfter(userLimitKey)
      }
    });
  }

  // Check organization rate limit if applicable
  if (orgId) {
    const orgLimitKey = `org:${orgId}`;
    const orgAllowed = await checkRateLimit(
      orgLimitKey,
      RATE_LIMIT_CONFIG.orgLimit,
      RATE_LIMIT_CONFIG.windowMs
    );

    if (!orgAllowed) {
      return res.status(429).json({
        success: false,
        error: {
          code: 'ORG_RATE_LIMIT_EXCEEDED',
          message: 'Organization rate limit exceeded (1000 requests/minute)',
          retryAfter: await getRetryAfter(orgLimitKey)
        }
      });
    }
  }

  // Set rate limit headers
  const userCount = await getRateLimitCount(userLimitKey);
  res.setHeader('X-RateLimit-Limit-User', RATE_LIMIT_CONFIG.userLimit);
  res.setHeader('X-RateLimit-Remaining-User', Math.max(0, RATE_LIMIT_CONFIG.userLimit - userCount));
  res.setHeader('X-RateLimit-Reset-User', await getRateLimitReset(userLimitKey));

  if (orgId) {
    const orgCount = await getRateLimitCount(`org:${orgId}`);
    res.setHeader('X-RateLimit-Limit-Org', RATE_LIMIT_CONFIG.orgLimit);
    res.setHeader('X-RateLimit-Remaining-Org', Math.max(0, RATE_LIMIT_CONFIG.orgLimit - orgCount));
  }

  next();
}

async function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<boolean> {
  const now = new Date();
  const windowStart = new Date(now.getTime() - windowMs);

  // Get or create rate limit bucket
  let bucket = await db.query.rate_limit_buckets.findFirst({
    where: and(
      eq(rate_limit_buckets.key, key),
      gte(rate_limit_buckets.window_start, windowStart)
    )
  });

  if (!bucket) {
    // Create new bucket
    await db.insert(rate_limit_buckets).values({
      key,
      count: 1,
      window_start: now,
      expires_at: new Date(now.getTime() + windowMs)
    });
    return true;
  }

  // Check if limit exceeded
  if (bucket.count >= limit) {
    return false;
  }

  // Increment counter
  await db.update(rate_limit_buckets)
    .set({ count: bucket.count + 1 })
    .where(eq(rate_limit_buckets.id, bucket.id));

  return true;
}

async function getRetryAfter(key: string): Promise<number> {
  const bucket = await db.query.rate_limit_buckets.findFirst({
    where: eq(rate_limit_buckets.key, key)
  });

  if (!bucket) return 0;

  const now = Date.now();
  const resetTime = bucket.expires_at.getTime();
  return Math.ceil((resetTime - now) / 1000); // seconds
}
```

**Cleanup Cron Job:**

```typescript
// Vercel Cron: /api/cron/cleanup-rate-limits (every 5 minutes)
export async function cleanupRateLimits() {
  const now = new Date();

  // Delete expired rate limit buckets
  await db.delete(rate_limit_buckets)
    .where(lt(rate_limit_buckets.expires_at, now));
}
```

**Alternative: Redis-Based Rate Limiting (Production Optimization):**

```typescript
// For high-traffic scenarios, use Redis for better performance
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL,
  token: process.env.UPSTASH_REDIS_TOKEN
});

async function checkRateLimitRedis(
  key: string,
  limit: number,
  windowMs: number
): Promise<boolean> {
  const now = Date.now();
  const windowKey = `ratelimit:${key}:${Math.floor(now / windowMs)}`;

  const count = await redis.incr(windowKey);

  // Set expiration on first request
  if (count === 1) {
    await redis.expire(windowKey, Math.ceil(windowMs / 1000));
  }

  return count <= limit;
}
```

### Application-Level Encryption

**Encryption Strategy:**

Per PRD Section 5.2: Additional application-level encryption for sensitive PII fields beyond database-level encryption.

#### Encrypted Fields

Fields requiring application-level encryption:
- API keys and secrets
- SSN or tax identifiers
- Bank account numbers
- Credit card information (if stored)
- Two-factor authentication secrets
- Encryption keys for client data

#### Encryption Implementation

**Encryption Service:**

```typescript
// packages/security/src/encryption.ts

import { createCipheriv, createDecipheriv, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

export class EncryptionService {
  private algorithm = 'aes-256-gcm';
  private keyLength = 32;
  private ivLength = 16;
  private saltLength = 64;
  private tagLength = 16;

  /**
   * Encrypts sensitive data using AES-256-GCM
   * Returns base64-encoded encrypted data with salt, iv, and auth tag
   */
  async encrypt(plaintext: string): Promise<string> {
    if (!process.env.ENCRYPTION_KEY) {
      throw new Error('ENCRYPTION_KEY environment variable not set');
    }

    // Generate random salt and IV
    const salt = randomBytes(this.saltLength);
    const iv = randomBytes(this.ivLength);

    // Derive key from master key + salt
    const key = (await scryptAsync(
      process.env.ENCRYPTION_KEY,
      salt,
      this.keyLength
    )) as Buffer;

    // Create cipher
    const cipher = createCipheriv(this.algorithm, key, iv);

    // Encrypt
    const encrypted = Buffer.concat([
      cipher.update(plaintext, 'utf8'),
      cipher.final()
    ]);

    // Get authentication tag
    const tag = cipher.getAuthTag();

    // Combine salt + iv + tag + encrypted data
    const result = Buffer.concat([salt, iv, tag, encrypted]);

    return result.toString('base64');
  }

  /**
   * Decrypts data encrypted with encrypt()
   */
  async decrypt(ciphertext: string): Promise<string> {
    if (!process.env.ENCRYPTION_KEY) {
      throw new Error('ENCRYPTION_KEY environment variable not set');
    }

    // Decode from base64
    const buffer = Buffer.from(ciphertext, 'base64');

    // Extract components
    const salt = buffer.subarray(0, this.saltLength);
    const iv = buffer.subarray(this.saltLength, this.saltLength + this.ivLength);
    const tag = buffer.subarray(
      this.saltLength + this.ivLength,
      this.saltLength + this.ivLength + this.tagLength
    );
    const encrypted = buffer.subarray(this.saltLength + this.ivLength + this.tagLength);

    // Derive key
    const key = (await scryptAsync(
      process.env.ENCRYPTION_KEY,
      salt,
      this.keyLength
    )) as Buffer;

    // Create decipher
    const decipher = createDecipheriv(this.algorithm, key, iv);
    decipher.setAuthTag(tag);

    // Decrypt
    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final()
    ]);

    return decrypted.toString('utf8');
  }

  /**
   * Hash sensitive data for comparison (one-way)
   */
  async hash(data: string): Promise<string> {
    const salt = randomBytes(this.saltLength);
    const hash = (await scryptAsync(data, salt, this.keyLength)) as Buffer;
    return `${salt.toString('base64')}:${hash.toString('base64')}`;
  }

  /**
   * Verify hashed data
   */
  async verifyHash(data: string, hashedData: string): Promise<boolean> {
    const [saltB64, hashB64] = hashedData.split(':');
    const salt = Buffer.from(saltB64, 'base64');
    const expectedHash = Buffer.from(hashB64, 'base64');
    const actualHash = (await scryptAsync(data, salt, this.keyLength)) as Buffer;
    return actualHash.equals(expectedHash);
  }
}

export const encryption = new EncryptionService();
```

**Database Schema Extension:**

```sql
-- Add encrypted fields to tables requiring sensitive data storage

api_keys
  - id (uuid, pk)
  - user_id (uuid, fk → users)
  - name (text)
  - key_prefix (text)  -- First 8 chars for display (e.g., "sk_live_...")
  - key_encrypted (text)  -- Encrypted full API key
  - created_at (timestamp)
  - last_used_at (timestamp, nullable)
  - expires_at (timestamp, nullable)

user_credentials
  - id (uuid, pk)
  - user_id (uuid, fk → users)
  - credential_type (enum: totp_secret, backup_code, api_token)
  - value_encrypted (text)
  - created_at (timestamp)
```

**Usage in Application:**

```typescript
// Storing sensitive data
async function createApiKey(userId: string, name: string) {
  const apiKey = generateSecureToken();
  const keyPrefix = apiKey.substring(0, 8);
  const encryptedKey = await encryption.encrypt(apiKey);

  await db.insert(api_keys).values({
    user_id: userId,
    name,
    key_prefix: keyPrefix,
    key_encrypted: encryptedKey,
    created_at: new Date()
  });

  // Return plaintext key only once
  return apiKey;
}

// Retrieving sensitive data
async function validateApiKey(providedKey: string): Promise<boolean> {
  const keyPrefix = providedKey.substring(0, 8);

  const storedKey = await db.query.api_keys.findFirst({
    where: eq(api_keys.key_prefix, keyPrefix)
  });

  if (!storedKey) return false;

  const decryptedKey = await encryption.decrypt(storedKey.key_encrypted);
  return decryptedKey === providedKey;
}

// Storing user settings with sensitive fields
async function updateUserSettings(userId: string, settings: UserSettings) {
  const encryptedSettings = { ...settings };

  // Encrypt sensitive fields
  if (settings.apiIntegrations) {
    for (const integration of settings.apiIntegrations) {
      if (integration.apiKey) {
        integration.apiKey = await encryption.encrypt(integration.apiKey);
      }
      if (integration.secret) {
        integration.secret = await encryption.encrypt(integration.secret);
      }
    }
  }

  await db.update(organisations)
    .set({ settings: encryptedSettings })
    .where(eq(organisations.id, userId));
}
```

**Key Rotation Strategy:**

```typescript
// packages/security/src/key-rotation.ts

export async function rotateEncryptionKey(newKey: string) {
  // 1. Fetch all encrypted data
  const apiKeys = await db.select().from(api_keys);
  const credentials = await db.select().from(user_credentials);

  // 2. Decrypt with old key
  const oldKey = process.env.ENCRYPTION_KEY;
  const oldEncryption = new EncryptionService();

  // 3. Re-encrypt with new key
  process.env.ENCRYPTION_KEY = newKey;
  const newEncryption = new EncryptionService();

  // 4. Update all records
  for (const key of apiKeys) {
    const decrypted = await oldEncryption.decrypt(key.key_encrypted);
    const reencrypted = await newEncryption.encrypt(decrypted);

    await db.update(api_keys)
      .set({ key_encrypted: reencrypted })
      .where(eq(api_keys.id, key.id));
  }

  // Similar process for other encrypted data...

  console.log('Key rotation completed successfully');
}
```

**Environment Variables Required:**

```bash
# .env
ENCRYPTION_KEY=<256-bit random key in base64>

# Generate with:
# node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Security Best Practices:**

1. **Key Management:**
   - Store `ENCRYPTION_KEY` in Vercel environment variables
   - Never commit encryption keys to version control
   - Rotate keys annually or after suspected compromise
   - Use different keys for different environments

2. **Audit Trail:**
   - Log all encryption/decryption operations in audit logs
   - Track key rotation events
   - Monitor for decryption failures (potential tampering)

3. **Compliance:**
   - AES-256-GCM provides FIPS 140-2 compliant encryption
   - Authentication tag prevents tampering
   - Random salts prevent rainbow table attacks

### Security Headers

Configured via middleware:

```typescript
Content-Security-Policy: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://clerk.com https://posthog.com"
Strict-Transport-Security: "max-age=31536000; includeSubDomains"
X-Frame-Options: "DENY"
X-Content-Type-Options: "nosniff"
Referrer-Policy: "strict-origin-when-cross-origin"
Permissions-Policy: "geolocation=(), microphone=(), camera=()"
```

---

