# Story 2A.6.S3: Security Headers Middleware

> **To implement this story:** Read the Technical Requirements, create/modify the specified files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context

- **Epic**: [Middleware Package (Generic)](./EPIC.md)
- **Depends On**: [S1](./S1-package-setup.md)
- **Blocks**: [S7](./S7-integration-tests.md)
- **Runs in Parallel With**: [S2](./S2-logging-middleware.md), [S4](./S4-rate-limiting.md), [S5](./S5-cors-middleware.md), [S6](./S6-route-matchers.md)

## User Story

**As a** platform developer
**I want** security headers middleware that sets standard HTTP security headers
**So that** the application is protected against common web vulnerabilities (XSS, clickjacking, MIME sniffing) and meets security best practices

## Acceptance Criteria

- [ ] Security headers middleware sets Content-Security-Policy header with configurable directives
- [ ] Middleware sets Strict-Transport-Security header with HSTS configuration
- [ ] Middleware sets X-Frame-Options header to prevent clickjacking
- [ ] Middleware sets X-Content-Type-Options header to prevent MIME sniffing
- [ ] Middleware sets Referrer-Policy header with privacy-focused configuration
- [ ] Middleware sets Permissions-Policy header to restrict browser features
- [ ] Headers configuration is customizable via options parameter
- [ ] Middleware works within Vercel Edge runtime constraints (no Node.js APIs)
- [ ] Unit tests verify all headers are set correctly with default and custom configurations
- [ ] Exported as `securityHeadersMiddleware` factory function for use in middleware chains

## Technical Requirements

### Files to Create

| Path                                                 | Purpose                         |
| ---------------------------------------------------- | ------------------------------- |
| `packages/middleware/src/security-headers.ts`        | Security headers middleware     |
| `packages/middleware/tests/security-headers.test.ts` | Unit tests for security headers |

### Files to Modify

| Path                               | Changes                                       |
| ---------------------------------- | --------------------------------------------- |
| `packages/middleware/src/index.ts` | Export `securityHeadersMiddleware`            |
| `packages/middleware/README.md`    | Add security headers middleware documentation |

### Dependencies

> **Version Reference**: Use exact versions from [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)

No additional dependencies required beyond those installed in S1 (Next.js types are already available).

### Configuration Details

> **Note**: For complete configuration file templates, reference the TAD.
> This section describes configuration REQUIREMENTS, not full file contents.

| Setting                            | Requirement                                                                                | TAD Reference                                                                                              |
| ---------------------------------- | ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| Content-Security-Policy directives | Configurable with secure defaults (default-src 'self', script-src with specific allowlist) | [TAD: Security Headers Middleware](/docs/2-technical/2-tad-edge-middleware.md#security-headers-middleware) |
| HSTS max-age                       | 31536000 seconds (1 year) with includeSubDomains and preload                               | [TAD: Security Headers Middleware](/docs/2-technical/2-tad-edge-middleware.md#security-headers-middleware) |
| X-Frame-Options                    | DENY (no framing allowed)                                                                  | [TAD: Security Headers Middleware](/docs/2-technical/2-tad-edge-middleware.md#security-headers-middleware) |
| Permissions-Policy                 | Restrict camera, microphone, geolocation by default                                        | [TAD: Security Headers Middleware](/docs/2-technical/2-tad-edge-middleware.md#security-headers-middleware) |

**Configuration Rationale**: Security headers protect against common web vulnerabilities. CSP prevents XSS attacks by restricting resource origins. HSTS enforces HTTPS connections. X-Frame-Options prevents clickjacking. X-Content-Type-Options prevents MIME sniffing attacks. Configurable options allow applications to customize policies based on their specific requirements (e.g., allowing specific third-party scripts).

For complete implementation patterns, see: [TAD: Security Headers Middleware](/docs/2-technical/2-tad-edge-middleware.md#security-headers-middleware)

## Test Requirements

### Manual Verification

- [ ] **Header Presence**: Make request to middleware and verify all security headers are present in response
- [ ] **CSP Configuration**: Verify Content-Security-Policy header contains expected directives

### Automated Tests

- [ ] Unit: `security-headers.test.ts` - All security headers are set with default configuration
- [ ] Unit: `security-headers.test.ts` - CSP header contains all required directives
- [ ] Unit: `security-headers.test.ts` - HSTS header has correct max-age and directives
- [ ] Unit: `security-headers.test.ts` - X-Frame-Options, X-Content-Type-Options, Referrer-Policy are set correctly
- [ ] Unit: `security-headers.test.ts` - Permissions-Policy restricts expected features
- [ ] Unit: `security-headers.test.ts` - Custom CSP directives can be provided via options
- [ ] Unit: `security-headers.test.ts` - Middleware returns NextResponse with headers set (does not short-circuit chain)

### Integration Tests

N/A - Integration testing deferred to S7 (Integration Tests and Documentation) which tests complete middleware chain.

### Verification Commands

```bash
# Run tests
cd packages/middleware
pnpm test security-headers

# Type check
pnpm type-check

# Lint
pnpm lint

# Build and verify exports
pnpm build
node -e "const { securityHeadersMiddleware } = require('./dist/index.js'); console.log(typeof securityHeadersMiddleware)"
```

## Implementation Notes

### Implementation Sequence

1. **Create Security Headers Types**
   - Define `SecurityHeadersOptions` interface for CSP directives and other header configurations
   - Provide sensible defaults that balance security and functionality
   - Support customization of CSP sources for different environments (dev vs prod)

2. **Implement Factory Function**
   - Create `securityHeadersMiddleware` factory function that accepts optional configuration
   - Return MiddlewareFunction that applies security headers to NextResponse
   - Merge custom options with defaults

3. **Content Security Policy Builder**
   - Implement CSP directive builder that formats directives correctly
   - Support common directives: default-src, script-src, style-src, img-src, font-src, connect-src, frame-ancestors
   - Format as semicolon-separated string per CSP specification

4. **Apply Headers**
   - Use `NextResponse.next()` to create response that continues to next middleware
   - Set all security headers on the response object
   - Ensure headers are applied to all responses (not just specific routes)

5. **Testing**
   - Write unit tests for all header values with default configuration
   - Test custom CSP directive merging
   - Verify response returns correctly (does not short-circuit)
   - Achieve ≥80% code coverage

6. **Documentation**
   - Add JSDoc comments explaining each security header's purpose
   - Update README with usage examples and customization options
   - Document security implications of each header

### Key Concepts

- **Content Security Policy (CSP)**: Whitelist of allowed sources for resources to prevent XSS attacks
- **HTTP Strict Transport Security (HSTS)**: Forces browsers to use HTTPS connections
- **X-Frame-Options**: Prevents page from being embedded in iframes (clickjacking protection)
- **X-Content-Type-Options**: Prevents MIME sniffing attacks
- **Permissions-Policy**: Controls which browser features are allowed (camera, geolocation, etc.)
- **Referrer-Policy**: Controls what information is sent in Referer header

### Common Patterns

> **Note**: For implementation code examples, reference the TAD.
> Stories describe WHAT patterns to use, not HOW to implement them.

Reference the TAD for implementation patterns:

- [TAD: Security Headers Middleware](/docs/2-technical/2-tad-edge-middleware.md#security-headers-middleware)
- [OWASP Secure Headers](https://owasp.org/www-project-secure-headers/)

Key pattern notes for this story:

- Use `NextResponse.next()` not `NextResponse.json()` to continue middleware chain with headers applied
- CSP directives must be joined with semicolon and space: `"directive1 value; directive2 value"`
- Allow 'unsafe-inline' and 'unsafe-eval' for script-src in development, but restrict in production
- Use factory pattern to allow configuration: `securityHeadersMiddleware(options)` returns MiddlewareFunction
- Return the NextResponse (not undefined) so headers propagate through the chain

### Troubleshooting

| Issue                                    | Cause                                 | Solution                                                                         |
| ---------------------------------------- | ------------------------------------- | -------------------------------------------------------------------------------- |
| CSP blocks legitimate resources          | Too restrictive default policy        | Customize CSP directives via options to allow specific third-party domains       |
| Headers not appearing in browser         | Middleware not returning NextResponse | Ensure middleware returns `NextResponse.next()` with headers set                 |
| CSP syntax errors                        | Incorrect directive formatting        | Follow CSP spec: directives separated by `;` with space, sources space-separated |
| HSTS not working in development          | HSTS only applies to HTTPS            | Test HSTS behavior in production or with local HTTPS setup                       |
| X-Frame-Options conflicts with embedding | X-Frame-Options set to DENY           | Change to SAMEORIGIN or remove if legitimate embedding is needed                 |

### Reference Materials

- [Content Security Policy (CSP) - MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Strict-Transport-Security - MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security)
- [OWASP Secure Headers Project](https://owasp.org/www-project-secure-headers/)
- [X-Frame-Options - MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options)

## Estimated Effort

**Size**: S (3h)

**Breakdown**:

- Security headers middleware implementation: 1h
- CSP directive builder and configuration: 0.5h
- Unit tests: 1h
- Documentation: 0.5h

## Architecture Decisions

### Consolidated Decisions (reference only)

Link to decisions documented elsewhere that apply to this story:

- [TAD: Security Headers Middleware](/docs/2-technical/2-tad-edge-middleware.md#security-headers-middleware) - Default header values and security configurations
- [TAD: Edge Runtime Constraints](/docs/2-technical/2-tad-edge-middleware.md) - Web APIs only, no Node.js dependencies

### Story-Specific Decisions

#### AD-2A.6.S3.1: CSP Default Policy Strategy

**Scope**: Story-specific (defines default CSP configuration for this middleware only)

**Decision**: Provide a permissive default CSP policy that allows common Next.js patterns (unsafe-eval for dev, Vercel scripts) rather than a strict policy that requires extensive customization.

**Rationale**:

- Next.js development mode requires 'unsafe-eval' for hot module reloading
- Vercel deployments inject scripts from \*.vercel-scripts.com domain
- Starting with a working default reduces friction for initial adoption
- Applications can tighten policy via configuration options as needed
- Balance between security-by-default and developer experience

**Consequences**:

- Default policy may not pass strict CSP validation tools
- Developers must explicitly tighten policy for maximum security
- Reduces initial configuration burden for new projects
- Clear documentation needed to explain security tradeoffs

**Alternatives Considered**:

- **Strict CSP with no unsafe directives** - Rejected because it breaks Next.js development mode and requires extensive per-app customization
- **No default CSP** - Rejected because many developers won't configure CSP at all, leaving apps vulnerable

#### AD-2A.6.S3.2: Factory Function vs Constant

**Scope**: Story-specific (affects API design for this middleware only)

**Decision**: Export `securityHeadersMiddleware` as a factory function that accepts optional configuration, rather than a constant MiddlewareFunction.

**Rationale**:

- Different applications need different CSP policies (e.g., different third-party scripts)
- Factory pattern allows customization while providing sensible defaults
- Consistent with common middleware patterns in Express, Koa, and other frameworks
- Enables environment-specific configurations (dev vs production)

**Consequences**:

- Users must call the function even if using defaults: `securityHeadersMiddleware()`
- Slightly more verbose API compared to constant export
- Enables powerful customization without requiring separate middleware implementations

**Alternatives Considered**:

- **Export constant with fixed headers** - Rejected because CSP requirements vary too much between applications
- **Export multiple preset configurations** - Rejected because factory function is more flexible and requires less maintenance

## Out of Scope

The following items are explicitly NOT part of this story:

- **CSP Report-Only Mode** - Deferred to future enhancement (requires report collection endpoint)
- **CSP Nonce Generation** - Deferred to future enhancement (requires coordination with Next.js script tags)
- **Environment-Specific Header Profiles** - Applications handle this by passing different options based on environment
- **CSP Violation Reporting Endpoint** - Infrastructure for collecting CSP violations deferred
- **Automatic CSP Generation from Build** - Advanced CSP automation deferred to future enhancement
- **Subresource Integrity (SRI)** - SRI for scripts/styles is a build-time concern, not middleware

## Dependencies on Other Stories

### Depends On (Must Complete First)

- **S1**: Package Setup and Middleware Composer - Provides MiddlewareFunction type and middleware composition utilities

### Enables (Unblocks These Stories)

- **S7**: Integration Tests and Documentation - Requires security headers middleware for complete chain testing

## References

- [EPIC.md: Middleware Package Overview](./EPIC.md#overview)
- [TAD: Edge Middleware Architecture](/docs/2-technical/2-tad-edge-middleware.md)
- [TAD: Security Headers Middleware](/docs/2-technical/2-tad-edge-middleware.md#security-headers-middleware)
- [Content Security Policy (CSP)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [OWASP Secure Headers](https://owasp.org/www-project-secure-headers/)

## Verification Checklist

### Pre-Verification

- [ ] S1 (Package Setup and Middleware Composer) completed
- [ ] Local environment matches [canonical versions](/docs/2-technical/references/canonical-versions.md)

### Implementation Quality

- [ ] All acceptance criteria met
- [ ] [Coding standards](/docs/2-technical/references/coding-standards.md) followed
- [ ] No lint errors (`pnpm lint`)
- [ ] Types compile successfully (`pnpm type-check`)
- [ ] Tests written and passing (`pnpm test`)
- [ ] Coverage ≥ 80% for new code

### Documentation

- [ ] JSDoc comments on exported securityHeadersMiddleware function
- [ ] README.md includes security headers usage example and customization options
- [ ] Each security header's purpose documented in JSDoc

### Git Hygiene

- [ ] Conventional commit message used (e.g., `feat(middleware): add security headers middleware`)
- [ ] No unrelated changes included
- [ ] PR description references Epic 2A.6 and Story S3

## Status

- **State**: Not Started
- **PR**: -
- **Completed**: -
