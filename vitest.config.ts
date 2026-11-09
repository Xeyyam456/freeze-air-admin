import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vitest/config";

// Saf util-lərin unit testləri (React/Tailwind plaginləri lazım deyil). Alias vite.config.ts ilə eyni
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
    // Testlər kompüterin saat qurşağından asılı olmasın: ustaların cihazı kimi Bakı
    env: { TZ: "Asia/Baku" },
  },
});
