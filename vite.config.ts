import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from "vite-plugin-pwa";
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

  /**
   * ✅ Custom domain (aurora.com.ge) fix:
   * Always use "/" as base in production so assets load from:
   * https://aurora.com.ge/assets/...
   * and NOT from /<repo>/assets/...
   */
  const base = "/";

  return {
    base,

    server: {
      host: "::",
      port: 8080,
      hmr: {
        overlay: false,
      },
    },

    plugins: [
      react(),
      ...devOnlyPlugins,
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: ["apple-touch-icon.png", "robots.txt"],
        manifest: {
          name: "Aurora by Tekla",
          short_name: "Aurora",
          description: "Aurora by Tekla",
          theme_color: "#FCF8F9",
          background_color: "#000000",
          display: "standalone",
          orientation: "any",
          scope: "/",
          start_url: "/",
          id: "/",
          lang: "en",
          categories: ["shopping"],
          icons: [
            {
              src: "pwa-192x192.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "any",
            },
            {
              src: "pwa-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any",
            },
            {
              src: "pwa-192x192-maskable.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "maskable",
            },
            {
              src: "pwa-512x512-maskable.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable",
            },
          ],
        },
        workbox: {
          globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2,ttf,webmanifest}"],
          navigateFallback: "index.html",
          navigateFallbackDenylist: [/^\/api\//],
          cleanupOutdatedCaches: true,
          clientsClaim: true,
          skipWaiting: true,
        },
      }),
    ],

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },

    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: [
              "react",
              "react-dom",
              "react-router-dom",
              "@supabase/supabase-js",
            ],
            ui: [
              "@radix-ui/react-accordion",
              "@radix-ui/react-alert-dialog",
              "@radix-ui/react-avatar",
              "@radix-ui/react-dialog",
              "@radix-ui/react-dropdown-menu",
            ],
          },
        },
      },
    },
  };
});
