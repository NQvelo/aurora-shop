import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const pkg = require("./package.json");

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Only load lovable-tagger in dev (never in CI/production build)
  const devOnlyPlugins =
    mode === "development"
      ? [require("lovable-tagger").componentTagger()]
      : [];

  // GitHub Pages base: CI sets PUBLIC_PATH; else use homepage path for production
  const baseFromHomepage =
    pkg.homepage && typeof pkg.homepage === "string"
      ? new URL(pkg.homepage).pathname
      : "/";
  const base =
    process.env.PUBLIC_PATH ||
    (mode === "production" ? baseFromHomepage : "/");

  return {
    base,

    server: {
      host: "::",
      port: 8080,
      hmr: {
        overlay: false,
      },
    },
    plugins: [react(), ...devOnlyPlugins],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ["react", "react-dom", "react-router-dom", "@supabase/supabase-js"],
            ui: ["@radix-ui/react-accordion", "@radix-ui/react-alert-dialog", "@radix-ui/react-avatar", "@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu"],
          },
        },
      },
    },
  };
});
