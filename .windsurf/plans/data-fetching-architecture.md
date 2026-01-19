# Data Fetching Architecture Refactor

Restructure the Payload CMS data fetching layer to separate public and authenticated contexts, eliminating unnecessary API key usage for public data while maintaining secure preview functionality.

## Current State Analysis

### Issues Identified

1. **Mixed Authentication Concerns**: `payload-api.ts` uses a single `PayloadConfig` interface with optional `apiKey`, making it unclear when authentication is needed
2. **Inconsistent Patterns**: Preview route uses direct `fetch()` with `getAuthHeaders()`, while public routes use `fetchPayloadData()` helper
3. **Unnecessary API Key Usage**: Public frontend pages include API key in requests when Payload's access control already handles public reads
4. **Tight Coupling**: Configuration logic scattered across `payload-api.ts` and `payload-config.ts`
5. **Environment Variable Duplication**: Both `PAYLOAD_API_KEY` and runtime environment handling exist

### Current Architecture

```
Public Routes ([...slug].astro)
  └─> fetchPayloadData() with API key
      └─> Payload API (public access control ignored)

Preview Routes ([id].astro)
  └─> Direct fetch() with getAuthHeaders()
      └─> Cookie forwarding OR API key
      └─> Payload API (authenticated for drafts)
```

## Proposed Architecture

### Core Principles

1. **Separation of Concerns**: Distinct clients for public vs authenticated contexts
2. **Leverage Payload Access Control**: Trust Payload's built-in access control for public data
3. **Explicit Authentication**: Only authenticate when fetching protected resources (drafts, unpublished)
4. **Single Source of Truth**: Centralized configuration management
5. **Type Safety**: Maintain strong TypeScript types throughout

### New Structure

```
src/lib/
├── payload/
│   ├── client.ts           # Base fetch utilities
│   ├── public-client.ts    # Unauthenticated public API client
│   ├── preview-client.ts   # Authenticated preview client
│   └── types.ts            # Shared types and interfaces
```

### Implementation Plan

#### 1. Base Client (`client.ts`)

**Purpose**: Core fetch logic without authentication assumptions

```typescript
interface FetchOptions {
  endpoint: string;
  payloadUrl: string;
  headers?: Record<string, string>;
  cache?: RequestCache;
}

async function fetchFromPayload<T>(options: FetchOptions): Promise<T | null>;
```

**Features**:

- Generic fetch wrapper
- Error handling and logging
- Response validation
- No authentication logic

#### 2. Public Client (`public-client.ts`)

**Purpose**: Fetch public data without authentication

```typescript
interface PublicClientConfig {
  payloadUrl: string;
}

class PayloadPublicClient {
  // Collection queries
  async getPages(where?: Record<string, any>): Promise<Page[]>;
  async getPageBySlug(slug: string): Promise<Page | null>;
  async getPublishedPages(): Promise<Page[]>;

  // Global queries
  async getSiteSettings(): Promise<SiteSettings>;
}
```

**Key Points**:

- No API key required
- Relies on Payload's `access.read` rules (already configured for public published content)
- Automatically filters for published content
- Used in static generation and public SSR routes

#### 3. Preview Client (`preview-client.ts`)

**Purpose**: Authenticated requests for draft/preview content

```typescript
interface PreviewClientConfig {
  payloadUrl: string;
  auth: {
    type: "cookie" | "api-key";
    value: string;
  };
}

class PayloadPreviewClient {
  async getPageDraft(id: string): Promise<Page | null>;
  async getPageBySlugDraft(slug: string): Promise<Page | null>;
}
```

**Key Points**:

- Requires authentication (cookie or API key)
- Includes `draft=true` parameter
- Used only in preview routes
- Handles both cookie forwarding (local dev) and API key (Cloudflare Workers)

#### 4. Configuration Helper

**Purpose**: Environment-aware client instantiation

```typescript
// For public routes (build-time or runtime)
export function createPublicClient(astro?: AstroGlobal): PayloadPublicClient;

// For preview routes (runtime only)
export function createPreviewClient(astro: AstroGlobal): PayloadPreviewClient;
```

**Logic**:

- Detects Cloudflare Workers environment
- Chooses cookie vs API key authentication
- Provides sensible defaults for local development

### Migration Path

#### Phase 1: Create New Clients (No Breaking Changes)

1. Create `src/lib/payload/` directory structure
2. Implement base `client.ts` with core fetch logic
3. Implement `public-client.ts` for unauthenticated requests
4. Implement `preview-client.ts` for authenticated requests
5. Add factory functions for client creation

#### Phase 2: Update Routes

1. **Public Routes** (`[...slug].astro`):
   - Replace `PayloadConfig` with `createPublicClient()`
   - Remove API key from environment variables (keep for preview only)
   - Update `getStaticPaths()` to use public client

2. **Preview Routes** (`preview/pages/[id].astro`):
   - Replace direct fetch with `createPreviewClient()`
   - Simplify authentication logic (handled by client)
   - Remove manual header construction

#### Phase 3: Deprecate Old Files

1. Mark `payload-api.ts` as deprecated
2. Remove `payload-config.ts` (logic moved to client factories)
3. Update documentation

### Benefits

1. **Clarity**: Explicit separation between public and authenticated contexts
2. **Security**: API key only used when actually needed (preview routes)
3. **Performance**: Fewer headers, simpler requests for public data
4. **Maintainability**: Single responsibility per client
5. **Flexibility**: Easy to add new collections or authentication methods
6. **Type Safety**: Better TypeScript inference with specific client types

### Environment Variables

**Build Time** (`.env`):

```bash
PAYLOAD_URL=https://cms.example.com
# No API key needed for public builds
```

**Runtime** (Cloudflare Workers):

```bash
PAYLOAD_URL=https://cms.example.com
PAYLOAD_API_KEY=xxx  # Only for preview routes
```

### Example Usage

**Public Route** (Static Generation):

```typescript
const client = createPublicClient();
const pages = await client.getPublishedPages();
```

**Public Route** (SSR with Astro context):

```typescript
const client = createPublicClient(Astro);
const page = await client.getPageBySlug(slug);
```

**Preview Route** (Authenticated):

```typescript
const client = createPreviewClient(Astro);
const draft = await client.getPageDraft(id);
```

### Testing Strategy

1. **Unit Tests**: Test each client independently with mocked fetch
2. **Integration Tests**: Verify against actual Payload instance
3. **E2E Tests**: Test preview flow with authentication
4. **Access Control Tests**: Verify public client cannot access drafts

### Rollout Considerations

- **Backward Compatibility**: Keep old `payload-api.ts` until all routes migrated
- **Documentation**: Update README with new patterns
- **Type Generation**: Ensure `payload-types.ts` is current
- **Environment Setup**: Document new environment variable requirements

## Confirmed Requirements

Based on your feedback:

1. **Collections**: Only `pages` collection currently (extensible for future collections)
2. **Globals**: `SiteSettings` will be accessible via public client
3. **Media**: Already has public read access (`read: () => true`), will use direct URLs
4. **Error Handling**: Include detailed error information for debugging purposes
5. **Depth Parameter**: Configurable per query with sensible defaults (depth: 2)

## Implementation Details

### Error Handling Strategy

All client methods will return a result object with error details:

```typescript
type PayloadResult<T> = { success: true; data: T } | { success: false; error: PayloadError };

interface PayloadError {
  message: string;
  status?: number;
  endpoint?: string;
  details?: unknown;
}
```

This allows you to:

- Log errors for debugging
- Display user-friendly messages
- Retry failed requests
- Track API issues

### Depth Configuration

```typescript
// Use default depth (2)
await client.getPageBySlug("about");

// Override depth for specific queries
await client.getPageBySlug("about", { depth: 3 });

// Minimal depth for performance
await client.getPublishedPages({ depth: 0 });
```

## Next Steps

Once you approve this plan, I will:

1. Create the new client architecture in `src/lib/payload/`
2. Migrate the `[...slug].astro` route to use the public client
3. Migrate the preview route to use the preview client
4. Update type definitions and ensure type safety
5. Test both public and preview flows
6. Document the new patterns
