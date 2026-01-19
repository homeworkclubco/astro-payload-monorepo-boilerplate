import type { AstroGlobal } from "astro";

export interface PayloadEnv {
  payloadUrl: string;
  apiKey?: string;
  isWorkersDomain: boolean;
}

/**
 * Get Payload environment from runtime context.
 * Priority: Cloudflare runtime env → Build time env → Localhost fallback
 */
export function getPayloadEnv(Astro: AstroGlobal): PayloadEnv {
  const runtimeEnv = (Astro.locals as any).runtime?.env;

  const payloadUrl =
    runtimeEnv?.PAYLOAD_URL ||
    import.meta.env.PAYLOAD_URL ||
    "http://localhost:3000";

  const apiKey =
    runtimeEnv?.PAYLOAD_API_KEY || import.meta.env.PAYLOAD_API_KEY;

  const isWorkersDomain =
    Astro.url.hostname.includes(".workers.dev") ||
    Astro.url.hostname.includes("pages.dev");

  return { payloadUrl, apiKey, isWorkersDomain };
}

/**
 * Build auth headers based on environment.
 * Workers domains use API key auth, others use cookie forwarding.
 */
export function getAuthHeaders(
  env: PayloadEnv,
  cookieHeader?: string | null,
): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (env.isWorkersDomain && env.apiKey) {
    headers.Authorization = `users API-Key ${env.apiKey}`;
  } else if (cookieHeader) {
    headers.Cookie = cookieHeader;
  }

  return headers;
}
