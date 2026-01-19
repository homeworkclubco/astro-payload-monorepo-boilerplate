import { fetchFromPayload } from "./client";
import type { PayloadResult, PayloadPaginatedResponse } from "./types";

export interface PreviewAuthConfig {
  type: "cookie" | "api-key";
  value: string;
}

export class PayloadPreviewClient {
  private baseUrl: string;
  private auth: PreviewAuthConfig;

  constructor(payloadUrl: string, auth: PreviewAuthConfig) {
    this.baseUrl = payloadUrl;
    this.auth = auth;
  }

  /**
   * Helper to construct auth headers dynamically
   */
  private getAuthHeaders(): Record<string, string> {
    if (this.auth.type === "api-key") {
      return { Authorization: `users API-Key ${this.auth.value}` };
    }
    // For cookies, we pass them through so Payload recognizes the logged-in admin
    return { Cookie: `${this.auth.value}` };
  }

  /**
   * GENERIC HELPER (Authenticated)
   */
  async findCollection<T>(
    collectionSlug: string,
    query?: Record<string, any>,
  ): Promise<PayloadResult<PayloadPaginatedResponse<T>>> {
    const searchParams = new URLSearchParams();
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        searchParams.append(key, String(value));
      });
    }
    // Always request drafts in preview mode
    searchParams.append("draft", "true");

    const queryString = searchParams.toString();
    const endpoint = `/api/${collectionSlug}${queryString ? `?${queryString}` : ""}`;

    return fetchFromPayload<PayloadPaginatedResponse<T>>(this.baseUrl, {
      endpoint,
      headers: this.getAuthHeaders(),
      cache: "no-store", // Never cache previews
    });
  }

  /**
   * GET PAGE DRAFT BY ID
   * Previews usually work by ID because the slug might be changing/unpublished
   */
  async getPageById(id: string, options?: { depth?: number }): Promise<PayloadResult<any>> {
    const depth = options?.depth ?? 1;

    return fetchFromPayload<any>(this.baseUrl, {
      endpoint: `/api/pages/${id}?draft=true&depth=${depth}`,
      headers: this.getAuthHeaders(),
      cache: "no-store",
    });
  }

  /**
   * GENERIC HELPER Fetch a Global (Singleton)(Authenticated)
   */
  async findGlobal<T>(globalSlug: string, options?: { depth?: number }): Promise<PayloadResult<T>> {
    const depth = options?.depth ?? 1;
    const searchParams = new URLSearchParams({
      depth: String(depth),
      draft: "true", // Allow seeing draft changes to settings
    });

    return fetchFromPayload<T>(this.baseUrl, {
      endpoint: `/api/globals/${globalSlug}?${searchParams.toString()}`,
      headers: this.getAuthHeaders(),
      cache: "no-store",
    });
  }
}
