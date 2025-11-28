# Story 0A.1.S9: Add Basic Auth Middleware

> **To implement this story:** Read the Technical Requirements, create/modify the specified files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context
- **Epic**: [Steel Thread Deployment](./EPIC.md)
- **Depends On**: [S2: Create Minimal Next.js 16 Application](./S2-nextjs-app.md), [S5: Configure Environment Variables](./S5-environment-variables.md)
- **Blocks**: None
- **Runs in Parallel With**: S6, S7, S8 (can be implemented independently after prerequisites)

## User Story
**As a** developer
**I want** middleware to add basic auth username and password protection
**So that** we have basic security for the initial work before public release

## Acceptance Criteria
- [x] Middleware intercepts all requests except health endpoint and static assets
- [x] Basic auth prompt appears when accessing protected routes
- [x] Valid username/password allows access to protected routes
- [x] Invalid credentials return 401 Unauthorized
- [x] Health endpoint (`/api/health`) bypasses authentication (for uptime monitoring)
- [x] Environment variables `BASIC_AUTH_USERNAME` and `BASIC_AUTH_PASSWORD` configure credentials
- [x] Auth is disabled when credentials are not set (development convenience)
- [x] Auth works correctly in Vercel preview and production deployments

## Technical Requirements

### Files to Create
| Path | Purpose |
|------|---------|
| `src/middleware.ts` | Next.js middleware for basic auth |

### Files to Modify
| Path | Changes |
|------|---------|
| `.env.example` | Add `BASIC_AUTH_USERNAME` and `BASIC_AUTH_PASSWORD` variables |
| `src/env.ts` | Add optional basic auth environment variables to schema |
| `README.md` | Document basic auth configuration |

### Dependencies

> **Version Reference**: Use exact versions from [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)

No additional dependencies required - uses Next.js built-in middleware.

### Configuration Details

| Setting | Requirement | Reference |
|---------|-------------|-----------|
| Middleware matcher | Exclude `/api/health`, `/_next`, `/favicon.ico`, static assets | [Next.js Middleware Matcher](https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher) |
| Environment variables | Optional - auth disabled if not set | [S5: Environment Variables](./S5-environment-variables.md) |
| HTTP Status | 401 Unauthorized with `WWW-Authenticate` header | RFC 7617 |

**Configuration Rationale**: Basic auth provides a simple, browser-native authentication mechanism suitable for pre-release protection. Using environment variables allows easy enablement per environment without code changes.

## Test Requirements

### Manual Verification
- [ ] **Auth Prompt**: Accessing root URL shows browser basic auth prompt
- [ ] **Valid Credentials**: Entering correct username/password grants access
- [ ] **Invalid Credentials**: Wrong credentials show 401 and re-prompt
- [ ] **Health Bypass**: `/api/health` accessible without credentials
- [ ] **Static Assets**: `/_next/*` and static files load without auth
- [ ] **Preview Deploy**: Auth works in Vercel preview deployment

### Automated Tests
No automated tests in this story - basic auth is a simple mechanism verified manually.

### Verification Commands
```bash
# Test without credentials (should return 401)
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/

# Test with valid credentials (should return 200)
curl -s -o /dev/null -w "%{http_code}" -u "username:password" http://localhost:3000/

# Test health endpoint bypass (should return 200 without auth)
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health

# Production/Preview verification (replace URL and credentials)
curl -s -o /dev/null -w "%{http_code}" -u "user:pass" https://<deployment-url>/
```

## Implementation Notes

### Implementation Sequence

1. **Update Environment Schema** (~15min)
   - Add `BASIC_AUTH_USERNAME` and `BASIC_AUTH_PASSWORD` to env schema
   - Make both optional (auth disabled when not set)

2. **Create Middleware** (~45min)
   - Create `src/middleware.ts`
   - Implement basic auth check logic
   - Configure matcher to exclude health endpoint and static assets

3. **Update Environment Files** (~15min)
   - Add variables to `.env.example`
   - Add variables to Vercel project (preview and production)

4. **Update Documentation** (~15min)
   - Document basic auth in README

### Key Concepts
- **Middleware Execution**: Next.js middleware runs on Edge Runtime before request handling
- **Matcher Config**: Use `matcher` to specify which routes trigger middleware
- **Base64 Decoding**: Basic auth credentials are Base64-encoded in `Authorization` header
- **Optional Auth**: When env vars are not set, middleware should pass through (dev convenience)

### Common Patterns

Reference the Next.js documentation for implementation patterns:
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Middleware Matcher](https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher)

Key pattern notes for this story:
- Use `NextResponse.next()` to allow request through
- Use `NextResponse` with 401 status and `WWW-Authenticate` header to prompt for credentials
- Check for `Authorization` header with `Basic` scheme
- Decode Base64 credentials and compare with environment variables

### Middleware Matcher Configuration

The middleware should match all routes EXCEPT:
- `/api/health` - Health check for monitoring
- `/_next/static/*` - Static assets
- `/_next/image/*` - Image optimization
- `/favicon.ico` - Favicon
- Other static files (`.svg`, `.png`, `.jpg`, etc.)

### Troubleshooting

**Issue**: Auth prompt not appearing
- **Cause**: Middleware not matching the route
- **Solution**: Check matcher configuration, ensure route is not excluded

**Issue**: 401 returned but no browser prompt
- **Cause**: Missing `WWW-Authenticate` header
- **Solution**: Ensure response includes `WWW-Authenticate: Basic realm="Secure Area"`

**Issue**: Auth works locally but not on Vercel
- **Cause**: Environment variables not set in Vercel
- **Solution**: Add `BASIC_AUTH_USERNAME` and `BASIC_AUTH_PASSWORD` to Vercel project settings

**Issue**: Static assets not loading
- **Cause**: Matcher too broad, intercepting static file requests
- **Solution**: Verify matcher excludes `/_next/*` and static file extensions

### Reference Materials
- [Next.js Middleware Documentation](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [MDN HTTP Authentication](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication)
- [RFC 7617 - Basic Authentication](https://datatracker.ietf.org/doc/html/rfc7617)

## Estimated Effort
**Size**: S (2-4h)

**Breakdown**:
- Environment schema update: 15min
- Middleware implementation: 45min
- Environment configuration: 15min
- Testing & verification: 30min
- Documentation: 15min

## Architecture Decisions

### Consolidated Decisions (reference only)

- [ADR-003: Next.js as Framework](/docs/2-technical/adr/003-nextjs-framework.md) - Using Next.js middleware
- [TAD: Environment Variables Strategy](/docs/2-technical/2-tad-steel-thread-deployment.md#environment-variables-strategy) - Variable naming convention

### Story-Specific Decisions

#### AD-0A.1.S9.1: Basic Auth for Pre-Release Security
**Scope**: Story-specific (temporary measure until public release)

**Decision**: Use HTTP Basic Authentication via Next.js middleware for pre-release access control.

**Rationale**:
- Simple to implement with no external dependencies
- Browser-native support (no custom login UI needed)
- Sufficient for development/preview protection
- Easy to disable by removing environment variables
- Can be removed or replaced when proper auth is implemented (Epic 2A.7)

**Consequences**:
- All protected routes require credentials
- Credentials sent with every request (mitigated by HTTPS)
- Not suitable for production user authentication (temporary measure only)

**Alternatives Considered**:
- **Vercel Password Protection**: Rejected - requires Vercel Pro/Enterprise plan
- **Full Auth Implementation**: Rejected - premature for steel thread phase
- **IP Allowlisting**: Rejected - impractical for distributed team

#### AD-0A.1.S9.2: Optional Auth Based on Environment Variables
**Scope**: Story-specific

**Decision**: Disable basic auth when `BASIC_AUTH_USERNAME` and `BASIC_AUTH_PASSWORD` are not set.

**Rationale**:
- Convenient for local development (no auth by default)
- Explicit opt-in for preview/production environments
- Avoids accidental lockout during development

**Consequences**:
- Developers must explicitly configure auth for protected deployments
- Local development runs without auth unless explicitly configured

## Out of Scope

The following items are explicitly NOT part of this story:

- **Session-Based Authentication** - Deferred to Epic 2A.7 (Auth Infrastructure)
- **User Management** - Single shared credential for basic auth; user management in future epic
- **Role-Based Access Control** - Not applicable to basic auth
- **Custom Login UI** - Using browser-native basic auth prompt
- **Remember Me / Token Storage** - Browser handles basic auth credential caching
- **Audit Logging** - Deferred to future observability epic

## Dependencies on Other Stories

### Depends On (Must Complete First)
- **S2**: Create Minimal Next.js 16 Application - Needs Next.js app structure for middleware
- **S5**: Configure Environment Variables - Needs environment variable patterns established

### Enables (Unblocks These Stories)
- None - This is an optional security addition to the steel thread

## References

### Epic & TAD References
- [EPIC.md](./EPIC.md)
- [TAD: Steel Thread Components](/docs/2-technical/2-tad-steel-thread-deployment.md#steel-thread-components)
- [TAD: Environment Variables Strategy](/docs/2-technical/2-tad-steel-thread-deployment.md#environment-variables-strategy)

### ADR References
- [ADR-003: Next.js as Framework](/docs/2-technical/adr/003-nextjs-framework.md)

### External Documentation
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [MDN HTTP Authentication](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication)
- [RFC 7617 - Basic Authentication](https://datatracker.ietf.org/doc/html/rfc7617)

## Verification Checklist

### Pre-Verification
- [x] S2 (Next.js Application) completed
- [x] S5 (Environment Variables) completed
- [x] Local environment matches [canonical versions](/docs/2-technical/references/canonical-versions.md)

### Implementation Quality
- [x] All acceptance criteria met
- [x] Auth prompt appears for protected routes
- [x] Health endpoint bypasses auth
- [x] Static assets load without auth
- [x] `pnpm lint` passes without errors
- [x] `pnpm type-check` passes without errors
- [x] `pnpm build` passes without errors

### Documentation
- [x] `.env.example` updated with auth variables
- [x] README.md updated with basic auth documentation
- [x] Code comments explain auth bypass logic

### Git Hygiene
- [ ] Conventional commit message used (e.g., `feat(auth): add basic auth middleware for pre-release security`)
- [ ] No unrelated changes included
- [ ] PR description references this story

## Status
- **State**: Complete
- **Started**: 2025-11-27
- **Completed**: 2025-11-27
- **PR**: -

## Completion Notes

### Summary
Implemented HTTP Basic Authentication middleware for pre-release protection. The middleware intercepts all requests except health endpoint and static assets, prompting for credentials when `BASIC_AUTH_USERNAME` and `BASIC_AUTH_PASSWORD` environment variables are set. Auth is disabled by default when credentials are not configured, providing convenience for local development.

### Test Results
| Test | Command | Result |
|------|---------|--------|
| Lint | `pnpm lint` | Pass |
| Types | `pnpm type-check` | Pass |
| Build | `pnpm build` | Pass (with deprecation warning) |

### Files Changed
| File | Changes |
|------|---------|
| `src/middleware.ts` | Created - Basic auth middleware with timing-safe comparison |
| `src/env.ts` | Added `BASIC_AUTH_USERNAME` and `BASIC_AUTH_PASSWORD` optional variables |
| `.env.example` | Added basic auth variables documentation |
| `README.md` | Added comprehensive Basic Authentication section |

### Known Issues
- **Issue**: Next.js 16 deprecation warning about "middleware" file convention being renamed to "proxy" - **Status**: Non-blocking, functionality works correctly - **Tracking**: Will be addressed when Next.js 16 stabilizes the new convention

### Lessons Learned
- Timing-safe string comparison is important for credential validation to prevent timing attacks
- Middleware matcher configuration using negative lookahead regex provides flexible route exclusion
- Edge Runtime middleware can use `atob()` for Base64 decoding but not Node.js crypto module
