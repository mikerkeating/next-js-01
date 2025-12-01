# Story 3A.1.S5: File Upload Utilities

> **To implement this story:** Read the Technical Requirements, create/modify the specified files following TAD patterns, then verify using the Test Requirements and Verification Checklist.

## Context

- **Epic**: [CDN & Asset Management Application](./EPIC.md)
- **Depends On**: [S1: CDN Application Setup](./S1-cdn-app-setup.md)
- **Blocks**: [S7: Integration Tests and Documentation](./S7-integration-tests.md)
- **Runs in Parallel With**: [S2: Image Optimisation Pipeline](./S2-image-optimisation.md), [S3: Image Transformation API](./S3-image-transformation.md), [S4: Cache Headers and Content-Hash URLs](./S4-cache-headers.md), [S6: Cache Invalidation API](./S6-cache-invalidation.md)

## User Story

**As a** content manager
**I want** to upload images and files through a drag-and-drop interface with automatic validation
**So that** I can efficiently add rich media to transformation frameworks without worrying about file size or format issues

## Acceptance Criteria

- [ ] Drag-and-drop file upload interface supports images (JPEG, PNG, GIF, WebP, AVIF), documents (PDF), and other static assets
- [ ] File size validation rejects uploads exceeding 100MB (Vercel limit)
- [ ] File type validation restricts uploads to allowed formats with clear error messages
- [ ] Content-hash URLs are generated for all uploaded files ensuring immutability
- [ ] Upload progress indicator shows percentage complete for large files
- [ ] Multiple file uploads are supported (batch upload up to 10 files concurrently)
- [ ] Uploaded files are immediately available via CDN with appropriate cache headers
- [ ] Failed uploads provide clear error messages and retry capability
- [ ] API endpoint returns file metadata (URL, size, type, dimensions for images)
- [ ] Upload utilities handle edge cases (duplicate filenames, special characters, network failures)

## Technical Requirements

### Files to Create

| Path                                                   | Purpose                                     |
| ------------------------------------------------------ | ------------------------------------------- |
| `apps/cdn/app/api/upload/route.ts`                     | File upload API endpoint                    |
| `apps/cdn/lib/upload/file-validator.ts`                | File type and size validation utilities     |
| `apps/cdn/lib/upload/content-hash.ts`                  | Content-based hash generation for filenames |
| `apps/cdn/lib/upload/upload-handler.ts`                | Upload processing logic                     |
| `apps/cdn/lib/upload/types.ts`                         | TypeScript interfaces for upload operations |
| `apps/cdn/__tests__/api/upload.test.ts`                | API endpoint tests                          |
| `apps/cdn/__tests__/lib/upload/file-validator.test.ts` | File validation tests                       |
| `apps/cdn/__tests__/lib/upload/content-hash.test.ts`   | Content hash generation tests               |

### Files to Modify

| Path                         | Changes                                                    |
| ---------------------------- | ---------------------------------------------------------- |
| `apps/cdn/next.config.ts`    | Configure file upload size limits and allowed MIME types   |
| `apps/cdn/public/.gitignore` | Add upload directory to gitignore (if using local storage) |

### Dependencies

> **Version Reference**: Use exact versions from [canonical-versions.md](/docs/2-technical/references/canonical-versions.md)

**Install commands:**

```bash
# Install zod for file validation schemas
pnpm add zod

# Install file type detection library
pnpm add file-type

# Install hashing utility for content-based filenames
pnpm add hash-wasm
```

### Configuration Details

> **Note**: For complete configuration file templates, reference the TAD.
> This section describes configuration REQUIREMENTS, not full file contents.

| Setting                    | Requirement                                   | TAD Reference                                                              |
| -------------------------- | --------------------------------------------- | -------------------------------------------------------------------------- |
| `api.bodyParser.sizeLimit` | Set to 100MB to match Vercel deployment limit | [TAD: CDN Architecture](/docs/2-technical/2-tad-cdn.md#configuration)      |
| `allowedMimeTypes`         | Restrict to images, PDFs, and allowed formats | [TAD: CDN Architecture](/docs/2-technical/2-tad-cdn.md#asset-optimization) |
| `maxFileSize`              | 100MB (104857600 bytes)                       | [TAD: CDN Architecture](/docs/2-technical/2-tad-cdn.md#configuration)      |
| `contentHashAlgorithm`     | Use SHA-256 for content-based filenames       | [TAD: CDN Architecture](/docs/2-technical/2-tad-cdn.md#caching-strategy)   |
| `uploadDirectory`          | `/public/uploads` (or Vercel Blob Storage)    | [TAD: CDN Architecture](/docs/2-technical/2-tad-cdn.md#asset-optimization) |

**Configuration Rationale**:

- The 100MB limit aligns with Vercel's serverless function and deployment constraints
- Content-hash filenames enable immutable caching (1-year cache TTL) without invalidation concerns
- SHA-256 ensures collision-resistant filenames while maintaining reasonable performance
- MIME type restrictions prevent upload of executable files or potentially malicious content

For complete configuration templates, see: [TAD: CDN Configuration](/docs/2-technical/2-tad-cdn.md#configuration)

## Test Requirements

### Manual Verification

- [ ] **Drag-and-Drop Upload**: Drag an image file onto upload area and verify successful upload with progress indicator
- [ ] **File Size Validation**: Attempt to upload a 101MB file and verify rejection with clear error message
- [ ] **File Type Validation**: Attempt to upload a `.exe` file and verify rejection with appropriate error message
- [ ] **Batch Upload**: Upload 5 images simultaneously and verify all complete successfully
- [ ] **Network Failure**: Simulate network interruption during upload and verify retry mechanism works
- [ ] **Content-Hash URL**: Upload the same image twice and verify both uploads result in the same URL (deduplication)
- [ ] **Image Metadata**: Upload a JPEG and verify API response includes dimensions (width, height)

### Automated Tests

- [ ] Unit: `file-validator.test.ts` - Validate file size limits (100MB max)
- [ ] Unit: `file-validator.test.ts` - Validate allowed MIME types (JPEG, PNG, GIF, WebP, AVIF, PDF)
- [ ] Unit: `file-validator.test.ts` - Reject disallowed file types (executables, scripts)
- [ ] Unit: `content-hash.test.ts` - Generate consistent SHA-256 hashes for identical file content
- [ ] Unit: `content-hash.test.ts` - Generate different hashes for different file content
- [ ] Unit: `content-hash.test.ts` - Preserve file extension in content-hash URL
- [ ] Unit: `upload.test.ts` - Return 400 for files exceeding 100MB
- [ ] Unit: `upload.test.ts` - Return 400 for unsupported file types
- [ ] Unit: `upload.test.ts` - Return 201 with file metadata for successful uploads
- [ ] Unit: `upload.test.ts` - Handle duplicate filenames gracefully

### Integration Tests

- [ ] Upload workflow - Verify end-to-end file upload from API request to CDN availability
- [ ] Cache headers - Verify uploaded files are served with `Cache-Control: public, max-age=31536000, immutable`
- [ ] Image optimization integration - Verify uploaded images trigger Next.js Image Optimization
- [ ] Content deduplication - Verify uploading identical files results in single storage instance

### Verification Commands

```bash
# Run unit tests
pnpm --filter @repo/cdn test apps/cdn/__tests__/lib/upload

# Run API endpoint tests
pnpm --filter @repo/cdn test apps/cdn/__tests__/api/upload.test.ts

# Test file upload via curl (after implementation)
curl -X POST http://localhost:3000/api/upload \
  -F "file=@test-image.jpg" \
  -H "Content-Type: multipart/form-data"

# Verify content-hash URL generation
curl -X POST http://localhost:3000/api/upload \
  -F "file=@test-image.jpg" | jq '.url'
# Expected: /uploads/[hash]-test-image.jpg

# Verify cache headers on uploaded file
curl -I http://localhost:3000/uploads/[hash]-test-image.jpg
# Expected: Cache-Control: public, max-age=31536000, immutable

# Verify file size limit
dd if=/dev/zero of=large-file.bin bs=1M count=101
curl -X POST http://localhost:3000/api/upload \
  -F "file=@large-file.bin"
# Expected: 400 Bad Request with error message

# Lint and type-check
pnpm --filter @repo/cdn lint
pnpm --filter @repo/cdn type-check
```

## Implementation Notes

### Implementation Sequence

1. **Create File Validation Utilities**
   - Implement `file-validator.ts` with size and type validation
   - Define allowed MIME types constant
   - Create Zod schema for upload validation
   - Add unit tests for validation logic

2. **Create Content-Hash Generator**
   - Implement `content-hash.ts` using SHA-256
   - Generate 16-character hash prefix for filenames
   - Preserve original file extension
   - Add unit tests for hash generation

3. **Create Upload Handler**
   - Implement `upload-handler.ts` to process multipart form data
   - Extract file from request
   - Validate file (size, type)
   - Generate content-hash URL
   - Save file to storage (public directory or Vercel Blob)
   - Return file metadata

4. **Create API Endpoint**
   - Implement `app/api/upload/route.ts` POST handler
   - Parse multipart/form-data request
   - Call upload handler
   - Return JSON response with file URL and metadata
   - Handle errors with appropriate HTTP status codes

5. **Configure Next.js**
   - Set `api.bodyParser.sizeLimit` to 100MB in `next.config.ts`
   - Configure allowed file types
   - Add upload directory to `.gitignore`

6. **Add Tests**
   - Unit tests for validation utilities
   - Unit tests for content-hash generation
   - API endpoint tests for success and error cases
   - Integration tests for complete upload workflow

### Key Concepts

- **Content-Hash URLs**: Generate filenames based on file content (SHA-256 hash) to enable immutable caching and automatic deduplication
- **Multipart Form Data**: Standard encoding for file uploads via HTTP, supported by Next.js API routes with built-in parsing
- **File Type Detection**: Use `file-type` library to verify MIME type based on file magic numbers (not just extension)
- **Streaming Uploads**: For large files, use streaming to avoid loading entire file into memory
- **Error Handling**: Return appropriate HTTP status codes (400 for validation errors, 413 for file too large, 500 for server errors)

### Common Patterns

> **Note**: For implementation code examples, reference the TAD.
> Stories describe WHAT patterns to use, not HOW to implement them.

Reference the TAD for implementation patterns:

- [TAD: File Upload Implementation](/docs/2-technical/2-tad-cdn.md#asset-optimization)
- [TAD: Content-Hash URL Generation](/docs/2-technical/2-tad-cdn.md#caching-strategy)
- [TAD: File Validation Patterns](/docs/2-technical/2-tad-cdn.md#security-considerations)

Key pattern notes for this story:

- Use Zod schemas for file validation to ensure type safety and consistent error messages
- Generate content-hash URLs synchronously (SHA-256 is fast enough for files up to 100MB)
- Store uploaded files in `/public/uploads` for MVP; migrate to Vercel Blob Storage for production
- Return standardized JSON response format: `{ success: boolean, url?: string, error?: string, metadata?: object }`

### Troubleshooting

| Issue                                   | Cause                                   | Solution                                                   |
| --------------------------------------- | --------------------------------------- | ---------------------------------------------------------- |
| Upload fails with "Payload Too Large"   | File exceeds 100MB limit                | Verify file size before upload; display size limit in UI   |
| Upload succeeds but file not accessible | Incorrect public directory path         | Verify upload directory is in `/public` for static serving |
| Content-hash collision                  | SHA-256 hash truncation too short       | Use at least 16 characters of hash to minimize collisions  |
| Upload times out                        | Large file processed synchronously      | Implement streaming upload for files >10MB                 |
| File type validation bypassed           | Validation based only on file extension | Use `file-type` library to check magic numbers             |

### Reference Materials

- [Next.js API Routes - File Upload](https://nextjs.org/docs/api-routes/request-helpers)
- [Vercel Blob Storage Documentation](https://vercel.com/docs/storage/vercel-blob)
- [file-type Library](https://github.com/sindresorhus/file-type)
- [hash-wasm Documentation](https://github.com/Daninet/hash-wasm)
- [MIME Types Reference](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types)

## Estimated Effort

**Size**: M (6h)

**Breakdown**:

- File validation utilities: 1h
- Content-hash generator: 1h
- Upload handler implementation: 2h
- API endpoint and error handling: 1h
- Testing and troubleshooting: 1h

## Architecture Decisions

> **Consolidation Rule**: Only document story-specific decisions here.
> Cross-cutting decisions should be added to TAD first, then linked from this section.

### Consolidated Decisions (reference only)

Link to decisions documented elsewhere that apply to this story:

- [TAD: Content-Hash URL Strategy](/docs/2-technical/2-tad-cdn.md#caching-strategy) - Using SHA-256 for immutable asset URLs
- [TAD: File Size Limits](/docs/2-technical/2-tad-cdn.md#configuration) - 100MB max file size aligns with Vercel constraints
- [ADR-004: Vercel as Hosting Platform](/docs/2-technical/adr/004-vercel-hosting.md) - Platform constraints affect upload implementation

### Story-Specific Decisions

#### AD-3A.1.S5.1: SHA-256 Hash Truncation Length

**Scope**: Story-specific (affects only content-hash URL generation)

**Decision**: Use first 16 characters of SHA-256 hash for content-hash filenames

**Rationale**:

- 16 hex characters provides 2^64 possible values, making collision probability negligible for expected file volume
- Shorter URLs are more user-friendly and easier to debug
- 16 characters balances collision resistance with URL readability

**Consequences**:

- Extremely low collision probability (< 1 in 10^19 for typical usage)
- Compact URLs suitable for sharing and logging
- Potential need to increase length if hash collisions occur (very unlikely)

**Alternatives Considered**:

- **Full 64-character SHA-256**: Rejected due to unnecessarily long URLs with no practical benefit
- **8-character truncation**: Rejected due to higher collision probability (2^32 values)
- **UUID v4**: Rejected because UUIDs don't enable content-based deduplication

#### AD-3A.1.S5.2: Local File Storage for MVP

**Scope**: Story-specific (affects only initial implementation, not long-term architecture)

**Decision**: Store uploaded files in `/public/uploads` directory for MVP, with path to migrate to Vercel Blob Storage

**Rationale**:

- Faster MVP implementation without external storage integration
- Next.js serves `/public` directory as static files automatically
- Suitable for development and low-volume testing
- Clear migration path to Vercel Blob Storage documented

**Consequences**:

- Files stored in deployment bundle (limited by Vercel 250MB deployment size)
- Not suitable for production at scale
- Requires migration to Vercel Blob Storage before production launch
- Simplifies local development (no external storage credentials needed)

**Alternatives Considered**:

- **Vercel Blob Storage from start**: Rejected to reduce MVP complexity and external dependencies
- **Amazon S3**: Rejected to maintain Vercel-native stack alignment

## Out of Scope

The following items are explicitly NOT part of this story:

- **UI Component for File Upload** - Deferred to Epic 3B.6 (Authenticated Tools UI)
- **Image Cropping/Editing** - Not required for MVP; users can edit images before upload
- **Video Transcoding** - Deferred to post-MVP; CDN delivers videos as-is
- **Asset Management Database** - Asset metadata stored in product database (Epic 2B.1)
- **Organization-Scoped Uploads** - Multi-tenant isolation implemented in product layer (Epic 3B.6)
- **Resumable Uploads** - Not required for files under 100MB; add if needed post-MVP
- **Thumbnail Generation** - Handled by Next.js Image Optimization (Story S2)
- **Virus Scanning** - Security feature deferred to post-MVP

## Dependencies on Other Stories

### Depends On (Must Complete First)

- **S1: CDN Application Setup** - Provides base Next.js application structure, routing, and configuration needed for upload API

### Enables (Unblocks These Stories)

- **S7: Integration Tests and Documentation** - Upload utilities are tested as part of end-to-end CDN workflow

## References

### Epic & TAD References

- [EPIC.md: CDN & Asset Management Application](./EPIC.md)
- [TAD: CDN Architecture](/docs/2-technical/2-tad.md#cdn-architecture)
- [TAD: CDN Architecture (Detailed)](/docs/2-technical/2-tad-cdn.md)
- [TAD: Asset Optimization](/docs/2-technical/2-tad-cdn.md#asset-optimization)
- [TAD: Caching Strategy](/docs/2-technical/2-tad-cdn.md#caching-strategy)

### ADR References

- [ADR-004: Vercel as Hosting Platform](/docs/2-technical/adr/004-vercel-hosting.md)

### External Documentation

- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Vercel File Upload Limits](https://vercel.com/docs/functions/serverless-functions/runtimes#request-body-size)
- [MDN: File API](https://developer.mozilla.org/en-US/docs/Web/API/File)
- [MDN: FormData](https://developer.mozilla.org/en-US/docs/Web/API/FormData)

## Verification Checklist

### Pre-Verification

- [ ] S1 (CDN Application Setup) completed
- [ ] Local environment matches [canonical versions](/docs/2-technical/references/canonical-versions.md)
- [ ] Next.js development server running (`pnpm --filter @repo/cdn dev`)

### Implementation Quality

- [ ] All acceptance criteria met
- [ ] [Coding standards](/docs/2-technical/references/coding-standards.md) followed
- [ ] No lint errors (`pnpm --filter @repo/cdn lint`)
- [ ] Types compile successfully (`pnpm --filter @repo/cdn type-check`)
- [ ] All tests written and passing
- [ ] Coverage > 80% for upload utilities

### Documentation

- [ ] Code comments explain validation logic and hash generation
- [ ] README updated with upload API usage examples (if applicable)
- [ ] Architecture decisions documented (SHA-256 truncation length, local storage)
- [ ] Error messages are clear and actionable for users

### Git Hygiene

- [ ] Conventional commit message used (e.g., `feat(cdn): add file upload utilities`)
- [ ] No unrelated changes included
- [ ] PR description references Epic 3A.1 and Story S5

## Status

- **State**: Not Started
- **PR**: -
- **Completed**: -
