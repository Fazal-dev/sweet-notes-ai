// Lovable vite-tanstack-config includes: tanstackStart, viteReact, tailwindcss,
// tsConfigPaths, componentTagger (dev-only), VITE_* env injection, @ path alias,
// React/TanStack dedupe, error logger plugins, and sandbox detection.
// Cloudflare is disabled — this project deploys to Vercel.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  cloudflare: false,
  tanstackStart: {
    server: {
      preset: "vercel",
    },
  },
});
