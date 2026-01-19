# Using Payload Types in Astro

This guide shows the best and easiest ways to use Payload CMS types in your Astro application.

## Setup Overview

Your monorepo structure:

```
apps/
├── cms/          # Payload CMS app
└── astro/        # Astro frontend
```

## Option 1: Direct Import (Recommended)

### 1. Create a Types Bridge File

Create `src/types/payload.ts` in your Astro app:

```typescript
// Re-export Payload types from the CMS app
export type {
  Config,
  Page,
  Media,
  User,
  SupportedTimezones,
  UserAuthOperations,
  PayloadKv,
  PayloadLockedDocument,
  PayloadPreference,
  PayloadMigration,
} from "../../../cms/src/payload-types";

// Export commonly used type combinations
export type PageData = Page & {
  // Add any computed fields here
};

export type APIResponse<T = any> = {
  docs: T[];
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};
```

### 2. Use Types in Astro Pages

```astro
---
import Layout from "src/layouts/Layout.astro";
import type { Page, APIResponse } from "src/types/payload";

// Now you have proper typing!
let page: Page | null = null;
let pages: APIResponse<Page> | null = null;

// Fetch data with proper typing
const response = await fetch(`${PAYLOAD_URL}/api/pages/${id}?depth=2`);
if (response.ok) {
  page = await response.json(); // Type-safe!
}
---

<Layout>
  {page && (
    <article>
      <h1>{page.title}</h1>
      <div>{page.body?.root?.children?.map(child => child.text).join('')}</div>
    </article>
  )}
</Layout>
```

## Option 2: API Helper Functions

Create `src/lib/payload-api.ts`:

```typescript
import type { Page, APIResponse } from "src/types/payload";

export interface PayloadConfig {
  url: string;
  apiKey?: string;
}

export async function fetchPayloadData<T>(
  endpoint: string,
  config: PayloadConfig,
  options: RequestInit = {},
): Promise<T | null> {
  // Implementation with error handling
}

// Specific helpers
export async function getPage(id: string, config: PayloadConfig): Promise<Page | null> {
  return fetchPayloadData<Page>(`pages/${id}?depth=2`, config);
}

export async function getPages(config: PayloadConfig): Promise<APIResponse<Page> | null> {
  return fetchPayloadData<APIResponse<Page>>(`pages?depth=2`, config);
}
```

### Usage in Astro:

```astro
---
import { getPage } from "src/lib/payload-api";
import type { Page } from "src/types/payload";

const config = {
  url: "http://localhost:3000",
  apiKey: import.meta.env.PAYLOAD_API_KEY
};

const page = await getPage(Astro.params.id!, config);
---

<Layout>
  {page && <h1>{page.title}</h1>}
</Layout>
```

## Option 3: Type-Only Imports (For Complex Projects)

If you want to avoid runtime imports:

```typescript
// src/types/payload.d.ts
import type { Config, Page, Media, User } from "../../../cms/src/payload-types";

declare global {
  namespace Astro {
    interface Locals {
      payloadConfig: {
        url: string;
        apiKey?: string;
      };
    }
  }
}

export {};
```

## Best Practices

### 1. Type Safety First

✅ **Good:**

```typescript
let page: Page | null = null;
```

❌ **Avoid:**

```typescript
let page: any = null;
```

### 2. Handle Nulls Properly

✅ **Good:**

```typescript
console.log("Page title:", page?.title);
const { title, body } = page || {};
```

❌ **Avoid:**

```typescript
console.log("Page title:", page.title); // Runtime error if null
```

### 3. Use Helper Functions

Create reusable helpers for common operations:

```typescript
// src/lib/payload-helpers.ts
export function renderPageBody(page: Page): string {
  if (!page.body?.root?.children) return "";

  return page.body.root.children.map((child) => child.text || "").join("");
}

export function getPageUrl(page: Page): string {
  return `/pages/${page.slug}`;
}
```

### 4. Environment Configuration

Create a typed config object:

```typescript
// src/config/payload.ts
export interface PayloadConfig {
  url: string;
  apiKey?: string;
  isDev: boolean;
}

export const payloadConfig: PayloadConfig = {
  url: import.meta.env.PUBLIC_PAYLOAD_URL || "http://localhost:3000",
  apiKey: import.meta.env.PAYLOAD_API_KEY,
  isDev: import.meta.env.DEV,
};
```

## Advanced Patterns

### 1. Generic API Wrapper

```typescript
export class PayloadAPI {
  constructor(private config: PayloadConfig) {}

  async find<T>(
    collection: string,
    options: {
      where?: Record<string, any>;
      limit?: number;
      page?: number;
      depth?: number;
    } = {},
  ): Promise<APIResponse<T> | null> {
    const params = new URLSearchParams();

    if (options.where) params.set("where", JSON.stringify(options.where));
    if (options.limit) params.set("limit", options.limit.toString());
    if (options.depth) params.set("depth", options.depth.toString());

    return fetchPayloadData<APIResponse<T>>(`${collection}?${params}`, this.config);
  }

  async findByID<T>(collection: string, id: string): Promise<T | null> {
    return fetchPayloadData<T>(`${collection}/${id}`, this.config);
  }
}
```

### 2. Content Type Guards

```typescript
export function isPage(data: unknown): data is Page {
  return (
    typeof data === "object" && data !== null && "id" in data && "title" in data && "slug" in data
  );
}

export function isMedia(data: unknown): data is Media {
  return (
    typeof data === "object" && data !== null && "id" in data && "url" in data && "filename" in data
  );
}
```

## TypeScript Configuration

Update your `tsconfig.json` to include path mapping:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/types/*": ["src/types/*"],
      "@/lib/*": ["src/lib/*"]
    }
  }
}
```

## Auto-Generation Workflow

1. **After changing Payload collections:**

   ```bash
   cd apps/cms
   pnpm payload generate:types
   ```

2. **The types are automatically available** in your Astro app via the import bridge

3. **Optional:** Add a script to package.json:
   ```json
   {
     "scripts": {
       "types": "cd apps/cms && pnpm payload generate:types"
     }
   }
   ```

## Common Issues & Solutions

### Issue: "Cannot find module" errors

**Solution:** Ensure the relative path is correct in your type imports:

```typescript
// From apps/astro/src/types/payload.ts
export type { Page } from "../../../cms/src/payload-types";
```

### Issue: GeneratedTypes not exported

**Solution:** `GeneratedTypes` is declared in a module augmentation. Import individual types instead:

```typescript
export type { Config, Page, Media, User } from "../../../cms/src/payload-types";
```

### Issue: Runtime vs Type-only imports

**Solution:** Use `type` keyword for type-only imports:

```typescript
import type { Page } from "src/types/payload"; // Type-only
import { getPage } from "src/lib/payload-api"; // Runtime
```

## Summary

The **easiest and best approach** is:

1. ✅ Create `src/types/payload.ts` to re-export types
2. ✅ Use `import type { Page } from "src/types/payload"` in Astro files
3. ✅ Create helper functions in `src/lib/payload-api.ts`
4. ✅ Handle nulls properly with optional chaining
5. ✅ Run `payload generate:types` after schema changes

This gives you full type safety while keeping your code clean and maintainable.
