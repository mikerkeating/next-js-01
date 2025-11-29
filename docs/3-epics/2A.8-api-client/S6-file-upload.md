# Story 2A.8.S6: File Upload Support

> **To implement this story:** Read the Technical Requirements, create/modify the specified files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context

- **Epic**: [API Client Package](./EPIC.md)
- **Depends On**: [S1: Package Setup and Base Client](./S1-package-setup.md)
- **Blocks**: [S7: Integration Tests and Documentation](./S7-integration-tests.md)
- **Runs in Parallel With**: [S2: Request Interceptors](./S2-request-interceptors.md), [S3: Response Interceptors](./S3-response-interceptors.md), [S4: Retry Logic](./S4-retry-logic.md), [S5: Request Caching](./S5-request-caching.md)

## User Story

**As a** developer building file upload features
**I want** a type-safe API client method that handles file uploads with progress tracking
**So that** I can implement file upload functionality without manually managing FormData, headers, and progress callbacks

## Acceptance Criteria

- [ ] API client provides `uploadFile()` method accepting File objects with optional progress callback
- [ ] Method automatically sets correct `multipart/form-data` Content-Type header
- [ ] Progress callback receives upload progress percentage (0-100) during upload
- [ ] Method supports uploading files up to 100MB (Vercel limit)
- [ ] File upload works in both client components and server components
- [ ] TypeScript provides full type inference for request body and response data
- [ ] Upload failures return structured error responses consistent with other API methods
- [ ] Method integrates with existing request interceptors (auth token injection) and retry logic

## Technical Requirements

### Files to Create

| Path | Purpose |
|------|---------|
| `packages/api-client/src/upload.ts` | File upload implementation with progress tracking |
| `packages/api-client/src/upload.test.ts` | Unit tests for file upload functionality |

### Files to Modify

| Path | Changes |
|------|---------|
| `packages/api-client/src/client.ts` | Add `uploadFile()` method to APIClient class |
| `packages/api-client/src/types.ts` | Add `UploadOptions`, `UploadProgressCallback`, and `UploadResponse` types |
| `packages/api-client/src/index.ts` | Export file upload types and utilities |

### Dependencies

> **Version Reference**: Use exact versions from [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)

**No new dependencies required** - uses native `fetch` API and `FormData` which are built into the browser and Node.js runtime.

### Configuration Details

> **Note**: For complete configuration file templates, reference the TAD.
> This section describes configuration REQUIREMENTS, not full file contents.

| Setting | Requirement | TAD Reference |
|---------|-------------|---------------|
| Content-Type header | Must NOT be set manually for file uploads (browser sets with boundary) | [TAD: API Client](docs/2-technical/2-tad-package-architecture.md#repoapi-client) |
| Request size limit | Support files up to 100MB (Vercel body size limit) | [EPIC: Constraints](./EPIC.md#constraints) |
| Progress callback | Optional callback receiving percentage (0-100) during upload | Story-specific requirement |

**Configuration Rationale**:
- Content-Type must be omitted for multipart uploads so the browser automatically adds the correct boundary parameter
- The 100MB limit aligns with Vercel's payload size constraints
- Progress callbacks enable UX features like upload progress bars

## Test Requirements

### Manual Verification

- [ ] **File Upload UI**: Create test component that uploads a file and displays progress bar - verify progress updates smoothly from 0-100%
- [ ] **Large File Upload**: Upload a 50MB+ file and verify progress tracking works correctly
- [ ] **Server Component Upload**: Verify file upload works in a server action without progress callback

### Automated Tests

- [ ] Unit: `upload.test.ts` - Test FormData construction with File object
- [ ] Unit: `upload.test.ts` - Test progress callback invocation with mocked XMLHttpRequest
- [ ] Unit: `upload.test.ts` - Test error handling for oversized files (>100MB)
- [ ] Unit: `upload.test.ts` - Test auth token injection via request interceptor
- [ ] Unit: `client.test.ts` - Test `uploadFile()` method integration with base client

### Integration Tests

- [ ] Upload file to test endpoint and verify file is received correctly on server
- [ ] Verify upload with progress callback updates progress values incrementally
- [ ] Test upload failure scenarios (network error, 413 payload too large, 401 unauthorized)
- [ ] Verify retry logic triggers on transient upload failures (500, 502, 503 errors)

### Verification Commands

```bash
# Run upload tests
pnpm --filter @repo/api-client test upload

# Run all api-client tests
pnpm --filter @repo/api-client test

# Type check
pnpm --filter @repo/api-client type-check

# Lint
pnpm --filter @repo/api-client lint
```

## Implementation Notes

### Implementation Sequence

1. **Define Upload Types**
   - Create `UploadOptions` interface with file, endpoint, progress callback
   - Create `UploadProgressCallback` type: `(percentage: number) => void`
   - Create `UploadResponse<T>` type extending base `APIResponse<T>`

2. **Implement Upload Utility**
   - Create `packages/api-client/src/upload.ts`
   - Implement `createUploadRequest()` to build FormData from File object
   - Implement progress tracking using fetch with ReadableStream (client-side)
   - Handle Content-Type header omission for multipart boundary

3. **Integrate with APIClient**
   - Add `uploadFile<TResponse>()` method to APIClient class
   - Apply request interceptors (auth token) to upload requests
   - Integrate with retry logic for transient failures
   - Support both client and server environments (progress only client-side)

4. **Write Tests**
   - Mock File objects using `new File(['content'], 'test.txt')`
   - Mock progress events and verify callback invocations
   - Test integration with request interceptors and retry logic

### Key Concepts

- **FormData**: Browser API for encoding multipart/form-data, automatically handles file encoding
- **Progress Tracking**: Uses XMLHttpRequest (client) or ReadableStream (fetch) to track upload progress
- **Boundary Parameter**: Browser automatically adds boundary to Content-Type when FormData is used; manually setting Content-Type breaks this
- **Server vs Client**: Progress tracking only works client-side; server uploads complete synchronously

### Common Patterns

> **Note**: For implementation code examples, reference the TAD.
> Stories describe WHAT patterns to use, not HOW to implement them.

Reference the TAD for implementation patterns:

- [TAD: API Client Base Structure](/docs/2-technical/2-tad-package-architecture.md#repoapi-client)

Key pattern notes for this story:

- Use native `fetch` with FormData for uploads to maintain consistency with base client
- For client-side progress tracking, consider using XMLHttpRequest wrapper or ReadableStream monitoring
- Apply the same error handling patterns as other API methods (structured errors, retry logic)
- File upload methods should accept generic type parameter `<TResponse>` for type-safe response handling

### Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| Upload fails with "Content-Type boundary missing" | Manually setting Content-Type header | Remove Content-Type from headers; let browser set it automatically with FormData |
| Progress callback never fires | Server-side upload or unsupported environment | Progress callbacks only work client-side; conditionally enable based on environment |
| 413 Payload Too Large error | File exceeds 100MB limit | Validate file size before upload and return user-friendly error |
| Auth token not included | Request interceptor not applied | Ensure upload requests go through same interceptor chain as other requests |

### Reference Materials

- [MDN: Using FormData](https://developer.mozilla.org/en-US/docs/Web/API/FormData/Using_FormData_Objects)
- [MDN: File API](https://developer.mozilla.org/en-US/docs/Web/API/File)
- [MDN: Fetch with Progress](https://javascript.info/fetch-progress)
- [Vercel: Request Body Size Limits](https://vercel.com/docs/concepts/limits/overview#request-body-size-limit)

## Estimated Effort

**Size**: S (3h)

**Breakdown**:

- Define upload types and interfaces: 30m
- Implement upload utility with progress tracking: 1.5h
- Integrate with APIClient and interceptors: 30m
- Write unit and integration tests: 30m

## Architecture Decisions

> **Consolidation Rule**: Only document story-specific decisions here.
> Cross-cutting decisions should be added to TAD first, then linked from this section.

### Consolidated Decisions (reference only)

- [TAD: Native Fetch API](/docs/2-technical/2-tad-package-architecture.md#repoapi-client) - Use native fetch for all HTTP operations
- [ADR-001: Monorepo with Turborepo](/docs/2-technical/adr/001-monorepo-turborepo.md) - Package naming and structure
- [EPIC: File Upload Size Limit](./EPIC.md#constraints) - 100MB maximum file size

### Story-Specific Decisions

#### AD-2A.8.S6.1: Progress Tracking Implementation Approach

**Scope**: Story-specific (does not affect other stories)

**Decision**: Use conditional progress tracking - XMLHttpRequest for client-side with progress events, standard fetch for server-side without progress.

**Rationale**:

- Native `fetch` API does not support upload progress in all environments
- XMLHttpRequest provides `upload.onprogress` event for client-side tracking
- Server components don't need progress tracking (uploads complete synchronously)
- Conditional implementation maintains compatibility across all environments

**Consequences**:

- Progress callback only fires in client components (browser environment)
- Server-side uploads work but progress callback is never invoked
- Requires environment detection to choose appropriate implementation
- API signature remains consistent (progress callback is optional parameter)

**Alternatives Considered**:

- **Fetch with ReadableStream**: Modern approach using `response.body.getReader()` - Rejected because upload progress (request body) is harder to track than download progress (response body)
- **Always use XMLHttpRequest**: Full progress support - Rejected because XMLHttpRequest is legacy API and less compatible with server components
- **External library (axios, ky)**: Built-in progress tracking - Rejected because it violates the constraint to use native fetch API only

#### AD-2A.8.S6.2: File Size Validation Location

**Scope**: Story-specific (does not affect other stories)

**Decision**: Validate file size in `uploadFile()` method before making request, return user-friendly error if file exceeds 100MB.

**Rationale**:

- Client-side validation provides immediate feedback without network round-trip
- Prevents wasted bandwidth uploading files that will be rejected
- Aligns with principle of failing fast for better UX
- Error message can guide users to compress or split large files

**Consequences**:

- Users get immediate feedback when file is too large
- Reduces server load by rejecting oversized files before upload starts
- Validation logic must be duplicated on server (can't trust client validation)
- 100MB limit is hardcoded in client (acceptable as it matches Vercel platform limit)

**Alternatives Considered**:

- **Server-side validation only**: Let server reject oversized files - Rejected because poor UX (user waits for upload then gets error)
- **Configurable size limit**: Make limit a parameter - Rejected because 100MB is a hard platform constraint, not a business rule

## Out of Scope

The following items are explicitly NOT part of this story:

- **Chunked Uploads** - Splitting large files into chunks for resumable uploads; deferred to future enhancement if needed
- **Multiple File Upload** - Uploading multiple files in single request; can be implemented by caller using multiple `uploadFile()` calls
- **File Type Validation** - Client-side MIME type checking; should be handled by consuming application based on business rules
- **Image Compression/Resizing** - Pre-processing files before upload; separate concern for specific applications (CDN app)
- **Drag-and-Drop UI** - UI component for file selection; handled by `@repo/ui` package
- **Upload Resume/Pause** - Pausing and resuming interrupted uploads; requires chunked upload implementation (out of scope)

## Dependencies on Other Stories

### Depends On (Must Complete First)

- **S1: Package Setup and Base Client** - Provides APIClient base class, request/response types, and fetch wrapper that upload methods extend

### Enables (Unblocks These Stories)

- **S7: Integration Tests and Documentation** - File upload functionality must be complete for comprehensive integration testing and API documentation

## References

### Epic & TAD References

- [EPIC.md: Overview](./EPIC.md#overview) - API client package objectives
- [EPIC.md: Constraints](./EPIC.md#constraints) - File upload size limit (100MB)
- [TAD: API Client Package](/docs/2-technical/2-tad-package-architecture.md#repoapi-client) - Package structure and public API

### ADR References

- [ADR-001: Monorepo with Turborepo](/docs/2-technical/adr/001-monorepo-turborepo.md) - Package naming conventions

### External Documentation

- [MDN: FormData](https://developer.mozilla.org/en-US/docs/Web/API/FormData)
- [MDN: File API](https://developer.mozilla.org/en-US/docs/Web/API/File)
- [MDN: XMLHttpRequest.upload](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/upload)
- [Vercel: Body Size Limits](https://vercel.com/docs/concepts/limits/overview#request-body-size-limit)

## Verification Checklist

### Pre-Verification

- [ ] S1 (Package Setup and Base Client) completed
- [ ] Local environment matches [canonical versions](/docs/2-technical/references/canonical-versions.md)
- [ ] Required credentials/access available (none required for this story)

### Implementation Quality

- [ ] All acceptance criteria met
- [ ] [Coding standards](/docs/2-technical/references/coding-standards.md) followed
- [ ] No lint errors
- [ ] Types compile successfully
- [ ] Tests written and passing
- [ ] Coverage > 80% for new code

### Documentation

- [ ] Code comments where logic isn't self-evident
- [ ] JSDoc comments for public `uploadFile()` method and upload types
- [ ] README not required (deferred to S7)

### Git Hygiene

- [ ] Conventional commit message used (e.g., "feat(api-client): add file upload support with progress tracking")
- [ ] No unrelated changes included
- [ ] PR description complete

## Status

- **State**: Not Started
- **PR**: -
- **Completed**: -
