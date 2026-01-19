import type { FetchOptions, PayloadResult } from "./types";

/**
 * Base fetcher that handles the raw network request, error catching,
 * and JSON parsing. It is agnostic of authentication.
 */
export async function fetchFromPayload<T>(
  baseUrl: string,
  options: FetchOptions,
): Promise<PayloadResult<T>> {
  const { endpoint, headers = {}, cache = "default" } = options;

  // 1. Construct URL (handling double slashes safely)
  const cleanBaseUrl = baseUrl.replace(/\/$/, "");
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${cleanBaseUrl}${cleanEndpoint}`;

  try {
    // 2. Perform Request
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      cache,
    });

    // 3. Handle Non-200 Responses
    if (!response.ok) {
      let errorDetails: unknown;
      try {
        errorDetails = await response.json();
      } catch {
        errorDetails = await response.text();
      }

      return {
        success: false,
        error: {
          message: `Payload API Error: ${response.status} ${response.statusText}`,
          status: response.status,
          endpoint,
          details: errorDetails,
        },
      };
    }

    // 4. Parse Success Response
    const data = await response.json();
    return {
      success: true,
      data: data as T,
    };
  } catch (err) {
    // 5. Handle Network/Parsing Errors
    const message = err instanceof Error ? err.message : "Unknown network error";
    return {
      success: false,
      error: {
        message,
        endpoint,
        details: err,
      },
    };
  }
}
