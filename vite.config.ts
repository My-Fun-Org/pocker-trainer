import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

// On GitHub Pages the app is served from https://<org>.github.io/<repo>/, so the
// production build needs a base path. Override with VITE_BASE if the repo name
// changes. Local dev stays at "/".
const REPO_BASE = process.env.VITE_BASE ?? "/pocker-trainer/";

export default defineConfig(({ command }) => ({
  base: command === "build" ? REPO_BASE : "/",
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
}));
