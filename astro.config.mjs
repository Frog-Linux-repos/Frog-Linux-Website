// @ts-check
import { defineConfig, fontProviders } from "astro/config";

import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  site: "https://frog-linux.com/",
  redirects: {
    "/source": "https://github.com/Frog-Linux-repos/Frog-Linux-Website",
  },
  adapter: cloudflare(),
  fonts: [
    {
      provider: fontProviders.google(),
      name: "Delicious Handrawn",
      cssVariable: "--font-heading",
    },
    {
      provider: fontProviders.google(),
      name: "Rubik",
      cssVariable: "--font-default",
    },
  ],
});
