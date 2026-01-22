// @ts-check
import { defineConfig } from "astro/config";

import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  prefetch: true,
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
      persist: {
        path: "../../.wrangler/state/v3", // Point to a shared folder in your monorepo root
      },
    },

    imageService: "cloudflare",
  }),
  vite: {
    server: {
      watch: {
        // Tells Vite to watch the shared package for changes
        ignored: ["!**/packages/ui/**"],
      },
    },
  },
});
