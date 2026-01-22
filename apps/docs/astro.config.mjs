// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import mdx from "@astrojs/mdx";

// https://astro.build/config
export default defineConfig({
  server: {
    port: 1234,
  },
  integrations: [
    starlight({
      title: "Viewing Studio Boilerplate Docs",
      customCss: ["@viewingstudio/ui/css/tokens"],
      // social: [{ icon: "github", label: "GitHub", href: "https://github.com/withastro/starlight" }],
      sidebar: [
        {
          label: "Foundation",
          autogenerate: { directory: "01-foundation" },
        },
        {
          label: "Components",
          autogenerate: { directory: "02-components" },
        },
        {
          label: "Guides",
          items: [
            // Each item here is one entry in the navigation menu.
            { label: "Example Guide", slug: "guides/example" },
          ],
        },
        // {
        //   label: "Reference",
        //   autogenerate: { directory: "reference" },
        // },
      ],
    }),
    mdx(),
  ],
});
