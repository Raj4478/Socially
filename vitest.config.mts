import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: { alias: { "@": path.resolve(import.meta.dirname, "src") } },
  // Unit tests don't touch CSS; skip the app's Tailwind PostCSS setup.
  css: { postcss: { plugins: [] } },
  test: { environment: "node", include: ["src/**/*.test.ts"] },
});
