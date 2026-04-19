import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";

export default defineConfig(({ command }) => ({
  base: command === "build" ? "/unicorn/" : "/",
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
}));
