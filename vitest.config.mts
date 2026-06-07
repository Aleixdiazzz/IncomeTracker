// vitest.config.mts
// Owner: Tests
// Purpose: Vitest is the official Next 16 test runner. We use `vite-tsconfig-paths`
// so `@/...` aliases work the same as in app code, and jsdom so component tests
// can render React.
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: false,
    include: ["__tests__/**/*.{test,spec}.{ts,tsx}"],
  },
});
