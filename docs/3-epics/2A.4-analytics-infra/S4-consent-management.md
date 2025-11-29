# Story 2A.4.S4: Implement Consent Management System

> **To implement this story:** Read the Technical Requirements, create/modify the specified files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context

- **Epic**: [Analytics Infrastructure](./EPIC.md)
- **Depends On**: [S2: Core Event Tracking](./S2-core-event-tracking.md)
- **Blocks**: [S5: Provider Integration](./S5-provider-integration.md), [S7: Feature Flags](./S7-feature-flags.md)
- **Runs in Parallel With**: None

## User Story

**As a** platform operator
**I want** a privacy-compliant consent management system that blocks analytics events until user consent is obtained
**So that** we comply with GDPR/CCPA regulations and respect user privacy preferences

## Acceptance Criteria

- [ ] Three-tier consent system implemented: essential (always granted), analytics (PostHog, Vercel Analytics), marketing (GA4)
- [ ] Events are queued when consent is pending and flushed/cleared based on user consent decision
- [ ] `checkConsent(consentType)` function validates consent before dispatching events
- [ ] `grantConsent(preferences)` function updates consent state and flushes queued events for granted types
- [ ] `revokeConsent(consentType)` function removes consent and prevents future tracking
- [ ] Consent preferences persisted in browser storage (cookies or localStorage)
- [ ] All consent decisions include timestamp, consent version, and user/session context
- [ ] Server-side and client-side consent checking both supported
- [ ] TypeScript types enforce valid consent types (essential, analytics, marketing)
- [ ] Unit tests verify consent state management and event queue integration

## Technical Requirements

### Files to Create

| Path | Purpose |
|------|---------|
| `packages/analytics/src/consent.ts` | Consent management implementation |
| `packages/analytics/src/consent-storage.ts` | Browser storage utilities for consent preferences |
| `packages/analytics/__tests__/consent.test.ts` | Unit tests for consent logic |
| `packages/analytics/__tests__/consent-storage.test.ts` | Unit tests for storage utilities |

### Files to Modify

| Path | Changes |
|------|---------|
| `packages/analytics/src/index.ts` | Export `checkConsent`, `grantConsent`, `revokeConsent`, `getConsentPreferences` functions |
| `packages/analytics/src/types.ts` | Add `ConsentType`, `ConsentPreferences`, `ConsentMetadata` types |
| `packages/analytics/src/tracking.ts` | Integrate consent checking before dispatching events (preparation for S5) |

### Dependencies

> **Version Reference**: Use exact versions from [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)

**No new dependencies required for this story.** Consent preferences will be stored using native browser APIs (cookies via `document.cookie` or localStorage).

### Configuration Details

> **Note**: For complete configuration file templates, reference the TAD.
> This section describes configuration REQUIREMENTS, not full file contents.

| Setting | Requirement | TAD Reference |
|---------|-------------|---------------|
| Consent types | Three tiers: essential (always true), analytics (PostHog/Vercel), marketing (GA4) | [TAD: Security Architecture](/docs/2-technical/2-tad-security-architecture.md#consent-management-system) |
| Consent storage | Browser-based (cookies or localStorage); server-side reading via cookie headers | [TAD: Security Architecture](/docs/2-technical/2-tad-security-architecture.md#consent-management-system) |
| Consent version tracking | Include consent version string (e.g., "1.0") to track policy changes | [TAD: Security Architecture](/docs/2-technical/2-tad-security-architecture.md#consent-management-system) |
| Event queue integration | Call `flushQueue()` for granted consent types; call `clearQueue()` for denied types | [TAD: Analytics & Observability](/docs/2-technical/2-tad.md#analytics--observability) |
| Consent metadata | Capture timestamp, user agent, and session ID with each consent decision | [TAD: Security Architecture](/docs/2-technical/2-tad-security-architecture.md#consent-management-system) |

**Configuration Rationale**: The three-tier consent model aligns with GDPR/CCPA requirements by separating essential functionality (always required) from analytics tracking (performance monitoring) and marketing attribution (advertising). Browser storage enables consent preferences to persist across sessions without requiring authentication. Consent version tracking ensures users can be re-prompted when privacy policies change. Integration with the event queue (S2) enables privacy-first analytics where events are only dispatched after explicit consent.

For complete consent management patterns, see: [TAD: Security Architecture - Consent Management System](/docs/2-technical/2-tad-security-architecture.md#consent-management-system)

## Test Requirements

### Manual Verification

- [ ] **Consent State Persistence**: Set consent preferences, refresh page, and verify preferences are retained
- [ ] **Event Queue Integration**: Track events before consent granted, grant consent, and verify events are flushed to queue
- [ ] **Consent Revocation**: Revoke consent and verify subsequent events are not queued

### Automated Tests

- [ ] Unit: `consent.test.ts` - Verify consent defaults (essential: true, analytics: false, marketing: false)
- [ ] Unit: `consent.test.ts` - Verify `grantConsent()` updates consent state correctly
- [ ] Unit: `consent.test.ts` - Verify `revokeConsent()` removes consent for specified type
- [ ] Unit: `consent.test.ts` - Verify `checkConsent()` returns correct boolean for each consent type
- [ ] Unit: `consent.test.ts` - Verify granting analytics consent calls `flushQueue()` for queued events
- [ ] Unit: `consent.test.ts` - Verify denying consent calls `clearQueue()` to discard events
- [ ] Unit: `consent-storage.test.ts` - Verify consent preferences are correctly serialized/deserialized
- [ ] Unit: `consent-storage.test.ts` - Verify storage handles missing/malformed consent data gracefully

### Integration Tests

- [ ] Verify consent state synchronized between storage and in-memory state on page load
- [ ] Verify server-side consent checking (reading from cookie headers) matches client-side state
- [ ] Verify consent metadata (timestamp, version, user agent) is correctly captured

### Verification Commands

```bash
# Install dependencies and build
pnpm install
pnpm --filter @repo/analytics build

# Run unit tests
pnpm --filter @repo/analytics test

# Run tests with coverage
pnpm --filter @repo/analytics test:coverage

# Type checking
pnpm --filter @repo/analytics type-check

# Verify exports are accessible
node --input-type=module -e "import('@repo/analytics').then(m => console.log(m.checkConsent, m.grantConsent))"
```

## Implementation Notes

### Implementation Sequence

1. **Define Consent Types and Interfaces**
   - Add `ConsentType` enum with three values: `essential`, `analytics`, `marketing`
   - Add `ConsentPreferences` interface mapping consent types to boolean values
   - Add `ConsentMetadata` interface with `timestamp`, `consentVersion`, `userAgent`, `sessionId`
   - Default state: `{ essential: true, analytics: false, marketing: false }`

2. **Implement Consent Storage Utilities**
   - Create `saveConsentPreferences(preferences)` function to persist to browser storage
   - Create `loadConsentPreferences()` function to read from browser storage
   - Create `clearConsentPreferences()` function to remove stored consent
   - Handle edge cases: missing storage, malformed data, storage quota exceeded
   - Use cookies for server-side access or localStorage for client-only (decision in AD section)

3. **Implement Consent State Management**
   - Create in-memory consent state singleton (similar to event queue pattern)
   - Implement `checkConsent(consentType)` to query current consent state
   - Implement `getConsentPreferences()` to retrieve full consent object
   - Load consent from storage on module initialization

4. **Implement Consent Granting**
   - Create `grantConsent(preferences)` function accepting partial or full `ConsentPreferences`
   - Update in-memory state with new preferences
   - Save to browser storage via `saveConsentPreferences()`
   - Capture metadata: timestamp, consent version, user agent
   - Integrate with event queue: call `flushQueue()` for newly granted consent types

5. **Implement Consent Revocation**
   - Create `revokeConsent(consentType)` function to remove consent for specific type
   - Update in-memory state (set consent type to `false`)
   - Save updated preferences to storage
   - Prevent future event dispatch for revoked consent types

6. **Integrate with Event Tracking**
   - Modify `trackEvent()` (from S2) to check consent before queuing events (preparation for S5)
   - Add consent type parameter to events (will be used by provider dispatch in S5)
   - Document that event dispatch based on consent happens in S5

7. **Write Unit Tests**
   - Test consent state initialization with defaults
   - Test granting/revoking consent for each type
   - Test storage persistence and retrieval
   - Test edge cases: storage unavailable, malformed data
   - Test event queue integration (flush on grant, clear on deny)
   - Achieve >80% code coverage

### Key Concepts

- **Three-Tier Consent Model**: Essential (always granted for core functionality), Analytics (performance monitoring), Marketing (advertising attribution)
- **Privacy-First Default**: Analytics and marketing consent default to `false`; users must explicitly opt-in
- **Consent Versioning**: Track privacy policy version to re-prompt users when policies change
- **Consent Metadata**: Capture timestamp, user agent, session ID for audit trails (GDPR compliance)
- **Event Queue Integration**: Queued events are flushed (analytics) or cleared (no consent) based on user choice
- **Browser Storage**: Persist consent preferences across sessions without requiring authentication

### Common Patterns

> **Note**: For implementation code examples, reference the TAD.
> Stories describe WHAT patterns to use, not HOW to implement them.

Reference the TAD for implementation patterns:

- [TAD: Security Architecture - Consent Management System](/docs/2-technical/2-tad-security-architecture.md#consent-management-system)
- [TAD: Analytics & Observability](/docs/2-technical/2-tad.md#analytics--observability)

Key pattern notes for this story:

- Use singleton pattern for consent state to ensure consistency across imports
- Follow fire-and-forget pattern: consent functions return void, errors logged internally
- Use type guards for consent type validation (`consentType === 'analytics'`)
- Implement defensive storage access with try-catch (storage may be blocked by privacy settings)
- Store consent as JSON string in localStorage/cookies for easy serialization

### Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| Consent preferences not persisting | Browser storage blocked by privacy settings | Gracefully degrade; use in-memory state with warning logged |
| Server-side consent check failing | Cookie not sent in request headers | Verify cookie attributes (SameSite, Secure, Path) |
| Consent state out of sync | Multiple tabs updating storage simultaneously | Use storage events to synchronize state across tabs |
| TypeScript error on consent type | Invalid consent type string passed | Use `ConsentType` enum for type safety |
| Events still queued after consent denied | Queue not cleared on consent denial | Ensure `clearQueue()` called in `grantConsent()` when `false` |

### Reference Materials

- [GDPR Cookie Consent Requirements](https://gdpr.eu/cookies/)
- [Google Consent Mode v2](https://developers.google.com/tag-platform/security/guides/consent)
- [MDN: Document.cookie](https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie)
- [MDN: Window.localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)

## Estimated Effort

**Size**: M (4-8h)

**Breakdown**:

- Type definitions and consent state management: 1.5h
- Storage utilities (save/load/clear): 1h
- Consent granting and revocation logic: 1.5h
- Event queue integration: 1h
- Unit tests (8 test cases): 2h
- Documentation and verification: 0.5h

## Architecture Decisions

**Consolidated Decisions** (documented in TAD/ADRs):

- [TAD: Security Architecture - Consent Management System](/docs/2-technical/2-tad-security-architecture.md#consent-management-system) - Overall consent architecture and GDPR/CCPA compliance strategy
- [TAD: Analytics & Observability](/docs/2-technical/2-tad.md#analytics--observability) - Privacy-first analytics approach with consent integration

### Story-Specific Decisions

#### AD-2A.4.S4.1: Use localStorage for Consent Storage (Not Cookies)

**Scope**: Story-specific (does not affect other stories)

**Decision**: Store consent preferences in localStorage instead of cookies for MVP

**Rationale**:
- Simpler implementation: no cookie parsing, domain/path/expiry configuration
- No GDPR cookie consent paradox: consent banner doesn't set tracking cookies itself
- localStorage has higher storage quota (5-10MB vs 4KB for cookies)
- Server-side consent checking can be deferred to S5 (provider integration) when needed
- Client-side consent checking sufficient for event queue management

**Consequences**:
- Consent preferences not accessible in server-side middleware (Edge Functions, API routes)
- Cannot implement server-side analytics event blocking in this story
- Consent state limited to browser context (doesn't sync across devices)
- Server-side consent checking will require cookies to be added in future story if needed

**Alternatives Considered**:
- **Cookies**: Rejected for MVP due to added complexity (cookie parsing, attributes, GDPR consent paradox); can be added in S5 if provider integration requires server-side consent
- **Database storage**: Rejected because consent must work for anonymous users before authentication

#### AD-2A.4.S4.2: In-Memory Consent State with Storage Sync

**Scope**: Story-specific (does not affect other stories)

**Decision**: Maintain consent state in memory (singleton) and synchronize with localStorage; do not read from storage on every `checkConsent()` call

**Rationale**:
- Performance: `checkConsent()` called frequently (on every `trackEvent()`); reading from storage is slow
- Consistency: in-memory state is single source of truth for current session
- Storage as backup: persist preferences across sessions, but prioritize in-memory for runtime
- Simpler testing: can mock in-memory state without storage API mocking

**Consequences**:
- State changes in one tab don't automatically sync to other tabs (can be added with storage events later)
- Consent state lost on page refresh unless loaded from storage on initialization
- Slightly more complex initialization logic (load from storage → initialize in-memory state)

**Alternatives Considered**:
- **Read from storage on every check**: Rejected due to performance overhead; localStorage access is synchronous but slow
- **Storage-only (no in-memory state)**: Rejected because frequent storage access degrades performance

#### AD-2A.4.S4.3: Partial Consent Updates Supported

**Scope**: Story-specific (does not affect other stories)

**Decision**: `grantConsent(preferences)` accepts partial `ConsentPreferences` and merges with existing state; does not require all three consent types to be specified

**Rationale**:
- UX flexibility: users can grant/revoke individual consent types without re-specifying all preferences
- Matches consent banner patterns: "Accept Analytics Only" button grants only analytics consent
- Simpler API: `grantConsent({ analytics: true })` more intuitive than requiring full object
- Prevents accidental consent removal: specifying only analytics doesn't reset marketing consent

**Consequences**:
- Merge logic required in `grantConsent()` implementation
- Essential consent cannot be revoked (always `true` in merge logic)
- More test cases needed to verify partial update behavior

**Alternatives Considered**:
- **Require full preferences object**: Rejected because it forces callers to retrieve existing state before making partial updates
- **Separate functions per consent type**: Rejected because three separate functions (`grantAnalytics`, `grantMarketing`, etc.) adds API surface area

## Out of Scope

The following items are explicitly NOT part of this story:

- **Consent banner UI component** - Deferred to Epic 2A.5 (UI Components) or application-level implementation
- **Database persistence of consent records** - Deferred to Epic 2A.2 (Database Infrastructure) integration; browser storage sufficient for MVP
- **Server-side consent checking via cookies** - Deferred to S5 (Provider Integration) if needed for server-side event dispatch
- **Cross-tab consent synchronization** - Not required for MVP; can be added with storage events in future iteration
- **"Do Not Sell" CCPA functionality** - Generic infrastructure only; CCPA-specific implementation deferred to compliance epic
- **Consent version migration** - Privacy policy versioning implemented, but automatic re-prompting on version change deferred to future story
- **Consent analytics events** - Tracking consent grant/revoke actions deferred to Epic 2B.3 (Product Events)
- **IP address and detailed user agent capture** - Deferred to database integration; not required for client-side consent management

## Dependencies on Other Stories

### Depends On (Must Complete First)

- **S2: Core Event Tracking** - Requires event queue (`flushQueue`, `clearQueue`) to integrate consent-based event dispatch

### Enables (Unblocks These Stories)

- **S5: Provider Integration** - Requires `checkConsent()` to validate consent before dispatching events to PostHog/GA4/Vercel
- **S7: Feature Flags** - Consent preferences may control feature flag availability (e.g., disable analytics-dependent features if consent denied)

## References

**Internal**:
- [EPIC.md: Overview](./EPIC.md#overview), [Technical Constraints](./EPIC.md#technical-constraints)
- [TAD: Security Architecture - Consent Management System](/docs/2-technical/2-tad-security-architecture.md#consent-management-system)
- [TAD: Security Architecture - GDPR Compliance](/docs/2-technical/2-tad-security-architecture.md#gdpr-compliance)
- [TAD: Security Architecture - CCPA Compliance](/docs/2-technical/2-tad-security-architecture.md#ccpa-compliance)
- [TAD: Analytics & Observability](/docs/2-technical/2-tad.md#analytics--observability)
- [PRD: Feature M.7 - Basic Analytics & Tracking](/docs/1-product/1-prd.md#feature-m7-basic-analytics--tracking)
- [PRD: Privacy & Compliance](/docs/1-product/1-prd.md#privacy--compliance)
- [Canonical Technology Versions](/docs/2-technical/references/canonical-versions.md)
- [Coding Standards](/docs/2-technical/references/coding-standards.md)

**External**:
- [GDPR Cookie Consent Requirements](https://gdpr.eu/cookies/)
- [Google Consent Mode v2 Documentation](https://developers.google.com/tag-platform/security/guides/consent)
- [MDN: Document.cookie](https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie)
- [MDN: Window.localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- [PostHog: Cookie Consent Integration](https://posthog.com/docs/libraries/js#opt-users-out)

## Verification Checklist

- [ ] **Pre-Verification**: S2 (Core Event Tracking) complete; local environment matches [canonical versions](/docs/2-technical/references/canonical-versions.md)
- [ ] **Implementation**: All acceptance criteria met; [coding standards](/docs/2-technical/references/coding-standards.md) followed
- [ ] **Quality**: No lint errors; types compile; all tests pass; coverage >80%
- [ ] **Documentation**: JSDoc comments on all exported functions; clear usage examples; consent flow documented
- [ ] **Git**: Conventional commit (e.g., `feat(analytics): implement consent management system`); PR references Epic 2A.4.S4

## Status

- **State**: Not Started
- **PR**: -
- **Completed**: -
