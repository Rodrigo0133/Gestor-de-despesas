import { defineConfig } from "vitest/config";

// Os testes da API executam em Node, sem carregar os plugins do frontend.
export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
});
