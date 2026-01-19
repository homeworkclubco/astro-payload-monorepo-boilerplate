import type { Page, APIResponse } from "src/types/payload";

export interface PayloadConfig {
  url: string;
  apiKey?: string;
}

// Helper function to fetch typed data from Payload
export async function fetchPayloadData<T>(
  endpoint: string,
  config: PayloadConfig,
  options: RequestInit = {},
): Promise<T | null> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (config.apiKey) {
      headers.Authorization = `users API-Key ${config.apiKey}`;
    }

    const response = await fetch(`${config.url}/api/${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      console.error(`Payload API error: ${response.status} ${response.statusText}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to fetch from Payload:", error);
    return null;
  }
}

// Specific helpers for common operations
export async function getPage(
  id: string,
  config: PayloadConfig,
  draft = false,
): Promise<Page | null> {
  const query = new URLSearchParams({
    depth: "2",
    ...(draft && { draft: "true" }),
  });

  return fetchPayloadData<Page>(`pages/${id}?${query}`, config);
}

export async function getPages(
  config: PayloadConfig,
  where: Record<string, any> = {},
): Promise<APIResponse<Page> | null> {
  const query = new URLSearchParams({
    depth: "2",
    where: JSON.stringify(where),
  });

  return fetchPayloadData<APIResponse<Page>>(`pages?${query}`, config);
}
