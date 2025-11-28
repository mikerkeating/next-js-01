# ADR-006: Clerk for Authentication

## Status

✅ **Accepted** - 2025-11-24

## Context

We need to select an authentication and user management solution for our multi-tenant SaaS platform that provides secure, scalable authentication while delivering an excellent user experience. The solution must support multiple authentication methods, integrate seamlessly with Next.js, provide Organisation management features, and scale with our growth.

### Key Requirements

1. **Authentication Methods**: Email/password, OAuth (Google, GitHub, etc.), magic links
2. **User Management**: User profiles, session management, account settings
3. **Organisation Support**: Multi-tenant Organisation management
4. **Security**: Industry-standard security practices, JWT tokens, secure sessions
5. **Developer Experience**: Easy integration, good documentation, TypeScript support
6. **User Experience**: Beautiful, customizable UI components
7. **Next.js Integration**: Works with App Router and Server Components
8. **Webhooks**: Real-time synchronization with our database
9. **Scalability**: Handles growth from startup to enterprise
10. **Compliance**: GDPR, SOC 2, data residency options

### Constraints

- Must work with Next.js 16 App Router
- Must support edge runtime
- Must integrate with PostgreSQL (via webhooks)
- Must support custom role mapping
- Team needs to implement auth quickly

## Decision

We will use **Clerk** as our authentication and user management provider.

### Configuration

**Environment Variables**:

```bash
# Public keys (client-side)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

# Secret keys (server-side)
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...
```

**Middleware Configuration (middleware.ts)**:

```typescript
import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  // Public routes that don't require authentication
  publicRoutes: ["/", "/sign-in(.*)", "/sign-up(.*)", "/api/webhooks/clerk", "/api/health"],

  // Routes that can be accessed while signed out
  ignoredRoutes: ["/api/webhooks/clerk"],

  // After auth middleware
  afterAuth(auth, req) {
    // Handle Organisation context
    if (auth.userId && auth.orgId) {
      // Inject org context into request
      req.headers.set("x-Organisation-id", auth.orgId);
    }
  },
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
```

**Root Layout (app/layout.tsx)**:

```typescript
import { ClerkProvider } from '@clerk/nextjs'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}
```

**Webhook Handler (app/api/webhooks/clerk/route.ts)**:

```typescript
import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { db } from "@repo/database";
import { users, organisations, userOrganisations } from "@repo/database/schema";

export async function POST(req: Request) {
  // Get webhook secret
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    throw new Error("Missing CLERK_WEBHOOK_SECRET");
  }

  // Get headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  // Get body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Verify webhook
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    return new Response("Invalid signature", { status: 400 });
  }

  // Handle events
  switch (evt.type) {
    case "user.created":
      await db.insert(users).values({
        clerkId: evt.data.id,
        email: evt.data.email_addresses[0].email_address,
        name: `${evt.data.first_name} ${evt.data.last_name}`.trim(),
        avatarUrl: evt.data.image_url,
      });
      break;

    case "user.updated":
      await db
        .update(users)
        .set({
          email: evt.data.email_addresses[0].email_address,
          name: `${evt.data.first_name} ${evt.data.last_name}`.trim(),
          avatarUrl: evt.data.image_url,
          updatedAt: new Date(),
        })
        .where(eq(users.clerkId, evt.data.id));
      break;

    case "Organisation.created":
      await db.insert(organisations).values({
        clerkId: evt.data.id,
        name: evt.data.name,
        slug: evt.data.slug,
      });
      break;

    case "OrganisationMembership.created":
      // Add user to Organisation
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.clerkId, evt.data.public_user_data.user_id));

      const [org] = await db
        .select()
        .from(organisations)
        .where(eq(organisations.clerkId, evt.data.Organisation.id));

      await db.insert(userOrganisations).values({
        userId: user.id,
        organisationId: org.id,
        role: mapClerkRoleToOurRole(evt.data.role),
      });
      break;
  }

  return new Response("Webhook processed", { status: 200 });
}
```

## Rationale

### Why Clerk?

1. **Modern Authentication**
   - Multiple sign-in methods out of the box
   - Passwordless authentication (magic links)
   - OAuth providers (Google, GitHub, Microsoft, etc.)
   - Email verification built-in
   - Two-factor authentication support

2. **Excellent Developer Experience**
   - Simple Next.js integration
   - TypeScript support throughout
   - Comprehensive documentation
   - Helper hooks for React
   - Edge runtime compatible

3. **Beautiful User Experience**
   - Pre-built, customizable UI components
   - Responsive and accessible
   - Dark mode support
   - Branded sign-in experience
   - Smooth user flows

4. **Organisation Management**
   - Built-in Organisation support
   - Role-based access control
   - Invitation system
   - Organisation switching
   - Member management

5. **Security First**
   - SOC 2 Type II certified
   - GDPR compliant
   - Automatic security updates
   - Rate limiting included
   - DDoS protection

6. **Real-time Synchronization**
   - Webhook support for all events
   - Reliable event delivery
   - Signature verification
   - Idempotent webhooks

7. **Scalability**
   - Handles millions of users
   - 99.99% uptime SLA
   - Global edge network
   - No infrastructure management
   - Automatic scaling

8. **Customization**
   - Custom email templates
   - Branded authentication flows
   - Custom session management
   - Flexible role mapping
   - API for custom logic

9. **Next.js Optimization**
   - First-class App Router support
   - Server Components integration
   - Middleware support
   - Edge runtime compatible
   - Optimized for React 19

10. **Cost Effective**
    - Generous free tier (10,000 MAU)
    - Predictable pricing
    - No hidden costs
    - Enterprise discounts available

### Alternatives Considered

#### Option 1: NextAuth.js / Auth.js

**Pros:**

- Open source and free
- Full control over auth flow
- Works with any database
- Good Next.js integration
- No vendor lock-in

**Cons:**

- ❌ Requires more setup and maintenance
- ❌ No built-in UI components
- ❌ Manual security updates required
- ❌ No Organisation management
- ❌ More code to maintain
- ❌ Need to handle edge cases yourself

**Decision**: Rejected - Too much engineering time needed to match Clerk's features.

#### Option 2: Auth0

**Pros:**

- Enterprise-grade
- Extensive features
- Good documentation
- Wide OAuth support
- Mature product

**Cons:**

- ❌ More expensive than Clerk
- ❌ Less modern developer experience
- ❌ UI components less polished
- ❌ More complex setup
- ❌ Heavier SDK
- ❌ Older architecture

**Decision**: Rejected - Clerk provides better DX at lower cost.

#### Option 3: Supabase Auth

**Pros:**

- Free and open source
- Integrated with Supabase database
- Good documentation
- Row Level Security integration
- Simple API

**Cons:**

- ❌ Coupled to Supabase ecosystem
- ❌ Limited UI components
- ❌ No Organisation management
- ❌ Less polished than Clerk
- ❌ Fewer OAuth providers
- ❌ Requires more custom code

**Decision**: Rejected - While good, lacks Organisation features and polished UX.

#### Option 4: Firebase Authentication

**Pros:**

- Google backing
- Generous free tier
- Good mobile support
- Real-time capabilities
- Easy to start

**Cons:**

- ❌ Tied to Firebase ecosystem
- ❌ Limited customization
- ❌ No Organisation support
- ❌ Not optimized for Next.js
- ❌ Older SDK design
- ❌ Less suitable for SaaS

**Decision**: Rejected - Not designed for multi-tenant B2B SaaS applications.

#### Option 5: Amazon Cognito

**Pros:**

- AWS integration
- Scalable
- Secure
- Enterprise features
- HIPAA eligible

**Cons:**

- ❌ Complex setup
- ❌ Poor developer experience
- ❌ No UI components
- ❌ Confusing documentation
- ❌ Expensive at scale
- ❌ Not Next.js optimized

**Decision**: Rejected - Too complex, poor DX compared to Clerk.

#### Option 6: Custom Built Authentication

**Pros:**

- Complete control
- No vendor costs
- Custom features
- No limitations

**Cons:**

- ❌ Months of development time
- ❌ Security risks if done wrong
- ❌ Ongoing maintenance burden
- ❌ Need to handle compliance
- ❌ Need to build all features
- ❌ Distraction from core product

**Decision**: Rejected - Not a good use of engineering time for a startup.

## Consequences

### Positive

1. **Fast Implementation**: Authentication ready in hours, not weeks
2. **Beautiful UX**: Professional authentication flows out of the box
3. **Secure by Default**: Industry-standard security without effort
4. **Organisation Support**: Multi-tenancy features built-in
5. **Less Maintenance**: No auth code to maintain
6. **Scalable**: Grows with our user base automatically
7. **Compliance Ready**: GDPR, SOC 2 handled by Clerk
8. **Great DX**: Simple APIs, good TypeScript support
9. **Edge Compatible**: Works in all our deployment scenarios
10. **Focus on Product**: Team can focus on core features

### Negative

1. **Vendor Lock-in**: Switching auth providers is complex
2. **Cost at Scale**: Can become expensive with millions of users
3. **Customization Limits**: Some customization requires enterprise plan
4. **Third-party Dependency**: Reliant on Clerk's uptime
5. **Data Location**: User data stored with Clerk (though GDPR compliant)

### Mitigation Strategies

1. **Vendor Lock-in**:
   - Abstract Clerk behind internal auth service
   - Store essential user data in our database
   - Keep webhooks for synchronization
   - Design for potential migration

2. **Cost Management**:
   - Monitor Monthly Active Users (MAU)
   - Optimize authentication flows
   - Consider enterprise discount early
   - Budget for growth

3. **Customization Needs**:
   - Start with standard plan
   - Upgrade to Pro/Enterprise when needed
   - Use Clerk API for custom features
   - Design within Clerk's capabilities

4. **Uptime Dependency**:
   - Monitor Clerk status page
   - Implement graceful degradation
   - Have fallback error pages
   - Cache session data appropriately

5. **Data Sovereignty**:
   - Use Clerk's EU data centers if needed
   - Sync critical data to our database
   - Understand data processing agreement
   - Regular compliance reviews

## Implementation Plan

### Phase 1: Basic Setup (Day 1)

- [x] Create Clerk account
- [ ] Install Clerk packages
- [ ] Configure environment variables
- [ ] Add ClerkProvider to root layout
- [ ] Set up middleware

### Phase 2: Authentication Flows (Day 1-2)

- [ ] Create sign-in page
- [ ] Create sign-up page
- [ ] Configure OAuth providers (Google, GitHub)
- [ ] Test authentication flows
- [ ] Add sign-out functionality

### Phase 3: Webhook Integration (Day 2-3)

- [ ] Create webhook endpoint
- [ ] Configure Clerk webhook settings
- [ ] Implement user sync on creation
- [ ] Implement user sync on update
- [ ] Test webhook delivery

### Phase 4: Organisation Setup (Day 3-4)

- [ ] Enable Organisations in Clerk
- [ ] Create Organisation sync webhook handlers
- [ ] Implement Organisation switching UI
- [ ] Map Clerk roles to our roles
- [ ] Test Organisation flows

### Phase 5: Customization (Week 1-2)

- [ ] Customize sign-in UI (colors, logo)
- [ ] Configure email templates
- [ ] Set up custom session claims
- [ ] Add user profile management
- [ ] Implement Organisation invitations

### Phase 6: Production Ready (Week 2)

- [ ] Set up production Clerk instance
- [ ] Configure production webhooks
- [ ] Test all flows in staging
- [ ] Security review
- [ ] Documentation for team

## Validation

### Success Metrics

- [ ] Sign-up conversion rate > 70%
- [ ] Authentication flow < 30 seconds
- [ ] Zero security incidents
- [ ] Webhook delivery success > 99%
- [ ] Session management working reliably
- [ ] Organisation switching works smoothly
- [ ] Team comfortable with Clerk within 1 week

### Testing Checklist

1. **Authentication**:
   - [ ] Email/password sign-up works
   - [ ] Email/password sign-in works
   - [ ] Magic link authentication works
   - [ ] OAuth (Google) works
   - [ ] OAuth (GitHub) works
   - [ ] Sign-out works correctly

2. **User Management**:
   - [ ] User profile updates sync
   - [ ] Email verification works
   - [ ] Password reset works
   - [ ] Account deletion works
   - [ ] Avatar upload works

3. **Organisations**:
   - [ ] Organisation creation works
   - [ ] Member invitations work
   - [ ] Role assignment works
   - [ ] Organisation switching works
   - [ ] Member removal works

4. **Webhooks**:
   - [ ] User creation syncs to database
   - [ ] User updates sync to database
   - [ ] Organisation creation syncs
   - [ ] Membership changes sync
   - [ ] Webhook signatures verified

5. **Security**:
   - [ ] Sessions expire correctly
   - [ ] Protected routes work
   - [ ] Organisation isolation enforced
   - [ ] CSRF protection works
   - [ ] Rate limiting active

## Usage Examples

### Protecting Routes

```typescript
// app/dashboard/page.tsx
import { auth } from '@clerk/nextjs'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const { userId } = auth()

  if (!userId) {
    redirect('/sign-in')
  }

  return <div>Dashboard for user {userId}</div>
}
```

### Accessing User Data

```typescript
// Server Component
import { currentUser } from '@clerk/nextjs'

export default async function Profile() {
  const user = await currentUser()

  return (
    <div>
      <h1>{user?.firstName} {user?.lastName}</h1>
      <p>{user?.emailAddresses[0].emailAddress}</p>
    </div>
  )
}

// Client Component
'use client'
import { useUser } from '@clerk/nextjs'

export function UserProfile() {
  const { user } = useUser()

  return <div>{user?.firstName}</div>
}
```

### Organisation Context

```typescript
import { auth } from '@clerk/nextjs'

export default async function OrgDashboard() {
  const { userId, orgId, orgRole } = auth()

  if (!orgId) {
    redirect('/select-Organisation')
  }

  // Fetch org-specific data
  const data = await getOrgData(orgId)

  return <div>Organisation: {orgId}</div>
}
```

### API Route Protection

```typescript
// app/api/users/route.ts
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId } = auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch data
  const users = await getUsers();
  return NextResponse.json(users);
}
```

### Role-Based Access

```typescript
import { auth } from '@clerk/nextjs'

export default async function AdminPage() {
  const { userId, sessionClaims } = auth()

  const role = sessionClaims?.metadata?.role

  if (role !== 'internal' && role !== 'product-seller') {
    redirect('/unauthorized')
  }

  return <div>Admin Content</div>
}
```

## Best Practices

1. **Session Management**
   - Use Clerk's built-in session management
   - Don't store sensitive data in session claims
   - Validate sessions on the server
   - Use short-lived tokens

2. **Organisation Isolation**
   - Always check orgId in protected routes
   - Filter database queries by Organisation
   - Use middleware to inject org context
   - Validate Organisation membership

3. **Webhook Handling**
   - Always verify webhook signatures
   - Make webhook handlers idempotent
   - Handle webhooks asynchronously if needed
   - Log webhook failures for monitoring

4. **Custom Claims**
   - Use metadata for additional user data
   - Keep claims small (size limits apply)
   - Sync important data to database
   - Use public metadata for client access

5. **Error Handling**
   - Handle Clerk errors gracefully
   - Provide fallback UI for auth failures
   - Log authentication errors
   - Monitor authentication metrics

## References

- [Clerk Documentation](https://clerk.com/docs)
- [Clerk Next.js Quickstart](https://clerk.com/docs/quickstarts/nextjs)
- [Clerk Organisations](https://clerk.com/docs/Organisations/overview)
- [Clerk Webhooks](https://clerk.com/docs/integrations/webhooks)
- [Clerk Security](https://clerk.com/docs/security/overview)

## Related ADRs

- [ADR-003: Next.js 16 as Framework](003-nextjs-framework.md) - Clerk integrates with Next.js
- [ADR-005: Drizzle as ORM](005-drizzle-orm.md) - User data synced via webhooks
- [ADR-007: Multi-tenant Data Model](007-multi-tenant-model.md) - Organisation management

## Notes

Clerk's combination of excellent developer experience, beautiful user interface, and comprehensive features makes it the ideal choice for our authentication needs. While there's some vendor lock-in risk, the time saved and features provided far outweigh the concerns for a startup.

The built-in Organisation management perfectly aligns with our multi-tenant architecture, and the webhook system ensures our database stays in sync with authentication state. This allows us to leverage Clerk's expertise in authentication while maintaining control over our data model.

---

**Author**: Technical Lead
**Date**: 2025-11-24
**Reviewers**: Security Lead, Frontend Lead, Engineering Team
**Last Updated**: 2025-11-24
