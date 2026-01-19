// src/lib/payload/index.ts
import type { AstroGlobal } from "astro";
import { PayloadPublicClient } from "./public-client";
import { PayloadPreviewClient } from "./preview-client";

// 1. Define Env Interface for Type Safety
// (Adjust based on whether you use import.meta.env or process.env)
const getPayloadUrl = () => import.meta.env.PAYLOAD_URL || "http://localhost:3000";

/**
 * Creates a Public Client (No Auth)
 * Usage: const payload = createPublicClient();
 */
export function createPublicClient() {
  const url = getPayloadUrl();
  return new PayloadPublicClient(url);
}

/**
 * Creates a Preview Client (Authenticated)
 * Usage: const payload = createPreviewClient(Astro);
 */
export function createPreviewClient(astro: AstroGlobal) {
  const url = getPayloadUrl();
  const cookies = astro.request.headers.get("cookie");
  const secretKey = import.meta.env.PAYLOAD_API_KEY;

  // STRATEGY 1: Cookie Forwarding (Preferred for local dev/CMS access)
  // If the user is logged into the CMS in the same browser, share that session.
  if (cookies && cookies.includes("payload-token")) {
    return new PayloadPreviewClient(url, {
      type: "cookie",
      value: cookies,
    });
  }

  // STRATEGY 2: API Key (Preferred for Cloudflare/Server-to-Server)
  // If no cookie, fall back to the system API key.
  if (secretKey) {
    return new PayloadPreviewClient(url, {
      type: "api-key",
      value: secretKey,
    });
  }

  throw new Error("PreviewClient: No valid authentication method found (Cookie or API Key).");
}

// Re-export types for easy access in components
export * from "./types";
