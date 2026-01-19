// @ts-check
import { defineConfig } from 'astro/config';

import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
      persist: {
        path: '../../.wrangler/state/v3' // Point to a shared folder in your monorepo root
      }
    },

    imageService: "cloudflare"
  })
});